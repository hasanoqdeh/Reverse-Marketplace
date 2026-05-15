import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavigationContainerRef} from '@react-navigation/native';

import * as AuthAPI from '../api/auth';
import {setNavigateToAuth, STORAGE_KEYS} from '../api/client';
import {User} from '../types/api';
import {RootStackParamList} from '../types/navigation';

// ── Types ────────────────────────────────────────────────────────────────────

type LoginStep = 'phone' | 'otp';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginStep: LoginStep;
  otpExpiresAt: string | null;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, otp: string) => Promise<void>;
  resendOTP: (phone: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList>>;
}

// ── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    loginStep: 'phone',
    otpExpiresAt: null,
    error: null,
  });

  const navigationRef =
    useRef<NavigationContainerRef<RootStackParamList>>(null);

  // Register the "navigate to Auth" callback used by the axios interceptor
  useEffect(() => {
    setNavigateToAuth(() => {
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        loginStep: 'phone',
        otpExpiresAt: null,
      }));
      navigationRef.current?.reset({
        index: 0,
        routes: [{name: 'Auth'}],
      });
    });
  }, []);

  // ── Restore session on mount ────────────────────────────────────────────

  useEffect(() => {
    async function restoreSession() {
      try {
        const [accessToken, storedUser] = await AsyncStorage.multiGet([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.USER,
        ]);

        const token = accessToken[1];
        const userJson = storedUser[1];

        if (token && userJson) {
          const user: User = JSON.parse(userJson);
          setState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
            isLoading: false,
          }));
          // Navigate to merchant screens after the navigator is ready
          setTimeout(() => {
            navigationRef.current?.reset({
              index: 0,
              routes: [{name: 'Merchant'}],
            });
          }, 100);
          return;
        }
      } catch {
        // Silently fall through to unauthenticated state
      }
      setState(prev => ({...prev, isLoading: false}));
    }

    restoreSession();
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────

  function extractErrorMessage(err: unknown): string {
    if (err && typeof err === 'object') {
      const axiosErr = err as {
        response?: {data?: {message?: string; error?: string}};
        message?: string;
      };
      if (axiosErr.response?.data?.message) {
        return axiosErr.response.data.message;
      }
      if (axiosErr.response?.data?.error) {
        return axiosErr.response.data.error;
      }
      if (axiosErr.message) {
        return axiosErr.message;
      }
    }
    return 'An unexpected error occurred. Please try again.';
  }

  // ── Auth actions ─────────────────────────────────────────────────────────

  const sendOTP = useCallback(async (phone: string) => {
    setState(prev => ({...prev, error: null}));
    try {
      const result = await AuthAPI.sendOTP(phone);
      setState(prev => ({
        ...prev,
        loginStep: 'otp',
        otpExpiresAt: result.otpExpiresAt ?? null,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: extractErrorMessage(err),
      }));
      throw err;
    }
  }, []);

  const verifyOTP = useCallback(
    async (phone: string, otp: string) => {
      setState(prev => ({...prev, error: null}));
      try {
        const result = await AuthAPI.verifyOTP(phone, otp);

        await AsyncStorage.multiSet([
          [STORAGE_KEYS.ACCESS_TOKEN, result.accessToken],
          [STORAGE_KEYS.REFRESH_TOKEN, result.refreshToken],
          [STORAGE_KEYS.USER, JSON.stringify(result.user)],
        ]);

        setState(prev => ({
          ...prev,
          user: result.user,
          isAuthenticated: true,
          loginStep: 'phone',
          otpExpiresAt: null,
        }));

        navigationRef.current?.reset({
          index: 0,
          routes: [{name: 'Merchant'}],
        });
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: extractErrorMessage(err),
        }));
        throw err;
      }
    },
    [navigationRef],
  );

  const resendOTP = useCallback(async (phone: string) => {
    setState(prev => ({...prev, error: null}));
    try {
      const result = await AuthAPI.resendOTP(phone);
      setState(prev => ({
        ...prev,
        otpExpiresAt: result.otpExpiresAt ?? null,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: extractErrorMessage(err),
      }));
      throw err;
    }
  }, []);

  const logoutAction = useCallback(async () => {
    try {
      const storedRefreshToken = await AsyncStorage.getItem(
        STORAGE_KEYS.REFRESH_TOKEN,
      );
      if (storedRefreshToken) {
        await AuthAPI.logout(storedRefreshToken).catch(() => {
          // Best-effort — clear locally regardless
        });
      }
    } finally {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER,
      ]);

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        loginStep: 'phone',
        otpExpiresAt: null,
        error: null,
      });

      navigationRef.current?.reset({
        index: 0,
        routes: [{name: 'Auth'}],
      });
    }
  }, [navigationRef]);

  const clearError = useCallback(() => {
    setState(prev => ({...prev, error: null}));
  }, []);

  // ── Value ────────────────────────────────────────────────────────────────

  const value: AuthContextValue = {
    ...state,
    sendOTP,
    verifyOTP,
    resendOTP,
    logout: logoutAction,
    clearError,
    navigationRef,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export default AuthContext;
