'use strict';

const prisma = require('../prisma/client');
const logger = require('../utils/logger');

const database = {
  async connect() {
    await prisma.$connect();
    logger.info('Database connected');
  },

  async disconnect() {
    await prisma.$disconnect();
    logger.info('Database disconnected');
  },
};

module.exports = database;
