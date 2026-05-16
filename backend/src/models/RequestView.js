'use strict';

const mongoose = require('mongoose');

const requestViewSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, index: true },
    userId:    { type: String, default: null },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    viewedAt:  { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    collection: 'request_views',
  },
);

requestViewSchema.index({ requestId: 1, viewedAt: -1 });

module.exports = mongoose.model('RequestView', requestViewSchema);
