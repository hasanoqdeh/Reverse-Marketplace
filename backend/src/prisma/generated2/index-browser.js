
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  phone: 'phone',
  role: 'role',
  status: 'status',
  phoneVerified: 'phoneVerified',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lastLoginAt: 'lastLoginAt',
  failedLoginAttempts: 'failedLoginAttempts',
  lockedUntil: 'lockedUntil',
  adminSubRole: 'adminSubRole'
};

exports.Prisma.UserProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  firstName: 'firstName',
  lastName: 'lastName',
  profileImageUrl: 'profileImageUrl',
  locationLat: 'locationLat',
  locationLng: 'locationLng',
  address: 'address',
  city: 'city',
  country: 'country',
  preferences: 'preferences',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AuthTokenScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  tokenType: 'tokenType',
  tokenHash: 'tokenHash',
  deviceFingerprint: 'deviceFingerprint',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  expiresAt: 'expiresAt',
  lastUsedAt: 'lastUsedAt',
  createdAt: 'createdAt',
  revokedAt: 'revokedAt'
};

exports.Prisma.RequestCategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  parentId: 'parentId',
  iconUrl: 'iconUrl',
  isActive: 'isActive',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RequestScalarFieldEnum = {
  id: 'id',
  buyerId: 'buyerId',
  categoryId: 'categoryId',
  title: 'title',
  description: 'description',
  budgetMin: 'budgetMin',
  budgetMax: 'budgetMax',
  locationLat: 'locationLat',
  locationLng: 'locationLng',
  locationAddress: 'locationAddress',
  locationCity: 'locationCity',
  locationCountry: 'locationCountry',
  status: 'status',
  priorityScore: 'priorityScore',
  bidCount: 'bidCount',
  viewCount: 'viewCount',
  expiresAt: 'expiresAt',
  publishedAt: 'publishedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RequestImageScalarFieldEnum = {
  id: 'id',
  requestId: 'requestId',
  imageUrl: 'imageUrl',
  thumbnailUrl: 'thumbnailUrl',
  originalFilename: 'originalFilename',
  fileSize: 'fileSize',
  mimeType: 'mimeType',
  width: 'width',
  height: 'height',
  sortOrder: 'sortOrder',
  isPrimary: 'isPrimary',
  createdAt: 'createdAt'
};

exports.Prisma.RequestDraftScalarFieldEnum = {
  id: 'id',
  buyerId: 'buyerId',
  categoryId: 'categoryId',
  title: 'title',
  description: 'description',
  budgetMin: 'budgetMin',
  budgetMax: 'budgetMax',
  locationLat: 'locationLat',
  locationLng: 'locationLng',
  locationAddress: 'locationAddress',
  autoSaveData: 'autoSaveData',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RequestExtensionScalarFieldEnum = {
  id: 'id',
  requestId: 'requestId',
  originalExpiresAt: 'originalExpiresAt',
  newExpiresAt: 'newExpiresAt',
  extensionReason: 'extensionReason',
  extendedBy: 'extendedBy',
  createdAt: 'createdAt'
};

exports.Prisma.RequestSearchIndexScalarFieldEnum = {
  id: 'id',
  requestId: 'requestId',
  searchVector: 'searchVector',
  categoryPath: 'categoryPath',
  locationText: 'locationText',
  budgetRange: 'budgetRange',
  createdAt: 'createdAt'
};

exports.Prisma.SavedSearchScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  name: 'name',
  searchCriteria: 'searchCriteria',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BidScalarFieldEnum = {
  id: 'id',
  requestId: 'requestId',
  merchantId: 'merchantId',
  amount: 'amount',
  deliveryDays: 'deliveryDays',
  deliveryNotes: 'deliveryNotes',
  specialTerms: 'specialTerms',
  status: 'status',
  priorityScore: 'priorityScore',
  isTemplate: 'isTemplate',
  templateName: 'templateName',
  bidFee: 'bidFee',
  feePaid: 'feePaid',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  expiresAt: 'expiresAt',
  acceptedAt: 'acceptedAt',
  rejectedAt: 'rejectedAt',
  withdrawnAt: 'withdrawnAt'
};

exports.Prisma.ChatRoomScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  type: 'type',
  relatedRequestId: 'relatedRequestId',
  relatedBidId: 'relatedBidId',
  createdBy: 'createdBy',
  isActive: 'isActive',
  maxParticipants: 'maxParticipants',
  lastMessageAt: 'lastMessageAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ChatParticipantScalarFieldEnum = {
  id: 'id',
  roomId: 'roomId',
  userId: 'userId',
  role: 'role',
  joinedAt: 'joinedAt',
  lastReadAt: 'lastReadAt',
  isMuted: 'isMuted',
  isBanned: 'isBanned',
  bannedUntil: 'bannedUntil',
  bannedBy: 'bannedBy',
  bannedReason: 'bannedReason',
  leftAt: 'leftAt'
};

