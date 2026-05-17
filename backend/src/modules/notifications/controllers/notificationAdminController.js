'use strict';

const Joi = require('joi');
const NotificationRepository = require('../repositories/NotificationRepository');
const notificationService = require('../services/notificationService');

const listSchema = Joi.object({
  page:       Joi.number().integer().min(1).default(1),
  limit:      Joi.number().integer().min(1).max(200).default(20),
  unreadOnly: Joi.boolean().optional(),
});

const sendSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  type:   Joi.string().valid('NEW_MESSAGE','BID_PLACED','STATUS_IN_DELIVERY','BID_ACCEPTED','BUYER_REVIEW').required(),
  title:  Joi.string().min(1).max(255).required(),
  body:   Joi.string().min(1).required(),
  data:   Joi.object().optional(),
});

const notificationAdminController = {
  async list(req, res) {
    const { error, value } = listSchema.validate(req.query, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

    const { notifications, total } = await NotificationRepository.findByUser(req.query.userId, value);
    return res.json({ success: true, notifications, total });
  },

  async send(req, res) {
    const { error, value } = sendSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

    const io = req.app.get('io');
    const notification = await notificationService.send(io, value);
    return res.status(201).json({ success: true, notification });
  },

  async deleteOne(req, res) {
    const notif = await NotificationRepository.findById(req.params.id);
    if (!notif) return res.status(404).json({ success: false, message: 'Not found' });
    await NotificationRepository.delete(req.params.id, notif.userId);
    return res.json({ success: true });
  },
};

module.exports = notificationAdminController;
