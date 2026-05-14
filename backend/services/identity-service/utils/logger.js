const winston = require('winston');
const config = require('../config');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: config.logLevel,
  levels,
  format,
  transports,
  exitOnError: false,
});

// Add request context helper
logger.withContext = (context) => {
  return {
    error: (message, meta = {}) => logger.error(message, { ...context, ...meta }),
    warn: (message, meta = {}) => logger.warn(message, { ...context, ...meta }),
    info: (message, meta = {}) => logger.info(message, { ...context, ...meta }),
    http: (message, meta = {}) => logger.http(message, { ...context, ...meta }),
    debug: (message, meta = {}) => logger.debug(message, { ...context, ...meta }),
  };
};

// Add authentication-specific logging helpers
logger.auth = {
  loginAttempt: (phone, ip, userAgent, success, failureReason = null) => {
    logger.info('Login attempt', {
      event: 'LOGIN_ATTEMPT',
      phone,
      ip,
      userAgent,
      success,
      failureReason,
      timestamp: new Date().toISOString(),
    });
  },
  
  otpSent: (phone, purpose, ip) => {
    logger.info('OTP sent', {
      event: 'OTP_SENT',
      phone,
      purpose,
      ip,
      timestamp: new Date().toISOString(),
    });
  },
  
  otpVerified: (phone, purpose, success, attempts) => {
    logger.info('OTP verification', {
      event: 'OTP_VERIFICATION',
      phone,
      purpose,
      success,
      attempts,
      timestamp: new Date().toISOString(),
    });
  },
  
  sessionCreated: (userId, sessionId, ip, deviceFingerprint) => {
    logger.info('Session created', {
      event: 'SESSION_CREATED',
      userId,
      sessionId,
      ip,
      deviceFingerprint,
      timestamp: new Date().toISOString(),
    });
  },
  
  sessionExpired: (userId, sessionId) => {
    logger.info('Session expired', {
      event: 'SESSION_EXPIRED',
      userId,
      sessionId,
      timestamp: new Date().toISOString(),
    });
  },
  
  accountLocked: (userId, phone, lockoutDuration, reason) => {
    logger.warn('Account locked', {
      event: 'ACCOUNT_LOCKED',
      userId,
      phone,
      lockoutDuration,
      reason,
      timestamp: new Date().toISOString(),
    });
  },
  
  accountUnlocked: (userId, phone) => {
    logger.info('Account unlocked', {
      event: 'ACCOUNT_UNLOCKED',
      userId,
      phone,
      timestamp: new Date().toISOString(),
    });
  },
  
  securityEvent: (event, userId, phone, details) => {
    logger.warn('Security event', {
      event,
      userId,
      phone,
      details,
      timestamp: new Date().toISOString(),
    });
  },
};

// Add performance logging helpers
logger.performance = {
  slowQuery: (query, duration, parameters) => {
    logger.warn('Slow database query detected', {
      event: 'SLOW_QUERY',
      query,
      duration,
      parameters,
      threshold: 1000, // 1 second
      timestamp: new Date().toISOString(),
    });
  },
  
  rateLimitExceeded: (key, limit, windowMs) => {
    logger.warn('Rate limit exceeded', {
      event: 'RATE_LIMIT_EXCEEDED',
      key,
      limit,
      windowMs,
      timestamp: new Date().toISOString(),
    });
  },
  
  highMemoryUsage: (usage, threshold) => {
    logger.warn('High memory usage detected', {
      event: 'HIGH_MEMORY_USAGE',
      usage,
      threshold,
      timestamp: new Date().toISOString(),
    });
  },
};

// Add business logic logging helpers
logger.business = {
  userRegistered: (userId, phone, role) => {
    logger.info('User registered', {
      event: 'USER_REGISTERED',
      userId,
      phone,
      role,
      timestamp: new Date().toISOString(),
    });
  },
  
  userVerified: (userId, phone, role) => {
    logger.info('User verified', {
      event: 'USER_VERIFIED',
      userId,
      phone,
      role,
      timestamp: new Date().toISOString(),
    });
  },
  
  merchantVerified: (userId, phone, businessName) => {
    logger.info('Merchant verified', {
      event: 'MERCHANT_VERIFIED',
      userId,
      phone,
      businessName,
      timestamp: new Date().toISOString(),
    });
  },
  
  adminLogin: (userId, phone, adminLevel) => {
    logger.info('Admin login', {
      event: 'ADMIN_LOGIN',
      userId,
      phone,
      adminLevel,
      timestamp: new Date().toISOString(),
    });
  },
};

// Add system logging helpers
logger.system = {
  serviceStarted: (port, env) => {
    logger.info('Authentication service started', {
      event: 'SERVICE_STARTED',
      port,
      env,
      timestamp: new Date().toISOString(),
    });
  },
  
  serviceStopped: () => {
    logger.info('Authentication service stopped', {
      event: 'SERVICE_STOPPED',
      timestamp: new Date().toISOString(),
    });
  },
  
  databaseConnected: (host, port, database) => {
    logger.info('Database connected', {
      event: 'DATABASE_CONNECTED',
      host,
      port,
      database,
      timestamp: new Date().toISOString(),
    });
  },
  
  databaseDisconnected: () => {
    logger.info('Database disconnected', {
      event: 'DATABASE_DISCONNECTED',
      timestamp: new Date().toISOString(),
    });
  },
  
  redisConnected: (host, port) => {
    logger.info('Redis connected', {
      event: 'REDIS_CONNECTED',
      host,
      port,
      timestamp: new Date().toISOString(),
    });
  },
  
  redisDisconnected: () => {
    logger.info('Redis disconnected', {
      event: 'REDIS_DISCONNECTED',
      timestamp: new Date().toISOString(),
    });
  },
  
  rabbitmqConnected: (host, port) => {
    logger.info('RabbitMQ connected', {
      event: 'RABBITMQ_CONNECTED',
      host,
      port,
      timestamp: new Date().toISOString(),
    });
  },
  
  rabbitmqDisconnected: () => {
    logger.info('RabbitMQ disconnected', {
      event: 'RABBITMQ_DISCONNECTED',
      timestamp: new Date().toISOString(),
    });
  },
};

// Create logs directory if it doesn't exist
const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

module.exports = logger;
