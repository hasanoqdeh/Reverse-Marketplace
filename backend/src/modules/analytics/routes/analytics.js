'use strict';

const express = require('express');
const router  = express.Router();
const { authenticate }  = require('../../../middleware/authenticate');
const { authorizeAdmin } = require('../../../middleware/authorizeAdmin');
const analyticsController = require('../controllers/analyticsController');

router.use(authenticate, authorizeAdmin);

router.get('/activity',                analyticsController.getActivityLogs);
router.get('/activity/actor/:actorId', analyticsController.getActorLogs);
router.get('/stats',                   analyticsController.getStats);

module.exports = router;
