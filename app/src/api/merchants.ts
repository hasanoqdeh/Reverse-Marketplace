import apiClient from './client';
import {PublicPlatformStats, TopMerchant} from '../types/api';

export async function getPublicStats(): Promise<PublicPlatformStats> {
  const res = await apiClient.get('/reviews/stats');
  return res.data.stats;
}

export async function getTopMerchants(limit = 8): Promise<TopMerchant[]> {
  const res = await apiClient.get('/reviews/merchants/top', {params: {limit}});
  return res.data.merchants ?? [];
}
