'use strict';

const express = require('express');
const router  = express.Router();
const { authenticate }   = require('../../../middleware/authenticate');
const { authorizeAdmin } = require('../../../middleware/authorizeAdmin');
const ctrl = require('../controllers/analyticsController');

router.use(authenticate, authorizeAdmin);

// Activity logs
router.get('/activity',                ctrl.getActivityLogs);
router.get('/activity/actor/:actorId', ctrl.getActorLogs);

// Aggregate stats
router.get('/stats',         ctrl.getStats);          // activity log aggregates
router.get('/overview',      ctrl.getOverview);        // unified cross-domain overview
router.get('/users',         ctrl.getUserStats);       // user stats from PostgreSQL
router.get('/requests',      ctrl.getRequestStats);    // request stats (PG + Mongo)
router.get('/bids',          ctrl.getBidStats);        // bid stats from PostgreSQL
router.get('/chat',          ctrl.getChatStats);       // chat stats (PG + Mongo)
router.get('/notifications', ctrl.getNotificationStats); // notification stats from PostgreSQL

module.exports = router;
