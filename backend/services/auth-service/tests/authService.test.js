const authService = require('../services/authService');
const database = require('../database/connection');
const redisClient = require('../cache/redis');
const eventPublisher = require('../events/publisher');

// Mock dependencies
jest.mock('../database/connection');
jest.mock('../cache/redis');
jest.mock('../events/publisher');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateOTP', () => {
    it('should generate a 6-digit OTP', () => {
      const otp = authService.generateOTP();
      expect(otp).toMatch(/^\d{6}$/);
      expect(otp.length).toBe(6);
    });

    it('should generate different OTPs each time', () => {
      const otp1 = authService.generateOTP();
      const otp2 = authService.generateOTP();
      expect(otp1).not.toBe(otp2);
    });
  });

  describe('generateDeviceFingerprint', () => {
    it('should generate a device fingerprint', () => {
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';
      
      const fingerprint = authService.generateDeviceFingerprint(ipAddress, userAgent);
      
      expect(fingerprint).toBeDefined();
      expect(typeof fingerprint).toBe('string');
      expect(fingerprint.length).toBeGreaterThan(0);
    });

    it('should generate consistent fingerprints for same device', () => {
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';
      
      const fingerprint1 = authService.generateDeviceFingerprint(ipAddress, userAgent);
      const fingerprint2 = authService.generateDeviceFingerprint(ipAddress, userAgent);
      
      expect(fingerprint1).toBe(fingerprint2);
    });
  });

  describe('generateJWT', () => {
    it('should generate valid JWT tokens', () => {
      const userId = 'user-123';
      const phone = '+96291234567';
      const role = 'BUYER';
      
      const tokens = authService.generateJWT(userId, phone, role);
      
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    it('should include user data in token payload', () => {
      const userId = 'user-123';
      const phone = '+96291234567';
      const role = 'MERCHANT';
      const adminLevel = 'ADMIN';
      
      const tokens = authService.generateJWT(userId, phone, role, { adminLevel });
      
      // Decode token to verify payload
      const payload = JSON.parse(Buffer.from(tokens.accessToken.split('.')[1], 'base64').toString());
      
      expect(payload.userId).toBe(userId);
      expect(payload.phone).toBe(phone);
      expect(payload.role).toBe(role);
      expect(payload.adminLevel).toBe(adminLevel);
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate Omani phone numbers', () => {
      const validOmaniPhone = '+96291234567';
      const result = authService.validatePhoneNumber(validOmaniPhone);
      expect(result).toBe('96291234567');
    });

    it('should validate international phone numbers', () => {
      const validInternationalPhone = '+1234567890';
      const result = authService.validatePhoneNumber(validInternationalPhone);
      expect(result).toBe('1234567890');
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhone = '123';
      const result = authService.validatePhoneNumber(invalidPhone);
      expect(result).toBeNull();
    });
  });

  describe('checkRateLimit', () => {
    it('should check rate limit and return status', async () => {
      const key = 'test-key';
      const windowMs = 60000; // 1 minute
      const maxRequests = 5;
      
      redisClient.incrementRateLimit.mockResolvedValue({
        current: 3,
        remaining: 2,
        resetTime: Date.now() + 30000,
        isExceeded: false,
      });

      const result = await authService.checkRateLimit(key, windowMs, maxRequests);
      
      expect(redisClient.incrementRateLimit).toHaveBeenCalledWith(key, windowMs, maxRequests);
      expect(result.isExceeded).toBe(false);
      expect(result.remaining).toBe(2);
    });

    it('should detect rate limit exceeded', async () => {
      const key = 'test-key';
      const windowMs = 60000;
      const maxRequests = 5;
      
      redisClient.incrementRateLimit.mockResolvedValue({
        current: 6,
        remaining: 0,
        resetTime: Date.now() + 30000,
        isExceeded: true,
      });

      const result = await authService.checkRateLimit(key, windowMs, maxRequests);
      
      expect(result.isExceeded).toBe(true);
      expect(result.remaining).toBe(0);
    });
  });

  describe('isAccountLocked', () => {
    it('should return false for unlocked account', async () => {
      const userId = 'user-123';
      
      database.query.mockResolvedValue({
        rows: [{
          locked_until: null,
          failed_login_attempts: 2,
        }]
      });

      const result = await authService.isAccountLocked(userId, '+96291234567');
      
      expect(result.locked).toBe(false);
      expect(result.lockoutRemaining).toBe(0);
    });

    it('should return true for locked account', async () => {
      const userId = 'user-123';
      const futureDate = new Date(Date.now() + 30 * 60 * 1000);
      
      database.query.mockResolvedValue({
        rows: [{
          locked_until: futureDate,
          failed_login_attempts: 5,
        }]
      });

      const result = await authService.isAccountLocked(userId, '+96291234567');
      
      expect(result.locked).toBe(true);
      expect(result.lockoutRemaining).toBeGreaterThan(0);
    });
  });

  describe('lockAccount', () => {
    it('should lock account with progressive duration', async () => {
      const userId = 'user-123';
      const phone = '+96291234567';
      
      database.query.mockResolvedValue({ rows: [] });
      
      const lockUntil = await authService.lockAccount(userId, phone);
      
      expect(database.query).toHaveBeenCalledWith(
        'UPDATE users SET locked_until = $1 WHERE id = $2 OR phone = $3',
        [expect.any(Date), userId, phone]
      );
      expect(lockUntil).toBeInstanceOf(Date);
    });
  });

  describe('incrementFailedAttempts', () => {
    it('should increment failed attempts and lock account at threshold', async () => {
      const userId = 'user-123';
      
      database.query.mockResolvedValueOnce({
        rows: [{ failed_login_attempts: 4 }]
      });
      database.query.mockResolvedValueOnce({
        rows: [{ failed_login_attempts: 5 }]
      });

      const attempts = await authService.incrementFailedAttempts(userId, '+96291234567');
      
      expect(attempts).toBe(5);
      expect(database.query).toHaveBeenCalledWith(
        'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1 OR phone = $2 RETURNING failed_login_attempts',
        [userId, '+96291234567']
      );
    });
  });

  describe('initiatePhoneLogin', () => {
    it('should initiate phone login successfully', async () => {
      const phone = '+96291234567';
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';
      
      // Mock existing user
      database.query.mockResolvedValueOnce({
        rows: [{
          id: 'user-123',
          phone: '+96291234567',
          role: 'BUYER',
          status: 'ACTIVE',
        }]
      });
      
      // Mock OTP storage
      database.query.mockResolvedValueOnce({ rows: [] });
      redisClient.setOtpCache.mockResolvedValueOnce();
      
      // Mock SMS sending
      authService.sendOTP = jest.fn().mockResolvedValue(true);
      
      // Mock event publishing
      eventPublisher.publishOtpSent.mockResolvedValue();
      authService.logAuthEvent = jest.fn().mockResolvedValue();
      
      const result = await authService.initiatePhoneLogin(phone, 'OM', ipAddress, userAgent);
      
      expect(result.success).toBe(true);
      expect(result.otpSent).toBe(true);
      expect(result.expiresAt).toBeDefined();
      expect(authService.sendOTP).toHaveBeenCalledWith(phone, expect.any(String), 'LOGIN');
      expect(eventPublisher.publishOtpSent).toHaveBeenCalled();
    });

    it('should create new user if not exists', async () => {
      const phone = '+96291234568';
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';
      
      // Mock no existing user
      database.query.mockResolvedValueOnce({ rows: [] });
      
      // Mock user creation
      database.query.mockResolvedValueOnce({
        rows: [{
          id: 'user-456',
          phone: '+96291234568',
          role: 'BUYER',
          status: 'PENDING',
        }]
      });
      
      // Mock profile creation
      database.query.mockResolvedValueOnce({ rows: [] });
      
      // Mock OTP storage
      database.query.mockResolvedValueOnce({ rows: [] });
      redisClient.setOtpCache.mockResolvedValueOnce();
      
      // Mock SMS sending
      authService.sendOTP = jest.fn().mockResolvedValue(true);
      
      // Mock event publishing
      eventPublisher.publishUserRegistered.mockResolvedValue();
      eventPublisher.publishOtpSent.mockResolvedValue();
      authService.logAuthEvent = jest.fn().mockResolvedValue();
      
      const result = await authService.initiatePhoneLogin(phone, 'OM', ipAddress, userAgent);
      
      expect(result.success).toBe(true);
      expect(database.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining([phone, 'BUYER', 'PENDING', false])
      );
      expect(eventPublisher.publishUserRegistered).toHaveBeenCalled();
    });

    it('should handle rate limit exceeded', async () => {
      const phone = '+96291234567';
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';
      
      // Mock rate limit exceeded
      authService.checkRateLimit = jest.fn().mockResolvedValue({
        isExceeded: true,
        nextAttemptAt: new Date(Date.now() + 60000).toISOString(),
      });
      
      const result = await authService.initiatePhoneLogin(phone, 'OM', ipAddress, userAgent);
      
      expect(result.success).toBe(false);
      expect(result.rateLimitExceeded).toBe(true);
      expect(result.nextAttemptAt).toBeDefined();
    });

    it('should handle locked account', async () => {
      const phone = '+96291234567';
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';
      
      // Mock locked account
      authService.isAccountLocked = jest.fn().mockResolvedValue({
        locked: true,
        lockoutRemaining: 1800,
      });
      
      const result = await authService.initiatePhoneLogin(phone, 'OM', ipAddress, userAgent);
      
      expect(result.success).toBe(false);
      expect(result.accountLocked).toBe(true);
      expect(result.lockoutRemaining).toBe(1800);
    });
  });

  describe('verifyOTP', () => {
    it('should verify OTP successfully', async () => {
      const phone = '+96291234567';
      const otpCode = '123456';
      const deviceFingerprint = 'test-fingerprint';
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';
      
      // Mock user
      database.query.mockResolvedValueOnce({
        rows: [{
          id: 'user-123',
          phone: '+96291234567',
          role: 'BUYER',
          status: 'ACTIVE',
        }]
      });
      
      // Mock OTP record
      database.query.mockResolvedValueOnce({
        rows: [{
          id: 'otp-123',
          code: '123456',
          attempts: 0,
          expires_at: new Date(Date.now() + 10 * 60 * 1000),
          used_at: null,
        }]
      });
      
      // Mock token generation
      authService.generateJWT = jest.fn().mockReturnValue({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresIn: 900,
      });
      
      // Mock token storage
      database.query.mockResolvedValueOnce({ rows: [] });
      
      // Mock session creation
      database.query.mockResolvedValueOnce({ rows: [] });
      redisClient.setSession.mockResolvedValueOnce();
      
      // Mock event publishing
      eventPublisher.publishLoginSuccess.mockResolvedValue();
      eventPublisher.publishOtpVerified.mockResolvedValue();
      authService.logAuthEvent = jest.fn().mockResolvedValue();
      
      const result = await authService.verifyOTP(phone, otpCode, deviceFingerprint, ipAddress, userAgent);
      
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.tokens).toBeDefined();
      expect(result.sessionTimeout).toBeGreaterThan(0);
    });

    it('should handle invalid OTP', async () => {
      const phone = '+96291234567';
      const otpCode = '000000';
      const deviceFingerprint = 'test-fingerprint';
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';
      
      // Mock user
      database.query.mockResolvedValueOnce({
        rows: [{
          id: 'user-123',
          phone: '+96291234567',
          role: 'BUYER',
          status: 'ACTIVE',
        }]
      });
      
      // Mock OTP record
      database.query.mockResolvedValueOnce({
        rows: [{
          id: 'otp-123',
          code: '123456',
          attempts: 0,
          expires_at: new Date(Date.now() + 10 * 60 * 1000),
          used_at: null,
        }]
      });
      
      // Mock failed attempts increment
      database.query.mockResolvedValueOnce({
        rows: [{ failed_login_attempts: 1 }]
      });
      
      // Mock event publishing
      authService.logAuthEvent = jest.fn().mockResolvedValue();
      
      const result = await authService.verifyOTP(phone, otpCode, deviceFingerprint, ipAddress, userAgent);
      
      expect(result).rejects.toThrow('Invalid OTP');
    });

    it('should handle expired OTP', async () => {
      const phone = '+96291234567';
      const otpCode = '123456';
      const deviceFingerprint = 'test-fingerprint';
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';
      
      // Mock user
      database.query.mockResolvedValueOnce({
        rows: [{
          id: 'user-123',
          phone: '+96291234567',
          role: 'BUYER',
          status: 'ACTIVE',
        }]
      });
      
      // Mock no OTP records
      database.query.mockResolvedValueOnce({ rows: [] });
      
      const result = await authService.verifyOTP(phone, otpCode, deviceFingerprint, ipAddress, userAgent);
      
      expect(result).rejects.toThrow('OTP not found or expired');
    });

    it('should handle maximum OTP attempts', async () => {
      const phone = '+96291234567';
      const otpCode = '123456';
      const deviceFingerprint = 'test-fingerprint';
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';
      
      // Mock user
      database.query.mockResolvedValueOnce({
        rows: [{
          id: 'user-123',
          phone: '+96291234567',
          role: 'BUYER',
          status: 'ACTIVE',
        }]
      });
      
      // Mock OTP record with max attempts
      database.query.mockResolvedValueOnce({
        rows: [{
          id: 'otp-123',
          code: '123456',
          attempts: 3,
          expires_at: new Date(Date.now() + 10 * 60 * 1000),
          used_at: null,
        }]
      });
      
      // Mock attempts increment
      database.query.mockResolvedValueOnce({
        rows: [{ failed_login_attempts: 4 }]
      });
      
      const result = await authService.verifyOTP(phone, otpCode, deviceFingerprint, ipAddress, userAgent);
      
      expect(result).rejects.toThrow('Maximum OTP attempts exceeded');
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';
      
      // Mock token validation
      authService.verifyJWT = jest.fn().mockReturnValue({
        userId: 'user-123',
        phone: '+96291234567',
        role: 'BUYER',
        type: 'refresh',
      });
      
      // Mock token lookup
      database.query.mockResolvedValueOnce({
        rows: [{
          id: 'token-123',
          user_id: 'user-123',
          token_type: 'REFRESH',
          token_hash: 'hashed-token',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }]
      });
      
      // Mock new token generation
      authService.generateJWT = jest.fn().mockReturnValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 900,
      });
      
      // Mock new token storage
      database.query.mockResolvedValueOnce({ rows: [] });
      
      // Mock old token revocation
      database.query.mockResolvedValueOnce({ rows: [] });
      
      // Mock event publishing
      eventPublisher.publishTokenRefresh.mockResolvedValue();
      authService.logAuthEvent = jest.fn().mockResolvedValue();
      
      const result = await authService.refreshToken(refreshToken, ipAddress, userAgent);
      
      expect(result.success).toBe(true);
      expect(result.tokens.accessToken).toBe('new-access-token');
      expect(result.tokens.refreshToken).toBe('new-refresh-token');
    });

    it('should handle invalid refresh token', async () => {
      const refreshToken = 'invalid-refresh-token';
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';
      
      // Mock token validation failure
      authService.verifyJWT = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token: expired');
      });
      
      const result = await authService.refreshToken(refreshToken, ipAddress, userAgent);
      
      expect(result).rejects.toThrow('Invalid token: expired');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';
      
      // Mock token lookup
      database.query.mockResolvedValueOnce({
        rows: [{
          id: 'token-123',
          user_id: 'user-123',
          token_type: 'REFRESH',
          token_hash: 'hashed-token',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }]
      });
      
      // Mock token revocation
      database.query.mockResolvedValueOnce({ rows: [] });
      
      // Mock event publishing
      eventPublisher.publishLogout.mockResolvedValue();
      authService.logAuthEvent = jest.fn().mockResolvedValue();
      
      const result = await authService.logout(refreshToken, false, ipAddress, userAgent);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Logged out successfully');
    });

    it('should logout from all devices', async () => {
      const refreshToken = 'valid-refresh-token';
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';
      
      // Mock token lookup
      database.query.mockResolvedValueOnce({
        rows: [{
          id: 'token-123',
          user_id: 'user-123',
          token_type: 'REFRESH',
          token_hash: 'hashed-token',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }]
      });
      
      // Mock all token revocation
      database.query.mockResolvedValueOnce({ rows: [] });
      
      // Mock session deactivation
      database.query.mockResolvedValueOnce({ rows: [] });
      
      // Mock event publishing
      eventPublisher.publishLogout.mockResolvedValue();
      authService.logAuthEvent = jest.fn().mockResolvedValue();
      
      const result = await authService.logout(refreshToken, true, ipAddress, userAgent);
      
      expect(result.success).toBe(true);
      expect(database.query).toHaveBeenCalledWith(
        'UPDATE auth_tokens SET revoked_at = NOW() WHERE user_id = $1 AND token_type = $2',
        ['user-123', 'REFRESH']
      );
      expect(database.query).toHaveBeenCalledWith(
        'UPDATE user_sessions SET is_active = false WHERE user_id = $1',
        ['user-123']
      );
    });
  });

  describe('admin management', () => {
    describe('addAdminToWhitelist', () => {
      it('should add admin to whitelist successfully', async () => {
        const phone = '+96291234567';
        const name = 'Test Admin';
        const adminLevel = 'ADMIN';
        const department = 'IT';
        const addedBy = 'super-admin-123';
        
        // Mock no existing admin
        database.query.mockResolvedValueOnce({ rows: [] });
        
        // Mock admin creation
        database.query.mockResolvedValueOnce({
          rows: [{
            id: 'admin-123',
            phone: '+96291234567',
            admin_level: 'ADMIN',
            name: 'Test Admin',
            department: 'IT',
            is_active: true,
          }]
        });
        
        // Mock user creation/update
        database.query.mockResolvedValueOnce({ rows: [] });
        
        const result = await authService.addAdminToWhitelist(phone, name, adminLevel, department, addedBy);
        
        expect(result.success).toBe(true);
        expect(result.adminId).toBe('admin-123');
        expect(result.message).toBe('Admin added successfully');
      });

      it('should handle duplicate admin phone', async () => {
        const phone = '+96291234567';
        const name = 'Test Admin';
        const adminLevel = 'ADMIN';
        const department = 'IT';
        const addedBy = 'super-admin-123';
        
        // Mock existing admin
        database.query.mockResolvedValueOnce({
          rows: [{
            id: 'admin-456',
            phone: '+96291234567',
          }]
        });
        
        const result = await authService.addAdminToWhitelist(phone, name, adminLevel, department, addedBy);
        
        expect(result).rejects.toThrow('Admin already exists in whitelist');
      });
    });

    describe('getAdminWhitelist', () => {
      it('should get paginated admin whitelist', async () => {
        const page = 1;
        const limit = 10;
        
        const mockAdmins = [
          {
            id: 'admin-1',
            phone: '+96291234567',
            name: 'Admin One',
            admin_level: 'SUPER_ADMIN',
            department: 'IT',
            is_active: true,
            created_at: new Date(),
          },
          {
            id: 'admin-2',
            phone: '+96291234568',
            name: 'Admin Two',
            admin_level: 'ADMIN',
            department: 'Support',
            is_active: true,
            created_at: new Date(),
          },
        ];
        
        database.query.mockResolvedValueOnce({
          rows: mockAdmins,
        });
        
        database.query.mockResolvedValueOnce({
          rows: [{ count: '2' }],
        });
        
        const result = await authService.getAdminWhitelist(page, limit);
        
        expect(result.admins).toHaveLength(2);
        expect(result.pagination.page).toBe(page);
        expect(result.pagination.limit).toBe(limit);
        expect(result.pagination.total).toBe(2);
      });
    });

    describe('removeAdminFromWhitelist', () => {
      it('should remove admin from whitelist successfully', async () => {
        const adminId = 'admin-123';
        const removedBy = 'super-admin-123';
        
        database.query.mockResolvedValueOnce({ rows: [] });
        
        const result = await authService.removeAdminFromWhitelist(adminId, removedBy);
        
        expect(result.success).toBe(true);
        expect(result.message).toBe('Admin removed successfully');
        expect(database.query).toHaveBeenCalledWith(
          'UPDATE admin_whitelist SET is_active = false WHERE id = $1',
          [adminId]
        );
      });
    });
  });
});
