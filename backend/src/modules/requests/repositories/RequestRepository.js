'use strict';

const prisma = require('../../../prisma/client');

const RequestRepository = {
  async findById(id) {
    return prisma.request.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
      },
    });
  },

  async findByIdAndBuyer(id, buyerId) {
    return prisma.request.findFirst({
      where: { id, buyerId },
      include: {
        category: true,
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
      },
    });
  },

  async search({ filters = {}, pagination = {}, sorting = {} }) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where = this._buildWhereClause(filters);

    const orderBy = this._buildOrderBy(sorting);

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        include: {
          category: true,
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.request.count({ where }),
    ]);

    return { requests, total, page, limit };
  },

  _buildWhereClause(filters) {
    const where = {};

    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }

    if (filters.categories && filters.categories.length > 0) {
      where.categoryId = { in: filters.categories };
    }

    if (filters.buyerId) {
      where.buyerId = filters.buyerId;
    }

    if (filters.budgetRange) {
      where.budgetMax = { gte: filters.budgetRange.min };
      if (filters.budgetRange.max) {
        where.budgetMin = { lte: filters.budgetRange.max };
      }
    }

    if (filters.dateRange) {
      where.createdAt = {
        gte: new Date(filters.dateRange.startDate),
        lte: new Date(filters.dateRange.endDate),
      };
    }

    return where;
  },

  _buildOrderBy(sorting) {
    if (!sorting.field) {
      return [{ priorityScore: 'desc' }, { createdAt: 'desc' }];
    }

    const fieldMap = {
      priority_score: 'priorityScore',
      created_at: 'createdAt',
      budget_max: 'budgetMax',
    };

    const field = fieldMap[sorting.field] || 'createdAt';
    return [{ [field]: sorting.order || 'desc' }];
  },

  async create(data) {
    return prisma.request.create({
      data,
      include: { category: true, images: true },
    });
  },

  async update(id, data) {
    return prisma.request.update({
      where: { id },
      data,
      include: { category: true, images: true },
    });
  },

  async updateStatus(id, status) {
    return prisma.request.update({
      where: { id },
      data: { status },
    });
  },

  async incrementViewCount(id) {
    return prisma.request.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  },

  async incrementBidCount(id) {
    return prisma.request.update({
      where: { id },
      data: { bidCount: { increment: 1 } },
    });
  },

  async findByBuyer(buyerId, { status, page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const where = { buyerId };
    if (status) where.status = { in: status };

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        include: {
          category: true,
          images: { where: { isPrimary: true }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.request.count({ where }),
    ]);

    return { requests, total, page, limit };
  },
};

module.exports = RequestRepository;
