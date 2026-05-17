import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://10.0.2.2:3000/api/v1';

async function getHeaders() {
  const token = await AsyncStorage.getItem('accessToken');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function request<T>(method: string, path: string, body?: object): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: await getHeaders(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data as T;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'SYSTEM' | 'REQUEST' | 'BID' | 'PAYMENT' | 'CHAT' | 'SUBSCRIPTION' | 'SECURITY' | 'MARKETING';
  title: string;
  content: string;
  channel: 'IN_APP' | 'PUSH' | 'EMAIL' | 'SMS' | 'WEBHOOK';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'PROCESSING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'EXPIRED' | 'READ';
  metadata: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

export interface NotifListResponse {
  success: boolean;
  notifications: NotificationItem[];
  unreadCount: number;
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const getMyNotifications = (params: { page?: number; limit?: number; unreadOnly?: boolean } = {}) => {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  return request<NotifListResponse>('GET', `/notifications${qs ? `?${qs}` : ''}`);
};

export const markNotificationRead = (id: string) =>
  request<{ success: boolean }>('POST', `/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  request<{ success: boolean; markedRead: number }>('POST', '/notifications/read-all');

export const deleteNotification = (id: string) =>
  request<{ success: boolean }>('DELETE', `/notifications/${id}`);

export const getNotificationPreferences = () =>
  request<{ success: boolean; preferences: unknown[] }>('GET', '/notifications/preferences');

export const updateNotificationPreferences = (preferences: unknown[]) =>
  request<{ success: boolean }>('PUT', '/notifications/preferences', { preferences });

export const registerDeviceChannel = (payload: {
  channelType: string; deviceToken?: string; emailAddress?: string; phoneNumber?: string; isEnabled?: boolean;
}) => request<{ success: boolean }>('POST', '/notifications/channel', payload);
