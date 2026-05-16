'use strict';

const prisma = require('../../../prisma/client');

const CategoryRepository = {
  async findAll({ activeOnly = true } = {}) {
    return prisma.requestCategory.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        children: {
          where: activeOnly ? { isActive: true } : {},
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
    });
  },

  async findById(id) {
    return prisma.requestCategory.findUnique({
      where: { id },
      include: { children: true, parent: true },
    });
  },

  async findRoots({ activeOnly = true } = {}) {
    return prisma.requestCategory.findMany({
      where: {
        parentId: null,
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  },

  async create(data) {
    return prisma.requestCategory.create({ data });
  },

  async update(id, data) {
    return prisma.requestCategory.update({ where: { id }, data });
  },

  async delete(id) {
    return prisma.requestCategory.delete({ where: { id } });
  },
};

module.exports = CategoryRepository;
