const Redis = require('redis');
const config = require('../config');
const logger = require('../utils/logger');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // In Docker environment, use host/port instead of URL to avoid localhost conflicts
      let clientConfig;
      const useDockerConfig = config.env === 'development' && process.env.REDIS_HOST === 'redis';
      logger.info('Redis connection config:', {
        env: config.env,
        redisHost: process.env.REDIS_HOST,
        useDockerConfig,
        configHost: config.redis.host,
        configUrl: config.redis.url
      });
      
      if (useDockerConfig) {
        clientConfig = {
          socket: {
            host: config.redis.host,
            port: config.redis.port,
            family: 4, // Force IPv4
            connectTimeout: 5000,
          },
          password: config.redis.password,
          database: config.redis.db,
          retryDelayOnFailover: config.redis.retryDelayOnFailover,
          maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
        };
        logger.info('Using Docker Redis config:', clientConfig);
      } else {
        clientConfig = {
          url: config.redis.url,
          password: config.redis.password,
          database: config.redis.db,
          retryDelayOnFailover: config.redis.retryDelayOnFailover,
          maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
        };
        logger.info('Using URL Redis config:', clientConfig);
      }

      this.client = Redis.createClient(clientConfig);

      // Event handlers
      this.client.on('connect', () => {
        logger.info('Redis client connecting');
      });

      this.client.on('ready', () => {
        this.isConnected = true;
        logger.info('Redis client connected and ready');
      });

      this.client.on('error', (err) => {
        logger.error('Redis client error:', err);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        logger.info('Redis client disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis client disconnected');
    }
  }

  // Basic Redis operations
  async set(key, value, ttlInSeconds) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (ttlInSeconds) {
        await this.client.setEx(key, ttlInSeconds, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }
      
      return true;
    } catch (error) {
      logger.error('Redis SET operation failed:', error);
      throw error;
    }
  }

  async get(key, parseJson = true) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const value = await this.client.get(key);
      
      if (value === null) {
        return null;
      }

      return parseJson ? JSON.parse(value) : value;
    } catch (error) {
      logger.error('Redis GET operation failed:', error);
      throw error;
    }
  }

  async del(key) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL operation failed:', error);
      throw error;
    }
  }

  async exists(key) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS operation failed:', error);
      throw error;
    }
  }

  async expire(key, ttlInSeconds) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      await this.client.expire(key, ttlInSeconds);
      return true;
    } catch (error) {
      logger.error('Redis EXPIRE operation failed:', error);
      throw error;
    }
  }

  async ttl(key) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error('Redis TTL operation failed:', error);
      throw error;
    }
  }

  // Rate limiting helpers
  async incrementRateLimit(key, windowMs, maxRequests) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const ttl = Math.ceil(windowMs / 1000); // Convert to seconds
      const current = await this.client.incr(key);
      
      if (current === 1) {
        await this.client.expire(key, ttl);
      }

      const remainingTtl = await this.client.ttl(key);
      
      return {
        current,
        remaining: Math.max(0, maxRequests - current),
        resetTime: Date.now() + (remainingTtl * 1000),
        isExceeded: current > maxRequests,
      };
    } catch (error) {
      logger.error('Rate limiting operation failed:', error);
      throw error;
    }
  }

  // Session management helpers
  async setSession(sessionKey, sessionData, ttlInSeconds) {
    return this.set(sessionKey, sessionData, ttlInSeconds);
  }

  async getSession(sessionKey) {
    return this.get(sessionKey);
  }

  async deleteSession(sessionKey) {
    return this.del(sessionKey);
  }

  // OTP cache helpers
  async setOtpCache(phone, otpData, ttlInSeconds) {
    const key = `otp:${phone}`;
    return this.set(key, otpData, ttlInSeconds);
  }

  async getOtpCache(phone) {
    const key = `otp:${phone}`;
    return this.get(key);
  }

  async deleteOtpCache(phone) {
    const key = `otp:${phone}`;
    return this.del(key);
  }

  // User cache helpers
  async setUserCache(userId, userData, ttlInSeconds = 3600) {
    const key = `user:${userId}`;
    return this.set(key, userData, ttlInSeconds);
  }

  async getUserCache(userId) {
    const key = `user:${userId}`;
    return this.get(key);
  }

  async deleteUserCache(userId) {
    const key = `user:${userId}`;
    return this.del(key);
  }

  // Device fingerprinting helpers
  async setDeviceFingerprint(userId, deviceFingerprint, deviceData, ttlInSeconds = 86400 * 30) {
    const key = `device:${userId}:${deviceFingerprint}`;
    return this.set(key, deviceData, ttlInSeconds);
  }

  async getDeviceFingerprint(userId, deviceFingerprint) {
    const key = `device:${userId}:${deviceFingerprint}`;
    return this.get(key);
  }

  async deleteDeviceFingerprint(userId, deviceFingerprint) {
    const key = `device:${userId}:${deviceFingerprint}`;
    return this.del(key);

  }

  // Health check
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: 'Redis not connected',
        };
      }

      await this.client.ping();
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        info: await this.client.info(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  // Cleanup expired keys
  async cleanupExpiredKeys(pattern = '*') {
    try {
      const keys = await this.client.keys(pattern);
      let deletedCount = 0;

      for (const key of keys) {
        const ttl = await this.client.ttl(key);
        if (ttl === -1) { // No expiry set, could be stale
          // Add logic to identify and clean up stale keys
          // For now, we'll just log them
          logger.debug('Found key without TTL:', key);
        } else if (ttl === -2) { // Key does not exist
          deletedCount++;
        }
      }

      logger.info(`Cleaned up ${deletedCount} expired keys`);
      return deletedCount;
    } catch (error) {
      logger.error('Cleanup failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const redisClient = new RedisClient();

module.exports = redisClient;
