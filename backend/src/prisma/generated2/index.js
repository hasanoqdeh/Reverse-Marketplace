
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/library.js')


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

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

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




  const path = require('path')

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
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/app/src/prisma/generated2",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "linux-musl-openssl-3.0.x",
        "native": true
      },
      {
        "fromEnvVar": null,
        "value": "debian-openssl-3.0.x"
      },
      {
        "fromEnvVar": null,
        "value": "linux-musl-openssl-3.0.x"
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "/app/src/prisma/schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../../.env"
  },
  "relativePath": "..",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "generator client {\n  provider      = \"prisma-client-js\"\n  output        = \"./generated2\"\n  binaryTargets = [\"native\", \"debian-openssl-3.0.x\", \"linux-musl-openssl-3.0.x\"]\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\n// ─── Identity enums ────────────────────────────────────────────────────────\n\nenum UserRole {\n  BUYER\n  MERCHANT\n  ADMIN\n}\n\nenum UserStatus {\n  PENDING\n  ACTIVE\n  BANNED\n  SUSPENDED\n}\n\nenum TokenType {\n  ACCESS\n  REFRESH\n}\n\nenum AdminActionType {\n  USER_VIEW\n  USER_EDIT\n  USER_SUSPEND\n  USER_BAN\n  USER_DELETE\n  USER_BULK_ACTION\n  ADMIN_ADD\n  ADMIN_EDIT\n  ADMIN_REMOVE\n  SYSTEM_CONFIG_CHANGE\n  EXPORT_DATA\n  IMPORT_DATA\n  SECURITY_ALERT\n  SESSION_TERMINATE\n  PASSWORD_RESET\n  VERIFICATION_OVERRIDE\n}\n\nenum AdminSubRole {\n  SUPER_ADMIN\n  ADMIN\n  SUPPORT\n}\n\n// ─── Identity models ───────────────────────────────────────────────────────\n\nmodel User {\n  id                  String        @id @default(uuid()) @db.Uuid\n  phone               String        @unique\n  role                UserRole      @default(BUYER)\n  status              UserStatus    @default(PENDING)\n  phoneVerified       Boolean       @default(false) @map(\"phone_verified\")\n  createdAt           DateTime      @default(now()) @map(\"created_at\") @db.Timestamptz\n  updatedAt           DateTime      @updatedAt @map(\"updated_at\") @db.Timestamptz\n  lastLoginAt         DateTime?     @map(\"last_login_at\") @db.Timestamptz\n  failedLoginAttempts Int           @default(0) @map(\"failed_login_attempts\")\n  lockedUntil         DateTime?     @map(\"locked_until\") @db.Timestamptz\n  adminSubRole        AdminSubRole? @map(\"admin_sub_role\")\n\n  profile    UserProfile?\n  authTokens AuthToken[]\n\n  @@map(\"users\")\n}\n\nmodel UserProfile {\n  id              String   @id @default(uuid()) @db.Uuid\n  userId          String   @unique @map(\"user_id\") @db.Uuid\n  firstName       String   @default(\"\") @map(\"first_name\")\n  lastName        String   @default(\"\") @map(\"last_name\")\n  profileImageUrl String?  @map(\"profile_image_url\")\n  locationLat     Decimal? @map(\"location_lat\") @db.Decimal(10, 8)\n  locationLng     Decimal? @map(\"location_lng\") @db.Decimal(11, 8)\n  address         String?\n  city            String?\n  country         String?\n  preferences     Json     @default(\"{}\")\n  createdAt       DateTime @default(now()) @map(\"created_at\") @db.Timestamptz\n  updatedAt       DateTime @updatedAt @map(\"updated_at\") @db.Timestamptz\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@map(\"user_profiles\")\n}\n\nmodel AuthToken {\n  id                String    @id @default(uuid()) @db.Uuid\n  userId            String    @map(\"user_id\") @db.Uuid\n  tokenType         TokenType @map(\"token_type\")\n  tokenHash         String    @map(\"token_hash\")\n  deviceFingerprint String?   @map(\"device_fingerprint\")\n  ipAddress         String?   @map(\"ip_address\")\n  userAgent         String?   @map(\"user_agent\")\n  expiresAt         DateTime  @map(\"expires_at\") @db.Timestamptz\n  lastUsedAt        DateTime? @map(\"last_used_at\") @db.Timestamptz\n  createdAt         DateTime  @default(now()) @map(\"created_at\") @db.Timestamptz\n  revokedAt         DateTime? @map(\"revoked_at\") @db.Timestamptz\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@map(\"auth_tokens\")\n}\n\n// ─── Request enums ─────────────────────────────────────────────────────────\n\nenum RequestStatus {\n  DRAFT\n  ACTIVE\n  HAS_BIDS\n  COMPLETED\n  CANCELLED\n  EXPIRED\n}\n\n// ─── Request models ────────────────────────────────────────────────────────\n\nmodel RequestCategory {\n  id          String   @id @default(uuid()) @db.Uuid\n  name        String   @db.VarChar(100)\n  slug        String   @unique @db.VarChar(100)\n  description String?\n  parentId    String?  @map(\"parent_id\") @db.Uuid\n  iconUrl     String?  @map(\"icon_url\") @db.VarChar(500)\n  isActive    Boolean  @default(true) @map(\"is_active\")\n  sortOrder   Int      @default(0) @map(\"sort_order\")\n  createdAt   DateTime @default(now()) @map(\"created_at\") @db.Timestamptz\n  updatedAt   DateTime @updatedAt @map(\"updated_at\") @db.Timestamptz\n\n  parent   RequestCategory?  @relation(\"CategoryTree\", fields: [parentId], references: [id])\n  children RequestCategory[] @relation(\"CategoryTree\")\n  requests Request[]\n  drafts   RequestDraft[]\n\n  @@map(\"request_categories\")\n}\n\nmodel Request {\n  id              String        @id @default(uuid()) @db.Uuid\n  buyerId         String        @map(\"buyer_id\") @db.Uuid\n  categoryId      String        @map(\"category_id\") @db.Uuid\n  title           String        @db.VarChar(255)\n  description     String\n  budgetMin       Decimal?      @map(\"budget_min\") @db.Decimal(12, 2)\n  budgetMax       Decimal?      @map(\"budget_max\") @db.Decimal(12, 2)\n  locationLat     Decimal?      @map(\"location_lat\") @db.Decimal(10, 8)\n  locationLng     Decimal?      @map(\"location_lng\") @db.Decimal(11, 8)\n  locationAddress String?       @map(\"location_address\")\n  locationCity    String?       @map(\"location_city\") @db.VarChar(100)\n  locationCountry String?       @map(\"location_country\") @db.VarChar(100)\n  status          RequestStatus @default(DRAFT)\n  priorityScore   Int           @default(0) @map(\"priority_score\")\n  bidCount        Int           @default(0) @map(\"bid_count\")\n  viewCount       Int           @default(0) @map(\"view_count\")\n  expiresAt       DateTime?     @map(\"expires_at\") @db.Timestamptz\n  publishedAt     DateTime?     @map(\"published_at\") @db.Timestamptz\n  createdAt       DateTime      @default(now()) @map(\"created_at\") @db.Timestamptz\n  updatedAt       DateTime      @updatedAt @map(\"updated_at\") @db.Timestamptz\n\n  category    RequestCategory     @relation(fields: [categoryId], references: [id])\n  images      RequestImage[]\n  extensions  RequestExtension[]\n  searchIndex RequestSearchIndex?\n\n  @@map(\"requests\")\n}\n\nmodel RequestImage {\n  id               String   @id @default(uuid()) @db.Uuid\n  requestId        String   @map(\"request_id\") @db.Uuid\n  imageUrl         String   @map(\"image_url\") @db.VarChar(500)\n  thumbnailUrl     String?  @map(\"thumbnail_url\") @db.VarChar(500)\n  originalFilename String?  @map(\"original_filename\") @db.VarChar(255)\n  fileSize         BigInt   @map(\"file_size\")\n  mimeType         String   @map(\"mime_type\") @db.VarChar(100)\n  width            Int?\n  height           Int?\n  sortOrder        Int      @default(0) @map(\"sort_order\")\n  isPrimary        Boolean  @default(false) @map(\"is_primary\")\n  createdAt        DateTime @default(now()) @map(\"created_at\") @db.Timestamptz\n\n  request Request @relation(fields: [requestId], references: [id], onDelete: Cascade)\n\n  @@map(\"request_images\")\n}\n\nmodel RequestDraft {\n  id              String   @id @default(uuid()) @db.Uuid\n  buyerId         String   @map(\"buyer_id\") @db.Uuid\n  categoryId      String?  @map(\"category_id\") @db.Uuid\n  title           String?  @db.VarChar(255)\n  description     String?\n  budgetMin       Decimal? @map(\"budget_min\") @db.Decimal(12, 2)\n  budgetMax       Decimal? @map(\"budget_max\") @db.Decimal(12, 2)\n  locationLat     Decimal? @map(\"location_lat\") @db.Decimal(10, 8)\n  locationLng     Decimal? @map(\"location_lng\") @db.Decimal(11, 8)\n  locationAddress String?  @map(\"location_address\")\n  autoSaveData    Json     @default(\"{}\") @map(\"auto_save_data\")\n  expiresAt       DateTime @map(\"expires_at\") @db.Timestamptz\n  createdAt       DateTime @default(now()) @map(\"created_at\") @db.Timestamptz\n  updatedAt       DateTime @updatedAt @map(\"updated_at\") @db.Timestamptz\n\n  category RequestCategory? @relation(fields: [categoryId], references: [id])\n\n  @@map(\"request_drafts\")\n}\n\nmodel RequestExtension {\n  id                String   @id @default(uuid()) @db.Uuid\n  requestId         String   @map(\"request_id\") @db.Uuid\n  originalExpiresAt DateTime @map(\"original_expires_at\") @db.Timestamptz\n  newExpiresAt      DateTime @map(\"new_expires_at\") @db.Timestamptz\n  extensionReason   String?  @map(\"extension_reason\")\n  extendedBy        String?  @map(\"extended_by\") @db.Uuid\n  createdAt         DateTime @default(now()) @map(\"created_at\") @db.Timestamptz\n\n  request Request @relation(fields: [requestId], references: [id], onDelete: Cascade)\n\n  @@map(\"request_extensions\")\n}\n\nmodel RequestSearchIndex {\n  id           String   @id @default(uuid()) @db.Uuid\n  requestId    String   @unique @map(\"request_id\") @db.Uuid\n  searchVector String?  @map(\"search_vector\")\n  categoryPath String?  @map(\"category_path\")\n  locationText String?  @map(\"location_text\")\n  budgetRange  String?  @map(\"budget_range\")\n  createdAt    DateTime @default(now()) @map(\"created_at\") @db.Timestamptz\n\n  request Request @relation(fields: [requestId], references: [id], onDelete: Cascade)\n\n  @@map(\"request_search_index\")\n}\n\nmodel SavedSearch {\n  id             String   @id @default(uuid()) @db.Uuid\n  userId         String   @map(\"user_id\") @db.Uuid\n  name           String   @db.VarChar(255)\n  searchCriteria Json     @map(\"search_criteria\")\n  isActive       Boolean  @default(true) @map(\"is_active\")\n  createdAt      DateTime @default(now()) @map(\"created_at\") @db.Timestamptz\n  updatedAt      DateTime @updatedAt @map(\"updated_at\") @db.Timestamptz\n\n  @@map(\"saved_searches\")\n}\n\n// ─── Bidding enums ─────────────────────────────────────────────────────────\n\nenum BidStatus {\n  PENDING\n  ACCEPTED\n  REJECTED\n  EXPIRED\n  WITHDRAWN\n}\n\nenum AmountType {\n  FIXED\n  PERCENTAGE\n  RANGE\n}\n\n// ─── Bidding models ────────────────────────────────────────────────────────\n\nmodel Bid {\n  id            String    @id @default(uuid()) @db.Uuid\n  requestId     String    @map(\"request_id\") @db.Uuid\n  merchantId    String    @map(\"merchant_id\") @db.Uuid\n  amount        Decimal   @db.Decimal(12, 2)\n  deliveryDays  Int       @map(\"delivery_days\")\n  deliveryNotes String?   @map(\"delivery_notes\")\n  specialTerms  String?   @map(\"special_terms\")\n  status        BidStatus @default(PENDING)\n  priorityScore Int       @default(0) @map(\"priority_score\")\n  isTemplate    Boolean   @default(false) @map(\"is_template\")\n  templateName  String?   @map(\"template_name\") @db.VarChar(100)\n  bidFee        Decimal   @default(0.00) @map(\"bid_fee\") @db.Decimal(10, 2)\n  feePaid       Boolean   @default(false) @map(\"fee_paid\")\n  createdAt     DateTime  @default(now()) @map(\"created_at\") @db.Timestamptz\n  updatedAt     DateTime  @updatedAt @map(\"updated_at\") @db.Timestamptz\n  expiresAt     DateTime? @map(\"expires_at\") @db.Timestamptz\n  acceptedAt    DateTime? @map(\"accepted_at\") @db.Timestamptz\n  rejectedAt    DateTime? @map(\"rejected_at\") @db.Timestamptz\n  withdrawnAt   DateTime? @map(\"withdrawn_at\") @db.Timestamptz\n\n  @@unique([requestId, merchantId])\n  @@map(\"bids\")\n}\n\n// ─── Chat enums ────────────────────────────────────────────────────────────\n\nenum RoomType {\n  DIRECT\n  GROUP\n  REQUEST\n  BID\n  SUPPORT\n}\n\nenum ParticipantRole {\n  OWNER\n  ADMIN\n  MODERATOR\n  MEMBER\n}\n\n// ─── Chat models (rooms + participants in PostgreSQL) ──────────────────────\n// Messages are stored in MongoDB — see src/models/ChatMessage.js\n\nmodel ChatRoom {\n  id               String    @id @default(uuid()) @db.Uuid\n  name             String    @db.VarChar(255)\n  description      String?\n  type             RoomType  @default(DIRECT)\n  relatedRequestId String?   @map(\"related_request_id\") @db.Uuid\n  relatedBidId     String?   @map(\"related_bid_id\") @db.Uuid\n  createdBy        String    @map(\"created_by\") @db.Uuid\n  isActive         Boolean   @default(true) @map(\"is_active\")\n  maxParticipants  Int       @default(100) @map(\"max_participants\")\n  lastMessageAt    DateTime? @map(\"last_message_at\") @db.Timestamptz\n  createdAt        DateTime  @default(now()) @map(\"created_at\") @db.Timestamptz\n  updatedAt        DateTime  @updatedAt @map(\"updated_at\") @db.Timestamptz\n\n  participants ChatParticipant[]\n\n  @@map(\"chat_rooms\")\n}\n\nmodel ChatParticipant {\n  id           String          @id @default(uuid()) @db.Uuid\n  roomId       String          @map(\"room_id\") @db.Uuid\n  userId       String          @map(\"user_id\") @db.Uuid\n  role         ParticipantRole @default(MEMBER)\n  joinedAt     DateTime        @default(now()) @map(\"joined_at\") @db.Timestamptz\n  lastReadAt   DateTime?       @map(\"last_read_at\") @db.Timestamptz\n  isMuted      Boolean         @default(false) @map(\"is_muted\")\n  isBanned     Boolean         @default(false) @map(\"is_banned\")\n  bannedUntil  DateTime?       @map(\"banned_until\") @db.Timestamptz\n  bannedBy     String?         @map(\"banned_by\") @db.Uuid\n  bannedReason String?         @map(\"banned_reason\")\n  leftAt       DateTime?       @map(\"left_at\") @db.Timestamptz\n\n  room ChatRoom @relation(fields: [roomId], references: [id], onDelete: Cascade)\n\n  @@unique([roomId, userId])\n  @@map(\"chat_participants\")\n}\n\n// ─── Notification enums ────────────────────────────────────────────────────\n\nenum NotificationType {\n  SYSTEM\n  REQUEST\n  BID\n  PAYMENT\n  CHAT\n  SUBSCRIPTION\n  SECURITY\n  MARKETING\n\n  @@map(\"notification_type\")\n}\n\nenum NotifChannel {\n  IN_APP\n  PUSH\n  EMAIL\n  SMS\n  WEBHOOK\n\n  @@map(\"notification_channel\")\n}\n\nenum NotificationPriority {\n  LOW\n  NORMAL\n  HIGH\n  URGENT\n\n  @@map(\"notification_priority\")\n}\n\nenum NotificationStatus {\n  PENDING\n  PROCESSING\n  SENT\n  DELIVERED\n  FAILED\n  EXPIRED\n  READ\n\n  @@map(\"notification_status\")\n}\n\nenum NotifDeliveryStatus {\n  PENDING\n  PROCESSING\n  SENT\n  DELIVERED\n  FAILED\n  BOUNCED\n\n  @@map(\"notif_delivery_status\")\n}\n\nenum NotifAnalyticsEvent {\n  SENT\n  DELIVERED\n  READ\n  FAILED\n  BOUNCED\n  CLICKED\n  DISMISSED\n\n  @@map(\"notif_analytics_event\")\n}\n\n// ─── Notification models ───────────────────────────────────────────────────\n\nmodel NotificationTemplate {\n  id              String           @id @default(uuid()) @db.Uuid\n  name            String           @db.VarChar(100)\n  type            NotificationType\n  channel         NotifChannel\n  subjectTemplate String?          @map(\"subject_template\") @db.VarChar(500)\n  contentTemplate String           @map(\"content_template\")\n  variables       Json             @default(\"{}\")\n  defaultLocale   String           @default(\"en\") @map(\"default_locale\") @db.VarChar(10)\n  isActive        Boolean          @default(true) @map(\"is_active\")\n  version         Int              @default(1)\n  createdBy       String?          @map(\"created_by\") @db.Uuid\n  createdAt       DateTime         @default(now()) @map(\"created_at\") @db.Timestamptz\n  updatedAt       DateTime         @updatedAt @map(\"updated_at\") @db.Timestamptz\n\n  notifications Notification[]\n\n  @@map(\"notification_templates\")\n}\n\nmodel Notification {\n  id                String               @id @default(uuid()) @db.Uuid\n  userId            String               @map(\"user_id\") @db.Uuid\n  type              NotificationType\n  title             String               @db.VarChar(255)\n  content           String\n  channel           NotifChannel         @default(IN_APP)\n  priority          NotificationPriority @default(NORMAL)\n  status            NotificationStatus   @default(PENDING)\n  templateId        String?              @map(\"template_id\") @db.Uuid\n  templateVariables Json                 @default(\"{}\") @map(\"template_variables\")\n  metadata          Json                 @default(\"{}\")\n  scheduledAt       DateTime?            @map(\"scheduled_at\") @db.Timestamptz\n  sentAt            DateTime?            @map(\"sent_at\") @db.Timestamptz\n  deliveredAt       DateTime?            @map(\"delivered_at\") @db.Timestamptz\n  readAt            DateTime?            @map(\"read_at\") @db.Timestamptz\n  expiresAt         DateTime?            @map(\"expires_at\") @db.Timestamptz\n  createdAt         DateTime             @default(now()) @map(\"created_at\") @db.Timestamptz\n  updatedAt         DateTime             @updatedAt @map(\"updated_at\") @db.Timestamptz\n\n  template   NotificationTemplate?  @relation(fields: [templateId], references: [id])\n  deliveries NotificationDelivery[]\n  reads      NotificationRead[]\n  analytics  NotificationStat[]\n\n  @@map(\"notifications\")\n}\n\nmodel NotificationChannel {\n  id           String       @id @default(uuid()) @db.Uuid\n  userId       String       @map(\"user_id\") @db.Uuid\n  channelType  NotifChannel @map(\"channel_type\")\n  isEnabled    Boolean      @default(true) @map(\"is_enabled\")\n  deviceToken  String?      @map(\"device_token\") @db.VarChar(500)\n  emailAddress String?      @map(\"email_address\") @db.VarChar(255)\n  phoneNumber  String?      @map(\"phone_number\") @db.VarChar(20)\n  preferences  Json         @default(\"{}\")\n  lastUsedAt   DateTime?    @map(\"last_used_at\") @db.Timestamptz\n  verifiedAt   DateTime?    @map(\"verified_at\") @db.Timestamptz\n  createdAt    DateTime     @default(now()) @map(\"created_at\") @db.Timestamptz\n  updatedAt    DateTime     @updatedAt @map(\"updated_at\") @db.Timestamptz\n\n  @@unique([userId, channelType])\n  @@map(\"notification_channels\")\n}\n\nmodel NotificationPreference {\n  id                  String                @id @default(uuid()) @db.Uuid\n  userId              String                @map(\"user_id\") @db.Uuid\n  notificationType    NotificationType      @map(\"notification_type\")\n  channelType         NotifChannel          @map(\"channel_type\")\n  isEnabled           Boolean               @default(true) @map(\"is_enabled\")\n  quietHoursStart     String?               @map(\"quiet_hours_start\")\n  quietHoursEnd       String?               @map(\"quiet_hours_end\")\n  minPriority         NotificationPriority? @map(\"min_priority\")\n  maxFrequencyMinutes Int?                  @map(\"max_frequency_minutes\")\n  preferences         Json                  @default(\"{}\")\n  createdAt           DateTime              @default(now()) @map(\"created_at\") @db.Timestamptz\n  updatedAt           DateTime              @updatedAt @map(\"updated_at\") @db.Timestamptz\n\n  @@unique([userId, notificationType, channelType])\n  @@map(\"notification_preferences\")\n}\n\nmodel NotificationDelivery {\n  id             String              @id @default(uuid()) @db.Uuid\n  notificationId String              @map(\"notification_id\") @db.Uuid\n  channelType    NotifChannel        @map(\"channel_type\")\n  provider       String              @db.VarChar(100)\n  recipient      String              @db.VarChar(500)\n  status         NotifDeliveryStatus @default(PENDING)\n  attemptCount   Int                 @default(0) @map(\"attempt_count\")\n  sentAt         DateTime?           @map(\"sent_at\") @db.Timestamptz\n  deliveredAt    DateTime?           @map(\"delivered_at\") @db.Timestamptz\n  errorMessage   String?             @map(\"error_message\")\n  errorCode      String?             @map(\"error_code\") @db.VarChar(100)\n  metadata       Json                @default(\"{}\")\n  createdAt      DateTime            @default(now()) @map(\"created_at\") @db.Timestamptz\n\n  notification Notification @relation(fields: [notificationId], references: [id], onDelete: Cascade)\n\n  @@map(\"notification_deliveries\")\n}\n\nmodel NotificationRead {\n  id                String   @id @default(uuid()) @db.Uuid\n  notificationId    String   @map(\"notification_id\") @db.Uuid\n  userId            String   @map(\"user_id\") @db.Uuid\n  readAt            DateTime @default(now()) @map(\"read_at\") @db.Timestamptz\n  deviceFingerprint String?  @map(\"device_fingerprint\") @db.VarChar(255)\n  ipAddress         String?  @map(\"ip_address\")\n  userAgent         String?  @map(\"user_agent\")\n  createdAt         DateTime @default(now()) @map(\"created_at\") @db.Timestamptz\n\n  notification Notification @relation(fields: [notificationId], references: [id], onDelete: Cascade)\n\n  @@unique([notificationId, userId])\n  @@map(\"notification_reads\")\n}\n\nmodel NotificationStat {\n  id             String              @id @default(uuid()) @db.Uuid\n  notificationId String?             @map(\"notification_id\") @db.Uuid\n  userId         String?             @map(\"user_id\") @db.Uuid\n  eventType      NotifAnalyticsEvent @map(\"event_type\")\n  channelType    NotifChannel        @map(\"channel_type\")\n  provider       String?             @db.VarChar(100)\n  deliveryTimeMs Int?                @map(\"delivery_time_ms\")\n  success        Boolean\n  errorCode      String?             @map(\"error_code\") @db.VarChar(100)\n  metadata       Json                @default(\"{}\")\n  createdAt      DateTime            @default(now()) @map(\"created_at\") @db.Timestamptz\n\n  notification Notification? @relation(fields: [notificationId], references: [id], onDelete: SetNull)\n\n  @@map(\"notification_analytics\")\n}\n\n// ─── Bidding models ────────────────────────────────────────────────────────\n\nmodel BidTemplate {\n  id               String     @id @default(uuid()) @db.Uuid\n  merchantId       String     @map(\"merchant_id\") @db.Uuid\n  name             String     @db.VarChar(100)\n  description      String?\n  amountType       AmountType @default(FIXED) @map(\"amount_type\")\n  amountPercentage Decimal?   @map(\"amount_percentage\") @db.Decimal(5, 2)\n  fixedAmount      Decimal?   @map(\"fixed_amount\") @db.Decimal(12, 2)\n  deliveryDays     Int?       @map(\"delivery_days\")\n  deliveryNotes    String?    @map(\"delivery_notes\")\n  specialTerms     String?    @map(\"special_terms\")\n  isActive         Boolean    @default(true) @map(\"is_active\")\n  usageCount       Int        @default(0) @map(\"usage_count\")\n  successCount     Int        @default(0) @map(\"success_count\")\n  createdAt        DateTime   @default(now()) @map(\"created_at\") @db.Timestamptz\n  updatedAt        DateTime   @updatedAt @map(\"updated_at\") @db.Timestamptz\n\n  @@map(\"bid_templates\")\n}\n",
  "inlineSchemaHash": "76391e8ebd4244cf8fa6ebc50b4018863585b5cd113c6ebde3831a2d746464e8",
  "copyEngine": true
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "src/prisma/generated2",
    "prisma/generated2",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"dbName\":\"users\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"role\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"UserRole\",\"default\":\"BUYER\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"UserStatus\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phoneVerified\",\"dbName\":\"phone_verified\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"lastLoginAt\",\"dbName\":\"last_login_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"failedLoginAttempts\",\"dbName\":\"failed_login_attempts\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lockedUntil\",\"dbName\":\"locked_until\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"adminSubRole\",\"dbName\":\"admin_sub_role\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AdminSubRole\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"profile\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserProfile\",\"relationName\":\"UserToUserProfile\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"authTokens\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AuthToken\",\"relationName\":\"AuthTokenToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UserProfile\":{\"dbName\":\"user_profiles\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"firstName\",\"dbName\":\"first_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastName\",\"dbName\":\"last_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"profileImageUrl\",\"dbName\":\"profile_image_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"locationLat\",\"dbName\":\"location_lat\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"locationLng\",\"dbName\":\"location_lng\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"city\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"country\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"preferences\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Json\",\"default\":\"{}\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"UserToUserProfile\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"AuthToken\":{\"dbName\":\"auth_tokens\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tokenType\",\"dbName\":\"token_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"TokenType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tokenHash\",\"dbName\":\"token_hash\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deviceFingerprint\",\"dbName\":\"device_fingerprint\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ipAddress\",\"dbName\":\"ip_address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userAgent\",\"dbName\":\"user_agent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expiresAt\",\"dbName\":\"expires_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastUsedAt\",\"dbName\":\"last_used_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"revokedAt\",\"dbName\":\"revoked_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"AuthTokenToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"RequestCategory\":{\"dbName\":\"request_categories\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"slug\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"parentId\",\"dbName\":\"parent_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"iconUrl\",\"dbName\":\"icon_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"dbName\":\"is_active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sortOrder\",\"dbName\":\"sort_order\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"parent\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"RequestCategory\",\"relationName\":\"CategoryTree\",\"relationFromFields\":[\"parentId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"children\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"RequestCategory\",\"relationName\":\"CategoryTree\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"requests\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Request\",\"relationName\":\"RequestToRequestCategory\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"drafts\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"RequestDraft\",\"relationName\":\"RequestCategoryToRequestDraft\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Request\":{\"dbName\":\"requests\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"buyerId\",\"dbName\":\"buyer_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"categoryId\",\"dbName\":\"category_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"budgetMin\",\"dbName\":\"budget_min\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"budgetMax\",\"dbName\":\"budget_max\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"locationLat\",\"dbName\":\"location_lat\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"locationLng\",\"dbName\":\"location_lng\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"locationAddress\",\"dbName\":\"location_address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"locationCity\",\"dbName\":\"location_city\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"locationCountry\",\"dbName\":\"location_country\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"RequestStatus\",\"default\":\"DRAFT\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"priorityScore\",\"dbName\":\"priority_score\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bidCount\",\"dbName\":\"bid_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"viewCount\",\"dbName\":\"view_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expiresAt\",\"dbName\":\"expires_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"publishedAt\",\"dbName\":\"published_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"category\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"RequestCategory\",\"relationName\":\"RequestToRequestCategory\",\"relationFromFields\":[\"categoryId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"images\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"RequestImage\",\"relationName\":\"RequestToRequestImage\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"extensions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"RequestExtension\",\"relationName\":\"RequestToRequestExtension\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"searchIndex\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"RequestSearchIndex\",\"relationName\":\"RequestToRequestSearchIndex\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"RequestImage\":{\"dbName\":\"request_images\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"requestId\",\"dbName\":\"request_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imageUrl\",\"dbName\":\"image_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"thumbnailUrl\",\"dbName\":\"thumbnail_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"originalFilename\",\"dbName\":\"original_filename\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fileSize\",\"dbName\":\"file_size\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"mimeType\",\"dbName\":\"mime_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"width\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"height\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sortOrder\",\"dbName\":\"sort_order\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isPrimary\",\"dbName\":\"is_primary\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"request\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Request\",\"relationName\":\"RequestToRequestImage\",\"relationFromFields\":[\"requestId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"RequestDraft\":{\"dbName\":\"request_drafts\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"buyerId\",\"dbName\":\"buyer_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"categoryId\",\"dbName\":\"category_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"budgetMin\",\"dbName\":\"budget_min\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"budgetMax\",\"dbName\":\"budget_max\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"locationLat\",\"dbName\":\"location_lat\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"locationLng\",\"dbName\":\"location_lng\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"locationAddress\",\"dbName\":\"location_address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"autoSaveData\",\"dbName\":\"auto_save_data\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Json\",\"default\":\"{}\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expiresAt\",\"dbName\":\"expires_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"category\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"RequestCategory\",\"relationName\":\"RequestCategoryToRequestDraft\",\"relationFromFields\":[\"categoryId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"RequestExtension\":{\"dbName\":\"request_extensions\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"requestId\",\"dbName\":\"request_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"originalExpiresAt\",\"dbName\":\"original_expires_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"newExpiresAt\",\"dbName\":\"new_expires_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"extensionReason\",\"dbName\":\"extension_reason\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"extendedBy\",\"dbName\":\"extended_by\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"request\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Request\",\"relationName\":\"RequestToRequestExtension\",\"relationFromFields\":[\"requestId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"RequestSearchIndex\":{\"dbName\":\"request_search_index\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"requestId\",\"dbName\":\"request_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"searchVector\",\"dbName\":\"search_vector\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"categoryPath\",\"dbName\":\"category_path\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"locationText\",\"dbName\":\"location_text\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"budgetRange\",\"dbName\":\"budget_range\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"request\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Request\",\"relationName\":\"RequestToRequestSearchIndex\",\"relationFromFields\":[\"requestId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"SavedSearch\":{\"dbName\":\"saved_searches\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"searchCriteria\",\"dbName\":\"search_criteria\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"dbName\":\"is_active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Bid\":{\"dbName\":\"bids\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"requestId\",\"dbName\":\"request_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"merchantId\",\"dbName\":\"merchant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryDays\",\"dbName\":\"delivery_days\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryNotes\",\"dbName\":\"delivery_notes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"specialTerms\",\"dbName\":\"special_terms\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BidStatus\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"priorityScore\",\"dbName\":\"priority_score\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isTemplate\",\"dbName\":\"is_template\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"templateName\",\"dbName\":\"template_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bidFee\",\"dbName\":\"bid_fee\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"feePaid\",\"dbName\":\"fee_paid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"expiresAt\",\"dbName\":\"expires_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"acceptedAt\",\"dbName\":\"accepted_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rejectedAt\",\"dbName\":\"rejected_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"withdrawnAt\",\"dbName\":\"withdrawn_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"requestId\",\"merchantId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"requestId\",\"merchantId\"]}],\"isGenerated\":false},\"ChatRoom\":{\"dbName\":\"chat_rooms\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"RoomType\",\"default\":\"DIRECT\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"relatedRequestId\",\"dbName\":\"related_request_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"relatedBidId\",\"dbName\":\"related_bid_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdBy\",\"dbName\":\"created_by\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"dbName\":\"is_active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"maxParticipants\",\"dbName\":\"max_participants\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":100,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastMessageAt\",\"dbName\":\"last_message_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"participants\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ChatParticipant\",\"relationName\":\"ChatParticipantToChatRoom\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ChatParticipant\":{\"dbName\":\"chat_participants\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"roomId\",\"dbName\":\"room_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"role\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ParticipantRole\",\"default\":\"MEMBER\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"joinedAt\",\"dbName\":\"joined_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastReadAt\",\"dbName\":\"last_read_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isMuted\",\"dbName\":\"is_muted\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isBanned\",\"dbName\":\"is_banned\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bannedUntil\",\"dbName\":\"banned_until\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bannedBy\",\"dbName\":\"banned_by\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bannedReason\",\"dbName\":\"banned_reason\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leftAt\",\"dbName\":\"left_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"room\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ChatRoom\",\"relationName\":\"ChatParticipantToChatRoom\",\"relationFromFields\":[\"roomId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"roomId\",\"userId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"roomId\",\"userId\"]}],\"isGenerated\":false},\"NotificationTemplate\":{\"dbName\":\"notification_templates\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"NotificationType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"channel\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"NotifChannel\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subjectTemplate\",\"dbName\":\"subject_template\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contentTemplate\",\"dbName\":\"content_template\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"variables\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Json\",\"default\":\"{}\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"defaultLocale\",\"dbName\":\"default_locale\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"en\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"dbName\":\"is_active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"version\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdBy\",\"dbName\":\"created_by\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"notifications\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Notification\",\"relationName\":\"NotificationToNotificationTemplate\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Notification\":{\"dbName\":\"notifications\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"NotificationType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"channel\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"NotifChannel\",\"default\":\"IN_APP\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"priority\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"NotificationPriority\",\"default\":\"NORMAL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"NotificationStatus\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"templateId\",\"dbName\":\"template_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"templateVariables\",\"dbName\":\"template_variables\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Json\",\"default\":\"{}\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Json\",\"default\":\"{}\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"scheduledAt\",\"dbName\":\"scheduled_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sentAt\",\"dbName\":\"sent_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveredAt\",\"dbName\":\"delivered_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"readAt\",\"dbName\":\"read_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expiresAt\",\"dbName\":\"expires_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"template\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"NotificationTemplate\",\"relationName\":\"NotificationToNotificationTemplate\",\"relationFromFields\":[\"templateId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveries\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"NotificationDelivery\",\"relationName\":\"NotificationToNotificationDelivery\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reads\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"NotificationRead\",\"relationName\":\"NotificationToNotificationRead\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"analytics\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"NotificationStat\",\"relationName\":\"NotificationToNotificationStat\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"NotificationChannel\":{\"dbName\":\"notification_channels\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"channelType\",\"dbName\":\"channel_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"NotifChannel\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isEnabled\",\"dbName\":\"is_enabled\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deviceToken\",\"dbName\":\"device_token\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"emailAddress\",\"dbName\":\"email_address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phoneNumber\",\"dbName\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"preferences\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Json\",\"default\":\"{}\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastUsedAt\",\"dbName\":\"last_used_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"verifiedAt\",\"dbName\":\"verified_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[[\"userId\",\"channelType\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"channelType\"]}],\"isGenerated\":false},\"NotificationPreference\":{\"dbName\":\"notification_preferences\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notificationType\",\"dbName\":\"notification_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"NotificationType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"channelType\",\"dbName\":\"channel_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"NotifChannel\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isEnabled\",\"dbName\":\"is_enabled\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quietHoursStart\",\"dbName\":\"quiet_hours_start\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quietHoursEnd\",\"dbName\":\"quiet_hours_end\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"minPriority\",\"dbName\":\"min_priority\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"NotificationPriority\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"maxFrequencyMinutes\",\"dbName\":\"max_frequency_minutes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"preferences\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Json\",\"default\":\"{}\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[[\"userId\",\"notificationType\",\"channelType\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"notificationType\",\"channelType\"]}],\"isGenerated\":false},\"NotificationDelivery\":{\"dbName\":\"notification_deliveries\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notificationId\",\"dbName\":\"notification_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"channelType\",\"dbName\":\"channel_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"NotifChannel\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"provider\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"recipient\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"NotifDeliveryStatus\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"attemptCount\",\"dbName\":\"attempt_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sentAt\",\"dbName\":\"sent_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveredAt\",\"dbName\":\"delivered_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"errorMessage\",\"dbName\":\"error_message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"errorCode\",\"dbName\":\"error_code\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Json\",\"default\":\"{}\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notification\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Notification\",\"relationName\":\"NotificationToNotificationDelivery\",\"relationFromFields\":[\"notificationId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"NotificationRead\":{\"dbName\":\"notification_reads\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notificationId\",\"dbName\":\"notification_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"readAt\",\"dbName\":\"read_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deviceFingerprint\",\"dbName\":\"device_fingerprint\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ipAddress\",\"dbName\":\"ip_address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userAgent\",\"dbName\":\"user_agent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notification\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Notification\",\"relationName\":\"NotificationToNotificationRead\",\"relationFromFields\":[\"notificationId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"notificationId\",\"userId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"notificationId\",\"userId\"]}],\"isGenerated\":false},\"NotificationStat\":{\"dbName\":\"notification_analytics\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notificationId\",\"dbName\":\"notification_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"eventType\",\"dbName\":\"event_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"NotifAnalyticsEvent\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"channelType\",\"dbName\":\"channel_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"NotifChannel\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"provider\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryTimeMs\",\"dbName\":\"delivery_time_ms\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"success\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"errorCode\",\"dbName\":\"error_code\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Json\",\"default\":\"{}\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notification\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Notification\",\"relationName\":\"NotificationToNotificationStat\",\"relationFromFields\":[\"notificationId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"SetNull\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"BidTemplate\":{\"dbName\":\"bid_templates\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"merchantId\",\"dbName\":\"merchant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amountType\",\"dbName\":\"amount_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"AmountType\",\"default\":\"FIXED\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amountPercentage\",\"dbName\":\"amount_percentage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fixedAmount\",\"dbName\":\"fixed_amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryDays\",\"dbName\":\"delivery_days\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryNotes\",\"dbName\":\"delivery_notes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"specialTerms\",\"dbName\":\"special_terms\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"dbName\":\"is_active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"usageCount\",\"dbName\":\"usage_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"successCount\",\"dbName\":\"success_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"UserRole\":{\"values\":[{\"name\":\"BUYER\",\"dbName\":null},{\"name\":\"MERCHANT\",\"dbName\":null},{\"name\":\"ADMIN\",\"dbName\":null}],\"dbName\":null},\"UserStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"BANNED\",\"dbName\":null},{\"name\":\"SUSPENDED\",\"dbName\":null}],\"dbName\":null},\"TokenType\":{\"values\":[{\"name\":\"ACCESS\",\"dbName\":null},{\"name\":\"REFRESH\",\"dbName\":null}],\"dbName\":null},\"AdminActionType\":{\"values\":[{\"name\":\"USER_VIEW\",\"dbName\":null},{\"name\":\"USER_EDIT\",\"dbName\":null},{\"name\":\"USER_SUSPEND\",\"dbName\":null},{\"name\":\"USER_BAN\",\"dbName\":null},{\"name\":\"USER_DELETE\",\"dbName\":null},{\"name\":\"USER_BULK_ACTION\",\"dbName\":null},{\"name\":\"ADMIN_ADD\",\"dbName\":null},{\"name\":\"ADMIN_EDIT\",\"dbName\":null},{\"name\":\"ADMIN_REMOVE\",\"dbName\":null},{\"name\":\"SYSTEM_CONFIG_CHANGE\",\"dbName\":null},{\"name\":\"EXPORT_DATA\",\"dbName\":null},{\"name\":\"IMPORT_DATA\",\"dbName\":null},{\"name\":\"SECURITY_ALERT\",\"dbName\":null},{\"name\":\"SESSION_TERMINATE\",\"dbName\":null},{\"name\":\"PASSWORD_RESET\",\"dbName\":null},{\"name\":\"VERIFICATION_OVERRIDE\",\"dbName\":null}],\"dbName\":null},\"AdminSubRole\":{\"values\":[{\"name\":\"SUPER_ADMIN\",\"dbName\":null},{\"name\":\"ADMIN\",\"dbName\":null},{\"name\":\"SUPPORT\",\"dbName\":null}],\"dbName\":null},\"RequestStatus\":{\"values\":[{\"name\":\"DRAFT\",\"dbName\":null},{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"HAS_BIDS\",\"dbName\":null},{\"name\":\"COMPLETED\",\"dbName\":null},{\"name\":\"CANCELLED\",\"dbName\":null},{\"name\":\"EXPIRED\",\"dbName\":null}],\"dbName\":null},\"BidStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"ACCEPTED\",\"dbName\":null},{\"name\":\"REJECTED\",\"dbName\":null},{\"name\":\"EXPIRED\",\"dbName\":null},{\"name\":\"WITHDRAWN\",\"dbName\":null}],\"dbName\":null},\"AmountType\":{\"values\":[{\"name\":\"FIXED\",\"dbName\":null},{\"name\":\"PERCENTAGE\",\"dbName\":null},{\"name\":\"RANGE\",\"dbName\":null}],\"dbName\":null},\"RoomType\":{\"values\":[{\"name\":\"DIRECT\",\"dbName\":null},{\"name\":\"GROUP\",\"dbName\":null},{\"name\":\"REQUEST\",\"dbName\":null},{\"name\":\"BID\",\"dbName\":null},{\"name\":\"SUPPORT\",\"dbName\":null}],\"dbName\":null},\"ParticipantRole\":{\"values\":[{\"name\":\"OWNER\",\"dbName\":null},{\"name\":\"ADMIN\",\"dbName\":null},{\"name\":\"MODERATOR\",\"dbName\":null},{\"name\":\"MEMBER\",\"dbName\":null}],\"dbName\":null},\"NotificationType\":{\"values\":[{\"name\":\"SYSTEM\",\"dbName\":null},{\"name\":\"REQUEST\",\"dbName\":null},{\"name\":\"BID\",\"dbName\":null},{\"name\":\"PAYMENT\",\"dbName\":null},{\"name\":\"CHAT\",\"dbName\":null},{\"name\":\"SUBSCRIPTION\",\"dbName\":null},{\"name\":\"SECURITY\",\"dbName\":null},{\"name\":\"MARKETING\",\"dbName\":null}],\"dbName\":\"notification_type\"},\"NotifChannel\":{\"values\":[{\"name\":\"IN_APP\",\"dbName\":null},{\"name\":\"PUSH\",\"dbName\":null},{\"name\":\"EMAIL\",\"dbName\":null},{\"name\":\"SMS\",\"dbName\":null},{\"name\":\"WEBHOOK\",\"dbName\":null}],\"dbName\":\"notification_channel\"},\"NotificationPriority\":{\"values\":[{\"name\":\"LOW\",\"dbName\":null},{\"name\":\"NORMAL\",\"dbName\":null},{\"name\":\"HIGH\",\"dbName\":null},{\"name\":\"URGENT\",\"dbName\":null}],\"dbName\":\"notification_priority\"},\"NotificationStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"PROCESSING\",\"dbName\":null},{\"name\":\"SENT\",\"dbName\":null},{\"name\":\"DELIVERED\",\"dbName\":null},{\"name\":\"FAILED\",\"dbName\":null},{\"name\":\"EXPIRED\",\"dbName\":null},{\"name\":\"READ\",\"dbName\":null}],\"dbName\":\"notification_status\"},\"NotifDeliveryStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"PROCESSING\",\"dbName\":null},{\"name\":\"SENT\",\"dbName\":null},{\"name\":\"DELIVERED\",\"dbName\":null},{\"name\":\"FAILED\",\"dbName\":null},{\"name\":\"BOUNCED\",\"dbName\":null}],\"dbName\":\"notif_delivery_status\"},\"NotifAnalyticsEvent\":{\"values\":[{\"name\":\"SENT\",\"dbName\":null},{\"name\":\"DELIVERED\",\"dbName\":null},{\"name\":\"READ\",\"dbName\":null},{\"name\":\"FAILED\",\"dbName\":null},{\"name\":\"BOUNCED\",\"dbName\":null},{\"name\":\"CLICKED\",\"dbName\":null},{\"name\":\"DISMISSED\",\"dbName\":null}],\"dbName\":\"notif_analytics_event\"}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined


const { warnEnvConflicts } = require('./runtime/library.js')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
})

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-linux-musl-openssl-3.0.x.so.node");
path.join(process.cwd(), "src/prisma/generated2/libquery_engine-linux-musl-openssl-3.0.x.so.node")

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-debian-openssl-3.0.x.so.node");
path.join(process.cwd(), "src/prisma/generated2/libquery_engine-debian-openssl-3.0.x.so.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "src/prisma/generated2/schema.prisma")
