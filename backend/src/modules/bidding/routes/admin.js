'use strict';

const express = require('express');
const bidAdminController = require('../controllers/bidAdminController');
const { authenticate } = require('../../../middleware/authenticate');
const { requireRole } = require('../../../middleware/authorize');

const router = express.Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/bids', bidAdminController.listBids);
router.get('/bids/:id', bidAdminController.getBid);
router.post('/bids/:id/force-reject', bidAdminController.forceReject);

module.exports = router;
