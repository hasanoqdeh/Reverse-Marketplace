'use strict';

const Joi = require('joi');
const UserRepository = require('../repositories/UserRepository');
const AdminRepository = require('../repositories/AdminRepository');
const TokenRepository = require('../repositories/TokenRepository');
const eventPublisher = require('../../../events/publisher');
const logger = require('../../../utils/logger');

// ─── Validation Schemas ────────────────────────────────────────────────────

const getUsersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().max(100).optional().allow(''),
  role: Joi.string().valid('BUYER', 'MERCHANT', 'ADMIN', 'ALL').default('ALL'),
  status: Joi.string().valid('PENDING', 'ACTIVE', 'BANNED', 'SUSPENDED', 'ALL').default('ALL'),
  registrationDateFrom: Joi.string().isoDate().optional(),
  registrationDateTo: Joi.string().isoDate().optional(),
  lastLoginFrom: Joi.string().isoDate().optional(),
  lastLoginTo: Joi.string().isoDate().optional(),
  sortBy: Joi.string().valid('createdAt', 'lastLoginAt', 'phone', 'name').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const suspendUserSchema = Joi.object({
  reason: Joi.string().min(5).max(500).required(),
  duration: Joi.number().integer().min(1).optional().allow(null), // hours
  notifyUser: Joi.boolean().default(false),
  internalNote: Joi.string().max(1000).optional(),
});

const banUserSchema = Joi.object({
  reason: Joi.string().min(5).max(500).required(),
  permanent: Joi.boolean().required(),
  notifyUser: Joi.boolean().default(false),
  internalNote: Joi.string().max(1000).optional(),
  deleteData: Joi.boolean().default(false),
});

const updateUserSchema = Joi.object({
  role:      Joi.string().valid('BUYER', 'MERCHANT').optional(),
  firstName: Joi.string().max(100).optional(),
  lastName:  Joi.string().max(100).optional(),
  city:      Joi.string().max(100).optional().allow('', null),
  country:   Joi.string().max(100).optional().allow('', null),
});

const bulkActionSchema = Joi.object({
  userIds: Joi.array().items(Joi.string().uuid()).min(1).max(100).required(),
  action: Joi.string().valid('SUSPEND', 'BAN', 'DELETE', 'VERIFY', 'SEND_NOTIFICATION').required(),
  actionData: Joi.object({
    reason: Joi.string().max(500).optional(),
    duration: Joi.number().integer().min(1).optional(),
    notifyUsers: Joi.boolean().default(false),
    internalNote: Joi.string().max(1000).optional(),
    message: Joi.string().max(1000).optional(),
  }).default({}),
});

// ─── Controller ────────────────────────────────────────────────────────────

