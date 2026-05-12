const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3001,
  logLevel: process.env.LOG_LEVEL || 'info',

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    name: process.env.DATABASE_NAME || 'reverse_marketplace_auth',
    user: process.env.DATABASE_USER || 'auth_service_user',
    password: process.env.DATABASE_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20, // maximum number of clients in the pool
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 2000, // how long to wait when connecting a new client
  },

  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: 0,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
  },

  // RabbitMQ Configuration
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    host: process.env.RABBITMQ_HOST || 'localhost',
    port: parseInt(process.env.RABBITMQ_PORT, 10) || 5672,
    user: process.env.RABBITMQ_USER || 'guest',
    password: process.env.RABBITMQ_PASSWORD || 'guest',
    exchanges: {
      auth: 'auth.events',
      user: 'user.events',
      notification: 'notification.events',
    },
    queues: {
      authEvents: 'auth.events.queue',
      userEvents: 'user.events.queue',
      notificationEvents: 'notification.events.queue',
    },
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '30d',
    algorithm: 'HS256',
    issuer: 'reverse-marketplace-auth',
    audience: 'reverse-marketplace',
  },

  // OTP Configuration
  otp: {
    length: parseInt(process.env.OTP_LENGTH, 10) || 6,
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 10,
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 3,
    resendCooldownSeconds: parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS, 10) || 60,
    characters: '0123456789', // Numeric only
    caseSensitive: false,
  },

  // SMS Service Configuration
  sms: {
    provider: process.env.SMS_PROVIDER || 'twilio',
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    },
    // Add other SMS providers here if needed
  },

  // Rate Limiting Configuration
  rateLimiting: {
    phoneLogin: {
      windowMs: 60 * 1000, // 1 minute
      max: parseInt(process.env.RATE_LIMIT_PHONE_LOGIN, 10) || 5,
      message: 'Too many phone login attempts, please try again later.',
    },
    otpVerify: {
      windowMs: 60 * 1000, // 1 minute
      max: parseInt(process.env.RATE_LIMIT_OTP_VERIFY, 10) || 10,
      message: 'Too many OTP verification attempts, please try again later.',
    },
    otpResend: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: parseInt(process.env.RATE_LIMIT_OTP_RESEND, 10) || 3,
      message: 'Too many OTP resend requests, please try again later.',
    },
    tokenRefresh: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: parseInt(process.env.RATE_LIMIT_TOKEN_REFRESH, 10) || 20,
      message: 'Too many token refresh attempts, please try again later.',
    },
    adminAccess: {
      windowMs: 60 * 1000, // 1 minute
      max: parseInt(process.env.RATE_LIMIT_ADMIN_ACCESS, 10) || 10,
      message: 'Too many admin access attempts, please try again later.',
    },
  },

  // Security Configuration
  security: {
    maxFailedAttempts: parseInt(process.env.MAX_FAILED_ATTEMPTS, 10) || 5,
    lockoutDurationMinutes: parseInt(process.env.LOCKOUT_DURATION_MINUTES, 10) || 30,
    maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS, 10) || 5,
    adminSessionTimeoutHours: parseInt(process.env.ADMIN_SESSION_TIMEOUT_HOURS, 10) || 8,
    progressiveLockout: true, // 30min, 1hr, 4hr, 24hr
    deviceTracking: {
      enabled: process.env.DEVICE_FINGERPRINT_ENABLED === 'true',
      maxDevicesPerUser: 5,
      salt: process.env.DEVICE_FINGERPRINT_SALT || 'default_salt',
    },
    ipSecurity: {
      maxConcurrentIps: 3,
      ipWhitelistForAdmin: true,
      geoAnomalyDetection: true,
    },
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Fingerprint'],
  },

  // Monitoring Configuration
  monitoring: {
    enabled: process.env.ENABLE_METRICS === 'true',
    port: parseInt(process.env.METRICS_PORT, 10) || 9090,
  },

  // Session Cleanup Configuration
  cleanup: {
    intervalMinutes: parseInt(process.env.CLEANUP_INTERVAL_MINUTES, 10) || 60,
    auditLogRetentionDays: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS, 10) || 90,
  },

  // Validation
  validate: () => {
    const required = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'DATABASE_URL',
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Validate JWT secrets are at least 32 characters
    if (process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }
    
    if (process.env.JWT_REFRESH_SECRET.length < 32) {
      throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
    }

    return true;
  },
};

module.exports = config;
