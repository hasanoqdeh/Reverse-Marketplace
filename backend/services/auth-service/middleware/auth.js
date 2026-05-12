const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');
const redisClient = require('../cache/redis');
const database = require('../database/connection');

// JWT authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        error: 'MISSING_TOKEN',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret, {
      algorithms: [config.jwt.algorithm],
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    });

    // Check if token is blacklisted/revoked
    const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
    const tokenResult = await database.query(
      'SELECT * FROM auth_tokens WHERE token_hash = $1 AND token_type = $2 AND revoked_at IS NULL AND expires_at > NOW()',
      [tokenHash, 'ACCESS']
    );

    if (tokenResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired access token',
        error: 'INVALID_TOKEN',
      });
    }

    const tokenRecord = tokenResult.rows[0];

    // Get user details
    const userResult = await database.query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
      });
    }

    const user = userResult.rows[0];

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(423).json({
        success: false,
        message: 'Account is locked',
        error: 'ACCOUNT_LOCKED',
        lockoutUntil: user.locked_until,
      });
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active',
        error: 'ACCOUNT_INACTIVE',
        status: user.status,
      });
    }

    // Update token last used time
    await database.query(
      'UPDATE auth_tokens SET last_used_at = NOW() WHERE id = $1',
      [tokenRecord.id]
    );

    // Attach user info to request
    req.user = {
      userId: user.id,
      phone: user.phone,
      role: user.role,
      status: user.status,
      adminLevel: decoded.adminLevel,
      deviceFingerprint: decoded.deviceFingerprint,
      tokenId: tokenRecord.id,
    };

    // Log successful authentication
    logger.debug('User authenticated', {
      userId: user.id,
      phone: user.phone,
      role: user.role,
      ip: req.clientIP,
      userAgent: req.userAgent,
    });

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: 'INVALID_TOKEN',
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        error: 'TOKEN_EXPIRED',
      });
    } else {
      logger.error('Authentication middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authentication error',
        error: 'INTERNAL_ERROR',
      });
    }
  }
};

// Role-based authorization middleware
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'AUTHENTICATION_REQUIRED',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.userId,
        role: req.user.role,
        requiredRoles: allowedRoles,
        ip: req.clientIP,
        userAgent: req.userAgent,
        url: req.url,
        method: req.method,
      });

      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles,
        currentRole: req.user.role,
      });
    }

    next();
  };
};

// Admin level authorization middleware
const authorizeAdmin = (...allowedLevels) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
        error: 'ADMIN_ACCESS_REQUIRED',
      });
    }

    if (allowedLevels.length > 0 && !allowedLevels.includes(req.user.adminLevel)) {
      logger.warn('Insufficient admin level access attempt', {
        userId: req.user.userId,
        adminLevel: req.user.adminLevel,
        requiredLevels: allowedLevels,
        ip: req.clientIP,
        userAgent: req.userAgent,
        url: req.url,
        method: req.method,
      });

      return res.status(403).json({
        success: false,
        message: 'Insufficient admin privileges',
        error: 'INSUFFICIENT_ADMIN_PRIVILEGES',
        requiredLevels: allowedLevels,
        currentLevel: req.user.adminLevel,
      });
    }

    next();
  };
};

// Self or admin authorization (users can access their own data or admins can access any)
const authorizeSelfOrAdmin = (targetUserIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'AUTHENTICATION_REQUIRED',
      });
    }

    const targetUserId = req.params[targetUserIdParam] || req.body[targetUserIdParam];

    // Users can access their own data, admins can access any data
    const isSelf = req.user.userId === targetUserId;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isSelf && !isAdmin) {
      logger.warn('Unauthorized self or admin access attempt', {
        userId: req.user.userId,
        targetUserId,
        role: req.user.role,
        ip: req.clientIP,
        userAgent: req.userAgent,
        url: req.url,
        method: req.method,
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied',
        error: 'ACCESS_DENIED',
      });
    }

    next();
  };
};

