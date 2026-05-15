'use strict';

const winston = require('winston');
const config = require('../config');

const { combine, timestamp, errors, json, colorize, simple, printf } = winston.format;

// Custom format for development
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
    return `${ts} [${level}] ${message}${metaStr}`;
  })
);

// Production JSON format
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const transports = [
  new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  new winston.transports.File({ filename: 'logs/combined.log' }),
];

if (config.env !== 'production') {
  transports.push(
    new winston.transports.Console({ format: devFormat })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: config.env === 'production' ? prodFormat : devFormat,
  defaultMeta: { service: 'identity-service' },
  transports,
  exitOnError: false,
});

// Add convenience methods used by index.js
logger.http = (message, meta = {}) => logger.info(message, { ...meta, type: 'http' });

logger.system = {
  serviceStarted: (port, env) => logger.info(`Service started on port ${port}`, { env, type: 'system' }),
};

module.exports = logger;
