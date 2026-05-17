'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/authenticate');
const chatController = require('../controllers/chatController');

router.use(authenticate);

router.post('/rooms', chatController.createRoom);
router.get('/rooms', chatController.getMyRooms);
router.get('/rooms/:id', chatController.getRoom);
router.post('/rooms/:id/messages', chatController.sendMessage);
router.get('/rooms/:id/messages', chatController.getMessages);
router.delete('/rooms/:id/messages/:messageId', chatController.deleteMessage);
router.post('/rooms/:id/read', chatController.markRead);
router.post('/rooms/:id/react', chatController.addReaction);
router.post('/rooms/:id/participants', chatController.addParticipant);
router.delete('/rooms/:id/participants/me', chatController.leaveRoom);

module.exports = router;
