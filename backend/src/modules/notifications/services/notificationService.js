'use strict';

const NotificationRepository = require('../repositories/NotificationRepository');
const eventPublisher = require('../../../events/publisher');
const logger = require('../../../utils/logger');

const notificationService = {
  // ─── Create & deliver ──────────────────────────────────────────

  async send(io, { userId, type, title, content, channel = 'IN_APP', priority = 'NORMAL', templateId, templateVariables, metadata, scheduledAt, expiresAt }) {
    const notification = await NotificationRepository.create({
      userId, type, title, content, channel, priority,
      templateId, templateVariables, metadata, scheduledAt, expiresAt,
    });

    // Emit real-time for IN_APP notifications
    if (channel === 'IN_APP' && !scheduledAt && io) {
      io.to(`user:${userId}`).emit('notification:new', notification);
    }

    await eventPublisher.publish('notification.sent', {
      notificationId: notification.id, userId, type, channel, title,
      sentAt: notification.sentAt?.toISOString(),
    }, { userId });

    return { notification };
  },

  // Convenience: create for a specific trigger event (bid placed, request updated, etc.)
  async notifyUser(io, userId, type, title, content, metadata = {}) {
    return this.send(io, { userId, type, title, content, channel: 'IN_APP', priority: 'NORMAL', metadata });
  },

  // ─── User queries ───────────────────────────────────────────────

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

  // ─── Preferences ────────────────────────────────────────────────

  async getPreferences(userId) {
    const preferences = await NotificationRepository.getPreferences(userId);
    return { preferences };
  },

  async updatePreferences(userId, preferencesList) {
    const results = await Promise.all(
      preferencesList.map(p => NotificationRepository.upsertPreference({
        userId,
        notificationType: p.notificationType,
        channelType: p.channel,
        isEnabled: p.isEnabled,
        quietHoursStart: p.quietHoursStart || null,
        quietHoursEnd: p.quietHoursEnd || null,
        minPriority: p.minPriority || null,
        maxFrequencyMinutes: p.maxFrequencyMinutes || null,
      }))
    );
    return { updated: results.length };
  },

  async registerChannel(userId, { channelType, deviceToken, emailAddress, phoneNumber, isEnabled = true }) {
    const channel = await NotificationRepository.upsertChannel({ userId, channelType, isEnabled, deviceToken, emailAddress, phoneNumber });
    return { channel };
  },

  // ─── Templates ──────────────────────────────────────────────────

  async getTemplates(params) {
    const templates = await NotificationRepository.findTemplates(params);
    return { templates };
  },

  async createTemplate(userId, payload) {
    const template = await NotificationRepository.createTemplate({ ...payload, createdBy: userId });
    return { template };
  },

  async updateTemplate(templateId, data) {
    const existing = await NotificationRepository.findTemplateById(templateId);
    if (!existing) return { error: 'NOT_FOUND', message: 'Template not found' };
    const template = await NotificationRepository.updateTemplate(templateId, { ...data, version: existing.version + 1 });
    return { template };
  },

  // ─── Admin ──────────────────────────────────────────────────────

  async adminGetNotifications(params) {
    const { notifications, total } = await NotificationRepository.findAll(params);
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    return { notifications, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async adminGetStats() {
    const stats = await NotificationRepository.getStats();
    return { stats };
  },

  async adminDeleteNotification(id) {
    const notif = await NotificationRepository.findById(id);
    if (!notif) return { error: 'NOT_FOUND', message: 'Notification not found' };
    await NotificationRepository.adminDelete(id);
    logger.info('Admin deleted notification', { notificationId: id });
    return { success: true };
  },
};

module.exports = notificationService;
