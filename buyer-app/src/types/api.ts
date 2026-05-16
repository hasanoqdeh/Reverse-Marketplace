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
