'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret-change-in-production';

/**
 * Verifies the Bearer JWT and populates req.user.
 * Returns 401 if token is missing, expired, or invalid.
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

    if (decoded.type !== 'ACCESS') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type — access token required.',
        error: 'TOKEN_TYPE_INVALID',
      });
    }

    req.user = {
      id: decoded.sub,
      phone: decoded.phone,
      role: decoded.role,
      adminSubRole: decoded.adminSubRole || null,
      jti: decoded.jti,
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

module.exports = { authenticate };
