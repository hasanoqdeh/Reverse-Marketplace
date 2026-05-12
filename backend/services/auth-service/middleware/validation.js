const Joi = require('joi');
const logger = require('../utils/logger');

// Validation schemas
const schemas = {
  phoneLogin: Joi.object({
    phone: Joi.string()
      .pattern(/^[0-9+\-\s()]+$/)
      .min(10)
      .max(20)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must contain only digits, +, -, spaces, and parentheses',
        'string.min': 'Phone number must be at least 10 characters long',
        'string.max': 'Phone number must not exceed 20 characters',
        'any.required': 'Phone number is required',
      }),
    countryCode: Joi.string()
      .pattern(/^[A-Z]{2}$/)
      .default('OM')
      .messages({
        'string.pattern.base': 'Country code must be a 2-letter country code (e.g., OM, US)',
      }),
  }),

  otpVerification: Joi.object({
    phone: Joi.string()
      .pattern(/^[0-9+\-\s()]+$/)
      .min(10)
      .max(20)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must contain only digits, +, -, spaces, and parentheses',
        'string.min': 'Phone number must be at least 10 characters long',
        'string.max': 'Phone number must not exceed 20 characters',
        'any.required': 'Phone number is required',
      }),
    otpCode: Joi.string()
      .pattern(/^[0-9]{6}$/)
      .required()
      .messages({
        'string.pattern.base': 'OTP code must be exactly 6 digits',
        'any.required': 'OTP code is required',
      }),
    deviceFingerprint: Joi.string()
      .max(255)
      .optional()
      .allow(''),
  }),

  resendOTP: Joi.object({
    phone: Joi.string()
      .pattern(/^[0-9+\-\s()]+$/)
      .min(10)
      .max(20)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must contain only digits, +, -, spaces, and parentheses',
        'string.min': 'Phone number must be at least 10 characters long',
        'string.max': 'Phone number must not exceed 20 characters',
        'any.required': 'Phone number is required',
      }),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string()
      .min(100)
      .required()
      .messages({
        'string.min': 'Refresh token is too short',
        'any.required': 'Refresh token is required',
      }),
  }),

  logout: Joi.object({
    refreshToken: Joi.string()
      .min(100)
      .optional()
      .allow(''),
    allDevices: Joi.boolean()
      .default(false),
  }),

  addAdmin: Joi.object({
    phone: Joi.string()
      .pattern(/^[0-9+\-\s()]+$/)
      .min(10)
      .max(20)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must contain only digits, +, -, spaces, and parentheses',
        'string.min': 'Phone number must be at least 10 characters long',
        'string.max': 'Phone number must not exceed 20 characters',
        'any.required': 'Phone number is required',
      }),
    name: Joi.string()
      .min(2)
      .max(255)
      .required()
      .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name must not exceed 255 characters',
        'any.required': 'Name is required',
      }),
    adminLevel: Joi.string()
      .valid('SUPER_ADMIN', 'ADMIN', 'SUPPORT')
      .required()
      .messages({
        'any.only': 'Admin level must be one of: SUPER_ADMIN, ADMIN, SUPPORT',
        'any.required': 'Admin level is required',
      }),
    department: Joi.string()
      .max(100)
      .optional()
      .allow(''),
  }),

  pagination: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10),
  }),
};

// Validation middleware factory
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    let data;
    
    switch (source) {
      case 'query':
        data = req.query;
        break;
      case 'params':
        data = req.params;
        break;
      default:
        data = req.body;
    }

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value,
      }));

      logger.warn('Validation failed', {
        url: req.url,
        method: req.method,
        errors,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // Replace the request data with validated data
    switch (source) {
      case 'query':
        req.query = value;
        break;
      case 'params':
        req.params = value;
        break;
      default:
        req.body = value;
    }

    next();
  };
};

// Custom validation functions
const validatePhoneFormat = (phone) => {
  // Remove all non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's a valid Omani phone number
  if (cleanPhone.startsWith('968')) {
    return cleanPhone.length === 11 ? cleanPhone : null;
  }
  
  // For international numbers, basic validation
  if (cleanPhone.length >= 10 && cleanPhone.length <= 15) {
    return cleanPhone;
  }
  
  return null;
};

const validateOTPFormat = (otp) => {
  return /^[0-9]{6}$/.test(otp);
};

const validateJWTFormat = (token) => {
  try {
    // Basic JWT format check (header.payload.signature)
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  } catch (error) {
    return false;
  }
};

// Sanitization functions
const sanitizePhone = (phone) => {
  return phone.replace(/\D/g, '');
};

const sanitizeString = (str) => {
  return str.trim().replace(/[<>]/g, '');
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key]);
      }
    });
  }

  next();
};

// Rate limiting validation helper
const validateRateLimit = (key, windowMs, maxRequests) => {
  return async (req, res, next) => {
    try {
      const redisClient = require('../cache/redis');
      const rateLimitResult = await redisClient.incrementRateLimit(key, windowMs, maxRequests);

      if (rateLimitResult.isExceeded) {
        logger.performance.rateLimitExceeded(key, maxRequests, windowMs);

        return res.status(429).json({
          success: false,
          message: 'Too many requests. Please try again later.',
          rateLimitExceeded: true,
          nextAttemptAt: rateLimitResult.resetTime,
        });
      }

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': rateLimitResult.remaining,
        'X-RateLimit-Reset': rateLimitResult.resetTime,
      });

      next();
    } catch (error) {
      logger.error('Rate limiting validation error:', error);
      next(); // Continue on error to avoid breaking the flow
    }
  };
};

// Device fingerprint validation
const validateDeviceFingerprint = (req, res, next) => {
  const deviceFingerprint = req.get('X-Device-Fingerprint') || req.body.deviceFingerprint;
  
  if (deviceFingerprint) {
    // Basic validation for device fingerprint
    if (typeof deviceFingerprint === 'string' && deviceFingerprint.length <= 255) {
      req.deviceFingerprint = deviceFingerprint;
    } else {
      req.deviceFingerprint = null;
    }
  } else {
    req.deviceFingerprint = null;
  }

  next();
};

// IP address validation
const validateIPAddress = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
  
  if (ip) {
    req.clientIP = ip;
  } else {
    req.clientIP = 'unknown';
  }

  next();
};

// User agent validation
const validateUserAgent = (req, res, next) => {
  const userAgent = req.get('User-Agent');
  
  if (userAgent) {
    req.userAgent = userAgent;
  } else {
    req.userAgent = 'unknown';
  }

  next();
};

// Combined validation middleware
const validateAuthInput = [
  sanitizeInput,
  validateIPAddress,
  validateUserAgent,
  validateDeviceFingerprint,
];

module.exports = {
  schemas,
  validate,
  validatePhoneFormat,
  validateOTPFormat,
  validateJWTFormat,
  sanitizePhone,
  sanitizeString,
  validateRateLimit,
  validateAuthInput,
};
