'use strict';

const express    = require('express');
const router     = express.Router();
const { authenticate }   = require('../../../middleware/authenticate');
const { authorizeAdmin } = require('../../../middleware/authorizeAdmin');
const controller = require('../controllers/notificationAdminController');

router.use(authenticate, authorizeAdmin);

/**
 * @swagger
 * /api/v1/notifications/admin:
 *   get:
 *     tags: [Admin Notifications]
 *     summary: List all notifications platform-wide (admin)
 *     description: |
 *       Returns all notifications across all users. Filterable by `userId`,
 *       `type`, and `isRead`.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `Notification`: dynamic `SELECT` with optional `WHERE`.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [NEW_MESSAGE, BID_PLACED, STATUS_IN_DELIVERY, BID_ACCEPTED, BUYER_REVIEW]
 *       - in: query
 *         name: isRead
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       '200':
 *         description: Notification list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Notification' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/', controller.list);

/**
 * @swagger
 * /api/v1/notifications/admin/send:
 *   post:
 *     tags: [Admin Notifications]
 *     summary: Send a notification to a user (admin broadcast)
 *     description: |
 *       Allows an admin to push an arbitrary notification to any user. Useful for
 *       announcements, support messages, or manual triggers.
 *
 *       **DB effects**
 *       - PostgreSQL `Notification`: `INSERT`.
 *
 *       **Events published**
 *       - `notification.sent` – Payload: `{ notificationId, userId, type, channel, title, sentAt }`
 *         → Analytics: `admin / Notification sent`.
 *       Also emits via Socket.IO directly to the target user's room.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, type, title, body]
 *             properties:
 *               userId: { type: string, format: uuid }
 *               type:
 *                 type: string
 *                 enum: [NEW_MESSAGE, BID_PLACED, STATUS_IN_DELIVERY, BID_ACCEPTED, BUYER_REVIEW]
 *               title:  { type: string }
 *               body:   { type: string }
 *               data:   { type: object }
 *     responses:
 *       '201':
 *         description: Notification sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notification: { $ref: '#/components/schemas/Notification' }
 */
router.post('/send', controller.send);

/**
 * @swagger
 * /api/v1/notifications/admin/{id}:
 *   delete:
 *     tags: [Admin Notifications]
 *     summary: Admin-delete a notification
 *     description: |
 *       Hard-deletes any notification by ID regardless of owner.
 *
 *       **DB effects**
 *       - PostgreSQL `Notification`: `DELETE WHERE id = ?`.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 */
router.delete('/:id', controller.deleteOne);

module.exports = router;
