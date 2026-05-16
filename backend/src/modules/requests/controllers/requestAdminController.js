'use strict';

const RequestRepository = require('../repositories/RequestRepository');
const requestService = require('../services/requestService');
const categoryService = require('../services/categoryService');
const prisma = require('../../../prisma/client');
const redisClient = require('../../../cache/redis');
const eventPublisher = require('../../../events/publisher');
const logger = require('../../../utils/logger');

const requestAdminController = {
  // ─── Request management ──────────────────────────────────────────

  async listRequests(req, res) {
    try {
      const { page = 1, limit = 20, status, categories, buyerId, startDate, endDate } = req.query;

      const filters = {};
      if (status) filters.status = status.split(',');
      if (categories) filters.categories = categories.split(',');
      if (buyerId) filters.buyerId = buyerId;
      if (startDate || endDate) filters.dateRange = { startDate, endDate };

      const result = await RequestRepository.search({
        filters,
        pagination: { page: parseInt(page, 10), limit: Math.min(parseInt(limit, 10), 100) },
        sorting: { field: 'created_at', order: 'desc' },
      });

      const analytics = await requestAdminController._getAnalyticsSummary();

      res.json({
        success: true,
        requests: result.requests,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit),
        },
        analytics,
      });
    } catch (err) {
      logger.error('admin listRequests error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async getRequest(req, res) {
    try {
      const { id } = req.params;
      const request = await RequestRepository.findById(id);
      if (!request) return res.status(404).json({ success: false, message: 'Request not found', error: 'NOT_FOUND' });
      res.json({ success: true, request });
    } catch (err) {
      logger.error('admin getRequest error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async updateRequestStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      const adminId = req.user.id;

      const request = await RequestRepository.findById(id);
      if (!request) return res.status(404).json({ success: false, message: 'Request not found', error: 'NOT_FOUND' });

      const validStatuses = ['ACTIVE', 'CANCELLED', 'COMPLETED', 'EXPIRED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status', error: 'INVALID_STATUS' });
      }

      const oldStatus = request.status;
      await RequestRepository.updateStatus(id, status);
      await redisClient.invalidateRequest(id);

      await eventPublisher.requestUpdated(id, request.buyerId, oldStatus, status, adminId);

      logger.info('Admin updated request status', { requestId: id, oldStatus, newStatus: status, adminId });
      res.json({ success: true, message: `Request status updated to ${status}` });
    } catch (err) {
      logger.error('admin updateRequestStatus error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async deleteRequest(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      const request = await RequestRepository.findById(id);
      if (!request) return res.status(404).json({ success: false, message: 'Request not found', error: 'NOT_FOUND' });

      await prisma.request.delete({ where: { id } });
      await redisClient.invalidateRequest(id);

      logger.info('Admin deleted request', { requestId: id, adminId });
      res.json({ success: true, message: 'Request deleted' });
    } catch (err) {
      logger.error('admin deleteRequest error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async triggerExpiryProcessing(req, res) {
    try {
      const count = await requestService.processExpiredRequests();
      logger.info('Admin triggered expiry processing', { expiredCount: count });
      res.json({ success: true, message: `Processed ${count} expired request(s)` });
    } catch (err) {
      logger.error('admin triggerExpiryProcessing error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  // ─── Category management ────────────────────────────────────────

  async createCategory(req, res) {
    try {
      const result = await categoryService.createCategory(req.body);
      if (result.error) {
        return res.status(400).json({ success: false, message: result.message, error: result.error });
      }
      res.status(201).json({ success: true, category: result.category, message: 'Category created' });
    } catch (err) {
      logger.error('admin createCategory error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const result = await categoryService.updateCategory(id, req.body);
      if (result.error) {
        const status = result.error === 'NOT_FOUND' ? 404 : 400;
        return res.status(status).json({ success: false, message: result.message, error: result.error });
      }
      res.json({ success: true, category: result.category, message: 'Category updated' });
    } catch (err) {
      logger.error('admin updateCategory error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const result = await categoryService.deleteCategory(id);
      if (result.error) {
        const status = result.error === 'NOT_FOUND' ? 404 : 400;
        return res.status(status).json({ success: false, message: result.message, error: result.error });
      }
      res.json({ success: true, message: 'Category deleted' });
    } catch (err) {
      logger.error('admin deleteCategory error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  // ─── Analytics ──────────────────────────────────────────────────

  async getAnalytics(req, res) {
    try {
      const analytics = await requestAdminController._getAnalyticsSummary();
      const statusBreakdown = await prisma.request.groupBy({
        by: ['status'],
        _count: { status: true },
      });

      res.json({
        success: true,
        analytics: {
          ...analytics,
          statusBreakdown: statusBreakdown.map((s) => ({ status: s.status, count: s._count.status })),
        },
      });
    } catch (err) {
      logger.error('admin getAnalytics error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async _getAnalyticsSummary() {
    const [totalRequests, activeRequests] = await Promise.all([
      prisma.request.count(),
      prisma.request.count({ where: { status: { in: ['ACTIVE', 'HAS_BIDS'] } } }),
    ]);

    const budgetAgg = await prisma.request.aggregate({
      _sum: { budgetMax: true },
      where: { status: { not: 'CANCELLED' } },
    });

    const completedCount = await prisma.request.count({ where: { status: 'COMPLETED' } });
    const conversionRate = totalRequests > 0
      ? parseFloat(((completedCount / totalRequests) * 100).toFixed(2))
      : 0;

    return {
      totalRequests,
      activeRequests,
      completedRequests: completedCount,
      totalValue: budgetAgg._sum.budgetMax ? parseFloat(budgetAgg._sum.budgetMax) : 0,
      conversionRate,
    };
  },
};

module.exports = requestAdminController;
