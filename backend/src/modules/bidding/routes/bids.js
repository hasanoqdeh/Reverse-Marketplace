'use strict';

const express = require('express');
const bidController = require('../controllers/bidController');
const { authenticate } = require('../../../middleware/authenticate');
const { requireRole } = require('../../../middleware/authorize');

const router = express.Router();

/**
 * @swagger
 * /api/v1/bidding/health:
 *   get:
 *     tags: [Bidding]
 *     summary: Bidding service health check
 *     security: []
 *     description: "Returns `{ status: \"ok\" }`. No database calls."
 *     responses:
 *       '200':
 *         description: Healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:    { type: string }
 *                 service:   { type: string }
 *                 timestamp: { type: string, format: date-time }
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'bidding-service', timestamp: new Date().toISOString() });
});

// ─── Merchant: bid management ─────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/bidding/bids:
 *   post:
 *     tags: [Bidding]
 *     summary: Submit a bid on a request (merchant only)
 *     description: |
 *       A merchant submits a bid on an open request. Only one bid per
 *       `(requestId, merchantId)` pair is allowed (unique DB constraint).
 *
 *       **What it does**
 *       1. Validates the request exists and `status` is `ACTIVE` or `HAS_BIDS`.
 *       2. Inserts the `Bid` row.
 *       3. Increments `Request.bidCount` and sets `Request.status = HAS_BIDS`.
 *       4. Auto-creates a `BID`-type `ChatRoom` between buyer and merchant,
 *          adding both as participants.
 *       5. Returns the new bid with anonymised competition data.
 *
 *       **DB effects**
 *       - PostgreSQL `Bid`: `INSERT`.
 *       - PostgreSQL `Request`: `UPDATE bidCount++, status = HAS_BIDS`.
 *       - PostgreSQL `ChatRoom`: `INSERT` with `type = BID, relatedBidId`.
 *       - PostgreSQL `ChatRoomParticipant`: `INSERT` × 2 (buyer + merchant).
 *
 *       **Events published**
 *       - `bid.submitted` – Payload: `{ bidId, requestId, merchantId, amount,
 *         deliveryDays, submittedAt, expiresAt }`
 *         → **Notification consumer** handles `bid.submitted`: creates a `BID_PLACED`
 *           notification for the buyer.
 *           `{ title: "New bid received", type: BID_PLACED }`.
 *           Inserts to PostgreSQL `Notification`, emits via Socket.IO to buyer's room.
 *         → Analytics: `requests / Bid submitted`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [requestId, amount, deliveryDays]
 *             properties:
 *               requestId:     { type: string, format: uuid }
 *               amount:        { type: number }
 *               deliveryDays:  { type: integer }
 *               deliveryNotes: { type: string }
 *               specialTerms:  { type: string }
 *               expiresAt:     { type: string, format: date-time }
 *     responses:
 *       '201':
 *         description: Bid submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bid: { $ref: '#/components/schemas/Bid' }
 *                 competition:
 *                   type: object
 *                   description: Anonymised stats about existing bids on this request
 *                   properties:
 *                     totalBids: { type: integer }
 *                     minAmount: { type: number }
 *                     maxAmount: { type: number }
 *                     avgAmount: { type: number }
 *       '409':
 *         description: Merchant already has a bid on this request
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/bids', authenticate, requireRole('MERCHANT'), bidController.submitBid);

/**
 * @swagger
 * /api/v1/bidding/me/bids:
 *   get:
 *     tags: [Bidding]
 *     summary: Get the merchant's own bids
 *     description: |
 *       Returns the calling merchant's bids with the associated request snapshot.
 *       Filterable by `status`.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `Bid` WHERE `merchantId = req.user.id`, JOIN `Request`.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, ACCEPTED, REJECTED, EXPIRED, WITHDRAWN] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       '200':
 *         description: Merchant's bids
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bids: { type: array, items: { $ref: '#/components/schemas/Bid' } }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/me/bids', authenticate, requireRole('MERCHANT'), bidController.getMyBids);

/**
 * @swagger
 * /api/v1/bidding/bids/{id}:
 *   get:
 *     tags: [Bidding]
 *     summary: Get a single bid
 *     description: |
 *       Returns full bid details. The caller must be either the merchant who placed
 *       the bid or the buyer who owns the associated request.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `Bid` JOIN `Request`.
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
 *       '403':
 *         description: Not authorized to view this bid
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *   put:
 *     tags: [Bidding]
 *     summary: Update a bid (merchant only)
 *     description: |
 *       Updates mutable fields on a `PENDING` bid. Accepted or rejected bids
 *       cannot be edited.
 *
 *       **DB effects**
 *       - PostgreSQL `Bid`: `UPDATE amount, deliveryDays, deliveryNotes, specialTerms`.
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
 *             properties:
 *               amount:        { type: number }
 *               deliveryDays:  { type: integer }
 *               deliveryNotes: { type: string }
 *               specialTerms:  { type: string }
 *     responses:
 *       '200':
 *         description: Bid updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bid: { $ref: '#/components/schemas/Bid' }
 *   delete:
 *     tags: [Bidding]
 *     summary: Withdraw a bid (merchant only)
 *     description: |
 *       Sets `Bid.status = WITHDRAWN`. Only `PENDING` bids can be withdrawn.
 *       Decrements `Request.bidCount`.
 *
 *       **DB effects**
 *       - PostgreSQL `Bid`: `UPDATE status = WITHDRAWN, withdrawnAt = NOW()`.
 *       - PostgreSQL `Request`: `UPDATE bidCount--`.
 *
 *       **Events published**
 *       - `bid.withdrawn` – Payload: `{ bidId, requestId, merchantId, withdrawnAt }`
 *         → Analytics: `requests / Bid withdrawn`.
 *         → Notification consumer: no handler.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Bid withdrawn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 */
