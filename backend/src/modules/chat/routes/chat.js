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

/**
 * @swagger
 * /api/v1/chat/upload:
 *   post:
 *     tags: [Chat]
 *     summary: Upload a media file for use in a chat message
 *     description: |
 *       Uploads a file (image or audio, max 15 MB) and returns its URL. Pass the
 *       returned URL in `mediaUrls` when calling `POST /chat/rooms/{id}/messages`.
 *
 *       **DB effects**: none – file only, saved to `/uploads/chat/`.
 *
 *       **Events published**: none.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: File uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:          { type: string, format: uri }
 *                 originalName: { type: string }
 *                 mimeType:     { type: string }
 *                 size:         { type: integer }
 */
router.post('/upload', upload.single('file'), chatController.uploadMedia);

/**
 * @swagger
 * /api/v1/chat/rooms:
 *   post:
 *     tags: [Chat]
 *     summary: Create a chat room
 *     description: |
 *       Creates a new chat room and adds the creator as the first participant.
 *       For `DIRECT` type, the service prevents duplicate rooms between the same pair.
 *       `BID`-type rooms are created automatically by the bid-submission service.
 *
 *       **DB effects**
 *       - PostgreSQL `ChatRoom`: `INSERT`.
 *       - PostgreSQL `ChatRoomParticipant`: `INSERT` for creator + any initial participants.
 *
 *       **Events published**
 *       - `chat.room.created` – Payload: `{ roomId, type, createdBy }`
 *         → Analytics: `system / Chat room created`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [DIRECT, GROUP, REQUEST, BID, SUPPORT]
 *               name:             { type: string }
 *               description:      { type: string }
 *               relatedRequestId: { type: string, format: uuid }
 *               relatedBidId:     { type: string, format: uuid }
 *               participantIds:
 *                 type: array
 *                 items: { type: string, format: uuid }
 *     responses:
 *       '201':
 *         description: Room created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 room: { $ref: '#/components/schemas/ChatRoom' }
 *   get:
 *     tags: [Chat]
 *     summary: Get the user's chat rooms
 *     description: |
 *       Returns all active chat rooms the caller participates in, ordered by
 *       `lastMessageAt` descending. Each room includes an unread message count and
 *       last message preview.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `ChatRoom` JOIN `ChatRoomParticipant` WHERE `userId = req.user.id`.
 *       - MongoDB `ChatMessage`: `countDocuments` (unread) + `findOne` (last message) per room.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       '200':
 *         description: User's chat rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rooms:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/ChatRoom' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.post('/rooms', chatController.createRoom);
router.get('/rooms', chatController.getMyRooms);

/**
 * @swagger
 * /api/v1/chat/rooms/{id}:
 *   get:
 *     tags: [Chat]
 *     summary: Get a single chat room
 *     description: |
 *       Returns room details with participant list. Caller must be a participant.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `ChatRoom` JOIN `ChatRoomParticipant` + `UserProfile`.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Room details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 room: { $ref: '#/components/schemas/ChatRoom' }
 *       '403':
 *         description: Not a participant
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/rooms/:id', chatController.getRoom);

/**
 * @swagger
 * /api/v1/chat/rooms/{id}/messages:
 *   post:
 *     tags: [Chat]
 *     summary: Send a message to a room
 *     description: |
 *       Sends a message. The caller must be a room participant. Media messages
 *       reference URLs obtained from `POST /chat/upload`.
 *
 *       Socket.IO also broadcasts the message in real-time to all participants
 *       connected to the room: `socket.to(roomId).emit('new_message', message)`.
 *
 *       **DB effects**
 *       - MongoDB `ChatMessage`: `INSERT` with `senderId`, `type`, `content`, `mediaUrls`.
 *       - PostgreSQL `ChatRoom`: `UPDATE lastMessageAt = NOW()`.
 *
 *       **Events published**
 *       - `message.sent` – Payload: `{ messageId, roomId, senderId, messageType, sentAt }`
 *         → **Notification consumer** handles `message.sent`: finds other participant(s),
 *           creates a `NEW_MESSAGE` notification for each.
 *           `{ title: "New message", type: NEW_MESSAGE }`.
 *           Inserts to `Notification`, emits via Socket.IO to each recipient's room.
 *         → Analytics: `system / Message sent`.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, content]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [TEXT, IMAGE, FILE, VOICE, VIDEO, LOCATION, SYSTEM]
 *               content:   { type: string }
 *               replyToId: { type: string, description: MongoDB _id of the message being replied to }
 *               mediaUrls: { type: array, items: { type: string, format: uri } }
 *               metadata:  { type: object }
 *     responses:
 *       '201':
 *         description: Message sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { $ref: '#/components/schemas/ChatMessage' }
 *   get:
 *     tags: [Chat]
 *     summary: Get room messages (paginated, newest first)
 *     description: |
 *       Returns messages in a room ordered newest first. Uses cursor-based
 *       pagination via the `before` timestamp parameter.
 *
 *       **DB effects** (read-only)
 *       - MongoDB `ChatMessage`: `find({ roomId, isDeleted: false,
 *         createdAt: { $lt: before } })`.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: before
 *         schema: { type: string, format: date-time }
 *         description: Return messages created before this timestamp (cursor)
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       '200':
 *         description: Messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/ChatMessage' }
 *                 hasMore: { type: boolean }
 */
