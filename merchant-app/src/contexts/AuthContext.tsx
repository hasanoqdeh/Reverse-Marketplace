'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { 
  User, 
  AuthTokens, 
  AuthAPI, 
  SessionManager, 
  AuthError,
  generateDeviceFingerprint,
  PhoneLoginRequest,
  OTPVerificationRequest,
  ResendOTPRequest,
  RefreshTokenRequest,
  LogoutRequest,
  MerchantVerification,
} from '@/lib/auth'

// Auth state interface
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  otpSent: boolean
  otpExpiresAt: string | null
  sessionTimeout: number
  loginStep: 'phone' | 'otp' | 'authenticated' | 'verification'
}

// Auth action types
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_OTP_SENT'; payload: { expiresAt: string } }
  | { type: 'SET_SESSION_TIMEOUT'; payload: number }
  | { type: 'SET_LOGIN_STEP'; payload: 'phone' | 'otp' | 'authenticated' | 'verification' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_MERCHANT_VERIFICATION'; payload: MerchantVerification }

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  otpSent: false,
  otpExpiresAt: null,
  sessionTimeout: 0,
  loginStep: 'phone',
}

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: true, 
        isLoading: false,
        loginStep: action.payload.merchantVerification ? 'verification' : 'authenticated',
        error: null 
      }
    case 'CLEAR_USER':
      return { 
        ...state, 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        loginStep: 'phone',
        otpSent: false,
        otpExpiresAt: null,
      }
    case 'SET_OTP_SENT':
      return { 
        ...state, 
        otpSent: true, 
        otpExpiresAt: action.payload.expiresAt,
        loginStep: 'otp',
        isLoading: false,
        error: null,
      }
    case 'SET_SESSION_TIMEOUT':
      return { ...state, sessionTimeout: action.payload }
    case 'SET_LOGIN_STEP':
      return { ...state, loginStep: action.payload }
    case 'SET_MERCHANT_VERIFICATION':
      return { ...state, user: state.user ? { ...state.user, merchantVerification: action.payload } : null }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

// Auth context interface
interface AuthContextType extends AuthState {
  // Authentication methods
  phoneLogin: (phone: string, countryCode?: string) => Promise<void>
  verifyOTP: (phone: string, otpCode: string) => Promise<void>
  resendOTP: (phone: string) => Promise<void>
  logout: (allDevices?: boolean) => Promise<void>
  refreshTokens: () => Promise<void>
  
  // Utility methods
  clearError: () => void
  resetLoginFlow: () => void
  
  // Merchant-specific methods
  needsVerification: () => boolean
  isVerifiedMerchant: () => boolean
  submitMerchantVerification: (verificationData: Partial<MerchantVerification>) => Promise<void>
  getMerchantVerification: () => Promise<MerchantVerification | null>
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
interface AuthProviderProps {
  children: ReactNode
  apiURL?: string
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, apiURL }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const api = new AuthAPI(apiURL)

  // Initialize device fingerprint
  useEffect(() => {
    const fingerprint = generateDeviceFingerprint()
    SessionManager.setDeviceFingerprint(fingerprint)
  }, [])

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { accessToken, refreshToken } = SessionManager.getTokens()
        const user = SessionManager.getUser()

