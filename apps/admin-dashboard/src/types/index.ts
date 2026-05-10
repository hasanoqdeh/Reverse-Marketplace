// User and Role Types
export interface User {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  SUPPORT_AGENT = 'SUPPORT_AGENT',
  FINANCE_MANAGER = 'FINANCE_MANAGER',
  OPERATIONS_MANAGER = 'OPERATIONS_MANAGER',
  SYSTEM_VIEWER = 'SYSTEM_VIEWER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED',
  PENDING = 'PENDING',
}

// Marketplace Types
export interface BuyerRequest {
  id: string;
  buyerId: string;
  categoryId: string;
  title: string;
  description: string;
  locationId: string;
  locationName: string;
  status: RequestStatus;
  bidCount: number;
  lowestBid?: number;
  createdAt: string;
  updatedAt: string;
  images: RequestImage[];
  buyer?: Buyer;
}

export interface Buyer {
  id: string;
  phone: string;
  email?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Merchant {
  id: string;
  phone: string;
  businessName: string;
  email: string;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  subscriptionPlan: string;
  rating: number;
  totalDeals: number;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: string;
  requestId: string;
  merchantId: string;
  price: number;
  currency: string;
  deliveryTime: number;
  description: string;
  warranty: boolean;
  status: BidStatus;
  createdAt: string;
  updatedAt: string;
  merchant?: Merchant;
  request?: BuyerRequest;
}

export interface Deal {
  id: string;
  requestId: string;
  bidId: string;
  buyerId: string;
  merchantId: string;
  status: DealStatus;
  finalPrice: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  buyerRequest?: BuyerRequest;
  acceptedBid?: Bid;
}

export interface RequestImage {
  id: string;
  requestId: string;
  imageUrl: string;
  thumbnailUrl: string;
  sortOrder: number;
}

// Payment Types
export interface Wallet {
  id: string;
  merchantId: string;
  balance: number;
  currency: string;
  totalEarnings: number;
  pendingEarnings: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  referenceId?: string;
  createdAt: string;
  status: TransactionStatus;
}

export interface Revenue {
  daily: number;
  monthly: number;
  yearly: number;
  subscriptionRevenue: number;
  bidFees: number;
  totalRevenue: number;
}

// Dispute Types
export interface Dispute {
  id: string;
  dealId: string;
  buyerId: string;
  merchantId: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  createdAt: string;
  updatedAt: string;
  resolution?: DisputeResolution;
  evidence: DisputeEvidence[];
}

export interface DisputeEvidence {
  id: string;
  disputeId: string;
  type: EvidenceType;
  url: string;
  description: string;
  uploadedBy: string;
  createdAt: string;
}

export interface DisputeResolution {
  action: ResolutionAction;
  description: string;
  resolvedBy: string;
  resolvedAt: string;
  refundAmount?: number;
}

// Analytics Types
export interface MarketplaceAnalytics {
  activeUsers: number;
  activeRequests: number;
  conversionRate: number;
  averageBidPrice: number;
  totalRevenue: number;
  categoryTrends: CategoryTrend[];
  geographicData: GeographicData[];
  merchantVsBuyerRatio: {
    merchants: number;
    buyers: number;
  };
}

export interface CategoryTrend {
  category: string;
  count: number;
  growth: number;
  revenue: number;
}

export interface GeographicData {
  location: string;
  requestCount: number;
  bidCount: number;
  averageBidPrice: number;
  lat: number;
  lng: number;
}

// System Health Types
export interface ServiceHealth {
  serviceName: string;
  status: ServiceStatus;
  responseTime: number;
  errorRate: number;
  uptime: number;
  lastChecked: string;
  dependencies?: string[];
}

export interface SystemMetrics {
  totalRequests: number;
  errorRate: number;
  averageResponseTime: number;
  activeConnections: number;
  queueDepth: number;
  databaseLoad: number;
  redisMemory: number;
  rabbitmqQueues: QueueInfo[];
}

export interface QueueInfo {
  name: string;
  messages: number;
  consumers: number;
  rate: number;
}

// Audit Types
export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: AuditSeverity;
}

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  description: string;
  severity: SecuritySeverity;
  userId?: string;
  ipAddress: string;
  timestamp: string;
  resolved: boolean;
}

// Enums
export enum RequestStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum BidStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
  EXPIRED = 'EXPIRED',
  AUTO_REJECTED = 'AUTO_REJECTED',
}

export enum DealStatus {
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  FEE = 'FEE',
  REFUND = 'REFUND',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum EvidenceType {
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  MESSAGE = 'MESSAGE',
  VIDEO = 'VIDEO',
}

export enum ResolutionAction {
  REFUND_BUYER = 'REFUND_BUYER',
  PAY_MERCHANT = 'PAY_MERCHANT',
  PARTIAL_REFUND = 'PARTIAL_REFUND',
  BAN_MERCHANT = 'BAN_MERCHANT',
  BAN_BUYER = 'BAN_BUYER',
  NO_ACTION = 'NO_ACTION',
}

export enum ServiceStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  UNHEALTHY = 'UNHEALTHY',
  DOWN = 'DOWN',
}

export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  BAN = 'BAN',
  UNBAN = 'UNBAN',
  REFUND = 'REFUND',
  VIEW = 'VIEW',
}

export enum AuditSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum SecurityEventType {
  FAILED_LOGIN = 'FAILED_LOGIN',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  DATA_BREACH = 'DATA_BREACH',
  MALICIOUS_REQUEST = 'MALICIOUS_REQUEST',
}

export enum SecuritySeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Socket Events
export interface SocketEvent {
  type: SocketEventType;
  data: any;
  timestamp: string;
}

export enum SocketEventType {
  NEW_REQUEST = 'NEW_REQUEST',
  BID_SUBMITTED = 'BID_SUBMITTED',
  BID_ACCEPTED = 'BID_ACCEPTED',
  BID_REJECTED = 'BID_REJECTED',
  DEAL_COMPLETED = 'DEAL_COMPLETED',
  DISPUTE_OPENED = 'DISPUTE_OPENED',
  USER_BANNED = 'USER_BANNED',
  SERVICE_DOWN = 'SERVICE_DOWN',
  HIGH_LATENCY = 'HIGH_LATENCY',
  PAYMENT_FAILURE = 'PAYMENT_FAILURE',
}

// Filter and Search Types
export interface RequestFilters {
  status?: RequestStatus;
  categoryId?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  verificationStatus?: VerificationStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface BidFilters {
  status?: BidStatus;
  merchantId?: string;
  requestId?: string;
  dateFrom?: string;
  dateTo?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface DisputeFilters {
  status?: DisputeStatus;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// Chart Data Types
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  label?: string;
}

// Configuration Types
export interface SystemConfig {
  id: string;
  key: string;
  value: any;
  type: ConfigType;
  description: string;
  category: string;
  isPublic: boolean;
  updatedBy: string;
  updatedAt: string;
}

export enum ConfigType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage?: number;
  conditions?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
