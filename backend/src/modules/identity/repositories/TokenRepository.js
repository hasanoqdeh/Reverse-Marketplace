'use strict';

const prisma = require('../../../prisma/client');
const UserSession = require('../../../models/UserSession');

const MAX_ACTIVE_SESSIONS = 5;

const TokenRepository = {
  // ─── Auth Tokens (PostgreSQL via Prisma) ───────────────────────

  async storeToken({ userId, tokenType, tokenHash, deviceFingerprint, ipAddress, userAgent, expiresAt }) {
    const token = await prisma.authToken.create({
      data: { userId, tokenType, tokenHash, deviceFingerprint, ipAddress, userAgent, expiresAt: new Date(expiresAt) },
      select: { id: true },
    });
    return token;
  },

  async findByHash(tokenHash) {
    const token = await prisma.authToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    });
    if (!token) return null;
    return {
      ...token,
      token_hash: token.tokenHash,
      token_type: token.tokenType,
      user_id: token.userId,
      device_fingerprint: token.deviceFingerprint,
      ip_address: token.ipAddress,
      user_agent: token.userAgent,
      expires_at: token.expiresAt,
      last_used_at: token.lastUsedAt,
      created_at: token.createdAt,
      revoked_at: token.revokedAt,
    };
  },

  async revokeToken(tokenHash) {
    await prisma.authToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  async revokeAllUserTokens(userId, tokenType = null) {
    await prisma.authToken.updateMany({
      where: { userId, revokedAt: null, ...(tokenType ? { tokenType } : {}) },
      data: { revokedAt: new Date() },
    });
  },

  async updateLastUsed(tokenHash) {
    await prisma.authToken.updateMany({ where: { tokenHash }, data: { lastUsedAt: new Date() } });
  },

  async countActiveRefreshTokens(userId) {
    return prisma.authToken.count({
      where: { userId, tokenType: 'REFRESH', revokedAt: null, expiresAt: { gt: new Date() } },
    });
  },

  // ─── User Sessions (MongoDB) ───────────────────────────────────

  async createSession({ userId, sessionToken, deviceFingerprint, ipAddress, userAgent, expiresAt }) {
    const now = new Date();

    // Cap at MAX_ACTIVE_SESSIONS — deactivate oldest if at limit
    const activeCount = await UserSession.countDocuments({ userId, isActive: true, expiresAt: { $gt: now } });
    if (activeCount >= MAX_ACTIVE_SESSIONS) {
      const oldest = await UserSession.findOne({ userId, isActive: true }).sort({ createdAt: 1 }).select('_id');
      if (oldest) await UserSession.updateOne({ _id: oldest._id }, { $set: { isActive: false } });
    }

    const session = await UserSession.create({
      userId, sessionToken, deviceFingerprint, ipAddress, userAgent,
      expiresAt: new Date(expiresAt),
    });

    return {
      id: session._id.toString(),
      user_id: session.userId,
      session_token: session.sessionToken,
      device_fingerprint: session.deviceFingerprint,
      ip_address: session.ipAddress,
      user_agent: session.userAgent,
      is_active: session.isActive,
      last_activity_at: session.lastActivityAt,
      created_at: session.createdAt,
      expires_at: session.expiresAt,
    };
  },

  async findActiveSession(sessionToken) {
    const session = await UserSession.findOne({
      sessionToken, isActive: true, expiresAt: { $gt: new Date() },
    });
    if (!session) return null;
    return {
      id: session._id.toString(),
      user_id: session.userId,
      session_token: session.sessionToken,
      is_active: session.isActive,
      expires_at: session.expiresAt,
    };
  },

  async deactivateSession(sessionToken) {
    await UserSession.updateMany({ sessionToken }, { $set: { isActive: false } });
  },

  async deactivateAllUserSessions(userId) {
    await UserSession.updateMany({ userId }, { $set: { isActive: false } });
  },

  async touchSession(sessionToken) {
    await UserSession.updateMany({ sessionToken }, { $set: { lastActivityAt: new Date() } });
  },

  async getUserSessions(userId) {
    const sessions = await UserSession.find({ userId }).sort({ createdAt: -1 }).limit(20);
    const now = new Date();
    return sessions.map(s => ({
      id: s._id.toString(),
      isActive: s.isActive && s.expiresAt > now,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      deviceFingerprint: s.deviceFingerprint,
      lastActivityAt: s.lastActivityAt,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
    }));
  },

  async revokeSession(sessionId) {
    await UserSession.updateOne({ _id: sessionId }, { $set: { isActive: false } });
  },
};

module.exports = TokenRepository;
