export interface AuthLoginResponse {
  message: string;
  otpExpiresAt?: string;
  expiresAt?: string;
}

export interface AuthVerifyOTPResponse {
  success: boolean;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: User;
}

export interface AuthResendOTPResponse {
  message: string;
  otpExpiresAt?: string;
  expiresAt?: string;
}

export interface AuthRefreshTokenResponse {
  success: boolean;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface AuthLogoutResponse {
  message: string;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
  city?: string;
  country?: string;
}

export interface User {
  id: string;
  phone: string;
  role: 'BUYER' | 'MERCHANT' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  profile?: UserProfile;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

// ─── Requests ────────────────────────────────────────────────────────

export type RequestStatus = 'DRAFT' | 'ACTIVE' | 'HAS_BIDS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

export interface RequestCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  iconUrl?: string;
}

export interface RequestImage {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface MarketRequest {
  id: string;
  buyerId: string;
  categoryId: string;
  category?: { id: string; name: string };
  title: string;
  description: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  locationAddress?: string | null;
  locationCity?: string | null;
  locationCountry?: string | null;
  status: RequestStatus;
  priorityScore: number;
  bidCount: number;
  viewCount: number;
  expiresAt?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  images: RequestImage[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Bids ─────────────────────────────────────────────────────────

export type BidStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'WITHDRAWN';
export type FulfillmentStatus = 'AWAITING' | 'PREPARING' | 'IN_DELIVERY' | 'DELIVERED' | 'CONFIRMED';

export interface Bid {
  id: string;
  requestId: string;
  merchantId: string;
  amount: string;
  deliveryDays: number;
  deliveryNotes?: string | null;
  specialTerms?: string | null;
  status: BidStatus;
  priorityScore: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
  withdrawnAt?: string | null;
  chatRoomId?: string | null;
  fulfillmentStatus?: FulfillmentStatus | null;
  fulfillmentUpdatedAt?: string | null;
}

// ─── Reviews ──────────────────────────────────────────────────────

export type ReviewType = 'BUYER_TO_MERCHANT' | 'MERCHANT_TO_BUYER';

export interface Review {
  id: string;
  bidId: string;
  requestId: string;
  reviewerId: string;
  revieweeId: string;
  type: ReviewType;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface MerchantProfile {
  id: string;
  phone: string;
  profile: UserProfile | null;
  memberSince: string;
  avgRating: number | null;
  reviewCount: number;
  completedBids: number;
}

export interface BidCompetition {
  totalBids: number;
  lowestAmount: number | null;
  averageAmount: number | null;
  yourPosition: number;
}

// ─── Chat ─────────────────────────────────────────────────────────

export type RoomType = 'DIRECT' | 'GROUP' | 'REQUEST' | 'BID' | 'SUPPORT';
export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' | 'VIDEO' | 'LOCATION' | 'SYSTEM';

export interface ChatRoom {
  id: string;
  name: string;
  description?: string | null;
  type: RoomType;
  relatedRequestId?: string | null;
  relatedBidId?: string | null;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
  lastMessage?: {
    id: string;
    content: string;
    type: MessageType;
    senderId: string;
    createdAt: string;
  } | null;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  type: MessageType;
  content: string;
  replyToId?: string | null;
  mediaUrls: string[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  editedAt?: string | null;
  reactions?: { userId: string; reactionType: string }[];
}

