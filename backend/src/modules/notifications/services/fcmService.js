'use strict';

const getFirebaseAdmin = require('../../../config/firebase');
const prisma = require('../../../prisma/client');

module.exports = {
  async sendToUser(userId, { title, body, data = {} }) {
    const admin = getFirebaseAdmin();
    if (!admin) return; // firebase-admin not installed or not configured

    const tokens = await prisma.deviceToken.findMany({
      where: { userId },
      select: { token: true },
    });
    if (!tokens.length) return;

    const tokenStrings = tokens.map(t => t.token);
    const message = {
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v == null ? '' : String(v)])
      ),
      tokens: tokenStrings,
      android: { priority: 'high' },
    };

    const result = await admin.messaging().sendEachForMulticast(message);

    // Clean up stale/invalid tokens
    const staleTokens = result.responses
      .map((r, i) => (!r.success ? tokenStrings[i] : null))
      .filter(Boolean);

    if (staleTokens.length) {
      await prisma.deviceToken.deleteMany({
        where: { token: { in: staleTokens } },
      }).catch(() => {});
    }
  },
};
