const rateLimit = require('express-rate-limit');
const config = require('../config');
const logger = require('../utils/logger');

// Custom rate limiter that uses Redis for distributed rate limiting
const createRateLimit = (options) => {
  const {
    windowMs,
    max,
    message,
    keyGenerator,
    skipSuccessfulRequests,
    skipFailedRequests,
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later.',
      rateLimitExceeded: true,
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    skipSuccessfulRequests: skipSuccessfulRequests || false,
    skipFailedRequests: skipFailedRequests || false,
    handler: (req, res) => {
      logger.performance.rateLimitExceeded(
        req.rateLimit.key,
        max,
        windowMs
      );

      res.status(429).json({
        success: false,
        message: message || 'Too many requests, please try again later.',
        rateLimitExceeded: true,
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
  });
};

// Phone login rate limiting
const phoneLoginRateLimit = createRateLimit({
  windowMs: config.rateLimiting.phoneLogin.windowMs,
  max: config.rateLimiting.phoneLogin.max,
  message: config.rateLimiting.phoneLogin.message,
  keyGenerator: (req) => {
    const phone = req.body?.phone || 'unknown';
    const ip = req.clientIP || 'unknown';
    return `phone_login:${phone}:${ip}`;
  },
});

// OTP verification rate limiting
const otpVerificationRateLimit = createRateLimit({
  windowMs: config.rateLimiting.otpVerify.windowMs,
  max: config.rateLimiting.otpVerify.max,
  message: config.rateLimiting.otpVerify.message,
  keyGenerator: (req) => {
    const phone = req.body?.phone || 'unknown';
    return `otp_verify:${phone}`;
  },
});

// OTP resend rate limiting
const otpResendRateLimit = createRateLimit({
  windowMs: config.rateLimiting.otpResend.windowMs,
  max: config.rateLimiting.otpResend.max,
  message: config.rateLimiting.otpResend.message,
  keyGenerator: (req) => {
    const phone = req.body?.phone || 'unknown';
    return `otp_resend:${phone}`;
  },
});

// Token refresh rate limiting
const tokenRefreshRateLimit = createRateLimit({
  windowMs: config.rateLimiting.tokenRefresh.windowMs,
  max: config.rateLimiting.tokenRefresh.max,
  message: config.rateLimiting.tokenRefresh.message,
  keyGenerator: (req) => {
    // Extract user ID from refresh token if possible
    const token = req.body?.refreshToken;
    if (token) {
      try {
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        return `token_refresh:${decoded.userId}`;
      } catch (error) {
        // Fallback to IP if token parsing fails
        return `token_refresh:${req.clientIP}`;
      }
    }
    return `token_refresh:${req.clientIP}`;
  },
});

// Admin access rate limiting
const adminAccessRateLimit = createRateLimit({
  windowMs: config.rateLimiting.adminAccess.windowMs,
  max: config.rateLimiting.adminAccess.max,
  message: config.rateLimiting.adminAccess.message,
  keyGenerator: (req) => {
    const userId = req.user?.userId || 'unknown';
    return `admin_access:${userId}`;
  },
});

// Global rate limiting for all requests
const globalRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute
  message: 'Server overloaded, please try again later.',
  keyGenerator: (req) => {
    return `global:${req.clientIP}`;
  },
});

// API-specific rate limiting
const apiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: 'Too many API requests, please try again later.',
  keyGenerator: (req) => {
    return `api:${req.clientIP}`;
  },
});

// Advanced rate limiting with Redis for distributed environments
const createRedisRateLimit = (options) => {
  const redisClient = require('../cache/redis');
  const {
    windowMs,
    max,
    message,
    keyPrefix,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return async (req, res, next) => {
    try {
      const key = `${keyPrefix}:${options.keyGenerator(req)}`;
      
      const result = await redisClient.incrementRateLimit(key, windowMs, max);

      if (result.isExceeded) {
        logger.performance.rateLimitExceeded(key, max, windowMs);

        return res.status(429).json({
          success: false,
          message: message || 'Too many requests, please try again later.',
          rateLimitExceeded: true,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        });
      }

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': max,
        'X-RateLimit-Remaining': result.remaining,
        'X-RateLimit-Reset': result.resetTime,
      });

      // Store rate limit info for later use
      req.rateLimit = {
        key,
        current: result.current,
        remaining: result.remaining,
        resetTime: result.resetTime,
      };

      next();
    } catch (error) {
      logger.error('Redis rate limiting error:', error);
      // Continue without rate limiting if Redis fails
      next();
    }
  };
};

// Redis-based rate limiters
const redisPhoneLoginRateLimit = createRedisRateLimit({
  windowMs: config.rateLimiting.phoneLogin.windowMs,
  max: config.rateLimiting.phoneLogin.max,
  message: config.rateLimiting.phoneLogin.message,
  keyPrefix: 'phone_login',
  keyGenerator: (req) => {
    const phone = req.body?.phone || 'unknown';
    const ip = req.clientIP || 'unknown';
    return `${phone}:${ip}`;
  },
});

const redisOtpVerificationRateLimit = createRedisRateLimit({
  windowMs: config.rateLimiting.otpVerify.windowMs,
  max: config.rateLimiting.otpVerify.max,
  message: config.rateLimiting.otpVerify.message,
  keyPrefix: 'otp_verify',
  keyGenerator: (req) => {
    const phone = req.body?.phone || 'unknown';
    return phone;
  },
});

