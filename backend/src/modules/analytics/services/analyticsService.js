'use strict';

const ActivityLog = require('../../../models/ActivityLog');
const RequestAnalytic = require('../../../models/RequestAnalytic');
const RequestView = require('../../../models/RequestView');
const RequestRepository = require('../../requests/repositories/RequestRepository');
const logger = require('../../../utils/logger');

// ─── ActivityLog mapping ───────────────────────────────────────────────────
// Maps each routing key to how it becomes an ActivityLog entry.

const EVENT_MAP = {
  'user.registered': {
    category:   'identity',
    action:     'User registered',
    actorRole:  (d) => d.role || 'BUYER',
    actorId:    (d) => d.userId,
    targetType: 'user',
    targetId:   (d) => d.userId,
  },
  'user.logined': {
    category:   'identity',
    action:     'User logged in',
    actorRole:  (d) => d.role || 'BUYER',
    actorId:    (d) => d.userId,
    targetType: 'user',
    targetId:   (d) => d.userId,
  },
  'user.verified': {
    category:   'identity',
    action:     'Phone verified',
    actorRole:  (d) => d.role || 'BUYER',
    actorId:    (d) => d.userId,
    targetType: 'user',
    targetId:   (d) => d.userId,
  },
  'user.update': {
    category:   'admin',
    action:     'User status changed by admin',
    actorRole:  'ADMIN',
    actorId:    (d) => d.bannedBy || null,
    targetType: 'user',
    targetId:   (d) => d.userId,
  },
  'notification.otp.requested': {
    category:   'identity',
    action:     'OTP requested',
    actorRole:  'SYSTEM',
    actorId:    (d) => d.userId,
    targetType: 'user',
    targetId:   (d) => d.userId,
  },
  'request.created': {
    category:   'requests',
    action:     'Request created',
    actorRole:  'BUYER',
    actorId:    (d) => d.buyerId,
    targetType: 'request',
    targetId:   (d) => d.requestId,
  },
  'request.updated': {
    category:   'requests',
    action:     'Request updated',
    actorRole:  (d) => (d.updatedBy && d.updatedBy !== d.buyerId ? 'ADMIN' : 'BUYER'),
    actorId:    (d) => d.updatedBy || d.buyerId,
    targetType: 'request',
    targetId:   (d) => d.requestId,
  },
  'request.extended': {
    category:   'requests',
    action:     'Request extended',
    actorRole:  'BUYER',
    actorId:    (d) => d.buyerId,
    targetType: 'request',
    targetId:   (d) => d.requestId,
  },
  'request.closed': {
    category:   'requests',
    action:     'Request closed',
    actorRole:  (d) => (d.closedBy && d.closedBy !== d.buyerId ? 'ADMIN' : 'BUYER'),
    actorId:    (d) => d.closedBy || d.buyerId,
    targetType: 'request',
    targetId:   (d) => d.requestId,
  },
  'request.cancelled': {
    category:   'requests',
    action:     'Request cancelled',
    actorRole:  'BUYER',
    actorId:    (d) => d.buyerId,
    targetType: 'request',
    targetId:   (d) => d.requestId,
  },
  'request.completed': {
    category:   'requests',
    action:     'Request completed',
    actorRole:  'BUYER',
    actorId:    (d) => d.buyerId,
    targetType: 'request',
    targetId:   (d) => d.requestId,
  },
  'request.expired': {
    category:   'requests',
    action:     'Request expired',
    actorRole:  'SYSTEM',
    actorId:    () => null,
    targetType: 'request',
    targetId:   (d) => d.requestId,
  },
  'admin.action': {
    category:   'admin',
    action:     (d) => d.actionType || 'Admin action',
    actorRole:  'ADMIN',
    actorId:    (d) => d.adminId,
    targetType: (d) => d.targetType || 'user',
    targetId:   (d) => d.targetId || null,
  },
};

// ─── RequestAnalytic mapping ───────────────────────────────────────────────
// Maps routing key → RequestAnalytic eventType.
// Views are excluded from ActivityLog (too noisy) but still written to RequestAnalytic.

const REQUEST_ANALYTIC_MAP = {
  'request.created':   'STATUS_CHANGE',
  'request.updated':   'STATUS_CHANGE',
  'request.extended':  'EXTENSION_REQUESTED',
  'request.cancelled': 'CANCELLED',
  'request.completed': 'COMPLETED',
  'request.expired':   'EXPIRED',
  'request.closed':    'STATUS_CHANGE',
  'request.viewed':    'VIEW',
};

function resolve(val, data) {
  return typeof val === 'function' ? val(data) : val;
}

const analyticsService = {
  async logFromEvent(event) {
    const { eventType, data = {}, metadata = {} } = event;

    // 1. Write to ActivityLog for all mapped events (skip request.viewed — too high volume)
    const activityMapping = EVENT_MAP[eventType];
    if (activityMapping) {
      try {
        await ActivityLog.create({
          actorId:    resolve(activityMapping.actorId, data) || null,
          actorRole:  resolve(activityMapping.actorRole, data),
          eventType,
          category:   resolve(activityMapping.category, data),
          action:     resolve(activityMapping.action, data),
          targetType: resolve(activityMapping.targetType, data) || null,
          targetId:   resolve(activityMapping.targetId, data) || null,
          metadata:   { ...data, eventId: event.eventId, correlationId: metadata.correlationId },
        });
      } catch (err) {
        logger.error('Analytics: failed to write ActivityLog', { eventType, error: err.message });
      }
    }

    // 2. Write to RequestAnalytic for all request.* events
    const analyticEventType = REQUEST_ANALYTIC_MAP[eventType];
    if (analyticEventType && data.requestId) {
      try {
        await RequestAnalytic.create({
          requestId: data.requestId,
          eventType:  analyticEventType,
          userId:     data.buyerId || data.userId || data.updatedBy || data.closedBy || null,
          metadata:   { ...data, eventId: event.eventId },
        });
      } catch (err) {
        logger.error('Analytics: failed to write RequestAnalytic', { eventType, error: err.message });
      }
    }

    // 3. For views: also write RequestView + increment PostgreSQL counter
    if (eventType === 'request.viewed' && data.requestId) {
      try {
        await RequestView.create({
          requestId: data.requestId,
          userId:    data.userId || null,
          ipAddress: data.ipAddress || null,
          viewedAt:  data.viewedAt ? new Date(data.viewedAt) : new Date(),
        });
        await RequestRepository.incrementViewCount(data.requestId);
      } catch (err) {
        logger.error('Analytics: failed to write RequestView', { requestId: data.requestId, error: err.message });
      }
    }
  },
};

module.exports = analyticsService;
