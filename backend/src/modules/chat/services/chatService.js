'use strict';

const ChatRoomRepository = require('../repositories/ChatRoomRepository');
const ChatMessageRepository = require('../repositories/ChatMessageRepository');
const eventPublisher = require('../../../events/publisher');
const logger = require('../../../utils/logger');

const chatService = {
  // ─── Rooms ─────────────────────────────────────────────────────

  async createRoom(userId, { name, description, type = 'DIRECT', relatedRequestId, relatedBidId, participantIds = [] }) {
    if (!name || name.trim().length === 0) {
      return { error: 'VALIDATION_ERROR', message: 'Room name is required' };
    }

    // Prevent duplicate direct room between same two users
    if (type === 'DIRECT' && participantIds.length === 1) {
      const otherId = participantIds[0];
      const existing = await this._findDirectRoom(userId, otherId);
      if (existing) return { room: existing };
    }

    const room = await ChatRoomRepository.create({
      name: name.trim(),
      description,
      type,
      relatedRequestId,
      relatedBidId,
      createdBy: userId,
      participantIds,
    });

    await eventPublisher.publish('chat.room.created', {
      roomId: room.id, type, createdBy: userId,
    }, { userId });

    return { room };
  },

  async _findDirectRoom(userA, userB) {
    const { rooms } = await ChatRoomRepository.findByUser(userA, { type: 'DIRECT' });
    return rooms.find(r =>
      r.participants.length === 2 &&
      r.participants.some(p => p.userId === userB)
    ) || null;
  },

  async getRoom(roomId, userId) {
    const room = await ChatRoomRepository.findById(roomId);
    if (!room) return { error: 'NOT_FOUND', message: 'Chat room not found' };

    const isParticipant = await ChatRoomRepository.isParticipant(roomId, userId);
    if (!isParticipant) return { error: 'FORBIDDEN', message: 'You are not a participant in this room' };

    return { room };
  },

  async getMyRooms(userId, params) {
    const { rooms, total } = await ChatRoomRepository.findByUser(userId, params);
    const page = params?.page || 1;
    const limit = params?.limit || 20;

    // Attach unread counts + last message preview from MongoDB
    const roomsWithUnread = await Promise.all(
      rooms.map(async r => {
        const p = r.participants.find(x => x.userId === userId);
        const [unread, lastMsgResult] = await Promise.all([
          ChatMessageRepository.countUnread(r.id, userId, p?.lastReadAt),
          ChatMessageRepository.findByRoom(r.id, { page: 1, limit: 1 }),
        ]);
        const lastMessage = lastMsgResult.messages[0] ?? null;
        return { ...r, unreadCount: unread, lastMessage };
      })
    );

    return {
      rooms: roomsWithUnread,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  // ─── Messages ──────────────────────────────────────────────────

  async sendMessage(roomId, senderId, { type = 'TEXT', content, replyToId, threadId, mediaUrls = [] }) {
    if (!content || content.trim().length === 0) {
      return { error: 'VALIDATION_ERROR', message: 'Message content is required' };
    }

    const isParticipant = await ChatRoomRepository.isParticipant(roomId, senderId);
    if (!isParticipant) return { error: 'FORBIDDEN', message: 'You are not a participant in this room' };

    const message = await ChatMessageRepository.create({
      roomId, senderId, type,
      content: content.trim(),
      replyToId, threadId, mediaUrls,
    });

    // Update room ordering timestamp and sender's last read in parallel
    await Promise.all([
      ChatRoomRepository.touchRoom(roomId),
      ChatRoomRepository.updateLastRead(roomId, senderId),
    ]);

    await eventPublisher.messageSent(message.id, roomId, senderId, type, message.createdAt);

    return { message };
  },

  async getMessages(roomId, userId, params) {
    const isParticipant = await ChatRoomRepository.isParticipant(roomId, userId);
    if (!isParticipant) return { error: 'FORBIDDEN', message: 'You are not a participant in this room' };

    const { messages, total } = await ChatMessageRepository.findByRoom(roomId, params);
    const page = params?.page || 1;
    const limit = params?.limit || 50;

    // Auto-mark as read
    await ChatRoomRepository.updateLastRead(roomId, userId);

    return {
      messages,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async deleteMessage(messageId, userId) {
    const msg = await ChatMessageRepository.findById(messageId);
    if (!msg) return { error: 'NOT_FOUND', message: 'Message not found' };
    if (msg.senderId !== userId) return { error: 'FORBIDDEN', message: 'You can only delete your own messages' };

    await ChatMessageRepository.softDelete(messageId);
    return { success: true };
  },

  async markRead(roomId, userId) {
    const isParticipant = await ChatRoomRepository.isParticipant(roomId, userId);
    if (!isParticipant) return { error: 'FORBIDDEN', message: 'You are not a participant in this room' };

    const count = await ChatMessageRepository.markRoomRead(roomId, userId);
    await ChatRoomRepository.updateLastRead(roomId, userId);

    await eventPublisher.publish('chat.messages.read', { roomId, userId, count });

    return { markedRead: count };
  },

  async addReaction(messageId, userId, reactionType) {
    const msg = await ChatMessageRepository.findById(messageId);
    if (!msg || msg.isDeleted) return { error: 'NOT_FOUND', message: 'Message not found' };

    const isParticipant = await ChatRoomRepository.isParticipant(msg.roomId, userId);
    if (!isParticipant) return { error: 'FORBIDDEN', message: 'You are not a participant in this room' };

    await ChatMessageRepository.addReaction(messageId, userId, reactionType);
    return { success: true };
  },

  // ─── Participants ──────────────────────────────────────────────

  async addParticipant(roomId, requestingUserId, targetUserId) {
    const room = await ChatRoomRepository.findById(roomId);
    if (!room) return { error: 'NOT_FOUND', message: 'Chat room not found' };

    const requester = await ChatRoomRepository.getParticipant(roomId, requestingUserId);
    if (!requester || requester.leftAt) return { error: 'FORBIDDEN', message: 'You are not a participant' };
    if (!['OWNER', 'ADMIN'].includes(requester.role)) return { error: 'FORBIDDEN', message: 'Only owners/admins can add participants' };

    await ChatRoomRepository.addParticipant(roomId, targetUserId);
    return { success: true };
  },

  async leaveRoom(roomId, userId) {
    const isParticipant = await ChatRoomRepository.isParticipant(roomId, userId);
    if (!isParticipant) return { error: 'NOT_FOUND', message: 'You are not in this room' };

    await ChatRoomRepository.removeParticipant(roomId, userId);
    return { success: true };
  },

  // ─── Admin ─────────────────────────────────────────────────────

  async adminGetRooms(params) {
    const { rooms, total } = await ChatRoomRepository.findAll(params);
    const page = params?.page || 1;
    const limit = params?.limit || 20;

    // Attach message counts from MongoDB
    const roomsWithCounts = await Promise.all(
      rooms.map(async r => {
        const msgTotal = await ChatMessageRepository.countByRoom(r.id).catch(() => 0);
        return { ...r, _count: { ...r._count, messages: msgTotal } };
      })
    );

    return {
      rooms: roomsWithCounts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async adminGetRoom(roomId) {
    const room = await ChatRoomRepository.findById(roomId);
    if (!room) return { error: 'NOT_FOUND', message: 'Chat room not found' };
    return { room };
  },

  async adminGetMessages(roomId, params) {
    const room = await ChatRoomRepository.findById(roomId);
    if (!room) return { error: 'NOT_FOUND', message: 'Chat room not found' };
    const { messages, total } = await ChatMessageRepository.findByRoom(roomId, params);
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    return { messages, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async adminDeleteMessage(messageId, adminId) {
    const msg = await ChatMessageRepository.findById(messageId);
    if (!msg) return { error: 'NOT_FOUND', message: 'Message not found' };
    await ChatMessageRepository.softDelete(messageId);
    logger.info('Admin deleted chat message', { messageId, adminId });
    return { success: true };
  },
};

module.exports = chatService;
