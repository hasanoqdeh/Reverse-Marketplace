'use strict';

const express = require('express');
const requestAdminController = require('../controllers/requestAdminController');
const { authenticate } = require('../../../middleware/authenticate');
const { authorizeAdmin } = require('../../../middleware/authorizeAdmin');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorizeAdmin);

// Request management
router.get('/requests', requestAdminController.listRequests);
router.get('/requests/:id', requestAdminController.getRequest);
router.patch('/requests/:id/status', requestAdminController.updateRequestStatus);
router.delete('/requests/:id', requestAdminController.deleteRequest);
router.post('/requests/process-expired', requestAdminController.triggerExpiryProcessing);

// Category management
router.post('/categories', requestAdminController.createCategory);
router.put('/categories/:id', requestAdminController.updateCategory);
router.delete('/categories/:id', requestAdminController.deleteCategory);

// Analytics
router.get('/analytics', requestAdminController.getAnalytics);

module.exports = router;
