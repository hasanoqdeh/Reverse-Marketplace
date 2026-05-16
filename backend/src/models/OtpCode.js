'use strict';

const mongoose = require('mongoose');

const otpCodeSchema = new mongoose.Schema(
  {
    userId:    { type: String, required: true, index: true },
    phone:     { type: String, required: true, index: true },
    code:      { type: String, required: true },
    purpose:   { type: String, required: true, enum: ['LOGIN', 'PHONE_VERIFICATION'], index: true },
    attempts:  { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    usedAt:    { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    collection: 'otp_codes',
  },
);

// TTL index — MongoDB auto-purges expired OTPs
otpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpCodeSchema.index({ phone: 1, purpose: 1, createdAt: -1 });

module.exports = mongoose.model('OtpCode', otpCodeSchema);
