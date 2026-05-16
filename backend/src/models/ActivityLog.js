'use strict';

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    actorId:    { type: String, default: null, index: true },
    actorRole:  { type: String, default: 'SYSTEM', enum: ['BUYER', 'MERCHANT', 'ADMIN', 'SYSTEM'] },
    eventType:  { type: String, required: true, index: true },
    category:   { type: String, required: true, enum: ['identity', 'requests', 'admin', 'system'], index: true },
    action:     { type: String, required: true },
    targetType: { type: String, default: null, enum: ['user', 'request', null] },
    targetId:   { type: String, default: null, index: true },
    metadata:   { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    collection: 'activity_logs',
  },
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ actorId: 1, createdAt: -1 });
activityLogSchema.index({ category: 1, createdAt: -1 });
activityLogSchema.index({ targetId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
