'use strict';

const jwt = require('jsonwebtoken');
const ChatRoomRepository = require('../repositories/ChatRoomRepository');
const ChatMessageRepository = require('../repositories/ChatMessageRepository');
// Messages persisted to MongoDB; rooms/participants in PostgreSQL
const logger = require('../../../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret-change-in-production';

// Track typing users: roomId -> Set of userIds
const typingUsers = new Map();

function initChatSocket(io) {
  // Authenticate socket connections via token in handshake
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = {
        id: decoded.userId || decoded.sub || decoded.id,
        phone: decoded.phone,
        role: decoded.role,
      };
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', socket => {
    const userId = socket.user.id;
    logger.debug('Socket connected', { userId, socketId: socket.id });

    // Auto-join personal room for real-time notifications
    socket.join(`user:${userId}`);

    // ─── Join a chat room ──────────────────────────────────────
    socket.on('join_room', async ({ roomId }) => {
      try {
        const isParticipant = await ChatRoomRepository.isParticipant(roomId, userId);
        if (!isParticipant) {
          socket.emit('error', { message: 'Not a participant in this room' });
          return;
        }
        socket.join(`room:${roomId}`);
        socket.to(`room:${roomId}`).emit('user_joined', { roomId, userId, timestamp: new Date() });
        logger.debug('User joined room', { userId, roomId });
      } catch (err) {
        logger.error('join_room error', { userId, roomId, error: err.message });
      }
    });

    // ─── Leave a chat room ─────────────────────────────────────
    socket.on('leave_room', ({ roomId }) => {
      socket.leave(`room:${roomId}`);
      socket.to(`room:${roomId}`).emit('user_left', { roomId, userId, timestamp: new Date() });
      _clearTyping(io, roomId, userId);
    });

    // ─── Send message via socket ───────────────────────────────
    socket.on('send_message', async ({ roomId, content, type = 'TEXT', replyToId, mediaUrls = [] }) => {
      try {
        const isParticipant = await ChatRoomRepository.isParticipant(roomId, userId);
        if (!isParticipant) {
          socket.emit('error', { message: 'Not a participant in this room' });
          return;
        }

        if (!content || content.trim().length === 0) {
          socket.emit('error', { message: 'Message content is required' });
          return;
        }

        const message = await ChatMessageRepository.create({
          roomId, senderId: userId, type,
          content: content.trim(),
          replyToId, mediaUrls,
        });

        await Promise.all([
          ChatRoomRepository.touchRoom(roomId),
          ChatRoomRepository.updateLastRead(roomId, userId),
        ]);

        io.to(`room:${roomId}`).emit('new_message', message);
        _clearTyping(io, roomId, userId);
      } catch (err) {
        logger.error('send_message error', { userId, roomId, error: err.message });
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ─── Typing indicators ─────────────────────────────────────
    socket.on('typing_start', ({ roomId }) => {
      if (!typingUsers.has(roomId)) typingUsers.set(roomId, new Set());
      typingUsers.get(roomId).add(userId);
      socket.to(`room:${roomId}`).emit('user_typing', { roomId, userId, timestamp: new Date() });
    });

    socket.on('typing_stop', ({ roomId }) => {
      _clearTyping(io, roomId, userId);
      socket.to(`room:${roomId}`).emit('user_stopped_typing', { roomId, userId });
    });

    // ─── Mark messages as read ─────────────────────────────────
    socket.on('mark_read', async ({ roomId }) => {
      try {
        const count = await ChatMessageRepository.markRoomRead(roomId, userId);
        await ChatRoomRepository.updateLastRead(roomId, userId);
        if (count > 0) {
          socket.to(`room:${roomId}`).emit('messages_read', { roomId, userId, timestamp: new Date() });
        }
      } catch (err) {
        logger.error('mark_read error', { userId, roomId, error: err.message });
      }
    });

    // ─── Disconnect ────────────────────────────────────────────
    socket.on('disconnect', () => {
      // Clear all typing indicators for this user
      for (const [roomId] of typingUsers) {
        _clearTyping(io, roomId, userId);
      }
      logger.debug('Socket disconnected', { userId, socketId: socket.id });
    });
  });
}

function _clearTyping(io, roomId, userId) {
  const room = typingUsers.get(roomId);
  if (room) {
    room.delete(userId);
    if (room.size === 0) typingUsers.delete(roomId);
  }
}

module.exports = { initChatSocket };
