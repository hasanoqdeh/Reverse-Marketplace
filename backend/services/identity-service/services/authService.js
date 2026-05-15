'use strict';

const UserRepository = require('../repositories/UserRepository');
const OtpService = require('./otpService');
const TokenService = require('./tokenService');
const TokenRepository = require('../repositories/TokenRepository');
const AdminRepository = require('../repositories/AdminRepository');
const eventPublisher = require('../events/publisher');
const redisClient = require('../cache/redis');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * AuthService — orchestrates the full phone-OTP authentication flow.
 * Handles both standard users (BUYER/MERCHANT) and admins.
 */
const AuthService = {
  // ────────────────────────────────────────────────────────────────
  // 1. Phone Login — find/create user, generate & send OTP
  // ────────────────────────────────────────────────────────────────

  /**
   * Initiate phone-based login.
   * Creates a new user if none exists (self-registration).
   *
   * @param {string} phone       Normalised E.164 phone
   * @param {string} role        'BUYER' | 'MERCHANT' | 'ADMIN'
   * @param {object} [context]   { ipAddress, userAgent }
   */
  async initiatePhoneLogin(phone, role = 'BUYER', context = {}) {
    // ── Rate limit: 3 OTPs per 5 minutes per phone ──
    const rateCheck = await OtpService.checkPhoneRateLimit(phone, 'LOGIN');
    if (rateCheck.exceeded) {
      return {
        success: false,
        rateLimitExceeded: true,
        message: rateCheck.message,
      };
    }

    // ── Resend cooldown: 60 seconds ──
    const cooldown = await OtpService.checkResendCooldown(phone, 'LOGIN');
    if (!cooldown.allowed) {
      return {
        success: false,
        rateLimitExceeded: false,
        cooldown: true,
        cooldownRemaining: cooldown.cooldownRemaining,
        message: `Please wait ${cooldown.cooldownRemaining}s before requesting another OTP.`,
      };
    }

    // ── Find or create user ──
    let user = await UserRepository.findByPhone(phone);

    if (!user) {
      if (role === 'ADMIN') {
        // Admins must be pre-registered — never auto-create
        logger.warn('Admin login attempt for non-existent phone', { phone: this._mask(phone) });
        return {
          success: false,
          message: 'Admin account not found. Please contact your system administrator.',
          error: 'ADMIN_NOT_FOUND',
        };
      }
      // Auto-register BUYER/MERCHANT
      user = await UserRepository.create({ phone, role, status: 'PENDING' });
      await UserRepository.createProfile({ userId: user.id });
      logger.info('New user auto-registered', { userId: user.id, role });
    }

    // ── Check account status ──
    if (user.status === 'BANNED') {
      return { success: false, message: 'Your account has been banned.', error: 'ACCOUNT_BANNED' };
    }

    // ── Check account lock ──
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const lockedUntil = new Date(user.locked_until);
      const remainingMs = lockedUntil - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      return {
        success: false,
        message: `Account temporarily locked. Try again in ${remainingMin} minute(s).`,
        error: 'ACCOUNT_LOCKED',
        nextAttemptAt: lockedUntil.toISOString(),
      };
    }

    // ── Generate OTP & publish event for notification service ──
    const { code, expiresAt } = await OtpService.createOtp(user.id, phone, 'LOGIN');
    await eventPublisher.otpRequested(user.id, phone, code, 'LOGIN', expiresAt);

    logger.info('OTP sent', { userId: user.id, phone: this._mask(phone) });

    return {
      success: true,
      expiresAt: expiresAt.toISOString(),
      message: 'OTP sent to your phone number.',
    };
  },

  // ────────────────────────────────────────────────────────────────
  // 2. Verify OTP — validate code, issue tokens, create session
  // ────────────────────────────────────────────────────────────────

  /**
   * Verify the OTP submitted by the user and return JWT tokens on success.
   */
  async verifyOtp(phone, otpCode, { deviceFingerprint, ipAddress, userAgent } = {}) {
    const user = await UserRepository.findByPhone(phone);
    if (!user) {
      return { success: false, message: 'User not found.', error: 'USER_NOT_FOUND' };
    }

    // Check lock status
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return { success: false, message: 'Account is locked.', error: 'ACCOUNT_LOCKED' };
    }

    const verification = await OtpService.verifyOtp(phone, otpCode, 'LOGIN');

    if (!verification.valid) {
      // Track failed attempts for lockout
      const failedCount = await UserRepository.incrementFailedAttempts(user.id);

      if (failedCount >= config.security.maxFailedAttempts) {
        const lockMinutes = this._progressiveLockoutMinutes(failedCount);
        await UserRepository.lockAccount(user.id, lockMinutes);
        logger.warn('Account locked after failed attempts', { userId: user.id, failedCount });
        return {
          success: false,
          message: `Account locked for ${lockMinutes} minute(s) due to too many failed attempts.`,
          error: 'ACCOUNT_LOCKED',
        };
      }

      return {
        success: false,
        message: verification.message,
        error: verification.error,
        attemptsRemaining: verification.attemptsRemaining,
      };
    }

    // ── OTP valid — activate user if pending ──
    let updatedUser = user;
    if (user.status === 'PENDING' || !user.phone_verified) {
      updatedUser = await UserRepository.markPhoneVerified(user.id);
      await eventPublisher.userVerified(user.id, phone, user.role);

      if (user.status === 'PENDING') {
        await eventPublisher.userRegistered(user.id, phone, user.role);
      }
    }

    // ── Reset failed attempts & update last login ──
    await UserRepository.updateLastLogin(user.id);

    // ── Issue JWT token pair ──
    const tokens = await TokenService.issueTokenPair(updatedUser || user, { ipAddress, userAgent, deviceFingerprint });

    // ── Create session record ──
    const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await TokenRepository.createSession({
      userId: user.id,
      sessionToken: TokenService.hashToken(tokens.refreshToken),
      deviceFingerprint,
      ipAddress,
      userAgent,
      expiresAt: refreshExpiry,
    });

    await eventPublisher.userLoggedIn(user.id, phone, user.role);

    const freshUser = await UserRepository.findById(user.id);

    logger.info('User authenticated successfully', { userId: user.id, role: user.role });

    return {
      success: true,
      user: this._formatUser(freshUser),
      tokens,
      sessionTimeout: config.security.maxConcurrentSessions,
    };
  },

  // ────────────────────────────────────────────────────────────────
  // 3. Resend OTP
  // ────────────────────────────────────────────────────────────────

  async resendOtp(phone, role = 'BUYER') {
    const cooldown = await OtpService.checkResendCooldown(phone, 'LOGIN');
    if (!cooldown.allowed) {
      return {
        success: false,
        cooldownRemaining: cooldown.cooldownRemaining,
        message: `Please wait ${cooldown.cooldownRemaining}s before resending.`,
      };
    }

    const user = await UserRepository.findByPhone(phone);
    if (!user) {
      // Don't reveal whether phone exists — generic response
      return { success: true, message: 'If this number is registered, you will receive an OTP.' };
    }

    if (user.status === 'BANNED') {
      return { success: false, message: 'Account is banned.', error: 'ACCOUNT_BANNED' };
    }

    const rateCheck = await OtpService.checkPhoneRateLimit(phone, 'LOGIN');
    if (rateCheck.exceeded) {
      return { success: false, rateLimitExceeded: true, message: rateCheck.message };
    }

    const { code, expiresAt } = await OtpService.createOtp(user.id, phone, 'LOGIN');
    await eventPublisher.otpRequested(user.id, phone, code, 'LOGIN', expiresAt);

    return {
      success: true,
      expiresAt: expiresAt.toISOString(),
      message: 'OTP resent successfully.',
    };
  },

  // ────────────────────────────────────────────────────────────────
  // 4. Refresh Token
  // ────────────────────────────────────────────────────────────────

  async refreshToken(refreshToken, context = {}) {
    try {
      const tokens = await TokenService.refreshTokenPair(refreshToken, context);
      return { success: true, tokens };
    } catch (err) {
      logger.warn('Token refresh failed', { error: err.message });
      const code = err.code || 'TOKEN_INVALID';
      return { success: false, message: err.message, error: code };
    }
  },

  // ────────────────────────────────────────────────────────────────
  // 5. Logout
  // ────────────────────────────────────────────────────────────────

  async logout(userId, refreshToken, allDevices = false) {
    if (allDevices) {
      await TokenService.revokeAllTokens(userId);
      await TokenRepository.deactivateAllUserSessions(userId);
      logger.info('User logged out from all devices', { userId });
    } else if (refreshToken) {
      await TokenService.revokeRefreshToken(refreshToken);
      const sessionHash = TokenService.hashToken(refreshToken);
      await TokenRepository.deactivateSession(sessionHash);
      logger.info('User logged out from current session', { userId });
    }

    return { success: true, message: allDevices ? 'Logged out from all devices.' : 'Logged out successfully.' };
  },

  // ────────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────────

  /**
   * Progressive lockout: 30m → 60m → 240m → 1440m
   */
  _progressiveLockoutMinutes(failedCount) {
    if (failedCount <= 5) return 30;
    if (failedCount <= 7) return 60;
    if (failedCount <= 10) return 240;
    return 1440;
  },

  _formatUser(user) {
    if (!user) return null;
    return {
      id: user.id,
      phone: user.phone,
      role: user.role,
      adminSubRole: user.admin_sub_role || null,
      status: user.status,
      phoneVerified: user.phone_verified,
      profile: user.first_name
        ? {
            firstName: user.first_name,
            lastName: user.last_name,
            profileImageUrl: user.profile_image_url || null,
            city: user.city || null,
            country: user.country || null,
          }
        : null,
    };
  },

  _mask(phone) {
    if (!phone || phone.length < 6) return '***';
    return phone.slice(0, 6) + '****' + phone.slice(-3);
  },
};

module.exports = AuthService;
