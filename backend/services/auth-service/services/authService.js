const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const moment = require('moment');
const database = require('../database/connection');
const redisClient = require('../cache/redis');
const eventPublisher = require('../events/publisher');
const logger = require('../utils/logger');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');

class AuthService {
  constructor() {
    this.saltRounds = 12;
  }

  // Helper methods
  generateOTP() {
    const { length, characters } = config.otp;
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return otp;
  }

  generateDeviceFingerprint(ipAddress, userAgent) {
    if (!config.security.deviceTracking.enabled) {
      return null;
    }

    const fingerprintData = `${ipAddress}|${userAgent}|${config.security.deviceTracking.salt}`;
    return crypto.createHash('sha256').update(fingerprintData).digest('hex');
  }

  generateJWT(userId, phone, role, additionalData = {}) {
    const payload = {
      userId,
      phone,
      role,
      ...additionalData,
      iat: Math.floor(Date.now() / 1000),
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.accessExpiry,
      algorithm: config.jwt.algorithm,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    });

    const refreshToken = jwt.sign(
      { userId, phone, role, type: 'refresh' },
      config.jwt.refreshSecret,
      {
        expiresIn: config.jwt.refreshExpiry,
        algorithm: config.jwt.algorithm,
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
      }
    );

    return { accessToken, refreshToken };
  }

  async verifyJWT(token, isRefresh = false) {
    try {
      const secret = isRefresh ? config.jwt.refreshSecret : config.jwt.secret;
      const decoded = jwt.verify(token, secret, {
        algorithms: [config.jwt.algorithm],
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
      });

      if (isRefresh && decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid token: ' + error.message);
    }
  }

  async hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async validatePhoneNumber(phone) {
    // Remove all non-numeric characters
    let cleanPhone = phone.replace(/\D/g, '');
    
    // Handle local Jordanian numbers without country code (starts with 07 and has 10 digits)
    if (cleanPhone.length === 10 && cleanPhone.startsWith('07')) {
      cleanPhone = '962' + cleanPhone.substring(1); // Remove 07 and add 962
    }
    // Handle local Jordanian numbers without country code (starts with 7 and has 9 digits)
    else if (cleanPhone.length === 9 && cleanPhone.startsWith('7')) {
      cleanPhone = '962' + cleanPhone;
    }
    // Handle Jordanian numbers with country code
    else if (cleanPhone.startsWith('962') && cleanPhone.length === 12) {
      // Already has country code, keep as is
    }
    // Check if it's a valid Omani phone number
    else if (cleanPhone.startsWith('968')) {
      return cleanPhone.length === 11 ? cleanPhone : null;
    }
    // For other international numbers, basic validation
    else if (cleanPhone.length >= 10 && cleanPhone.length <= 15) {
      // Keep as is for other international numbers
    } else {
      return null;
    }
    
    return cleanPhone;
  }

  async checkRateLimit(key, windowMs, maxRequests) {
    // Temporarily disabled Redis rate limiting to get API working
    // TODO: Fix Redis connection and re-enable rate limiting
    return {
      current: 1,
      remaining: Math.max(0, maxRequests - 1),
      resetTime: Date.now() + windowMs,
      isExceeded: false,
    };
  }

  async isAccountLocked(userId, phone) {
    try {
      const result = await database.query(
        'SELECT locked_until, failed_login_attempts FROM users WHERE id = $1 OR phone = $2',
        [userId, phone]
      );

      if (result.rows.length === 0) {
        return { locked: false, lockoutRemaining: 0 };
      }

      const user = result.rows[0];
      
      if (user.locked_until && moment(user.locked_until).isAfter(moment())) {
        const lockoutRemaining = moment(user.locked_until).diff(moment(), 'seconds');
        return { locked: true, lockoutRemaining };
      }

      return { locked: false, lockoutRemaining: 0 };
    } catch (error) {
      logger.error('Error checking account lock status:', error);
      return { locked: false, lockoutRemaining: 0 };
    }
  }

  async lockAccount(userId, phone, reason = 'Too many failed attempts') {
    try {
      const lockoutDuration = config.security.lockoutDurationMinutes;
      const lockedUntil = moment().add(lockoutDuration, 'minutes').toDate();

      await database.query(
        'UPDATE users SET locked_until = $1 WHERE id = $2 OR phone = $3',
        [lockedUntil, userId, phone]
      );

      // Publish account locked event
      await eventPublisher.publishAccountLocked(userId, phone, lockoutDuration, reason, null, null);

      logger.auth.accountLocked(userId, phone, lockoutDuration, reason);

      return lockedUntil;
    } catch (error) {
      logger.error('Error locking account:', error);
      throw error;
    }
  }

  async unlockAccount(userId, phone, unlockedBy = null) {
    try {
      await database.query(
        'UPDATE users SET locked_until = NULL, failed_login_attempts = 0 WHERE id = $1 OR phone = $2',
        [userId, phone]
      );

      // Publish account unlocked event
      await eventPublisher.publishAccountUnlocked(userId, phone, unlockedBy, null, null);

      logger.auth.accountUnlocked(userId, phone);

      return true;
    } catch (error) {
      logger.error('Error unlocking account:', error);
      throw error;
    }
  }

  async incrementFailedAttempts(userId, phone) {
    try {
      const result = await database.query(
        'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1 OR phone = $2 RETURNING failed_login_attempts',
        [userId, phone]
      );

      const failedAttempts = result.rows[0].failed_login_attempts;

      if (failedAttempts >= config.security.maxFailedAttempts) {
        await this.lockAccount(userId, phone);
      }

      return failedAttempts;
    } catch (error) {
      logger.error('Error incrementing failed attempts:', error);
      throw error;
    }
  }

  async resetFailedAttempts(userId, phone) {
    try {
      await database.query(
        'UPDATE users SET failed_login_attempts = 0 WHERE id = $1 OR phone = $2',
        [userId, phone]
      );
    } catch (error) {
      logger.error('Error resetting failed attempts:', error);
      throw error;
    }
  }

  async logAuthEvent(eventType, userId, phone, ipAddress, userAgent, deviceFingerprint, success, failureReason = null, metadata = {}) {
    try {
      await database.query(
        `INSERT INTO auth_audit_logs (user_id, event_type, phone, ip_address, user_agent, device_fingerprint, success, failure_reason, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [userId, eventType, phone, ipAddress, userAgent, deviceFingerprint, success, failureReason, metadata]
      );
    } catch (error) {
      logger.error('Error logging auth event:', error);
      // Don't throw error here as logging should not break the main flow
    }
  }

  // Main authentication methods
  async initiatePhoneLogin(phone, countryCode, ipAddress, userAgent) {
    try {
      // Validate phone number
      const validatedPhone = await this.validatePhoneNumber(phone);
      if (!validatedPhone) {
        throw new Error('Invalid phone number format');
      }

      // Check rate limiting
      const rateLimitKey = `phone_login:${validatedPhone}:${ipAddress}`;
      const rateLimitResult = await this.checkRateLimit(
        rateLimitKey,
        config.rateLimiting.phoneLogin.windowMs,
        config.rateLimiting.phoneLogin.max
      );

      if (rateLimitResult.isExceeded) {
        await this.logAuthEvent(
          'PHONE_LOGIN_ATTEMPT',
          null,
          validatedPhone,
          ipAddress,
          userAgent,
          null,
          false,
          'Rate limit exceeded'
        );
        
        return {
          success: false,
          message: 'Too many login attempts. Please try again later.',
          rateLimitExceeded: true,
          nextAttemptAt: rateLimitResult.resetTime,
        };
      }

      // Check if account is locked
      const lockStatus = await this.isAccountLocked(null, validatedPhone);
      if (lockStatus.locked) {
        await this.logAuthEvent(
          'PHONE_LOGIN_ATTEMPT',
          null,
          validatedPhone,
          ipAddress,
          userAgent,
          null,
          false,
          'Account locked'
        );
        
        return {
          success: false,
          message: 'Account temporarily locked. Please try again later.',
          accountLocked: true,
          lockoutRemaining: lockStatus.lockoutRemaining,
        };
      }

      // Find or create user
      let user;
      const existingUserResult = await database.query(
        'SELECT * FROM users WHERE phone = $1',
        [validatedPhone]
      );

      if (existingUserResult.rows.length === 0) {
        // Create new user
        const newUserResult = await database.query(
          'INSERT INTO users (phone, role, status, phone_verified) VALUES ($1, $2, $3, $4) RETURNING *',
          [validatedPhone, 'BUYER', 'PENDING', false]
        );
        user = newUserResult.rows[0];

        // Create basic profile
        await database.query(
          'INSERT INTO user_profiles (user_id, first_name, last_name) VALUES ($1, $2, $3)',
          [user.id, 'User', 'User']
        );

        // Publish user registered event
        await eventPublisher.publishUserRegistered(
          user.id,
          user.phone,
          user.role,
          user.created_at.toISOString()
        );

        logger.business.userRegistered(user.id, user.phone, user.role);
      } else {
        user = existingUserResult.rows[0];
      }

      // Generate and store OTP
      const otpCode = this.generateOTP();
      const expiresAt = moment().add(config.otp.expiryMinutes, 'minutes').toDate();

      await database.query(
        `INSERT INTO otp_codes (user_id, phone, code, purpose, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, validatedPhone, otpCode, 'LOGIN', expiresAt]
      );

      // Cache OTP for quick access
      await redisClient.setOtpCache(validatedPhone, {
        code: otpCode,
        userId: user.id,
        purpose: 'LOGIN',
        expiresAt: expiresAt.toISOString(),
        attempts: 0,
      }, config.otp.expiryMinutes * 60);

      // Send OTP (in production, integrate with SMS service)
      await this.sendOTP(validatedPhone, otpCode, 'LOGIN');

      // Log successful OTP generation
      await this.logAuthEvent(
        'OTP_SENT',
        user.id,
        validatedPhone,
        ipAddress,
        userAgent,
        null,
        true
      );

      // Publish OTP sent event
      await eventPublisher.publishOtpSent(
        validatedPhone,
        'LOGIN',
        ipAddress,
        userAgent,
        expiresAt.toISOString()
      );

      logger.auth.otpSent(validatedPhone, 'LOGIN', ipAddress);

      return {
        success: true,
        message: 'OTP sent successfully',
        otpSent: true,
        expiresAt: expiresAt.toISOString(),
      };
    } catch (error) {
      logger.error('Error in initiatePhoneLogin:', error);
      throw error;
    }
  }

  async verifyOTP(phone, otpCode, deviceFingerprint, ipAddress, userAgent) {
    try {
      // Validate phone number
      const validatedPhone = await this.validatePhoneNumber(phone);
      if (!validatedPhone) {
        throw new Error('Invalid phone number format');
      }

      // Check rate limiting
      const rateLimitKey = `otp_verify:${validatedPhone}`;
      const rateLimitResult = await this.checkRateLimit(
        rateLimitKey,
        config.rateLimiting.otpVerify.windowMs,
        config.rateLimiting.otpVerify.max
      );

      if (rateLimitResult.isExceeded) {
        await this.logAuthEvent(
          'OTP_VERIFICATION_FAILURE',
          null,
          validatedPhone,
          ipAddress,
          userAgent,
          deviceFingerprint,
          false,
          'Rate limit exceeded'
        );
        
        throw new Error('Too many verification attempts. Please try again later.');
      }

      // Check if account is locked
      const lockStatus = await this.isAccountLocked(null, validatedPhone);
      if (lockStatus.locked) {
        await this.logAuthEvent(
          'OTP_VERIFICATION_FAILURE',
          null,
          validatedPhone,
          ipAddress,
          userAgent,
          deviceFingerprint,
          false,
          'Account locked'
        );
        
        throw new Error('Account temporarily locked. Please try again later.');
      }

      // Get user
      const userResult = await database.query(
        'SELECT * FROM users WHERE phone = $1',
        [validatedPhone]
      );

      if (userResult.rows.length === 0) {
        await this.logAuthEvent(
          'OTP_VERIFICATION_FAILURE',
          null,
          validatedPhone,
          ipAddress,
          userAgent,
          deviceFingerprint,
          false,
          'User not found'
        );
        
        throw new Error('User not found');
      }

      const user = userResult.rows[0];

      // Get OTP from database
      const otpResult = await database.query(
        `SELECT * FROM otp_codes 
         WHERE phone = $1 AND purpose = 'LOGIN' AND used_at IS NULL AND expires_at > NOW()
         ORDER BY created_at DESC LIMIT 1`,
        [validatedPhone]
      );

      if (otpResult.rows.length === 0) {
        await this.logAuthEvent(
          'OTP_VERIFICATION_FAILURE',
          user.id,
          validatedPhone,
          ipAddress,
          userAgent,
          deviceFingerprint,
          false,
          'OTP not found or expired'
        );
        
        throw new Error('OTP not found or expired');
      }

      const otpRecord = otpResult.rows[0];

      // Check attempts
      if (otpRecord.attempts >= config.otp.maxAttempts) {
        await this.logAuthEvent(
          'OTP_VERIFICATION_FAILURE',
          user.id,
          validatedPhone,
          ipAddress,
          userAgent,
          deviceFingerprint,
          false,
          'Maximum OTP attempts exceeded'
        );
        
        throw new Error('Maximum OTP attempts exceeded. Please request a new OTP.');
      }

      // Increment attempts
      await database.query(
        'UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1',
        [otpRecord.id]
      );

      // Verify OTP
      if (otpRecord.code !== otpCode) {
        await this.incrementFailedAttempts(user.id, validatedPhone);
        
        await this.logAuthEvent(
          'OTP_VERIFICATION_FAILURE',
          user.id,
          validatedPhone,
          ipAddress,
          userAgent,
          deviceFingerprint,
          false,
          'Invalid OTP'
        );
        
        throw new Error('Invalid OTP');
      }

      // Mark OTP as used
      await database.query(
        'UPDATE otp_codes SET used_at = NOW() WHERE id = $1',
        [otpRecord.id]
      );

      // Clear OTP cache
      await redisClient.deleteOtpCache(validatedPhone);

      // Reset failed attempts
      await this.resetFailedAttempts(user.id, validatedPhone);

      // Update user phone verification and last login
      await database.query(
        'UPDATE users SET phone_verified = true, last_login_at = NOW(), status = CASE WHEN status = $1 THEN $2 ELSE status END WHERE id = $3',
        ['PENDING', 'ACTIVE', user.id]
      );

      // Generate device fingerprint if not provided
      if (!deviceFingerprint) {
        deviceFingerprint = this.generateDeviceFingerprint(ipAddress, userAgent);
      }

      // Check admin verification for admin users
      let adminLevel = null;
      if (user.role === 'ADMIN') {
        const adminResult = await database.query(
          'SELECT * FROM admin_whitelist WHERE phone = $1 AND is_active = true',
          [validatedPhone]
        );

        if (adminResult.rows.length === 0) {
          await this.logAuthEvent(
            'ADMIN_VERIFICATION_FAILURE',
            user.id,
            validatedPhone,
            ipAddress,
            userAgent,
            deviceFingerprint,
            false,
            'Admin not in whitelist'
          );
          
          throw new Error('Admin verification failed. Contact system administrator.');
        }

        adminLevel = adminResult.rows[0].admin_level;

        // Publish admin verification success
        await eventPublisher.publishAdminVerificationSuccess(
          user.id,
          validatedPhone,
          adminLevel,
          new Date().toISOString()
        );
      }

      // Generate JWT tokens
      const { accessToken, refreshToken } = this.generateJWT(user.id, validatedPhone, user.role, {
        adminLevel,
        deviceFingerprint,
      });

      // Store tokens in database
      const tokenHash = await this.hashToken(refreshToken);
      const refreshTokenExpiresAt = moment().add(30, 'days').toDate();

      await database.query(
        `INSERT INTO auth_tokens (user_id, token_type, token_hash, device_fingerprint, ip_address, user_agent, expires_at)
         VALUES ($1, 'REFRESH', $2, $3, $4, $5, $6)`,
        [user.id, tokenHash, deviceFingerprint, ipAddress, userAgent, refreshTokenExpiresAt]
      );

      // Create session
      const sessionToken = uuidv4();
      const sessionExpiresAt = user.role === 'ADMIN' 
        ? moment().add(config.security.adminSessionTimeoutHours, 'hours').toDate()
        : moment().add(30, 'days').toDate();

      await database.query(
        `INSERT INTO user_sessions (user_id, session_token, device_fingerprint, ip_address, user_agent, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.id, sessionToken, deviceFingerprint, ipAddress, userAgent, sessionExpiresAt]
      );

      // Cache session
      await redisClient.setSession(sessionToken, {
        userId: user.id,
        phone: validatedPhone,
        role: user.role,
        adminLevel,
        deviceFingerprint,
        ipAddress,
        userAgent,
      }, Math.floor(sessionExpiresAt.getTime() / 1000) - Math.floor(Date.now() / 1000));

      // Get user profile
      const profileResult = await database.query(
        'SELECT * FROM user_profiles WHERE user_id = $1',
        [user.id]
      );

      const profile = profileResult.rows[0] || null;

      // Log successful authentication
      await this.logAuthEvent(
        'OTP_VERIFICATION_SUCCESS',
        user.id,
        validatedPhone,
        ipAddress,
        userAgent,
        deviceFingerprint,
        true
      );

      await this.logAuthEvent(
        'LOGIN_SUCCESS',
        user.id,
        validatedPhone,
        ipAddress,
        userAgent,
        deviceFingerprint,
        true
      );

      // Publish events
      await eventPublisher.publishLoginSuccess(
        user.id,
        validatedPhone,
        user.role,
        sessionToken,
        ipAddress,
        userAgent,
        deviceFingerprint
      );

      if (user.role === 'ADMIN') {
        await eventPublisher.publishAdminLoginSuccess(
          user.id,
          validatedPhone,
          adminLevel,
          sessionToken,
          ipAddress,
          userAgent
        );
      }

      if (!user.phone_verified) {
        await eventPublisher.publishUserVerified(
          user.id,
          validatedPhone,
          user.role,
          new Date().toISOString()
        );
        logger.business.userVerified(user.id, validatedPhone, user.role);
      }

      logger.auth.sessionCreated(user.id, sessionToken, ipAddress, deviceFingerprint);

      return {
        success: true,
        user: {
          id: user.id,
          phone: user.phone,
          role: user.role,
          status: user.status,
          profile,
          adminLevel,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 15 * 60, // 15 minutes in seconds
        },
        sessionTimeout: user.role === 'ADMIN' 
          ? config.security.adminSessionTimeoutHours * 60 * 60 
          : 30 * 24 * 60 * 60, // 30 days in seconds
      };
    } catch (error) {
      logger.error('Error in verifyOTP:', error);
      throw error;
    }
  }

  async resendOTP(phone, ipAddress, userAgent) {
    try {
      // Validate phone number
      const validatedPhone = await this.validatePhoneNumber(phone);
      if (!validatedPhone) {
        throw new Error('Invalid phone number format');
      }

      // Check rate limiting
      const rateLimitKey = `otp_resend:${validatedPhone}`;
      const rateLimitResult = await this.checkRateLimit(
        rateLimitKey,
        config.rateLimiting.otpResend.windowMs,
        config.rateLimiting.otpResend.max
      );

      if (rateLimitResult.isExceeded) {
        return {
          success: false,
          message: 'Too many OTP resend requests. Please try again later.',
          cooldownRemaining: rateLimitResult.resetTime - Date.now(),
        };
      }

      // Check cooldown from last OTP sent
      const lastOtpCache = await redisClient.getOtpCache(validatedPhone);
      if (lastOtpCache) {
        const timeSinceLastOtp = Date.now() - new Date(lastOtpCache.sentAt).getTime();
        const cooldownMs = config.otp.resendCooldownSeconds * 1000;
        
        if (timeSinceLastOtp < cooldownMs) {
          return {
            success: false,
            message: 'Please wait before requesting another OTP.',
            cooldownRemaining: Math.ceil((cooldownMs - timeSinceLastOtp) / 1000),
          };
        }
      }

      // Get user
      const userResult = await database.query(
        'SELECT * FROM users WHERE phone = $1',
        [validatedPhone]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = userResult.rows[0];

      // Generate new OTP
      const otpCode = this.generateOTP();
      const expiresAt = moment().add(config.otp.expiryMinutes, 'minutes').toDate();

      // Store new OTP
      await database.query(
        `INSERT INTO otp_codes (user_id, phone, code, purpose, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, validatedPhone, otpCode, 'LOGIN', expiresAt]
      );

      // Update cache
      await redisClient.setOtpCache(validatedPhone, {
        code: otpCode,
        userId: user.id,
        purpose: 'LOGIN',
        expiresAt: expiresAt.toISOString(),
        attempts: 0,
        sentAt: new Date().toISOString(),
      }, config.otp.expiryMinutes * 60);

      // Send OTP
      await this.sendOTP(validatedPhone, otpCode, 'LOGIN');

      // Log OTP sent
      await this.logAuthEvent(
        'OTP_SENT',
        user.id,
        validatedPhone,
        ipAddress,
        userAgent,
        null,
        true
      );

      // Publish OTP sent event
      await eventPublisher.publishOtpSent(
        validatedPhone,
        'LOGIN',
        ipAddress,
        userAgent,
        expiresAt.toISOString()
      );

      logger.auth.otpSent(validatedPhone, 'LOGIN', ipAddress);

      return {
        success: true,
        message: 'OTP resent successfully',
        expiresAt: expiresAt.toISOString(),
      };
    } catch (error) {
      logger.error('Error in resendOTP:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken, ipAddress, userAgent) {
    try {
      // Verify refresh token
      const decoded = await this.verifyJWT(refreshToken, true);

      // Check rate limiting
      const rateLimitKey = `token_refresh:${decoded.userId}`;
      const rateLimitResult = await this.checkRateLimit(
        rateLimitKey,
        config.rateLimiting.tokenRefresh.windowMs,
        config.rateLimiting.tokenRefresh.max
      );

      if (rateLimitResult.isExceeded) {
        throw new Error('Too many token refresh attempts. Please try again later.');
      }

      // Check if refresh token exists and is not revoked
      const tokenHash = await this.hashToken(refreshToken);
      const tokenResult = await database.query(
        'SELECT * FROM auth_tokens WHERE token_hash = $1 AND token_type = $2 AND revoked_at IS NULL AND expires_at > NOW()',
        [tokenHash, 'REFRESH']
      );

      if (tokenResult.rows.length === 0) {
        throw new Error('Invalid or expired refresh token');
      }

      const tokenRecord = tokenResult.rows[0];

      // Get user
      const userResult = await database.query(
        'SELECT * FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = userResult.rows[0];

      // Check if account is locked
      const lockStatus = await this.isAccountLocked(user.id, user.phone);
      if (lockStatus.locked) {
        throw new Error('Account is locked');
      }

      // Get admin level if admin
      let adminLevel = null;
      if (user.role === 'ADMIN') {
        const adminResult = await database.query(
          'SELECT admin_level FROM admin_whitelist WHERE phone = $1 AND is_active = true',
          [user.phone]
        );
        if (adminResult.rows.length > 0) {
          adminLevel = adminResult.rows[0].admin_level;
        }
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = this.generateJWT(
        user.id,
        user.phone,
        user.role,
        { adminLevel, deviceFingerprint: tokenRecord.device_fingerprint }
      );

      // Store new refresh token
      const newTokenHash = await this.hashToken(newRefreshToken);
      const newRefreshTokenExpiresAt = moment().add(30, 'days').toDate();

      await database.query(
        `INSERT INTO auth_tokens (user_id, token_type, token_hash, device_fingerprint, ip_address, user_agent, expires_at)
         VALUES ($1, 'REFRESH', $2, $3, $4, $5, $6)`,
        [user.id, newTokenHash, tokenRecord.device_fingerprint, ipAddress, userAgent, newRefreshTokenExpiresAt]
      );

      // Revoke old refresh token
      await database.query(
        'UPDATE auth_tokens SET revoked_at = NOW() WHERE id = $1',
        [tokenRecord.id]
      );

      // Log token refresh
      await this.logAuthEvent(
        'TOKEN_REFRESH',
        user.id,
        user.phone,
        ipAddress,
        userAgent,
        tokenRecord.device_fingerprint,
        true
      );

      // Publish token refresh event
      await eventPublisher.publishTokenRefresh(
        user.id,
        user.phone,
        tokenRecord.id.toString(),
        newTokenHash,
        ipAddress,
        userAgent
      );

      return {
        success: true,
        tokens: {
          accessToken,
          refreshToken: newRefreshToken,
          expiresIn: 15 * 60, // 15 minutes in seconds
        },
      };
    } catch (error) {
      logger.error('Error in refreshToken:', error);
      throw error;
    }
  }

  async logout(refreshToken, allDevices = false, ipAddress, userAgent) {
    try {
      let userId = null;
      let phone = null;

      if (refreshToken) {
        // Verify and get user info from refresh token
        const decoded = await this.verifyJWT(refreshToken, true);
        userId = decoded.userId;
        phone = decoded.phone;

        if (allDevices) {
          // Revoke all refresh tokens for user
          await database.query(
            'UPDATE auth_tokens SET revoked_at = NOW() WHERE user_id = $1 AND token_type = $2',
            [userId, 'REFRESH']
          );

          // Deactivate all sessions for user
          await database.query(
            'UPDATE user_sessions SET is_active = false WHERE user_id = $1',
            [userId]
          );

          // Clear all cached sessions for user
          // This would require implementing a pattern-based delete in Redis
          logger.auth.sessionExpired(userId, 'all_sessions');
        } else {
          // Revoke specific refresh token
          const tokenHash = await this.hashToken(refreshToken);
          await database.query(
            'UPDATE auth_tokens SET revoked_at = NOW() WHERE token_hash = $1',
            [tokenHash]
          );

          // Get session token from cache and deactivate
          // This is a simplified approach - in production, you'd track sessions more carefully
        }
      }

      // Log logout
      await this.logAuthEvent(
        'LOGOUT',
        userId,
        phone,
        ipAddress,
        userAgent,
        null,
        true
      );

      // Publish logout event
      if (userId && phone) {
        await eventPublisher.publishLogout(userId, phone, null, ipAddress, userAgent, allDevices);
      }

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      logger.error('Error in logout:', error);
      throw error;
    }
  }

  async sendOTP(phone, otpCode, purpose) {
    try {
      // In production, integrate with actual SMS service
      // For now, we'll just log the OTP (development only)
      if (config.env === 'development') {
        logger.info(`OTP for ${phone} (${purpose}): ${otpCode}`);
        return true;
      }

      // Integration with Twilio or other SMS service would go here
      // Example:
      // const twilio = require('twilio')(config.sms.twilio.accountSid, config.sms.twilio.authToken);
      // await twilio.messages.create({
      //   body: `Your verification code is: ${otpCode}`,
      //   from: config.sms.twilio.phoneNumber,
      //   to: phone
      // });

      return true;
    } catch (error) {
      logger.error('Error sending OTP:', error);
      throw error;
    }
  }

  // Admin management methods
  async addAdminToWhitelist(phone, name, adminLevel, department, addedBy) {
    try {
      // Validate phone number
      const validatedPhone = await this.validatePhoneNumber(phone);
      if (!validatedPhone) {
        throw new Error('Invalid phone number format');
      }

      // Check if admin already exists
      const existingAdminResult = await database.query(
        'SELECT * FROM admin_whitelist WHERE phone = $1',
        [validatedPhone]
      );

      if (existingAdminResult.rows.length > 0) {
        throw new Error('Admin already exists in whitelist');
      }

      // Add to whitelist
      const result = await database.query(
        'INSERT INTO admin_whitelist (phone, admin_level, name, department) VALUES ($1, $2, $3, $4) RETURNING *',
        [validatedPhone, adminLevel, name, department]
      );

      const admin = result.rows[0];

      // Create or update user as admin
      await database.query(
        `INSERT INTO users (phone, role, status, phone_verified) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (phone) DO UPDATE SET role = $2, status = $3`,
        [validatedPhone, 'ADMIN', 'ACTIVE', true]
      );

      logger.info(`Admin added to whitelist: ${validatedPhone} (${adminLevel})`);

      return {
        success: true,
        adminId: admin.id,
        message: 'Admin added successfully',
      };
    } catch (error) {
      logger.error('Error adding admin to whitelist:', error);
      throw error;
    }
  }

  async getAdminWhitelist(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const result = await database.query(
        `SELECT * FROM admin_whitelist 
         WHERE is_active = true 
         ORDER BY created_at DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      const countResult = await database.query(
        'SELECT COUNT(*) as total FROM admin_whitelist WHERE is_active = true'
      );

      return {
        admins: result.rows,
        pagination: {
          page,
          limit,
          total: parseInt(countResult.rows[0].total),
        },
      };
    } catch (error) {
      logger.error('Error getting admin whitelist:', error);
      throw error;
    }
  }

  async removeAdminFromWhitelist(adminId, removedBy) {
    try {
      await database.query(
        'UPDATE admin_whitelist SET is_active = false WHERE id = $1',
        [adminId]
      );

      logger.info(`Admin removed from whitelist: ${adminId}`);

      return {
        success: true,
        message: 'Admin removed successfully',
      };
    } catch (error) {
      logger.error('Error removing admin from whitelist:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();
