'use strict';

const express = require('express');
const router = express.Router();
const IdentityAdminController = require('../controllers/identityAdminController');
const { authenticate } = require('../../../shared/middleware/authenticate');
const { requireRole } = require('../../../shared/middleware/authorize');
const { getRateLimitMiddleware } = require('../../../shared/middleware/rateLimiting');
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// All /admin routes require a valid ADMIN JWT
router.use(authenticate);
router.use(requireRole('ADMIN'));
router.use(getRateLimitMiddleware('admin'));

// ── User management ────────────────────────────────────────────────────────
router.get('/users', asyncHandler(IdentityAdminController.getUsers));
router.post('/users/bulk-action', asyncHandler(IdentityAdminController.bulkAction));
router.get('/users/:userId', asyncHandler(IdentityAdminController.getUserById));
router.patch('/users/:userId', asyncHandler(IdentityAdminController.updateUser));
router.post('/users/:userId/suspend', asyncHandler(IdentityAdminController.suspendUser));
router.post('/users/:userId/ban', asyncHandler(IdentityAdminController.banUser));
router.post('/users/:userId/activate', asyncHandler(IdentityAdminController.activateUser));
router.get('/users/:userId/sessions', asyncHandler(IdentityAdminController.getUserSessions));
router.delete('/users/:userId/sessions/:sessionId', asyncHandler(IdentityAdminController.revokeUserSession));
router.get('/users/:userId/logs', asyncHandler(IdentityAdminController.getUserLogs));

// ── Dashboard & logs ───────────────────────────────────────────────────────
router.get('/dashboard/metrics', asyncHandler(IdentityAdminController.getDashboardMetrics));
router.get('/logs', asyncHandler(IdentityAdminController.getActivityLogs));

module.exports = router;
