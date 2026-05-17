'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const { authenticate } = require('../../../middleware/authenticate');
const chatController = require('../controllers/chatController');

const UPLOAD_DIR = path.join(__dirname, '../../../../uploads/chat');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || (file.mimetype.startsWith('audio') ? '.mp4' : '.jpg');
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(jpeg|png|gif|webp)|^audio\//.test(file.mimetype);
    cb(ok ? null : new Error('Unsupported file type'), ok);
  },
});

router.use(authenticate);

router.post('/upload', upload.single('file'), chatController.uploadMedia);
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
