'use strict';

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const mongo = {
  async connect() {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/reverse_marketplace';

    mongoose.connection.on('connected', () => logger.info('MongoDB connected', { uri: uri.replace(/:([^:@]+)@/, ':****@') }));
    mongoose.connection.on('error', (err) => logger.error('MongoDB error', { error: err.message }));
    mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  },

  async disconnect() {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  },
};

module.exports = mongo;
