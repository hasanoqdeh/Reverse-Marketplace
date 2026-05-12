// Authentication types and utilities for buyer app
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  phone: string;
  role: 'BUYER' | 'MERCHANT' | 'ADMIN';
  status: string;
  profile?: UserProfile;
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

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL) {
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
    // React Native compatible fingerprinting
    // Use device info and random values for React Native environment
    const fingerprint = [
      'react-native',
      new Date().getTimezoneOffset(),
      Math.random().toString(36),
      Date.now().toString(36),
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
    // React Native AsyncStorage usage
    AsyncStorage.multiSet([
      [this.ACCESS_TOKEN_KEY, accessToken],
      [this.REFRESH_TOKEN_KEY, refreshToken],
      [this.USER_KEY, JSON.stringify(user)],
    ]).catch(error => {
      console.warn('AsyncStorage error:', error);
    });
  }

  static async getTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    try {
      const [accessToken, refreshToken] = await AsyncStorage.multiGet([
        this.ACCESS_TOKEN_KEY,
        this.REFRESH_TOKEN_KEY,
      ]);
      return {
        accessToken: accessToken[1],
        refreshToken: refreshToken[1],
      };
    } catch (error) {
      console.warn('AsyncStorage error:', error);
      return { accessToken: null, refreshToken: null };
    }
  }

  static async getUser(): Promise<User | null> {
    try {
      const userStr = await AsyncStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.warn('AsyncStorage error:', error);
      return null;
    }
  }

  static clearTokens(): void {
    AsyncStorage.multiRemove([
      this.ACCESS_TOKEN_KEY,
      this.REFRESH_TOKEN_KEY,
      this.USER_KEY,
      this.DEVICE_FINGERPRINT_KEY,
    ]).catch(error => {
      console.warn('AsyncStorage error:', error);
    });
  }

  static setDeviceFingerprint(fingerprint: string): void {
    AsyncStorage.setItem(this.DEVICE_FINGERPRINT_KEY, fingerprint).catch(error => {
      console.warn('AsyncStorage error:', error);
    });
  }

  static async getDeviceFingerprint(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.DEVICE_FINGERPRINT_KEY);
    } catch (error) {
      console.warn('AsyncStorage error:', error);
      return null;
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    const { accessToken } = await this.getTokens();
    return accessToken !== null && !isTokenExpired(accessToken);
  }

  static async isBuyer(): Promise<boolean> {
    const user = await this.getUser();
    return user?.role === 'BUYER';
  }

  static async isMerchant(): Promise<boolean> {
    const user = await this.getUser();
    return user?.role === 'MERCHANT';
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
  SESSION_TIMEOUT_BUYER_DAYS: 30,
  ACCESS_TOKEN_EXPIRY_MINUTES: 15,
  REFRESH_TOKEN_EXPIRY_DAYS: 30,
} as const;
