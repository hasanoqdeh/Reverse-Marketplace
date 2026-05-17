'use strict';

const prisma = require('../../../prisma/client');

const BidRepository = {
  async findById(id) {
    return prisma.bid.findUnique({ where: { id } });
  },

  async findByIdAndMerchant(id, merchantId) {
    return prisma.bid.findFirst({ where: { id, merchantId } });
  },

  async findByRequestAndMerchant(requestId, merchantId) {
    return prisma.bid.findFirst({ where: { requestId, merchantId } });
  },

  async findByRequest(requestId, { statuses, page = 1, limit = 20, sortField = 'amount', sortOrder = 'asc' } = {}) {
    const skip = (page - 1) * limit;
    const where = { requestId };
    if (statuses && statuses.length > 0) where.status = { in: statuses };

    const orderBy = this._buildOrderBy(sortField, sortOrder);

    const [bids, total] = await Promise.all([
      prisma.bid.findMany({ where, orderBy, skip, take: limit }),
      prisma.bid.count({ where }),
    ]);

    return { bids, total, page, limit };
  },

  async findByMerchant(merchantId, { statuses, page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const where = { merchantId };
    if (statuses && statuses.length > 0) where.status = { in: statuses };

    const [bids, total] = await Promise.all([
      prisma.bid.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.bid.count({ where }),
    ]);

    return { bids, total, page, limit };
  },

  async create(data) {
    return prisma.bid.create({ data });
  },

  async update(id, data) {
    return prisma.bid.update({ where: { id }, data });
  },

  async updateStatus(id, status, extraFields = {}) {
    return prisma.bid.update({ where: { id }, data: { status, ...extraFields } });
  },

  async rejectAllExcept(requestId, acceptedBidId) {
    return prisma.bid.updateMany({
      where: {
        requestId,
        id: { not: acceptedBidId },
        status: 'PENDING',
      },
      data: { status: 'REJECTED', rejectedAt: new Date() },
    });
  },

  async countByRequest(requestId) {
    return prisma.bid.count({ where: { requestId, status: { not: 'WITHDRAWN' } } });
  },

  async getCompetitionData(requestId) {
    const bids = await prisma.bid.findMany({
      where: { requestId, status: { not: 'WITHDRAWN' } },
      select: { amount: true },
    });

    if (bids.length === 0) return { totalBids: 0, lowestAmount: null, averageAmount: null };

    const amounts = bids.map((b) => parseFloat(b.amount));
    const lowestAmount = Math.min(...amounts);
    const averageAmount = amounts.reduce((s, a) => s + a, 0) / amounts.length;

    return { totalBids: bids.length, lowestAmount, averageAmount };
  },

  _buildOrderBy(field, order) {
    const fieldMap = {
      amount: 'amount',
      deliveryDays: 'deliveryDays',
      createdAt: 'createdAt',
      priorityScore: 'priorityScore',
    };
    const f = fieldMap[field] || 'amount';
    return [{ [f]: order || 'asc' }];
  },
};

module.exports = BidRepository;
