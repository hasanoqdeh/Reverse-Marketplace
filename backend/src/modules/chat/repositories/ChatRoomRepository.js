'use strict';

const prisma = require('../../../prisma/client');
const ChatMessageRepository = require('./ChatMessageRepository');

const ChatRoomRepository = {
  async create({ name, description, type, relatedRequestId, relatedBidId, createdBy }) {
    return prisma.chatRoom.create({
      data: {
        name,
        description: description || null,
        type,
        relatedRequestId: relatedRequestId || null,
        relatedBidId: relatedBidId || null,
        createdBy,
      },
    });
  },

  async findById(id) {
    const room = await prisma.chatRoom.findUnique({ where: { id } });
    if (!room) return null;
    const messageCount = await ChatMessageRepository.countByRoom(id).catch(() => 0);
    return { ...room, _count: { messages: messageCount } };
  },

  async findByUser(userId, { page = 1, limit = 20, type } = {}) {
    const where = {
      OR: [{ createdBy: userId }],
      isActive: true,
      ...(type ? { type } : {}),
    };

    const [rooms, total] = await Promise.all([
      prisma.chatRoom.findMany({
        where,
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
        orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.chatRoom.count({ where }),
    ]);

    return { rooms, total };
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
