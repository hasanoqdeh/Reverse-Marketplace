'use strict';

const prisma = require('../../../prisma/client');
const ChatMessageRepository = require('./ChatMessageRepository');

const INCLUDE_PARTICIPANTS = { participants: { where: { leftAt: null } } };

const ChatRoomRepository = {
  async create({ name, description, type, relatedRequestId, relatedBidId, createdBy, participantIds = [] }) {
    const uniqueIds = [...new Set([createdBy, ...participantIds])];

    return prisma.chatRoom.create({
      data: {
        name,
        description: description || null,
        type,
        relatedRequestId: relatedRequestId || null,
        relatedBidId: relatedBidId || null,
        createdBy,
        participants: {
          create: uniqueIds.map((uid, i) => ({
            userId: uid,
            role: i === 0 ? 'OWNER' : 'MEMBER',
          })),
        },
      },
      include: INCLUDE_PARTICIPANTS,
    });
  },

  async findById(id) {
    const room = await prisma.chatRoom.findUnique({
      where: { id },
      include: INCLUDE_PARTICIPANTS,
    });
    if (!room) return null;
    const messageCount = await ChatMessageRepository.countByRoom(id).catch(() => 0);
    return { ...room, _count: { messages: messageCount } };
  },

  async findByUser(userId, { page = 1, limit = 20, type } = {}) {
    const where = {
      participants: { some: { userId, leftAt: null } },
      isActive: true,
      ...(type ? { type } : {}),
    };

    const [rooms, total] = await Promise.all([
      prisma.chatRoom.findMany({
        where,
        include: INCLUDE_PARTICIPANTS,
        orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.chatRoom.count({ where }),
    ]);

    return { rooms, total };
  },

  async findAll({ page = 1, limit = 20, type, isActive, search } = {}) {
    const where = {
      ...(type ? { type } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
    };

    const [rooms, total] = await Promise.all([
      prisma.chatRoom.findMany({
        where,
        include: INCLUDE_PARTICIPANTS,
        orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.chatRoom.count({ where }),
    ]);

    return { rooms, total };
  },

  async isParticipant(roomId, userId) {
    const p = await prisma.chatRoomParticipant.findFirst({
      where: { roomId, userId, leftAt: null },
    });
    return p !== null;
  },

  async getParticipant(roomId, userId) {
    return prisma.chatRoomParticipant.findFirst({
      where: { roomId, userId, leftAt: null },
    });
  },

  async addParticipant(roomId, userId, role = 'MEMBER') {
    return prisma.chatRoomParticipant.upsert({
      where: { roomId_userId: { roomId, userId } },
      update: { leftAt: null, role },
      create: { roomId, userId, role },
    });
  },

  async removeParticipant(roomId, userId) {
    return prisma.chatRoomParticipant.updateMany({
      where: { roomId, userId },
      data: { leftAt: new Date() },
    });
  },

  async updateLastRead(roomId, userId) {
    return prisma.chatRoomParticipant.updateMany({
      where: { roomId, userId },
      data: { lastReadAt: new Date() },
    });
  },

  async touchRoom(roomId) {
    return prisma.chatRoom.update({
      where: { id: roomId },
      data: { lastMessageAt: new Date() },
    });
  },

  async findByRequestId(requestId) {
    return prisma.chatRoom.findFirst({
      where: { relatedRequestId: requestId, isActive: true },
      include: INCLUDE_PARTICIPANTS,
    });
  },

  async findByBidId(bidId) {
    return prisma.chatRoom.findFirst({
      where: { relatedBidId: bidId, isActive: true },
      include: INCLUDE_PARTICIPANTS,
    });
  },

  async deactivate(roomId) {
    return prisma.chatRoom.update({ where: { id: roomId }, data: { isActive: false } });
  },
};

module.exports = ChatRoomRepository;
