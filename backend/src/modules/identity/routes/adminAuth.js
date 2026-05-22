'use strict';

const express = require('express');
const router = express.Router();
const UserRepository = require('../repositories/UserRepository');
const TokenRepository = require('../repositories/TokenRepository');
const AdminRepository = require('../repositories/AdminRepository');
const { authenticate } = require('../../../middleware/authenticate');
const { requireRole } = require('../../../middleware/authorize');
const { getRateLimitMiddleware } = require('../../../middleware/rateLimiting');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// All /admin/auth routes require a valid ADMIN JWT
router.use(authenticate);
router.use(requireRole('ADMIN'));
router.use(getRateLimitMiddleware('admin'));

/**
 * @swagger
 * /api/v1/identity/admin/auth/me:
 *   get:
 *     tags: [Admin Auth]
 *     summary: Get own admin profile and permissions
 *     description: |
 *       Returns the authenticated admin's user record, profile, and effective
 *       permissions derived from their `adminSubRole`.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `User` JOIN `UserProfile`: `SELECT WHERE id = req.user.id`.
 *
 *       **Events published**: none.
 *     responses:
 *       '200':
 *         description: Admin profile and permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 admin:
 *                   $ref: '#/components/schemas/User'
 *                 permissions:
 *                   type: object
 *                   properties:
 *                     viewUsers:    { type: boolean }
 *                     editUsers:    { type: boolean }
 *                     suspendUsers: { type: boolean }
 *                     banUsers:     { type: boolean }
 *                     manageAdmins: { type: boolean }
 *                     exportData:   { type: boolean }
 *                     systemConfig: { type: boolean }
 *       '401':
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *   patch:
 *     tags: [Admin Auth]
 *     summary: Update own admin profile
 *     description: |
 *       Updates the calling admin's profile fields (firstName, lastName, city, country).
 *       Logs the action to the MongoDB activity log.
 *
 *       **DB effects**
 *       - PostgreSQL `UserProfile`: `UPSERT`.
 *       - MongoDB `ActivityLog`: `INSERT` with `actionType = USER_EDIT`.
 *
 *       **Events published**: none.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName:  { type: string }
 *               city:      { type: string }
 *               country:   { type: string }
 *     responses:
 *       '200':
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 admin: { $ref: '#/components/schemas/User' }
 *       '400':
 *         description: No fields provided
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/me', asyncHandler(async (req, res) => {
  const user = await UserRepository.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Admin account not found.', error: 'NOT_FOUND' });
  }

  const permissions = _getAdminPermissions(user.admin_sub_role);

  return res.status(200).json({
    success: true,
    admin: {
      id: user.id,
      phone: user.phone,
      role: user.role,
      adminSubRole: user.admin_sub_role,
      status: user.status,
      lastLoginAt: user.last_login_at || null,
      profile: user.first_name
        ? { firstName: user.first_name, lastName: user.last_name }
        : null,
    },
    permissions,
  });
}));

router.patch('/me', asyncHandler(async (req, res) => {
  const { firstName, lastName, city, country } = req.body;

  const data = {};
  if (firstName !== undefined) data.first_name = String(firstName).trim();
  if (lastName  !== undefined) data.last_name  = String(lastName).trim();
  if (city      !== undefined) data.city        = city ? String(city).trim() : null;
  if (country   !== undefined) data.country     = country ? String(country).trim() : null;

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ success: false, message: 'No fields provided to update.', error: 'NO_FIELDS' });
  }

  await UserRepository.updateProfile(req.user.id, data);

  const updated = await UserRepository.findById(req.user.id);

  await AdminRepository.logAction({
    adminId: req.user.id,
    actionType: 'USER_EDIT',
    targetType: 'ADMIN_PROFILE',
    targetId: req.user.id,
    actionDetails: { updatedFields: Object.keys(data) },
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    success: true,
  }).catch(() => {});

  return res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    admin: {
      id: updated.id,
      phone: updated.phone,
      role: updated.role,
      adminSubRole: updated.admin_sub_role,
      status: updated.status,
      profile: {
        firstName: updated.first_name,
        lastName: updated.last_name,
        city: updated.city,
        country: updated.country,
      },
    },
  });
}));

/**
 * @swagger
 * /api/v1/identity/admin/auth/sessions:
 *   get:
 *     tags: [Admin Auth]
 *     summary: List own active sessions
 *     description: |
 *       Returns a count of all non-revoked `AuthToken` rows for the calling admin.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `AuthToken`: `COUNT WHERE userId = ? AND revokedAt IS NULL`.
 *
 *       **Events published**: none.
 *     responses:
 *       '200':
 *         description: Active session count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activeSessions: { type: integer }
 *   delete:
 *     tags: [Admin Auth]
 *     summary: Revoke all own sessions (full logout from all devices)
 *     description: |
 *       Revokes every active refresh token for the calling admin. All other devices
 *       will be logged out on their next token use. Logs the action to the activity log.
 *
 *       **DB effects**
 *       - PostgreSQL `AuthToken`: `UPDATE revokedAt = NOW() WHERE userId = ? AND revokedAt IS NULL`.
 *       - MongoDB `ActivityLog`: `INSERT` with `actionType = SESSION_TERMINATE`.
 *
 *       **Events published**: none.
 *     responses:
 *       '200':
 *         description: All sessions revoked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 */
router.get('/sessions', asyncHandler(async (req, res) => {
  const count = await TokenRepository.countActiveRefreshTokens(req.user.id);

  return res.status(200).json({
    success: true,
    activeSessions: count,
  });
}));

router.delete('/sessions', asyncHandler(async (req, res) => {
  await TokenRepository.revokeAllUserTokens(req.user.id);
  await TokenRepository.deactivateAllUserSessions(req.user.id);

  await AdminRepository.logAction({
    adminId: req.user.id,
    actionType: 'SESSION_TERMINATE',
    targetType: 'ADMIN_SESSION',
    actionDetails: { action: 'TERMINATE_ALL_SESSIONS' },
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    success: true,
  }).catch(() => {});

  return res.status(200).json({
    success: true,
    message: 'All sessions terminated. You have been logged out from all devices.',
  });
}));

// ─── Helpers ───────────────────────────────────────────────────────────────

function _getAdminPermissions(subRole) {
  const base = { viewUsers: true, editUsers: true, viewLogs: true };

  if (subRole === 'SUPER_ADMIN') {
    return { ...base, suspendUsers: true, banUsers: true, manageAdmins: true, exportData: true, systemConfig: true };
  }
  if (subRole === 'ADMIN') {
    return { ...base, suspendUsers: true, banUsers: true, manageAdmins: false, exportData: true, systemConfig: false };
  }
  // SUPPORT
  return { ...base, suspendUsers: false, banUsers: false, manageAdmins: false, exportData: false, systemConfig: false };
}

module.exports = router;
