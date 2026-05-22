'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/authenticate');
const { requireRole } = require('../../../middleware/authorize');
const chatAdminController = require('../controllers/chatAdminController');

router.use(authenticate, requireRole('ADMIN'));

/**
 * @swagger
 * /api/v1/chat/admin/rooms:
 *   get:
 *     tags: [Admin Chat]
 *     summary: List all chat rooms (admin)
 *     description: |
 *       Returns all rooms platform-wide regardless of participants. Filterable
 *       by `type` and `isActive`.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `ChatRoom` JOIN `ChatRoomParticipant`.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [DIRECT, GROUP, REQUEST, BID, SUPPORT] }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       '200':
 *         description: Room list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rooms: { type: array, items: { $ref: '#/components/schemas/ChatRoom' } }
 *                 meta:  { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/rooms', chatAdminController.listRooms);

/**
 * @swagger
 * /api/v1/chat/admin/rooms/{id}:
 *   get:
 *     tags: [Admin Chat]
 *     summary: Get room details (admin)
 *     description: |
 *       Full room details with all participants and metadata.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `ChatRoom` + `ChatRoomParticipant`.
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
 */
router.get('/rooms/:id', chatAdminController.getRoom);

/**
 * @swagger
 * /api/v1/chat/admin/rooms/{id}/messages:
 *   get:
 *     tags: [Admin Chat]
 *     summary: Get all room messages including deleted (admin)
 *     description: |
 *       Returns all messages in a room including soft-deleted ones. The admin
 *       view omits the `isDeleted` filter applied in the user-facing endpoint.
 *
 *       **DB effects** (read-only)
 *       - MongoDB `ChatMessage`: `find({ roomId })` (no `isDeleted` filter).
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       '200':
 *         description: Messages including deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/ChatMessage' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/rooms/:id/messages', chatAdminController.getMessages);

/**
 * @swagger
 * /api/v1/chat/admin/messages/{messageId}:
 *   delete:
 *     tags: [Admin Chat]
 *     summary: Admin-delete a chat message (moderation)
 *     description: |
 *       Force soft-deletes any message by ID, bypassing the sender-only check
 *       that applies to the user-facing delete endpoint.
 *
 *       **DB effects**
 *       - MongoDB `ChatMessage`: `UPDATE isDeleted = true, deletedAt = NOW()`.
 *
 *       **Events published**: none.
 *     parameters:
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
router.delete('/messages/:messageId', chatAdminController.deleteMessage);

module.exports = router;
