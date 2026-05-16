'use strict';

const { PrismaClient } = require('./generated');

let _prisma = null;

function getPrismaClient() {
  if (!_prisma) {
    _prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return _prisma;
}

module.exports = getPrismaClient();
