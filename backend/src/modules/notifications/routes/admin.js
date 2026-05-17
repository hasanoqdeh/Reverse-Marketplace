'use strict';

const express = require('express');
const router  = express.Router();
const { authenticate }   = require('../../../middleware/authenticate');
const { authorizeAdmin } = require('../../../middleware/authorizeAdmin');
const controller = require('../controllers/notificationAdminController');

router.use(authenticate, authorizeAdmin);

router.get('/',                  controller.list);
router.get('/stats',             controller.getStats);
router.post('/send',             controller.send);
router.delete('/:id',            controller.deleteOne);

router.get('/templates',         controller.listTemplates);
router.post('/templates',        controller.createTemplate);
router.patch('/templates/:id',   controller.updateTemplate);

module.exports = router;
