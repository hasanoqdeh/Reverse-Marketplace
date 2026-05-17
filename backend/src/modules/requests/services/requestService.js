'use strict';

const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const RequestRepository = require('../repositories/RequestRepository');
const RequestImageRepository = require('../repositories/RequestImageRepository');
const CategoryRepository = require('../repositories/CategoryRepository');
const redisClient = require('../../../cache/redis');
const eventPublisher = require('../../../events/publisher');
const config = require('../../../config');
const logger = require('../../../utils/logger');

const requestService = {
  // ─── Publish ───────────────────────────────────────────────────

  async publishRequest(draftIdOrBuyerId, buyerId, data) {
    if (!data.title || !data.description) {
      return {
        error: 'VALIDATION_ERROR',
        validationErrors: [
          !data.title && { field: 'title', message: 'Title is required' },
          !data.description && { field: 'description', message: 'Description is required' },
        ].filter(Boolean),
      };
    }

    if (data.categoryId) {
      const category = await CategoryRepository.findById(data.categoryId);
      if (!category || !category.isActive) {
        return { error: 'INVALID_CATEGORY', message: 'Category not found or inactive' };
      }
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (data.expiresInDays ? data.expiresInDays * 24 : config.request.defaultExpiryHours));

    const publishedAt = new Date();

    const request = await RequestRepository.create({
      buyerId,
      categoryId: data.categoryId || null,
      title: data.title,
      description: data.description,
      budgetMin: data.budgetMin ? parseFloat(data.budgetMin) : null,
      budgetMax: data.budgetMax ? parseFloat(data.budgetMax) : null,
      locationLat: data.location?.lat ? parseFloat(data.location.lat) : null,
      locationLng: data.location?.lng ? parseFloat(data.location.lng) : null,
      locationAddress: data.location?.address || null,
      locationCity: data.location?.city || null,
      locationCountry: data.location?.country || null,
      status: 'ACTIVE',
      priorityScore: this._calculatePriorityScore(data),
      publishedAt,
      expiresAt,
    });

    await eventPublisher.requestCreated(
      request.id, buyerId, data.categoryId || null, data.title,
      publishedAt.toISOString(), expiresAt.toISOString()
    );

    logger.info('Request published', { requestId: request.id, buyerId });
    return { request };
  },

  // ─── Read ──────────────────────────────────────────────────────

  async getRequest(id, viewerUserId = null, ip = null) {
    const cached = await redisClient.getCachedRequest(id);
    if (cached) {
      eventPublisher.requestViewed(id, viewerUserId, ip).catch(() => {});
      return cached;
    }

    const request = await RequestRepository.findById(id);
    if (!request) return null;

    await redisClient.cacheRequest(id, request);
    eventPublisher.requestViewed(id, viewerUserId, ip).catch(() => {});

    return request;
  },

  async searchRequests(filters, pagination, sorting) {
    const cacheKey = JSON.stringify({ filters, pagination, sorting });
    const cached = await redisClient.getCachedSearchResults(cacheKey);
    if (cached) return cached;

    const result = await RequestRepository.search({ filters, pagination, sorting });

    await redisClient.cacheSearchResults(cacheKey, result);
    return result;
  },

  async getRequestsByBuyer(buyerId, options) {
    return RequestRepository.findByBuyer(buyerId, options);
  },

  // ─── Status transitions ────────────────────────────────────────

  async cancelRequest(requestId, buyerId, reason) {
    const request = await RequestRepository.findByIdAndBuyer(requestId, buyerId);
    if (!request) return { error: 'NOT_FOUND' };
    if (!['ACTIVE', 'HAS_BIDS', 'DRAFT'].includes(request.status)) {
      return { error: 'INVALID_STATUS', message: `Cannot cancel a request in ${request.status} status` };
    }

    const oldStatus = request.status;
    await RequestRepository.updateStatus(requestId, 'CANCELLED');
    await redisClient.invalidateRequest(requestId);
    await eventPublisher.requestCancelled(requestId, buyerId, reason || 'User cancelled');

    logger.info('Request cancelled', { requestId, buyerId });
    return { success: true };
  },

  async completeRequest(requestId, buyerId, acceptedBidId, merchantId, finalAmount) {
    const request = await RequestRepository.findByIdAndBuyer(requestId, buyerId);
    if (!request) return { error: 'NOT_FOUND' };
    if (request.status !== 'HAS_BIDS') {
      return { error: 'INVALID_STATUS', message: 'Request must have bids to be completed' };
    }

    await RequestRepository.update(requestId, { status: 'COMPLETED' });
    await redisClient.invalidateRequest(requestId);
    await eventPublisher.requestCompleted(requestId, buyerId, acceptedBidId, merchantId, finalAmount);

    logger.info('Request completed', { requestId, buyerId, merchantId });
    return { success: true };
  },

  // ─── Expiry job ────────────────────────────────────────────────

  async processExpiredRequests() {
    const expired = await RequestRepository.findExpired();

    for (const request of expired) {
      await RequestRepository.updateStatus(request.id, 'EXPIRED');
      await redisClient.invalidateRequest(request.id);
      await eventPublisher.requestExpired(request.id, request.buyerId);
      logger.info('Request expired', { requestId: request.id });
    }

    return expired.length;
  },

  // ─── Helpers ───────────────────────────────────────────────────

  _calculatePriorityScore(data) {
    let score = 0;
    if (data.budgetMax) score += Math.min(Math.floor(data.budgetMax / 100), 50);
    if (data.location) score += 10;
    if (data.description && data.description.length > 100) score += 5;
    return score;
  },

};

module.exports = requestService;
