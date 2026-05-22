'use strict';

const express = require('express');
const bidAdminController = require('../controllers/bidAdminController');
const { authenticate } = require('../../../middleware/authenticate');
const { requireRole } = require('../../../middleware/authorize');

const router = express.Router();

router.use(authenticate, requireRole('ADMIN'));

/**
 * @swagger
 * /api/v1/bidding/admin/bids:
 *   get:
 *     tags: [Admin Bidding]
 *     summary: List all bids (admin)
 *     description: |
 *       Returns all bids platform-wide with merchant and request context.
 *       Filterable by `status`, `merchantId`, `requestId`.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `Bid` JOIN `Request` JOIN `UserProfile`.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, ACCEPTED, REJECTED, EXPIRED, WITHDRAWN] }
 *       - in: query
 *         name: merchantId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: requestId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       '200':
 *         description: Bid list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bids: { type: array, items: { $ref: '#/components/schemas/Bid' } }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/bids', bidAdminController.listBids);

/**
 * @swagger
 * /api/v1/bidding/admin/bids/{id}:
 *   get:
 *     tags: [Admin Bidding]
 *     summary: Get bid details (admin)
 *     description: |
 *       Full bid details including merchant profile and request context.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `Bid` JOIN `Request` JOIN `UserProfile`.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Bid details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bid: { $ref: '#/components/schemas/Bid' }
 */
router.get('/bids/:id', bidAdminController.getBid);

/**
 * @swagger
 * /api/v1/bidding/admin/bids/{id}/force-reject:
 *   post:
 *     tags: [Admin Bidding]
 *     summary: Force-reject a bid (admin)
 *     description: |
 *       Admin override to reject a bid regardless of its current status.
 *       Used for moderation (fraudulent bids, policy violations).
 *
 *       **DB effects**
 *       - PostgreSQL `Bid`: `UPDATE status = REJECTED, rejectedAt = NOW()`.
 *
 *       **Events published**
 *       - `bid.rejected` – same payload as buyer rejection.
 *         → Analytics: `admin / Bid force-rejected`.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       '200':
 *         description: Bid force-rejected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 bid:     { $ref: '#/components/schemas/Bid' }
 */
router.post('/bids/:id/force-reject', bidAdminController.forceReject);

module.exports = router;
