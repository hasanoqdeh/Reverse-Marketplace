import apiClient from './client';
import {Bid, BidCompetition, FulfillmentStatus, PaginationMeta} from '../types/api';

export async function submitBid(data: {
  requestId: string;
  amount: number;
  deliveryDays: number;
  deliveryNotes?: string;
  specialTerms?: string;
}): Promise<{bidId: string; competition: BidCompetition}> {
  const res = await apiClient.post('/bidding/bids', data);
  return res.data;
}

export async function getBid(id: string): Promise<Bid> {
  const res = await apiClient.get(`/bidding/bids/${id}`);
  return res.data.bid;
}

export async function updateBid(
  id: string,
  data: {amount?: number; deliveryDays?: number; deliveryNotes?: string; specialTerms?: string},
): Promise<Bid> {
  const res = await apiClient.put(`/bidding/bids/${id}`, data);
  return res.data.bid;
}

export async function withdrawBid(id: string): Promise<void> {
  await apiClient.delete(`/bidding/bids/${id}`);
}

export async function getMyBids(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{bids: Bid[]; pagination: PaginationMeta}> {
  const res = await apiClient.get('/bidding/me/bids', {params});
  return res.data;
}

export async function getRequestBids(
  requestId: string,
  params?: {page?: number; limit?: number; sortBy?: string; sortOrder?: string},
): Promise<{
  bids: Bid[];
  pagination: PaginationMeta;
  marketAnalysis: {totalBids: number; lowestAmount: number | null; averageAmount: number | null};
}> {
  const res = await apiClient.get(`/bidding/requests/${requestId}/bids`, {params});
  return res.data;
}

export async function acceptBid(bidId: string): Promise<{bidId: string; merchantId: string}> {
  const res = await apiClient.post(`/bidding/bids/${bidId}/accept`);
  return res.data;
}

export async function rejectBid(bidId: string): Promise<void> {
  await apiClient.post(`/bidding/bids/${bidId}/reject`);
}

export async function updateFulfillmentStatus(
  bidId: string,
  status: FulfillmentStatus,
): Promise<Bid> {
  const res = await apiClient.patch(`/bidding/bids/${bidId}/fulfillment`, {status});
  return res.data.bid;
}

export async function confirmDelivery(
  bidId: string,
): Promise<{bidId: string; merchantId: string}> {
  const res = await apiClient.post(`/bidding/bids/${bidId}/confirm`);
  return res.data;
}
