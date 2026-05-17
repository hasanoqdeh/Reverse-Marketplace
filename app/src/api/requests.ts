import apiClient from './client';
import {MarketRequest, PaginationMeta, RequestCategory} from '../types/api';

export async function getCategories(): Promise<RequestCategory[]> {
  const res = await apiClient.get('/requests/categories');
  return res.data.categories ?? [];
}

export async function createDraft(data: {
  categoryId?: string;
  title?: string;
  description?: string;
  budgetMin?: number;
  budgetMax?: number;
}): Promise<{draftId: string; expiresAt: string}> {
  const res = await apiClient.post('/requests/draft', data);
  return res.data;
}

export async function publishRequest(data: {
  title: string;
  description: string;
  categoryId: string;
  budgetMin?: number;
  budgetMax?: number;
  expiresInDays?: number;
}): Promise<{requestId: string; publishedAt: string; expiresAt: string}> {
  const res = await apiClient.post('/requests/publish', data);
  return res.data;
}

export async function getMyRequests(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{requests: MarketRequest[]; pagination: PaginationMeta}> {
  const res = await apiClient.get('/requests/me/requests', {params});
  return res.data;
}

export async function getMyDrafts(): Promise<any[]> {
  const res = await apiClient.get('/requests/me/drafts');
  return res.data.drafts ?? [];
}

export async function getRequest(id: string): Promise<MarketRequest> {
  const res = await apiClient.get(`/requests/${id}`);
  return res.data.request;
}

export async function searchRequests(params?: {
  status?: string;
  categories?: string;
  budgetMin?: number;
  budgetMax?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}): Promise<{requests: MarketRequest[]; pagination: PaginationMeta}> {
  const res = await apiClient.get('/requests', {params});
  return res.data;
}

export async function cancelRequest(id: string, reason?: string): Promise<void> {
  await apiClient.post(`/requests/${id}/cancel`, {reason});
}

export async function extendRequest(
  id: string,
  reason?: string,
): Promise<{newExpiresAt: string}> {
  const res = await apiClient.post(`/requests/${id}/extend`, {reason});
  return res.data;
}
