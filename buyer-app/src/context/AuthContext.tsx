import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthAPI from '../api/auth';
import {setLogoutCallback} from '../api/client';
import {User} from '../types/api';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsProfileSetup: boolean;
  loginStep: 'phone' | 'otp';
  otpExpiresAt: string | null;
  error: string | null;
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, otp: string) => Promise<void>;
  resendOTP: (phone: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateProfile: (payload: {firstName?: string; lastName?: string; city?: string; country?: string}) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginStep, setLoginStep] = useState<'phone' | 'otp'>('phone');
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const performLogout = useCallback(async () => {
    try {
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
      if (storedRefreshToken) {
        await AuthAPI.logout(storedRefreshToken).catch(() => {
          // Ignore logout API errors — clear local state regardless
        });
      }
    } finally {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      setUser(null);
      setIsAuthenticated(false);
      setLoginStep('phone');
      setOtpExpiresAt(null);
      setError(null);
    }
  }, []);

  // Register logout callback for 401 handling in axios interceptor
  useEffect(() => {
    setLogoutCallback(performLogout);
  }, [performLogout]);

  // Initial auth check on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const [accessToken, storedUser] = await Promise.all([
          AsyncStorage.getItem('accessToken'),
          AsyncStorage.getItem('user'),
        ]);

        if (accessToken && storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const sendOTP = useCallback(async (phone: string) => {
    setError(null);
    try {
      const response = await AuthAPI.sendOTP(phone);
      const expiresAt = response.otpExpiresAt ?? response.expiresAt ?? null;
      setOtpExpiresAt(expiresAt);
      setLoginStep('otp');
    } catch (err: unknown) {
      const message = extractErrorMessage(
        err,
        'Failed to send OTP. Please try again.',
      );
      setError(message);
      throw err;
    }
  }, []);

  const verifyOTP = useCallback(async (phone: string, otp: string) => {
    setError(null);
    try {
      const response = await AuthAPI.verifyOTP(phone, otp);
      const { tokens, user: responseUser } = response;
      const { accessToken, refreshToken } = tokens;

      await Promise.all([
        AsyncStorage.setItem('accessToken', accessToken),
        AsyncStorage.setItem('refreshToken', refreshToken),
        AsyncStorage.setItem('user', JSON.stringify(responseUser)),
      ]);

      setUser(responseUser);
      setIsAuthenticated(true);
      setLoginStep('phone');
    } catch (err: unknown) {
      const message = extractErrorMessage(
        err,
        'Invalid OTP. Please try again.',
      );
      setError(message);
      throw err;
    }
  }, []);

  const resendOTP = useCallback(async (phone: string) => {
    setError(null);
    try {
      const response = await AuthAPI.resendOTP(phone);
      const expiresAt = response.otpExpiresAt ?? response.expiresAt ?? null;
      if (expiresAt) {
        setOtpExpiresAt(expiresAt);
      }
    } catch (err: unknown) {
      const message = extractErrorMessage(
        err,
        'Failed to resend OTP. Please try again.',
      );
      setError(message);
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateProfile = useCallback(
    async (payload: {firstName?: string; lastName?: string; city?: string; country?: string}) => {
      const response = await AuthAPI.updateProfile(payload);
      const updated = response.user;
      setUser(updated);
      await AsyncStorage.setItem('user', JSON.stringify(updated));
    },
    [],
  );

  const needsProfileSetup =
    isAuthenticated && !isLoading && !user?.profile?.firstName;

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    needsProfileSetup,
    loginStep,
    otpExpiresAt,
    error,
    sendOTP,
    verifyOTP,
    resendOTP,
    logout: performLogout,
    clearError,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const axiosErr = err as {
      response?: {data?: {message?: string}};
      message?: string;
    };
    if (axiosErr.response?.data?.message) {
      return axiosErr.response.data.message;
    }
    if (axiosErr.message) {
      return axiosErr.message;
    }
  }
  return fallback;
}
