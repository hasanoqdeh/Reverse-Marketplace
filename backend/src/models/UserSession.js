'use strict';

const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema(
  {
    userId:            { type: String, required: true, index: true },
    sessionToken:      { type: String, required: true, unique: true, index: true },
    deviceFingerprint: { type: String, default: null },
    ipAddress:         { type: String, default: null },
    userAgent:         { type: String, default: null },
    isActive:          { type: Boolean, default: true, index: true },
    lastActivityAt:    { type: Date, default: Date.now },
    expiresAt:         { type: Date, required: true },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    collection: 'user_sessions',
  },
);

// TTL index — MongoDB auto-purges expired sessions
userSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('UserSession', userSessionSchema);
