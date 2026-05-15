import apiClient from './client';
import {
  AuthLoginResponse,
  AuthVerifyOTPResponse,
  AuthResendOTPResponse,
  AuthRefreshTokenResponse,
  AuthLogoutResponse,
} from '../types/api';

export const sendOTP = async (phone: string): Promise<AuthLoginResponse> => {
  const response = await apiClient.post<AuthLoginResponse>(
    '/identity/auth/login',
    {
      phone,
      role: 'BUYER',
      countryCode: '+962',
    },
  );
  return response.data;
};

export const verifyOTP = async (
  phone: string,
  otpCode: string,
): Promise<AuthVerifyOTPResponse> => {
  const response = await apiClient.post<AuthVerifyOTPResponse>(
    '/identity/auth/verify-otp',
    {
      phone,
      otpCode,
    },
  );
  return response.data;
};

export const resendOTP = async (
  phone: string,
): Promise<AuthResendOTPResponse> => {
  const response = await apiClient.post<AuthResendOTPResponse>(
    '/identity/auth/resend-otp',
    {
      phone,
    },
  );
  return response.data;
};

export const refreshToken = async (
  token: string,
): Promise<AuthRefreshTokenResponse> => {
  const response = await apiClient.post<AuthRefreshTokenResponse>(
    '/identity/auth/refresh-token',
    {
      refreshToken: token,
    },
  );
  return response.data;
};

export const logout = async (token: string): Promise<AuthLogoutResponse> => {
  const response = await apiClient.post<AuthLogoutResponse>(
    '/identity/auth/logout',
    {refreshToken: token},
  );
  return response.data;
};
