'use strict';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const TokenRepository = require('../repositories/TokenRepository');
const redisClient = require('../cache/redis');
const logger = require('../utils/logger');

/**
 * TokenService — JWT generation, verification, refresh, and revocation.
 */
const TokenService = {
  /**
   * Generate a JWT access token.
   */
  generateAccessToken(payload) {
    return jwt.sign(
      {
        sub: payload.userId,
        phone: payload.phone,
        role: payload.role,
        adminSubRole: payload.adminSubRole || null,
        type: 'ACCESS',
        jti: uuidv4(),
      },
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiry }
    );
  },

  /**
   * Generate a JWT refresh token.
   */
  generateRefreshToken(payload) {
    return jwt.sign(
      {
        sub: payload.userId,
        phone: payload.phone,
        role: payload.role,
        type: 'REFRESH',
        jti: uuidv4(),
      },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry }
    );
  },

  /**
   * Hash a token for storage (never store raw tokens in DB).
   */
  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  },

  /**
   * Verify an access token. Returns decoded payload or throws.
   */
  verifyAccessToken(token) {
    return jwt.verify(token, config.jwt.secret);
  },

  /**
   * Verify a refresh token. Returns decoded payload or throws.
   */
  verifyRefreshToken(token) {
    return jwt.verify(token, config.jwt.refreshSecret);
  },

  /**
   * Issue a full token pair (access + refresh) and persist hashes.
   */
  async issueTokenPair(user, { ipAddress, userAgent, deviceFingerprint } = {}) {
    const payload = {
      userId: user.id,
      phone: user.phone,
      role: user.role,
      adminSubRole: user.admin_sub_role || null,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    const accessDecoded = jwt.decode(accessToken);
    const refreshDecoded = jwt.decode(refreshToken);

    // Store hashed tokens in DB (for revocation tracking)
    await TokenRepository.storeToken({
      userId: user.id,
      tokenType: 'ACCESS',
      tokenHash: this.hashToken(accessToken),
      deviceFingerprint,
      ipAddress,
      userAgent,
      expiresAt: new Date(accessDecoded.exp * 1000),
    });

    await TokenRepository.storeToken({
      userId: user.id,
      tokenType: 'REFRESH',
      tokenHash: this.hashToken(refreshToken),
      deviceFingerprint,
      ipAddress,
      userAgent,
      expiresAt: new Date(refreshDecoded.exp * 1000),
    });

    // Cache user session in Redis for fast lookups
    const sessionTtl = Math.floor((refreshDecoded.exp * 1000 - Date.now()) / 1000);
    await redisClient.cacheUser(user.id, {
      id: user.id,
      phone: user.phone,
      role: user.role,
      adminSubRole: user.admin_sub_role || null,
      status: user.status,
    }, Math.min(sessionTtl, config.redis.ttl.userCache));

    logger.debug('Token pair issued', { userId: user.id, role: user.role });

    return {
      accessToken,
      refreshToken,
      expiresIn: accessDecoded.exp - Math.floor(Date.now() / 1000),
    };
  },

  /**
   * Refresh an access token using a valid refresh token.
   * Rotates the refresh token (one-time use pattern).
   */
  async refreshTokenPair(refreshToken, { ipAddress, userAgent, deviceFingerprint } = {}) {
    // 1. Verify JWT signature & expiry
    const decoded = this.verifyRefreshToken(refreshToken);

    // 2. Check token is not revoked in DB
    const tokenHash = this.hashToken(refreshToken);
    const stored = await TokenRepository.findByHash(tokenHash);
    if (!stored) {
      throw Object.assign(new Error('Refresh token has been revoked or is invalid'), { code: 'TOKEN_REVOKED' });
    }

    // 3. Revoke the old refresh token (rotation)
    await TokenRepository.revokeToken(tokenHash);

    // 4. Issue new pair
    const user = { id: decoded.sub, phone: decoded.phone, role: decoded.role };
    return this.issueTokenPair(user, { ipAddress, userAgent, deviceFingerprint });
  },

  /**
   * Revoke a specific refresh token.
   */
  async revokeRefreshToken(refreshToken) {
    try {
      const tokenHash = this.hashToken(refreshToken);
      await TokenRepository.revokeToken(tokenHash);
    } catch {
      // Silently ignore — token may already be expired/revoked
    }
  },

  /**
   * Revoke ALL tokens for a user (logout from all devices).
   */
  async revokeAllTokens(userId) {
    await TokenRepository.revokeAllUserTokens(userId);
    await redisClient.invalidateUser(userId);
  },

  /**
   * Extract Bearer token from Authorization header.
   */
  extractBearerToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    return authHeader.slice(7);
  },
};

module.exports = TokenService;
