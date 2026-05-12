const request = require('supertest');
const app = require('../../index');
const database = require('../../database/connection');
const redisClient = require('../../cache/redis');
const eventPublisher = require('../../events/publisher');

describe('Authentication Endpoints Integration Tests', () => {
  let server;

  beforeAll(async () => {
    // Start test server
    server = app.listen(0);
    
    // Setup test database
    await database.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone VARCHAR(20) UNIQUE NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'BUYER',
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        phone_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login_at TIMESTAMP WITH TIME ZONE NULL,
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP WITH TIME ZONE NULL
      );
      
      CREATE TABLE IF NOT EXISTS admin_whitelist (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone VARCHAR(20) UNIQUE NOT NULL,
        admin_level VARCHAR(20) NOT NULL DEFAULT 'ADMIN',
        name VARCHAR(255) NOT NULL,
        department VARCHAR(100) NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS otp_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        phone VARCHAR(20) NOT NULL,
        code VARCHAR(6) NOT NULL,
        purpose VARCHAR(20) NOT NULL,
        attempts INTEGER DEFAULT 0,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used_at TIMESTAMP WITH TIME ZONE NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS auth_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token_type VARCHAR(20) NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        device_fingerprint VARCHAR(255) NULL,
        ip_address INET NULL,
        user_agent TEXT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        last_used_at TIMESTAMP WITH TIME ZONE NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        revoked_at TIMESTAMP WITH TIME ZONE NULL
      );
      
      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        device_fingerprint VARCHAR(255) NULL,
        ip_address INET NULL,
        user_agent TEXT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `);
  });

  afterAll(async () => {
    // Clean up test database
    await database.query(`
      DROP TABLE IF EXISTS user_sessions;
      DROP TABLE IF EXISTS auth_tokens;
      DROP TABLE IF EXISTS otp_codes;
      DROP TABLE IF EXISTS admin_whitelist;
      DROP TABLE IF EXISTS users;
    `);
    
    // Close server
    if (server) {
      server.close();
    }
  });

  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Clean Redis
    await redisClient.flushdb();
    
    // Clean database tables
    await database.query('DELETE FROM user_sessions');
    await database.query('DELETE FROM auth_tokens');
    await database.query('DELETE FROM otp_codes');
    await database.query('DELETE FROM admin_whitelist');
    await database.query('DELETE FROM users');
  });

  describe('POST /auth/phone-login', () => {
    it('should send OTP for new user', async () => {
      const response = await request(app)
        .post('/auth/phone-login')
        .send({
          phone: '+96291234567',
          countryCode: 'OM'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.otpSent).toBe(true);
      expect(response.body.expiresAt).toBeDefined();

      // Verify user was created
      const userResult = await database.query(
        'SELECT * FROM users WHERE phone = $1',
        ['+96291234567']
      );
      expect(userResult.rows).toHaveLength(1);
      expect(userResult.rows[0].phone).toBe('+96291234567');
      expect(userResult.rows[0].role).toBe('BUYER');
      expect(userResult.rows[0].status).toBe('PENDING');
    });

    it('should handle rate limiting', async () => {
      // First request should succeed
      const response1 = await request(app)
        .post('/auth/phone-login')
        .send({
          phone: '+96291234567',
          countryCode: 'OM'
        });

      expect(response1.status).toBe(200);
      expect(response1.body.success).toBe(true);

      // Second request within rate limit should fail
      const response2 = await request(app)
        .post('/auth/phone-login')
        .send({
          phone: '+96291234567',
          countryCode: 'OM'
        });

      expect(response2.status).toBe(429);
      expect(response2.body.success).toBe(false);
      expect(response2.body.rateLimitExceeded).toBe(true);
    });

    it('should handle locked account', async () => {
      // Create a locked user
      await database.query(`
        INSERT INTO users (phone, role, status, locked_until)
        VALUES ($1, $2, $3, $4)
      `, ['+96291234568', 'BUYER', 'ACTIVE', new Date(Date.now() + 30 * 60 * 1000)]);

      const response = await request(app)
        .post('/auth/phone-login')
        .send({
          phone: '+96291234568',
          countryCode: 'OM'
        });

      expect(response.status).toBe(429);
      expect(response.body.success).toBe(false);
      expect(response.body.accountLocked).toBe(true);
      expect(response.body.lockoutRemaining).toBeGreaterThan(0);
    });

    it('should validate phone number format', async () => {
      const response = await request(app)
        .post('/auth/phone-login')
        .send({
          phone: 'invalid-phone',
          countryCode: 'OM'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/verify-otp', () => {
    beforeEach(async () => {
      // Create a user and OTP for verification tests
      await database.query(`
        INSERT INTO users (phone, role, status, phone_verified)
        VALUES ($1, $2, $3, $4)
      `, ['+96291234567', 'BUYER', 'ACTIVE', true]);

      await database.query(`
        INSERT INTO otp_codes (user_id, phone, code, purpose, expires_at)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        (await database.query('SELECT id FROM users WHERE phone = $1', ['+96291234567'])).rows[0].id,
        '+96291234567',
        '123456',
        'LOGIN',
        new Date(Date.now() + 10 * 60 * 1000)
      ]);
    });

    it('should verify OTP successfully', async () => {
      const response = await request(app)
        .post('/auth/verify-otp')
        .send({
          phone: '+96291234567',
          otpCode: '123456',
          deviceFingerprint: 'test-fingerprint'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.phone).toBe('+96291234567');
      expect(response.body.user.role).toBe('BUYER');
      expect(response.body.tokens).toBeDefined();
      expect(response.body.tokens.accessToken).toBeDefined();
      expect(response.body.tokens.refreshToken).toBeDefined();
      expect(response.body.sessionTimeout).toBeGreaterThan(0);

      // Verify OTP was marked as used
      const otpResult = await database.query(
        'SELECT * FROM otp_codes WHERE phone = $1 AND used_at IS NOT NULL',
        ['+96291234567']
      );
      expect(otpResult.rows).toHaveLength(1);
      expect(otpResult.rows[0].used_at).toBeDefined();

      // Verify session was created
      const sessionResult = await database.query(
        'SELECT * FROM user_sessions WHERE user_id = $1',
        [(await database.query('SELECT id FROM users WHERE phone = $1', ['+96291234567'])).rows[0].id]
      );
      expect(sessionResult.rows).toHaveLength(1);
      expect(sessionResult.rows[0].is_active).toBe(true);
    });

    it('should handle invalid OTP', async () => {
      const response = await request(app)
        .post('/auth/verify-otp')
        .send({
          phone: '+96291234567',
          otpCode: '000000',
          deviceFingerprint: 'test-fingerprint'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle expired OTP', async () => {
      // Create expired OTP
      await database.query(`
        INSERT INTO otp_codes (user_id, phone, code, purpose, expires_at)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        (await database.query('SELECT id FROM users WHERE phone = $1', ['+96291234567'])).rows[0].id,
        '+96291234567',
        '654321',
        'LOGIN',
        new Date(Date.now() - 10 * 60 * 1000) // Expired 10 minutes ago
      ]);

      const response = await request(app)
        .post('/auth/verify-otp')
        .send({
          phone: '+96291234567',
          otpCode: '654321',
          deviceFingerprint: 'test-fingerprint'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle admin verification', async () => {
      // Create admin user and whitelist entry
      await database.query(`
        INSERT INTO users (phone, role, status, phone_verified)
        VALUES ($1, $2, $3, $4)
      `, ['+96291234567', 'ADMIN', 'ACTIVE', true]);

      await database.query(`
        INSERT INTO admin_whitelist (phone, admin_level, name, is_active)
        VALUES ($1, $2, $3, $4)
      `, ['+96291234567', 'ADMIN', 'Test Admin', true]);

      await database.query(`
        INSERT INTO otp_codes (user_id, phone, code, purpose, expires_at)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        (await database.query('SELECT id FROM users WHERE phone = $1', ['+96291234567'])).rows[0].id,
        '+96291234567',
        '123456',
        'LOGIN',
        new Date(Date.now() + 10 * 60 * 1000)
      ]);

      const response = await request(app)
        .post('/auth/verify-otp')
        .send({
          phone: '+96291234567',
          otpCode: '123456',
          deviceFingerprint: 'test-fingerprint'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.role).toBe('ADMIN');
      expect(response.body.user.adminLevel).toBe('ADMIN');
    });

    it('should handle admin not in whitelist', async () => {
      // Create admin user without whitelist entry
      await database.query(`
        INSERT INTO users (phone, role, status, phone_verified)
        VALUES ($1, $2, $3, $4)
      `, ['+96298765432', 'ADMIN', 'ACTIVE', true]);

      await database.query(`
        INSERT INTO otp_codes (user_id, phone, code, purpose, expires_at)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        (await database.query('SELECT id FROM users WHERE phone = $1', ['+96298765432'])).rows[0].id,
        '+96298765432',
        '123456',
        'LOGIN',
        new Date(Date.now() + 10 * 60 * 1000)
      ]);

      const response = await request(app)
        .post('/auth/verify-otp')
        .send({
          phone: '+96298765432',
          otpCode: '123456',
          deviceFingerprint: 'test-fingerprint'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/resend-otp', () => {
    beforeEach(async () => {
      // Create a user for resend tests
      await database.query(`
        INSERT INTO users (phone, role, status, phone_verified)
        VALUES ($1, $2, $3, $4)
      `, ['+96291234567', 'BUYER', 'ACTIVE', true]);
    });

    it('should resend OTP successfully', async () => {
      const response = await request(app)
        .post('/auth/resend-otp')
        .send({
          phone: '+96291234567'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.expiresAt).toBeDefined();

      // Verify new OTP was created
      const otpResult = await database.query(
        'SELECT * FROM otp_codes WHERE phone = $1 ORDER BY created_at DESC LIMIT 1',
        ['+96291234567']
      );
      expect(otpResult.rows).toHaveLength(1);
      expect(otpResult.rows[0].code).toBeDefined();
    });

    it('should handle resend cooldown', async () => {
      // First resend should succeed
      const response1 = await request(app)
        .post('/auth/resend-otp')
        .send({
          phone: '+96291234567'
        });

      expect(response1.status).toBe(200);
      expect(response1.body.success).toBe(true);

      // Second resend within cooldown should fail
      const response2 = await request(app)
        .post('/auth/resend-otp')
        .send({
          phone: '+96291234567'
        });

      expect(response2.status).toBe(429);
      expect(response2.body.success).toBe(false);
      expect(response2.body.cooldownRemaining).toBeGreaterThan(0);
    });
  });

  describe('POST /auth/refresh-token', () => {
    beforeEach(async () => {
      // Create user and valid refresh token
      await database.query(`
        INSERT INTO users (phone, role, status, phone_verified)
        VALUES ($1, $2, $3, $4)
      `, ['+96291234567', 'BUYER', 'ACTIVE', true]);

      await database.query(`
        INSERT INTO auth_tokens (user_id, token_type, token_hash, expires_at)
        VALUES ($1, $2, $3, $4)
      `, [
        (await database.query('SELECT id FROM users WHERE phone = $1', ['+96291234567'])).rows[0].id,
        'REFRESH',
        'valid-refresh-token-hash',
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ]);
    });

    it('should refresh tokens successfully', async () => {
      const response = await request(app)
        .post('/auth/refresh-token')
        .send({
          refreshToken: 'valid-refresh-token'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.tokens).toBeDefined();
      expect(response.body.tokens.accessToken).toBeDefined();
      expect(response.body.tokens.refreshToken).toBeDefined();

      // Verify old token was revoked
      const tokenResult = await database.query(
        'SELECT * FROM auth_tokens WHERE token_hash = $1 AND revoked_at IS NOT NULL',
        ['valid-refresh-token-hash']
      );
      expect(tokenResult.rows).toHaveLength(1);
    });

    it('should handle invalid refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh-token')
        .send({
          refreshToken: 'invalid-refresh-token'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle expired refresh token', async () => {
      // Create expired refresh token
      await database.query(`
        INSERT INTO auth_tokens (user_id, token_type, token_hash, expires_at)
        VALUES ($1, $2, $3, $4)
      `, [
        (await database.query('SELECT id FROM users WHERE phone = $1', ['+96291234567'])).rows[0].id,
        'REFRESH',
        'expired-refresh-token-hash',
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ]);

      const response = await request(app)
        .post('/auth/refresh-token')
        .send({
          refreshToken: 'expired-refresh-token'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/logout', () => {
    beforeEach(async () => {
      // Create user and valid refresh token
      await database.query(`
        INSERT INTO users (phone, role, status, phone_verified)
        VALUES ($1, $2, $3, $4)
      `, ['+96291234567', 'BUYER', 'ACTIVE', true]);

      await database.query(`
        INSERT INTO auth_tokens (user_id, token_type, token_hash, expires_at)
        VALUES ($1, $2, $3, $4)
      `, [
        (await database.query('SELECT id FROM users WHERE phone = $1', ['+96291234567'])).rows[0].id,
        'REFRESH',
        'valid-refresh-token-hash',
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ]);

      await database.query(`
        INSERT INTO user_sessions (user_id, session_token, expires_at)
        VALUES ($1, $2, $3)
      `, [
        (await database.query('SELECT id FROM users WHERE phone = $1', ['+96291234567'])).rows[0].id,
        'valid-session-token',
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ]);
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .send({
          refreshToken: 'valid-refresh-token'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify refresh token was revoked
      const tokenResult = await database.query(
        'SELECT * FROM auth_tokens WHERE token_hash = $1 AND revoked_at IS NOT NULL',
        ['valid-refresh-token-hash']
      );
      expect(tokenResult.rows).toHaveLength(1);

      // Verify session was deactivated
      const sessionResult = await database.query(
        'SELECT * FROM user_sessions WHERE user_id = $1 AND is_active = false',
        [(await database.query('SELECT id FROM users WHERE phone = $1', ['+96291234567'])).rows[0].id]
      );
      expect(sessionResult.rows).toHaveLength(1);
    });

    it('should logout from all devices', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .send({
          refreshToken: 'valid-refresh-token',
          allDevices: true
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify all sessions were deactivated
      const sessionResult = await database.query(
        'SELECT * FROM user_sessions WHERE user_id = $1 AND is_active = false',
        [(await database.query('SELECT id FROM users WHERE phone = $1', ['+96291234567'])).rows[0].id]
      );
      expect(sessionResult.rows).toHaveLength(1);
    });
  });

  describe('Admin Management Endpoints', () => {
    beforeEach(async () => {
      // Create admin user for admin tests
      await database.query(`
        INSERT INTO users (phone, role, status, phone_verified)
        VALUES ($1, $2, $3, $4)
      `, ['+96291234567', 'ADMIN', 'ACTIVE', true]);
    });

    describe('POST /auth/admin/whitelist', () => {
      it('should add admin to whitelist', async () => {
        // Create access token for admin
        const token = 'valid-admin-token';
        await database.query(`
          INSERT INTO auth_tokens (user_id, token_type, token_hash, expires_at)
          VALUES ($1, $2, $3, $4)
        `, [
          (await database.query('SELECT id FROM users WHERE phone = $1', ['+96291234567'])).rows[0].id,
          'ACCESS',
          'admin-token-hash',
          new Date(Date.now() + 15 * 60 * 1000)
        ]);

        const response = await request(app)
          .post('/auth/admin/whitelist')
          .set('Authorization', `Bearer ${token}`)
          .send({
            phone: '+96299999999',
            name: 'New Admin',
            adminLevel: 'ADMIN',
            department: 'IT'
          });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.adminId).toBeDefined();

        // Verify admin was added to whitelist
        const adminResult = await database.query(
          'SELECT * FROM admin_whitelist WHERE phone = $1',
          ['+96299999999']
        );
        expect(adminResult.rows).toHaveLength(1);
        expect(adminResult.rows[0].name).toBe('New Admin');
      });

      it('should require authentication', async () => {
        const response = await request(app)
          .post('/auth/admin/whitelist')
          .send({
            phone: '+96299999999',
            name: 'New Admin',
            adminLevel: 'ADMIN',
            department: 'IT'
          });

        expect(response.status).toBe(401);
      });

      it('should handle duplicate admin phone', async () => {
        // Create access token for admin
        const token = 'valid-admin-token';
        await database.query(`
          INSERT INTO auth_tokens (user_id, token_type, token_hash, expires_at)
          VALUES ($1, $2, $3, $4)
        `, [
          (await database.query('SELECT id FROM users WHERE phone = $1', ['+96291234567'])).rows[0].id,
          'ACCESS',
          'admin-token-hash',
          new Date(Date.now() + 15 * 60 * 1000)
        ]);

        // Add existing admin
        await database.query(`
          INSERT INTO admin_whitelist (phone, admin_level, name, is_active)
          VALUES ($1, $2, $3, $4)
        `, ['+96299999999', 'ADMIN', 'Existing Admin', true]);

        const response = await request(app)
          .post('/auth/admin/whitelist')
          .set('Authorization', `Bearer ${token}`)
          .send({
            phone: '+96299999999',
            name: 'Duplicate Admin',
            adminLevel: 'ADMIN',
            department: 'IT'
          });

        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /auth/admin/whitelist', () => {
      beforeEach(async () => {
        // Create access token for admin
        const token = 'valid-admin-token';
        await database.query(`
          INSERT INTO auth_tokens (user_id, token_type, token_hash, expires_at)
          VALUES ($1, $2, $3, $4)
        `, [
          (await database.query('SELECT id FROM users WHERE phone = $1', ['+96291234567'])).rows[0].id,
          'ACCESS',
          'admin-token-hash',
          new Date(Date.now() + 15 * 60 * 1000)
        ]);

        // Add sample admins
        await database.query(`
          INSERT INTO admin_whitelist (phone, admin_level, name, department, is_active)
          VALUES 
            ($1, $2, $3, $4, $5),
            ($6, $7, $8, $9, $10),
            ($11, $12, $13, $14, $15)
        `, [
          '+96291234567', 'SUPER_ADMIN', 'Super Admin', 'IT', true,
          '+96292345678', 'ADMIN', 'Admin One', 'Support', true,
          '+962934567890', 'ADMIN', 'Admin Two', 'Sales', true,
        ]);
      });

      it('should get admin whitelist', async () => {
        const response = await request(app)
          .get('/auth/admin/whitelist')
          .set('Authorization', `Bearer valid-admin-token`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.admins).toHaveLength(3);
        expect(response.body.pagination).toBeDefined();
        expect(response.body.pagination.page).toBe(1);
        expect(response.body.pagination.limit).toBe(10);
        expect(response.body.pagination.total).toBe(3);
      });

      it('should paginate results', async () => {
        const response = await request(app)
          .get('/auth/admin/whitelist?page=2&limit=5')
          .set('Authorization', `Bearer valid-admin-token`);

        expect(response.status).toBe(200);
        expect(response.body.admins).toHaveLength(0);
        expect(response.body.pagination.page).toBe(2);
        expect(response.body.pagination.limit).toBe(5);
      });

      it('should require authentication', async () => {
        const response = await request(app)
          .get('/auth/admin/whitelist');

        expect(response.status).toBe(401);
      });
    });

    describe('DELETE /auth/admin/whitelist/:adminId', () => {
      beforeEach(async () => {
        // Create access token for admin
        const token = 'valid-admin-token';
        await database.query(`
          INSERT INTO auth_tokens (user_id, token_type, token_hash, expires_at)
          VALUES ($1, $2, $3, $4)
        `, [
          (await database.query('SELECT id FROM users WHERE phone = $1', ['+96291234567'])).rows[0].id,
          'ACCESS',
          'admin-token-hash',
          new Date(Date.now() + 15 * 60 * 1000)
        ]);

        // Add admin to remove
        await database.query(`
          INSERT INTO admin_whitelist (phone, admin_level, name, department, is_active)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          '+96299999999', 'ADMIN', 'Admin To Remove', 'IT', true
        ]);
      });

      it('should remove admin from whitelist', async () => {
        const adminId = (await database.query(
          'SELECT id FROM admin_whitelist WHERE phone = $1',
          ['+96299999999']
        )).rows[0].id;

        const response = await request(app)
          .delete(`/auth/admin/whitelist/${adminId}`)
          .set('Authorization', `Bearer valid-admin-token`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        // Verify admin was deactivated
        const adminResult = await database.query(
          'SELECT * FROM admin_whitelist WHERE id = $1 AND is_active = false',
          [adminId]
        );
        expect(adminResult.rows).toHaveLength(1);
      });

      it('should require authentication', async () => {
        const response = await request(app)
          .delete('/auth/admin/whitelist/some-admin-id');

        expect(response.status).toBe(401);
      });
    });
  });

  describe('GET /auth/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/auth/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('healthy');
      expect(response.body.services).toBeDefined();
    });
  });
});