        if (accessToken && refreshToken && user) {
          // Check if access token is expired
          if (isTokenExpired(accessToken)) {
            // Try to refresh tokens
            await refreshTokens()
          } else {
            // Set user from session
            dispatch({ type: 'SET_USER', payload: user })
            
            // Load merchant verification status if merchant
            if (user.role === 'MERCHANT') {
              try {
                const verificationResponse = await api.getMerchantVerification(accessToken)
                if (verificationResponse.success) {
                  dispatch({ type: 'SET_MERCHANT_VERIFICATION', payload: verificationResponse.verification })
                }
              } catch (error) {
                console.error('Failed to load merchant verification:', error)
              }
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        SessionManager.clearTokens()
      }
    }

    initializeAuth()
  }, [])

  // Auto-refresh tokens before expiry
  useEffect(() => {
    if (!state.isAuthenticated) return

    const { accessToken } = SessionManager.getTokens()
    if (!accessToken) return

    const payload = getTokenPayload(accessToken)
    if (!payload) return

    const timeUntilExpiry = payload.exp * 1000 - Date.now()
    const refreshTime = timeUntilExpiry - 5 * 60 * 1000 // 5 minutes before expiry

    if (refreshTime > 0) {
      const timer = setTimeout(() => {
        refreshTokens().catch(console.error)
      }, refreshTime)

      return () => clearTimeout(timer)
    }
  }, [state.isAuthenticated])

  // Helper functions
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return Date.now() >= payload.exp * 1000
    } catch {
      return true
    }
  }

  const getTokenPayload = (token: string): any => {
    try {
      return JSON.parse(atob(token.split('.')[1]))
    } catch {
      return null
    }
  }

  // Authentication methods
  const phoneLogin = async (phone: string, countryCode?: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      const request: PhoneLoginRequest = { phone, countryCode }
      const response = await api.phoneLogin(request)

      if (!response.success) {
        throw new AuthError(response.message, 'PHONE_LOGIN_FAILED')
      }

      if (response.rateLimitExceeded) {
        throw new AuthError(
          'Too many login attempts. Please try again later.',
          'RATE_LIMIT_EXCEEDED'
        )
      }

      if (response.accountLocked) {
        throw new AuthError(
          'Account temporarily locked. Please try again later.',
          'ACCOUNT_LOCKED'
        )
      }

      dispatch({ 
        type: 'SET_OTP_SENT', 
        payload: { expiresAt: response.expiresAt || new Date().toISOString() }
      })
    } catch (error) {
      const errorMessage = error instanceof AuthError ? error.message : 'Login failed'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      throw error
    }
  }

  const verifyOTP = async (phone: string, otpCode: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      const deviceFingerprint = SessionManager.getDeviceFingerprint() || undefined
      const request: OTPVerificationRequest = { phone, otpCode, deviceFingerprint }
      const response = await api.verifyOTP(request)

      if (!response.success) {
        throw new AuthError('OTP verification failed', 'OTP_VERIFICATION_FAILED')
      }

      // Store tokens and user
      SessionManager.setTokens(
        response.tokens.accessToken,
        response.tokens.refreshToken,
        response.user
      )

      dispatch({ type: 'SET_USER', payload: response.user })
      dispatch({ type: 'SET_SESSION_TIMEOUT', payload: response.sessionTimeout })

      // Load merchant verification status if merchant
      if (response.user.role === 'MERCHANT') {
        try {
          const verificationResponse = await api.getMerchantVerification(response.tokens.accessToken)
          if (verificationResponse.success) {
            dispatch({ type: 'SET_MERCHANT_VERIFICATION', payload: verificationResponse.verification })
          }
        } catch (error) {
          console.error('Failed to load merchant verification:', error)
        }
      }
    } catch (error) {
      const errorMessage = error instanceof AuthError ? error.message : 'OTP verification failed'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      throw error
    }
  }

  const resendOTP = async (phone: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      const request: ResendOTPRequest = { phone }
      const response = await api.resendOTP(request)

      if (!response.success) {
        throw new AuthError(response.message, 'OTP_RESEND_FAILED')
      }

      dispatch({ 
        type: 'SET_OTP_SENT', 
        payload: { expiresAt: response.expiresAt || new Date().toISOString() }
      })
    } catch (error) {
      const errorMessage = error instanceof AuthError ? error.message : 'Failed to resend OTP'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      throw error
    }
  }

  const refreshTokens = async (): Promise<void> => {
    try {
      const { refreshToken } = SessionManager.getTokens()
      if (!refreshToken) {
        throw new AuthError('No refresh token available', 'NO_REFRESH_TOKEN')
      }

      const request: RefreshTokenRequest = { refreshToken }
      const response = await api.refreshToken(request)

      if (!response.success) {
        throw new AuthError('Token refresh failed', 'TOKEN_REFRESH_FAILED')
      }

      // Update tokens
      const user = SessionManager.getUser()
      if (user) {
        SessionManager.setTokens(
          response.tokens.accessToken,
          response.tokens.refreshToken,
          user
        )
      }
    } catch (error) {
      // If refresh fails, clear tokens and logout
      SessionManager.clearTokens()
      dispatch({ type: 'CLEAR_USER' })
      throw error
    }
  }

  const logout = async (allDevices: boolean = false): Promise<void> => {
    try {
      const { refreshToken } = SessionManager.getTokens()
      
      if (refreshToken) {
        const request: LogoutRequest = { refreshToken, allDevices }
        await api.logout(request)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear local tokens regardless of API call success
      SessionManager.clearTokens()
      dispatch({ type: 'CLEAR_USER' })
    }
  }

  // Utility methods
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const resetLoginFlow = (): void => {
    dispatch({ type: 'SET_LOGIN_STEP', payload: 'phone' })
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // Merchant-specific methods
  const needsVerification = (): boolean => {
    return SessionManager.needsVerification()
  }

  const isVerifiedMerchant = (): boolean => {
    return SessionManager.isVerifiedMerchant()
  }

  const submitMerchantVerification = async (verificationData: Partial<MerchantVerification>): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      const { accessToken } = SessionManager.getTokens()
      if (!accessToken) {
        throw new AuthError('No access token available', 'NO_ACCESS_TOKEN')
      }

      const response = await api.submitMerchantVerification(verificationData, accessToken)

      if (!response.success) {
        throw new AuthError('Verification submission failed', 'VERIFICATION_FAILED')
      }

      dispatch({ type: 'SET_MERCHANT_VERIFICATION', payload: response.verification })
    } catch (error) {
      const errorMessage = error instanceof AuthError ? error.message : 'Verification submission failed'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      throw error
    }
  }

  const getMerchantVerification = async (): Promise<MerchantVerification | null> => {
    try {
      const { accessToken } = SessionManager.getTokens()
      if (!accessToken) {
        return null
      }

      const response = await api.getMerchantVerification(accessToken)
      return response.success ? response.verification : null
    } catch (error) {
      console.error('Failed to get merchant verification:', error)
      return null
    }
  }

  const value: AuthContextType = {
    ...state,
    phoneLogin,
    verifyOTP,
    resendOTP,
    logout,
    refreshTokens,
    clearError,
    resetLoginFlow,
    needsVerification,
    isVerifiedMerchant,
    submitMerchantVerification,
    getMerchantVerification,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export const withAuth = (
  Component: React.ComponentType<any>
) => {
  const WrappedComponent = React.forwardRef<any>((props, ref) => {
    const { isAuthenticated, user, isLoading } = useAuth()

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600">Please log in to access this page.</p>
          </div>
        </div>
      )
    }

    // Check if merchant needs verification
    if (user?.role === 'MERCHANT' && !user?.merchantVerification) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Required</h2>
            <p className="text-gray-600">Merchant verification is required to access this feature.</p>
          </div>
        </div>
      )
    }

    return <Component {...props} ref={ref} />
  })

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`
  
  return WrappedComponent
}
