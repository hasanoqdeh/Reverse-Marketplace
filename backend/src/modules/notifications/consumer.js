'use strict';

const amqplib = require('amqplib');
const config = require('../../config');
const logger = require('../../utils/logger');
const prisma = require('../../prisma/client');
const notificationService = require('./services/notificationService');

const EXCHANGE = config.rabbitmq.exchange;
const QUEUE = 'notifications.events';
const RECONNECT_DELAY_MS = 5000;

let connection = null;
let channel = null;
let _io = null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getBidWithRequest(bidId) {
  return prisma.bid.findUnique({
    where: { id: bidId },
    include: { request: { select: { id: true, title: true, buyerId: true } } },
  });
}

async function getRoomBid(roomId) {
  const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
  if (!room?.relatedBidId) return null;
  return getBidWithRequest(room.relatedBidId);
}

// ─── Event handlers ───────────────────────────────────────────────────────────

async function handleMessageSent({ data }) {
  const { roomId, senderId } = data;
  const bid = await getRoomBid(roomId);
  if (!bid) return;

  const recipientId = bid.merchantId === senderId ? bid.request.buyerId : bid.merchantId;

  await notificationService.send(_io, {
    userId: recipientId,
    type: 'NEW_MESSAGE',
    title: 'New message',
    body: 'You have a new message',
    data: { chatRoomId: roomId, roomName: bid.request.title },
  });
}

async function handleBidSubmitted({ data }) {
  const { bidId, requestId, amount } = data;
  const bid = await getBidWithRequest(bidId);
  if (!bid?.request) return;

  await notificationService.send(_io, {
    userId: bid.request.buyerId,
    type: 'BID_PLACED',
    title: 'New bid on your request',
    body: `You received a bid of ${amount} on "${bid.request.title}"`,
    data: { bidId, requestId, requestTitle: bid.request.title },
  });
}

async function handleFulfillmentUpdated({ data }) {
  const { bidId, newStatus } = data;
  if (newStatus !== 'IN_DELIVERY') return;

  const bid = await getBidWithRequest(bidId);
  if (!bid?.request) return;

  await notificationService.send(_io, {
    userId: bid.request.buyerId,
    type: 'STATUS_IN_DELIVERY',
    title: 'Your order is on the way',
    body: `Your request "${bid.request.title}" is now in delivery. You can leave a review.`,
    data: { bidId, requestId: bid.request.id, merchantId: bid.merchantId },
  });
}

async function handleBidAccepted({ data }) {
  const { bidId, requestId, merchantId, amount } = data;
  const bid = await getBidWithRequest(bidId);
  const title = bid?.request?.title || 'your bid';

  await notificationService.send(_io, {
    userId: merchantId,
    type: 'BID_ACCEPTED',
    title: 'Your bid was accepted!',
    body: `Your bid of ${amount} on "${title}" was accepted.`,
    data: { bidId, requestId },
  });
}

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
  'message.sent':           handleMessageSent,
  'bid.submitted':          handleBidSubmitted,
  'bid.fulfillment.updated': handleFulfillmentUpdated,
  'bid.accepted':           handleBidAccepted,
  'review.created':         handleReviewCreated,
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
