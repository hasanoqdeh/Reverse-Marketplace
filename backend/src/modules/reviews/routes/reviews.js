'use strict';

const express = require('express');
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../../../middleware/authenticate');

const router = express.Router();

// Submit a review (auth required; buyer or merchant after CONFIRMED delivery)
router.post('/', authenticate, reviewController.submitReview);

// Get reviews about a user (public)
router.get('/user/:userId', reviewController.getReviews);

// Get merchant profile + stats (public)
router.get('/merchants/:merchantId', reviewController.getMerchantProfile);

module.exports = router;
