'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { SessionManager, AdminUser } from '@/lib/auth'
import {
  apiPhoneLogin, apiVerifyOTP, apiResendOTP, apiLogout, apiGetMe,
} from '@/lib/adminAPI'

interface AuthContextValue {
  user: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  otpSent: boolean
  otpExpiresAt: string | null
  loginStep: 'phone' | 'otp'
  phoneLogin(phone: string, countryCode: string): Promise<void>
  verifyOTP(phone: string, otpCode: string): Promise<void>
  resendOTP(phone: string): Promise<void>
  logout(): Promise<void>
  clearError(): void
  resetLoginFlow(): void
  canViewAdminPanel(): boolean
  adminLevel: string | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null)
  const [loginStep, setLoginStep] = useState<'phone' | 'otp'>('phone')

  // Restore session on mount
  useEffect(() => {
    async function restore() {
      if (!SessionManager.isLoggedIn()) {
        setIsLoading(false)
        return
      }
      try {
        const { admin } = await apiGetMe()
        const enriched: AdminUser = { ...admin, adminLevel: admin.adminSubRole ?? undefined }
        SessionManager.saveUser(enriched)
        setUser(enriched)
        setIsAuthenticated(true)
      } catch {
        SessionManager.clearTokens()
      } finally {
        setIsLoading(false)
      }
    }
    restore()
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const resetLoginFlow = useCallback(() => {
    setLoginStep('phone')
    setOtpSent(false)
    setOtpExpiresAt(null)
    setError(null)
  }, [])

  const phoneLogin = useCallback(async (phone: string, _countryCode: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await apiPhoneLogin(phone)
      if (!result.success) {
        setError(result.message ?? 'Failed to send OTP')
        return
      }
      setOtpSent(true)
      setOtpExpiresAt(result.expiresAt ?? null)
      setLoginStep('otp')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to send OTP'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const verifyOTP = useCallback(async (phone: string, otpCode: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await apiVerifyOTP(phone, otpCode)
      if (!result.success) {
        setError('OTP verification failed')
        return
      }
      SessionManager.saveTokens(result.tokens.accessToken, result.tokens.refreshToken)
      const enriched: AdminUser = { ...result.user, adminLevel: result.user.adminSubRole ?? undefined }
      SessionManager.saveUser(enriched)
      setUser(enriched)
      setIsAuthenticated(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Invalid OTP'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resendOTP = useCallback(async (phone: string) => {
    setError(null)
    try {
      const result = await apiResendOTP(phone)
      if (!result.success) setError(result.message ?? 'Failed to resend OTP')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to resend OTP'
      setError(msg)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      const refreshToken = SessionManager.getRefreshToken()
      await apiLogout(refreshToken ?? undefined)
    } catch { /* ignore */ } finally {
      SessionManager.clearTokens()
      setUser(null)
      setIsAuthenticated(false)
      resetLoginFlow()
    }
  }, [resetLoginFlow])

  const canViewAdminPanel = useCallback(() => {
    return isAuthenticated && user?.role === 'ADMIN'
  }, [isAuthenticated, user])

  const adminLevel = user?.adminSubRole ?? null

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, isLoading, error, otpSent, otpExpiresAt, loginStep,
      phoneLogin, verifyOTP, resendOTP, logout, clearError, resetLoginFlow,
      canViewAdminPanel, adminLevel,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
