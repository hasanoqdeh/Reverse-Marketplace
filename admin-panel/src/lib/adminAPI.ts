// Admin API Client for Backend Integration

import { useState } from 'react';
import { User, AuthTokens, SessionManager, RefreshTokenRequest, RefreshTokenResponse, LogoutRequest, LogoutResponse } from './auth';

// Admin Login Request/Response Types
export interface AdminPhoneLoginRequest {
  phone: string;
  countryCode?: string;
}

export interface AdminPhoneLoginResponse {
  success: boolean;
  message: string;
  otpSent: boolean;
  expiresAt?: string;
  rateLimitExceeded?: boolean;
  nextAttemptAt?: string;
  accountLocked?: boolean;
  lockoutRemaining?: number;
}

export interface AdminOTPVerificationRequest {
  phone: string;
  otpCode: string;
  deviceFingerprint?: string;
}

export interface AdminOTPVerificationResponse {
  success: boolean;
  user: User;
  tokens: AuthTokens;
  sessionTimeout: number;
}

export interface AdminResendOTPRequest {
  phone: string;
}

export interface AdminResendOTPResponse {
  success: boolean;
  message: string;
  expiresAt?: string;
  cooldownRemaining?: number;
}

// User Management Types
export interface GetUsersRequest {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'BUYER' | 'MERCHANT' | 'ADMIN' | 'ALL';
  status?: 'PENDING' | 'ACTIVE' | 'BANNED' | 'SUSPENDED' | 'ALL';
  registrationDateFrom?: string;
  registrationDateTo?: string;
  lastLoginFrom?: string;
  lastLoginTo?: string;
  sortBy?: 'createdAt' | 'lastLoginAt' | 'phone' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface GetUsersResponse {
  success: boolean;
  users: Array<{
    id: string;
    phone: string;
    role: string;
    status: string;
    phoneVerified: boolean;
    createdAt: string;
    lastLoginAt: string | null;
    failedLoginAttempts: number;
    lockedUntil: string | null;
    profile?: {
      firstName: string;
      lastName: string;
      email?: string;
      city?: string;
      country?: string;
    };
    adminInfo?: {
      adminLevel: string;
      department?: string;
      isActive: boolean;
    };
    merchantInfo?: {
      businessName?: string;
      verificationStatus?: string;
      verificationDate?: string;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    appliedFilters: Record<string, any>;
    availableFilters: Array<{
      key: string;
      label: string;
      type: 'select' | 'date' | 'text';
      options?: Array<{ value: string; label: string }>;
    }>;
  };
}

export interface SuspendUserRequest {
  reason: string;
  duration?: number; // in hours, null for indefinite
  notifyUser?: boolean;
  internalNote?: string;
}

export interface SuspendUserResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    status: string;
    suspendedUntil: string | null;
  };
}

export interface BanUserRequest {
  reason: string;
  permanent: boolean;
  notifyUser?: boolean;
  internalNote?: string;
  deleteData?: boolean;
}

export interface BanUserResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    status: string;
    bannedAt: string;
  };
}

export interface BulkActionRequest {
  userIds: string[];
  action: 'SUSPEND' | 'BAN' | 'DELETE' | 'VERIFY' | 'SEND_NOTIFICATION';
  actionData: {
    reason?: string;
    duration?: number;
    notifyUsers?: boolean;
    internalNote?: string;
    message?: string;
  };
}

export interface BulkActionResponse {
  success: boolean;
  processed: number;
  successful: Array<{
    userId: string;
    success: boolean;
    message?: string;
  }>;
  failed: Array<{
    userId: string;
    error: string;
  }>;
  summary: {
    totalProcessed: number;
    successCount: number;
    failureCount: number;
  };
}

// Admin Management Types
export interface GetAdminsResponse {
  success: boolean;
  admins: Array<{
    id: string;
    phone: string;
    name: string;
    adminLevel: string;
    department?: string;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    permissions: Array<{
      resource: string;
      actions: string[];
    }>;
  }>;
}

export interface UpdatePermissionsRequest {
  permissions: Array<{
    resource: string;
    actions: string[];
  }>;
}

export interface UpdatePermissionsResponse {
  success: boolean;
  message: string;
  updatedPermissions: Array<{
    resource: string;
    actions: string[];
  }>;
}

