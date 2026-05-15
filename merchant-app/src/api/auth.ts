import apiClient from './client';
import {
  ApiResponse,
  AuthLoginResponse,
  AuthVerifyOTPResponse,
  AuthRefreshTokenResponse,
} from '../types/api';

const AUTH_PREFIX = '/identity/auth';

export async function sendOTP(phone: string): Promise<AuthLoginResponse> {
  const response = await apiClient.post<ApiResponse<AuthLoginResponse>>(
    `${AUTH_PREFIX}/login`,
    {
      phone,
      role: 'MERCHANT',
      countryCode: '+962',
    },
  );
  return response.data.data;
}

export async function verifyOTP(
  phone: string,
  otpCode: string,
): Promise<AuthVerifyOTPResponse> {
  const response = await apiClient.post<ApiResponse<AuthVerifyOTPResponse>>(
    `${AUTH_PREFIX}/verify-otp`,
    {phone, otpCode},
  );
  return response.data.data;
}

export async function resendOTP(phone: string): Promise<AuthLoginResponse> {
  const response = await apiClient.post<ApiResponse<AuthLoginResponse>>(
    `${AUTH_PREFIX}/resend-otp`,
    {phone},
  );
  return response.data.data;
}

export async function refreshToken(
  token: string,
): Promise<AuthRefreshTokenResponse> {
  const response = await apiClient.post<ApiResponse<AuthRefreshTokenResponse>>(
    `${AUTH_PREFIX}/refresh-token`,
    {refreshToken: token},
  );
  return response.data.data;
}

export async function logout(token: string): Promise<void> {
  await apiClient.post(
    `${AUTH_PREFIX}/logout`,
    {refreshToken: token},
    {
      headers: {Authorization: `Bearer ${token}`},
    },
  );
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  city?: string;
  country?: string;
}

export async function updateProfile(
  payload: UpdateProfilePayload,
): Promise<{success: boolean; message: string; user: import('../types/api').User}> {
  const response = await apiClient.patch(
    `${AUTH_PREFIX}/profile`,
    payload,
  );
  return response.data;
}
