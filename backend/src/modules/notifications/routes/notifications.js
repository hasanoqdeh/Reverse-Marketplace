'use strict';

const express    = require('express');
const router     = express.Router();
const { authenticate } = require('../../../middleware/authenticate');
const controller = require('../controllers/notificationController');

router.use(authenticate);

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: List the user's notifications
 *     description: |
 *       Returns the calling user's notifications ordered newest first.
 *       Optionally filter to unread only. Also returns the current unread count.
 *
 *       Notifications are created automatically by the RabbitMQ Notification
 *       Consumer when the following events are received:
 *       - `bid.submitted` → `BID_PLACED` for the request's buyer
 *       - `bid.accepted` → `BID_ACCEPTED` for the winning merchant
 *       - `bid.fulfillment.updated` (IN_DELIVERY) → `STATUS_IN_DELIVERY` for the buyer
 *       - `message.sent` → `NEW_MESSAGE` for each other room participant
 *       - `review.created` → `BUYER_REVIEW` for the reviewee
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `Notification` WHERE `userId = req.user.id`, paginated.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema: { type: boolean, default: false }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
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
 *                 unreadCount: { type: integer }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/', controller.list);

/**
 * @swagger
 * /api/v1/notifications/read-all:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     description: |
 *       Sets `isRead = true` on every unread notification for the calling user.
 *
 *       **DB effects**
 *       - PostgreSQL `Notification`: `UPDATE isRead = true
 *         WHERE userId = ? AND isRead = false`.
 *
 *       **Events published**: none.
 *     responses:
 *       '200':
 *         description: All marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count: { type: integer, description: Number of notifications updated }
 */
router.post('/read-all', controller.markAllRead);

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark a single notification as read
 *     description: |
 *       Sets `isRead = true` on one notification. Validates the notification
 *       belongs to the calling user before updating.
 *
 *       **DB effects**
 *       - PostgreSQL `Notification`: `UPDATE isRead = true WHERE id = ? AND userId = ?`.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notification: { $ref: '#/components/schemas/Notification' }
 */
router.post('/:id/read', controller.markRead);

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete a notification
 *     description: |
 *       Hard-deletes a single notification. Validates ownership before deleting.
 *
 *       **DB effects**
 *       - PostgreSQL `Notification`: `DELETE WHERE id = ? AND userId = ?`.
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
