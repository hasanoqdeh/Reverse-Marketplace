'use strict';

const { createClient } = require('redis');
const config = require('../config');
const logger = require('../utils/logger');

let client = null;
let isConnected = false;

const redisClient = {
  /**
   * Connect to Redis.
   */
  async connect() {
    const redisConfig = config.redis.url
      ? { url: config.redis.url }
      : {
          socket: { host: config.redis.host, port: config.redis.port },
          ...(config.redis.password ? { password: config.redis.password } : {}),
        };

    client = createClient(redisConfig);

    client.on('error', (err) => {
      logger.error('Redis client error', { error: err.message });
      isConnected = false;
    });

    client.on('connect', () => {
      logger.info('Redis connected', { host: config.redis.host, port: config.redis.port });
      isConnected = true;
    });

    client.on('reconnecting', () => {
      logger.warn('Redis reconnecting...');
    });

    await client.connect();
    isConnected = true;
  },

  /**
   * Graceful disconnect.
   */
  async disconnect() {
    if (client && isConnected) {
      await client.quit();
      isConnected = false;
      logger.info('Redis disconnected');
    }
  },

  /**
   * Returns true if the client is connected and usable.
   */
  isReady() {
    return client && isConnected;
  },

  // ─── Core primitives ──────────────────────────────────────────

  async get(key) {
    if (!this.isReady()) return null;
    return client.get(key);
  },

  async set(key, value, ttlSeconds = null) {
    if (!this.isReady()) return;
    const options = ttlSeconds ? { EX: ttlSeconds } : {};
    return client.set(key, value, options);
  },

  async del(key) {
    if (!this.isReady()) return;
    return client.del(key);
  },

  async exists(key) {
    if (!this.isReady()) return false;
    return (await client.exists(key)) === 1;
  },

  async ttl(key) {
    if (!this.isReady()) return -1;
    return client.ttl(key);
  },

  async incr(key) {
    if (!this.isReady()) return null;
    return client.incr(key);
  },

  async expire(key, seconds) {
    if (!this.isReady()) return;
    return client.expire(key, seconds);
  },

  // ─── JSON helpers ─────────────────────────────────────────────

  async getJSON(key) {
    const raw = await this.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async setJSON(key, value, ttlSeconds = null) {
    return this.set(key, JSON.stringify(value), ttlSeconds);
  },

  // ─── Rate-limiting helpers ────────────────────────────────────

  /**
   * Increment a counter key. Returns the new count.
   * Sets expiry on the first increment.
   */
  async incrementRateLimit(key, windowSeconds) {
    if (!this.isReady()) return 0;
    const count = await this.incr(key);
    if (count === 1) {
      await this.expire(key, windowSeconds);
    }
    return count;
  },

  // ─── Session cache helpers ────────────────────────────────────

  async cacheUser(userId, userData, ttlSeconds = config.redis.ttl.userCache) {
    return this.setJSON(`user:${userId}`, userData, ttlSeconds);
  },

  async getCachedUser(userId) {
    return this.getJSON(`user:${userId}`);
  },

  async invalidateUser(userId) {
    return this.del(`user:${userId}`);
  },

  async setSession(sessionToken, data, ttlSeconds = config.redis.ttl.session) {
    return this.setJSON(`session:${sessionToken}`, data, ttlSeconds);
  },

  async getSession(sessionToken) {
    return this.getJSON(`session:${sessionToken}`);
  },

  async deleteSession(sessionToken) {
    return this.del(`session:${sessionToken}`);
  },
};

module.exports = redisClient;
