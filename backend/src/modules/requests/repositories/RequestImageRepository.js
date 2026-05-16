'use strict';

const prisma = require('../../../prisma/client');

const RequestImageRepository = {
  async findByRequest(requestId) {
    return prisma.requestImage.findMany({
      where: { requestId },
      orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
    });
  },

  async findById(id) {
    return prisma.requestImage.findUnique({ where: { id } });
  },

  async findByIdAndRequest(id, requestId) {
    return prisma.requestImage.findFirst({ where: { id, requestId } });
  },

  async countByRequest(requestId) {
    return prisma.requestImage.count({ where: { requestId } });
  },

  async create(data) {
    return prisma.requestImage.create({ data });
  },

  async setPrimary(id, requestId) {
    await prisma.requestImage.updateMany({
      where: { requestId },
      data: { isPrimary: false },
    });
    return prisma.requestImage.update({
      where: { id },
      data: { isPrimary: true },
    });
  },

  async delete(id) {
    return prisma.requestImage.delete({ where: { id } });
  },

  async reorderImages(requestId, imageOrders) {
    const updates = imageOrders.map(({ id, sortOrder }) =>
      prisma.requestImage.update({ where: { id }, data: { sortOrder } })
    );
    return prisma.$transaction(updates);
  },
};

module.exports = RequestImageRepository;
