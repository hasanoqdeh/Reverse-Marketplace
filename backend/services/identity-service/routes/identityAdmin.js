const express = require('express');
const router = express.Router();

const adminController = require('../controllers/identityAdminController');
const { validate, schemas, validateAuthInput } = require('../middleware/validation');
const { authenticate, authorize, authorizeAdmin } = require('../middleware/auth');

// Apply common validation middleware to all routes
router.use(validateAuthInput);

// Protected endpoints - require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN'));

// Admin whitelist management
router.post('/whitelist',
  authorizeAdmin('SUPER_ADMIN', 'ADMIN'),
  validate(schemas.addAdmin),
  adminController.addAdminToWhitelist
);

router.get('/whitelist',
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'SUPPORT'),
  validate(schemas.pagination, 'query'),
  adminController.getAdminWhitelist
);

router.delete('/whitelist/:adminId',
  authorizeAdmin('SUPER_ADMIN'),
  adminController.removeAdminFromWhitelist
);

// User management endpoints
router.get('/users',
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'SUPPORT'),
  adminController.getUsers
);

router.get('/users/:userId',
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'SUPPORT'),
  adminController.getUserById
);

router.post('/users/:userId/suspend',
  authorizeAdmin('SUPER_ADMIN', 'ADMIN'),
  adminController.suspendUser
);

router.post('/users/:userId/ban',
  authorizeAdmin('SUPER_ADMIN', 'ADMIN'),
  adminController.banUser
);

router.post('/users/:userId/verify',
  authorizeAdmin('SUPER_ADMIN', 'ADMIN'),
  adminController.verifyUser
);

router.post('/users/bulk-action',
  authorizeAdmin('SUPER_ADMIN', 'ADMIN'),
  adminController.bulkUserAction
);

// Dashboard endpoints
router.get('/dashboard/metrics',
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'SUPPORT'),
  adminController.getDashboardMetrics
);

// Security endpoints
router.get('/security/alerts',
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'SUPPORT'),
  adminController.getSecurityAlerts
);

router.post('/security/alerts/:alertId/resolve',
  authorizeAdmin('SUPER_ADMIN', 'ADMIN'),
  adminController.resolveSecurityAlert
);

module.exports = router;
