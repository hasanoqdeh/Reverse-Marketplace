'use strict';

const prisma = require('../../../prisma/client');

const RequestDraftRepository = {
  async findById(id) {
    return prisma.requestDraft.findUnique({ where: { id } });
  },

  async findByIdAndBuyer(id, buyerId) {
    return prisma.requestDraft.findFirst({ where: { id, buyerId } });
  },

  async findByBuyer(buyerId) {
    return prisma.requestDraft.findMany({
      where: { buyerId },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async create(data) {
    return prisma.requestDraft.create({ data });
  },

  async update(id, data) {
    return prisma.requestDraft.update({ where: { id }, data });
  },

  async delete(id) {
    return prisma.requestDraft.delete({ where: { id } });
  },

  async deleteExpired() {
    return prisma.requestDraft.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  },
};

module.exports = RequestDraftRepository;
