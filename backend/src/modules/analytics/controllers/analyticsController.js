'use strict';

const Joi = require('joi');
const ActivityLog     = require('../../../models/ActivityLog');
const RequestAnalytic = require('../../../models/RequestAnalytic');
const RequestView     = require('../../../models/RequestView');
const ChatMessage     = require('../../../models/ChatMessage');
const prisma          = require('../../../prisma/client');

const listSchema = Joi.object({
  page:       Joi.number().integer().min(1).default(1),
  limit:      Joi.number().integer().min(1).max(200).default(50),
  actorId:    Joi.string().optional(),
  actorRole:  Joi.string().valid('BUYER','MERCHANT','ADMIN','SYSTEM').optional(),
  category:   Joi.string().valid('identity','requests','admin','system','bidding','chat','notifications').optional(),
  eventType:  Joi.string().optional(),
  targetType: Joi.string().optional(),
  targetId:   Joi.string().optional(),
  from:       Joi.string().isoDate().optional(),
  to:         Joi.string().isoDate().optional(),
});

const rangeSchema = Joi.object({
  from: Joi.string().isoDate().optional(),
  to:   Joi.string().isoDate().optional(),
});

// ─── helpers ──────────────────────────────────────────────────────────────

function buildMongoFilter(value) {
  const f = {};
  if (value.actorId)    f.actorId    = value.actorId;
  if (value.actorRole)  f.actorRole  = value.actorRole;
  if (value.category)   f.category   = value.category;
  if (value.eventType)  f.eventType  = value.eventType;
  if (value.targetType) f.targetType = value.targetType;
  if (value.targetId)   f.targetId   = value.targetId;
  if (value.from || value.to) {
    f.createdAt = {};
    if (value.from) f.createdAt.$gte = new Date(value.from);
    if (value.to)   f.createdAt.$lte = new Date(value.to);
  }
  return f;
}

function pgDateWhere(from, to) {
  if (!from && !to) return {};
  return {
    createdAt: {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to   ? { lte: new Date(to)   } : {}),
    },
  };
}

function todayStart() {
  const d = new Date(); d.setHours(0,0,0,0); return d;
}

function trend7sql(table, dateCol = 'created_at') {
  return prisma.$queryRawUnsafe(`
    SELECT DATE(${dateCol})::text AS date, COUNT(*)::int AS count
    FROM ${table}
    WHERE ${dateCol} >= NOW() - INTERVAL '7 days'
    GROUP BY DATE(${dateCol})
    ORDER BY DATE(${dateCol}) ASC
  `);
}

// ─── controllers ──────────────────────────────────────────────────────────

