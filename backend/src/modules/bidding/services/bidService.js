'use strict';

const BidRepository = require('../repositories/BidRepository');
const RequestRepository = require('../../requests/repositories/RequestRepository');
const ChatRoomRepository = require('../../chat/repositories/ChatRoomRepository');
const eventPublisher = require('../../../events/publisher');
const logger = require('../../../utils/logger');

const BIDDABLE_STATUSES = ['ACTIVE', 'HAS_BIDS'];
const BID_EXPIRY_DAYS = 7;

const bidService = {
  // ─── Bid Submission ────────────────────────────────────────────

  async submitBid(merchantId, data) {
    const { requestId, amount, deliveryDays, deliveryNotes, specialTerms } = data;

    const request = await RequestRepository.findById(requestId);
    if (!request) return { error: 'NOT_FOUND', message: 'Request not found' };

    if (!BIDDABLE_STATUSES.includes(request.status)) {
      return { error: 'INVALID_STATUS', message: `Cannot bid on a request with status ${request.status}` };
    }

    if (request.buyerId === merchantId) {
      return { error: 'FORBIDDEN', message: 'You cannot bid on your own request' };
    }

    const existing = await BidRepository.findByRequestAndMerchant(requestId, merchantId);
    if (existing) {
      return { error: 'DUPLICATE_BID', message: 'You have already submitted a bid on this request' };
    }

    if (!amount || parseFloat(amount) <= 0) {
      return { error: 'VALIDATION_ERROR', message: 'Bid amount must be greater than 0' };
    }
    if (!deliveryDays || parseInt(deliveryDays, 10) <= 0) {
      return { error: 'VALIDATION_ERROR', message: 'Delivery days must be greater than 0' };
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + BID_EXPIRY_DAYS);

    const priorityScore = this._calcPriorityScore(parseFloat(amount), parseInt(deliveryDays, 10));

    const bid = await BidRepository.create({
      requestId,
      merchantId,
      amount: parseFloat(amount),
      deliveryDays: parseInt(deliveryDays, 10),
      deliveryNotes: deliveryNotes || null,
      specialTerms: specialTerms || null,
      priorityScore,
      expiresAt,
    });

    // Update request status and bid count
    await RequestRepository.update(requestId, {
      status: 'HAS_BIDS',
      bidCount: { increment: 1 },
    });

    // Auto-create a BID-type chat room so buyer and merchant can negotiate
    try {
      const chatRoom = await ChatRoomRepository.create({
        name: `Bid: ${request.title.slice(0, 40)}`,
        type: 'BID',
        relatedRequestId: requestId,
        relatedBidId: bid.id,
        createdBy: merchantId,
        participantIds: [request.buyerId],
      });
      await BidRepository.update(bid.id, { chatRoomId: chatRoom.id });
      bid.chatRoomId = chatRoom.id;
    } catch (err) {
      logger.warn('Could not auto-create bid chat room', { bidId: bid.id, error: err.message });
    }

    const competition = await BidRepository.getCompetitionData(requestId);
    const yourPosition = await this._calcPosition(requestId, parseFloat(amount));

    await eventPublisher.bidSubmitted(bid.id, requestId, merchantId, parseFloat(amount), parseInt(deliveryDays, 10), expiresAt);

    logger.info('Bid submitted', { bidId: bid.id, requestId, merchantId });

    return {
      bid,
      competition: {
        totalBids: competition.totalBids,
        lowestAmount: competition.lowestAmount,
        averageAmount: competition.averageAmount,
        yourPosition,
      },
    };
  },

  // ─── Get Bid ───────────────────────────────────────────────────

  async getBid(bidId, requestingUserId) {
    const bid = await BidRepository.findById(bidId);
    if (!bid) return { error: 'NOT_FOUND', message: 'Bid not found' };

    const request = await RequestRepository.findById(bid.requestId);

    // Merchant can see their own bid; buyer can see bids on their request
    if (bid.merchantId !== requestingUserId && request?.buyerId !== requestingUserId) {
      return { error: 'FORBIDDEN', message: 'Access denied' };
    }

    return { bid };
  },

  // ─── Update Bid ────────────────────────────────────────────────

  async updateBid(bidId, merchantId, data) {
    const bid = await BidRepository.findByIdAndMerchant(bidId, merchantId);
    if (!bid) return { error: 'NOT_FOUND', message: 'Bid not found' };

    if (bid.status !== 'PENDING') {
      return { error: 'INVALID_STATUS', message: 'Only pending bids can be updated' };
    }

    const { amount, deliveryDays, deliveryNotes, specialTerms } = data;

    const newAmount = amount !== undefined ? parseFloat(amount) : parseFloat(bid.amount);
    const newDays = deliveryDays !== undefined ? parseInt(deliveryDays, 10) : bid.deliveryDays;

    const priorityScore = this._calcPriorityScore(newAmount, newDays);

    const updated = await BidRepository.update(bidId, {
      amount: newAmount,
      deliveryDays: newDays,
      deliveryNotes: deliveryNotes !== undefined ? deliveryNotes : bid.deliveryNotes,
      specialTerms: specialTerms !== undefined ? specialTerms : bid.specialTerms,
      priorityScore,
    });

    logger.info('Bid updated', { bidId, merchantId });
    return { bid: updated };
  },

  // ─── Withdraw Bid ──────────────────────────────────────────────

  async withdrawBid(bidId, merchantId) {
    const bid = await BidRepository.findByIdAndMerchant(bidId, merchantId);
    if (!bid) return { error: 'NOT_FOUND', message: 'Bid not found' };

    if (!['PENDING'].includes(bid.status)) {
      return { error: 'INVALID_STATUS', message: 'Only pending bids can be withdrawn' };
    }

    await BidRepository.updateStatus(bidId, 'WITHDRAWN', { withdrawnAt: new Date() });

    // Decrement request bid count
    const currentCount = await BidRepository.countByRequest(bid.requestId);
    await RequestRepository.update(bid.requestId, {
      bidCount: Math.max(0, currentCount),
      ...(currentCount === 0 ? { status: 'ACTIVE' } : {}),
    });

    await eventPublisher.bidWithdrawn(bidId, bid.requestId, merchantId);

    logger.info('Bid withdrawn', { bidId, merchantId });
    return { success: true };
  },

  // ─── Get Bids for Request (Buyer) ─────────────────────────────

  async getBidsForRequest(requestId, buyerId, options = {}) {
    const request = await RequestRepository.findById(requestId);
    if (!request) return { error: 'NOT_FOUND', message: 'Request not found' };

    if (request.buyerId !== buyerId) return { error: 'FORBIDDEN', message: 'Access denied' };

    const { page = 1, limit = 20, sortField = 'amount', sortOrder = 'asc', statuses } = options;

    const result = await BidRepository.findByRequest(requestId, {
      statuses,
      page: parseInt(page, 10),
      limit: Math.min(parseInt(limit, 10), 100),
      sortField,
      sortOrder,
    });

    const competition = await BidRepository.getCompetitionData(requestId);

    return { ...result, marketAnalysis: competition };
  },

  // ─── Accept Bid ────────────────────────────────────────────────

  async acceptBid(bidId, buyerId) {
    const bid = await BidRepository.findById(bidId);
    if (!bid) return { error: 'NOT_FOUND', message: 'Bid not found' };

    if (bid.status !== 'PENDING') {
      return { error: 'INVALID_STATUS', message: 'Only pending bids can be accepted' };
    }

    const request = await RequestRepository.findById(bid.requestId);
    if (!request) return { error: 'NOT_FOUND', message: 'Request not found' };

    if (request.buyerId !== buyerId) return { error: 'FORBIDDEN', message: 'Access denied' };

    await BidRepository.updateStatus(bidId, 'ACCEPTED', {
      acceptedAt: new Date(),
      fulfillmentStatus: 'AWAITING',
      fulfillmentUpdatedAt: new Date(),
    });
    await BidRepository.rejectAllExcept(bid.requestId, bidId);
    // Keep request as HAS_BIDS during fulfillment; complete after delivery confirmed
    await RequestRepository.updateStatus(bid.requestId, 'HAS_BIDS');

    await eventPublisher.bidAccepted(bidId, bid.requestId, bid.merchantId, buyerId, parseFloat(bid.amount));

    logger.info('Bid accepted', { bidId, requestId: bid.requestId, buyerId });
    return { success: true, bidId, merchantId: bid.merchantId, chatRoomId: bid.chatRoomId };
  },

  // ─── Reject Bid ────────────────────────────────────────────────

  async rejectBid(bidId, buyerId) {
    const bid = await BidRepository.findById(bidId);
    if (!bid) return { error: 'NOT_FOUND', message: 'Bid not found' };

    if (bid.status !== 'PENDING') {
      return { error: 'INVALID_STATUS', message: 'Only pending bids can be rejected' };
    }

    const request = await RequestRepository.findById(bid.requestId);
    if (!request) return { error: 'NOT_FOUND', message: 'Request not found' };

    if (request.buyerId !== buyerId) return { error: 'FORBIDDEN', message: 'Access denied' };

    await BidRepository.updateStatus(bidId, 'REJECTED', { rejectedAt: new Date() });

    await eventPublisher.bidRejected(bidId, bid.requestId, bid.merchantId, buyerId);

    logger.info('Bid rejected', { bidId, merchantId: bid.merchantId, buyerId });
    return { success: true };
  },

  // ─── Merchant's Bids ───────────────────────────────────────────

  async getMyBids(merchantId, options = {}) {
    const { page = 1, limit = 20, statuses } = options;
    return BidRepository.findByMerchant(merchantId, {
      statuses,
      page: parseInt(page, 10),
      limit: Math.min(parseInt(limit, 10), 100),
    });
  },

  // ─── Fulfillment ───────────────────────────────────────────────

  async updateFulfillmentStatus(bidId, merchantId, newStatus) {
    const VALID_MERCHANT_TRANSITIONS = {
      AWAITING: 'PREPARING',
      PREPARING: 'IN_DELIVERY',
      IN_DELIVERY: 'DELIVERED',
    };

    const bid = await BidRepository.findByIdAndMerchant(bidId, merchantId);
    if (!bid) return { error: 'NOT_FOUND', message: 'Bid not found' };

    if (bid.status !== 'ACCEPTED') {
      return { error: 'INVALID_STATUS', message: 'Bid must be accepted before updating fulfillment' };
    }

    const allowedNext = VALID_MERCHANT_TRANSITIONS[bid.fulfillmentStatus];
    if (!allowedNext || allowedNext !== newStatus) {
      return { error: 'INVALID_TRANSITION', message: `Cannot transition from ${bid.fulfillmentStatus} to ${newStatus}` };
    }

    const updated = await BidRepository.update(bidId, {
      fulfillmentStatus: newStatus,
      fulfillmentUpdatedAt: new Date(),
    });

    await eventPublisher.bidFulfillmentUpdated(bidId, merchantId, bid.fulfillmentStatus, newStatus);

    logger.info('Fulfillment status updated', { bidId, merchantId, from: bid.fulfillmentStatus, to: newStatus });
    return { bid: updated };
  },

  async confirmDelivery(bidId, buyerId) {
    const bid = await BidRepository.findById(bidId);
    if (!bid) return { error: 'NOT_FOUND', message: 'Bid not found' };

    if (bid.status !== 'ACCEPTED') {
      return { error: 'INVALID_STATUS', message: 'Bid must be accepted' };
    }
    if (bid.fulfillmentStatus !== 'DELIVERED') {
      return { error: 'INVALID_STATUS', message: 'Merchant must mark as delivered first' };
    }

    const request = await RequestRepository.findById(bid.requestId);
    if (!request || request.buyerId !== buyerId) {
      return { error: 'FORBIDDEN', message: 'Access denied' };
    }

    await BidRepository.update(bidId, {
      fulfillmentStatus: 'CONFIRMED',
      fulfillmentUpdatedAt: new Date(),
    });

    await RequestRepository.updateStatus(bid.requestId, 'COMPLETED');

    if (bid.chatRoomId) {
      await ChatRoomRepository.deactivate(bid.chatRoomId).catch(() => {});
    }

    await eventPublisher.bidDeliveryConfirmed(bidId, buyerId, bid.merchantId);

    logger.info('Delivery confirmed', { bidId, buyerId, merchantId: bid.merchantId });
    return { success: true, bidId, merchantId: bid.merchantId, requestId: bid.requestId };
  },

  // ─── Internals ─────────────────────────────────────────────────

  _calcPriorityScore(amount, deliveryDays) {
    // Lower amount and fewer days = higher score
    const amountScore = Math.max(0, 100 - Math.floor(amount / 100));
    const deliveryScore = Math.max(0, 50 - deliveryDays);
    return amountScore + deliveryScore;
  },

  async _calcPosition(requestId, amount) {
    const data = await BidRepository.getCompetitionData(requestId);
    if (!data.totalBids) return 1;

    const bids = await require('../../../prisma/client').bid.findMany({
      where: { requestId, status: { not: 'WITHDRAWN' } },
      select: { amount: true },
      orderBy: { amount: 'asc' },
    });

    const position = bids.findIndex((b) => parseFloat(b.amount) >= amount) + 1;
    return position || bids.length + 1;
  },
};

module.exports = bidService;
