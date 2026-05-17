'use strict';

const Joi = require('joi');
const notificationService = require('../services/notificationService');

const listSchema = Joi.object({
  page:       Joi.number().integer().min(1).default(1),
  limit:      Joi.number().integer().min(1).max(100).default(20),
  type:       Joi.string().valid('SYSTEM','REQUEST','BID','PAYMENT','CHAT','SUBSCRIPTION','SECURITY','MARKETING').optional(),
  channel:    Joi.string().valid('IN_APP','PUSH','EMAIL','SMS','WEBHOOK').optional(),
  status:     Joi.string().valid('PENDING','PROCESSING','SENT','DELIVERED','FAILED','EXPIRED','READ').optional(),
  unreadOnly: Joi.boolean().optional(),
});

const prefSchema = Joi.object({
  preferences: Joi.array().items(Joi.object({
    notificationType: Joi.string().valid('SYSTEM','REQUEST','BID','PAYMENT','CHAT','SUBSCRIPTION','SECURITY','MARKETING').required(),
    channel:          Joi.string().valid('IN_APP','PUSH','EMAIL','SMS','WEBHOOK').required(),
    isEnabled:        Joi.boolean().required(),
    quietHoursStart:  Joi.string().optional(),
    quietHoursEnd:    Joi.string().optional(),
    minPriority:      Joi.string().valid('LOW','NORMAL','HIGH','URGENT').optional(),
    maxFrequencyMinutes: Joi.number().integer().min(1).optional(),
  })).min(1).required(),
});

const channelSchema = Joi.object({
  channelType:  Joi.string().valid('IN_APP','PUSH','EMAIL','SMS','WEBHOOK').required(),
  deviceToken:  Joi.string().max(500).optional(),
  emailAddress: Joi.string().email().optional(),
  phoneNumber:  Joi.string().max(20).optional(),
  isEnabled:    Joi.boolean().optional(),
});

const notificationController = {
  // GET /api/v1/notifications
  async list(req, res) {
    const { error, value } = listSchema.validate(req.query, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

    const result = await notificationService.getMyNotifications(req.user.id, value);
    return res.json({ success: true, ...result });
  },

  // POST /api/v1/notifications/:id/read
  async markRead(req, res) {
    const io = req.app.get('io');
    const result = await notificationService.markRead(req.params.id, req.user.id, io);
    if (result.error) return res.status(result.error === 'NOT_FOUND' ? 404 : 403).json({ success: false, message: result.message });
    return res.json({ success: true });
  },

  // POST /api/v1/notifications/read-all
  async markAllRead(req, res) {
    const io = req.app.get('io');
    const result = await notificationService.markAllRead(req.user.id, io);
    return res.json({ success: true, ...result });
  },

  // DELETE /api/v1/notifications/:id
  async deleteOne(req, res) {
    const result = await notificationService.deleteNotification(req.params.id, req.user.id);
    if (result.error) return res.status(result.error === 'NOT_FOUND' ? 404 : 403).json({ success: false, message: result.message });
    return res.json({ success: true });
  },

  // GET /api/v1/notifications/preferences
  async getPreferences(req, res) {
    const result = await notificationService.getPreferences(req.user.id);
    return res.json({ success: true, ...result });
  },

  // PUT /api/v1/notifications/preferences
  async updatePreferences(req, res) {
    const { error, value } = prefSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

    const result = await notificationService.updatePreferences(req.user.id, value.preferences);
    return res.json({ success: true, ...result });
  },

  // POST /api/v1/notifications/channel
  async registerChannel(req, res) {
    const { error, value } = channelSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

    const result = await notificationService.registerChannel(req.user.id, value);
    return res.json({ success: true, ...result });
  },

  // GET /api/v1/notifications/templates
  async getTemplates(req, res) {
    const result = await notificationService.getTemplates(req.query);
    return res.json({ success: true, ...result });
  },
};

module.exports = notificationController;
