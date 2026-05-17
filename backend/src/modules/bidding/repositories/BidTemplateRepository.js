'use strict';

const prisma = require('../../../prisma/client');

const BidTemplateRepository = {
  async findById(id) {
    return prisma.bidTemplate.findUnique({ where: { id } });
  },

  async findByIdAndMerchant(id, merchantId) {
    return prisma.bidTemplate.findFirst({ where: { id, merchantId } });
  },

  async findByMerchant(merchantId) {
    return prisma.bidTemplate.findMany({
      where: { merchantId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(data) {
    return prisma.bidTemplate.create({ data });
  },

  async update(id, data) {
    return prisma.bidTemplate.update({ where: { id }, data });
  },

  async softDelete(id) {
    return prisma.bidTemplate.update({ where: { id }, data: { isActive: false } });
  },

  async incrementUsage(id) {
    return prisma.bidTemplate.update({ where: { id }, data: { usageCount: { increment: 1 } } });
  },

  async incrementSuccess(id) {
    return prisma.bidTemplate.update({ where: { id }, data: { successCount: { increment: 1 } } });
  },
};

module.exports = BidTemplateRepository;
