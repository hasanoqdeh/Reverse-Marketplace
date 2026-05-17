'use strict';

const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const requestService = require('../services/requestService');
const categoryService = require('../services/categoryService');
const RequestImageRepository = require('../repositories/RequestImageRepository');
const RequestRepository = require('../repositories/RequestRepository');
const config = require('../../../config');
const logger = require('../../../utils/logger');

const requestController = {
  // ─── Categories ─────────────────────────────────────────────────

  async getCategories(req, res) {
    try {
      const categories = await categoryService.getAllCategories();
      res.json({ success: true, categories });
    } catch (err) {
      logger.error('getCategories error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  // ─── Publish ────────────────────────────────────────────────────

  async publishRequest(req, res) {
    try {
      const buyerId = req.user.id;
      const result = await requestService.publishRequest(null, buyerId, req.body);

      if (result.error === 'VALIDATION_ERROR') {
        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          error: 'VALIDATION_ERROR',
          validationErrors: result.validationErrors,
        });
      }

      if (result.error) {
        return res.status(400).json({ success: false, message: result.message, error: result.error });
      }

      res.status(201).json({
        success: true,
        requestId: result.request.id,
        publishedAt: result.request.publishedAt,
        message: 'Request published',
      });
    } catch (err) {
      logger.error('publishRequest error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  // ─── Read ───────────────────────────────────────────────────────

  async getRequest(req, res) {
    try {
      const { id } = req.params;
      const viewerUserId = req.user?.id || null;
      const ip = req.ip;

      const request = await requestService.getRequest(id, viewerUserId, ip);
      if (!request) return res.status(404).json({ success: false, message: 'Request not found', error: 'NOT_FOUND' });

      res.json({ success: true, request });
    } catch (err) {
      logger.error('getRequest error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async searchRequests(req, res) {
    try {
      const { page = 1, limit = 20, sortBy, sortOrder, ...rawFilters } = req.query;

      const filters = {};
      if (rawFilters.categories) filters.categories = rawFilters.categories.split(',');
      if (rawFilters.status) filters.status = rawFilters.status.split(',');
      if (rawFilters.buyerId) filters.buyerId = rawFilters.buyerId;
      if (rawFilters.budgetMin || rawFilters.budgetMax) {
        filters.budgetRange = {
          min: parseFloat(rawFilters.budgetMin) || 0,
          max: rawFilters.budgetMax ? parseFloat(rawFilters.budgetMax) : null,
        };
      }
      if (rawFilters.startDate || rawFilters.endDate) {
        filters.dateRange = { startDate: rawFilters.startDate, endDate: rawFilters.endDate };
      }

      const result = await requestService.searchRequests(
        filters,
        { page: parseInt(page, 10), limit: Math.min(parseInt(limit, 10), 100) },
        { field: sortBy, order: sortOrder }
      );

      res.json({
        success: true,
        requests: result.requests,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (err) {
      logger.error('searchRequests error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async getMyRequests(req, res) {
    try {
      const buyerId = req.user.id;
      const { page = 1, limit = 20, status } = req.query;

      const result = await requestService.getRequestsByBuyer(buyerId, {
        status: status ? status.split(',') : null,
        page: parseInt(page, 10),
        limit: Math.min(parseInt(limit, 10), 100),
      });

      res.json({
        success: true,
        requests: result.requests,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (err) {
      logger.error('getMyRequests error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  // ─── Status actions ─────────────────────────────────────────────

  async cancelRequest(req, res) {
    try {
      const { id } = req.params;
      const buyerId = req.user.id;
      const { reason } = req.body;

      const result = await requestService.cancelRequest(id, buyerId, reason);
      if (result.error) {
        const status = result.error === 'NOT_FOUND' ? 404 : 400;
        return res.status(status).json({ success: false, message: result.message, error: result.error });
      }

      res.json({ success: true, message: 'Request cancelled' });
    } catch (err) {
      logger.error('cancelRequest error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async completeRequest(req, res) {
    try {
      const { id } = req.params;
      const buyerId = req.user.id;
      const { acceptedBidId, merchantId, finalAmount } = req.body;

      const result = await requestService.completeRequest(id, buyerId, acceptedBidId, merchantId, finalAmount);
      if (result.error) {
        const status = result.error === 'NOT_FOUND' ? 404 : 400;
        return res.status(status).json({ success: false, message: result.message, error: result.error });
      }

      res.json({ success: true, message: 'Request marked as completed' });
    } catch (err) {
      logger.error('completeRequest error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  // ─── Images ─────────────────────────────────────────────────────

  async uploadImage(req, res) {
    try {
      const { id: requestId } = req.params;
      const buyerId = req.user.id;

      const request = await RequestRepository.findByIdAndBuyer(requestId, buyerId);
      if (!request) return res.status(404).json({ success: false, message: 'Request not found', error: 'NOT_FOUND' });

      if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded', error: 'NO_FILE' });

      const imageCount = await RequestImageRepository.countByRequest(requestId);
      if (imageCount >= config.upload.maxImagesPerRequest) {
        return res.status(400).json({
          success: false,
          message: `Maximum ${config.upload.maxImagesPerRequest} images per request`,
          error: 'MAX_IMAGES_REACHED',
        });
      }

      const isFirstImage = imageCount === 0;
      const imageUrl = `/uploads/${req.file.filename}`;

      const image = await RequestImageRepository.create({
        requestId,
        imageUrl,
        thumbnailUrl: imageUrl,
        originalFilename: req.file.originalname,
        fileSize: BigInt(req.file.size),
        mimeType: req.file.mimetype,
        sortOrder: imageCount,
        isPrimary: isFirstImage,
      });

      res.status(201).json({
        success: true,
        imageId: image.id,
        imageUrl: image.imageUrl,
        thumbnailUrl: image.thumbnailUrl,
        message: 'Image uploaded',
      });
    } catch (err) {
      logger.error('uploadImage error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },

  async deleteImage(req, res) {
    try {
      const { id: requestId, imageId } = req.params;
      const buyerId = req.user.id;

      const request = await RequestRepository.findByIdAndBuyer(requestId, buyerId);
      if (!request) return res.status(404).json({ success: false, message: 'Request not found', error: 'NOT_FOUND' });

      const image = await RequestImageRepository.findByIdAndRequest(imageId, requestId);
      if (!image) return res.status(404).json({ success: false, message: 'Image not found', error: 'NOT_FOUND' });

      const filePath = path.join(process.cwd(), image.imageUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      await RequestImageRepository.delete(imageId);
      res.json({ success: true, message: 'Image deleted' });
    } catch (err) {
      logger.error('deleteImage error', { error: err.message });
      res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
    }
  },
};

module.exports = requestController;
