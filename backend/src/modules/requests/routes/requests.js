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

/**
 * @swagger
 * /api/v1/requests/health:
 *   get:
 *     tags: [Requests]
 *     summary: Requests service health check
 *     security: []
 *     description: |
 *       Returns `{ status: "ok" }`. No database calls.
 *     responses:
 *       '200':
 *         description: Healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:    { type: string }
 *                 service:   { type: string }
 *                 timestamp: { type: string, format: date-time }
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'request-service', timestamp: new Date().toISOString() });
});

/**
 * @swagger
 * /api/v1/requests/categories:
 *   get:
 *     tags: [Requests]
 *     summary: List all active request categories
 *     security: []
 *     description: |
 *       Returns the full category tree (parents with nested children).
 *       Results are cached in Redis for 10 minutes.
 *
 *       **DB effects** (read-only)
 *       - Redis: `GET categories:all` – cache hit skips the DB call.
 *       - PostgreSQL `RequestCategory`: `SELECT WHERE isActive = true` + children
 *         (on cache miss only).
 *
 *       **Events published**: none.
 *     responses:
 *       '200':
 *         description: Category tree
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/RequestCategory' }
 */
router.get('/categories', requestController.getCategories);

/**
 * @swagger
 * /api/v1/requests:
 *   get:
 *     tags: [Requests]
 *     summary: Search and filter requests
 *     security: []
 *     description: |
 *       Full-featured search endpoint returning paginated `ACTIVE` / `HAS_BIDS`
 *       requests. Results are cached in Redis (key derived from the query string).
 *
 *       **Available filters** (all optional): `categoryId`, `buyerId`, `status`,
 *       `budgetMin`, `budgetMax`, `city`, `country`, `from`, `to`, `search`
 *       (full-text on title/description), `sortBy`, `page`, `limit`.
 *
 *       **DB effects** (read-only)
 *       - Redis: cache lookup; `SET` on miss (2-min TTL).
 *       - PostgreSQL `Request` JOIN `RequestCategory` JOIN `RequestImage`: dynamic
 *         `WHERE` + `ORDER BY` (on cache miss).
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [ACTIVE, HAS_BIDS] }
 *       - in: query
 *         name: budgetMin
 *         schema: { type: number }
 *       - in: query
 *         name: budgetMax
 *         schema: { type: number }
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [newest, budget_asc, budget_desc, most_bids] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       '200':
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requests:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Request' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/', optionalAuthenticate, requestController.searchRequests);

/**
 * @swagger
 * /api/v1/requests/publish:
 *   post:
 *     tags: [Requests]
 *     summary: Publish a new request (buyer only)
 *     description: |
 *       Creates a new buyer request in `ACTIVE` status, making it immediately
 *       visible to merchants via the search endpoint.
 *
 *       **What it does**
 *       1. Validates the body (title, description, budget, categoryId, expiresAt).
 *       2. Confirms `categoryId` exists and is active.
 *       3. Inserts the `Request` row with `status = ACTIVE` and `publishedAt = NOW()`.
 *
 *       **DB effects**
 *       - PostgreSQL `Request`: `INSERT`.
 *       - PostgreSQL `RequestCategory`: `SELECT` (validation only).
 *
 *       **Events published**
 *       - `request.created` – Payload: `{ requestId, buyerId, categoryId, title, publishedAt }`
 *         → Analytics subscriber: `{ category: "requests", action: "Request created",
 *           actorRole: BUYER, actorId: buyerId, targetId: requestId }`.
 *         → Notification consumer: no handler (merchants discover via search).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, categoryId, budgetMin, budgetMax]
 *             properties:
 *               title:           { type: string }
 *               description:     { type: string }
 *               categoryId:      { type: string, format: uuid }
 *               budgetMin:       { type: number }
 *               budgetMax:       { type: number }
 *               locationAddress: { type: string }
 *               locationCity:    { type: string }
 *               locationCountry: { type: string }
 *               locationLat:     { type: number }
 *               locationLng:     { type: number }
 *               expiresAt:       { type: string, format: date-time }
 *     responses:
 *       '201':
 *         description: Request published
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 request: { $ref: '#/components/schemas/Request' }
 *       '400':
 *         description: Validation error or inactive category
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       '401':
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/publish', authenticate, requestController.publishRequest);

/**
 * @swagger
 * /api/v1/requests/me/requests:
 *   get:
 *     tags: [Requests]
 *     summary: Get the authenticated buyer's own requests
 *     description: |
 *       Returns all requests created by the calling buyer (all statuses),
 *       sorted by newest first. Optionally filter by `status`.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `Request` WHERE `buyerId = req.user.id`, including images.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, ACTIVE, HAS_BIDS, COMPLETED, CANCELLED, EXPIRED]
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       '200':
 *         description: Buyer's requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requests:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Request' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/me/requests', authenticate, requestController.getMyRequests);

/**
 * @swagger
 * /api/v1/requests/{id}:
 *   get:
 *     tags: [Requests]
 *     summary: Get a single request by ID
 *     security: []
 *     description: |
 *       Returns full request details including images and category. Each unique
 *       view (deduplicated by user/IP via Redis TTL) increments `viewCount`.
 *
 *       **DB effects**
 *       - Redis: cache lookup; `SET` on miss (2-min TTL).
 *       - Redis: deduplication key `view:{requestId}:{userId|ip}` (1-hour TTL).
 *       - PostgreSQL `Request`: `SELECT` with images + category (on cache miss).
 *       - PostgreSQL `Request`: `UPDATE viewCount++` if view is not a duplicate.
 *
 *       **Events published**
 *       - `request.viewed` – only on unique views.
 *         Payload: `{ requestId, userId, ipAddress, viewedAt }`
 *         → Analytics subscriber: inserts `RequestView` document in MongoDB.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Request details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 request: { $ref: '#/components/schemas/Request' }
 *       '404':
 *         description: Not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id', optionalAuthenticate, requestController.getRequest);

/**
 * @swagger
 * /api/v1/requests/{id}/cancel:
 *   post:
 *     tags: [Requests]
 *     summary: Cancel a request (buyer only)
 *     description: |
 *       Sets `status = CANCELLED`. Only the owning buyer may cancel; only requests
 *       in `ACTIVE` or `HAS_BIDS` status can be cancelled.
 *
 *       **DB effects**
 *       - PostgreSQL `Request`: `UPDATE status = CANCELLED, updatedAt = NOW()`.
 *
 *       **Events published**
 *       - `request.cancelled` – Payload: `{ requestId, buyerId, cancelledAt, reason }`
 *         → Analytics: `requests / Request cancelled`.
 *         → Notification consumer: no handler (no push sent on cancellations).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       '200':
 *         description: Request cancelled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 request: { $ref: '#/components/schemas/Request' }
 *       '403':
 *         description: Not the owner or invalid status
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/:id/cancel', authenticate, requestController.cancelRequest);

/**
 * @swagger
 * /api/v1/requests/{id}/complete:
 *   post:
 *     tags: [Requests]
 *     summary: Mark a request as completed (buyer only)
 *     description: |
 *       Closes the request by accepting a specific bid. All other `PENDING` bids
 *       on this request are automatically rejected.
 *
 *       **What it does**
 *       1. Validates the caller is the owning buyer.
 *       2. Sets `Request.status = COMPLETED`.
 *       3. Calls `BidRepository.rejectAllExcept(requestId, acceptedBidId)` to reject
 *          every other `PENDING` bid.
 *
 *       **DB effects**
 *       - PostgreSQL `Request`: `UPDATE status = COMPLETED`.
 *       - PostgreSQL `Bid`: `UPDATE status = REJECTED` for all bids where
 *         `requestId = ? AND id != acceptedBidId AND status = PENDING`.
 *
 *       **Events published**
 *       - `request.completed` – Payload: `{ requestId, buyerId, acceptedBidId,
 *         merchantId, completedAt, finalAmount }`
 *         → Analytics: `requests / Request completed`.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [acceptedBidId]
 *             properties:
 *               acceptedBidId: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Request completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 request: { $ref: '#/components/schemas/Request' }
 */
