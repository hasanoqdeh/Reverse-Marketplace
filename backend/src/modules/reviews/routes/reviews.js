'use strict';

const express = require('express');
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../../../middleware/authenticate');

const router = express.Router();

/**
 * @swagger
 * /api/v1/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Submit a review (buyer or merchant, post-delivery only)
 *     description: |
 *       Submits a post-delivery review. Both buyer and merchant can review each
 *       other after `Bid.fulfillmentStatus = CONFIRMED`. Only one review per
 *       `(bidId, reviewerId)` pair (unique DB constraint).
 *
 *       **What it does**
 *       1. Validates `rating` is 1–5.
 *       2. Looks up the bid and confirms `fulfillmentStatus = CONFIRMED`.
 *       3. Checks the caller is the buyer (for `BUYER_TO_MERCHANT`) or merchant
 *          (for `MERCHANT_TO_BUYER`).
 *       4. Checks for duplicate review on this bid.
 *       5. Inserts the `Review` row.
 *
 *       **DB effects**
 *       - PostgreSQL `Bid`: `SELECT` (status validation).
 *       - PostgreSQL `Review`: `INSERT`.
 *
 *       **Events published**
 *       - `review.created` – Payload: `{ reviewId, bidId, reviewerId, revieweeId,
 *         rating, type, createdAt }`
 *         → **Notification consumer** handles `review.created`: creates a
 *           `BUYER_REVIEW` notification for the reviewee.
 *           `{ title: "You received a review", type: BUYER_REVIEW }`.
 *           Inserts to `Notification`, emits via Socket.IO.
 *         → Analytics: `system / Review created`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bidId, type, rating]
 *             properties:
 *               bidId:   { type: string, format: uuid }
 *               type:    { type: string, enum: [BUYER_TO_MERCHANT, MERCHANT_TO_BUYER] }
 *               rating:  { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       '201':
 *         description: Review submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 review: { $ref: '#/components/schemas/Review' }
 *       '400':
 *         description: Delivery not confirmed, duplicate review, or invalid rating
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       '403':
 *         description: Not authorized to review this bid
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', authenticate, reviewController.submitReview);

/**
 * @swagger
 * /api/v1/reviews/user/{userId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Get reviews received by a user
 *     security: []
 *     description: |
 *       Returns paginated reviews where `revieweeId = userId`, newest first.
 *       Public endpoint – no authentication required.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `Review` WHERE `revieweeId = ?`, JOIN `UserProfile` of reviewer.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [BUYER_TO_MERCHANT, MERCHANT_TO_BUYER] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       '200':
 *         description: Reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Review' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/user/:userId', reviewController.getReviews);

/**
 * @swagger
 * /api/v1/reviews/merchants/{merchantId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Get merchant public profile and review stats
 *     security: []
 *     description: |
 *       Returns a merchant's public profile along with aggregated review statistics:
 *       average rating, total review count, per-star distribution, and
 *       confirmed-bid count.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `User` + `UserProfile`: `SELECT WHERE id = ? AND role = MERCHANT`.
 *       - PostgreSQL `Review`: `AVG(rating)`, `COUNT(*)`, `GROUP BY rating`.
 *       - PostgreSQL `Bid`: `COUNT WHERE merchantId = ?
 *         AND fulfillmentStatus = CONFIRMED`.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: path
 *         name: merchantId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Merchant profile and stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 merchant:
 *                   type: object
 *                   properties:
 *                     id:      { type: string, format: uuid }
 *                     profile: { $ref: '#/components/schemas/UserProfile' }
 *                 stats:
 *                   type: object
 *                   properties:
 *                     avgRating:     { type: number }
 *                     totalReviews:  { type: integer }
 *                     completedBids: { type: integer }
 *                     distribution:
 *                       type: object
 *                       description: Count per star rating (keys 1–5)
 *       '404':
 *         description: Merchant not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/merchants/:merchantId', reviewController.getMerchantProfile);

module.exports = router;
