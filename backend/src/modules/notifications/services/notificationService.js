'use strict';

const NotificationRepository = require('../repositories/NotificationRepository');
const logger = require('../../../utils/logger');

const notificationService = {
  async send(io, { userId, type, title, body, data = {} }) {
    const notification = await NotificationRepository.create({ userId, type, title, body, data });

    if (io) {
      io.to(`user:${userId}`).emit('notification:new', notification);
    }

    return notification;
  },

  async getMyNotifications(userId, params) {
    const { notifications, total } = await NotificationRepository.findByUser(userId, params);
    const unreadCount = await NotificationRepository.countUnread(userId);
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    return {
      notifications,
      unreadCount,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async markRead(notificationId, userId, io) {
    const notif = await NotificationRepository.findById(notificationId);
    if (!notif) return { error: 'NOT_FOUND', message: 'Notification not found' };
    if (notif.userId !== userId) return { error: 'FORBIDDEN', message: 'Not your notification' };

    await NotificationRepository.markRead(notificationId, userId);
    if (io) io.to(`user:${userId}`).emit('notification:read', { notificationId });
    return { success: true };
  },

  async markAllRead(userId, io) {
    const result = await NotificationRepository.markAllRead(userId);
    if (io) io.to(`user:${userId}`).emit('notification:all_read', { userId });
    return { markedRead: result.count };
  },

  async deleteNotification(notificationId, userId) {
    const notif = await NotificationRepository.findById(notificationId);
    if (!notif) return { error: 'NOT_FOUND', message: 'Notification not found' };
    if (notif.userId !== userId) return { error: 'FORBIDDEN', message: 'Not your notification' };

    await NotificationRepository.delete(notificationId, userId);
    return { success: true };
  },
};

module.exports = notificationService;
