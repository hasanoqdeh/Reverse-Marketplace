'use strict';

const express = require('express');
const router = express.Router();
const IdentityAdminController = require('../controllers/adminController');
const { authenticate } = require('../../../middleware/authenticate');
const { requireRole } = require('../../../middleware/authorize');
const { getRateLimitMiddleware } = require('../../../middleware/rateLimiting');
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// All /admin routes require a valid ADMIN JWT
router.use(authenticate);
router.use(requireRole('ADMIN'));
router.use(getRateLimitMiddleware('admin'));

// ── User management ────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/identity/admin/users:
 *   get:
 *     tags: [Admin Users]
 *     summary: List all users (paginated, filterable)
 *     description: |
 *       Returns a paginated list of all platform users. Supports filtering by
 *       role, status, and a partial search on phone or name.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `User` JOIN `UserProfile`: dynamic `SELECT` with `WHERE` clause.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [BUYER, MERCHANT, ADMIN] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, ACTIVE, BANNED, SUSPENDED] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Partial match on phone or name
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       '200':
 *         description: User list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users: { type: array, items: { $ref: '#/components/schemas/User' } }
 *                 meta:  { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/users', asyncHandler(IdentityAdminController.getUsers));

/**
 * @swagger
 * /api/v1/identity/admin/users/bulk-action:
 *   post:
 *     tags: [Admin Users]
 *     summary: Apply an action to multiple users at once
 *     description: |
 *       Applies a single moderation action (suspend, ban, activate) to a list of
 *       user IDs in one operation.
 *
 *       **DB effects**
 *       - PostgreSQL `User`: `UPDATE status` for each ID.
 *       - MongoDB `ActivityLog`: `INSERT` with `actionType = USER_BULK_ACTION`.
 *
 *       **Events published**
 *       - `user.update` for each affected user.
 *         → Analytics: `admin / Bulk user action`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userIds, action]
 *             properties:
 *               userIds:
 *                 type: array
 *                 items: { type: string, format: uuid }
 *               action: { type: string, enum: [suspend, ban, activate] }
 *               reason: { type: string }
 *     responses:
 *       '200':
 *         description: Action applied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 affected: { type: integer }
 *                 message:  { type: string }
 */
router.post('/users/bulk-action', asyncHandler(IdentityAdminController.bulkAction));

/**
 * @swagger
 * /api/v1/identity/admin/users/{userId}:
 *   get:
 *     tags: [Admin Users]
 *     summary: Get a user by ID
 *     description: |
 *       Returns a single user record with their profile.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `User` JOIN `UserProfile`: `SELECT WHERE id = ?`.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: User record
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user: { $ref: '#/components/schemas/User' }
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *   patch:
 *     tags: [Admin Users]
 *     summary: Update a user (admin override)
 *     description: |
 *       Edits a user's role, status, or profile fields. Logs the action.
 *
 *       **DB effects**
 *       - PostgreSQL `User`: `UPDATE` specified fields.
 *       - PostgreSQL `UserProfile`: `UPSERT` if profile fields are provided.
 *       - MongoDB `ActivityLog`: `INSERT` with `actionType = USER_EDIT`.
 *
 *       **Events published**
 *       - `user.update` with `updatedBy = adminId`.
 *         → Analytics: `admin / User edited`.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:    { type: string, enum: [BUYER, MERCHANT, ADMIN] }
 *               status:  { type: string, enum: [PENDING, ACTIVE, BANNED, SUSPENDED] }
 *               profile: { $ref: '#/components/schemas/UserProfile' }
 *     responses:
 *       '200':
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user: { $ref: '#/components/schemas/User' }
 */
router.get('/users/:userId', asyncHandler(IdentityAdminController.getUserById));
router.patch('/users/:userId', asyncHandler(IdentityAdminController.updateUser));

/**
 * @swagger
 * /api/v1/identity/admin/users/{userId}/suspend:
 *   post:
 *     tags: [Admin Users]
 *     summary: Suspend a user
 *     description: |
 *       Sets `User.status = SUSPENDED`. The user cannot log in while suspended.
 *
 *       **DB effects**
 *       - PostgreSQL `User`: `UPDATE status = SUSPENDED`.
 *       - MongoDB `ActivityLog`: `INSERT` with `actionType = USER_SUSPEND`.
 *
 *       **Events published**
 *       - `user.update` → Analytics: `admin / User suspended`.
 *         → Notification consumer: no handler (no push sent).
 *     parameters:
 *       - in: path
 *         name: userId
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
 *         description: User suspended
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 user:    { $ref: '#/components/schemas/User' }
 */
router.post('/users/:userId/suspend', asyncHandler(IdentityAdminController.suspendUser));

/**
 * @swagger
 * /api/v1/identity/admin/users/{userId}/ban:
 *   post:
 *     tags: [Admin Users]
 *     summary: Ban a user
 *     description: |
 *       Sets `User.status = BANNED` and revokes all active sessions immediately.
 *
 *       **DB effects**
 *       - PostgreSQL `User`: `UPDATE status = BANNED`.
 *       - PostgreSQL `AuthToken`: `UPDATE revokedAt = NOW()` for all active tokens.
 *       - MongoDB `ActivityLog`: `INSERT` with `actionType = USER_BAN`.
 *
 *       **Events published**
 *       - `user.update` → Analytics: `admin / User banned`.
 *     parameters:
 *       - in: path
 *         name: userId
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
 *         description: User banned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 user:    { $ref: '#/components/schemas/User' }
 */
router.post('/users/:userId/ban', asyncHandler(IdentityAdminController.banUser));

/**
 * @swagger
 * /api/v1/identity/admin/users/{userId}/activate:
 *   post:
 *     tags: [Admin Users]
 *     summary: Activate a user (lift suspension or ban)
 *     description: |
 *       Sets `User.status = ACTIVE`, restoring their ability to log in.
 *
 *       **DB effects**
 *       - PostgreSQL `User`: `UPDATE status = ACTIVE`.
 *       - MongoDB `ActivityLog`: `INSERT`.
 *
 *       **Events published**
 *       - `user.update` → Analytics: `admin / User activated`.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: User activated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 user:    { $ref: '#/components/schemas/User' }
 */
router.post('/users/:userId/activate', asyncHandler(IdentityAdminController.activateUser));

/**
 * @swagger
 * /api/v1/identity/admin/users/{userId}/sessions:
 *   get:
 *     tags: [Admin Users]
 *     summary: List a user's active sessions
 *     description: |
 *       Returns all non-revoked `AuthToken` rows for a given user with device/IP
 *       metadata. Useful for investigating suspicious login activity.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `AuthToken`: `SELECT WHERE userId = ? AND revokedAt IS NULL`.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Active sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:                { type: string, format: uuid }
 *                       deviceFingerprint: { type: string }
 *                       ipAddress:         { type: string }
 *                       lastUsedAt:        { type: string, format: date-time }
 */
router.get('/users/:userId/sessions', asyncHandler(IdentityAdminController.getUserSessions));

/**
 * @swagger
 * /api/v1/identity/admin/users/{userId}/sessions/{sessionId}:
 *   delete:
 *     tags: [Admin Users]
 *     summary: Revoke a specific user session
 *     description: |
 *       Force-revokes a single refresh token, ending that session immediately.
 *
 *       **DB effects**
 *       - PostgreSQL `AuthToken`: `UPDATE revokedAt = NOW() WHERE id = ? AND userId = ?`.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Session revoked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 */
router.delete('/users/:userId/sessions/:sessionId', asyncHandler(IdentityAdminController.revokeUserSession));

/**
 * @swagger
 * /api/v1/identity/admin/users/{userId}/logs:
 *   get:
 *     tags: [Admin Users]
 *     summary: Get activity logs for a specific user
 *     description: |
 *       Returns paginated MongoDB activity log entries for the given user across
 *       all platform actions (logins, requests created, bids placed, etc.).
 *
 *       **DB effects** (read-only)
 *       - MongoDB `ActivityLog`: `find({ actorId: userId }).sort({ createdAt: -1 })`.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       '200':
 *         description: Activity logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       eventType: { type: string }
 *                       action:    { type: string }
 *                       category:  { type: string }
 *                       metadata:  { type: object }
 *                       createdAt: { type: string, format: date-time }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/users/:userId/logs', asyncHandler(IdentityAdminController.getUserLogs));

// ── Dashboard & logs ───────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/identity/admin/dashboard/metrics:
 *   get:
 *     tags: [Admin Users]
 *     summary: Admin dashboard KPI metrics
 *     description: |
 *       Returns high-level platform counts: users by role/status, registrations
 *       today, and active session count.
 *
 *       **DB effects** (read-only)
 *       - PostgreSQL `User`: multiple `COUNT` aggregates.
 *       - PostgreSQL `AuthToken`: `COUNT WHERE revokedAt IS NULL`.
 *
 *       **Events published**: none.
 *     responses:
 *       '200':
 *         description: Dashboard metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:     { type: integer }
 *                 totalBuyers:    { type: integer }
 *                 totalMerchants: { type: integer }
 *                 activeUsers:    { type: integer }
 *                 bannedUsers:    { type: integer }
 *                 newUsersToday:  { type: integer }
 *                 activeSessions: { type: integer }
 */
router.get('/dashboard/metrics', asyncHandler(IdentityAdminController.getDashboardMetrics));

/**
 * @swagger
 * /api/v1/identity/admin/logs:
 *   get:
 *     tags: [Admin Users]
 *     summary: Platform-wide admin activity logs
 *     description: |
 *       Returns paginated admin-action entries from MongoDB.
 *       Filterable by `actionType`, `adminId`, and date range.
 *
 *       **DB effects** (read-only)
 *       - MongoDB `ActivityLog`: `find({ category: "admin" })` with dynamic filters.
 *
 *       **Events published**: none.
 *     parameters:
 *       - in: query
 *         name: actionType
 *         schema: { type: string }
 *       - in: query
 *         name: adminId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       '200':
 *         description: Admin logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs: { type: array, items: { type: object } }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/logs', asyncHandler(IdentityAdminController.getActivityLogs));

module.exports = router;
