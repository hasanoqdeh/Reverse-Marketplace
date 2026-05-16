'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret-change-in-production';

/**
 * Verifies the Bearer JWT and populates req.user.
 * Returns 401 if token is missing, expired, or invalid.
 * Handles both token payload shapes:
 *   - identity-service shape: { sub, phone, role, adminSubRole, type, jti }
 *   - request-service shape:  { userId, phone, role }
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization header missing or invalid.',
      error: 'UNAUTHORIZED',
    });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Only reject if `type` field is present AND it's not ACCESS
    if (decoded.type && decoded.type !== 'ACCESS') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type — access token required.',
        error: 'TOKEN_TYPE_INVALID',
      });
    }

    req.user = {
      id: decoded.userId || decoded.sub || decoded.id,
      phone: decoded.phone,
      role: decoded.role,
      adminSubRole: decoded.adminSubRole || null,
      jti: decoded.jti || null,
    };

    next();
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      message: isExpired ? 'Token has expired.' : 'Invalid token.',
      error: isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
    });
  }
}

/**
 * Same as authenticate but does not reject on missing/invalid token —
 * simply sets req.user = null and continues.
 */
function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.userId || decoded.sub || decoded.id,
      role: decoded.role,
      phone: decoded.phone,
    };
  } catch {
    req.user = null;
  }
  next();
}

module.exports = { authenticate, optionalAuthenticate };
