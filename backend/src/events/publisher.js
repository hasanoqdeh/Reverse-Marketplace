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
      source: 'reverse-marketplace',
      data,
      metadata: {
        correlationId: meta.correlationId || uuidv4(),
        userId: meta.userId || data.userId || data.buyerId || null,
        requestId: meta.requestId || data.requestId || null,
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

  // ─── Identity convenience publishers ──────────────────────────

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

  // ─── Request convenience publishers ───────────────────────────

  async requestCreated(requestId, buyerId, categoryId, title, publishedAt, expiresAt) {
    return this.publish('request.created', {
      requestId, buyerId, categoryId, title, publishedAt, expiresAt,
    }, { userId: buyerId, requestId });
  },

  async requestUpdated(requestId, buyerId, oldStatus, newStatus, updatedBy) {
    return this.publish('request.updated', {
      requestId, buyerId, oldStatus, newStatus,
      updatedAt: new Date().toISOString(), updatedBy,
    }, { userId: buyerId, requestId });
  },

  async requestClosed(requestId, buyerId, reason, closedBy) {
    return this.publish('request.closed', {
      requestId, buyerId, closedAt: new Date().toISOString(), closedBy, reason,
    }, { userId: buyerId, requestId });
  },

  async requestCancelled(requestId, buyerId, reason) {
    return this.publish('request.cancelled', {
      requestId, buyerId, cancelledAt: new Date().toISOString(), reason,
    }, { userId: buyerId, requestId });
  },

  async requestCompleted(requestId, buyerId, acceptedBidId, merchantId, finalAmount) {
    return this.publish('request.completed', {
      requestId, buyerId, acceptedBidId, merchantId,
      completedAt: new Date().toISOString(), finalAmount,
    }, { userId: buyerId, requestId });
  },

  async requestExpired(requestId, buyerId) {
    return this.publish('request.expired', {
      requestId, buyerId, expiredAt: new Date().toISOString(),
    }, { userId: buyerId, requestId });
  },

  async requestExtended(requestId, buyerId, originalExpiresAt, newExpiresAt, reason) {
    return this.publish('request.extended', {
      requestId, buyerId,
      originalExpiresAt: originalExpiresAt instanceof Date ? originalExpiresAt.toISOString() : originalExpiresAt,
      newExpiresAt: newExpiresAt instanceof Date ? newExpiresAt.toISOString() : newExpiresAt,
      reason: reason || null,
      extendedAt: new Date().toISOString(),
    }, { userId: buyerId, requestId });
  },

  async requestViewed(requestId, userId, ipAddress) {
    return this.publish('request.viewed', {
      requestId, userId: userId || null, ipAddress: ipAddress || null,
      viewedAt: new Date().toISOString(),
    }, { requestId });
  },

  // ─── Bidding convenience publishers ──────────────────────────

  async bidSubmitted(bidId, requestId, merchantId, amount, deliveryDays, expiresAt) {
    return this.publish('bid.submitted', {
      bidId, requestId, merchantId, amount, deliveryDays,
      submittedAt: new Date().toISOString(),
      expiresAt: expiresAt instanceof Date ? expiresAt.toISOString() : expiresAt,
    }, { userId: merchantId, requestId, bidId });
  },

  async bidAccepted(bidId, requestId, merchantId, buyerId, amount) {
    return this.publish('bid.accepted', {
      bidId, requestId, merchantId, buyerId, amount,
      acceptedAt: new Date().toISOString(),
    }, { userId: buyerId, requestId, bidId });
  },

  async bidRejected(bidId, requestId, merchantId, buyerId) {
    return this.publish('bid.rejected', {
      bidId, requestId, merchantId, buyerId,
      rejectedAt: new Date().toISOString(),
    }, { userId: buyerId, requestId, bidId });
  },

  async bidWithdrawn(bidId, requestId, merchantId) {
    return this.publish('bid.withdrawn', {
      bidId, requestId, merchantId,
      withdrawnAt: new Date().toISOString(),
    }, { userId: merchantId, requestId, bidId });
  },

  async bidExpired(bidId, requestId, merchantId) {
    return this.publish('bid.expired', {
      bidId, requestId, merchantId,
      expiredAt: new Date().toISOString(),
    }, { userId: merchantId, requestId, bidId });
  },

  // ─── Chat convenience publishers ─────────────────────────────

  async messageSent(messageId, roomId, senderId, messageType, sentAt) {
    return this.publish('message.sent', {
      messageId, roomId, senderId, messageType,
      sentAt: sentAt instanceof Date ? sentAt.toISOString() : sentAt,
    }, { userId: senderId });
  },

  async messageRead(messageId, roomId, readerId) {
    return this.publish('message.read', {
      messageId, roomId, readerId, readAt: new Date().toISOString(),
    }, { userId: readerId });
  },

  // ─── Notification convenience publishers ─────────────────────

  async notificationSent(notificationId, userId, type, channel, title, sentAt) {
    return this.publish('notification.sent', {
      notificationId, userId, type, channel, title,
      sentAt: sentAt instanceof Date ? sentAt.toISOString() : sentAt,
    }, { userId });
  },

  async notificationDelivered(notificationId, userId, channel, provider, deliveredAt) {
    return this.publish('notification.delivered', {
      notificationId, userId, channel, provider,
      deliveredAt: deliveredAt instanceof Date ? deliveredAt.toISOString() : deliveredAt,
    }, { userId });
  },

  // ─── Fulfillment convenience publishers ──────────────────────

  async bidFulfillmentUpdated(bidId, merchantId, oldStatus, newStatus) {
    return this.publish('bid.fulfillment.updated', {
      bidId, merchantId, oldStatus, newStatus,
      updatedAt: new Date().toISOString(),
    }, { userId: merchantId });
  },

  async bidDeliveryConfirmed(bidId, buyerId, merchantId) {
    return this.publish('bid.delivery.confirmed', {
      bidId, buyerId, merchantId,
      confirmedAt: new Date().toISOString(),
    }, { userId: buyerId });
  },

  // ─── Review convenience publishers ───────────────────────────

  async reviewCreated(reviewId, bidId, reviewerId, revieweeId, rating, type) {
    return this.publish('review.created', {
      reviewId, bidId, reviewerId, revieweeId, rating, type,
      createdAt: new Date().toISOString(),
    }, { userId: reviewerId });
  },

  // ─── Admin convenience publishers ────────────────────────────

  async adminActionPerformed(adminId, actionType, targetId, targetType, details = {}) {
    return this.publish('admin.action', {
      adminId, actionType, targetId, targetType, details,
      performedAt: new Date().toISOString(),
    }, { userId: adminId });
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
