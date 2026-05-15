'use client'

const KEYS = {
  ACCESS: 'admin_access_token',
  REFRESH: 'admin_refresh_token',
  USER: 'admin_user',
} as const

export interface AdminUser {
  id: string
  phone: string
  role: string
  adminSubRole: string | null
  status: string
  profile?: { firstName: string; lastName: string } | null
  adminLevel?: string
}

export const SessionManager = {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(KEYS.ACCESS)
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(KEYS.REFRESH)
  },

  getUser(): AdminUser | null {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem(KEYS.USER)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(KEYS.ACCESS, accessToken)
    localStorage.setItem(KEYS.REFRESH, refreshToken)
  },

  saveUser(user: AdminUser): void {
    localStorage.setItem(KEYS.USER, JSON.stringify(user))
  },

  clearTokens(): void {
    localStorage.removeItem(KEYS.ACCESS)
    localStorage.removeItem(KEYS.REFRESH)
    localStorage.removeItem(KEYS.USER)
  },

  isLoggedIn(): boolean {
    return !!this.getAccessToken()
  },
}

export function validatePhoneNumber(phone: string): boolean {
  return phone.startsWith('+') && phone.replace(/\D/g, '').length >= 10
}

export function validateOTP(otp: string): boolean {
  return /^\d{6}$/.test(otp.trim())
}

export function formatOTP(otp: string): string {
  return otp.trim()
}

export function formatPhoneNumber(phone: string): string {
  return phone
}
