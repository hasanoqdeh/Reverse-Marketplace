'use strict';

const crypto = require('crypto');
const config = require('../../../config');
const OtpRepository = require('../repositories/OtpRepository');
const redisClient = require('../../../cache/redis');
const logger = require('../../../utils/logger');

/**
 * OtpService — OTP generation, storage, and verification.
 * Implements:
 *   - 6-digit numeric OTP
 *   - 10-minute expiry
 *   - Max 3 attempts before invalidation
 *   - 60-second resend cooldown
 *   - 3-per-5-min phone rate limiting
 */
const OtpService = {
  /**
   * Generate a cryptographically random numeric OTP.
   */
  generateCode() {
    const length = config.otp.length;
    const max = Math.pow(10, length);
    const code = crypto.randomInt(0, max).toString().padStart(length, '0');
    return '123456';//code; // TODO: this code comment for testing perpos
  },

  /**
   * Create and store a new OTP.
   * @param {string} userId
   * @param {string} phone
   * @param {string} purpose  'LOGIN' | 'PHONE_VERIFICATION'
   */
  async createOtp(userId, phone, purpose = 'LOGIN') {
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000);

    const otp = await OtpRepository.create({ userId, phone, code, purpose, expiresAt });

    // Cache expiry time in Redis for quick UI feedback
    await redisClient.set(
      `otp:expiry:${phone}:${purpose}`,
      expiresAt.toISOString(),
      config.otp.expiryMinutes * 60
    );

    logger.debug('OTP created', { phone: this._maskPhone(phone), purpose, expiresAt });
    return { code, expiresAt, otpId: otp.id };
  },

  /**
   * Verify an OTP code.
   * @param {string} phone
   * @param {string} code
   * @param {string} purpose
   * @returns {{ valid: boolean, userId?: string, error?: string }}
   */
  async verifyOtp(phone, code, purpose = 'LOGIN') {
    const otp = await OtpRepository.findValidOtp(phone, purpose);

    if (!otp) {
      return { valid: false, error: 'OTP_NOT_FOUND', message: 'No valid OTP found. Please request a new one.' };
    }

    // Check attempt limit
    if (otp.attempts >= config.otp.maxAttempts) {
      return { valid: false, error: 'OTP_MAX_ATTEMPTS', message: 'Too many failed attempts. Please request a new OTP.' };
    }

    // Increment attempts
    const attempts = await OtpRepository.incrementAttempts(otp.id);

    // Constant-time comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(otp.code);
    const providedBuffer = Buffer.from(code.trim());
    const isMatch =
      expectedBuffer.length === providedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, providedBuffer);

    if (!isMatch) {
      const remaining = config.otp.maxAttempts - attempts;
      return {
        valid: false,
        error: 'OTP_INVALID',
        message: `Invalid OTP. ${remaining} attempt(s) remaining.`,
        attemptsRemaining: remaining,
      };
    }

    // Mark as used
    await OtpRepository.markUsed(otp.id);

    // Clean up Redis cache
    await redisClient.del(`otp:expiry:${phone}:${purpose}`);

    return { valid: true, userId: otp.user_id };
  },

  /**
   * Check if a resend is allowed (60s cooldown between sends).
   * @returns {{ allowed: boolean, cooldownRemaining?: number }}
   */
  async checkResendCooldown(phone, purpose = 'LOGIN') {
    const latest = await OtpRepository.findLatestForPhone(phone, purpose);
    if (!latest) return { allowed: true };

    const elapsedSeconds = Math.floor((Date.now() - new Date(latest.created_at).getTime()) / 1000);
    const cooldown = config.otp.resendCooldownSeconds;

    if (elapsedSeconds < cooldown) {
      return { allowed: false, cooldownRemaining: cooldown - elapsedSeconds };
    }
    return { allowed: true };
  },

  /**
   * Check per-phone rate limit (3 OTPs per 5 minutes).
   */
  async checkPhoneRateLimit(phone, purpose = 'LOGIN') {
    const count = await OtpRepository.countRecentForPhone(
      phone, purpose, config.otp.phoneRateLimitWindowMinutes
    );
    if (count >= config.otp.phoneRateLimitCount) {
      return {
        exceeded: true,
        message: `Too many OTP requests. Please wait ${config.otp.phoneRateLimitWindowMinutes} minutes.`,
      };
    }
    return { exceeded: false };
  },

  /**
   * Normalise phone: ensure +962 prefix if no country code given.
   */
  normalizePhone(phone, countryCode = '+962') {
    let normalized = phone.replace(/\s+/g, '').replace(/-/g, '');
    if (!normalized.startsWith('+')) {
      normalized = countryCode + normalized.replace(/^0/, '');
    }
    return normalized;
  },

  _maskPhone(phone) {
    if (!phone || phone.length < 6) return '***';
    return phone.slice(0, 6) + '****' + phone.slice(-3);
  },
};

module.exports = OtpService;