// Session validation middleware
const validateSession = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'AUTHENTICATION_REQUIRED',
      });
    }

    // Check if session exists in cache
    const sessionToken = req.headers['x-session-token'];
    if (sessionToken) {
      const session = await redisClient.getSession(sessionToken);
      
      if (!session || session.userId !== req.user.userId) {
        return res.status(401).json({
          success: false,
          message: 'Invalid session',
          error: 'INVALID_SESSION',
        });
      }

      req.session = session;
    }

    // Check device fingerprint if provided
    if (req.user.deviceFingerprint && req.deviceFingerprint) {
      if (req.user.deviceFingerprint !== req.deviceFingerprint) {
        logger.warn('Device fingerprint mismatch', {
          userId: req.user.userId,
          expectedFingerprint: req.user.deviceFingerprint,
          providedFingerprint: req.deviceFingerprint,
          ip: req.clientIP,
          userAgent: req.userAgent,
        });

        return res.status(403).json({
          success: false,
          message: 'Device verification failed',
          error: 'DEVICE_MISMATCH',
        });
      }
    }

    next();
  } catch (error) {
    logger.error('Session validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Session validation error',
      error: 'INTERNAL_ERROR',
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token, continue without authentication
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret, {
      algorithms: [config.jwt.algorithm],
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    });

    // Get user details
    const userResult = await database.query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      
      // Attach user info to request if user is active and not locked
      if (user.status === 'ACTIVE' && (!user.locked_until || new Date(user.locked_until) <= new Date())) {
        req.user = {
          userId: user.id,
          phone: user.phone,
          role: user.role,
          status: user.status,
          adminLevel: decoded.adminLevel,
          deviceFingerprint: decoded.deviceFingerprint,
        };
      }
    }

    next();
  } catch (error) {
    // Log error but don't fail the request for optional authentication
    logger.debug('Optional authentication failed:', error);
    next();
  }
};

// Merchant verification middleware
const requireMerchantVerification = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'AUTHENTICATION_REQUIRED',
      });
    }

    if (req.user.role !== 'MERCHANT') {
      return res.status(403).json({
        success: false,
        message: 'Merchant access required',
        error: 'MERCHANT_ACCESS_REQUIRED',
      });
    }

    // Check merchant verification status
    const verificationResult = await database.query(
      'SELECT * FROM merchant_verification WHERE user_id = $1',
      [req.user.userId]
    );

    if (verificationResult.rows.length === 0 || verificationResult.rows[0].verification_status !== 'VERIFIED') {
      return res.status(403).json({
        success: false,
        message: 'Merchant verification required',
        error: 'MERCHANT_NOT_VERIFIED',
        verificationStatus: verificationResult.rows[0]?.verification_status || 'NOT_FOUND',
      });
    }

    req.merchantVerification = verificationResult.rows[0];
    next();
  } catch (error) {
    logger.error('Merchant verification check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Verification check error',
      error: 'INTERNAL_ERROR',
    });
  }
};

// API key authentication for service-to-service communication
const authenticateService = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required',
        error: 'MISSING_API_KEY',
      });
    }

    // Validate API key against database or configuration
    const validApiKeys = process.env.VALID_API_KEYS ? process.env.VALID_API_KEYS.split(',') : [];
    
    if (!validApiKeys.includes(apiKey)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key',
        error: 'INVALID_API_KEY',
      });
    }

    // Mark as service request
    req.isService = true;
    req.serviceName = req.headers['x-service-name'] || 'unknown';

    next();
  } catch (error) {
    logger.error('Service authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Service authentication error',
      error: 'INTERNAL_ERROR',
    });
  }
};

// Rate limiting bypass for authenticated users
const bypassRateLimitForAuth = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    // Admins bypass rate limiting
    req.bypassRateLimit = true;
  }
  next();
};

module.exports = {
  authenticate,
  authorize,
  authorizeAdmin,
  authorizeSelfOrAdmin,
  validateSession,
  optionalAuthenticate,
  requireMerchantVerification,
  authenticateService,
  bypassRateLimitForAuth,
};
