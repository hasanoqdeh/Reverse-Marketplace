'use strict';

const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const requestController = require('../controllers/requestController');
const { authenticate, optionalAuthenticate } = require('../../../middleware/authenticate');
const config = require('../../../config');

const router = express.Router();

// Ensure upload dir exists
const uploadDir = path.join(process.cwd(), config.upload.uploadDir);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
    }
  },
});

// Health check (public)
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'request-service', timestamp: new Date().toISOString() });
});

// Categories (public)
router.get('/categories', requestController.getCategories);

// Request discovery (public — merchants and buyers, optional auth for view tracking)
router.get('/', optionalAuthenticate, requestController.searchRequests);

router.post('/publish', authenticate, requestController.publishRequest);
router.get('/me/requests', authenticate, requestController.getMyRequests);

// Parameterized route last to avoid shadowing specific paths
router.get('/:id', optionalAuthenticate, requestController.getRequest);

router.post('/:id/cancel', authenticate, requestController.cancelRequest);
router.post('/:id/complete', authenticate, requestController.completeRequest);

// Image management
router.post('/:id/images', authenticate, upload.single('image'), requestController.uploadImage);
router.delete('/:id/images/:imageId', authenticate, requestController.deleteImage);

module.exports = router;
