import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
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
      const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data, config);
      return response.data;
    } catch (error: unknown) {
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
    LOGIN: '/api/admin/auth/login',
    LOGOUT: '/api/admin/auth/logout',
    REFRESH: '/api/admin/auth/refresh',
    ME: '/api/admin/auth/me',
  },

  // Users
  USERS: {
    LIST: '/api/admin/users',
    BY_ID: (id: string) => `/api/admin/users/${id}`,
    BAN: (id: string) => `/api/admin/users/${id}/ban`,
    UNBAN: (id: string) => `/api/admin/users/${id}/unban`,
    UPDATE: (id: string) => `/api/admin/users/${id}`,
  },

  // Merchants
  MERCHANTS: {
    LIST: '/api/admin/merchants',
    BY_ID: (id: string) => `/api/admin/merchants/${id}`,
    VERIFY: (id: string) => `/api/admin/merchants/${id}/verify`,
    REJECT: (id: string) => `/api/admin/merchants/${id}/reject`,
    SUSPEND: (id: string) => `/api/admin/merchants/${id}/suspend`,
    PERFORMANCE: '/api/admin/merchants/performance',
    SUBSCRIPTIONS: '/api/admin/merchants/subscriptions',
  },

  // Requests
  REQUESTS: {
    LIST: '/api/admin/requests',
    BY_ID: (id: string) => `/api/admin/requests/${id}`,
    HEATMAP: '/api/admin/requests/heatmap',
    TIMELINE: (id: string) => `/api/admin/requests/${id}/timeline`,
  },

  // Bids
  BIDS: {
    LIST: '/api/admin/bids',
    BY_ID: (id: string) => `/api/admin/bids/${id}`,
    FRAUD_DETECTION: '/api/admin/bids/fraud-detection',
    ACCEPTANCE_TRACKING: '/api/admin/bids/acceptance-tracking',
  },

  // Payments
  PAYMENTS: {
    REVENUE: '/api/admin/payments/revenue',
    TRANSACTIONS: '/api/admin/payments/transactions',
    GATEWAY_LOGS: '/api/admin/payments/gateway-logs',
    REFUNDS: '/api/admin/payments/refunds',
    RECONCILIATION: '/api/admin/payments/reconciliation',
  },

  // Disputes
  DISPUTES: {
    LIST: '/api/admin/disputes',
    BY_ID: (id: string) => `/api/admin/disputes/${id}`,
    RESOLVE: (id: string) => `/api/admin/disputes/${id}/resolve`,
    EVIDENCE: (id: string) => `/api/admin/disputes/${id}/evidence`,
    CHAT_ACCESS: (id: string) => `/api/admin/disputes/${id}/chat`,
  },

  // Analytics
  ANALYTICS: {
    OVERVIEW: '/api/admin/analytics/overview',
    CATEGORY_TRENDS: '/api/admin/analytics/category-trends',
    GEOGRAPHIC: '/api/admin/analytics/geographic',
    RATIOS: '/api/admin/analytics/ratios',
    REVENUE_PER_CATEGORY: '/api/admin/analytics/revenue-per-category',
  },

  // System Health
  SYSTEM_HEALTH: {
    SERVICES: '/api/admin/system-health/services',
    METRICS: '/api/admin/system-health/metrics',
    LATENCY: '/api/admin/system-health/latency',
    ERROR_RATE: '/api/admin/system-health/error-rate',
    QUEUES: '/api/admin/system-health/queues',
    DATABASE: '/api/admin/system-health/database',
    REDIS: '/api/admin/system-health/redis',
    RABBITMQ: '/api/admin/system-health/rabbitmq',
  },

  // Audit Logs
  AUDIT: {
    LOGS: '/api/admin/audit/logs',
    SECURITY_EVENTS: '/api/admin/audit/security-events',
    DATA_CHANGES: '/api/admin/audit/data-changes',
    COMPLIANCE_REPORTS: '/api/admin/audit/compliance-reports',
  },

  // Configuration
  CONFIG: {
    CATEGORIES: '/api/admin/config/categories',
    PRICING_RULES: '/api/admin/config/pricing-rules',
    SUBSCRIPTION_PLANS: '/api/admin/config/subscription-plans',
    FEATURE_FLAGS: '/api/admin/config/feature-flags',
    SYSTEM: '/api/admin/config/system',
  },

  // Notifications
  NOTIFICATIONS: {
    ALERTS: '/api/admin/notifications/alerts',
    ROUTING: '/api/admin/notifications/routing',
    INTEGRATIONS: '/api/admin/notifications/integrations',
  },
};
