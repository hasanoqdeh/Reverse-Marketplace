'use strict';

const bidService = require('../services/bidService');
const logger = require('../../../utils/logger');

const bidController = {
  // ─── Bids ────────────────────────────────────────────────────

  async submitBid(req, res) {
    try {
      const merchantId = req.user.id;
      const result = await bidService.submitBid(merchantId, req.body);

      if (result.error) {
        const statusMap = { NOT_FOUND: 404, FORBIDDEN: 403, DUPLICATE_BID: 409, INVALID_STATUS: 422, VALIDATION_ERROR: 422 };
        return res.status(statusMap[result.error] || 400).json({ success: false, message: result.message, error: result.error });
      }

      res.status(201).json({
        success: true,
        bidId: result.bid.id,
        competition: result.competition,
        message: 'Bid submitted',
      });
    } catch (err) {
      logger.error('submitBid error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async getBid(req, res) {
    try {
      const { id } = req.params;
      const result = await bidService.getBid(id, req.user.id);

      if (result.error) {
        return res.status(result.error === 'NOT_FOUND' ? 404 : 403).json({ success: false, message: result.message, error: result.error });
      }

      res.json({ success: true, bid: result.bid });
    } catch (err) {
      logger.error('getBid error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async updateBid(req, res) {
    try {
      const { id } = req.params;
      const merchantId = req.user.id;
      const result = await bidService.updateBid(id, merchantId, req.body);

      if (result.error) {
        const statusMap = { NOT_FOUND: 404, INVALID_STATUS: 422 };
        return res.status(statusMap[result.error] || 400).json({ success: false, message: result.message, error: result.error });
      }

      res.json({ success: true, bid: result.bid, message: 'Bid updated' });
    } catch (err) {
      logger.error('updateBid error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async withdrawBid(req, res) {
    try {
      const { id } = req.params;
      const merchantId = req.user.id;
      const result = await bidService.withdrawBid(id, merchantId);

      if (result.error) {
        const statusMap = { NOT_FOUND: 404, INVALID_STATUS: 422 };
        return res.status(statusMap[result.error] || 400).json({ success: false, message: result.message, error: result.error });
      }

      res.json({ success: true, message: 'Bid withdrawn' });
    } catch (err) {
      logger.error('withdrawBid error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async getBidsForRequest(req, res) {
    try {
      const { requestId } = req.params;
      const buyerId = req.user.id;
      const { page, limit, sortBy, sortOrder, status } = req.query;

      const result = await bidService.getBidsForRequest(requestId, buyerId, {
        page,
        limit,
        sortField: sortBy,
        sortOrder,
        statuses: status ? status.split(',') : undefined,
      });

      if (result.error) {
        return res.status(result.error === 'NOT_FOUND' ? 404 : 403).json({ success: false, message: result.message, error: result.error });
      }

      res.json({
        success: true,
        bids: result.bids,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit),
        },
        marketAnalysis: result.marketAnalysis,
      });
    } catch (err) {
      logger.error('getBidsForRequest error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async acceptBid(req, res) {
    try {
      const { id } = req.params;
      const buyerId = req.user.id;
      const result = await bidService.acceptBid(id, buyerId);

      if (result.error) {
        const statusMap = { NOT_FOUND: 404, FORBIDDEN: 403, INVALID_STATUS: 422 };
        return res.status(statusMap[result.error] || 400).json({ success: false, message: result.message, error: result.error });
      }

      res.json({ success: true, bidId: result.bidId, merchantId: result.merchantId, message: 'Bid accepted' });
    } catch (err) {
      logger.error('acceptBid error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async rejectBid(req, res) {
    try {
      const { id } = req.params;
      const buyerId = req.user.id;
      const result = await bidService.rejectBid(id, buyerId);

      if (result.error) {
        const statusMap = { NOT_FOUND: 404, FORBIDDEN: 403, INVALID_STATUS: 422 };
        return res.status(statusMap[result.error] || 400).json({ success: false, message: result.message, error: result.error });
      }

      res.json({ success: true, message: 'Bid rejected' });
    } catch (err) {
      logger.error('rejectBid error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async getMyBids(req, res) {
    try {
      const merchantId = req.user.id;
      const { page, limit, status } = req.query;

      const result = await bidService.getMyBids(merchantId, {
        page,
        limit,
        statuses: status ? status.split(',') : undefined,
      });

      res.json({
        success: true,
        bids: result.bids,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (err) {
      logger.error('getMyBids error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  // ─── Templates ───────────────────────────────────────────────

  async createTemplate(req, res) {
    try {
      const merchantId = req.user.id;
      const result = await bidService.createTemplate(merchantId, req.body);

      if (result.error) {
        return res.status(422).json({ success: false, message: result.message, error: result.error });
      }

      res.status(201).json({ success: true, templateId: result.template.id, message: 'Template created' });
    } catch (err) {
      logger.error('createTemplate error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async getTemplates(req, res) {
    try {
      const merchantId = req.user.id;
      const result = await bidService.getTemplates(merchantId);
      res.json({ success: true, templates: result.templates });
    } catch (err) {
      logger.error('getTemplates error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async deleteTemplate(req, res) {
    try {
      const { id } = req.params;
      const merchantId = req.user.id;
      const result = await bidService.deleteTemplate(id, merchantId);

      if (result.error) {
        return res.status(404).json({ success: false, message: result.message, error: result.error });
      }

      res.json({ success: true, message: 'Template deleted' });
    } catch (err) {
      logger.error('deleteTemplate error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },
};

module.exports = bidController;
