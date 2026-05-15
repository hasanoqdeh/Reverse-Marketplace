'use strict';

const express = require('express');
const router = express.Router();
const IdentityAuthController = require('../controllers/identityAuthController');
const { authenticate } = require('../../../shared/middleware/authenticate');
const { getRateLimitMiddleware } = require('../../../shared/middleware/rateLimiting');
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ── Public routes ──────────────────────────────────────────────────────────

// POST /auth/login  — initiate OTP for BUYER, MERCHANT, or ADMIN
router.post(
  '/login',
  getRateLimitMiddleware('otp'),
  asyncHandler(IdentityAuthController.phoneLogin),
);

// POST /auth/verify-otp
router.post(
  '/verify-otp',
  getRateLimitMiddleware('otp'),
  asyncHandler(IdentityAuthController.verifyOtp),
);

// POST /auth/resend-otp
router.post(
  '/resend-otp',
  getRateLimitMiddleware('otp'),
  asyncHandler(IdentityAuthController.resendOtp),
);

// POST /auth/refresh-token
router.post(
  '/refresh-token',
  getRateLimitMiddleware('auth'),
  asyncHandler(IdentityAuthController.refreshToken),
);

// ── Authenticated routes ───────────────────────────────────────────────────

// POST /auth/logout
router.post(
  '/logout',
  authenticate,
  asyncHandler(IdentityAuthController.logout),
);

// PATCH /auth/profile — authenticated user updates their own profile
router.patch(
  '/profile',
  authenticate,
  asyncHandler(IdentityAuthController.updateProfile),
);

// ── Health ─────────────────────────────────────────────────────────────────

router.get('/health', IdentityAuthController.health);

module.exports = router;
