import apiClient from './client';
import {MerchantProfile, PaginationMeta, Review} from '../types/api';

export async function submitReview(data: {
  bidId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
}): Promise<Review> {
  const res = await apiClient.post('/reviews', data);
  return res.data.review;
}

export async function getReviews(
  userId: string,
  params?: {page?: number; limit?: number},
): Promise<{reviews: Review[]; pagination: PaginationMeta}> {
  const res = await apiClient.get(`/reviews/user/${userId}`, {params});
  return res.data;
}

export async function getMerchantProfile(
  merchantId: string,
): Promise<MerchantProfile> {
  const res = await apiClient.get(`/reviews/merchants/${merchantId}`);
  return res.data.merchant;
}
