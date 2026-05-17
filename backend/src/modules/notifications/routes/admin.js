'use strict';

const express    = require('express');
const router     = express.Router();
const { authenticate }   = require('../../../middleware/authenticate');
const { authorizeAdmin } = require('../../../middleware/authorizeAdmin');
const controller = require('../controllers/notificationAdminController');

router.use(authenticate, authorizeAdmin);

router.get('/',        controller.list);
router.post('/send',   controller.send);
router.delete('/:id',  controller.deleteOne);

module.exports = router;
