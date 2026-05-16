'use strict';

const rateLimit = require('express-rate-limit');

// Matches the limits defined in the auth spec
const RATE_LIMIT_CONFIGS = {
  global: { windowMs: 60 * 1000,      max: 1000, message: 'Too many requests. Please slow down.' },
  otp:    { windowMs: 60 * 1000,      max: 10,   message: 'Too many OTP requests. Please wait before trying again.' },
  auth:   { windowMs: 60 * 60 * 1000, max: 20,   message: 'Too many token refresh requests.' },
  admin:  { windowMs: 60 * 1000,      max: 10,   message: 'Too many admin requests. Please wait.' },
};

// Cache limiter instances so they're singletons per type
const _limiters = {};

/**
 * Returns a rate-limit middleware for the given type.
 * @param {'global'|'otp'|'auth'|'admin'} type
 */
function getRateLimitMiddleware(type) {
  if (!_limiters[type]) {
    const cfg = RATE_LIMIT_CONFIGS[type] || RATE_LIMIT_CONFIGS.global;

    _limiters[type] = rateLimit({
      windowMs: cfg.windowMs,
      max: cfg.max,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: cfg.message, error: 'RATE_LIMIT_EXCEEDED' },
      // TODO: remove this line and uncomment the line below before going to production
      skip: () => true,
      // skip: () => process.env.NODE_ENV === 'test',
    });
  }

  return _limiters[type];
}

module.exports = { getRateLimitMiddleware };
