'use strict';

const prisma = require('../prisma/client');

function flattenOtp(otp) {
  if (!otp) return null;
  const { expiresAt, usedAt, createdAt, userId, ...rest } = otp;
  return { ...rest, user_id: userId, expires_at: expiresAt, used_at: usedAt, created_at: createdAt };
}

const OtpRepository = {
  async create({ userId, phone, code, purpose, expiresAt }) {
    await prisma.otpCode.updateMany({
      where: { phone, purpose, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    });

    const otp = await prisma.otpCode.create({
      data: { userId, phone, code, purpose, expiresAt: new Date(expiresAt) },
    });
    return flattenOtp(otp);
  },

  async findValidOtp(phone, purpose) {
    const otp = await prisma.otpCode.findFirst({
      where: { phone, purpose, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    return flattenOtp(otp);
  },

  async incrementAttempts(otpId) {
    const otp = await prisma.otpCode.update({
      where: { id: otpId },
      data: { attempts: { increment: 1 } },
      select: { attempts: true },
    });
    return otp.attempts;
  },

  async markUsed(otpId) {
    await prisma.otpCode.update({ where: { id: otpId }, data: { usedAt: new Date() } });
  },

  async countRecentForPhone(phone, purpose, windowMinutes) {
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);
    return prisma.otpCode.count({ where: { phone, purpose, createdAt: { gte: since } } });
  },

  async findLatestForPhone(phone, purpose) {
    const otp = await prisma.otpCode.findFirst({
      where: { phone, purpose },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });
    return otp ? { created_at: otp.createdAt } : null;
  },
};

module.exports = OtpRepository;
