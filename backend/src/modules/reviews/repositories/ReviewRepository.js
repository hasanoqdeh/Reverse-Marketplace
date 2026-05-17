'use strict';

const prisma = require('../../../prisma/client');

const ReviewRepository = {
  async create(data) {
    return prisma.review.create({ data });
  },

  async findByBidAndReviewer(bidId, reviewerId) {
    return prisma.review.findUnique({ where: { bidId_reviewerId: { bidId, reviewerId } } });
  },

  async findByReviewee(revieweeId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { revieweeId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { revieweeId } }),
    ]);
    return { reviews, total, page, limit };
  },

  async getStats(revieweeId) {
    const agg = await prisma.review.aggregate({
      where: { revieweeId },
      _avg: { rating: true },
      _count: { id: true },
    });
    const completedBids = await prisma.bid.count({
      where: { merchantId: revieweeId, fulfillmentStatus: 'CONFIRMED' },
    });
    return {
      avgRating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : null,
      reviewCount: agg._count.id,
      completedBids,
    };
  },
};

module.exports = ReviewRepository;
