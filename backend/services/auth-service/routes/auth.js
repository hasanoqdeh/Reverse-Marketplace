const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { validate, schemas, validateAuthInput } = require('../middleware/validation');
const { getRateLimitMiddleware } = require('../middleware/rateLimiting');
const { authenticate, authorize, authorizeAdmin } = require('../middleware/auth');

// Apply common validation middleware to all routes
router.use(validateAuthInput);

// Public authentication endpoints
router.post('/phone-login', 
  getRateLimitMiddleware('phoneLogin'),
  validate(schemas.phoneLogin),
  authController.phoneLogin
);

// Admin authentication endpoints
router.post('/admin/phone-login', 
  getRateLimitMiddleware('phoneLogin'),
  validate(schemas.phoneLogin),
  authController.adminPhoneLogin
);

router.post('/verify-otp',
  getRateLimitMiddleware('otpVerification'),
  validate(schemas.otpVerification),
  authController.verifyOTP
);

router.post('/admin/verify-otp',
  getRateLimitMiddleware('otpVerification'),
  validate(schemas.otpVerification),
  authController.adminVerifyOTP
);

router.post('/resend-otp',
  getRateLimitMiddleware('otpResend'),
  validate(schemas.resendOTP),
  authController.resendOTP
);

router.post('/admin/resend-otp',
  getRateLimitMiddleware('otpResend'),
  validate(schemas.resendOTP),
  authController.adminResendOTP
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

// Admin management endpoints - require admin role
router.use('/admin', authorize('ADMIN'));

router.post('/admin/whitelist',
  authorizeAdmin('SUPER_ADMIN', 'ADMIN'),
  validate(schemas.addAdmin),
  authController.addAdminToWhitelist
);

router.get('/admin/whitelist',
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'SUPPORT'),
  validate(schemas.pagination, 'query'),
  authController.getAdminWhitelist
);

router.delete('/admin/whitelist/:adminId',
  authorizeAdmin('SUPER_ADMIN'),
  authController.removeAdminFromWhitelist
);

// User management endpoints
router.get('/admin/users',
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'SUPPORT'),
  authController.getUsers
);

router.get('/admin/users/:userId',
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'SUPPORT'),
  authController.getUserById
);

router.post('/admin/users/:userId/suspend',
  authorizeAdmin('SUPER_ADMIN', 'ADMIN'),
  authController.suspendUser
);

router.post('/admin/users/:userId/ban',
  authorizeAdmin('SUPER_ADMIN', 'ADMIN'),
  authController.banUser
);

router.post('/admin/users/:userId/verify',
  authorizeAdmin('SUPER_ADMIN', 'ADMIN'),
  authController.verifyUser
);

router.post('/admin/users/bulk-action',
  authorizeAdmin('SUPER_ADMIN', 'ADMIN'),
  authController.bulkUserAction
);

// Dashboard endpoints
router.get('/admin/dashboard/metrics',
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'SUPPORT'),
  authController.getDashboardMetrics
);

// Security endpoints
router.get('/admin/security/alerts',
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'SUPPORT'),
  authController.getSecurityAlerts
);

router.post('/admin/security/alerts/:alertId/resolve',
  authorizeAdmin('SUPER_ADMIN', 'ADMIN'),
  authController.resolveSecurityAlert
);

// Health check endpoint (public)
router.get('/health',
  authController.healthCheck
);

module.exports = router;
