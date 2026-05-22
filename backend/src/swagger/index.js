'use strict';

const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Reverse Marketplace API',
      version: '1.0.0',
      description: [
        'A reverse-marketplace where buyers post requests and merchants bid to fulfill them.',
        '',
        '**Auth**: All protected endpoints require `Authorization: Bearer <accessToken>`.',
        'Tokens are issued by `POST /api/v1/identity/auth/verify-otp`.',
        '',
        '**Roles**: `BUYER` · `MERCHANT` · `ADMIN` (sub-roles: SUPER_ADMIN, ADMIN, SUPPORT)',
        '',
        '**Event bus**: RabbitMQ topic exchange — every state-changing operation emits an event',
        'consumed by the Notifications consumer and the Analytics subscriber.',
      ].join('\n'),
    },
    servers: [{ url: 'http://localhost:3000', description: 'Local development' }],
    tags: [
      { name: 'Auth',                 description: 'Phone-OTP login flow' },
      { name: 'Admin Auth',           description: 'Admin self-service profile & sessions' },
      { name: 'Admin Users',          description: 'Platform-level user management (admin)' },
      { name: 'Requests',             description: 'Buyer request lifecycle' },
      { name: 'Admin Requests',       description: 'Admin request & category management' },
      { name: 'Bidding',              description: 'Merchant bid submission and buyer evaluation' },
      { name: 'Admin Bidding',        description: 'Admin bid oversight' },
      { name: 'Chat',                 description: 'Real-time chat rooms and messages' },
      { name: 'Admin Chat',           description: 'Admin chat moderation' },
      { name: 'Notifications',        description: 'In-app notification feed' },
      { name: 'Admin Notifications',  description: 'Admin notification management' },
      { name: 'Reviews',              description: 'Post-delivery reviews' },
      { name: 'Analytics',            description: 'Activity logs and platform statistics (admin)' },
    ],
    security: [{ bearerAuth: [] }],
  },
  apis: [
    path.join(__dirname, 'components.js'),
    path.join(__dirname, '../modules/identity/routes/auth.js'),
    path.join(__dirname, '../modules/identity/routes/adminAuth.js'),
    path.join(__dirname, '../modules/identity/routes/admin.js'),
    path.join(__dirname, '../modules/requests/routes/requests.js'),
    path.join(__dirname, '../modules/requests/routes/admin.js'),
    path.join(__dirname, '../modules/bidding/routes/bids.js'),
    path.join(__dirname, '../modules/bidding/routes/admin.js'),
    path.join(__dirname, '../modules/chat/routes/chat.js'),
    path.join(__dirname, '../modules/chat/routes/admin.js'),
    path.join(__dirname, '../modules/notifications/routes/notifications.js'),
    path.join(__dirname, '../modules/notifications/routes/admin.js'),
    path.join(__dirname, '../modules/reviews/routes/reviews.js'),
    path.join(__dirname, '../modules/analytics/routes/analytics.js'),
  ],
};

const spec = swaggerJsdoc(options);

const swaggerUiOptions = {
  customSiteTitle: 'Reverse Marketplace API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
  },
};

module.exports = { spec, swaggerUi, swaggerUiOptions };