router.post('/:id/complete', authenticate, requestController.completeRequest);

/**
 * @swagger
 * /api/v1/requests/{id}/images:
 *   post:
 *     tags: [Requests]
 *     summary: Upload an image for a request
 *     description: |
 *       Uploads a single image (multipart/form-data, field name `image`) and attaches
 *       it to the request. Maximum 5 images per request. The first image is
 *       automatically set as `isPrimary = true`.
 *
 *       **DB effects**
 *       - Disk: file saved to `/uploads/requests/`.
 *       - PostgreSQL `RequestImage`: `INSERT` with `imageUrl`, `fileSize`, `mimeType`, `sortOrder`.
 *       - PostgreSQL `RequestImage`: `UPDATE isPrimary = true` if this is the first image.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '201':
 *         description: Image uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 image:
 *                   type: object
 *                   properties:
 *                     id:       { type: string, format: uuid }
 *                     imageUrl: { type: string, format: uri }
 */
router.post('/:id/images', authenticate, upload.single('image'), requestController.uploadImage);

/**
 * @swagger
 * /api/v1/requests/{id}/images/{imageId}:
 *   delete:
 *     tags: [Requests]
 *     summary: Delete a request image
 *     description: |
 *       Removes an image from a request and from disk. If the deleted image was
 *       `isPrimary`, the next image in `sortOrder` becomes the new primary.
 *
 *       **DB effects**
 *       - PostgreSQL `RequestImage`: `DELETE WHERE id = ? AND requestId = ?`.
 *       - PostgreSQL `RequestImage`: `UPDATE isPrimary = true` on the next image (if needed).
 *       - Disk: file deleted.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Image deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 */
router.delete('/:id/images/:imageId', authenticate, requestController.deleteImage);

module.exports = router;