exports.Prisma.NotificationTemplateScalarFieldEnum = {
  id: 'id',
  name: 'name',
  type: 'type',
  channel: 'channel',
  subjectTemplate: 'subjectTemplate',
  contentTemplate: 'contentTemplate',
  variables: 'variables',
  defaultLocale: 'defaultLocale',
  isActive: 'isActive',
  version: 'version',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  title: 'title',
  content: 'content',
  channel: 'channel',
  priority: 'priority',
  status: 'status',
  templateId: 'templateId',
  templateVariables: 'templateVariables',
  metadata: 'metadata',
  scheduledAt: 'scheduledAt',
  sentAt: 'sentAt',
  deliveredAt: 'deliveredAt',
  readAt: 'readAt',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationChannelScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  channelType: 'channelType',
  isEnabled: 'isEnabled',
  deviceToken: 'deviceToken',
  emailAddress: 'emailAddress',
  phoneNumber: 'phoneNumber',
  preferences: 'preferences',
  lastUsedAt: 'lastUsedAt',
  verifiedAt: 'verifiedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationPreferenceScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  notificationType: 'notificationType',
  channelType: 'channelType',
  isEnabled: 'isEnabled',
  quietHoursStart: 'quietHoursStart',
  quietHoursEnd: 'quietHoursEnd',
  minPriority: 'minPriority',
  maxFrequencyMinutes: 'maxFrequencyMinutes',
  preferences: 'preferences',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationDeliveryScalarFieldEnum = {
  id: 'id',
  notificationId: 'notificationId',
  channelType: 'channelType',
  provider: 'provider',
  recipient: 'recipient',
  status: 'status',
  attemptCount: 'attemptCount',
  sentAt: 'sentAt',
  deliveredAt: 'deliveredAt',
  errorMessage: 'errorMessage',
  errorCode: 'errorCode',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationReadScalarFieldEnum = {
  id: 'id',
  notificationId: 'notificationId',
  userId: 'userId',
  readAt: 'readAt',
  deviceFingerprint: 'deviceFingerprint',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationStatScalarFieldEnum = {
  id: 'id',
  notificationId: 'notificationId',
  userId: 'userId',
  eventType: 'eventType',
  channelType: 'channelType',
  provider: 'provider',
  deliveryTimeMs: 'deliveryTimeMs',
  success: 'success',
  errorCode: 'errorCode',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.BidTemplateScalarFieldEnum = {
  id: 'id',
  merchantId: 'merchantId',
  name: 'name',
  description: 'description',
  amountType: 'amountType',
  amountPercentage: 'amountPercentage',
  fixedAmount: 'fixedAmount',
  deliveryDays: 'deliveryDays',
  deliveryNotes: 'deliveryNotes',
  specialTerms: 'specialTerms',
  isActive: 'isActive',
  usageCount: 'usageCount',
  successCount: 'successCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.UserRole = exports.$Enums.UserRole = {
  BUYER: 'BUYER',
  MERCHANT: 'MERCHANT',
  ADMIN: 'ADMIN'
};

exports.UserStatus = exports.$Enums.UserStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  BANNED: 'BANNED',
  SUSPENDED: 'SUSPENDED'
};

exports.AdminSubRole = exports.$Enums.AdminSubRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  SUPPORT: 'SUPPORT'
};

exports.TokenType = exports.$Enums.TokenType = {
  ACCESS: 'ACCESS',
  REFRESH: 'REFRESH'
};

exports.RequestStatus = exports.$Enums.RequestStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  HAS_BIDS: 'HAS_BIDS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
};

exports.BidStatus = exports.$Enums.BidStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
  WITHDRAWN: 'WITHDRAWN'
};

exports.RoomType = exports.$Enums.RoomType = {
  DIRECT: 'DIRECT',
  GROUP: 'GROUP',
  REQUEST: 'REQUEST',
  BID: 'BID',
  SUPPORT: 'SUPPORT'
};

exports.ParticipantRole = exports.$Enums.ParticipantRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  MEMBER: 'MEMBER'
};

exports.NotificationType = exports.$Enums.NotificationType = {
  SYSTEM: 'SYSTEM',
  REQUEST: 'REQUEST',
  BID: 'BID',
  PAYMENT: 'PAYMENT',
  CHAT: 'CHAT',
  SUBSCRIPTION: 'SUBSCRIPTION',
  SECURITY: 'SECURITY',
  MARKETING: 'MARKETING'
};

exports.NotifChannel = exports.$Enums.NotifChannel = {
  IN_APP: 'IN_APP',
  PUSH: 'PUSH',
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  WEBHOOK: 'WEBHOOK'
};

exports.NotificationPriority = exports.$Enums.NotificationPriority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

exports.NotificationStatus = exports.$Enums.NotificationStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
  READ: 'READ'
};

exports.NotifDeliveryStatus = exports.$Enums.NotifDeliveryStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  BOUNCED: 'BOUNCED'
};

exports.NotifAnalyticsEvent = exports.$Enums.NotifAnalyticsEvent = {
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  READ: 'READ',
  FAILED: 'FAILED',
  BOUNCED: 'BOUNCED',
  CLICKED: 'CLICKED',
  DISMISSED: 'DISMISSED'
};

exports.AmountType = exports.$Enums.AmountType = {
  FIXED: 'FIXED',
  PERCENTAGE: 'PERCENTAGE',
  RANGE: 'RANGE'
};

exports.Prisma.ModelName = {
  User: 'User',
  UserProfile: 'UserProfile',
  AuthToken: 'AuthToken',
  RequestCategory: 'RequestCategory',
  Request: 'Request',
  RequestImage: 'RequestImage',
  RequestDraft: 'RequestDraft',
  RequestExtension: 'RequestExtension',
  RequestSearchIndex: 'RequestSearchIndex',
  SavedSearch: 'SavedSearch',
  Bid: 'Bid',
  ChatRoom: 'ChatRoom',
  ChatParticipant: 'ChatParticipant',
  NotificationTemplate: 'NotificationTemplate',
  Notification: 'Notification',
  NotificationChannel: 'NotificationChannel',
  NotificationPreference: 'NotificationPreference',
  NotificationDelivery: 'NotificationDelivery',
  NotificationRead: 'NotificationRead',
  NotificationStat: 'NotificationStat',
  BidTemplate: 'BidTemplate'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
