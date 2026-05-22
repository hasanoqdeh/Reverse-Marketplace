'use strict';

const express = require('express');
const router  = express.Router();
const { authenticate }   = require('../../../middleware/authenticate');
const { authorizeAdmin } = require('../../../middleware/authorizeAdmin');
const ctrl = require('../controllers/analyticsController');

router.use(authenticate, authorizeAdmin);

/**
 * @swagger
 * /api/v1/analytics/activity:
 *   get:
 *     tags: [Analytics]
 *     summary: Paginated activity log
 *     description: |
 *       Returns the raw activity log from MongoDB. Every state-changing event on
 *       the platform is recorded here by the Analytics RabbitMQ subscriber
 *       (subscribes to `#` – all events). Filterable by `category` and date range.
 *
 *       **DB effects** (read-only)
 *       - MongoDB `ActivityLog`: `find` with compound index on `(category, createdAt)`.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string, enum: [identity, requests, admin, system] }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       '200':
 *         description: Activity log entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       actorId:    { type: string }
 *                       actorRole:  { type: string }
 *                       eventType:  { type: string }
 *                       category:   { type: string }
 *                       action:     { type: string }
 *                       targetType: { type: string }
 *                       targetId:   { type: string }
 *                       metadata:   { type: object }
 *                       createdAt:  { type: string, format: date-time }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/activity', ctrl.getActivityLogs);

/**
 * @swagger
 * /api/v1/analytics/activity/actor/{actorId}:
 *   get:
 *     tags: [Analytics]
 *     summary: Activity log for a specific actor
 *     description: |
 *       Filters the activity log to a single user (actor). Useful for auditing
 *       an individual user's actions across the platform.
 *
 *       **DB effects** (read-only)
 *       - MongoDB `ActivityLog`: `find({ actorId }).sort({ createdAt: -1 })`.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: path
 *         name: actorId
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
 *         description: Actor's activity log
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs: { type: array, items: { type: object } }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/activity/actor/:actorId', ctrl.getActorLogs);

/**
 * @swagger
 * /api/v1/analytics/stats:
 *   get:
 *     tags: [Analytics]
 *     summary: Aggregated activity stats from MongoDB
 *     description: |
 *       Returns event counts aggregated from MongoDB `ActivityLog`: events per
 *       category, events per day, and top actors (most active users).
 *
 *       **DB effects** (read-only)
 *       - MongoDB `ActivityLog`: `aggregate` pipeline.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *     responses:
 *       '200':
 *         description: Aggregated stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 byCategory:   { type: object }
 *                 eventsPerDay: { type: array, items: { type: object } }
 *                 topActors:    { type: array, items: { type: object } }
 */
router.get('/stats', ctrl.getStats);

/**
 * @swagger
 * /api/v1/analytics/overview:
 *   get:
 *     tags: [Analytics]
 *     summary: Cross-domain platform overview (admin dashboard widget)
 *     description: |
 *       Assembles a high-level KPI summary by querying all domain stores.
 *       Intended as a single-request feed for the admin dashboard homepage.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL: `COUNT` on `User`, `Request`, `Bid`, `Notification`.
 *       - MongoDB: `countDocuments` on `ChatMessage`, `ActivityLog`.
 *
 *       **Events published**: none.
 *     responses:
 *       '200':
 *         description: Platform overview
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:         { type: object }
 *                 requests:      { type: object }
 *                 bids:          { type: object }
 *                 messages:      { type: integer }
 *                 notifications: { type: integer }
 */
router.get('/overview', ctrl.getOverview);

/**
 * @swagger
 * /api/v1/analytics/users:
 *   get:
 *     tags: [Analytics]
 *     summary: User statistics from PostgreSQL
 *     description: |
 *       User-specific aggregates: registrations over time, active vs inactive,
 *       role distribution, login frequency.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `User`: `GROUP BY` aggregates.
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *     responses:
 *       '200':
 *         description: User stats
 *         content:
 *           application/json:
 *             schema: { type: object }
 */
router.get('/users', ctrl.getUserStats);

/**
 * @swagger
 * /api/v1/analytics/requests:
 *   get:
 *     tags: [Analytics]
 *     summary: Request statistics (PostgreSQL + MongoDB)
 *     description: |
 *       Request aggregates: by status, by category, average budget, and view
 *       analytics sourced from the MongoDB `RequestView` collection.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `Request`: `GROUP BY status`, `GROUP BY categoryId`, `AVG budget`.
 *       - MongoDB `RequestView`: `aggregate` for view analytics.
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *     responses:
 *       '200':
 *         description: Request stats
 *         content:
 *           application/json:
 *             schema: { type: object }
 */
router.get('/requests', ctrl.getRequestStats);

/**
 * @swagger
 * /api/v1/analytics/bids:
 *   get:
 *     tags: [Analytics]
 *     summary: Bid statistics from PostgreSQL
 *     description: |
 *       Bid aggregates: acceptance rate, average amount, bids per request,
 *       and fulfilment completion rate.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `Bid`: `GROUP BY status`, `AVG amount`, `COUNT`.
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *     responses:
 *       '200':
 *         description: Bid stats
 *         content:
 *           application/json:
 *             schema: { type: object }
 */
router.get('/bids', ctrl.getBidStats);

/**
 * @swagger
 * /api/v1/analytics/chat:
 *   get:
 *     tags: [Analytics]
 *     summary: Chat statistics (PostgreSQL + MongoDB)
 *     description: |
 *       Chat aggregates: room counts by type from PostgreSQL; message counts,
 *       active rooms, and average messages per room from MongoDB.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `ChatRoom`: `GROUP BY type`.
 *       - MongoDB `ChatMessage`: `aggregate`.
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *     responses:
 *       '200':
 *         description: Chat stats
 *         content:
 *           application/json:
 *             schema: { type: object }
 */
router.get('/chat', ctrl.getChatStats);

/**
 * @swagger
 * /api/v1/analytics/notifications:
 *   get:
 *     tags: [Analytics]
 *     summary: Notification statistics from PostgreSQL
 *     description: |
 *       Notification aggregates: totals by type, read vs unread rate,
 *       and notifications per user.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `Notification`: `GROUP BY type`, `COUNT isRead`.
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *     responses:
 *       '200':
 *         description: Notification stats
 *         content:
 *           application/json:
 *             schema: { type: object }
 */
router.get('/notifications', ctrl.getNotificationStats);

module.exports = router;
