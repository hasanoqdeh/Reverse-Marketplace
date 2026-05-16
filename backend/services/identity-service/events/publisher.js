'use strict';

const amqplib = require('amqplib');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const logger = require('../utils/logger');

let connection = null;
let channel = null;
let isConnected = false;

const EXCHANGE = config.rabbitmq.exchange;
const RECONNECT_DELAY_MS = 5000;

const publisher = {
  /**
   * Connect to RabbitMQ and set up the topic exchange.
   */
  async connect() {
    const url =
      config.rabbitmq.url ||
      `amqp://${config.rabbitmq.user}:${config.rabbitmq.password}@${config.rabbitmq.host}:${config.rabbitmq.port}`;

    try {
      connection = await amqplib.connect(url);
      channel = await connection.createChannel();

      await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

      isConnected = true;
      logger.info('RabbitMQ connected', { exchange: EXCHANGE });

      connection.on('error', (err) => {
        logger.error('RabbitMQ connection error', { error: err.message });
        isConnected = false;
        this._scheduleReconnect();
      });

      connection.on('close', () => {
        logger.warn('RabbitMQ connection closed — scheduling reconnect');
        isConnected = false;
        this._scheduleReconnect();
      });
    } catch (err) {
      logger.warn('RabbitMQ unavailable — events will be skipped', { error: err.message });
      isConnected = false;
    }
  },

  _scheduleReconnect() {
    setTimeout(() => {
      logger.info('Attempting RabbitMQ reconnect...');
      this.connect().catch(() => {});
    }, RECONNECT_DELAY_MS);
  },

  /**
   * Publish an event to the topic exchange.
   * @param {string} routingKey  e.g. 'user.registered'
   * @param {object} data        Event payload data
   * @param {object} [meta]      Optional metadata overrides
   */
  async publish(routingKey, data, meta = {}) {
    if (!isConnected || !channel) {
      logger.warn('RabbitMQ not connected — skipping event publish', { routingKey });
      return false;
    }

    const event = {
      eventId: uuidv4(),
      eventType: routingKey,
      timestamp: new Date().toISOString(),
      version: '1.0',
      source: 'identity-service',
      data,
      metadata: {
        correlationId: meta.correlationId || uuidv4(),
        userId: meta.userId || data.userId || null,
      },
    };

    try {
      channel.publish(
        EXCHANGE,
        routingKey,
        Buffer.from(JSON.stringify(event)),
        { persistent: true, contentType: 'application/json' }
      );

      logger.debug('Event published', { routingKey, eventId: event.eventId });
      return true;
    } catch (err) {
      logger.error('Failed to publish event', { routingKey, error: err.message });
      return false;
    }
  },

  // ─── Convenience publishers ────────────────────────────────────

  async userRegistered(userId, phone, role) {
    return this.publish('user.registered', {
      userId, phone, role, registeredAt: new Date().toISOString(),
    }, { userId });
  },

  async userLoggedIn(userId, phone, role) {
    return this.publish('user.logined', {
      userId, phone, role, loginAt: new Date().toISOString(),
    }, { userId });
  },

  async userVerified(userId, phone, role) {
    return this.publish('user.verified', {
      userId, phone, role, verifiedAt: new Date().toISOString(),
    }, { userId });
  },

  async otpRequested(userId, phone, code, purpose, expiresAt) {
    return this.publish('notification.otp.requested', {
      userId,
      phone,
      code,
      purpose,
      expiresAt: expiresAt instanceof Date ? expiresAt.toISOString() : expiresAt,
      expiryMinutes: Math.round((new Date(expiresAt) - Date.now()) / 60000),
    }, { userId });
  },

  async userUpdated(userId, phone, role, bannedBy, reason) {
    return this.publish('user.update', {
      userId, phone, role,
      bannedAt: new Date().toISOString(),
      bannedBy, reason,
    }, { userId });
  },

  // ─── Lifecycle ────────────────────────────────────────────────

  async disconnect() {
    try {
      if (channel) await channel.close();
      if (connection) await connection.close();
      isConnected = false;
      logger.info('RabbitMQ disconnected');
    } catch (err) {
      logger.error('Error closing RabbitMQ', { error: err.message });
    }
  },
};

module.exports = publisher;