router.post('/rooms/:id/messages', chatController.sendMessage);
router.get('/rooms/:id/messages', chatController.getMessages);

/**
 * @swagger
 * /api/v1/chat/rooms/{id}/messages/{messageId}:
 *   delete:
 *     tags: [Chat]
 *     summary: Delete a message (soft delete, sender only)
 *     description: |
 *       Soft-deletes a message – sets `isDeleted = true` and clears `content`.
 *       Only the original sender can delete their own message.
 *
 *       **DB effects**
 *       - MongoDB `ChatMessage`: `UPDATE isDeleted = true, deletedAt = NOW(), content = ""`.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema: { type: string }
 *         description: MongoDB ObjectId of the message
 *     responses:
 *       '200':
 *         description: Message deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 */
router.delete('/rooms/:id/messages/:messageId', chatController.deleteMessage);

/**
 * @swagger
 * /api/v1/chat/rooms/{id}/read:
 *   post:
 *     tags: [Chat]
 *     summary: Mark all room messages as read
 *     description: |
 *       Updates `ChatRoomParticipant.lastReadAt` and stamps all unread messages
 *       with the caller's userId in their `readBy` array.
 *
 *       **DB effects**
 *       - PostgreSQL `ChatRoomParticipant`: `UPDATE lastReadAt = NOW()
 *         WHERE roomId = ? AND userId = ?`.
 *       - MongoDB `ChatMessage`: `updateMany` pushing `{ userId, readAt }` to `readBy`
 *         for all unread messages in the room.
 *
 *       **Events published**
 *       - `message.read` – Payload: `{ messageId, roomId, readerId, readAt }`
 *         → Analytics: `system / Messages read`.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Messages marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 */
router.post('/rooms/:id/read', chatController.markRead);

/**
 * @swagger
 * /api/v1/chat/rooms/{id}/react:
 *   post:
 *     tags: [Chat]
 *     summary: Toggle an emoji reaction on a message
 *     description: |
 *       Adds an emoji reaction. If the same user sends the same `reactionType`
 *       again, it is removed (toggle behaviour).
 *
 *       **DB effects**
 *       - MongoDB `ChatMessage`: `$push` or `$pull` on the `reactions` array.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [messageId, reactionType]
 *             properties:
 *               messageId:    { type: string, description: MongoDB ObjectId }
 *               reactionType: { type: string, example: '👍' }
 *     responses:
 *       '200':
 *         description: Reaction updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:       { type: string }
 *                       reactionType: { type: string }
 */
router.post('/rooms/:id/react', chatController.addReaction);

/**
 * @swagger
 * /api/v1/chat/rooms/{id}/participants:
 *   post:
 *     tags: [Chat]
 *     summary: Add a participant to a room
 *     description: |
 *       Adds a new user to an existing room. Only the room creator or a
 *       participant with the `ADMIN` room role may add others.
 *
 *       **DB effects**
 *       - PostgreSQL `ChatRoomParticipant`: `INSERT (roomId, userId, joinedAt)`.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Participant added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 */
router.post('/rooms/:id/participants', chatController.addParticipant);

/**
 * @swagger
 * /api/v1/chat/rooms/{id}/participants/me:
 *   delete:
 *     tags: [Chat]
 *     summary: Leave a chat room
 *     description: |
 *       Removes the calling user from a room by recording `leftAt` timestamp.
 *
 *       **DB effects**
 *       - PostgreSQL `ChatRoomParticipant`: `UPDATE leftAt = NOW()` (soft remove).
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Left room
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 */
router.delete('/rooms/:id/participants/me', chatController.leaveRoom);

module.exports = router;
