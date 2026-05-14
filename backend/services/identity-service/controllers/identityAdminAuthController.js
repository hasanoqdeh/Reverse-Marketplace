const authService = require('../services/authService');
const logger = require('../utils/logger');

class AdminAuthController {
  // Admin authentication endpoints
  async adminPhoneLogin(req, res) {
    try {
      const { phone, countryCode } = req.body;
      const ipAddress = req.clientIP;
      const userAgent = req.userAgent;

      const result = await authService.adminPhoneLogin(phone, countryCode, ipAddress, userAgent);

      res.status(result.success ? 200 : 429).json({
        success: result.success,
        message: result.message,
        otpSent: result.otpSent,
        expiresAt: result.expiresAt,
        rateLimitExceeded: result.rateLimitExceeded,
        nextAttemptAt: result.nextAttemptAt,
        accountLocked: result.accountLocked,
        lockoutRemaining: result.lockoutRemaining,
      });
    } catch (error) {
      logger.error('Admin phone login error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Admin login failed',
        error: 'ADMIN_PHONE_LOGIN_FAILED',
      });
    }
  }

  async adminVerifyOTP(req, res) {
    try {
      const { phone, otpCode, deviceFingerprint } = req.body;
      const ipAddress = req.clientIP;
      const userAgent = req.userAgent;

      const result = await authService.adminVerifyOTP(phone, otpCode, deviceFingerprint, ipAddress, userAgent);

      res.status(result.success ? 200 : 400).json({
        success: result.success,
        message: result.message || 'Admin verification successful',
        user: result.user,
        tokens: result.tokens,
        sessionTimeout: result.sessionTimeout,
      });
    } catch (error) {
      logger.error('Admin OTP verification error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Admin OTP verification failed',
        error: 'ADMIN_OTP_VERIFICATION_FAILED',
      });
    }
  }

  async adminResendOTP(req, res) {
    try {
      const { phone } = req.body;
      const ipAddress = req.clientIP;
      const userAgent = req.userAgent;

      const result = await authService.adminResendOTP(phone, ipAddress, userAgent);

      res.status(result.success ? 200 : 429).json({
        success: result.success,
        message: result.message,
        otpSent: result.otpSent,
        expiresAt: result.expiresAt,
        cooldownRemaining: result.cooldownRemaining,
      });
    } catch (error) {
      logger.error('Admin OTP resend error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to resend admin OTP',
        error: 'ADMIN_OTP_RESEND_FAILED',
      });
    }
  }

  // Admin refresh token endpoint
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const ipAddress = req.clientIP;
      const userAgent = req.userAgent;

      const result = await authService.refreshToken(refreshToken, ipAddress, userAgent);

      // Verify if the user is actually an admin
      if (!result.success || !result.user || result.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Not an admin account.',
          error: 'NOT_AN_ADMIN',
        });
      }

      res.status(200).json({
        success: result.success,
        tokens: result.tokens,
        user: result.user,
      });
    } catch (error) {
      logger.error('Admin refresh token error:', error);
      
      if (error.message.includes('Invalid or expired refresh token')) {
        return res.status(401).json({
          success: false,
          message: error.message,
          error: 'INVALID_REFRESH_TOKEN',
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: 'INTERNAL_ERROR',
        });
      }
    }
  }

  // Admin logout endpoint
  async logout(req, res) {
    try {
      const { refreshToken, allDevices } = req.body;
      const ipAddress = req.clientIP;
      const userAgent = req.userAgent;

      const result = await authService.logout(refreshToken, allDevices, ipAddress, userAgent);

      res.status(200).json({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      logger.error('Admin logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
      });
    }
  }
}

module.exports = new AdminAuthController();
