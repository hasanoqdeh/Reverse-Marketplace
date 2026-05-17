'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/authenticate');
const { requireRole } = require('../../../middleware/authorize');
const chatAdminController = require('../controllers/chatAdminController');

router.use(authenticate, requireRole('ADMIN'));

router.get('/rooms', chatAdminController.listRooms);
router.get('/rooms/:id', chatAdminController.getRoom);
router.get('/rooms/:id/messages', chatAdminController.getMessages);
router.delete('/messages/:messageId', chatAdminController.deleteMessage);

module.exports = router;
