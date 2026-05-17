'use strict';

const express = require('express');
const bidController = require('../controllers/bidController');
const { authenticate } = require('../../../middleware/authenticate');
const { requireRole } = require('../../../middleware/authorize');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'bidding-service', timestamp: new Date().toISOString() });
});

// ─── Merchant: bid management ─────────────────────────────────────────────

// Submit a new bid (MERCHANT only)
router.post('/bids', authenticate, requireRole('MERCHANT'), bidController.submitBid);

// Get merchant's own bids (MERCHANT only) — must be before /:id
router.get('/me/bids', authenticate, requireRole('MERCHANT'), bidController.getMyBids);

// Get a single bid (merchant owns it OR buyer owns the request)
router.get('/bids/:id', authenticate, bidController.getBid);

// Update a pending bid (MERCHANT only)
router.put('/bids/:id', authenticate, requireRole('MERCHANT'), bidController.updateBid);

// Withdraw a bid (MERCHANT only)
router.delete('/bids/:id', authenticate, requireRole('MERCHANT'), bidController.withdrawBid);

// ─── Buyer: bid evaluation ────────────────────────────────────────────────

// Get all bids for a request (BUYER — request owner only)
router.get('/requests/:requestId/bids', authenticate, requireRole('BUYER'), bidController.getBidsForRequest);

// Accept a bid (BUYER only)
router.post('/bids/:id/accept', authenticate, requireRole('BUYER'), bidController.acceptBid);

// Reject a single bid (BUYER only)
router.post('/bids/:id/reject', authenticate, requireRole('BUYER'), bidController.rejectBid);

// Confirm delivery (BUYER only)
router.post('/bids/:id/confirm', authenticate, requireRole('BUYER'), bidController.confirmDelivery);

// Update fulfillment status (MERCHANT only)
router.patch('/bids/:id/fulfillment', authenticate, requireRole('MERCHANT'), bidController.updateFulfillmentStatus);

module.exports = router;
