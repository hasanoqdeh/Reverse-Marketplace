'use strict';

const amqplib = require('amqplib');
const config = require('../../config');
const logger = require('../../utils/logger');
const notificationService = require('./services/notificationService');

const EXCHANGE = config.rabbitmq.exchange;
const QUEUE = 'notifications.events';
const RECONNECT_DELAY_MS = 5000;

let connection = null;
let channel = null;
let _io = null;

// ─── Event handlers ───────────────────────────────────────────────────────────
// Note: message, bid, and fulfillment notifications are sent directly from
// chatSocket.js and bidController.js — no RabbitMQ dependency needed.

async function handleReviewCreated({ data }) {
  const { revieweeId, bidId, rating } = data;
  const bid = await getBidWithRequest(bidId).catch(() => null);

  await notificationService.send(_io, {
    userId: revieweeId,
    type: 'BUYER_REVIEW',
    title: 'You received a review',
    body: `A buyer left you a ${rating}-star review.`,
    data: { bidId, requestId: bid?.request?.id ?? null },
  });
}

// ─── Routing ──────────────────────────────────────────────────────────────────

const HANDLERS = {
  'review.created': handleReviewCreated,
};

const BINDING_KEYS = Object.keys(HANDLERS);

// ─── Subscriber ───────────────────────────────────────────────────────────────

const consumer = {
  async connect(io) {
    _io = io;
    const url = config.rabbitmq.url ||
      `amqp://${config.rabbitmq.user}:${config.rabbitmq.password}@${config.rabbitmq.host}:${config.rabbitmq.port}`;

    try {
      connection = await amqplib.connect(url);
      channel = await connection.createChannel();

      await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
      await channel.assertQueue(QUEUE, { durable: true });

      for (const key of BINDING_KEYS) {
        await channel.bindQueue(QUEUE, EXCHANGE, key);
      }

      await channel.prefetch(10);

      connection.on('error', () => { this._scheduleReconnect(io); });
      connection.on('close', () => { this._scheduleReconnect(io); });

      await channel.consume(QUEUE, async (msg) => {
        if (!msg) return;
        try {
          const event = JSON.parse(msg.content.toString());
          const handler = HANDLERS[event.eventType];
          if (handler) await handler(event);
          channel.ack(msg);
        } catch (err) {
          logger.error('Notification consumer: processing failed', { error: err.message });
          channel.nack(msg, false, false);
        }
      });

      logger.info('Notification consumer ready', { queue: QUEUE });
    } catch (err) {
      logger.warn('Notification consumer: could not connect — will retry', { error: err.message });
      this._scheduleReconnect(io);
    }
  },

  _scheduleReconnect(io) {
    connection = null;
    channel = null;
    setTimeout(() => this.connect(io).catch(() => {}), RECONNECT_DELAY_MS);
  },

  async disconnect() {
    try {
      if (channel) await channel.close();
      if (connection) await connection.close();
    } catch {}
  },
};

module.exports = consumer;