const redisOtpResendRateLimit = createRedisRateLimit({
  windowMs: config.rateLimiting.otpResend.windowMs,
  max: config.rateLimiting.otpResend.max,
  message: config.rateLimiting.otpResend.message,
  keyPrefix: 'otp_resend',
  keyGenerator: (req) => {
    const phone = req.body?.phone || 'unknown';
    return phone;
  },
});

const redisTokenRefreshRateLimit = createRedisRateLimit({
  windowMs: config.rateLimiting.tokenRefresh.windowMs,
  max: config.rateLimiting.tokenRefresh.max,
  message: config.rateLimiting.tokenRefresh.message,
  keyPrefix: 'token_refresh',
  keyGenerator: (req) => {
    const token = req.body?.refreshToken;
    if (token) {
      try {
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        return decoded.userId || req.clientIP;
      } catch (error) {
        return req.clientIP;
      }
    }
    return req.clientIP;
  },
});

const redisAdminAccessRateLimit = createRedisRateLimit({
  windowMs: config.rateLimiting.adminAccess.windowMs,
  max: config.rateLimiting.adminAccess.max,
  message: config.rateLimiting.adminAccess.message,
  keyPrefix: 'admin_access',
  keyGenerator: (req) => {
    const userId = req.user?.userId || 'unknown';
    return userId;
  },
});

// Adaptive rate limiting based on user behavior
const adaptiveRateLimit = (options) => {
  const {
    baseMax,
    baseWindowMs,
    multiplier = 1.5,
    maxMultiplier = 5,
    keyPrefix,
  } = options;

  return async (req, res, next) => {
    try {
      const redisClient = require('../cache/redis');
      const key = `${keyPrefix}:${options.keyGenerator(req)}`;
      
      // Check if user has recent failures
      const failureKey = `${key}:failures`;
      const failureCount = await redisClient.get(failureKey) || 0;
      
      // Calculate adjusted limit based on failure count
      const adjustedMultiplier = Math.min(multiplier ** Math.floor(failureCount), maxMultiplier);
      const adjustedMax = Math.max(1, Math.floor(baseMax / adjustedMultiplier));
      
      const result = await redisClient.incrementRateLimit(key, baseWindowMs, adjustedMax);

      if (result.isExceeded) {
        logger.performance.rateLimitExceeded(key, adjustedMax, baseWindowMs);

        return res.status(429).json({
          success: false,
          message: 'Too many requests, please try again later.',
          rateLimitExceeded: true,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
          adaptiveLimit: true,
          adjustedMax,
        });
      }

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': adjustedMax,
        'X-RateLimit-Remaining': result.remaining,
        'X-RateLimit-Reset': result.resetTime,
        'X-Adaptive-RateLimit': 'true',
      });

      next();
    } catch (error) {
      logger.error('Adaptive rate limiting error:', error);
      next();
    }
  };
};

// Middleware to track failed requests for adaptive rate limiting
const trackFailedRequest = (keyPrefix) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Track if this is a failed request (4xx or 5xx status)
      if (res.statusCode >= 400) {
        const redisClient = require('../cache/redis');
        const key = `${keyPrefix}:${options.keyGenerator(req)}:failures`;
        
        // Increment failure count with expiry
        redisClient.incrementRateLimit(key, 60 * 60 * 1000, 100).catch(error => {
          logger.error('Error tracking failed request:', error);
        });
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Rate limiting middleware selector based on configuration
const getRateLimitMiddleware = (type) => {
  // Use Redis-based rate limiting if Redis is available, otherwise fall back to memory-based
  const useRedis = process.env.USE_REDIS_RATE_LIMITING === 'true';
  
  switch (type) {
    case 'phoneLogin':
      return useRedis ? redisPhoneLoginRateLimit : phoneLoginRateLimit;
    case 'otpVerification':
      return useRedis ? redisOtpVerificationRateLimit : otpVerificationRateLimit;
    case 'otpResend':
      return useRedis ? redisOtpResendRateLimit : otpResendRateLimit;
    case 'tokenRefresh':
      return useRedis ? redisTokenRefreshRateLimit : tokenRefreshRateLimit;
    case 'adminAccess':
      return useRedis ? redisAdminAccessRateLimit : adminAccessRateLimit;
    case 'global':
      return globalRateLimit;
    case 'api':
      return apiRateLimit;
    default:
      return (req, res, next) => next(); // No rate limiting
  }
};

module.exports = {
  createRateLimit,
  createRedisRateLimit,
  adaptiveRateLimit,
  trackFailedRequest,
  getRateLimitMiddleware,
  // Specific rate limiters
  phoneLoginRateLimit,
  otpVerificationRateLimit,
  otpResendRateLimit,
  tokenRefreshRateLimit,
  adminAccessRateLimit,
  globalRateLimit,
  apiRateLimit,
  // Redis-based rate limiters
  redisPhoneLoginRateLimit,
  redisOtpVerificationRateLimit,
  redisOtpResendRateLimit,
  redisTokenRefreshRateLimit,
  redisAdminAccessRateLimit,
};
