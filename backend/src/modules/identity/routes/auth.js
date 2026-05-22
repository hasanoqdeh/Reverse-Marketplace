'use strict';

const express = require('express');
const router = express.Router();
const IdentityAuthController = require('../controllers/authController');
const { authenticate } = require('../../../middleware/authenticate');
const { getRateLimitMiddleware } = require('../../../middleware/rateLimiting');
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ── Public routes ──────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/identity/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Initiate phone login – send OTP
 *     security: []
 *     description: |
 *       Starts the phone-OTP login flow for a BUYER, MERCHANT, or ADMIN.
 *
 *       **What it does**
 *       1. Looks up the user by `phone` + `role`; creates a new User row if none exists.
 *       2. Checks the account is not BANNED or SUSPENDED.
 *       3. Generates a 6-digit OTP (stored hashed in MongoDB `otp_codes`, TTL 5 min).
 *       4. Enforces rate limit: max 3 OTP requests per phone per 5 minutes (Redis).
 *
 *       **DB effects**
 *       - PostgreSQL `User`: `INSERT` if first-time user; `SELECT` otherwise.
 *       - PostgreSQL `UserProfile`: `INSERT` empty profile for new users.
 *       - MongoDB `OtpCode`: `INSERT` with hashed code + expiry.
 *       - Redis: increments OTP rate-limit counter for the phone.
 *
 *       **Events published**
 *       - `user.registered` – only when a brand-new user is created.
 *         Payload: `{ userId, phone, role, registeredAt }`
 *         → Analytics subscriber logs it as `identity / User registered`.
 *       - `notification.otp.requested` – always emitted.
 *         Payload: `{ userId, phone, code, purpose, expiresAt, expiryMinutes }`
 *         → In production an SMS consumer (Twilio) delivers the code.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, role]
 *             properties:
 *               phone: { type: string, example: '+966501234567' }
 *               role:  { type: string, enum: [BUYER, MERCHANT, ADMIN] }
 *     responses:
 *       '200':
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:   { type: string }
 *                 expiresIn: { type: integer, description: Seconds until OTP expires }
 *       '400':
 *         description: Validation error or account suspended/banned
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       '429':
 *         description: OTP rate limit exceeded
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post(
  '/login',
  getRateLimitMiddleware('otp'),
  asyncHandler(IdentityAuthController.phoneLogin),
);