router.get('/bids/:id', authenticate, bidController.getBid);
router.put('/bids/:id', authenticate, requireRole('MERCHANT'), bidController.updateBid);
router.delete('/bids/:id', authenticate, requireRole('MERCHANT'), bidController.withdrawBid);

// ─── Buyer: bid evaluation ────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/bidding/requests/{requestId}/bids:
 *   get:
 *     tags: [Bidding]
 *     summary: Get all bids for a request (buyer only)
 *     description: |
 *       Returns all bids placed on the caller's request. Merchant identity is
 *       visible to the owning buyer. Sorted by amount ascending by default.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `Bid` WHERE `requestId = ?`, JOIN `UserProfile` for merchant.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [amount_asc, amount_desc, newest, delivery_days] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       '200':
 *         description: Bids for the request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bids: { type: array, items: { $ref: '#/components/schemas/Bid' } }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/requests/:requestId/bids', authenticate, requireRole('BUYER'), bidController.getBidsForRequest);

/**
 * @swagger
 * /api/v1/bidding/bids/{id}/accept:
 *   post:
 *     tags: [Bidding]
 *     summary: Accept a bid (buyer only)
 *     description: |
 *       Accepts a merchant's bid. Major state transition:
 *       1. Sets `Bid.status = ACCEPTED`, records `acceptedAt`.
 *       2. Sets `Request.status = COMPLETED`.
 *       3. Rejects all other `PENDING` bids on the same request.
 *
 *       **DB effects**
 *       - PostgreSQL `Bid` (target): `UPDATE status = ACCEPTED, acceptedAt = NOW()`.
 *       - PostgreSQL `Request`: `UPDATE status = COMPLETED`.
 *       - PostgreSQL `Bid` (others): `UPDATE status = REJECTED, rejectedAt = NOW()`
 *         WHERE `requestId = ? AND id != bidId AND status = PENDING`.
 *
 *       **Events published**
 *       - `bid.accepted` – Payload: `{ bidId, requestId, merchantId, buyerId, amount, acceptedAt }`
 *         → **Notification consumer** handles `bid.accepted`: creates a `BID_ACCEPTED`
 *           notification for the merchant.
 *           `{ title: "Your bid was accepted!", type: BID_ACCEPTED }`.
 *           Inserts to `Notification`, emits via Socket.IO to merchant's room.
 *         → Analytics: `requests / Bid accepted`.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Bid accepted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bid:     { $ref: '#/components/schemas/Bid' }
 *                 request: { $ref: '#/components/schemas/Request' }
 */
