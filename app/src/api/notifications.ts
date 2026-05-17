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

export type NotificationType =
  | 'NEW_MESSAGE'
  | 'BID_PLACED'
  | 'STATUS_IN_DELIVERY'
  | 'BID_ACCEPTED'
  | 'BUYER_REVIEW';

export interface NotificationData {
  chatRoomId?: string;
  roomName?: string;
  requestId?: string;
  requestTitle?: string;
  bidId?: string;
  merchantId?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: NotificationData;
  isRead: boolean;
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
