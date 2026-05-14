const amqp = require('amqplib');
const config = require('../config');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class EventPublisher {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.connection = await amqp.connect({
        hostname: config.rabbitmq.host,
        port: config.rabbitmq.port,
        username: config.rabbitmq.user,
        password: config.rabbitmq.password,
      });

      this.channel = await this.connection.createChannel();

      // Assert exchanges
      await this.channel.assertExchange(config.rabbitmq.exchanges.auth, 'topic', { durable: true });
      await this.channel.assertExchange(config.rabbitmq.exchanges.user, 'topic', { durable: true });
      await this.channel.assertExchange(config.rabbitmq.exchanges.notification, 'topic', { durable: true });

      // Assert queues
      await this.channel.assertQueue(config.rabbitmq.queues.authEvents, { durable: true });
      await this.channel.assertQueue(config.rabbitmq.queues.userEvents, { durable: true });
      await this.channel.assertQueue(config.rabbitmq.queues.notificationEvents, { durable: true });

      // Bind queues to exchanges
      await this.channel.bindQueue(config.rabbitmq.queues.authEvents, config.rabbitmq.exchanges.auth, 'auth.*');
      await this.channel.bindQueue(config.rabbitmq.queues.userEvents, config.rabbitmq.exchanges.user, 'user.*');
      await this.channel.bindQueue(config.rabbitmq.queues.notificationEvents, config.rabbitmq.exchanges.notification, 'notification.*');

      this.isConnected = true;
      logger.info('RabbitMQ event publisher connected successfully');

      // Handle connection errors
      this.connection.on('error', (err) => {
        logger.error('RabbitMQ connection error:', err);
        this.isConnected = false;
      });

      this.connection.on('close', () => {
        logger.info('RabbitMQ connection closed');
        this.isConnected = false;
      });

      return this.channel;
    } catch (error) {
      logger.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    this.isConnected = false;
    logger.info('RabbitMQ event publisher disconnected');
  }

  createBaseEvent(eventType, data, metadata = {}) {
    return {
      eventId: uuidv4(),
      eventType,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      source: 'identity-service',
      data,
      metadata: {
        correlationId: uuidv4(),
        ...metadata,
      },
    };
  }

  async publish(exchange, routingKey, event) {
    if (!this.isConnected) {
      throw new Error('RabbitMQ not connected');
    }

    try {
      const message = Buffer.from(JSON.stringify(event));
      const published = this.channel.publish(exchange, routingKey, message, {
        persistent: true,
        messageId: event.eventId,
        timestamp: Date.now(),
        contentType: 'application/json',
      });

      if (published) {
        logger.debug(`Event published: ${event.eventType}`, { eventId: event.eventId, routingKey });
        return true;
      } else {
        logger.warn(`Failed to publish event: ${event.eventType}`);
        return false;
      }
    } catch (error) {
      logger.error(`Failed to publish event ${event.eventType}:`, error);
      throw error;
    }
  }

  // User Events
  async publishUserRegistered(userId, phone, role, registeredAt) {
    const event = this.createBaseEvent('user.registered', {
      userId,
      phone,
      role,
      registeredAt,
    });

    await this.publish(config.rabbitmq.exchanges.user, 'user.registered', event);
    await this.publish(config.rabbitmq.exchanges.notification, 'notification.user.registered', event);
    
    return event;
  }

  async publishUserVerified(userId, phone, role, verifiedAt) {
    const event = this.createBaseEvent('user.verified', {
      userId,
      phone,
      role,
      verifiedAt,
    });

    await this.publish(config.rabbitmq.exchanges.user, 'user.verified', event);
    await this.publish(config.rabbitmq.exchanges.notification, 'notification.user.verified', event);
    
    return event;
  }

  async publishUserBanned(userId, phone, role, bannedAt, bannedBy, reason) {
    const event = this.createBaseEvent('user.banned', {
      userId,
      phone,
      role,
      bannedAt,
      bannedBy,
      reason,
    });

    await this.publish(config.rabbitmq.exchanges.user, 'user.banned', event);
    await this.publish(config.rabbitmq.exchanges.notification, 'notification.user.banned', event);
    await this.publish(config.rabbitmq.exchanges.auth, 'auth.user.banned', event);
    
    return event;
  }

  async publishUserProfileUpdated(userId, phone, role, updatedFields, updatedAt) {
    const event = this.createBaseEvent('user.profile.updated', {
      userId,
      phone,
      role,
      updatedFields,
      updatedAt,
    });

    await this.publish(config.rabbitmq.exchanges.user, 'user.profile.updated', event);
    
    return event;
  }

  // Merchant Events
  async publishMerchantVerified(userId, phone, businessName, verifiedAt, verifiedBy) {
    const event = this.createBaseEvent('merchant.verified', {
      userId,
      phone,
      businessName,
      verifiedAt,
      verifiedBy,
    });

    await this.publish(config.rabbitmq.exchanges.user, 'merchant.verified', event);
    await this.publish(config.rabbitmq.exchanges.notification, 'notification.merchant.verified', event);
    
    return event;
  }

  // Authentication Events
  async publishLoginAttempt(userId, phone, ipAddress, userAgent, deviceFingerprint, success, failureReason = null) {
    const event = this.createBaseEvent('auth.login.attempt', {
      userId,
      phone,
      ipAddress,
      userAgent,
      deviceFingerprint,
      success,
      failureReason,
      timestamp: new Date().toISOString(),
    });

    await this.publish(config.rabbitmq.exchanges.auth, 'auth.login.attempt', event);
    
    return event;
  }

  async publishLoginSuccess(userId, phone, role, sessionId, ipAddress, userAgent, deviceFingerprint) {
    const event = this.createBaseEvent('auth.login.success', {
      userId,
      phone,
      role,
      sessionId,
      ipAddress,
      userAgent,
      deviceFingerprint,
      loginAt: new Date().toISOString(),
    });

    await this.publish(config.rabbitmq.exchanges.auth, 'auth.login.success', event);
    await this.publish(config.rabbitmq.exchanges.user, 'user.login.success', event);
    
    return event;
  }

  async publishLoginFailure(userId, phone, failureReason, ipAddress, userAgent, deviceFingerprint) {
    const event = this.createBaseEvent('auth.login.failure', {
      userId,
      phone,
      failureReason,
      ipAddress,
      userAgent,
      deviceFingerprint,
      failedAt: new Date().toISOString(),
    });

    await this.publish(config.rabbitmq.exchanges.auth, 'auth.login.failure', event);
    
    return event;
  }

  async publishLogout(userId, phone, sessionId, ipAddress, userAgent, allDevices = false) {
    const event = this.createBaseEvent('auth.logout', {
      userId,
      phone,
      sessionId,
      ipAddress,
      userAgent,
      allDevices,
      loggedOutAt: new Date().toISOString(),
    });

    await this.publish(config.rabbitmq.exchanges.auth, 'auth.logout', event);
    
    return event;
  }

  async publishTokenRefresh(userId, phone, oldTokenId, newTokenId, ipAddress, userAgent) {
    const event = this.createBaseEvent('auth.token.refresh', {
      userId,
      phone,
      oldTokenId,
      newTokenId,
      ipAddress,
      userAgent,
      refreshedAt: new Date().toISOString(),
    });

    await this.publish(config.rabbitmq.exchanges.auth, 'auth.token.refresh', event);
    
    return event;
  }

  async publishAccountLocked(userId, phone, lockoutDuration, lockoutReason, ipAddress, userAgent) {
    const event = this.createBaseEvent('auth.account.locked', {
      userId,
      phone,
      lockoutDuration,
      lockoutReason,
      ipAddress,
      userAgent,
      lockedAt: new Date().toISOString(),
    });

    await this.publish(config.rabbitmq.exchanges.auth, 'auth.account.locked', event);
    await this.publish(config.rabbitmq.exchanges.notification, 'notification.account.locked', event);
    
    return event;
  }

  async publishAccountUnlocked(userId, phone, unlockedBy, ipAddress, userAgent) {
    const event = this.createBaseEvent('auth.account.unlocked', {
      userId,
      phone,
      unlockedBy,
      ipAddress,
      userAgent,
      unlockedAt: new Date().toISOString(),
    });

    await this.publish(config.rabbitmq.exchanges.auth, 'auth.account.unlocked', event);
    
    return event;
  }

  // OTP Events
  async publishOtpSent(phone, purpose, ipAddress, userAgent, expiresAt) {
    const event = this.createBaseEvent('auth.otp.sent', {
      phone,
      purpose,
      ipAddress,
      userAgent,
      expiresAt,
      sentAt: new Date().toISOString(),
    });

    await this.publish(config.rabbitmq.exchanges.auth, 'auth.otp.sent', event);
    
    return event;
  }

  async publishOtpVerified(phone, purpose, success, failureReason = null, ipAddress, userAgent) {
    const event = this.createBaseEvent('auth.otp.verified', {
      phone,
      purpose,
      success,
      failureReason,
      ipAddress,
      userAgent,
      verifiedAt: new Date().toISOString(),
    });

    await this.publish(config.rabbitmq.exchanges.auth, 'auth.otp.verified', event);
    
    return event;
  }

  // Admin Events
  async publishAdminLoginSuccess(userId, phone, adminLevel, sessionId, ipAddress, userAgent) {
    const event = this.createBaseEvent('auth.admin.login.success', {
      userId,
      phone,
      adminLevel,
      sessionId,
      ipAddress,
      userAgent,
      loginAt: new Date().toISOString(),
    });

    await this.publish(config.rabbitmq.exchanges.auth, 'auth.admin.login.success', event);
    
    return event;
  }

  async publishAdminVerificationSuccess(userId, phone, adminLevel, verifiedAt) {
    const event = this.createBaseEvent('auth.admin.verification.success', {
      userId,
      phone,
      adminLevel,
      verifiedAt,
    });

    await this.publish(config.rabbitmq.exchanges.auth, 'auth.admin.verification.success', event);
    
    return event;
  }

  async publishAdminVerificationFailure(userId, phone, failureReason, verifiedAt) {
    const event = this.createBaseEvent('auth.admin.verification.failure', {
      userId,
      phone,
      failureReason,
      verifiedAt,
    });

    await this.publish(config.rabbitmq.exchanges.auth, 'auth.admin.verification.failure', event);
    
    return event;
  }

  // Health check
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: 'RabbitMQ not connected',
        };
      }

      // Check if channel is still open
      if (this.channel && this.connection) {
        return {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          connection: {
            host: config.rabbitmq.host,
            port: config.rabbitmq.port,
          },
        };
      }

      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Channel or connection is null',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
}

// Create singleton instance
const eventPublisher = new EventPublisher();

module.exports = eventPublisher;
