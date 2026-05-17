'use strict';

const prisma = require('../../../prisma/client');

const NotificationRepository = {
  // ─── Notifications ──────────────────────────────────────────────

  async create({ userId, type, title, content, channel = 'IN_APP', priority = 'NORMAL', templateId, templateVariables, metadata, scheduledAt, expiresAt }) {
    return prisma.notification.create({
      data: {
        userId, type, title, content, channel, priority,
        status: scheduledAt ? 'PENDING' : 'SENT',
        templateId: templateId || null,
        templateVariables: templateVariables || {},
        metadata: metadata || {},
        scheduledAt: scheduledAt || null,
        expiresAt: expiresAt || null,
        sentAt: scheduledAt ? null : new Date(),
        deliveredAt: scheduledAt ? null : new Date(),
      },
    });
  },

  async findById(id) {
    return prisma.notification.findUnique({ where: { id } });
  },

  async findByUser(userId, { page = 1, limit = 20, type, channel, status, unreadOnly } = {}) {
    const where = {
      userId,
      ...(type ? { type } : {}),
      ...(channel ? { channel } : {}),
      ...(status ? { status } : {}),
      ...(unreadOnly ? { readAt: null, status: { not: 'EXPIRED' } } : {}),
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return { notifications, total };
  },

  async countUnread(userId) {
    return prisma.notification.count({
      where: { userId, readAt: null, status: { not: 'EXPIRED' } },
    });
  },

  async markRead(id, userId) {
    return prisma.notification.updateMany({
      where: { id, userId, readAt: null },
      data: { readAt: new Date(), status: 'READ' },
    });
  },

  async markAllRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date(), status: 'READ' },
    });
  },

  async delete(id, userId) {
    return prisma.notification.deleteMany({ where: { id, userId } });
  },

  // ─── Templates ──────────────────────────────────────────────────

  async createTemplate({ name, type, channel, subjectTemplate, contentTemplate, variables, defaultLocale, createdBy }) {
    return prisma.notificationTemplate.create({
      data: { name, type, channel, subjectTemplate, contentTemplate, variables: variables || {}, defaultLocale: defaultLocale || 'en', createdBy },
    });
  },

  async findTemplates({ type, channel, isActive } = {}) {
    return prisma.notificationTemplate.findMany({
      where: {
        ...(type ? { type } : {}),
        ...(channel ? { channel } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findTemplateById(id) {
    return prisma.notificationTemplate.findUnique({ where: { id } });
  },

  async updateTemplate(id, data) {
    return prisma.notificationTemplate.update({ where: { id }, data });
  },

  // ─── Preferences ────────────────────────────────────────────────

  async getPreferences(userId) {
    return prisma.notificationPreference.findMany({ where: { userId } });
  },

  async upsertPreference({ userId, notificationType, channelType, isEnabled, quietHoursStart, quietHoursEnd, minPriority, maxFrequencyMinutes }) {
    return prisma.notificationPreference.upsert({
      where: { userId_notificationType_channelType: { userId, notificationType, channelType } },
      create: { userId, notificationType, channelType, isEnabled, quietHoursStart, quietHoursEnd, minPriority, maxFrequencyMinutes },
      update: { isEnabled, quietHoursStart, quietHoursEnd, minPriority, maxFrequencyMinutes },
    });
  },

  // ─── Channels (device tokens / endpoints) ───────────────────────

  async upsertChannel({ userId, channelType, isEnabled, deviceToken, emailAddress, phoneNumber }) {
    return prisma.notificationChannel.upsert({
      where: { userId_channelType: { userId, channelType } },
      create: { userId, channelType, isEnabled, deviceToken, emailAddress, phoneNumber },
      update: { isEnabled, deviceToken, emailAddress, phoneNumber, lastUsedAt: new Date() },
    });
  },

  async getChannels(userId) {
    return prisma.notificationChannel.findMany({ where: { userId } });
  },

  // ─── Admin ──────────────────────────────────────────────────────

  async findAll({ page = 1, limit = 20, userId, type, channel, status, priority, from, to } = {}) {
    const where = {
      ...(userId ? { userId } : {}),
      ...(type ? { type } : {}),
      ...(channel ? { channel } : {}),
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...((from || to) ? { createdAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {}),
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return { notifications, total };
  },

  async getStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [total, todayTotal, byType, byChannel, byStatus, unreadTotal] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.notification.groupBy({ by: ['type'], _count: { _all: true } }),
      prisma.notification.groupBy({ by: ['channel'], _count: { _all: true } }),
      prisma.notification.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.notification.count({ where: { readAt: null, status: { not: 'EXPIRED' } } }),
    ]);

    return {
      total, todayTotal, unreadTotal,
      byType:    byType.map(r => ({ type: r.type, count: r._count._all })),
      byChannel: byChannel.map(r => ({ channel: r.channel, count: r._count._all })),
      byStatus:  byStatus.map(r => ({ status: r.status, count: r._count._all })),
    };
  },

  async adminDelete(id) {
    return prisma.notification.delete({ where: { id } });
  },
};

module.exports = NotificationRepository;
