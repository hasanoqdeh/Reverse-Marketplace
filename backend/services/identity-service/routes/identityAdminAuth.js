const express = require('express');
const router = express.Router();

const adminAuthController = require('../controllers/identityAdminAuthController');
const { validate, schemas, validateAuthInput } = require('../middleware/validation');
const { getRateLimitMiddleware } = require('../middleware/rateLimiting');

// Apply common validation middleware to all routes
router.use(validateAuthInput);

// Admin authentication endpoints
router.post('/phone-login', 
  getRateLimitMiddleware('phoneLogin'),
  validate(schemas.phoneLogin),
  adminAuthController.adminPhoneLogin
);

router.post('/verify-otp',
  getRateLimitMiddleware('otpVerification'),
  validate(schemas.otpVerification),
  adminAuthController.adminVerifyOTP
);

router.post('/resend-otp',
  getRateLimitMiddleware('otpResend'),
  validate(schemas.resendOTP),
  adminAuthController.adminResendOTP
);

router.post('/refresh-token',
  getRateLimitMiddleware('tokenRefresh'),
  validate(schemas.refreshToken),
  adminAuthController.refreshToken
);

router.post('/logout',
  validate(schemas.logout),
  adminAuthController.logout
);

module.exports = router;
