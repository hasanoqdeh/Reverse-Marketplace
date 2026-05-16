'use strict';

const amqplib = require('amqplib');
const config = require('../../config');
const logger = require('../../utils/logger');
const analyticsService = require('./services/analyticsService');

const EXCHANGE = config.rabbitmq.exchange;
const QUEUE    = 'analytics.activity-log';
const RECONNECT_DELAY_MS = 5000;

let connection = null;
let channel    = null;

const subscriber = {
  async connect() {
    const url = config.rabbitmq.url ||
      `amqp://${config.rabbitmq.user}:${config.rabbitmq.password}@${config.rabbitmq.host}:${config.rabbitmq.port}`;

    try {
      connection = await amqplib.connect(url);
      channel    = await connection.createChannel();

      await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
      await channel.assertQueue(QUEUE, { durable: true });
      await channel.bindQueue(QUEUE, EXCHANGE, '#');
      await channel.prefetch(10);

      connection.on('error', (err) => {
        logger.error('Analytics subscriber connection error', { error: err.message });
        this._scheduleReconnect();
      });
      connection.on('close', () => {
        logger.warn('Analytics subscriber disconnected — reconnecting');
        this._scheduleReconnect();
      });

      await channel.consume(QUEUE, async (msg) => {
        if (!msg) return;
        try {
          const event = JSON.parse(msg.content.toString());
          await analyticsService.logFromEvent(event);
          channel.ack(msg);
        } catch (err) {
          logger.error('Analytics subscriber: message processing failed', { error: err.message });
          // Discard — don't requeue to avoid poison-message loops
          channel.nack(msg, false, false);
        }
      });

      logger.info('Analytics subscriber ready', { queue: QUEUE, exchange: EXCHANGE });
    } catch (err) {
      logger.warn('Analytics subscriber: could not connect to RabbitMQ — will retry', { error: err.message });
      this._scheduleReconnect();
    }
  },

  _scheduleReconnect() {
    connection = null;
    channel    = null;
    setTimeout(() => this.connect().catch(() => {}), RECONNECT_DELAY_MS);
  },

  async disconnect() {
    try {
      if (channel)    await channel.close();
      if (connection) await connection.close();
      logger.info('Analytics subscriber disconnected');
    } catch {}
  },
};

module.exports = subscriber;
