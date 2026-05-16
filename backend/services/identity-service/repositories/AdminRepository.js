'use strict';

const prisma = require('../prisma/client');

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

const AdminRepository = {
  // ─── Admin Lookup ──────────────────────────────────────────────

  async findAdminByPhone(phone) {
    const user = await prisma.user.findFirst({
      where: { phone, role: 'ADMIN' },
      include: { profile: true },
    });
    return flattenUser(user);
  },

  // ─── Activity Logging ──────────────────────────────────────────

  async logAction({
    adminId, actionType, targetType, targetId = null, targetPhone = null,
    actionDetails = {}, ipAddress = null, userAgent = null, success, failureReason = null,
  }) {
    await prisma.adminActivityLog.create({
      data: { adminId, actionType, targetType, targetId, targetPhone,
               actionDetails, ipAddress, userAgent, success, failureReason },
    });
  },

  async getActivityLogs({ adminId, actionType, page = 1, limit = 50 } = {}) {
    const where = {};
    if (adminId) where.adminId = adminId;
    if (actionType) where.actionType = actionType;

    const logs = await prisma.adminActivityLog.findMany({
      where,
      include: { admin: { include: { profile: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return logs.map(({ admin, adminId, actionType, targetType, targetId, targetPhone,
                       actionDetails, ipAddress, userAgent, createdAt, ...rest }) => ({
      ...rest,
      admin_id: adminId,
      action_type: actionType,
      target_type: targetType,
      target_id: targetId,
      target_phone: targetPhone,
      action_details: actionDetails,
      ip_address: ipAddress,
      user_agent: userAgent,
      created_at: createdAt,
      failure_reason: rest.failureReason,
      admin_phone: admin?.phone ?? null,
      first_name: admin?.profile?.firstName ?? null,
      last_name: admin?.profile?.lastName ?? null,
    }));
  },

  // ─── Dashboard Metrics ─────────────────────────────────────────

  async getAuthMetrics() {
    const dayAgo = new Date(Date.now() - 86400000);

    const [otpSentToday, loginAttemptsToday, successfulToday, failedToday] =
      await prisma.$transaction([
        prisma.otpCode.count({ where: { createdAt: { gte: dayAgo } } }),
        prisma.adminActivityLog.count({ where: { createdAt: { gte: dayAgo } } }),
        prisma.adminActivityLog.count({ where: { success: true, createdAt: { gte: dayAgo } } }),
        prisma.adminActivityLog.count({ where: { success: false, createdAt: { gte: dayAgo } } }),
      ]);

    return {
      otp_sent_today: otpSentToday,
      login_attempts_today: loginAttemptsToday,
      successful_today: successfulToday,
      failed_today: failedToday,
    };
  },

  async getLogsForUser(userId, { page = 1, limit = 20 } = {}) {
    const where = { targetId: userId };
    const [total, logs] = await prisma.$transaction([
      prisma.adminActivityLog.count({ where }),
      prisma.adminActivityLog.findMany({
        where,
        include: { admin: { include: { profile: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return {
      total,
      logs: logs.map(({ admin, adminId, actionType, targetType, targetId, targetPhone,
                        actionDetails, ipAddress, userAgent, createdAt, ...rest }) => ({
        ...rest,
        admin_id: adminId,
        action_type: actionType,
        target_type: targetType,
        target_id: targetId,
        target_phone: targetPhone,
        action_details: actionDetails,
        ip_address: ipAddress,
        user_agent: userAgent,
        created_at: createdAt,
        failure_reason: rest.failureReason,
        admin_phone: admin?.phone ?? null,
        first_name: admin?.profile?.firstName ?? null,
        last_name: admin?.profile?.lastName ?? null,
      })),
    };
  },

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
