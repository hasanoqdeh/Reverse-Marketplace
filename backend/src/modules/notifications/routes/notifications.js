'use strict';

const express    = require('express');
const router     = express.Router();
const { authenticate } = require('../../../middleware/authenticate');
const controller = require('../controllers/notificationController');

router.use(authenticate);

router.get('/',              controller.list);
router.post('/read-all',     controller.markAllRead);
router.post('/:id/read',     controller.markRead);
router.delete('/:id',        controller.deleteOne);

module.exports = router;
