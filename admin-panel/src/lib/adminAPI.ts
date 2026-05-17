import axios, { AxiosInstance } from 'axios'
import { SessionManager } from './auth'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

function makeAuthInterceptors(client: AxiosInstance) {
  client.interceptors.request.use(config => {
    const token = SessionManager.getAccessToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  client.interceptors.response.use(
    res => res,
    async err => {
      const original = err.config
      if (err.response?.status === 401 && !original._retry) {
        original._retry = true
        const refreshToken = SessionManager.getRefreshToken()
        if (refreshToken) {
          try {
            const { data } = await axios.post(`${BASE_URL}/identity/auth/refresh-token`, { refreshToken })
            SessionManager.saveTokens(data.tokens.accessToken, data.tokens.refreshToken)
            original.headers.Authorization = `Bearer ${data.tokens.accessToken}`
            return client(original)
          } catch {
            SessionManager.clearTokens()
            if (typeof window !== 'undefined') window.location.href = '/login'
          }
        } else {
          SessionManager.clearTokens()
          if (typeof window !== 'undefined') window.location.href = '/login'
        }
      }
      return Promise.reject(err)
    },
  )
}

let _client: AxiosInstance | null = null
let _requestClient: AxiosInstance | null = null
let _biddingClient: AxiosInstance | null = null

function getClient(): AxiosInstance {
  if (_client) return _client
  _client = axios.create({ baseURL: `${BASE_URL}/identity` })
  makeAuthInterceptors(_client)
  return _client
}

function getRequestClient(): AxiosInstance {
  if (_requestClient) return _requestClient
  _requestClient = axios.create({ baseURL: `${BASE_URL}/requests` })
  makeAuthInterceptors(_requestClient)
  return _requestClient
}

function getBiddingClient(): AxiosInstance {
  if (_biddingClient) return _biddingClient
  _biddingClient = axios.create({ baseURL: `${BASE_URL}/bidding` })
  makeAuthInterceptors(_biddingClient)
  return _biddingClient
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthTokens { accessToken: string; refreshToken: string; expiresIn: number }

export interface AdminUser {
  id: string; phone: string; role: string; adminSubRole: string | null
  status: string; phoneVerified: boolean; createdAt: string
  lastLoginAt: string | null; failedLoginAttempts: number; lockedUntil: string | null
  profile?: { firstName: string; lastName: string; city?: string; country?: string } | null
}

export interface Pagination { page: number; limit: number; total: number; totalPages: number }

export interface DashboardMetrics {
  users: {
    total: number; active: number; newToday: number; newThisWeek: number
    byRole: Record<string, number>; byStatus: Record<string, number>
  }
  authentication: {
    loginAttemptsToday: number; successfulLoginsToday: number
    failedLoginsToday: number; otpSentToday: number; averageLoginTime: number
  }
}

export interface ActivityLog {
  id: string; admin_id: string; action_type: string; target_type: string
  target_id: string | null; target_phone: string | null; action_details: Record<string, unknown>
  ip_address: string | null; success: boolean; failure_reason: string | null; created_at: string
  admin_phone?: string; first_name?: string; last_name?: string
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function apiPhoneLogin(phone: string) {
  const { data } = await getClient().post('/auth/login', { phone, role: 'ADMIN', countryCode: '+962' })
  return data as { success: boolean; otpSent: boolean; expiresAt?: string; message: string }
}

export async function apiVerifyOTP(phone: string, otpCode: string) {
  const { data } = await getClient().post('/auth/verify-otp', { phone, otpCode })
  return data as { success: boolean; user: AdminUser; tokens: AuthTokens; adminPermissions?: Record<string, boolean> }
}

export async function apiResendOTP(phone: string) {
  const { data } = await getClient().post('/auth/resend-otp', { phone })
  return data as { success: boolean; message: string; cooldownRemaining?: number }
}

export async function apiLogout(refreshToken?: string, allDevices = false) {
  await getClient().post('/auth/logout', { refreshToken, allDevices })
}

export async function apiGetMe() {
  const { data } = await getClient().get('/admin/auth/me')
  return data as { success: boolean; admin: AdminUser; permissions: Record<string, boolean> }
}

export interface UserSession {
  id: string; isActive: boolean; ipAddress: string | null; userAgent: string | null
  deviceFingerprint: string | null; lastActivityAt: string | null
  createdAt: string; expiresAt: string
}

export interface UpdateProfilePayload {
  role?: string; firstName?: string; lastName?: string; city?: string; country?: string
}

export async function apiUpdateMyProfile(payload: UpdateProfilePayload) {
  const { data } = await getClient().patch('/admin/auth/me', payload)
  return data as { success: boolean; message: string; admin: AdminUser }
}

export async function apiUpdateUser(userId: string, payload: UpdateProfilePayload) {
  const { data } = await getClient().patch(`/admin/users/${userId}`, payload)
  return data as { success: boolean; message: string; user: AdminUser }
}

export async function apiGetUserSessions(userId: string) {
  const { data } = await getClient().get(`/admin/users/${userId}/sessions`)
  return data as { success: boolean; sessions: UserSession[] }
}

export async function apiRevokeUserSession(userId: string, sessionId: string) {
  const { data } = await getClient().delete(`/admin/users/${userId}/sessions/${sessionId}`)
  return data as { success: boolean; message: string }
}

export async function apiGetUserLogs(userId: string, params: { page?: number; limit?: number } = {}) {
  const { data } = await getClient().get(`/admin/users/${userId}/logs`, { params })
  return data as { success: boolean; logs: ActivityLog[]; total: number }
}

// ─── Users ───────────────────────────────────────────────────────────────────

export interface GetUsersParams {
  page?: number; limit?: number; search?: string
  role?: string; status?: string; sortBy?: string; sortOrder?: string
}

export async function apiGetUsers(params: GetUsersParams = {}) {
  const { data } = await getClient().get('/admin/users', { params })
  return data as { success: boolean; users: AdminUser[]; pagination: Pagination }
}

export async function apiGetUser(userId: string) {
  const { data } = await getClient().get(`/admin/users/${userId}`)
  return data as { success: boolean; user: AdminUser }
}

export async function apiSuspendUser(userId: string, payload: { reason: string; duration?: number; notifyUser?: boolean }) {
  const { data } = await getClient().post(`/admin/users/${userId}/suspend`, payload)
  return data
}

export async function apiBanUser(userId: string, payload: { reason: string; permanent: boolean; notifyUser?: boolean }) {
  const { data } = await getClient().post(`/admin/users/${userId}/ban`, payload)
  return data
}

export async function apiActivateUser(userId: string) {
  const { data } = await getClient().post(`/admin/users/${userId}/activate`)
  return data
}

export async function apiBulkAction(userIds: string[], action: string, actionData: Record<string, unknown> = {}) {
  const { data } = await getClient().post('/admin/users/bulk-action', { userIds, action, actionData })
  return data
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function apiGetDashboardMetrics() {
  const { data } = await getClient().get('/admin/dashboard/metrics')
  return data as { success: boolean; metrics: DashboardMetrics; trends: { userRegistrations: { date: string; count: number }[] } }
}

// ─── Logs ────────────────────────────────────────────────────────────────────

export async function apiGetLogs(params: { page?: number; limit?: number; adminId?: string; actionType?: string } = {}) {
  const { data } = await getClient().get('/admin/logs', { params })
  return data as { success: boolean; logs: ActivityLog[] }
}

// ─── Analytics API ────────────────────────────────────────────────────────────

let _analyticsClient: import('axios').AxiosInstance | null = null
function getAnalyticsClient(): import('axios').AxiosInstance {
  if (_analyticsClient) return _analyticsClient
  _analyticsClient = axios.create({ baseURL: `${BASE_URL}/analytics` })
  makeAuthInterceptors(_analyticsClient)
  return _analyticsClient
}

export interface Trend { date: string; count: number }

export interface OverviewStats {
  users: {
    total: number; active: number; newToday: number
    byRole: { role: string; count: number }[]
    trend: Trend[]
  }
  requests: {
    total: number; active: number; completed: number
    byStatus: { status: string; count: number }[]
    trend: Trend[]
  }
  bids: {
    total: number; pending: number; accepted: number; conversionRate: number
    byStatus: { status: string; count: number }[]
    trend: Trend[]
  }
  chat: { totalRooms: number; totalMessages: number }
  notifications: {
    total: number; unread: number; readRate: number
    byChannel: { channel: string; count: number }[]
    trend: Trend[]
  }
}

export interface UserAnalyticsStats {
  total: number; active: number; banned: number; suspended: number
  newToday: number; newThisWeek: number
  byRole: { role: string; count: number }[]
  byStatus: { status: string; count: number }[]
  trend: Trend[]
}

export interface RequestAnalyticsStats {
  total: number; totalViews: number; totalBids: number; avgBidsPerRequest: number
  byStatus: { status: string; count: number }[]
  topCategories: { categoryId: string; count: number }[]
  trend: Trend[]
  viewTrend: Trend[]
}

export interface BidAnalyticsStats {
  total: number; conversionRate: number
  byStatus: { status: string; count: number }[]
  amount: { avg: string; min: string; max: string; total: string }
  avgDeliveryDays: string
  topMerchants: { merchantId: string; count: number }[]
  trend: Trend[]
}

export interface ChatAnalyticsStats {
  rooms: { total: number; active: number; byType: { type: string; count: number }[] }
  messages: { total: number; deleted: number; byType: { type: string; count: number }[]; trend: Trend[] }
}

export interface NotifAnalyticsStats {
  total: number; todayTotal: number; unreadTotal: number; readRate: number
  byType: { type: string; count: number }[]
  byChannel: { channel: string; count: number }[]
  byStatus: { status: string; count: number }[]
  byPriority: { priority: string; count: number }[]
  trend: Trend[]
}

export interface ActivityStats {
  total: number
  byCategory: { category: string; count: number }[]
  byEventType: { eventType: string; count: number }[]
  byRole: { role: string; count: number }[]
}

export async function apiGetAnalyticsOverview(params: { from?: string; to?: string } = {}) {
  const { data } = await getAnalyticsClient().get('/overview', { params })
  return data as { success: boolean; overview: OverviewStats }
}

export async function apiGetUserAnalytics(params: { from?: string; to?: string } = {}) {
  const { data } = await getAnalyticsClient().get('/users', { params })
  return data as { success: boolean; stats: UserAnalyticsStats }
}

export async function apiGetRequestAnalytics(params: { from?: string; to?: string } = {}) {
  const { data } = await getAnalyticsClient().get('/requests', { params })
  return data as { success: boolean; stats: RequestAnalyticsStats }
}

export async function apiGetBidAnalytics(params: { from?: string; to?: string } = {}) {
  const { data } = await getAnalyticsClient().get('/bids', { params })
  return data as { success: boolean; stats: BidAnalyticsStats }
}

export async function apiGetChatAnalytics(params: { from?: string; to?: string } = {}) {
  const { data } = await getAnalyticsClient().get('/chat', { params })
  return data as { success: boolean; stats: ChatAnalyticsStats }
}

export async function apiGetNotifAnalytics(params: { from?: string; to?: string } = {}) {
  const { data } = await getAnalyticsClient().get('/notifications', { params })
  return data as { success: boolean; stats: NotifAnalyticsStats }
}

export async function apiGetActivityStats(params: { from?: string; to?: string } = {}) {
  const { data } = await getAnalyticsClient().get('/stats', { params })
  return data as { success: boolean; stats: ActivityStats }
}

export async function apiGetActivityLogs(params: {
  page?: number; limit?: number; actorRole?: string; category?: string; eventType?: string; from?: string; to?: string
} = {}) {
  const { data } = await getAnalyticsClient().get('/activity', { params })
  return data as { success: boolean; logs: Record<string, unknown>[]; pagination: Pagination }
}

// ─── Request Service Types ────────────────────────────────────────────────────

export interface RequestCategory {
  id: string; name: string; slug: string; description: string | null
  icon: string | null; parentId: string | null; isActive: boolean
  sortOrder: number; createdAt: string; updatedAt: string
  children?: RequestCategory[]
}

export interface RequestImage {
  id: string; requestId: string; imageUrl: string; thumbnailUrl: string | null
  isPrimary: boolean; sortOrder: number; mimeType: string
  width: number | null; height: number | null
}

export interface RequestItem {
  id: string; buyerId: string; categoryId: string | null; title: string
  description: string; status: string; budgetMin: number | null
  budgetMax: number | null; locationAddress: string | null
  locationCity: string | null; locationCountry: string | null
  bidCount: number; expiresAt: string | null; viewCount: number
  priorityScore: number; createdAt: string; updatedAt: string
  publishedAt: string | null
  category?: { id: string; name: string; slug: string } | null
  images?: RequestImage[]
}

export interface RequestAnalytics {
  totalRequests: number; activeRequests: number; completedRequests: number
  totalValue: number; conversionRate: number
  statusBreakdown?: { status: string; count: number }[]
}

// ─── Request Admin API ────────────────────────────────────────────────────────

export interface GetAdminRequestsParams {
  page?: number; limit?: number; status?: string
  categories?: string; buyerId?: string; startDate?: string; endDate?: string
}

export async function apiGetAdminRequests(params: GetAdminRequestsParams = {}) {
  const { data } = await getRequestClient().get('/admin/requests', { params })
  return data as {
    success: boolean; requests: RequestItem[]
    pagination: Pagination; analytics: RequestAnalytics
  }
}

export async function apiGetAdminRequest(id: string) {
  const { data } = await getRequestClient().get(`/admin/requests/${id}`)
  return data as { success: boolean; request: RequestItem }
}

export async function apiUpdateRequestStatus(id: string, status: string, reason?: string) {
  const { data } = await getRequestClient().patch(`/admin/requests/${id}/status`, { status, reason })
  return data as { success: boolean; message: string }
}

export async function apiDeleteRequest(id: string) {
  const { data } = await getRequestClient().delete(`/admin/requests/${id}`)
  return data as { success: boolean; message: string }
}

export async function apiTriggerExpiry() {
  const { data } = await getRequestClient().post('/admin/requests/process-expired')
  return data as { success: boolean; message: string }
}

export async function apiGetRequestAdminAnalytics() {
  const { data } = await getRequestClient().get('/admin/analytics')
  return data as { success: boolean; analytics: RequestAnalytics }
}

// ─── Category Admin API ───────────────────────────────────────────────────────

export async function apiGetCategories() {
  const { data } = await getRequestClient().get('/categories')
  return data as { success: boolean; categories: RequestCategory[] }
}

export interface CategoryPayload {
  name: string; slug?: string; description?: string; icon?: string
  parentId?: string | null; isActive?: boolean; sortOrder?: number
}

export async function apiCreateCategory(payload: CategoryPayload) {
  const { data } = await getRequestClient().post('/admin/categories', payload)
  return data as { success: boolean; category: RequestCategory; message: string }
}

export async function apiUpdateCategory(id: string, payload: Partial<CategoryPayload>) {
  const { data } = await getRequestClient().put(`/admin/categories/${id}`, payload)
  return data as { success: boolean; category: RequestCategory; message: string }
}

export async function apiDeleteCategory(id: string) {
  const { data } = await getRequestClient().delete(`/admin/categories/${id}`)
  return data as { success: boolean; message: string }
}

// ─── Bidding Admin Types ──────────────────────────────────────────────────────

export type BidStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'WITHDRAWN'

export interface BidItem {
  id: string
  requestId: string
  merchantId: string
  amount: string
  deliveryDays: number
  deliveryNotes: string | null
  specialTerms: string | null
  status: BidStatus
  priorityScore: number
  createdAt: string
  updatedAt: string
  expiresAt: string | null
  acceptedAt: string | null
  rejectedAt: string | null
  withdrawnAt: string | null
}

// ─── Bidding Admin API ────────────────────────────────────────────────────────

export interface GetAdminBidsParams {
  page?: number
  limit?: number
  status?: string
  merchantId?: string
  requestId?: string
  startDate?: string
  endDate?: string
}

export interface BidAnalytics {
  totalBids: number
  totalValue: number
  statusBreakdown: { status: string; count: number }[]
}

export async function apiGetAdminBids(params: GetAdminBidsParams = {}) {
  const clean = { ...params }
  if (clean.status === 'ALL') delete clean.status
  const { data } = await getBiddingClient().get('/admin/bids', { params: clean })
  return data as { success: boolean; bids: BidItem[]; pagination: Pagination; analytics: BidAnalytics }
}

export async function apiGetAdminBid(id: string) {
  const { data } = await getBiddingClient().get(`/admin/bids/${id}`)
  return data as { success: boolean; bid: BidItem }
}

export async function apiGetRequestBids(requestId: string) {
  const { data } = await getBiddingClient().get('/admin/bids', { params: { requestId } })
  return data as { success: boolean; bids: BidItem[]; pagination: Pagination; analytics: BidAnalytics }
}

export async function apiAdminForceRejectBid(bidId: string, reason?: string) {
  const { data } = await getBiddingClient().post(`/admin/bids/${bidId}/force-reject`, { reason })
  return data as { success: boolean; message: string }
}

// ─── Chat Admin Types ─────────────────────────────────────────────────────────

let _chatClient: import('axios').AxiosInstance | null = null
function getChatClient() {
  if (_chatClient) return _chatClient
  _chatClient = axios.create({ baseURL: `${BASE_URL}/chat` })
  makeAuthInterceptors(_chatClient)
  return _chatClient
}

export type RoomType = 'DIRECT' | 'GROUP' | 'REQUEST' | 'BID' | 'SUPPORT'
export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' | 'VIDEO' | 'LOCATION' | 'SYSTEM'

export interface ChatRoom {
  id: string; name: string; description: string | null; type: RoomType
  relatedRequestId: string | null; relatedBidId: string | null
  createdBy: string; isActive: boolean; maxParticipants: number
  createdAt: string; updatedAt: string
  _count?: { messages: number }
}

export interface ChatMessage {
  id: string; roomId: string; senderId: string; type: MessageType
  content: string; replyToId: string | null; mediaUrls: string[]
  isEdited: boolean; isDeleted: boolean; createdAt: string
  editedAt: string | null; deletedAt: string | null
  reactions?: { userId: string; reactionType: string }[]
}

export async function apiAdminGetChatRooms(params: { page?: number; limit?: number; type?: string; isActive?: boolean; search?: string } = {}) {
  const { data } = await getChatClient().get('/admin/rooms', { params })
  return data as { success: boolean; rooms: ChatRoom[]; pagination: Pagination }
}

export async function apiAdminGetChatRoom(roomId: string) {
  const { data } = await getChatClient().get(`/admin/rooms/${roomId}`)
  return data as { success: boolean; room: ChatRoom }
}

export async function apiAdminGetChatMessages(roomId: string, params: { page?: number; limit?: number } = {}) {
  const { data } = await getChatClient().get(`/admin/rooms/${roomId}/messages`, { params })
  return data as { success: boolean; messages: ChatMessage[]; pagination: Pagination }
}

export async function apiAdminDeleteChatMessage(messageId: string) {
  const { data } = await getChatClient().delete(`/admin/messages/${messageId}`)
  return data as { success: boolean }
}

// ─── Notification Admin Types ─────────────────────────────────────────────────

let _notifClient: import('axios').AxiosInstance | null = null
function getNotifClient() {
  if (_notifClient) return _notifClient
  _notifClient = axios.create({ baseURL: `${BASE_URL}/notifications` })
  makeAuthInterceptors(_notifClient)
  return _notifClient
}

export type NotifType = 'SYSTEM' | 'REQUEST' | 'BID' | 'PAYMENT' | 'CHAT' | 'SUBSCRIPTION' | 'SECURITY' | 'MARKETING'
export type NotifChannel = 'IN_APP' | 'PUSH' | 'EMAIL' | 'SMS' | 'WEBHOOK'
export type NotifPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
export type NotifStatus = 'PENDING' | 'PROCESSING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'EXPIRED' | 'READ'

export interface NotificationItem {
  id: string; userId: string; type: NotifType; title: string; content: string
  channel: NotifChannel; priority: NotifPriority; status: NotifStatus
  metadata: Record<string, unknown>; readAt: string | null
  sentAt: string | null; deliveredAt: string | null
  createdAt: string; updatedAt: string
}

export interface NotifStats {
  total: number; todayTotal: number; unreadTotal: number; readRate: number
  byType: { type: string; count: number }[]
  byChannel: { channel: string; count: number }[]
  byStatus: { status: string; count: number }[]
}

export interface GetAdminNotificationsParams {
  page?: number; limit?: number; userId?: string
  type?: string; channel?: string; status?: string; priority?: string
  from?: string; to?: string
}

export async function apiAdminGetNotifications(params: GetAdminNotificationsParams = {}) {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
  const { data } = await getNotifClient().get('/admin', { params: clean })
  return data as { success: boolean; notifications: NotificationItem[]; pagination: Pagination }
}

export async function apiAdminGetNotificationStats() {
  const { data } = await getNotifClient().get('/admin/stats')
  return data as { success: boolean; stats: NotifStats }
}

export async function apiAdminSendNotification(payload: {
  userId: string; type: string; title: string; content: string
  channel: string; priority: string; scheduledAt?: string; metadata?: Record<string, unknown>
}) {
  const { data } = await getNotifClient().post('/admin/send', payload)
  return data as { success: boolean; notification: NotificationItem }
}

export async function apiAdminDeleteNotification(id: string) {
  const { data } = await getNotifClient().delete(`/admin/${id}`)
  return data as { success: boolean }
}

export async function apiAdminGetNotificationAnalytics(params: { from?: string; to?: string } = {}) {
  const { data } = await axios.create({ baseURL: `${BASE_URL}/analytics` }).get('/notifications', {
    params,
    headers: { Authorization: `Bearer ${SessionManager.getAccessToken()}` },
  })
  return data as {
    success: boolean
    stats: NotifStats & { trend: { date: string; count: number }[] }
  }
}