router.post('/bids/:id/accept', authenticate, requireRole('BUYER'), bidController.acceptBid);

/**
 * @swagger
 * /api/v1/bidding/bids/{id}/reject:
 *   post:
 *     tags: [Bidding]
 *     summary: Reject a bid (buyer only)
 *     description: |
 *       Sets `Bid.status = REJECTED`. The request remains open for other bids.
 *
 *       **DB effects**
 *       - PostgreSQL `Bid`: `UPDATE status = REJECTED, rejectedAt = NOW()`.
 *
 *       **Events published**
 *       - `bid.rejected` – Payload: `{ bidId, requestId, merchantId, buyerId, rejectedAt }`
 *         → Analytics: `requests / Bid rejected`.
 *         → Notification consumer: no handler (no push sent for rejections).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Bid rejected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bid: { $ref: '#/components/schemas/Bid' }
 */
router.post('/bids/:id/reject', authenticate, requireRole('BUYER'), bidController.rejectBid);

/**
 * @swagger
 * /api/v1/bidding/bids/{id}/confirm:
 *   post:
 *     tags: [Bidding]
 *     summary: Confirm delivery (buyer only)
 *     description: |
 *       Buyer confirms receipt of goods/service. Sets
 *       `Bid.fulfillmentStatus = CONFIRMED`. After this, both parties can
 *       submit reviews (review endpoint requires `fulfillmentStatus = CONFIRMED`).
 *
 *       **DB effects**
 *       - PostgreSQL `Bid`: `UPDATE fulfillmentStatus = CONFIRMED,
 *         fulfillmentUpdatedAt = NOW()`.
 *
 *       **Events published**
 *       - `bid.delivery.confirmed` – Payload: `{ bidId, buyerId, merchantId, confirmedAt }`
 *         → Analytics: `requests / Delivery confirmed`.
 *         → Notification consumer: no handler.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Delivery confirmed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bid: { $ref: '#/components/schemas/Bid' }
 */
router.post('/bids/:id/confirm', authenticate, requireRole('BUYER'), bidController.confirmDelivery);

/**
 * @swagger
 * /api/v1/bidding/bids/{id}/fulfillment:
 *   patch:
 *     tags: [Bidding]
 *     summary: Update fulfilment status (merchant only)
 *     description: |
 *       Merchant updates the delivery pipeline. Allowed transitions:
 *       `AWAITING → PREPARING → IN_DELIVERY → DELIVERED`.
 *       `CONFIRMED` is set only by the buyer via `/confirm`.
 *
 *       **DB effects**
 *       - PostgreSQL `Bid`: `UPDATE fulfillmentStatus = ?, fulfillmentUpdatedAt = NOW()`.
 *
 *       **Events published**
 *       - `bid.fulfillment.updated` – Payload: `{ bidId, merchantId, oldStatus, newStatus, updatedAt }`
 *         → **Notification consumer** handles this event **when `newStatus = IN_DELIVERY`**:
 *           creates a `STATUS_IN_DELIVERY` notification for the buyer.
 *           `{ title: "Your order is on the way!", type: STATUS_IN_DELIVERY }`.
 *           Inserts to `Notification`, emits via Socket.IO.
 *         → Analytics: `requests / Fulfillment status updated`.
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [AWAITING, PREPARING, IN_DELIVERY, DELIVERED]
 *     responses:
 *       '200':
 *         description: Fulfillment status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bid: { $ref: '#/components/schemas/Bid' }
 */
router.patch('/bids/:id/fulfillment', authenticate, requireRole('MERCHANT'), bidController.updateFulfillmentStatus);

module.exports = router;
