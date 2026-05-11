import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          } as any;
        }
        return config;
      },
      (error: unknown) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: unknown) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          this.handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_token');
    }
    return null;
  }

  private handleUnauthorized(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/auth/login';
    }
  }

  // Generic HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, config);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      console.log('API POST request:', { url, data, baseURL: this.client.defaults.baseURL });
      const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data, config);
      console.log('API POST response:', response);
      return response.data;
    } catch (error: unknown) {
      console.error('API POST error:', error);
      throw this.handleError(error);
    }
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.put(url, data, config);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.patch(url, data, config);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url, config);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.message) {
        return new Error(error.response.data.message);
      }
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors) && error.response.data.errors.length > 0) {
        return new Error(error.response.data.errors.join(', '));
      }
      if (error.message) {
        return new Error(error.message);
      }
    }
    return new Error('An unexpected error occurred');
  }

  // File upload
  async uploadFile(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<unknown>> {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: any) => {
        if (onProgress && progressEvent && typeof progressEvent === 'object' && 'total' in progressEvent && 'loaded' in progressEvent) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    try {
      const response: AxiosResponse<ApiResponse<unknown>> = await this.client.post(url, formData, config);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }
}

export const apiService = new ApiService();

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REQUEST_OTP: '/api/identity/auth/request-otp',
    VERIFY_OTP: '/api/identity/auth/verify-otp',
    LOGIN: '/api/identity/auth/verify-otp',
    LOGOUT: '/api/identity/auth/logout',
    REFRESH: '/api/identity/auth/refresh',
    ME: '/api/identity/users/me',
  },

  // Users
  USERS: {
    LIST: '/api/identity/users/admin/all',
    BY_ID: (id: string) => `/api/admin/users/${id}`,
    BAN: (id: string) => `/api/admin/users/${id}/ban`,
    UNBAN: (id: string) => `/api/admin/users/${id}/unban`,
    UPDATE: (id: string) => `/api/admin/users/${id}`,
    BANNED: '/api/admin/users/banned',
    STATS: '/api/admin/users/stats',
  },

  // Merchants
  MERCHANTS: {
    LIST: '/api/admin/merchants/pending',
    BY_ID: (id: string) => `/api/admin/merchants/${id}`,
    VERIFY: (id: string) => `/api/admin/merchants/${id}/approve`,
    REJECT: (id: string) => `/api/admin/merchants/${id}/reject`,
    SUSPEND: (id: string) => `/api/admin/merchants/${id}/reject`,
    STATS: '/api/admin/merchants/stats',
  },

  // Requests
  REQUESTS: {
    LIST: '/api/request/requests/my-requests',
    BY_ID: (id: string) => `/api/request/requests/${id}`,
    HEATMAP: '/api/request/requests/analytics',
    TIMELINE: (id: string) => `/api/request/requests/${id}`,
  },

  // Bids
  BIDS: {
    LIST: '/api/bidding/bids/my-bids',
    BY_ID: (id: string) => `/api/bidding/bids/${id}`,
    FRAUD_DETECTION: '/api/bidding/bids/request/analytics',
    ACCEPTANCE_TRACKING: '/api/bidding/bids/my-bids',
  },

  // Payments
  PAYMENTS: {
    REVENUE: '/api/payment/wallet/stats',
    TRANSACTIONS: '/api/payment/wallet/transactions',
    GATEWAY_LOGS: '/api/payment/wallet/transactions',
    REFUNDS: '/api/payment/wallet/transactions',
    RECONCILIATION: '/api/payment/wallet/stats',
  },

  // Disputes
  DISPUTES: {
    LIST: '/api/chat/chat/conversations',
    BY_ID: (id: string) => `/api/chat/chat/conversations/${id}`,
    RESOLVE: (id: string) => `/api/chat/chat/conversations/${id}`,
    EVIDENCE: (id: string) => `/api/chat/chat/uploads`,
    CHAT_ACCESS: (id: string) => `/api/chat/chat/messages`,
  },

  // Analytics
  ANALYTICS: {
    OVERVIEW: '/api/analytics/overview',
    CATEGORY_TRENDS: '/api/analytics/category-trends',
    GEOGRAPHIC: '/api/analytics/geographic',
    RATIOS: '/api/analytics/ratios',
    REVENUE_PER_CATEGORY: '/api/analytics/revenue-per-category',
  },

  // System Health
  SYSTEM_HEALTH: {
    SERVICES: '/api/identity/health',
    METRICS: '/api/identity/metrics',
    LATENCY: '/api/identity/health',
    ERROR_RATE: '/api/identity/metrics',
    QUEUES: '/api/identity/health',
    DATABASE: '/api/identity/health',
    REDIS: '/api/identity/health',
    RABBITMQ: '/api/identity/health',
  },

  // Audit Logs
  AUDIT: {
    LOGS: '/api/admin/users/stats',
    SECURITY_EVENTS: '/api/admin/users/banned',
    DATA_CHANGES: '/api/admin/users/stats',
    COMPLIANCE_REPORTS: '/api/admin/users/stats',
  },

  // Configuration
  CONFIG: {
    CATEGORIES: '/api/request/requests',
    PRICING_RULES: '/api/payment/wallet/stats',
    SUBSCRIPTION_PLANS: '/api/payment/wallet/stats',
    FEATURE_FLAGS: '/api/admin/users/stats',
    SYSTEM: '/api/identity/health',
  },

  // Notifications
  NOTIFICATIONS: {
    ALERTS: '/api/notification/notifications',
    ROUTING: '/api/notification/notifications',
    INTEGRATIONS: '/api/notification/notifications',
  },
};
