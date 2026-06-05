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

  async getPublicStats() {
    const [agg, completedRequests, merchantCount] = await Promise.all([
      prisma.review.aggregate({ _avg: { rating: true } }),
      prisma.request.count({ where: { status: 'COMPLETED' } }),
      prisma.user.count({ where: { role: 'MERCHANT', status: 'ACTIVE' } }),
    ]);
    return {
      merchantCount,
      completedRequests,
      avgRating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : null,
    };
  },

  async getTopMerchants(limit = 8) {
    const topReviewed = await prisma.review.groupBy({
      by: ['revieweeId'],
      _avg: { rating: true },
      _count: { id: true },
      orderBy: { _avg: { rating: 'desc' } },
      take: limit,
    });
    if (topReviewed.length === 0) return [];
    const ids = topReviewed.map(r => r.revieweeId);
    const [users, bidCounts] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: ids }, role: 'MERCHANT' },
        select: {
          id: true, createdAt: true,
          profile: { select: { firstName: true, lastName: true, city: true, profileImageUrl: true } },
        },
      }),
      prisma.bid.groupBy({
        by: ['merchantId'],
        where: { merchantId: { in: ids }, fulfillmentStatus: 'CONFIRMED' },
        _count: { id: true },
      }),
    ]);
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));
    const bidMap  = Object.fromEntries(bidCounts.map(b => [b.merchantId, b._count.id]));
    return topReviewed
      .filter(r => userMap[r.revieweeId])
      .map(r => ({
        id: r.revieweeId,
        profile: userMap[r.revieweeId].profile,
        memberSince: userMap[r.revieweeId].createdAt,
        avgRating: r._avg.rating ? Math.round(r._avg.rating * 10) / 10 : null,
        reviewCount: r._count.id,
        completedBids: bidMap[r.revieweeId] ?? 0,
      }));
  },
};

module.exports = ReviewRepository;
