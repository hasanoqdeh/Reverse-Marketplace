'use strict';

const prisma = require('../prisma/client');
const logger = require('../utils/logger');

const database = {
  async connect() {
    await prisma.$connect();
    logger.info('Prisma connected (identity-service)');
  },

  async disconnect() {
    await prisma.$disconnect();
    logger.info('Prisma disconnected (identity-service)');
  },

  async withTransaction(fn) {
    return prisma.$transaction(fn);
  },
};

module.exports = database;
