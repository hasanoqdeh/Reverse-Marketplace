import apiClient from './client';
import {ChatRoom, ChatMessage, PaginationMeta} from '../types/api';

export async function getMyRooms(params?: {page?: number; limit?: number; type?: string}): Promise<{
  rooms: ChatRoom[];
  pagination: PaginationMeta;
}> {
  const res = await apiClient.get('/chat/rooms', {params});
  return res.data;
}

export async function getRoom(roomId: string): Promise<ChatRoom> {
  const res = await apiClient.get(`/chat/rooms/${roomId}`);
  return res.data.room;
}

export async function createRoom(data: {
  name: string;
  type: string;
  participantIds?: string[];
  relatedRequestId?: string;
  relatedBidId?: string;
  description?: string;
}): Promise<ChatRoom> {
  const res = await apiClient.post('/chat/rooms', data);
  return res.data.room;
}

export async function getMessages(roomId: string, params?: {
  page?: number;
  limit?: number;
  before?: string;
}): Promise<{messages: ChatMessage[]; pagination: PaginationMeta}> {
  const res = await apiClient.get(`/chat/rooms/${roomId}/messages`, {params});
  return res.data;
}

export async function sendMessage(roomId: string, data: {
  content: string;
  type?: string;
  replyToId?: string;
  mediaUrls?: string[];
}): Promise<ChatMessage> {
  const res = await apiClient.post(`/chat/rooms/${roomId}/messages`, data);
  return res.data.message;
}

export async function markRoomRead(roomId: string): Promise<void> {
  await apiClient.post(`/chat/rooms/${roomId}/read`);
}

export async function deleteMessage(roomId: string, messageId: string): Promise<void> {
  await apiClient.delete(`/chat/rooms/${roomId}/messages/${messageId}`);
}

export async function leaveRoom(roomId: string): Promise<void> {
  await apiClient.delete(`/chat/rooms/${roomId}/participants/me`);
}

export async function uploadChatMedia(
  uri: string,
  mimeType: string,
  filename: string,
): Promise<{url: string; type: 'IMAGE' | 'VOICE'}> {
  const form = new FormData();
  form.append('file', {uri, type: mimeType, name: filename} as any);
  const res = await apiClient.post('/chat/upload', form, {
    headers: {'Content-Type': 'multipart/form-data'},
    timeout: 30000,
  });
  return res.data;
}
