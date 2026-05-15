export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthLoginResponse {
  message: string;
  otpExpiresAt: string;
}

export interface AuthVerifyOTPResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthRefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  phone: string;
  role: 'MERCHANT' | 'BUYER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  profile?: MerchantProfile;
}

export interface MerchantProfile {
  id: string;
  businessName?: string;
  businessType?: string;
  rating?: number;
  totalBids?: number;
  wonBids?: number;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}