// Dashboard & Analytics Types
export interface DashboardMetricsResponse {
  success: boolean;
  metrics: {
    users: {
      total: number;
      active: number;
      newToday: number;
      newThisWeek: number;
      byRole: Record<string, number>;
      byStatus: Record<string, number>;
    };
    authentication: {
      loginAttemptsToday: number;
      successfulLoginsToday: number;
      failedLoginsToday: number;
      otpSentToday: number;
      averageLoginTime: number;
    };
    security: {
      suspiciousActivities: number;
      blockedIPs: number;
      lockedAccounts: number;
      activeAdminSessions: number;
    };
    system: {
      uptime: number;
      apiResponseTime: number;
      databaseConnections: number;
      errorRate: number;
    };
  };
  trends: {
    userRegistrations: Array<{
      date: string;
      count: number;
    }>;
    loginActivity: Array<{
      date: string;
      successful: number;
      failed: number;
    }>;
    securityEvents: Array<{
      date: string;
      events: number;
    }>;
  };
}

export interface SecurityAlertsResponse {
  success: boolean;
  alerts: Array<{
    id: string;
    type: 'SUSPICIOUS_LOGIN' | 'RATE_LIMIT_EXCEEDED' | 'ACCOUNT_LOCKOUT' | 'ADMIN_ACCESS_ANOMALY';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    description: string;
    userId?: string;
    phone?: string;
    ipAddress?: string;
    occurredAt: string;
    status: 'NEW' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';
    actions: Array<{
      action: string;
      label: string;
      requiresConfirmation: boolean;
    }>;
  }>;
  summary: {
    total: number;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
  };
}

// Audit Logs Types
export interface AuditLogsRequest {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  action?: string;
  resource?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
  ipAddress?: string;
}

export interface AuditLogsResponse {
  success: boolean;
  logs: Array<{
    id: string;
    adminId: string;
    adminName: string;
    actionType: string;
    targetType: string;
    targetId?: string;
    targetPhone?: string;
    actionDetails: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    success: boolean;
    failureReason?: string;
    createdAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Notes Types
export interface UserNote {
  id: string;
  userId: string;
  adminId: string;
  adminName: string;
  noteType: 'GENERAL' | 'SUPPORT' | 'SECURITY' | 'VERIFICATION' | 'WARNING';
  noteContent: string;
  isInternal: boolean;
  isVisibleToUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddUserNoteRequest {
  userId: string;
  noteType: 'GENERAL' | 'SUPPORT' | 'SECURITY' | 'VERIFICATION' | 'WARNING';
  noteContent: string;
  isInternal?: boolean;
  isVisibleToUser?: boolean;
}

export interface GetUserNotesResponse {
  success: boolean;
  notes: UserNote[];
}

// Main Admin API Client
export class AdminAPI {
  private baseURL: string;
  private authAPI: any;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1') {
    this.baseURL = baseURL;
    // Import AuthAPI dynamically to avoid circular dependencies
    this.authAPI = null;
  }

  private async getAuthAPI() {
    if (!this.authAPI) {
      const { AuthAPI } = await import('./auth');
      this.authAPI = new AuthAPI(this.baseURL);
    }
    return this.authAPI;
  }

  // Admin Login APIs
  async adminPhoneLogin(data: AdminPhoneLoginRequest): Promise<AdminPhoneLoginResponse> {
    const url = `${this.baseURL}/identity/admin/auth/phone-login`;
    
    console.log('🔍 Admin Login API Request:', {
      url,
      method: 'POST',
      data
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        success: false,
        message: 'Network error',
        error: 'NETWORK_ERROR',
      }));
      throw new Error(error.message || 'Admin login failed');
    }

    return response.json();
  }

