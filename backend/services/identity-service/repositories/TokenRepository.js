'use strict';

const prisma = require('../prisma/client');

const TokenRepository = {
  // ─── Auth Tokens ───────────────────────────────────────────────

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

  // ─── User Sessions ─────────────────────────────────────────────

  async createSession({ userId, sessionToken, deviceFingerprint, ipAddress, userAgent, expiresAt }) {
    const count = await prisma.userSession.count({
      where: { userId, isActive: true, expiresAt: { gt: new Date() } },
    });

    if (count >= 5) {
      const oldest = await prisma.userSession.findFirst({
        where: { userId, isActive: true },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });
      if (oldest) {
        await prisma.userSession.update({ where: { id: oldest.id }, data: { isActive: false } });
      }
    }

    const session = await prisma.userSession.create({
      data: { userId, sessionToken, deviceFingerprint, ipAddress, userAgent, expiresAt: new Date(expiresAt) },
    });
    return {
      ...session,
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
    const session = await prisma.userSession.findFirst({
      where: { sessionToken, isActive: true, expiresAt: { gt: new Date() } },
    });
    if (!session) return null;
    return {
      ...session,
      user_id: session.userId,
      session_token: session.sessionToken,
      is_active: session.isActive,
      expires_at: session.expiresAt,
    };
  },

  async deactivateSession(sessionToken) {
    await prisma.userSession.updateMany({ where: { sessionToken }, data: { isActive: false } });
  },

  async deactivateAllUserSessions(userId) {
    await prisma.userSession.updateMany({ where: { userId }, data: { isActive: false } });
  },

  async touchSession(sessionToken) {
    await prisma.userSession.updateMany({
      where: { sessionToken },
      data: { lastActivityAt: new Date() },
    });
  },

  async countActiveRefreshTokens(userId) {
    return prisma.authToken.count({
      where: { userId, tokenType: 'REFRESH', revokedAt: null, expiresAt: { gt: new Date() } },
    });
  },
};

module.exports = TokenRepository;
