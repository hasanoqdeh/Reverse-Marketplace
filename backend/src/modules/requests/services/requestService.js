'use strict';

const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const RequestRepository = require('../repositories/RequestRepository');
const RequestDraftRepository = require('../repositories/RequestDraftRepository');
const RequestImageRepository = require('../repositories/RequestImageRepository');
const CategoryRepository = require('../repositories/CategoryRepository');
const redisClient = require('../../../cache/redis');
const eventPublisher = require('../../../events/publisher');
const prisma = require('../../../prisma/client');
const config = require('../../../config');
const logger = require('../../../utils/logger');

const requestService = {
  // ─── Drafts ────────────────────────────────────────────────────

  async createDraft(buyerId, data) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + config.request.draftExpiryDays);

    const draft = await RequestDraftRepository.create({
      buyerId,
      categoryId: data.categoryId || null,
      title: data.title || null,
      description: data.description || null,
      budgetMin: data.budgetMin ? parseFloat(data.budgetMin) : null,
      budgetMax: data.budgetMax ? parseFloat(data.budgetMax) : null,
      locationLat: data.location?.lat ? parseFloat(data.location.lat) : null,
      locationLng: data.location?.lng ? parseFloat(data.location.lng) : null,
      locationAddress: data.location?.address || null,
      autoSaveData: data.autoSaveData || {},
      expiresAt,
    });

    logger.info('Draft created', { draftId: draft.id, buyerId });
    return draft;
  },

  async updateDraft(draftId, buyerId, data) {
    const draft = await RequestDraftRepository.findByIdAndBuyer(draftId, buyerId);
    if (!draft) {
      return { error: 'DRAFT_NOT_FOUND', message: 'Draft not found' };
    }

    const updated = await RequestDraftRepository.update(draftId, {
      categoryId: data.categoryId !== undefined ? data.categoryId : draft.categoryId,
      title: data.title !== undefined ? data.title : draft.title,
      description: data.description !== undefined ? data.description : draft.description,
      budgetMin: data.budgetMin !== undefined ? parseFloat(data.budgetMin) : draft.budgetMin,
      budgetMax: data.budgetMax !== undefined ? parseFloat(data.budgetMax) : draft.budgetMax,
      locationLat: data.location?.lat !== undefined ? parseFloat(data.location.lat) : draft.locationLat,
      locationLng: data.location?.lng !== undefined ? parseFloat(data.location.lng) : draft.locationLng,
      locationAddress: data.location?.address !== undefined ? data.location.address : draft.locationAddress,
      autoSaveData: data.autoSaveData || draft.autoSaveData,
    });

    return { draft: updated };
  },

  async getDraftsByBuyer(buyerId) {
    return RequestDraftRepository.findByBuyer(buyerId);
  },

  async deleteDraft(draftId, buyerId) {
    const draft = await RequestDraftRepository.findByIdAndBuyer(draftId, buyerId);
    if (!draft) return false;
    await RequestDraftRepository.delete(draftId);
    return true;
  },

  // ─── Publish ───────────────────────────────────────────────────

  async publishRequest(draftIdOrBuyerId, buyerId, data) {
    if (!data.title || !data.description || !data.categoryId) {
      return {
        error: 'VALIDATION_ERROR',
        validationErrors: [
          !data.title && { field: 'title', message: 'Title is required' },
          !data.description && { field: 'description', message: 'Description is required' },
          !data.categoryId && { field: 'categoryId', message: 'Category is required' },
        ].filter(Boolean),
      };
    }

    const category = await CategoryRepository.findById(data.categoryId);
    if (!category || !category.isActive) {
      return { error: 'INVALID_CATEGORY', message: 'Category not found or inactive' };
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (data.expiresInDays ? data.expiresInDays * 24 : config.request.defaultExpiryHours));

    const publishedAt = new Date();

    const request = await RequestRepository.create({
      buyerId,
      categoryId: data.categoryId,
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

    await this._upsertSearchIndex(request);

    await eventPublisher.requestCreated(
      request.id, buyerId, data.categoryId, data.title,
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

  async extendRequest(requestId, buyerId, reason) {
    const request = await RequestRepository.findByIdAndBuyer(requestId, buyerId);
    if (!request) return { error: 'NOT_FOUND' };
    if (!['ACTIVE', 'HAS_BIDS'].includes(request.status)) {
      return { error: 'INVALID_STATUS', message: 'Only active requests can be extended' };
    }

    const originalExpiresAt = request.expiresAt;
    const newExpiresAt = new Date(originalExpiresAt);
    newExpiresAt.setHours(newExpiresAt.getHours() + config.request.maxExtensionHours);

    await RequestRepository.update(requestId, { expiresAt: newExpiresAt });

    await prisma.requestExtension.create({
      data: {
        requestId,
        originalExpiresAt,
        newExpiresAt,
        extensionReason: reason || null,
        extendedBy: buyerId,
      },
    });

    await redisClient.invalidateRequest(requestId);
    await eventPublisher.requestExtended(requestId, buyerId, originalExpiresAt, newExpiresAt, reason);

    logger.info('Request extended', { requestId, newExpiresAt });
    return { success: true, newExpiresAt };
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

  async _upsertSearchIndex(request) {
    const searchText = `${request.title} ${request.description} ${request.locationCity || ''} ${request.locationCountry || ''}`;
    const budgetRange = request.budgetMax
      ? `${request.budgetMin || 0}-${request.budgetMax}`
      : null;

    await prisma.requestSearchIndex.upsert({
      where: { requestId: request.id },
      update: {
        categoryPath: request.categoryId,
        locationText: [request.locationCity, request.locationCountry].filter(Boolean).join(', '),
        budgetRange,
      },
      create: {
        requestId: request.id,
        categoryPath: request.categoryId,
        locationText: [request.locationCity, request.locationCountry].filter(Boolean).join(', '),
        budgetRange,
      },
    });
  },

};

module.exports = requestService;
