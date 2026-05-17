'use strict';

const prisma = require('../../../prisma/client');

const NotificationRepository = {
  async create({ userId, type, title, body, data }) {
    return prisma.notification.create({
      data: { userId, type, title, body, data: data || {} },
    });
  },

  async findByUser(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    const where = {
      userId,
      ...(unreadOnly ? { isRead: false } : {}),
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
    return prisma.notification.count({ where: { userId, isRead: false } });
  },

  async findById(id) {
    return prisma.notification.findUnique({ where: { id } });
  },

  async markRead(id, userId) {
    return prisma.notification.updateMany({
      where: { id, userId, isRead: false },
      data: { isRead: true },
    });
  },

  async markAllRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  async delete(id, userId) {
    return prisma.notification.deleteMany({ where: { id, userId } });
  },
};

module.exports = NotificationRepository;
