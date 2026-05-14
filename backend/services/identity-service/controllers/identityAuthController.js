const authService = require('../services/authService');
const logger = require('../utils/logger');

class AuthController {
  // Phone login endpoint
  async phoneLogin(req, res) {
    try {
      const { phone, countryCode } = req.body;
      const ipAddress = req.clientIP;
      const userAgent = req.userAgent;

      const result = await authService.initiatePhoneLogin(phone, countryCode, ipAddress, userAgent);

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
      logger.error('Phone login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
      });
    }
  }

  // OTP verification endpoint
  async verifyOTP(req, res) {
    try {
      const { phone, otpCode, deviceFingerprint } = req.body;
      const ipAddress = req.clientIP;
      const userAgent = req.userAgent;

      const result = await authService.verifyOTP(phone, otpCode, deviceFingerprint, ipAddress, userAgent);

      res.status(200).json({
        success: result.success,
        user: result.user,
        tokens: result.tokens,
        sessionTimeout: result.sessionTimeout,
      });
    } catch (error) {
      logger.error('OTP verification error:', error);
      
      // Handle specific error cases
      if (error.message.includes('Invalid phone number')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          error: 'INVALID_PHONE',
        });
      } else if (error.message.includes('OTP not found') || error.message.includes('expired')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          error: 'OTP_NOT_FOUND_OR_EXPIRED',
        });
      } else if (error.message.includes('Maximum OTP attempts')) {
        return res.status(429).json({
          success: false,
          message: error.message,
          error: 'OTP_ATTEMPTS_EXCEEDED',
        });
      } else if (error.message.includes('Invalid OTP')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          error: 'INVALID_OTP',
        });
      } else if (error.message.includes('Account locked')) {
        return res.status(423).json({
          success: false,
          message: error.message,
          error: 'ACCOUNT_LOCKED',
        });
      } else if (error.message.includes('Admin verification failed')) {
        return res.status(403).json({
          success: false,
          message: error.message,
          error: 'ADMIN_VERIFICATION_FAILED',
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

  // Resend OTP endpoint
  async resendOTP(req, res) {
    try {
      const { phone } = req.body;
      const ipAddress = req.clientIP;
      const userAgent = req.userAgent;

      const result = await authService.resendOTP(phone, ipAddress, userAgent);

      res.status(result.success ? 200 : 429).json({
        success: result.success,
        message: result.message,
        expiresAt: result.expiresAt,
        cooldownRemaining: result.cooldownRemaining,
      });
    } catch (error) {
      logger.error('Resend OTP error:', error);
      
      if (error.message.includes('Invalid phone number')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          error: 'INVALID_PHONE',
        });
      } else if (error.message.includes('User not found')) {
        return res.status(404).json({
          success: false,
          message: error.message,
          error: 'USER_NOT_FOUND',
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

  // Refresh token endpoint
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const ipAddress = req.clientIP;
      const userAgent = req.userAgent;

      const result = await authService.refreshToken(refreshToken, ipAddress, userAgent);

      res.status(200).json({
        success: result.success,
        tokens: result.tokens,
      });
    } catch (error) {
      logger.error('Refresh token error:', error);
      
      if (error.message.includes('Invalid or expired refresh token')) {
        return res.status(401).json({
          success: false,
          message: error.message,
          error: 'INVALID_REFRESH_TOKEN',
        });
      } else if (error.message.includes('Too many token refresh attempts')) {
        return res.status(429).json({
          success: false,
          message: error.message,
          error: 'RATE_LIMIT_EXCEEDED',
        });
      } else if (error.message.includes('Account is locked')) {
        return res.status(423).json({
          success: false,
          message: error.message,
          error: 'ACCOUNT_LOCKED',
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

  // Logout endpoint
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
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
      });
    }
  }

  // User profile endpoints
  async getUserProfile(req, res) {
    try {
      const database = require('../database/connection');
      
      const profileResult = await database.query(
        'SELECT * FROM user_profiles WHERE user_id = $1',
        [req.user.userId]
      );

      if (profileResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found',
          error: 'PROFILE_NOT_FOUND',
        });
      }

      const profile = profileResult.rows[0];

      res.status(200).json({
        success: true,
        profile: {
          id: profile.id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          profileImageUrl: profile.profile_image_url,
          locationLat: profile.location_lat,
          locationLng: profile.location_lng,
          address: profile.address,
          city: profile.city,
          country: profile.country,
          preferences: profile.preferences,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        },
      });
    } catch (error) {
      logger.error('Get user profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
      });
    }
  }

  async updateUserProfile(req, res) {
    try {
      const database = require('../database/connection');
      const eventPublisher = require('../events/publisher');
      
      const {
        firstName,
        lastName,
        profileImageUrl,
        locationLat,
        locationLng,
        address,
        city,
        country,
        preferences,
      } = req.body;

      // Check if profile exists
      const existingProfileResult = await database.query(
        'SELECT * FROM user_profiles WHERE user_id = $1',
        [req.user.userId]
      );

      const updatedFields = [];
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      // Build dynamic update query
      if (firstName !== undefined) {
        updateFields.push(`first_name = $${paramIndex++}`);
        updateValues.push(firstName);
        updatedFields.push('first_name');
      }
      if (lastName !== undefined) {
        updateFields.push(`last_name = $${paramIndex++}`);
        updateValues.push(lastName);
        updatedFields.push('last_name');
      }
      if (profileImageUrl !== undefined) {
        updateFields.push(`profile_image_url = $${paramIndex++}`);
        updateValues.push(profileImageUrl);
        updatedFields.push('profile_image_url');
      }
      if (locationLat !== undefined) {
        updateFields.push(`location_lat = $${paramIndex++}`);
        updateValues.push(locationLat);
        updatedFields.push('location_lat');
      }
      if (locationLng !== undefined) {
        updateFields.push(`location_lng = $${paramIndex++}`);
        updateValues.push(locationLng);
        updatedFields.push('location_lng');
      }
      if (address !== undefined) {
        updateFields.push(`address = $${paramIndex++}`);
        updateValues.push(address);
        updatedFields.push('address');
      }
      if (city !== undefined) {
        updateFields.push(`city = $${paramIndex++}`);
        updateValues.push(city);
        updatedFields.push('city');
      }
      if (country !== undefined) {
        updateFields.push(`country = $${paramIndex++}`);
        updateValues.push(country);
        updatedFields.push('country');
      }
      if (preferences !== undefined) {
        updateFields.push(`preferences = $${paramIndex++}`);
        updateValues.push(JSON.stringify(preferences));
        updatedFields.push('preferences');
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update',
          error: 'NO_FIELDS_TO_UPDATE',
        });
      }

      updateValues.push(req.user.userId);
      const userIdParamIndex = paramIndex;

      let query, result;
      if (existingProfileResult.rows.length === 0) {
        // Create new profile
        const fields = ['user_id', 'first_name', 'last_name'];
        const values = [req.user.userId, firstName || 'User', lastName || 'User'];
        const placeholders = ['$1', '$2', '$3'];
        
        let pIndex = 4;
        if (profileImageUrl !== undefined) {
          fields.push('profile_image_url');
          values.push(profileImageUrl);
          placeholders.push(`$${pIndex++}`);
        }
        if (locationLat !== undefined) {
          fields.push('location_lat');
          values.push(locationLat);
          placeholders.push(`$${pIndex++}`);
        }
        if (locationLng !== undefined) {
          fields.push('location_lng');
          values.push(locationLng);
          placeholders.push(`$${pIndex++}`);
        }
        if (address !== undefined) {
          fields.push('address');
          values.push(address);
          placeholders.push(`$${pIndex++}`);
        }
        if (city !== undefined) {
          fields.push('city');
          values.push(city);
          placeholders.push(`$${pIndex++}`);
        }
        if (country !== undefined) {
          fields.push('country');
          values.push(country);
          placeholders.push(`$${pIndex++}`);
        }
        if (preferences !== undefined) {
          fields.push('preferences');
          values.push(JSON.stringify(preferences));
          placeholders.push(`$${pIndex++}`);
        }

        query = `INSERT INTO user_profiles (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
        result = await database.query(query, values);
      } else {
        // Update existing profile
        updateFields.push(`updated_at = NOW()`);
        query = `UPDATE user_profiles SET ${updateFields.join(', ')} WHERE user_id = $${userIdParamIndex} RETURNING *`;
        result = await database.query(query, updateValues);
      }

      const profile = result.rows[0];

      // Publish user profile updated event
      if (updatedFields.length > 0) {
        await eventPublisher.publishUserProfileUpdated(
          req.user.userId,
          req.user.phone,
          req.user.role,
          updatedFields,
          new Date().toISOString()
        );
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        profile: {
          id: profile.id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          profileImageUrl: profile.profile_image_url,
          locationLat: profile.location_lat,
          locationLng: profile.location_lng,
          address: profile.address,
          city: profile.city,
          country: profile.country,
          preferences: profile.preferences,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        },
      });
    } catch (error) {
      logger.error('Update user profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
      });
    }
  }

  // Health check endpoint (public)
  async healthCheck(req, res) {
    try {
      const database = require('../database/connection');
      const redisClient = require('../cache/redis');
      const eventPublisher = require('../events/publisher');

      const [dbHealth, redisHealth, rabbitmqHealth] = await Promise.all([
        database.healthCheck().catch(e => ({ status: 'unhealthy', error: e.message })),
        redisClient.healthCheck().catch(e => ({ status: 'unhealthy', error: e.message })),
        eventPublisher.healthCheck().catch(e => ({ status: 'unhealthy', error: e.message })),
      ]);

      const overallHealth = dbHealth.status === 'healthy' && 
                           redisHealth.status === 'healthy' && 
                           rabbitmqHealth.status === 'healthy';

      res.status(overallHealth ? 200 : 503).json({
        success: overallHealth,
        status: overallHealth ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: dbHealth,
          redis: redisHealth,
          rabbitmq: rabbitmqHealth,
        },
      });
    } catch (error) {
      logger.error('Health check error:', error);
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  }
}

module.exports = new AuthController();