/**
 * @swagger
 * /api/v1/identity/auth/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify OTP and receive JWT tokens
 *     security: []
 *     description: |
 *       Validates the OTP sent to the user's phone and issues a JWT access token
 *       + refresh token pair on success.
 *
 *       **What it does**
 *       1. Finds the user by `phone`.
 *       2. Verifies the OTP (checks hash, expiry, max-attempt guard).
 *       3. Marks the OTP as used.
 *       4. On first login, sets `User.phoneVerified = true`.
 *       5. Creates an `AuthToken` row for the refresh token (hashed, with device fingerprint).
 *       6. Updates `User.lastLoginAt`.
 *
 *       **DB effects**
 *       - MongoDB `OtpCode`: sets `usedAt`, increments attempt counter.
 *       - PostgreSQL `User`: `UPDATE phoneVerified = true` (first login only), `UPDATE lastLoginAt`.
 *       - PostgreSQL `AuthToken`: `INSERT` refresh-token record with `ipAddress`, `userAgent`.
 *
 *       **Events published**
 *       - `user.verified` – on first verification only.
 *         Payload: `{ userId, phone, role, verifiedAt }`
 *         → Analytics: `identity / Phone verified`.
 *       - `user.logined` – every successful login.
 *         Payload: `{ userId, phone, role, loginAt }`
 *         → Analytics: `identity / User logged in`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, code]
 *             properties:
 *               phone: { type: string, example: '+966501234567' }
 *               code:  { type: string, example: '123456' }
 *     responses:
 *       '200':
 *         description: Authentication successful – tokens issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tokens: { $ref: '#/components/schemas/AuthTokens' }
 *                 user:   { $ref: '#/components/schemas/User' }
 *       '400':
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post(
  '/verify-otp',
  getRateLimitMiddleware('otp'),
  asyncHandler(IdentityAuthController.verifyOtp),
);

/**
 * @swagger
 * /api/v1/identity/auth/resend-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Resend OTP
 *     security: []
 *     description: |
 *       Re-issues a fresh OTP for a phone number. Subject to:
 *       - 60-second resend cooldown (Redis key per phone).
 *       - 3-per-5-min rate limit shared with `/login`.
 *
 *       **DB effects**
 *       - MongoDB `OtpCode`: `INSERT` new code (previous codes are implicitly superseded).
 *       - Redis: checks and updates cooldown key.
 *
 *       **Events published**
 *       - `notification.otp.requested` – same payload as `/login`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone]
 *             properties:
 *               phone: { type: string, example: '+966501234567' }
 *               role:  { type: string, enum: [BUYER, MERCHANT, ADMIN] }
 *     responses:
 *       '200':
 *         description: OTP resent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:   { type: string }
 *                 expiresIn: { type: integer }
 *       '429':
 *         description: Cooldown active or rate limit exceeded
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post(
  '/resend-otp',
  getRateLimitMiddleware('otp'),
  asyncHandler(IdentityAuthController.resendOtp),
);

/**
 * @swagger
 * /api/v1/identity/auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     security: []
 *     description: |
 *       Exchanges a valid refresh token for a new access token without requiring
 *       re-authentication.
 *
 *       **What it does**
 *       1. Verifies the refresh token JWT signature and expiry.
 *       2. Finds the matching `AuthToken` row (by token hash) and checks it is not revoked.
 *       3. Updates `AuthToken.lastUsedAt`.
 *       4. Returns a fresh access token (the refresh token itself is not rotated).
 *
 *       **DB effects**
 *       - PostgreSQL `AuthToken`: `UPDATE lastUsedAt = NOW()`.
 *
 *       **Events published**: none.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       '200':
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken: { type: string }
 *                 expiresIn:   { type: integer }
 *       '401':
 *         description: Invalid, expired, or revoked refresh token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post(
  '/refresh-token',
  getRateLimitMiddleware('auth'),
  asyncHandler(IdentityAuthController.refreshToken),
);

// ── Authenticated routes ───────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/identity/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout – revoke current refresh token
 *     description: |
 *       Revokes the caller's current refresh token so it can no longer be used to
 *       obtain new access tokens. The active access token remains valid until natural
 *       expiry; clients should discard it locally.
 *
 *       **DB effects**
 *       - PostgreSQL `AuthToken`: `UPDATE revokedAt = NOW()` for the current token.
 *
 *       **Events published**: none.
 *     responses:
 *       '200':
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       '401':
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post(
  '/logout',
  authenticate,
  asyncHandler(IdentityAuthController.logout),
);

/**
 * @swagger
 * /api/v1/identity/auth/profile:
 *   patch:
 *     tags: [Auth]
 *     summary: Update own profile
 *     description: |
 *       Updates the authenticated user's profile fields. Only provided fields are
 *       changed (partial update). Creates the profile row if it does not yet exist.
 *
 *       **DB effects**
 *       - PostgreSQL `UserProfile`: `UPSERT` (creates on first call, updates on subsequent).
 *
 *       **Events published**
 *       - `user.update` – Payload: `{ userId, phone, role, updatedAt }`
 *         → Analytics: `identity / User updated`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfile'
 *     responses:
 *       '200':
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile: { $ref: '#/components/schemas/UserProfile' }
 *       '401':
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.patch(
  '/profile',
  authenticate,
  asyncHandler(IdentityAuthController.updateProfile),
);

// ── Health ─────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/identity/auth/health:
 *   get:
 *     tags: [Auth]
 *     summary: Identity service health check
 *     security: []
 *     description: |
 *       Returns `{ status: "ok" }`. Used by load balancers and uptime monitors.
 *       Makes no database calls.
 *     responses:
 *       '200':
 *         description: Service healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:    { type: string }
 *                 timestamp: { type: string, format: date-time }
 */
router.get('/health', IdentityAuthController.health);

module.exports = router;