const IdentityAdminController = {
  // ────────────────────────────────────────────────────────────────
  // User Management
  // ────────────────────────────────────────────────────────────────

  /**
   * GET /admin/users
   * Paginated user list with filtering and sorting.
   */
  async getUsers(req, res) {
    const { error, value } = getUsersSchema.validate(req.query, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((d) => d.message),
      });
    }

    const { users, total, page, limit } = await UserRepository.listUsers(value);
    const totalPages = Math.ceil(total / limit);

    // Log admin action
    await AdminRepository.logAction({
      adminId: req.user.id,
      actionType: 'USER_VIEW',
      targetType: 'USER_LIST',
      actionDetails: { filters: value },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      users: users.map(_formatUserRow),
      pagination: { page, limit, total, totalPages },
      filters: {
        appliedFilters: value,
        availableFilters: _getAvailableFilters(),
      },
    });
  },

  /**
   * GET /admin/users/:userId
   * Single user detail view.
   */
  async getUserById(req, res) {
    const user = await UserRepository.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', error: 'USER_NOT_FOUND' });
    }

    await AdminRepository.logAction({
      adminId: req.user.id,
      actionType: 'USER_VIEW',
      targetType: 'USER',
      targetId: user.id,
      targetPhone: user.phone,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
    }).catch(() => {});

    return res.status(200).json({ success: true, user: _formatUserRow(user) });
  },

  /**
   * PATCH /admin/users/:userId
   * Update a user's profile info (name, city, country).
   */
  async updateUser(req, res) {
    const { error, value } = updateUserSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((d) => d.message),
      });
    }

    const user = await UserRepository.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', error: 'USER_NOT_FOUND' });
    }

    const data = {};
    if (value.firstName !== undefined) data.first_name = value.firstName;
    if (value.lastName  !== undefined) data.last_name  = value.lastName;
    if (value.city      !== undefined) data.city       = value.city || null;
    if (value.country   !== undefined) data.country    = value.country || null;

    const hasRole    = !!value.role;
    const hasProfile = Object.keys(data).length > 0;

    if (!hasRole && !hasProfile) {
      return res.status(400).json({ success: false, message: 'No fields provided to update.', error: 'NO_FIELDS' });
    }

    if (hasRole)    await UserRepository.updateRole(user.id, value.role);
    if (hasProfile) await UserRepository.updateProfile(user.id, data);

    await eventPublisher.adminActionPerformed(req.user.id, 'USER_EDIT', user.id, 'user', { updatedFields: Object.keys(data), role: value.role });

    await AdminRepository.logAction({
      adminId: req.user.id,
      actionType: 'USER_EDIT',
      targetType: 'USER',
      targetId: user.id,
      targetPhone: user.phone,
      actionDetails: { updatedFields: Object.keys(data) },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
    }).catch(() => {});

    logger.info('User profile updated by admin', { targetUserId: user.id, adminId: req.user.id });

    const updated = await UserRepository.findById(user.id);
    return res.status(200).json({ success: true, message: 'User updated successfully.', user: _formatUserRow(updated) });
  },

  /**
   * POST /admin/users/:userId/suspend
   */
  async suspendUser(req, res) {
    const { error, value } = suspendUserSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((d) => d.message),
      });
    }

    const user = await UserRepository.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', error: 'USER_NOT_FOUND' });
    }

    // Cannot suspend another admin (must be SUPER_ADMIN to do so)
    if (user.role === 'ADMIN' && req.user.adminSubRole !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only SUPER_ADMIN can suspend admin accounts.',
        error: 'INSUFFICIENT_PERMISSIONS',
      });
    }

    await UserRepository.updateStatus(user.id, 'SUSPENDED');

    // If duration specified — set locked_until as suspension expiry
    if (value.duration) {
      const lockedUntil = new Date(Date.now() + value.duration * 60 * 60 * 1000);
      await UserRepository.lockAccount(user.id, value.duration * 60);
    }

    // Revoke all active sessions
    await TokenRepository.deactivateAllUserSessions(user.id);

    // Publish event
    await eventPublisher.userUpdated(user.id, user.phone, user.role, req.user.id, value.reason);

    // Log admin action
    await AdminRepository.logAction({
      adminId: req.user.id,
      actionType: 'USER_SUSPEND',
      targetType: 'USER',
      targetId: user.id,
      targetPhone: user.phone,
      actionDetails: { reason: value.reason, duration: value.duration, internalNote: value.internalNote },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
    }).catch(() => {});

    logger.info('User suspended by admin', { targetUserId: user.id, adminId: req.user.id });

    return res.status(200).json({
      success: true,
      message: 'User suspended successfully.',
      user: { id: user.id, status: 'SUSPENDED', suspendedUntil: value.duration
        ? new Date(Date.now() + value.duration * 3600000).toISOString() : null },
    });
  },

  /**
   * POST /admin/users/:userId/ban
   */
  async banUser(req, res) {
    const { error, value } = banUserSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((d) => d.message),
      });
    }

    const user = await UserRepository.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', error: 'USER_NOT_FOUND' });
    }

    if (user.role === 'ADMIN' && req.user.adminSubRole !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only SUPER_ADMIN can ban admin accounts.',
        error: 'INSUFFICIENT_PERMISSIONS',
      });
    }

    await UserRepository.updateStatus(user.id, 'BANNED');
    await TokenRepository.deactivateAllUserSessions(user.id);
    await eventPublisher.userUpdated(user.id, user.phone, user.role, req.user.id, value.reason);

    await AdminRepository.logAction({
      adminId: req.user.id,
      actionType: 'USER_BAN',
      targetType: 'USER',
      targetId: user.id,
      targetPhone: user.phone,
      actionDetails: { reason: value.reason, permanent: value.permanent, internalNote: value.internalNote },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
    }).catch(() => {});

    logger.info('User banned by admin', { targetUserId: user.id, adminId: req.user.id });

    return res.status(200).json({
      success: true,
      message: 'User banned successfully.',
      user: { id: user.id, status: 'BANNED', bannedAt: new Date().toISOString() },
    });
  },

  /**
   * POST /admin/users/:userId/activate
   * Reactivate a suspended/banned user.
   */
  async activateUser(req, res) {
    const user = await UserRepository.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await UserRepository.updateStatus(user.id, 'ACTIVE');
    await UserRepository.unlockAccount(user.id);

    await eventPublisher.adminActionPerformed(req.user.id, 'USER_ACTIVATED', user.id, 'user', { previousStatus: user.status });

    await AdminRepository.logAction({
      adminId: req.user.id,
      actionType: 'USER_EDIT',
      targetType: 'USER',
      targetId: user.id,
      targetPhone: user.phone,
      actionDetails: { action: 'ACTIVATE', previousStatus: user.status },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'User activated successfully.',
      user: { id: user.id, status: 'ACTIVE' },
    });
  },

  /**
   * POST /admin/users/bulk-action
   */
  async bulkAction(req, res) {
    const { error, value } = bulkActionSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((d) => d.message),
      });
    }

    const successful = [];
    const failed = [];

    for (const userId of value.userIds) {
      try {
        const user = await UserRepository.findById(userId);
        if (!user) {
          failed.push({ userId, error: 'User not found' });
          continue;
        }

        switch (value.action) {
          case 'SUSPEND':
            await UserRepository.updateStatus(userId, 'SUSPENDED');
            await TokenRepository.deactivateAllUserSessions(userId);
            break;
          case 'BAN':
            await UserRepository.updateStatus(userId, 'BANNED');
            await TokenRepository.deactivateAllUserSessions(userId);
            break;
          case 'VERIFY':
            await UserRepository.markPhoneVerified(userId);
            break;
          case 'DELETE':
            // Soft-delete via BANNED status
            await UserRepository.updateStatus(userId, 'BANNED');
            break;
          default:
            break;
        }

        successful.push({ userId, success: true, message: `${value.action} applied` });
      } catch (err) {
        logger.error('Bulk action failed for user', { userId, action: value.action, error: err.message });
        failed.push({ userId, error: err.message });
      }
    }

    await eventPublisher.adminActionPerformed(req.user.id, 'USER_BULK_ACTION', null, 'user', {
      action: value.action, count: value.userIds.length, successCount: successful.length, failCount: failed.length,
    });

    await AdminRepository.logAction({
      adminId: req.user.id,
      actionType: 'USER_BULK_ACTION',
      targetType: 'USER_LIST',
      actionDetails: { action: value.action, count: value.userIds.length, successCount: successful.length, failCount: failed.length },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: failed.length === 0,
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      processed: value.userIds.length,
      successful,
      failed,
      summary: {
        totalProcessed: value.userIds.length,
        successCount: successful.length,
        failureCount: failed.length,
      },
    });
  },

  /**
   * GET /admin/users/:userId/sessions
   * Return all sessions (recent 20) for a user.
   */
  async getUserSessions(req, res) {
    const user = await UserRepository.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', error: 'USER_NOT_FOUND' });
    }
    const sessions = await TokenRepository.getUserSessions(req.params.userId);
    return res.status(200).json({ success: true, sessions });
  },

  /**
   * DELETE /admin/users/:userId/sessions/:sessionId
   * Revoke a specific session.
   */
  async revokeUserSession(req, res) {
    await TokenRepository.revokeSession(req.params.sessionId);
    await eventPublisher.adminActionPerformed(req.user.id, 'SESSION_TERMINATE', req.params.userId, 'user', { sessionId: req.params.sessionId });
    await AdminRepository.logAction({
      adminId: req.user.id,
      actionType: 'USER_EDIT',
      targetType: 'USER',
      targetId: req.params.userId,
      actionDetails: { action: 'REVOKE_SESSION', sessionId: req.params.sessionId },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
    }).catch(() => {});
    return res.status(200).json({ success: true, message: 'Session revoked.' });
  },

  /**
   * GET /admin/users/:userId/logs
   * Activity logs targeting this user.
   */
  async getUserLogs(req, res) {
    const page  = parseInt(req.query.page  ?? '1',  10);
    const limit = parseInt(req.query.limit ?? '20', 10);
    const result = await AdminRepository.getLogsForUser(req.params.userId, { page, limit });
    return res.status(200).json({ success: true, ...result });
  },

  // ────────────────────────────────────────────────────────────────
  // Dashboard Metrics
  // ────────────────────────────────────────────────────────────────

  /**
   * GET /admin/dashboard/metrics
   */
  async getDashboardMetrics(req, res) {
    const [userMetrics, authMetrics, registrationTrend] = await Promise.all([
      UserRepository.getDashboardMetrics(),
      AdminRepository.getAuthMetrics(),
      AdminRepository.getRegistrationTrend(7),
    ]);

    return res.status(200).json({
      success: true,
      metrics: {
        users: {
          total: parseInt(userMetrics.total, 10),
          active: parseInt(userMetrics.active, 10),
          newToday: parseInt(userMetrics.new_today, 10),
          newThisWeek: parseInt(userMetrics.new_this_week, 10),
          byRole: {
            BUYER: parseInt(userMetrics.buyers, 10),
            MERCHANT: parseInt(userMetrics.merchants, 10),
            ADMIN: parseInt(userMetrics.admins, 10),
          },
          byStatus: {
            PENDING: parseInt(userMetrics.pending, 10),
            ACTIVE: parseInt(userMetrics.active, 10),
            BANNED: parseInt(userMetrics.banned, 10),
            SUSPENDED: parseInt(userMetrics.suspended, 10),
          },
        },
        authentication: {
          loginAttemptsToday: parseInt(authMetrics.login_attempts_today || 0, 10),
          successfulLoginsToday: parseInt(authMetrics.successful_today || 0, 10),
          failedLoginsToday: parseInt(authMetrics.failed_today || 0, 10),
          otpSentToday: parseInt(authMetrics.otp_sent_today || 0, 10),
          averageLoginTime: 0, // Placeholder — would need event timing data
        },
      },
      trends: {
        userRegistrations: registrationTrend,
        loginActivity: [],   // Extend with audit log data if needed
        securityEvents: [],
      },
    });
  },

  /**
   * GET /admin/activity-logs
   */
  async getActivityLogs(req, res) {
    const { page = 1, limit = 50, adminId, actionType } = req.query;
    const logs = await AdminRepository.getActivityLogs({
      adminId, actionType,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    return res.status(200).json({ success: true, logs });
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function _formatUserRow(u) {
  return {
    id: u.id,
    phone: u.phone,
    role: u.role,
    status: u.status,
    phoneVerified: u.phone_verified,
    createdAt: u.created_at,
    lastLoginAt: u.last_login_at || null,
    failedLoginAttempts: u.failed_login_attempts,
    lockedUntil: u.locked_until || null,
    profile: u.first_name
      ? { firstName: u.first_name, lastName: u.last_name, city: u.city || null, country: u.country || null }
      : null,
  };
}

function _getAvailableFilters() {
  return [
    { key: 'role', label: 'Role', type: 'select',
      options: ['BUYER', 'MERCHANT', 'ADMIN', 'ALL'].map((v) => ({ value: v, label: v })) },
    { key: 'status', label: 'Status', type: 'select',
      options: ['PENDING', 'ACTIVE', 'BANNED', 'SUSPENDED', 'ALL'].map((v) => ({ value: v, label: v })) },
    { key: 'search', label: 'Search (phone/name)', type: 'text' },
    { key: 'registrationDateFrom', label: 'Registered After', type: 'date' },
    { key: 'registrationDateTo', label: 'Registered Before', type: 'date' },
  ];
}

module.exports = IdentityAdminController;
