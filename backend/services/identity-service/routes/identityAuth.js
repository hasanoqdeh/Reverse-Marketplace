const express = require('express');
const router = express.Router();

const authController = require('../controllers/identityAuthController');
const { validate, schemas, validateAuthInput } = require('../middleware/validation');
const { getRateLimitMiddleware } = require('../middleware/rateLimiting');
const { authenticate } = require('../middleware/auth');

// Apply common validation middleware to all routes
router.use(validateAuthInput);

// Public authentication endpoints
router.post('/phone-login', 
  getRateLimitMiddleware('phoneLogin'),
  validate(schemas.phoneLogin),
  authController.phoneLogin
);

router.post('/verify-otp',
  getRateLimitMiddleware('otpVerification'),
  validate(schemas.otpVerification),
  authController.verifyOTP
);

router.post('/resend-otp',
  getRateLimitMiddleware('otpResend'),
  validate(schemas.resendOTP),
  authController.resendOTP
);

router.post('/refresh-token',
  getRateLimitMiddleware('tokenRefresh'),
  validate(schemas.refreshToken),
  authController.refreshToken
);

router.post('/logout',
  validate(schemas.logout),
  authController.logout
);

// Protected endpoints - require authentication
router.use(authenticate); // Apply authentication to all following routes

// User profile endpoints
router.get('/profile',
  authController.getUserProfile
);

router.put('/profile',
  authController.updateUserProfile
);

// Health check endpoint (public)
router.get('/health',
  authController.healthCheck
);

module.exports = router;
