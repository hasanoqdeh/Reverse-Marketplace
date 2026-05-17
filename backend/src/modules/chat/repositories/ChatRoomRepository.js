'use strict';

const prisma = require('../../../prisma/client');
const ChatMessageRepository = require('./ChatMessageRepository');

const ChatRoomRepository = {
  async create({ name, description, type, relatedRequestId, relatedBidId, createdBy, participantIds = [] }) {
    return prisma.chatRoom.create({
      data: {
        name,
        description: description || null,
        type,
        relatedRequestId: relatedRequestId || null,
        relatedBidId: relatedBidId || null,
        createdBy,
        participants: {
          create: [
            { userId: createdBy, role: 'OWNER' },
            ...participantIds
              .filter(id => id !== createdBy)
              .map(id => ({ userId: id, role: 'MEMBER' })),
          ],
        },
      },
      include: { participants: true },
    });
  },

  async findById(id) {
    const room = await prisma.chatRoom.findUnique({
      where: { id },
      include: {
        participants: {
          where: { leftAt: null, isBanned: false },
          select: { userId: true, role: true, joinedAt: true, lastReadAt: true, isMuted: true },
        },
      },
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
        orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          participants: {
            where: { leftAt: null },
            select: { userId: true, role: true, lastReadAt: true },
          },
          _count: { select: { participants: { where: { leftAt: null } } } },
        },
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
        orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              participants: { where: { leftAt: null } },
            },
          },
        },
      }),
      prisma.chatRoom.count({ where }),
    ]);

    return { rooms, total };
  },

  async isParticipant(roomId, userId) {
    const p = await prisma.chatParticipant.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });
    return p && !p.leftAt && !p.isBanned;
  },

  async getParticipant(roomId, userId) {
    return prisma.chatParticipant.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });
  },

  async addParticipant(roomId, userId, role = 'MEMBER') {
    return prisma.chatParticipant.upsert({
      where: { roomId_userId: { roomId, userId } },
      create: { roomId, userId, role },
      update: { leftAt: null, isBanned: false, role },
    });
  },

  async removeParticipant(roomId, userId) {
    return prisma.chatParticipant.updateMany({
      where: { roomId, userId },
      data: { leftAt: new Date() },
    });
  },

  async updateLastRead(roomId, userId) {
    return prisma.chatParticipant.updateMany({
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
    });
  },

  async findByBidId(bidId) {
    return prisma.chatRoom.findFirst({
      where: { relatedBidId: bidId, isActive: true },
    });
  },

  async deactivate(roomId) {
    return prisma.chatRoom.update({ where: { id: roomId }, data: { isActive: false } });
  },
};

module.exports = ChatRoomRepository;
