'use strict';

const ReviewRepository = require('../repositories/ReviewRepository');
const BidRepository = require('../../bidding/repositories/BidRepository');
const RequestRepository = require('../../requests/repositories/RequestRepository');
const eventPublisher = require('../../../events/publisher');
const logger = require('../../../utils/logger');

const reviewService = {
  async submitReview(reviewerId, { bidId, revieweeId, rating, comment }) {
    if (!rating || rating < 1 || rating > 5) {
      return { error: 'VALIDATION_ERROR', message: 'Rating must be between 1 and 5' };
    }

    const bid = await BidRepository.findById(bidId);
    if (!bid) return { error: 'NOT_FOUND', message: 'Bid not found' };

    if (bid.fulfillmentStatus !== 'CONFIRMED') {
      return { error: 'INVALID_STATUS', message: 'Delivery must be confirmed before leaving a review' };
    }

    const request = await RequestRepository.findById(bid.requestId);
    if (!request) return { error: 'NOT_FOUND', message: 'Request not found' };

    const isBuyer = request.buyerId === reviewerId;
    const isMerchant = bid.merchantId === reviewerId;

    if (!isBuyer && !isMerchant) {
      return { error: 'FORBIDDEN', message: 'Only the buyer or merchant of this bid can leave a review' };
    }

    const expectedReviewee = isBuyer ? bid.merchantId : request.buyerId;
    if (revieweeId !== expectedReviewee) {
      return { error: 'FORBIDDEN', message: 'Invalid reviewee for this transaction' };
    }

    const existing = await ReviewRepository.findByBidAndReviewer(bidId, reviewerId);
    if (existing) {
      return { error: 'DUPLICATE_REVIEW', message: 'You have already reviewed this transaction' };
    }

    const type = isBuyer ? 'BUYER_TO_MERCHANT' : 'MERCHANT_TO_BUYER';

    const review = await ReviewRepository.create({
      bidId,
      requestId: bid.requestId,
      reviewerId,
      revieweeId,
      type,
      rating: parseInt(rating, 10),
      comment: comment || null,
    });

    await eventPublisher.reviewCreated(review.id, bidId, reviewerId, revieweeId, rating, type);

    logger.info('Review submitted', { reviewId: review.id, bidId, reviewerId, revieweeId, rating });
    return { review };
  },

  async getReviews(userId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const result = await ReviewRepository.findByReviewee(userId, {
      page: parseInt(page, 10),
      limit: Math.min(parseInt(limit, 10), 100),
    });
    return {
      reviews: result.reviews,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  },

  async getMerchantProfile(merchantId) {
    const prisma = require('../../../prisma/client');
    const user = await prisma.user.findUnique({
      where: { id: merchantId },
      select: {
        id: true,
        phone: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            city: true,
            country: true,
            preferences: true,
          },
        },
      },
    });

    if (!user || user.role !== 'MERCHANT') {
      return { error: 'NOT_FOUND', message: 'Merchant not found' };
    }

    const stats = await ReviewRepository.getStats(merchantId);

    return {
      merchant: {
        id: user.id,
        phone: user.phone,
        profile: user.profile,
        memberSince: user.createdAt,
        ...stats,
      },
    };
  },
};

module.exports = reviewService;