  async adminVerifyOTP(data: AdminOTPVerificationRequest): Promise<AdminOTPVerificationResponse> {
    const url = `${this.baseURL}/identity/admin/auth/verify-otp`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        success: false,
        message: 'OTP verification failed',
        error: 'OTP_VERIFICATION_FAILED',
      }));
      throw new Error(error.message || 'OTP verification failed');
    }

    return response.json();
  }

  async adminResendOTP(data: AdminResendOTPRequest): Promise<AdminResendOTPResponse> {
    const url = `${this.baseURL}/identity/admin/auth/resend-otp`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        success: false,
        message: 'Failed to resend OTP',
        error: 'OTP_RESEND_FAILED',
      }));
      throw new Error(error.message || 'Failed to resend OTP');
    }

    return response.json();
  }

  async adminRefreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const url = `${this.baseURL}/identity/admin/auth/refresh-token`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        success: false,
        message: 'Token refresh failed',
        error: 'TOKEN_REFRESH_FAILED',
      }));
      throw new Error(error.message || 'Token refresh failed');
    }

    return response.json();
  }

  async adminLogout(data: LogoutRequest): Promise<LogoutResponse> {
    const url = `${this.baseURL}/identity/admin/auth/logout`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        success: false,
        message: 'Logout failed',
        error: 'LOGOUT_FAILED',
      }));
      throw new Error(error.message || 'Logout failed');
    }

    return response.json();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const { accessToken } = SessionManager.getTokens();
    
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const url = `${this.baseURL}${endpoint}`;
    
    console.log('🔍 Admin API Request:', {
      url,
      method: options.method || 'GET',
    });

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        success: false,
        message: 'Network error',
        error: 'NETWORK_ERROR',
      }));
      
      // Handle token expiration - attempt refresh first
      if (response.status === 401) {
        try {
          const { refreshToken } = SessionManager.getTokens();
          if (refreshToken) {
            console.log('🔄 Attempting to refresh expired token...');
            const refreshResponse = await this.adminRefreshToken({ refreshToken });
            
            if (refreshResponse.success) {
              console.log('✅ Token refreshed successfully, retrying original request...');
              // Update tokens in storage
              SessionManager.setTokens(
                refreshResponse.tokens.accessToken,
                refreshResponse.tokens.refreshToken,
                refreshResponse.user
              );
              
              // Retry the original request with new token
              const { accessToken: newAccessToken } = SessionManager.getTokens();
              const retryResponse = await fetch(url, {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${newAccessToken}`,
                  ...options.headers,
                },
                ...options,
              });
              
              if (retryResponse.ok) {
                return retryResponse.json();
              }
            }
          }
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
        }
        
        // If refresh failed or no refresh token, clear and redirect
        SessionManager.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Session expired. Please login again.');
      }
      
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // User Management APIs
  async getUsers(params: GetUsersRequest = {}): Promise<GetUsersResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return this.request<GetUsersResponse>(`/identity/admin/users?${queryParams.toString()}`);
  }

  async getUserById(userId: string): Promise<{ success: boolean; user: any }> {
    return this.request<{ success: boolean; user: any }>(`/identity/admin/users/${userId}`);
  }

  async suspendUser(userId: string, data: SuspendUserRequest): Promise<SuspendUserResponse> {
    return this.request<SuspendUserResponse>(`/identity/admin/users/${userId}/suspend`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async banUser(userId: string, data: BanUserRequest): Promise<BanUserResponse> {
    return this.request<BanUserResponse>(`/identity/admin/users/${userId}/ban`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(userId: string, confirm: boolean): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/identity/admin/users/${userId}/delete`, {
      method: 'POST',
      body: JSON.stringify({ confirm }),
    });
  }

  async verifyUser(userId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/identity/admin/users/${userId}/verify`, {
      method: 'POST',
    });
  }

  async bulkUserAction(data: BulkActionRequest): Promise<BulkActionResponse> {
    return this.request<BulkActionResponse>('/identity/admin/users/bulk-action', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Admin Management APIs
  async getAdmins(): Promise<GetAdminsResponse> {
    return this.request<GetAdminsResponse>('/identity/admin/admins');
  }

  async updateAdminPermissions(adminId: string, data: UpdatePermissionsRequest): Promise<UpdatePermissionsResponse> {
    return this.request<UpdatePermissionsResponse>(`/identity/admin/admins/${adminId}/permissions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addAdminToWhitelist(data: { phone: string; adminLevel: string; department?: string }): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/identity/admin/whitelist', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeAdminFromWhitelist(adminId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/identity/admin/whitelist/${adminId}`, {
      method: 'DELETE',
    });
  }

  // Dashboard & Analytics APIs
  async getDashboardMetrics(): Promise<DashboardMetricsResponse> {
    return this.request<DashboardMetricsResponse>('/identity/admin/dashboard/metrics');
  }

  async getSecurityAlerts(): Promise<SecurityAlertsResponse> {
    return this.request<SecurityAlertsResponse>('/identity/admin/security/alerts');
  }

  async resolveSecurityAlert(alertId: string, resolution: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/identity/admin/security/alerts/${alertId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution }),
    });
  }

  // Audit Logs APIs
  async getAuditLogs(params: AuditLogsRequest = {}): Promise<AuditLogsResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return this.request<AuditLogsResponse>(`/identity/admin/audit-logs?${queryParams.toString()}`);
  }

  // User Notes APIs
  async getUserNotes(userId: string): Promise<GetUserNotesResponse> {
    return this.request<GetUserNotesResponse>(`/identity/admin/users/${userId}/notes`);
  }

  async addUserNote(data: AddUserNoteRequest): Promise<{ success: boolean; note: UserNote }> {
    return this.request<{ success: boolean; note: UserNote }>('/identity/admin/users/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUserNote(noteId: string, content: string): Promise<{ success: boolean; note: UserNote }> {
    return this.request<{ success: boolean; note: UserNote }>(`/identity/admin/users/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify({ noteContent: content }),
    });
  }

  async deleteUserNote(noteId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/identity/admin/users/notes/${noteId}`, {
      method: 'DELETE',
    });
  }

  // Session Management APIs
  async getUserSessions(userId: string): Promise<{ success: boolean; sessions: any[] }> {
    return this.request<{ success: boolean; sessions: any[] }>(`/identity/admin/users/${userId}/sessions`);
  }

  async terminateUserSession(userId: string, sessionId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/identity/admin/users/${userId}/sessions/${sessionId}/terminate`, {
      method: 'POST',
    });
  }

  async terminateAllUserSessions(userId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/identity/admin/users/${userId}/sessions/terminate-all`, {
      method: 'POST',
    });
  }

  // System Configuration APIs
  async getSystemConfiguration(): Promise<{ success: boolean; config: Record<string, any> }> {
    return this.request<{ success: boolean; config: Record<string, any> }>('/identity/admin/system/config');
  }

  async updateSystemConfiguration(config: Record<string, any>): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/identity/admin/system/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  // Export APIs
  async exportUsers(format: 'csv' | 'excel' | 'json', filters?: GetUsersRequest): Promise<Blob> {
    const queryParams = new URLSearchParams({ format });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseURL}/identity/admin/export/users?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${SessionManager.getTokens().accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  async exportAuditLogs(format: 'csv' | 'json', filters?: AuditLogsRequest): Promise<Blob> {
    const queryParams = new URLSearchParams({ format });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseURL}/identity/admin/export/audit-logs?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${SessionManager.getTokens().accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  // Health Check
  async healthCheck(): Promise<{ success: boolean; status: string; services: any }> {
    return this.request<{ success: boolean; status: string; services: any }>('/identity/auth/health');
  }
}

// Permission Management
export class PermissionManager {
  private static permissions: Record<string, string[]> = {
    'SUPER_ADMIN': [
      'user:view', 'user:edit', 'user:suspend', 'user:ban', 'user:delete',
      'admin:view', 'admin:edit', 'admin:add', 'admin:remove',
      'system:config', 'system:monitor', 'system:export',
      'security:view', 'security:manage', 'audit:view',
      'dashboard:view', 'analytics:view'
    ],
    'ADMIN': [
      'user:view', 'user:edit', 'user:suspend', 'user:ban',
      'admin:view', 'security:view', 'audit:view',
      'dashboard:view', 'analytics:view', 'system:export'
    ],
    'SUPPORT': [
      'user:view', 'user:edit', 'security:view', 'audit:view',
      'dashboard:view'
    ]
  };

  static hasPermission(adminLevel: string, permission: string): boolean {
    const permissions = this.permissions[adminLevel] || [];
    return permissions.includes(permission);
  }

  static getPermissions(adminLevel: string): string[] {
    return this.permissions[adminLevel] || [];
  }

  static canAccessResource(adminLevel: string, resource: string, action: string): boolean {
    const permission = `${resource}:${action}`;
    return this.hasPermission(adminLevel, permission);
  }
}

// React Hook for Admin API
export function useAdminAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = new AdminAPI();

  const executeRequest = async <T>(request: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await request();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    api,
    loading,
    error,
    executeRequest,
    clearError: () => setError(null),
  };
}
