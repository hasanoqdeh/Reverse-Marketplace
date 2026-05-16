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
 * GET /admin/auth/me
 * Returns the authenticated admin's profile and computed permissions.
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

/**
 * PATCH /admin/auth/me
 * Update the authenticated admin's own profile fields.
 */
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
 * GET /admin/auth/sessions
 * Lists the authenticated admin's active sessions.
 */
router.get('/sessions', asyncHandler(async (req, res) => {
  const count = await TokenRepository.countActiveRefreshTokens(req.user.id);

  return res.status(200).json({
    success: true,
    activeSessions: count,
  });
}));

/**
 * DELETE /admin/auth/sessions
 * Revokes all of the admin's tokens and sessions (full logout from all devices).
 * The current request will succeed; subsequent requests with old tokens will fail.
 */
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
