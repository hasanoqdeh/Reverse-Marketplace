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

  // Admin management endpoints
  async addAdminToWhitelist(req, res) {
    try {
      const { phone, name, adminLevel, department } = req.body;
      const addedBy = req.user?.userId;

      const result = await authService.addAdminToWhitelist(phone, name, adminLevel, department, addedBy);

      res.status(201).json({
        success: result.success,
        adminId: result.adminId,
        message: result.message,
      });
    } catch (error) {
      logger.error('Add admin error:', error);
      
      if (error.message.includes('Invalid phone number')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          error: 'INVALID_PHONE',
        });
      } else if (error.message.includes('Admin already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message,
          error: 'ADMIN_EXISTS',
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

  async getAdminWhitelist(req, res) {
    try {
      const { page, limit } = req.query;

      const result = await authService.getAdminWhitelist(parseInt(page), parseInt(limit));

      res.status(200).json({
        success: true,
        admins: result.admins,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Get admin whitelist error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
      });
    }
  }

  async removeAdminFromWhitelist(req, res) {
    try {
      const { adminId } = req.params;
      const removedBy = req.user?.userId;

      const result = await authService.removeAdminFromWhitelist(adminId, removedBy);

      res.status(200).json({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      logger.error('Remove admin error:', error);
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

      updateFields.push(`updated_at = NOW()`);
      updateValues.push(req.user.userId);

      let query, result;
      if (existingProfileResult.rows.length === 0) {
        // Create new profile
        const fields = ['user_id', 'first_name', 'last_name'];
        const values = [req.user.userId, firstName || 'User', lastName || 'User'];
        const placeholders = ['$1', '$2', '$3'];
        
        if (profileImageUrl !== undefined) {
          fields.push('profile_image_url');
          values.push(profileImageUrl);
          placeholders.push(`$${values.length}`);
        }
        if (locationLat !== undefined) {
          fields.push('location_lat');
          values.push(locationLat);
          placeholders.push(`$${values.length}`);
        }
        if (locationLng !== undefined) {
          fields.push('location_lng');
          values.push(locationLng);
          placeholders.push(`$${values.length}`);
        }
        if (address !== undefined) {
          fields.push('address');
          values.push(address);
          placeholders.push(`$${values.length}`);
        }
        if (city !== undefined) {
          fields.push('city');
          values.push(city);
          placeholders.push(`$${values.length}`);
        }
        if (country !== undefined) {
          fields.push('country');
          values.push(country);
          placeholders.push(`$${values.length}`);
        }
        if (preferences !== undefined) {
          fields.push('preferences');
          values.push(JSON.stringify(preferences));
          placeholders.push(`$${values.length}`);
        }

        query = `INSERT INTO user_profiles (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
        result = await database.query(query, values);
      } else {
        // Update existing profile
        query = `UPDATE user_profiles SET ${updateFields.join(', ')} WHERE user_id = $${paramIndex} RETURNING *`;
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

  // Health check endpoint
  async healthCheck(req, res) {
    try {
      const database = require('../database/connection');
      const redisClient = require('../cache/redis');
      const eventPublisher = require('../events/publisher');

      const [dbHealth, redisHealth, rabbitmqHealth] = await Promise.all([
        database.healthCheck(),
        redisClient.healthCheck(),
        eventPublisher.healthCheck(),
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

  // User Management endpoints
  async getUsers(req, res) {
    try {
      const database = require('../database/connection');
      const {
        page = 1,
        limit = 20,
        search,
        role = 'ALL',
        status = 'ALL',
        registrationDateFrom,
        registrationDateTo,
        lastLoginFrom,
        lastLoginTo,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      // Build WHERE conditions
      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      if (role !== 'ALL') {
        whereConditions.push(`u.role = $${paramIndex++}`);
        queryParams.push(role);
      }

      if (status !== 'ALL') {
        whereConditions.push(`u.status = $${paramIndex++}`);
        queryParams.push(status);
      }

      if (search) {
        whereConditions.push(`(u.phone ILIKE $${paramIndex++} OR up.first_name ILIKE $${paramIndex++} OR up.last_name ILIKE $${paramIndex++})`);
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (registrationDateFrom) {
        whereConditions.push(`u.created_at >= $${paramIndex++}`);
        queryParams.push(registrationDateFrom);
      }

      if (registrationDateTo) {
        whereConditions.push(`u.created_at <= $${paramIndex++}`);
        queryParams.push(registrationDateTo);
      }

      if (lastLoginFrom) {
        whereConditions.push(`u.last_login_at >= $${paramIndex++}`);
        queryParams.push(lastLoginFrom);
      }

      if (lastLoginTo) {
        whereConditions.push(`u.last_login_at <= $${paramIndex++}`);
        queryParams.push(lastLoginTo);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        ${whereClause}
      `;
      
      const countResult = await database.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get users with pagination
      const usersQuery = `
        SELECT 
          u.id,
          u.phone,
          u.role,
          u.status,
          u.phone_verified,
          u.created_at,
          u.updated_at,
          u.last_login_at,
          u.failed_login_attempts,
          u.locked_until,
          up.first_name,
          up.last_name,
          up.city,
          up.country,
          aw.admin_level,
          aw.department,
          aw.is_active as admin_is_active
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN admin_whitelist aw ON u.id = aw.user_id AND u.role = 'ADMIN'
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;

      queryParams.push(parseInt(limit), offset);
      const usersResult = await database.query(usersQuery, queryParams);

      const users = usersResult.rows.map(row => ({
        id: row.id,
        phone: row.phone,
        role: row.role,
        status: row.status,
        phoneVerified: row.phone_verified,
        createdAt: row.created_at,
        lastLoginAt: row.last_login_at,
        failedLoginAttempts: row.failed_login_attempts,
        lockedUntil: row.locked_until,
        profile: row.first_name ? {
          firstName: row.first_name,
          lastName: row.last_name,
          city: row.city,
          country: row.country
        } : null,
        adminInfo: row.role === 'ADMIN' ? {
          adminLevel: row.admin_level,
          department: row.department,
          isActive: row.admin_is_active
        } : null
      }));

      res.status(200).json({
        success: true,
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        },
        filters: {
          appliedFilters: { page, limit, search, role, status },
          availableFilters: [
            { key: 'role', label: 'Role', type: 'select', options: [
              { value: 'ALL', label: 'All Roles' },
              { value: 'BUYER', label: 'Buyer' },
              { value: 'MERCHANT', label: 'Merchant' },
              { value: 'ADMIN', label: 'Admin' }
            ]},
            { key: 'status', label: 'Status', type: 'select', options: [
              { value: 'ALL', label: 'All Status' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'SUSPENDED', label: 'Suspended' },
              { value: 'BANNED', label: 'Banned' }
            ]}
          ]
        }
      });
    } catch (error) {
      logger.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
      });
    }
  }

  async getUserById(req, res) {
    try {
      const database = require('../database/connection');
      const { userId } = req.params;

      const query = `
        SELECT 
          u.id,
          u.phone,
          u.role,
          u.status,
          u.phone_verified,
          u.created_at,
          u.updated_at,
          u.last_login_at,
          u.failed_login_attempts,
          u.locked_until,
          up.first_name,
          up.last_name,
          up.profile_image_url,
          up.location_lat,
          up.location_lng,
          up.address,
          up.city,
          up.country,
          up.preferences,
          aw.admin_level,
          aw.department,
          aw.is_active as admin_is_active
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN admin_whitelist aw ON u.id = aw.user_id AND u.role = 'ADMIN'
        WHERE u.id = $1
      `;

      const result = await database.query(query, [userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND',
        });
      }

      const row = result.rows[0];
      const user = {
        id: row.id,
        phone: row.phone,
        role: row.role,
        status: row.status,
        phoneVerified: row.phone_verified,
        createdAt: row.created_at,
        lastLoginAt: row.last_login_at,
        failedLoginAttempts: row.failed_login_attempts,
        lockedUntil: row.locked_until,
        profile: row.first_name ? {
          id: row.id,
          firstName: row.first_name,
          lastName: row.last_name,
          profileImageUrl: row.profile_image_url,
          locationLat: row.location_lat,
          locationLng: row.location_lng,
          address: row.address,
          city: row.city,
          country: row.country,
          preferences: row.preferences || {},
          createdAt: row.created_at,
          updatedAt: row.updated_at
        } : null,
        adminInfo: row.role === 'ADMIN' ? {
          adminLevel: row.admin_level,
          department: row.department,
          isActive: row.admin_is_active
        } : null
      };

      res.status(200).json({
        success: true,
        user
      });
    } catch (error) {
      logger.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
      });
    }
  }

  async suspendUser(req, res) {
    try {
      const database = require('../database/connection');
      const { userId } = req.params;
      const { reason, duration, notifyUser, internalNote } = req.body;
      const suspendedBy = req.user?.userId;

      // Check if user exists
      const userCheck = await database.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (userCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND',
        });
      }

      const user = userCheck.rows[0];

      // Calculate suspension end time
      let suspendedUntil = null;
      if (duration) {
        suspendedUntil = new Date();
        suspendedUntil.setHours(suspendedUntil.getHours() + parseInt(duration));
      }

      // Update user status
      await database.query(
        'UPDATE users SET status = $1, locked_until = $2, updated_at = NOW() WHERE id = $3',
        ['SUSPENDED', suspendedUntil, userId]
      );

      // Add internal note if provided
      if (internalNote) {
        await database.query(
          'INSERT INTO user_notes (user_id, admin_id, note_type, note_content, is_internal) VALUES ($1, $2, $3, $4, $5)',
          [userId, suspendedBy, 'SUPPORT', internalNote, true]
        );
      }

      // Log the action
      await database.query(
        'INSERT INTO admin_activity_logs (admin_id, action_type, target_type, target_id, action_details, ip_address, user_agent, success) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [suspendedBy, 'USER_SUSPEND', 'USER', userId, { reason, duration }, req.clientIP, req.userAgent, true]
      );

      res.status(200).json({
        success: true,
        message: 'User suspended successfully',
        user: {
          id: userId,
          status: 'SUSPENDED',
          suspendedUntil
        }
      });
    } catch (error) {
      logger.error('Suspend user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
      });
    }
  }

  async banUser(req, res) {
    try {
      const database = require('../database/connection');
      const { userId } = req.params;
      const { reason, permanent, notifyUser, internalNote, deleteData } = req.body;
      const bannedBy = req.user?.userId;

      // Check if user exists
      const userCheck = await database.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (userCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND',
        });
      }

      // Update user status
      await database.query(
        'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2',
        ['BANNED', userId]
      );

      // Add internal note if provided
      if (internalNote) {
        await database.query(
          'INSERT INTO user_notes (user_id, admin_id, note_type, note_content, is_internal) VALUES ($1, $2, $3, $4, $5)',
          [userId, bannedBy, 'SECURITY', internalNote, true]
        );
      }

      // Log the action
      await database.query(
        'INSERT INTO admin_activity_logs (admin_id, action_type, target_type, target_id, action_details, ip_address, user_agent, success) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [bannedBy, 'USER_BAN', 'USER', userId, { reason, permanent, deleteData }, req.clientIP, req.userAgent, true]
      );

      res.status(200).json({
        success: true,
        message: 'User banned successfully',
        user: {
          id: userId,
          status: 'BANNED',
          bannedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Ban user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
      });
    }
  }

  async verifyUser(req, res) {
    try {
      const database = require('../database/connection');
      const { userId } = req.params;
      const verifiedBy = req.user?.userId;

      // Check if user exists
      const userCheck = await database.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (userCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND',
        });
      }

      // Update user verification status
      await database.query(
        'UPDATE users SET phone_verified = true, status = $1, updated_at = NOW() WHERE id = $2',
        ['ACTIVE', userId]
      );

      // Log the action
      await database.query(
        'INSERT INTO admin_activity_logs (admin_id, action_type, target_type, target_id, action_details, ip_address, user_agent, success) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [verifiedBy, 'VERIFICATION_OVERRIDE', 'USER', userId, {}, req.clientIP, req.userAgent, true]
      );

      res.status(200).json({
        success: true,
        message: 'User verified successfully'
      });
    } catch (error) {
      logger.error('Verify user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
      });
    }
  }

  async bulkUserAction(req, res) {
    try {
      const database = require('../database/connection');
      const { userIds, action, actionData } = req.body;
      const performedBy = req.user?.userId;

      const results = {
        successful: [],
        failed: []
      };

      for (const userId of userIds) {
        try {
          switch (action) {
            case 'SUSPEND':
              await this.suspendUser({ params: { userId }, body: actionData, user: req.user, clientIP: req.clientIP, userAgent: req.userAgent }, { status: () => {} });
              results.successful.push({ userId, success: true });
              break;
            case 'BAN':
              await this.banUser({ params: { userId }, body: actionData, user: req.user, clientIP: req.clientIP, userAgent: req.userAgent }, { status: () => {} });
              results.successful.push({ userId, success: true });
              break;
            case 'VERIFY':
              await this.verifyUser({ params: { userId }, user: req.user, clientIP: req.clientIP, userAgent: req.userAgent }, { status: () => {} });
              results.successful.push({ userId, success: true });
              break;
            default:
              results.failed.push({ userId, error: 'Invalid action' });
          }
        } catch (error) {
          results.failed.push({ userId, error: error.message });
        }
      }

      res.status(200).json({
        success: true,
        processed: userIds.length,
        successful: results.successful,
        failed: results.failed,
        summary: {
          totalProcessed: userIds.length,
          successCount: results.successful.length,
          failureCount: results.failed.length
        }
      });
    } catch (error) {
      logger.error('Bulk user action error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
      });
    }
  }

  // Dashboard endpoints
  async getDashboardMetrics(req, res) {
    try {
      const database = require('../database/connection');

      // Get user metrics
      const userMetrics = await database.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active,
          COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as new_today,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_this_week,
          COUNT(CASE WHEN role = 'BUYER' THEN 1 END) as buyers,
          COUNT(CASE WHEN role = 'MERCHANT' THEN 1 END) as merchants,
          COUNT(CASE WHEN role = 'ADMIN' THEN 1 END) as admins,
          COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'SUSPENDED' THEN 1 END) as suspended,
          COUNT(CASE WHEN status = 'BANNED' THEN 1 END) as banned
        FROM users
      `);

      // Get authentication metrics
      const authMetrics = await database.query(`
        SELECT 
          COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as login_attempts_today,
          COUNT(CASE WHEN created_at >= CURRENT_DATE AND success = true THEN 1 END) as successful_logins_today,
          COUNT(CASE WHEN created_at >= CURRENT_DATE AND success = false THEN 1 END) as failed_logins_today,
          COUNT(CASE WHEN created_at >= CURRENT_DATE AND event_type = 'OTP_SENT' THEN 1 END) as otp_sent_today
        FROM auth_audit_logs
        WHERE created_at >= CURRENT_DATE
      `);

      // Get security metrics
      const securityMetrics = await database.query(`
        SELECT 
          COUNT(CASE WHEN created_at >= CURRENT_DATE AND (event_type = 'SUSPICIOUS_LOGIN' OR event_type = 'RATE_LIMIT_EXCEEDED') THEN 1 END) as suspicious_activities,
          COUNT(CASE WHERE status = 'LOCKED' THEN 1 END) as locked_accounts,
          COUNT(CASE WHERE status = 'ACTIVE' AND role = 'ADMIN' THEN 1 END) as active_admin_sessions
        FROM users
      `);

      const metrics = userMetrics.rows[0];
      const auth = authMetrics.rows[0];
      const security = securityMetrics.rows[0];

      res.status(200).json({
        success: true,
        metrics: {
          users: {
            total: parseInt(metrics.total),
            active: parseInt(metrics.active),
            newToday: parseInt(metrics.new_today),
            newThisWeek: parseInt(metrics.new_this_week),
            byRole: {
              BUYER: parseInt(metrics.buyers),
              MERCHANT: parseInt(metrics.merchants),
              ADMIN: parseInt(metrics.admins)
            },
            byStatus: {
              ACTIVE: parseInt(metrics.active),
              PENDING: parseInt(metrics.pending),
              SUSPENDED: parseInt(metrics.suspended),
              BANNED: parseInt(metrics.banned)
            }
          },
          authentication: {
            loginAttemptsToday: parseInt(auth.login_attempts_today),
            successfulLoginsToday: parseInt(auth.successful_logins_today),
            failedLoginsToday: parseInt(auth.failed_logins_today),
            otpSentToday: parseInt(auth.otp_sent_today),
            averageLoginTime: 2.5 // placeholder
          },
          security: {
            suspiciousActivities: parseInt(security.suspicious_activities),
            blockedIPs: 0, // placeholder
            lockedAccounts: parseInt(security.locked_accounts),
            activeAdminSessions: parseInt(security.active_admin_sessions)
          },
          system: {
            uptime: 99.9,
            apiResponseTime: 150,
            databaseConnections: 5,
            errorRate: 0.01
          }
        },
        trends: {
          userRegistrations: [], // Would need date-based query
          loginActivity: [], // Would need date-based query
          securityEvents: [] // Would need date-based query
        }
      });
    } catch (error) {
      logger.error('Get dashboard metrics error:', error);
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
      res.status(200).json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          redis: 'connected',
          rabbitmq: 'connected',
        },
      });
    } catch (error) {
      logger.error('Health check error:', error);
      res.status(500).json({
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'HEALTH_CHECK_FAILED',
      });
    }
  }

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

  // Security endpoints
  async getSecurityAlerts(req, res) {
    try {
      // For now, return mock data - this can be enhanced later with real security alerts
      const mockAlerts = [
        {
          id: '1',
          type: 'SUSPICIOUS_LOGIN',
          severity: 'MEDIUM',
          title: 'Suspicious login attempt detected',
          description: 'Multiple failed login attempts from unusual IP address',
          userId: null,
          phone: '+962712345678',
          ipAddress: '192.168.1.100',
          occurredAt: new Date().toISOString(),
          status: 'NEW',
          actions: [
            { action: 'investigate', label: 'Investigate', requiresConfirmation: false },
            { action: 'block_ip', label: 'Block IP', requiresConfirmation: true }
          ]
        },
        {
          id: '2',
          type: 'RATE_LIMIT_EXCEEDED',
          severity: 'LOW',
          title: 'Rate limit exceeded',
          description: 'User exceeded rate limit for OTP requests',
          userId: 'user-123',
          phone: '+962798765432',
          ipAddress: '10.0.0.1',
          occurredAt: new Date(Date.now() - 3600000).toISOString(),
          status: 'INVESTIGATING',
          actions: [
            { action: 'resolve', label: 'Resolve', requiresConfirmation: false }
          ]
        }
      ];

      const summary = {
        total: mockAlerts.length,
        bySeverity: {
          'LOW': mockAlerts.filter(a => a.severity === 'LOW').length,
          'MEDIUM': mockAlerts.filter(a => a.severity === 'MEDIUM').length,
          'HIGH': mockAlerts.filter(a => a.severity === 'HIGH').length,
          'CRITICAL': mockAlerts.filter(a => a.severity === 'CRITICAL').length
        },
        byStatus: {
          'NEW': mockAlerts.filter(a => a.status === 'NEW').length,
          'INVESTIGATING': mockAlerts.filter(a => a.status === 'INVESTIGATING').length,
          'RESOLVED': mockAlerts.filter(a => a.status === 'RESOLVED').length,
          'FALSE_POSITIVE': mockAlerts.filter(a => a.status === 'FALSE_POSITIVE').length
        }
      };

      res.status(200).json({
        success: true,
        alerts: mockAlerts,
        summary
      });
    } catch (error) {
      logger.error('Get security alerts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch security alerts',
        error: 'GET_SECURITY_ALERTS_FAILED'
      });
    }
  }

  async resolveSecurityAlert(req, res) {
    try {
      const { alertId } = req.params;
      const { resolution } = req.body;

      // For now, just return success - this can be enhanced later with actual database updates
      logger.info(`Security alert ${alertId} resolved with resolution: ${resolution}`);

      res.status(200).json({
        success: true,
        message: 'Security alert resolved successfully'
      });
    } catch (error) {
      logger.error('Resolve security alert error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resolve security alert',
        error: 'RESOLVE_SECURITY_ALERT_FAILED'
      });
    }
  }
}

module.exports = new AuthController();
