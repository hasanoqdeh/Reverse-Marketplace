'use strict';

require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3001,

  database: {
    url: process.env.DATABASE_URL || null,
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'reverse_marketplace',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    url: process.env.REDIS_URL || null,
    ttl: {
      // identity
      session: 1800,      // 30 min
      otp: 600,           // 10 min
      rateLimit: 300,     // 5 min
      userCache: 300,     // 5 min
      // requests
      requestCache: 300,    // 5 min
      searchCache: 120,     // 2 min
      categoryCache: 3600,  // 1 hour
      draftCache: 86400,    // 24 hours
    },
  },

  rabbitmq: {
    host: process.env.RABBITMQ_HOST || 'localhost',
    port: parseInt(process.env.RABBITMQ_PORT, 10) || 5672,
    user: process.env.RABBITMQ_USER || 'admin',
    password: process.env.RABBITMQ_PASSWORD || 'password',
    url: process.env.RABBITMQ_URL || null,
    exchange: 'reverse-marketplace',
    queues: {
      userEvents: 'user.events',
      requestEvents: 'request.events',
    },
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-jwt-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '30d',
  },

  otp: {
    length: parseInt(process.env.OTP_LENGTH, 10) || 6,
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 10,
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 3,
    resendCooldownSeconds: parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS, 10) || 60,
    // Per-phone rate limit: 3 per 5 minutes
    phoneRateLimitCount: 3,
    phoneRateLimitWindowMinutes: 5,
  },

  sms: {
    provider: process.env.SMS_PROVIDER || 'console', // 'twilio' | 'console'
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
    },
  },

  security: {
    maxFailedAttempts: parseInt(process.env.MAX_FAILED_ATTEMPTS, 10) || 5,
    lockoutDurationMinutes: parseInt(process.env.LOCKOUT_DURATION_MINUTES, 10) || 30,
    maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS, 10) || 5,
    adminSessionTimeoutHours: parseInt(process.env.ADMIN_SESSION_TIMEOUT_HOURS, 10) || 8,
    deviceFingerprintEnabled: process.env.DEVICE_FINGERPRINT_ENABLED === 'true',
    deviceFingerprintSalt: process.env.DEVICE_FINGERPRINT_SALT || 'default_salt',
  },

  upload: {
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10,
    maxImagesPerRequest: parseInt(process.env.MAX_IMAGES_PER_REQUEST, 10) || 10,
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },

  request: {
    defaultExpiryHours: parseInt(process.env.DEFAULT_REQUEST_EXPIRY_HOURS, 10) || 72,
    maxExtensionHours: parseInt(process.env.MAX_EXTENSION_HOURS, 10) || 48,
    draftExpiryDays: 7,
    expiryNotificationHours: [24, 6, 1],
  },

  rateLimits: {
    phoneLogin: parseInt(process.env.RATE_LIMIT_PHONE_LOGIN, 10) || 5,        // per minute per IP
    otpVerify: parseInt(process.env.RATE_LIMIT_OTP_VERIFY, 10) || 10,         // per minute per phone
    otpResend: parseInt(process.env.RATE_LIMIT_OTP_RESEND, 10) || 3,          // per 5 min per phone
    tokenRefresh: parseInt(process.env.RATE_LIMIT_TOKEN_REFRESH, 10) || 20,   // per hour per user
    adminAccess: parseInt(process.env.RATE_LIMIT_ADMIN_ACCESS, 10) || 10,     // per minute per admin
    createRequest: parseInt(process.env.RATE_LIMIT_CREATE_REQUEST, 10) || 10,
    uploadImage: parseInt(process.env.RATE_LIMIT_UPLOAD_IMAGE, 10) || 20,
    search: parseInt(process.env.RATE_LIMIT_SEARCH, 10) || 100,
    global: 1000,                                                               // per minute
    useRedis: process.env.USE_REDIS_RATE_LIMITING === 'true',
  },

  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Fingerprint', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 204,
  },

  cleanup: {
    intervalMinutes: parseInt(process.env.CLEANUP_INTERVAL_MINUTES, 10) || 60,
    auditLogRetentionDays: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS, 10) || 90,
    expiredRequestCleanupDays: parseInt(process.env.EXPIRED_REQUEST_CLEANUP_DAYS, 10) || 30,
  },

  /**
   * Validates required configuration values and warns about insecure defaults.
   */
  validate() {
    const errors = [];

    if (!process.env.JWT_SECRET) {
      if (this.env === 'production') {
        errors.push('JWT_SECRET must be set in production');
      } else {
        console.warn('[CONFIG] WARNING: JWT_SECRET not set — using insecure fallback (dev only)');
      }
    }

    if (!process.env.JWT_REFRESH_SECRET) {
      if (this.env === 'production') {
        errors.push('JWT_REFRESH_SECRET must be set in production');
      } else {
        console.warn('[CONFIG] WARNING: JWT_REFRESH_SECRET not set — using insecure fallback (dev only)');
      }
    }

    if (!process.env.DATABASE_URL) {
      if (this.env === 'production') {
        errors.push('DATABASE_URL must be set in production');
      } else {
        console.warn('[CONFIG] WARNING: DATABASE_URL not set — using default connection params');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }
  },
};

module.exports = config;
