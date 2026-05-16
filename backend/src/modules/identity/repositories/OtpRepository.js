'use strict';

const OtpCode = require('../../../models/OtpCode');

function flattenOtp(otp) {
  if (!otp) return null;
  const { _id, userId, expiresAt, usedAt, createdAt, __v, ...rest } = otp;
  return { id: _id.toString(), ...rest, user_id: userId, expires_at: expiresAt, used_at: usedAt, created_at: createdAt };
}

const OtpRepository = {
  async create({ userId, phone, code, purpose, expiresAt }) {
    await OtpCode.updateMany(
      { phone, purpose, usedAt: null, expiresAt: { $gt: new Date() } },
      { $set: { usedAt: new Date() } },
    );

    const otp = await OtpCode.create({
      userId, phone, code: String(code), purpose, expiresAt: new Date(expiresAt),
    });
    return flattenOtp(otp.toObject());
  },

  async findValidOtp(phone, purpose) {
    const otp = await OtpCode.findOne(
      { phone, purpose, usedAt: null, expiresAt: { $gt: new Date() } },
    ).sort({ createdAt: -1 }).lean();
    return flattenOtp(otp);
  },

  async incrementAttempts(otpId) {
    const otp = await OtpCode.findByIdAndUpdate(
      otpId,
      { $inc: { attempts: 1 } },
      { new: true, select: 'attempts' },
    ).lean();
    return otp ? otp.attempts : null;
  },

  async markUsed(otpId) {
    await OtpCode.findByIdAndUpdate(otpId, { $set: { usedAt: new Date() } });
  },

  async countRecentForPhone(phone, purpose, windowMinutes) {
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);
    return OtpCode.countDocuments({ phone, purpose, createdAt: { $gte: since } });
  },

  async findLatestForPhone(phone, purpose) {
    const otp = await OtpCode.findOne({ phone, purpose })
      .sort({ createdAt: -1 })
      .select('createdAt')
      .lean();
    return otp ? { created_at: otp.createdAt } : null;
  },
};

module.exports = OtpRepository;
