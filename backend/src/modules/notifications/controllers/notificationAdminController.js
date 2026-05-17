'use strict';

const Joi = require('joi');
const notificationService = require('../services/notificationService');

const listSchema = Joi.object({
  page:     Joi.number().integer().min(1).default(1),
  limit:    Joi.number().integer().min(1).max(200).default(20),
  userId:   Joi.string().uuid().optional(),
  type:     Joi.string().valid('SYSTEM','REQUEST','BID','PAYMENT','CHAT','SUBSCRIPTION','SECURITY','MARKETING').optional(),
  channel:  Joi.string().valid('IN_APP','PUSH','EMAIL','SMS','WEBHOOK').optional(),
  status:   Joi.string().valid('PENDING','PROCESSING','SENT','DELIVERED','FAILED','EXPIRED','READ').optional(),
  priority: Joi.string().valid('LOW','NORMAL','HIGH','URGENT').optional(),
  from:     Joi.string().isoDate().optional(),
  to:       Joi.string().isoDate().optional(),
});

const sendSchema = Joi.object({
  userId:            Joi.string().uuid().required(),
  type:              Joi.string().valid('SYSTEM','REQUEST','BID','PAYMENT','CHAT','SUBSCRIPTION','SECURITY','MARKETING').required(),
  title:             Joi.string().min(1).max(255).required(),
  content:           Joi.string().min(1).required(),
  channel:           Joi.string().valid('IN_APP','PUSH','EMAIL','SMS','WEBHOOK').default('IN_APP'),
  priority:          Joi.string().valid('LOW','NORMAL','HIGH','URGENT').default('NORMAL'),
  scheduledAt:       Joi.string().isoDate().optional(),
  expiresAt:         Joi.string().isoDate().optional(),
  metadata:          Joi.object().optional(),
});

const templateSchema = Joi.object({
  name:            Joi.string().min(1).max(100).required(),
  type:            Joi.string().valid('SYSTEM','REQUEST','BID','PAYMENT','CHAT','SUBSCRIPTION','SECURITY','MARKETING').required(),
  channel:         Joi.string().valid('IN_APP','PUSH','EMAIL','SMS','WEBHOOK').required(),
  subjectTemplate: Joi.string().max(500).optional(),
  contentTemplate: Joi.string().min(1).required(),
  variables:       Joi.object().optional(),
  defaultLocale:   Joi.string().max(10).optional(),
});

const notificationAdminController = {
  // GET /api/v1/notifications/admin
  async list(req, res) {
    const { error, value } = listSchema.validate(req.query, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

    const result = await notificationService.adminGetNotifications(value);
    return res.json({ success: true, ...result });
  },

  // GET /api/v1/notifications/admin/stats
  async getStats(req, res) {
    const result = await notificationService.adminGetStats();
    return res.json({ success: true, ...result });
  },

  // POST /api/v1/notifications/admin/send
  async send(req, res) {
    const { error, value } = sendSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

    const io = req.app.get('io');
    const result = await notificationService.send(io, value);
    return res.status(201).json({ success: true, ...result });
  },

  // DELETE /api/v1/notifications/admin/:id
  async deleteOne(req, res) {
    const result = await notificationService.adminDeleteNotification(req.params.id);
    if (result.error) return res.status(404).json({ success: false, message: result.message });
    return res.json({ success: true });
  },

  // GET /api/v1/notifications/admin/templates
  async listTemplates(req, res) {
    const result = await notificationService.getTemplates(req.query);
    return res.json({ success: true, ...result });
  },

  // POST /api/v1/notifications/admin/templates
  async createTemplate(req, res) {
    const { error, value } = templateSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

    const result = await notificationService.createTemplate(req.user.id, value);
    return res.status(201).json({ success: true, ...result });
  },

  // PATCH /api/v1/notifications/admin/templates/:id
  async updateTemplate(req, res) {
    const result = await notificationService.updateTemplate(req.params.id, req.body);
    if (result.error) return res.status(404).json({ success: false, message: result.message });
    return res.json({ success: true, ...result });
  },
};

module.exports = notificationAdminController;
