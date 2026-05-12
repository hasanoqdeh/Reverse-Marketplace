// Authentication types and utilities for merchant app

export interface User {
  id: string;
  phone: string;
  role: 'BUYER' | 'MERCHANT' | 'ADMIN';
  status: string;
  profile?: UserProfile;
  merchantVerification?: MerchantVerification;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  locationLat?: number;
  locationLng?: number;
  address?: string;
  city?: string;
  country?: string;
  preferences: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantVerification {
  id: string;
  businessName: string;
  businessLicense?: string;
  businessAddress?: string;
  businessPhone?: string;
  verificationDocuments: any[];
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  tokens: AuthTokens;
  sessionTimeout: number;
}

export interface PhoneLoginRequest {
  phone: string;
  countryCode?: string;
}

export interface PhoneLoginResponse {
  success: boolean;
  message: string;
  otpSent: boolean;
  expiresAt?: string;
  rateLimitExceeded?: boolean;
  nextAttemptAt?: string;
  accountLocked?: boolean;
  lockoutRemaining?: number;
}

export interface OTPVerificationRequest {
  phone: string;
  otpCode: string;
  deviceFingerprint?: string;
}

export interface OTPVerificationResponse {
  success: boolean;
  user: User;
  tokens: AuthTokens;
  sessionTimeout: number;
}

export interface ResendOTPRequest {
  phone: string;
}

export interface ResendOTPResponse {
  success: boolean;
  message: string;
  expiresAt?: string;
  cooldownRemaining?: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  tokens: AuthTokens;
}

export interface LogoutRequest {
  refreshToken?: string;
  allDevices?: boolean;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// API client for authentication
export class AuthAPI {
  private baseURL: string;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/auth${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        success: false,
        message: 'Network error',
        error: 'NETWORK_ERROR',
      }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async phoneLogin(data: PhoneLoginRequest): Promise<PhoneLoginResponse> {
    return this.request<PhoneLoginResponse>('/phone-login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyOTP(data: OTPVerificationRequest): Promise<OTPVerificationResponse> {
    return this.request<OTPVerificationResponse>('/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resendOTP(data: ResendOTPRequest): Promise<ResendOTPResponse> {
    return this.request<ResendOTPResponse>('/resend-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return this.request<RefreshTokenResponse>('/refresh-token', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(data: LogoutRequest): Promise<LogoutResponse> {
    return this.request<LogoutResponse>('/logout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserProfile(accessToken: string): Promise<{ success: boolean; profile: UserProfile }> {
    return this.request<{ success: boolean; profile: UserProfile }>('/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async updateUserProfile(
    profileData: Partial<UserProfile>,
    accessToken: string
  ): Promise<{ success: boolean; profile: UserProfile }> {
    return this.request<{ success: boolean; profile: UserProfile }>('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async getMerchantVerification(accessToken: string): Promise<{ success: boolean; verification: MerchantVerification }> {
    return this.request<{ success: boolean; verification: MerchantVerification }>('/merchant/verification', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async submitMerchantVerification(
    verificationData: Partial<MerchantVerification>,
    accessToken: string
  ): Promise<{ success: boolean; verification: MerchantVerification }> {
    return this.request<{ success: boolean; verification: MerchantVerification }>('/merchant/verification', {
      method: 'POST',
      body: JSON.stringify(verificationData),
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async healthCheck(): Promise<{
    success: boolean;
    status: string;
    timestamp: string;
    services: any;
  }> {
    return this.request('/health');
  }
}

// Device fingerprinting utilities
export function generateDeviceFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      !!window.sessionStorage,
      !!window.localStorage,
      canvas.toDataURL(),
    ].join('|');

    return btoa(fingerprint).substring(0, 255);
  } catch (error) {
    return 'fallback-fingerprint';
  }
}

// Phone number formatting utilities
export function formatPhoneNumber(phone: string, countryCode: string = 'OM'): string {
  // Remove all non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Format for Omani numbers
  if (countryCode === 'OM') {
    if (cleanPhone.startsWith('968')) {
      return cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    } else if (cleanPhone.length === 8) {
      return `968 ${cleanPhone.replace(/(\d{4})(\d{4})/, '$1 $2')}`;
    }
  }
  
  // Default formatting for other countries
  return cleanPhone;
}

export function validatePhoneNumber(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Omani phone number validation
  if (cleanPhone.startsWith('968')) {
    return cleanPhone.length === 11;
  }
  
  // Basic international validation
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
}

// OTP formatting utilities
export function formatOTP(otp: string): string {
  return otp.replace(/(\d{2})(\d{2})(\d{2})/, '$1 $2 $3');
}

export function validateOTP(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

// Token management utilities
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function getTokenPayload(token: string): any {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

// Session management utilities
export class SessionManager {
  private static readonly ACCESS_TOKEN_KEY = 'auth_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
  private static readonly USER_KEY = 'auth_user';
  private static readonly DEVICE_FINGERPRINT_KEY = 'device_fingerprint';

  static setTokens(accessToken: string, refreshToken: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  static getTokens(): { accessToken: string | null; refreshToken: string | null } {
    if (typeof window !== 'undefined') {
      return {
        accessToken: localStorage.getItem(this.ACCESS_TOKEN_KEY),
        refreshToken: localStorage.getItem(this.REFRESH_TOKEN_KEY),
      };
    }
    return { accessToken: null, refreshToken: null };
  }

  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  static clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.DEVICE_FINGERPRINT_KEY);
    }
  }

  static setDeviceFingerprint(fingerprint: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.DEVICE_FINGERPRINT_KEY, fingerprint);
    }
  }

  static getDeviceFingerprint(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.DEVICE_FINGERPRINT_KEY);
    }
    return null;
  }

  static isAuthenticated(): boolean {
    const { accessToken } = this.getTokens();
    return accessToken !== null && !isTokenExpired(accessToken);
  }

  static isMerchant(): boolean {
    const user = this.getUser();
    return user?.role === 'MERCHANT';
  }

  static isVerifiedMerchant(): boolean {
    const user = this.getUser();
    return user?.role === 'MERCHANT' && 
           user?.merchantVerification?.verificationStatus === 'VERIFIED';
  }

  static needsVerification(): boolean {
    const user = this.getUser();
    return user?.role === 'MERCHANT' && 
           (!user?.merchantVerification || user?.merchantVerification?.verificationStatus === 'PENDING');
  }
}

// Error types
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// Constants
export const AUTH_CONSTANTS = {
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 10,
  MAX_OTP_ATTEMPTS: 3,
  RESEND_COOLDOWN_SECONDS: 60,
  SESSION_TIMEOUT_MERCHANT_DAYS: 30,
  ACCESS_TOKEN_EXPIRY_MINUTES: 15,
  REFRESH_TOKEN_EXPIRY_DAYS: 30,
} as const;
