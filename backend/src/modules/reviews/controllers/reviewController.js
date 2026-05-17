'use strict';

const reviewService = require('../services/reviewService');
const logger = require('../../../utils/logger');

const reviewController = {
  async submitReview(req, res) {
    try {
      const reviewerId = req.user.id;
      const result = await reviewService.submitReview(reviewerId, req.body);

      if (result.error) {
        const statusMap = { NOT_FOUND: 404, FORBIDDEN: 403, INVALID_STATUS: 422, VALIDATION_ERROR: 422, DUPLICATE_REVIEW: 409 };
        return res.status(statusMap[result.error] || 400).json({ success: false, message: result.message, error: result.error });
      }

      res.status(201).json({ success: true, review: result.review, message: 'Review submitted' });
    } catch (err) {
      logger.error('submitReview error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async getReviews(req, res) {
    try {
      const { userId } = req.params;
      const { page, limit } = req.query;
      const result = await reviewService.getReviews(userId, { page, limit });
      res.json({ success: true, ...result });
    } catch (err) {
      logger.error('getReviews error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async getMerchantProfile(req, res) {
    try {
      const { merchantId } = req.params;
      const result = await reviewService.getMerchantProfile(merchantId);

      if (result.error) {
        return res.status(404).json({ success: false, message: result.message, error: result.error });
      }

      res.json({ success: true, ...result });
    } catch (err) {
      logger.error('getMerchantProfile error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },
};

module.exports = reviewController;
