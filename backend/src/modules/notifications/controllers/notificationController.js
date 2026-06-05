'use strict';

const Joi = require('joi');
const notificationService = require('../services/notificationService');
const prisma = require('../../../prisma/client');

const listSchema = Joi.object({
  page:       Joi.number().integer().min(1).default(1),
  limit:      Joi.number().integer().min(1).max(100).default(20),
  unreadOnly: Joi.boolean().optional(),
});

const deviceTokenSchema = Joi.object({
  token:    Joi.string().max(512).required(),
  platform: Joi.string().valid('android', 'ios').required(),
});

const notificationController = {
  async list(req, res) {
    const { error, value } = listSchema.validate(req.query, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

    const result = await notificationService.getMyNotifications(req.user.id, value);
    return res.json({ success: true, ...result });
  },

  async markRead(req, res) {
    const io = req.app.get('io');
    const result = await notificationService.markRead(req.params.id, req.user.id, io);
    if (result.error) return res.status(result.error === 'NOT_FOUND' ? 404 : 403).json({ success: false, message: result.message });
    return res.json({ success: true });
  },

  async markAllRead(req, res) {
    const io = req.app.get('io');
    const result = await notificationService.markAllRead(req.user.id, io);
    return res.json({ success: true, ...result });
  },

  async deleteOne(req, res) {
    const result = await notificationService.deleteNotification(req.params.id, req.user.id);
    if (result.error) return res.status(result.error === 'NOT_FOUND' ? 404 : 403).json({ success: false, message: result.message });
    return res.json({ success: true });
  },

  async registerDeviceToken(req, res) {
    const { error, value } = deviceTokenSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

    await prisma.deviceToken.upsert({
      where: { token: value.token },
      update: { userId: req.user.id, platform: value.platform },
      create: { userId: req.user.id, token: value.token, platform: value.platform },
    });
    return res.json({ success: true });
  },

  async removeDeviceToken(req, res) {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'token required' });

    await prisma.deviceToken.deleteMany({
      where: { token, userId: req.user.id },
    });
    return res.json({ success: true });
  },
};

module.exports = notificationController;
