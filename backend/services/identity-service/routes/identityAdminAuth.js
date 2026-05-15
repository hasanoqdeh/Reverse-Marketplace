'use strict';

const express = require('express');
const router = express.Router();
const UserRepository = require('../repositories/UserRepository');
const TokenRepository = require('../repositories/TokenRepository');
const AdminRepository = require('../repositories/AdminRepository');
const { authenticate } = require('../../../shared/middleware/authenticate');
const { requireRole } = require('../../../shared/middleware/authorize');
const { getRateLimitMiddleware } = require('../../../shared/middleware/rateLimiting');

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
