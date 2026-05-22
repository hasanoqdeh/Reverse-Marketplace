'use strict';

const bidService = require('../services/bidService');
const RequestRepository = require('../../requests/repositories/RequestRepository');
const notificationService = require('../../notifications/services/notificationService');
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

      // Notify buyer directly (no RabbitMQ dependency)
      RequestRepository.findById(result.bid.requestId).then(request => {
        if (request) {
          notificationService.send(req.app.get('io'), {
            userId: request.buyerId,
            type: 'BID_PLACED',
            title: 'New bid on your request',
            body: `A merchant placed a $${parseFloat(result.bid.amount).toFixed(2)} bid on your request`,
            data: { bidId: result.bid.id, requestId: result.bid.requestId },
          }).catch(() => {});
        }
      }).catch(() => {});

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

      // Notify merchant directly
      notificationService.send(req.app.get('io'), {
        userId: result.merchantId,
        type: 'BID_ACCEPTED',
        title: 'Your bid was accepted!',
        body: 'Your bid has been accepted. Get ready to fulfill the order.',
        data: { bidId: result.bidId },
      }).catch(() => {});

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

  // ─── Fulfillment ─────────────────────────────────────────────

  async updateFulfillmentStatus(req, res) {
    try {
      const { id } = req.params;
      const merchantId = req.user.id;
      const { status } = req.body;

      const VALID = ['PREPARING', 'IN_DELIVERY', 'DELIVERED'];
      if (!VALID.includes(status)) {
        return res.status(422).json({ success: false, message: `Status must be one of: ${VALID.join(', ')}`, error: 'VALIDATION_ERROR' });
      }

      const result = await bidService.updateFulfillmentStatus(id, merchantId, status);

      if (result.error) {
        const statusMap = { NOT_FOUND: 404, INVALID_STATUS: 422, INVALID_TRANSITION: 422 };
        return res.status(statusMap[result.error] || 400).json({ success: false, message: result.message, error: result.error });
      }

      // Notify buyer about fulfillment progress directly
      const FULFILLMENT_MESSAGES = {
        PREPARING:   'Merchant is preparing your order',
        IN_DELIVERY: 'Your order is on the way!',
        DELIVERED:   'Your order has been delivered — please confirm receipt',
      };
      RequestRepository.findById(result.bid.requestId).then(request => {
        if (request && FULFILLMENT_MESSAGES[status]) {
          notificationService.send(req.app.get('io'), {
            userId: request.buyerId,
            type: 'FULFILLMENT_UPDATED',
            title: 'Order status updated',
            body: FULFILLMENT_MESSAGES[status],
            data: { bidId: req.params.id, requestId: result.bid.requestId, newStatus: status },
          }).catch(() => {});
        }
      }).catch(() => {});

      res.json({ success: true, bid: result.bid, message: 'Fulfillment status updated' });
    } catch (err) {
      logger.error('updateFulfillmentStatus error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async confirmDelivery(req, res) {
    try {
      const { id } = req.params;
      const buyerId = req.user.id;
      const result = await bidService.confirmDelivery(id, buyerId);

      if (result.error) {
        const statusMap = { NOT_FOUND: 404, FORBIDDEN: 403, INVALID_STATUS: 422 };
        return res.status(statusMap[result.error] || 400).json({ success: false, message: result.message, error: result.error });
      }

      // Notify merchant that delivery was confirmed
      notificationService.send(req.app.get('io'), {
        userId: result.merchantId,
        type: 'DELIVERY_CONFIRMED',
        title: 'Delivery confirmed!',
        body: 'The buyer has confirmed receipt. Transaction complete!',
        data: { bidId: result.bidId, requestId: result.requestId },
      }).catch(() => {});

      res.json({ success: true, message: 'Delivery confirmed', bidId: result.bidId, merchantId: result.merchantId });
    } catch (err) {
      logger.error('confirmDelivery error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

};

module.exports = bidController;
