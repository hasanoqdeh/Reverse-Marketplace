'use strict';

const prisma = require('../../../prisma/client');
const BidRepository = require('../repositories/BidRepository');
const logger = require('../../../utils/logger');

const bidAdminController = {
  async listBids(req, res) {
    try {
      const { page = 1, limit = 20, status, merchantId, requestId, startDate, endDate } = req.query;

      const take = Math.min(parseInt(limit, 10), 100);
      const skip = (parseInt(page, 10) - 1) * take;

      const where = {};
      if (status && status !== 'ALL') where.status = status;
      if (merchantId) where.merchantId = merchantId;
      if (requestId) where.requestId = requestId;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const [bids, total, analytics] = await Promise.all([
        prisma.bid.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        prisma.bid.count({ where }),
        prisma.bid.aggregate({
          _count: { id: true },
          _sum: { amount: true },
          where: {},
        }),
      ]);

      const statusBreakdown = await prisma.bid.groupBy({
        by: ['status'],
        _count: { id: true },
      });

      res.json({
        success: true,
        bids,
        pagination: {
          page: parseInt(page, 10),
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
        },
        analytics: {
          totalBids: analytics._count.id,
          totalValue: parseFloat(analytics._sum.amount ?? 0),
          statusBreakdown: statusBreakdown.map(s => ({ status: s.status, count: s._count.id })),
        },
      });
    } catch (err) {
      logger.error('admin listBids error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async getBid(req, res) {
    try {
      const { id } = req.params;
      const bid = await BidRepository.findById(id);
      if (!bid) return res.status(404).json({ success: false, message: 'Bid not found', error: 'NOT_FOUND' });

      res.json({ success: true, bid });
    } catch (err) {
      logger.error('admin getBid error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async forceReject(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const bid = await BidRepository.findById(id);
      if (!bid) return res.status(404).json({ success: false, message: 'Bid not found', error: 'NOT_FOUND' });

      if (!['PENDING'].includes(bid.status)) {
        return res.status(422).json({ success: false, message: 'Only pending bids can be force-rejected', error: 'INVALID_STATUS' });
      }

      await BidRepository.updateStatus(id, 'REJECTED', { rejectedAt: new Date() });

      logger.info('Admin force-rejected bid', { bidId: id, adminId: req.user.id, reason });
      res.json({ success: true, message: 'Bid rejected' });
    } catch (err) {
      logger.error('admin forceReject error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },
};

module.exports = bidAdminController;
