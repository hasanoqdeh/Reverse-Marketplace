'use strict';

const Joi = require('joi');
const AdminRepository = require('../repositories/AdminRepository');
const OtpService = require('../services/otpService');
const AuthService = require('../services/authService');

// ─── Validation schemas ────────────────────────────────────────────────────

const phoneLoginSchema = Joi.object({
  phone: Joi.string().min(7).max(20).required(),
  countryCode: Joi.string().default('+962'),
  // BUYER | MERCHANT | ADMIN — defaults to BUYER for regular users
  role: Joi.string().valid('BUYER', 'MERCHANT', 'ADMIN').default('BUYER'),
});

const verifyOtpSchema = Joi.object({
  phone: Joi.string().min(7).max(20).required(),
  otpCode: Joi.string().length(6).pattern(/^\d+$/).required(),
  deviceFingerprint: Joi.string().max(255).optional(),
  countryCode: Joi.string().default('+962'),
});

const resendOtpSchema = Joi.object({
  phone: Joi.string().min(7).max(20).required(),
  countryCode: Joi.string().default('+962'),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const logoutSchema = Joi.object({
  refreshToken: Joi.string().optional(),
  allDevices: Joi.boolean().default(false),
});

// ─── Controller ────────────────────────────────────────────────────────────

const IdentityAuthController = {
  /**
   * POST /auth/login
   * Universal login endpoint for BUYER, MERCHANT, and ADMIN.
   * Sends OTP to the provided phone number.
   * For ADMIN role, additional pre-flight checks are performed.
   */
  async phoneLogin(req, res) {
    const { error, value } = phoneLoginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((d) => d.message),
      });
    }

    const phone = OtpService.normalizePhone(value.phone, value.countryCode);

    // ── Admin-specific pre-flight checks ────────────────────────────────────
    if (value.role === 'ADMIN') {
      const admin = await AdminRepository.findAdminByPhone(phone);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin account not found. Please contact your system administrator.',
          error: 'ADMIN_NOT_FOUND',
        });
      }

      if (admin.status !== 'ACTIVE') {
        return res.status(403).json({
          success: false,
          message: 'Admin account is not active.',
          error: 'ADMIN_INACTIVE',
        });
      }

      // Initiate OTP for admin
      const result = await AuthService.initiatePhoneLogin(phone, 'ADMIN', {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // Non-blocking audit log
      AdminRepository.logAction({
        adminId: admin.id,
        actionType: 'USER_VIEW',
        targetType: 'ADMIN_SESSION',
        targetPhone: phone,
        actionDetails: { action: 'PHONE_LOGIN_INITIATED' },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: result.success,
        failureReason: result.success ? null : result.error,
      }).catch(() => {});

      const status = result.rateLimitExceeded || result.cooldown ? 429 : result.success ? 200 : 400;
      return res.status(status).json(result);
    }

    // ── Regular user (BUYER / MERCHANT) ─────────────────────────────────────
    const result = await AuthService.initiatePhoneLogin(phone, value.role, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    if (!result.success) {
      const status =
        result.error === 'ACCOUNT_BANNED' ? 403
        : result.rateLimitExceeded || result.cooldown ? 429
        : 400;

      return res.status(status).json(result);
    }

    return res.status(200).json(result);
  },

  /**
   * POST /auth/verify-otp
   * Verify the OTP and return JWT tokens.
   * For ADMIN accounts, additionally asserts role=ADMIN on the resulting token
   * and returns admin-specific permission metadata.
   */
  async verifyOtp(req, res) {
    const { error, value } = verifyOtpSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((d) => d.message),
      });
    }

    const phone = OtpService.normalizePhone(value.phone, value.countryCode);
    const result = await AuthService.verifyOtp(phone, value.otpCode, {
      deviceFingerprint: value.deviceFingerprint || req.get('X-Device-Fingerprint'),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    if (!result.success) {
      const status =
        result.error === 'ACCOUNT_LOCKED' ? 423
        : result.error === 'ACCOUNT_BANNED' ? 403
        : 401;
      return res.status(status).json(result);
    }

    // ── Admin post-verification enrichment ──────────────────────────────────
    if (result.user?.role === 'ADMIN') {
      // Non-blocking audit log
      AdminRepository.logAction({
        adminId: result.user.id,
        actionType: 'USER_VIEW',
        targetType: 'ADMIN_SESSION',
        targetPhone: phone,
        actionDetails: { action: 'LOGIN_SUCCESS', adminSubRole: result.user.adminSubRole },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: true,
      }).catch(() => {});

      return res.status(200).json({
        ...result,
        adminPermissions: _getAdminPermissions(result.user.adminSubRole),
      });
    }

    return res.status(200).json(result);
  },

  /**
   * POST /auth/resend-otp
   * Resend the OTP (subject to cooldown).
   */
  async resendOtp(req, res) {
    const { error, value } = resendOtpSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((d) => d.message),
      });
    }

    const phone = OtpService.normalizePhone(value.phone, value.countryCode);
    const result = await AuthService.resendOtp(phone);

    const status = result.cooldownRemaining ? 429 : result.success ? 200 : 400;
    return res.status(status).json(result);
  },

  /**
   * POST /auth/refresh-token
   * Exchange a valid refresh token for a new token pair.
   */
  async refreshToken(req, res) {
    const { error, value } = refreshTokenSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((d) => d.message),
      });
    }

    const result = await AuthService.refreshToken(value.refreshToken, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      deviceFingerprint: req.get('X-Device-Fingerprint'),
    });

    if (!result.success) return res.status(401).json(result);
    return res.status(200).json(result);
  },

  /**
   * POST /auth/logout
   * Revoke tokens (optionally all devices).
   */
  async logout(req, res) {
    const { error, value } = logoutSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((d) => d.message),
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', error: 'UNAUTHORIZED' });
    }

    // Admin-specific logout audit log
    if (req.user?.role === 'ADMIN') {
      AdminRepository.logAction({
        adminId: userId,
        actionType: 'SESSION_TERMINATE',
        targetType: 'ADMIN_SESSION',
        actionDetails: { allDevices: value.allDevices },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: true,
      }).catch(() => {});
    }

    const result = await AuthService.logout(userId, value.refreshToken, value.allDevices);
    return res.status(200).json(result);
  },

  /**
   * PATCH /auth/profile
   * Authenticated user (BUYER or MERCHANT) updates their own profile.
   */
  async updateProfile(req, res) {
    const schema = Joi.object({
      firstName: Joi.string().max(100).optional(),
      lastName:  Joi.string().max(100).optional(),
      city:      Joi.string().max(100).optional().allow('', null),
      country:   Joi.string().max(100).optional().allow('', null),
    });

    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(d => d.message),
      });
    }

    const UserRepository = require('../repositories/UserRepository');

    const data = {};
    if (value.firstName !== undefined) data.first_name = value.firstName;
    if (value.lastName  !== undefined) data.last_name  = value.lastName;
    if (value.city      !== undefined) data.city       = value.city || null;
    if (value.country   !== undefined) data.country    = value.country || null;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided to update.', error: 'NO_FIELDS' });
    }

    await UserRepository.updateProfile(req.user.id, data);
    const updated = await UserRepository.findById(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updated.id,
        phone: updated.phone,
        role: updated.role,
        status: updated.status,
        profile: {
          firstName: updated.first_name,
          lastName:  updated.last_name,
          city:      updated.city,
          country:   updated.country,
        },
      },
    });
  },

  /**
   * GET /auth/health
   */
  health(req, res) {
    return res.status(200).json({
      success: true,
      service: 'identity-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function _getAdminPermissions(subRole) {
  const base = { viewUsers: true, editUsers: true, viewLogs: true };

  if (subRole === 'SUPER_ADMIN') {
    return { ...base, suspendUsers: true, banUsers: true, manageAdmins: true, exportData: true, systemConfig: true };
  }
  if (subRole === 'ADMIN') {
    return { ...base, suspendUsers: true, banUsers: true, manageAdmins: false, exportData: true, systemConfig: false };
  }
  // SUPPORT
  return { ...base, suspendUsers: false, banUsers: false, manageAdmins: false, exportData: false, systemConfig: false };
}

module.exports = IdentityAuthController;
