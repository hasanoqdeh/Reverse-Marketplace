import axios, { AxiosInstance } from 'axios'
import { SessionManager } from './auth'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

let _client: AxiosInstance | null = null

function getClient(): AxiosInstance {
  if (_client) return _client

  _client = axios.create({ baseURL: `${BASE_URL}/identity` })

  _client.interceptors.request.use(config => {
    const token = SessionManager.getAccessToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  _client.interceptors.response.use(
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
            return _client!(original)
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

  return _client
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