const analyticsController = {

  // GET /api/v1/analytics/activity
  async getActivityLogs(req, res) {
    const { error, value } = listSchema.validate(req.query, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

    const filter = buildMongoFilter(value);
    const skip   = (value.page - 1) * value.limit;

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(value.limit).lean(),
      ActivityLog.countDocuments(filter),
    ]);

    return res.json({ success: true, logs, pagination: { page: value.page, limit: value.limit, total, totalPages: Math.ceil(total / value.limit) } });
  },

  // GET /api/v1/analytics/activity/actor/:actorId
  async getActorLogs(req, res) {
    const { error, value } = listSchema.validate(req.query, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

    const filter = { ...buildMongoFilter(value), actorId: req.params.actorId };
    const skip   = (value.page - 1) * value.limit;

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(value.limit).lean(),
      ActivityLog.countDocuments(filter),
    ]);

    return res.json({ success: true, actorId: req.params.actorId, logs, pagination: { page: value.page, limit: value.limit, total, totalPages: Math.ceil(total / value.limit) } });
  },

  // GET /api/v1/analytics/stats  (activity log aggregates)
  async getStats(req, res) {
    const { error, value } = rangeSchema.validate(req.query, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

    const match = {};
    if (value.from || value.to) {
      match.createdAt = {};
      if (value.from) match.createdAt.$gte = new Date(value.from);
      if (value.to)   match.createdAt.$lte = new Date(value.to);
    }

    const [byCategory, byEventType, byRole, total] = await Promise.all([
      ActivityLog.aggregate([{ $match: match }, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      ActivityLog.aggregate([{ $match: match }, { $group: { _id: '$eventType', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 20 }]),
      ActivityLog.aggregate([{ $match: match }, { $group: { _id: '$actorRole', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      ActivityLog.countDocuments(match),
    ]);

    return res.json({
      success: true,
      stats: {
        total,
        byCategory:  byCategory.map(r  => ({ category: r._id,  count: r.count })),
        byEventType: byEventType.map(r => ({ eventType: r._id, count: r.count })),
        byRole:      byRole.map(r      => ({ role: r._id,       count: r.count })),
      },
    });
  },

  // GET /api/v1/analytics/overview
  async getOverview(req, res) {
    const { error, value } = rangeSchema.validate(req.query, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

    const pgWhere  = pgDateWhere(value.from, value.to);
    const today    = todayStart();

    const [
      // Users
      totalUsers, activeUsers, newUsersToday, usersByRole,
      // Requests
      totalRequests, activeRequests, completedRequests, requestsByStatus,
      // Bids
      totalBids, pendingBids, acceptedBids, bidsByStatus,
      // Chat
      totalRooms, totalMessages,
      // Notifications
      totalNotifs, unreadNotifs, notifsByChannel,
      // 7-day trends
      userTrend, requestTrend, bidTrend, notifTrend,
    ] = await Promise.all([
      // Users
      prisma.user.count({ where: pgWhere }),
      prisma.user.count({ where: { ...pgWhere, status: 'ACTIVE' } }),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
      // Requests
      prisma.request.count({ where: pgWhere }),
      prisma.request.count({ where: { ...pgWhere, status: { in: ['ACTIVE', 'HAS_BIDS'] } } }),
      prisma.request.count({ where: { ...pgWhere, status: 'COMPLETED' } }),
      prisma.request.groupBy({ by: ['status'], _count: { _all: true } }),
      // Bids
      prisma.bid.count({ where: pgWhere }),
      prisma.bid.count({ where: { ...pgWhere, status: 'PENDING' } }),
      prisma.bid.count({ where: { ...pgWhere, status: 'ACCEPTED' } }),
      prisma.bid.groupBy({ by: ['status'], _count: { _all: true } }),
      // Chat
      prisma.chatRoom.count({ where: pgWhere }),
      ChatMessage.countDocuments({ isDeleted: false }),
      // Notifications
      prisma.notification.count({ where: pgWhere }),
      prisma.notification.count({ where: { ...pgWhere, isRead: false } }),
      Promise.resolve([]),
      // Trends
      trend7sql('users'),
      trend7sql('requests'),
      trend7sql('bids'),
      trend7sql('notifications'),
    ]);

    const bidConversionRate = totalBids > 0 ? Math.round((acceptedBids / totalBids) * 100) : 0;
    const notifReadRate     = totalNotifs > 0 ? Math.round(((totalNotifs - unreadNotifs) / totalNotifs) * 100) : 0;

    return res.json({
      success: true,
      overview: {
        users: {
          total: totalUsers, active: activeUsers, newToday: newUsersToday,
          byRole: usersByRole.map(r => ({ role: r.role, count: r._count._all })),
          trend:  userTrend,
        },
        requests: {
          total: totalRequests, active: activeRequests, completed: completedRequests,
          byStatus: requestsByStatus.map(r => ({ status: r.status, count: r._count._all })),
          trend:    requestTrend,
        },
        bids: {
          total: totalBids, pending: pendingBids, accepted: acceptedBids,
          conversionRate: bidConversionRate,
          byStatus: bidsByStatus.map(r => ({ status: r.status, count: r._count._all })),
          trend:    bidTrend,
        },
        chat: {
          totalRooms, totalMessages,
        },
        notifications: {
          total: totalNotifs, unread: unreadNotifs, readRate: notifReadRate,
          trend: notifTrend,
        },
      },
    });
  },

  // GET /api/v1/analytics/users
  async getUserStats(req, res) {
    const { error, value } = rangeSchema.validate(req.query, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

    const pgWhere = pgDateWhere(value.from, value.to);
    const today   = todayStart();
    const week    = new Date(Date.now() - 7 * 86400000);

    const [total, active, banned, suspended, newToday, newThisWeek, byRole, byStatus, trend] = await Promise.all([
      prisma.user.count({ where: pgWhere }),
      prisma.user.count({ where: { ...pgWhere, status: 'ACTIVE' } }),
      prisma.user.count({ where: { ...pgWhere, status: 'BANNED' } }),
      prisma.user.count({ where: { ...pgWhere, status: 'SUSPENDED' } }),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: week } } }),
      prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
      prisma.user.groupBy({ by: ['status'], _count: { _all: true } }),
      trend7sql('users'),
    ]);

    return res.json({
      success: true,
      stats: {
        total, active, banned, suspended, newToday, newThisWeek,
        byRole:   byRole.map(r   => ({ role: r.role,     count: r._count._all })),
        byStatus: byStatus.map(r => ({ status: r.status, count: r._count._all })),
        trend,
      },
    });
  },

  // GET /api/v1/analytics/requests
  async getRequestStats(req, res) {
    const { error, value } = rangeSchema.validate(req.query, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

    const pgWhere = pgDateWhere(value.from, value.to);
    const mongoMatch = {};
    if (value.from || value.to) {
      mongoMatch.createdAt = {};
      if (value.from) mongoMatch.createdAt.$gte = new Date(value.from);
      if (value.to)   mongoMatch.createdAt.$lte = new Date(value.to);
    }

    const [total, byStatus, totalViews, totalBidCount, topCategories, trend, viewTrend] = await Promise.all([
      prisma.request.count({ where: pgWhere }),
      prisma.request.groupBy({ by: ['status'], _count: { _all: true }, where: pgWhere }),
      prisma.request.aggregate({ _sum: { viewCount: true }, where: pgWhere }),
      prisma.request.aggregate({ _sum: { bidCount: true }, where: pgWhere }),
      // Top categories by request count
      prisma.request.groupBy({
        by: ['categoryId'], where: pgWhere,
        _count: { _all: true },
        orderBy: { _count: { categoryId: 'desc' } },
        take: 8,
      }),
      trend7sql('requests'),
      // View trend from MongoDB RequestView
      RequestView.aggregate([
        { $match: mongoMatch },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$viewedAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }, { $limit: 7 },
        { $project: { _id: 0, date: '$_id', count: 1 } },
      ]),
    ]);

    const avgBidsPerRequest = total > 0 ? ((totalBidCount._sum.bidCount || 0) / total).toFixed(1) : '0';

    return res.json({
      success: true,
      stats: {
        total,
        totalViews:  totalViews._sum.viewCount  || 0,
        totalBids:   totalBidCount._sum.bidCount || 0,
        avgBidsPerRequest: parseFloat(avgBidsPerRequest),
        byStatus:    byStatus.map(r => ({ status: r.status, count: r._count._all })),
        topCategories: topCategories.map(r => ({ categoryId: r.categoryId, count: r._count._all })),
        trend,
        viewTrend,
      },
    });
  },

  // GET /api/v1/analytics/bids
  async getBidStats(req, res) {
    const { error, value } = rangeSchema.validate(req.query, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

    const pgWhere = pgDateWhere(value.from, value.to);

    const [total, byStatus, amountAgg, avgDeliveryDays, topMerchants, trend] = await Promise.all([
      prisma.bid.count({ where: pgWhere }),
      prisma.bid.groupBy({ by: ['status'], _count: { _all: true }, where: pgWhere }),
      prisma.bid.aggregate({ _avg: { amount: true }, _min: { amount: true }, _max: { amount: true }, _sum: { amount: true }, where: pgWhere }),
      prisma.bid.aggregate({ _avg: { deliveryDays: true }, where: pgWhere }),
      // Top merchants by bid count
      prisma.bid.groupBy({
        by: ['merchantId'], where: pgWhere,
        _count: { _all: true },
        orderBy: { _count: { merchantId: 'desc' } },
        take: 10,
      }),
      trend7sql('bids'),
    ]);

    const accepted = byStatus.find(s => s.status === 'ACCEPTED')?._count._all ?? 0;
    const conversionRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

    return res.json({
      success: true,
      stats: {
        total, conversionRate,
        byStatus:    byStatus.map(r => ({ status: r.status, count: r._count._all })),
        amount: {
          avg: Number(amountAgg._avg.amount || 0).toFixed(2),
          min: Number(amountAgg._min.amount || 0).toFixed(2),
          max: Number(amountAgg._max.amount || 0).toFixed(2),
          total: Number(amountAgg._sum.amount || 0).toFixed(2),
        },
        avgDeliveryDays: Number(avgDeliveryDays._avg.deliveryDays || 0).toFixed(1),
        topMerchants:    topMerchants.map(r => ({ merchantId: r.merchantId, count: r._count._all })),
        trend,
      },
    });
  },

  // GET /api/v1/analytics/chat
  async getChatStats(req, res) {
    const { error, value } = rangeSchema.validate(req.query, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

    const pgWhere    = pgDateWhere(value.from, value.to);
    const mongoMatch = {};
    if (value.from || value.to) {
      mongoMatch.createdAt = {};
      if (value.from) mongoMatch.createdAt.$gte = new Date(value.from);
      if (value.to)   mongoMatch.createdAt.$lte = new Date(value.to);
    }

    const [totalRooms, activeRooms, byType, totalMessages, deletedMessages, byMessageType, msgTrend] = await Promise.all([
      prisma.chatRoom.count({ where: pgWhere }),
      prisma.chatRoom.count({ where: { ...pgWhere, isActive: true } }),
      prisma.chatRoom.groupBy({ by: ['type'], _count: { _all: true }, where: pgWhere }),
      ChatMessage.countDocuments({ isDeleted: false }),
      ChatMessage.countDocuments({ isDeleted: true }),
      ChatMessage.aggregate([
        { $match: { ...mongoMatch, isDeleted: false } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ChatMessage.aggregate([
        { $match: { isDeleted: false, createdAt: { $gte: new Date(Date.now() - 7 * 86400000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', count: 1 } },
      ]),
    ]);

    return res.json({
      success: true,
      stats: {
        rooms: {
          total: totalRooms, active: activeRooms,
          byType: byType.map(r => ({ type: r.type, count: r._count._all })),
        },
        messages: {
          total: totalMessages, deleted: deletedMessages,
          byType: byMessageType.map(r => ({ type: r._id, count: r.count })),
          trend:  msgTrend,
        },
      },
    });
  },

  // GET /api/v1/analytics/notifications
  async getNotificationStats(req, res) {
    const { error, value } = rangeSchema.validate(req.query, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

    const pgWhere  = pgDateWhere(value.from, value.to);
    const today    = todayStart();

    const [total, todayTotal, unreadTotal, byType, trend] = await Promise.all([
      prisma.notification.count({ where: pgWhere }),
      prisma.notification.count({ where: { createdAt: { gte: today } } }),
      prisma.notification.count({ where: { ...pgWhere, isRead: false } }),
      prisma.notification.groupBy({ by: ['type'], where: pgWhere, _count: { _all: true }, orderBy: { _count: { type: 'desc' } } }),
      trend7sql('notifications'),
    ]);

    const readRate = total > 0 ? Math.round(((total - unreadTotal) / total) * 100) : 0;

    return res.json({
      success: true,
      stats: {
        total, todayTotal, unreadTotal, readRate,
        byType: byType.map(r => ({ type: r.type, count: r._count._all })),
        trend,
      },
    });
  },
};

module.exports = analyticsController;
