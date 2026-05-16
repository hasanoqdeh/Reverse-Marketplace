import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';

const BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/v1'
    : 'http://localhost:3000/api/v1';

let logoutCallback: (() => void) | null = null;

export function setLogoutCallback(cb: () => void): void {
  logoutCallback = cb;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach Bearer token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle 401 with token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: AxiosRequestConfig;
}> = [];

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach(({resolve, reject, config}) => {
    if (error) {
      reject(error);
    } else {
      if (config.headers) {
        (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
      }
      resolve(apiClient(config));
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({resolve, reject, config: originalRequest});
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
        if (!storedRefreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post<{
          success: boolean;
          tokens: {accessToken: string; refreshToken: string};
        }>(`${BASE_URL}/identity/auth/refresh-token`, {
          refreshToken: storedRefreshToken,
        });

        const {accessToken, refreshToken: newRefreshToken} = response.data.tokens;

        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', newRefreshToken);

        processQueue(null, accessToken);

        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>).Authorization =
            `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        if (logoutCallback) {
          logoutCallback();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
