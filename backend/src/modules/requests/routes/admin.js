'use strict';

const express = require('express');
const requestAdminController = require('../controllers/requestAdminController');
const { authenticate } = require('../../../middleware/authenticate');
const { authorizeAdmin } = require('../../../middleware/authorizeAdmin');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorizeAdmin);

/**
 * @swagger
 * /api/v1/requests/admin/requests:
 *   get:
 *     tags: [Admin Requests]
 *     summary: List all requests (admin view)
 *     description: |
 *       Returns all requests regardless of status with full buyer and category data.
 *       Supports filters: `status`, `buyerId`, `categoryId`, `page`, `limit`.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `Request` + `RequestImage` + `RequestCategory`: dynamic `SELECT`.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [DRAFT, ACTIVE, HAS_BIDS, COMPLETED, CANCELLED, EXPIRED] }
 *       - in: query
 *         name: buyerId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       '200':
 *         description: Request list
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
router.get('/requests', requestAdminController.listRequests);

/**
 * @swagger
 * /api/v1/requests/admin/requests/{id}:
 *   get:
 *     tags: [Admin Requests]
 *     summary: Get full request details (admin)
 *     description: |
 *       Returns complete request details including all bids and buyer profile.
 *       Always reads from DB (no caching bypass needed for admin views).
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `Request` + `RequestImage` + `Bid` list.
 *
 *       **Events published**: none.
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
 *   delete:
 *     tags: [Admin Requests]
 *     summary: Hard-delete a request (admin)
 *     description: |
 *       Permanently removes a request and all its images. Use only for moderation
 *       (spam, illegal content). Prefer status overrides for reversible actions.
 *
 *       **DB effects**
 *       - PostgreSQL `RequestImage`: `DELETE`.
 *       - PostgreSQL `Request`: `DELETE`.
 *       - Disk: image files deleted.
 *
 *       **Events published**
 *       - `request.closed` – Payload: `{ requestId, buyerId, closedAt, closedBy, reason }`
 *         → Analytics: `admin / Request deleted`.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Request deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 */
router.get('/requests/:id', requestAdminController.getRequest);
router.delete('/requests/:id', requestAdminController.deleteRequest);

/**
 * @swagger
 * /api/v1/requests/admin/requests/{id}/status:
 *   patch:
 *     tags: [Admin Requests]
 *     summary: Override request status (admin)
 *     description: |
 *       Manually sets a request's `status`. Used for moderation (force-expire,
 *       restore a cancelled request, etc.).
 *
 *       **DB effects**
 *       - PostgreSQL `Request`: `UPDATE status = ?`.
 *
 *       **Events published**
 *       - `request.updated` – Payload: `{ requestId, buyerId, oldStatus, newStatus,
 *         updatedAt, updatedBy }`
 *         → Analytics: `admin / Request status updated`.
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
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [DRAFT, ACTIVE, HAS_BIDS, COMPLETED, CANCELLED, EXPIRED] }
 *               reason: { type: string }
 *     responses:
 *       '200':
 *         description: Status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 request: { $ref: '#/components/schemas/Request' }
 */
router.patch('/requests/:id/status', requestAdminController.updateRequestStatus);

/**
 * @swagger
 * /api/v1/requests/admin/requests/process-expired:
 *   post:
 *     tags: [Admin Requests]
 *     summary: Trigger expiry processing
 *     description: |
 *       Manually triggers the expiry job that sets `status = EXPIRED` on all
 *       `ACTIVE` / `HAS_BIDS` requests whose `expiresAt` has passed. Normally run
 *       by a cron job; this endpoint allows on-demand execution.
 *
 *       **DB effects**
 *       - PostgreSQL `Request`: `UPDATE status = EXPIRED WHERE expiresAt < NOW()
 *         AND status IN (ACTIVE, HAS_BIDS)`.
 *
 *       **Events published**
 *       - `request.updated` for each expired request.
 *     responses:
 *       '200':
 *         description: Expiry processing complete
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 expired: { type: integer, description: Number of requests expired }
 */
router.post('/requests/process-expired', requestAdminController.triggerExpiryProcessing);

/**
 * @swagger
 * /api/v1/requests/admin/categories:
 *   post:
 *     tags: [Admin Requests]
 *     summary: Create a request category
 *     description: |
 *       Creates a new category. `slug` must be globally unique. `parentId` makes
 *       it a sub-category.
 *
 *       **DB effects**
 *       - PostgreSQL `RequestCategory`: `INSERT`.
 *       - Redis: invalidates `categories:all` cache.
 *
 *       **Events published**: none.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug]
 *             properties:
 *               name:        { type: string }
 *               slug:        { type: string }
 *               description: { type: string }
 *               parentId:    { type: string, format: uuid }
 *               iconUrl:     { type: string, format: uri }
 *               sortOrder:   { type: integer, default: 0 }
 *     responses:
 *       '201':
 *         description: Category created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category: { $ref: '#/components/schemas/RequestCategory' }
 */
router.post('/categories', requestAdminController.createCategory);

/**
 * @swagger
 * /api/v1/requests/admin/categories/{id}:
 *   put:
 *     tags: [Admin Requests]
 *     summary: Update a request category
 *     description: |
 *       Updates any field on a category. Slug must remain unique.
 *
 *       **DB effects**
 *       - PostgreSQL `RequestCategory`: `UPDATE`.
 *       - Redis: invalidates `categories:all` cache.
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:        { type: string }
 *               description: { type: string }
 *               iconUrl:     { type: string, format: uri }
 *               isActive:    { type: boolean }
 *               sortOrder:   { type: integer }
 *     responses:
 *       '200':
 *         description: Category updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category: { $ref: '#/components/schemas/RequestCategory' }
 *   delete:
 *     tags: [Admin Requests]
 *     summary: Delete a request category
 *     description: |
 *       Hard-deletes a category. Fails if any active requests still reference it
 *       (foreign key constraint). Invalidates the category cache.
 *
 *       **DB effects**
 *       - PostgreSQL `RequestCategory`: `DELETE WHERE id = ?`.
 *       - Redis: invalidates `categories:all` cache.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Category deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 */
router.put('/categories/:id', requestAdminController.updateCategory);
router.delete('/categories/:id', requestAdminController.deleteCategory);

/**
 * @swagger
 * /api/v1/requests/admin/analytics:
 *   get:
 *     tags: [Admin Requests]
 *     summary: Request analytics (admin)
 *     description: |
 *       Aggregated request statistics: totals by status, average budget, top
 *       categories, and requests per day for the last 30 days.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `Request`: multiple `COUNT` / `AVG` / `GROUP BY` queries.
 *
 *       **Events published**: none.
 *     responses:
 *       '200':
 *         description: Analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRequests:  { type: integer }
 *                 byStatus:       { type: object }
 *                 avgBudget:      { type: number }
 *                 topCategories:  { type: array, items: { type: object } }
 *                 requestsPerDay: { type: array, items: { type: object } }
 */
router.get('/analytics', requestAdminController.getAnalytics);

module.exports = router;
