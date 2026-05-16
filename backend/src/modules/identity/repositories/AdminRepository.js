'use strict';

const prisma = require('../../../prisma/client');
const AdminActivityLog = require('../../../models/AdminActivityLog');
const OtpCode = require('../../../models/OtpCode');

function flattenUser(user) {
  if (!user) return null;
  const { profile, phoneVerified, createdAt, updatedAt, lastLoginAt,
          failedLoginAttempts, lockedUntil, adminSubRole, ...rest } = user;
  return {
    ...rest,
    phone_verified: phoneVerified,
    created_at: createdAt,
    updated_at: updatedAt,
    last_login_at: lastLoginAt,
    failed_login_attempts: failedLoginAttempts,
    locked_until: lockedUntil,
    admin_sub_role: adminSubRole,
    first_name: profile?.firstName ?? '',
    last_name: profile?.lastName ?? '',
  };
}

function flattenLog(log, adminMap = {}) {
  const admin = adminMap[log.adminId] || null;
  return {
    id: log._id.toString(),
    admin_id: log.adminId,
    action_type: log.actionType,
    target_type: log.targetType,
    target_id: log.targetId,
    target_phone: log.targetPhone,
    action_details: log.actionDetails,
    ip_address: log.ipAddress,
    user_agent: log.userAgent,
    success: log.success,
    failure_reason: log.failureReason,
    created_at: log.createdAt,
    admin_phone: admin?.phone ?? null,
    first_name: admin?.profile?.firstName ?? null,
    last_name: admin?.profile?.lastName ?? null,
  };
}

const AdminRepository = {
  // ─── Admin Lookup ──────────────────────────────────────────────

  async findAdminByPhone(phone) {
    const user = await prisma.user.findFirst({
      where: { phone, role: 'ADMIN' },
      include: { profile: true },
    });
    return flattenUser(user);
  },

  // ─── Activity Logging (MongoDB) ────────────────────────────────

  async logAction({
    adminId, actionType, targetType, targetId = null, targetPhone = null,
    actionDetails = {}, ipAddress = null, userAgent = null, success, failureReason = null,
  }) {
    await AdminActivityLog.create({
      adminId, actionType, targetType, targetId, targetPhone,
      actionDetails, ipAddress, userAgent, success, failureReason,
    });
  },

  async getActivityLogs({ adminId, actionType, page = 1, limit = 50 } = {}) {
    const filter = {};
    if (adminId) filter.adminId = adminId;
    if (actionType) filter.actionType = actionType;

    const logs = await AdminActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Fetch admin profiles from PostgreSQL in one query
    const adminIds = [...new Set(logs.map(l => l.adminId).filter(Boolean))];
    const adminUsers = adminIds.length
      ? await prisma.user.findMany({ where: { id: { in: adminIds } }, include: { profile: true } })
      : [];
    const adminMap = Object.fromEntries(adminUsers.map(u => [u.id, u]));

    return logs.map(log => flattenLog(log, adminMap));
  },

  // ─── Dashboard Metrics ─────────────────────────────────────────

  async getAuthMetrics() {
    const dayAgo = new Date(Date.now() - 86400000);

    const [otpSentToday, loginAttemptsToday, successfulToday, failedToday] = await Promise.all([
      OtpCode.countDocuments({ createdAt: { $gte: dayAgo } }),
      AdminActivityLog.countDocuments({ createdAt: { $gte: dayAgo } }),
      AdminActivityLog.countDocuments({ success: true, createdAt: { $gte: dayAgo } }),
      AdminActivityLog.countDocuments({ success: false, createdAt: { $gte: dayAgo } }),
    ]);

    return {
      otp_sent_today: otpSentToday,
      login_attempts_today: loginAttemptsToday,
      successful_today: successfulToday,
      failed_today: failedToday,
    };
  },

  async getLogsForUser(userId, { page = 1, limit = 20 } = {}) {
    const filter = { targetId: userId };

    const [total, logs] = await Promise.all([
      AdminActivityLog.countDocuments(filter),
      AdminActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    // Fetch admin profiles for log entries
    const adminIds = [...new Set(logs.map(l => l.adminId).filter(Boolean))];
    const adminUsers = adminIds.length
      ? await prisma.user.findMany({ where: { id: { in: adminIds } }, include: { profile: true } })
      : [];
    const adminMap = Object.fromEntries(adminUsers.map(u => [u.id, u]));

    return { total, logs: logs.map(log => flattenLog(log, adminMap)) };
  },

  // ─── Registration Trend (PostgreSQL) ──────────────────────────

  async getRegistrationTrend(days = 7) {
    const since = new Date(Date.now() - days * 86400000);
    const rows = await prisma.$queryRaw`
      SELECT DATE(created_at) AS date, COUNT(*)::int AS count
      FROM users
      WHERE created_at >= ${since}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;
    return rows;
  },
};

module.exports = AdminRepository;
