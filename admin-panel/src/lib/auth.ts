// Authentication types and utilities for admin panel

export interface User {
  id: string;
  phone: string;
  role: 'BUYER' | 'MERCHANT' | 'ADMIN';
  status: string;
  profile?: UserProfile;
  adminLevel?: 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT';
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
  user: User;
  sessionTimeout: number;
}

export interface LogoutRequest {
  refreshToken?: string;
  allDevices?: boolean;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface AdminWhitelistEntry {
  id: string;
  phone: string;
  name: string;
  adminLevel: 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT';
  department?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminWhitelistResponse {
  admins: AdminWhitelistEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface AddAdminRequest {
  phone: string;
  name: string;
  adminLevel: 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT';
  department?: string;
}

export interface AddAdminResponse {
  success: boolean;
  adminId: string;
  message: string;
}

// API client for identity and authentication
export class AuthAPI {
  private baseURL: string;
  private authBaseURL: string;
  private adminAuthBaseURL: string;
  private adminBaseURL: string;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1') {
    this.baseURL = baseURL;
    // New identity service paths
    this.authBaseURL = `${this.baseURL}/identity/auth`;
    this.adminAuthBaseURL = `${this.baseURL}/identity/admin/auth`;
    this.adminBaseURL = `${this.baseURL}/identity/admin`;
  }

  private async request<T>(
    basePath: string,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${basePath}${endpoint}`;
    
    console.log('🔍 API Request Debug:', {
      url,
      endpoint,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body
    });
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    console.log('📡 API Response Debug:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url
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

  // Admin Auth methods
  async phoneLogin(data: PhoneLoginRequest): Promise<PhoneLoginResponse> {
    return this.request<PhoneLoginResponse>(this.adminAuthBaseURL, '/phone-login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyOTP(data: OTPVerificationRequest): Promise<OTPVerificationResponse> {
    return this.request<OTPVerificationResponse>(this.adminAuthBaseURL, '/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resendOTP(data: ResendOTPRequest): Promise<ResendOTPResponse> {
    return this.request<ResendOTPResponse>(this.adminAuthBaseURL, '/resend-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Common Auth methods (can use authBaseURL)
  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return this.request<RefreshTokenResponse>(this.authBaseURL, '/refresh-token', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(data: LogoutRequest): Promise<LogoutResponse> {
    return this.request<LogoutResponse>(this.authBaseURL, '/logout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserProfile(accessToken: string): Promise<{ success: boolean; profile: UserProfile }> {
    return this.request<{ success: boolean; profile: UserProfile }>(this.authBaseURL, '/profile', {
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
    return this.request<{ success: boolean; profile: UserProfile }>(this.authBaseURL, '/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  // Admin Management methods
  async addAdminToWhitelist(data: AddAdminRequest, accessToken: string): Promise<AddAdminResponse> {
    return this.request<AddAdminResponse>(this.adminBaseURL, '/whitelist', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async getAdminWhitelist(
    page: number = 1,
    limit: number = 10,
    accessToken: string
  ): Promise<AdminWhitelistResponse> {
    return this.request<AdminWhitelistResponse>(this.adminBaseURL, `/whitelist?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async removeAdminFromWhitelist(
    adminId: string,
    accessToken: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(this.adminBaseURL, `/whitelist/${adminId}`, {
      method: 'DELETE',
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
    return this.request(this.authBaseURL, '/health');
  }
}

// Device fingerprinting utilities
export function generateDeviceFingerprint(): string {
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
}

// Phone number formatting utilities
export function formatPhoneNumber(phone: string, countryCode?: string): string {
  // Remove all non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // If no country code provided, try to detect from the number
  if (!countryCode) {
    // Common country code detection
    if (cleanPhone.startsWith('968')) countryCode = 'OM';
    else if (cleanPhone.startsWith('962')) countryCode = 'JO';
    else if (cleanPhone.startsWith('1')) countryCode = 'US';
    else if (cleanPhone.startsWith('44')) countryCode = 'GB';
    else if (cleanPhone.startsWith('971')) countryCode = 'AE';
    else if (cleanPhone.startsWith('966')) countryCode = 'SA';
    else if (cleanPhone.startsWith('20')) countryCode = 'EG';
    else if (cleanPhone.startsWith('90')) countryCode = 'TR';
    else if (cleanPhone.startsWith('91')) countryCode = 'IN';
    else if (cleanPhone.startsWith('86')) countryCode = 'CN';
  }
  
  // Format for Omani numbers
  if (countryCode === 'OM') {
    if (cleanPhone.startsWith('968')) {
      return cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    } else if (cleanPhone.length === 8) {
      return `968 ${cleanPhone.replace(/(\d{4})(\d{4})/, '$1 $2')}`;
    }
  }
  
  // Format for Jordanian numbers
  if (countryCode === 'JO') {
    if (cleanPhone.startsWith('962')) {
      // Jordanian numbers: 962 7 XXXX XXXX (mobile) or 962 X XXX XXXX (landline)
      if (cleanPhone.length === 12) {
        return cleanPhone.replace(/(\d{3})(\d{1})(\d{3})(\d{4})/, '$1 $2 $3 $4');
      }
    } else if (cleanPhone.length === 9) {
      // Local Jordanian number (without country code)
      return `962 ${cleanPhone.replace(/(\d{1})(\d{3})(\d{4})/, '$1 $2 $3')}`;
    }
  }
  
  // Format for US/Canada numbers
  if (countryCode === 'US') {
    if (cleanPhone.startsWith('1') && cleanPhone.length === 11) {
      return cleanPhone.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
    } else if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
  }
  
  // Format for UK numbers
  if (countryCode === 'GB') {
    if (cleanPhone.startsWith('44') && cleanPhone.length >= 11) {
      return cleanPhone.replace(/(\d{2})(\d{4})(\d{3,4})/, '+$1 $2 $3');
    }
  }
  
  // Format for UAE numbers
  if (countryCode === 'AE') {
    if (cleanPhone.startsWith('971') && cleanPhone.length === 12) {
      return cleanPhone.replace(/(\d{3})(\d{2})(\d{7})/, '+$1 $2 $3');
    }
  }
  
  // Format for Saudi Arabia numbers
  if (countryCode === 'SA') {
    if (cleanPhone.startsWith('966') && cleanPhone.length === 12) {
      return cleanPhone.replace(/(\d{3})(\d{1})(\d{8})/, '+$1 $2 $3');
    }
  }
  
  // Format for Egypt numbers
  if (countryCode === 'EG') {
    if (cleanPhone.startsWith('20') && cleanPhone.length === 12) {
      return cleanPhone.replace(/(\d{2})(\d{1})(\d{8})/, '+$1 $2 $3');
    }
  }
  
  // Format for Turkey numbers
  if (countryCode === 'TR') {
    if (cleanPhone.startsWith('90') && cleanPhone.length === 12) {
      return cleanPhone.replace(/(\d{2})(\d{3})(\d{7})/, '+$1 $2 $3');
    }
  }
  
  // Format for India numbers
  if (countryCode === 'IN') {
    if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{5})/, '+$1 $2 $3');
    }
  }
  
  // Format for China numbers
  if (countryCode === 'CN') {
    if (cleanPhone.startsWith('86') && cleanPhone.length === 12) {
      return cleanPhone.replace(/(\d{2})(\d{3})(\d{7})/, '+$1 $2 $3');
    }
  }
  
  // Default formatting for other countries - add + if it looks like a country code
  if (cleanPhone.length >= 10) {
    // Try to detect country code and format
    if (cleanPhone.length >= 11 && cleanPhone.length <= 15) {
      // Add + prefix for international numbers
      return `+${cleanPhone}`;
    }
  }
  
  // Return as-is if no specific formatting applies
  return cleanPhone;
}

export function validatePhoneNumber(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Omani phone number validation
  if (cleanPhone.startsWith('968')) {
    return cleanPhone.length === 11;
  }
  
  // Jordanian phone number validation
  if (cleanPhone.startsWith('962')) {
    // Jordanian numbers: 962 7 XXXX XXXX (mobile) or 962 X XXX XXXX (landline)
    return cleanPhone.length === 12;
  }
  
  // US/Canada phone number validation
  if (cleanPhone.startsWith('1')) {
    return cleanPhone.length === 11; // 1 + 10 digit number
  }
  
  // UK phone number validation
  if (cleanPhone.startsWith('44')) {
    return cleanPhone.length >= 11 && cleanPhone.length <= 12;
  }
  
  // UAE phone number validation
  if (cleanPhone.startsWith('971')) {
    return cleanPhone.length === 12;
  }
  
  // Saudi Arabia phone number validation
  if (cleanPhone.startsWith('966')) {
    return cleanPhone.length === 12;
  }
  
  // Egypt phone number validation
  if (cleanPhone.startsWith('20')) {
    return cleanPhone.length === 12;
  }
  
  // Turkey phone number validation
  if (cleanPhone.startsWith('90')) {
    return cleanPhone.length === 12;
  }
  
  // India phone number validation
  if (cleanPhone.startsWith('91')) {
    return cleanPhone.length === 12;
  }
  
  // China phone number validation
  if (cleanPhone.startsWith('86')) {
    return cleanPhone.length === 12;
  }
  
  // Basic international validation for other countries
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
      if (!userStr) {
        return null;
      }
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('🔧 Error parsing user from localStorage:', error);
        return null;
      }
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

  static isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'ADMIN';
  }

  static getAdminLevel(): string | null {
    const user = this.getUser();
    return user?.adminLevel || null;
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
  SESSION_TIMEOUT_ADMIN_HOURS: 8,
  SESSION_TIMEOUT_USER_DAYS: 30,
  ACCESS_TOKEN_EXPIRY_MINUTES: 15,
  REFRESH_TOKEN_EXPIRY_DAYS: 30,
} as const;
