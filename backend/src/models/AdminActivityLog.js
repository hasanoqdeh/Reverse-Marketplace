'use strict';

const mongoose = require('mongoose');

const adminActivityLogSchema = new mongoose.Schema(
  {
    adminId:       { type: String, default: null, index: true },
    actionType:    { type: String, required: true, index: true },
    targetType:    { type: String, required: true },
    targetId:      { type: String, default: null },
    targetPhone:   { type: String, default: null },
    actionDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress:     { type: String, default: null },
    userAgent:     { type: String, default: null },
    success:       { type: Boolean, required: true },
    failureReason: { type: String, default: null },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    collection: 'admin_activity_logs',
  },
);

// Index for time-based queries
adminActivityLogSchema.index({ createdAt: -1 });
adminActivityLogSchema.index({ targetId: 1, createdAt: -1 });

module.exports = mongoose.model('AdminActivityLog', adminActivityLogSchema);
