'use strict';

const Joi = require('joi');
const ActivityLog = require('../../../models/ActivityLog');

const listSchema = Joi.object({
  page:       Joi.number().integer().min(1).default(1),
  limit:      Joi.number().integer().min(1).max(200).default(50),
  actorId:    Joi.string().optional(),
  actorRole:  Joi.string().valid('BUYER', 'MERCHANT', 'ADMIN', 'SYSTEM').optional(),
  category:   Joi.string().valid('identity', 'requests', 'admin', 'system').optional(),
  eventType:  Joi.string().optional(),
  targetType: Joi.string().valid('user', 'request').optional(),
  targetId:   Joi.string().optional(),
  from:       Joi.string().isoDate().optional(),
  to:         Joi.string().isoDate().optional(),
});

const statsSchema = Joi.object({
  from: Joi.string().isoDate().optional(),
  to:   Joi.string().isoDate().optional(),
});

function buildFilter(value) {
  const filter = {};
  if (value.actorId)    filter.actorId    = value.actorId;
  if (value.actorRole)  filter.actorRole  = value.actorRole;
  if (value.category)   filter.category   = value.category;
  if (value.eventType)  filter.eventType  = value.eventType;
  if (value.targetType) filter.targetType = value.targetType;
  if (value.targetId)   filter.targetId   = value.targetId;
  if (value.from || value.to) {
    filter.createdAt = {};
    if (value.from) filter.createdAt.$gte = new Date(value.from);
    if (value.to)   filter.createdAt.$lte = new Date(value.to);
  }
  return filter;
}

const analyticsController = {
  // GET /api/v1/analytics/activity
  async getActivityLogs(req, res) {
    const { error, value } = listSchema.validate(req.query, { abortEarly: false });
    if (error) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: error.details.map((d) => d.message) });
    }

    const filter = buildFilter(value);
    const skip   = (value.page - 1) * value.limit;

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(value.limit).lean(),
      ActivityLog.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      logs,
      pagination: {
        page:       value.page,
        limit:      value.limit,
        total,
        totalPages: Math.ceil(total / value.limit),
      },
    });
  },

  // GET /api/v1/analytics/activity/actor/:actorId
  async getActorLogs(req, res) {
    const { error, value } = listSchema.validate(req.query, { abortEarly: false });
    if (error) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: error.details.map((d) => d.message) });
    }

    const filter = { ...buildFilter(value), actorId: req.params.actorId };
    const skip   = (value.page - 1) * value.limit;

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(value.limit).lean(),
      ActivityLog.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      actorId: req.params.actorId,
      logs,
      pagination: {
        page:       value.page,
        limit:      value.limit,
        total,
        totalPages: Math.ceil(total / value.limit),
      },
    });
  },

  // GET /api/v1/analytics/stats
  async getStats(req, res) {
    const { error, value } = statsSchema.validate(req.query, { abortEarly: false });
    if (error) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: error.details.map((d) => d.message) });
    }

    const match = {};
    if (value.from || value.to) {
      match.createdAt = {};
      if (value.from) match.createdAt.$gte = new Date(value.from);
      if (value.to)   match.createdAt.$lte = new Date(value.to);
    }

    const [byCategory, byEventType, byRole, total] = await Promise.all([
      ActivityLog.aggregate([
        { $match: match },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ActivityLog.aggregate([
        { $match: match },
        { $group: { _id: '$eventType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
      ActivityLog.aggregate([
        { $match: match },
        { $group: { _id: '$actorRole', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ActivityLog.countDocuments(match),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        total,
        byCategory:  byCategory.map((r)  => ({ category: r._id,   count: r.count })),
        byEventType: byEventType.map((r) => ({ eventType: r._id,  count: r.count })),
        byRole:      byRole.map((r)      => ({ role: r._id,        count: r.count })),
      },
    });
  },
};

module.exports = analyticsController;
