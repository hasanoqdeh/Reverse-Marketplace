'use strict';

const mongoose = require('mongoose');

const ANALYTICS_EVENT_TYPES = [
  'VIEW', 'BID_PLACED', 'BID_WITHDRAWN', 'STATUS_CHANGE',
  'EXTENSION_REQUESTED', 'EXPIRED', 'CANCELLED', 'COMPLETED',
];

const requestAnalyticSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, index: true },
    eventType: { type: String, required: true, enum: ANALYTICS_EVENT_TYPES, index: true },
    userId:    { type: String, default: null },
    metadata:  { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    collection: 'request_analytics',
  },
);

requestAnalyticSchema.index({ requestId: 1, createdAt: -1 });

module.exports = mongoose.model('RequestAnalytic', requestAnalyticSchema);
