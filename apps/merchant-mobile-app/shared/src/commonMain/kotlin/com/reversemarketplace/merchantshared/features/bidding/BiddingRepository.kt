package com.reversemarketplace.merchantshared.features.bidding

import com.reversemarketplace.merchantshared.core.network.ApiClient
import com.reversemarketplace.merchantshared.core.network.ApiEndpoints
import com.reversemarketplace.merchantshared.core.network.CreateBidRequest
import com.reversemarketplace.merchantshared.core.network.Bid
import com.reversemarketplace.merchantshared.core.network.QuickBidTemplate

interface BiddingRepository {
    suspend fun submitBid(request: CreateBidRequest): Result<Bid>
    suspend fun getMyBids(): Result<List<Bid>>
    suspend fun getBidsForRequest(requestId: String): Result<List<Bid>>
    suspend fun getQuickBidTemplates(): Result<List<QuickBidTemplate>>
    suspend fun withdrawBid(bidId: String): Result<Unit>
}

class BiddingRepositoryImpl(
    private val apiClient: ApiClient
) : BiddingRepository {
    
    override suspend fun submitBid(request: CreateBidRequest): Result<Bid> {
        return try {
            val response = apiClient.post<Bid>(
                endpoint = ApiEndpoints.BIDS_CREATE,
                body = request,
                requiresAuth = true
            )
            
            if (response.isSuccess && response.getOrNull()?.data != null) {
                Result.success(response.getOrNull()!!.data!!)
            } else {
                Result.failure(Exception(response.exceptionOrNull()?.message ?: "Failed to submit bid"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getMyBids(): Result<List<Bid>> {
        return try {
            val response = apiClient.get<List<Bid>>(
                endpoint = ApiEndpoints.BIDS_MY_BIDS,
                requiresAuth = true
            )
            
            if (response.isSuccess && response.getOrNull()?.data != null) {
                Result.success(response.getOrNull()!!.data!!)
            } else {
                Result.failure(Exception(response.exceptionOrNull()?.message ?: "Failed to fetch my bids"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getBidsForRequest(requestId: String): Result<List<Bid>> {
        return try {
            val endpoint = ApiEndpoints.BIDS_BY_REQUEST.replace("{requestId}", requestId)
            val response = apiClient.get<List<Bid>>(
                endpoint = endpoint,
                requiresAuth = true
            )
            
            if (response.isSuccess && response.getOrNull()?.data != null) {
                Result.success(response.getOrNull()!!.data!!)
            } else {
                Result.failure(Exception(response.exceptionOrNull()?.message ?: "Failed to fetch bids for request"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getQuickBidTemplates(): Result<List<QuickBidTemplate>> {
        return try {
            val response = apiClient.get<List<QuickBidTemplate>>(
                endpoint = "/bids/quick-templates",
                requiresAuth = true
            )
            
            if (response.isSuccess && response.getOrNull()?.data != null) {
                Result.success(response.getOrNull()!!.data!!)
            } else {
                Result.failure(Exception(response.exceptionOrNull()?.message ?: "Failed to fetch quick bid templates"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun withdrawBid(bidId: String): Result<Unit> {
        return try {
            val endpoint = "${ApiEndpoints.BIDS_CREATE}/$bidId/withdraw"
            val response = apiClient.patch<Unit>(
                endpoint = endpoint,
                body = mapOf("action" to "withdraw"),
                requiresAuth = true
            )
            
            if (response.isSuccess) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.exceptionOrNull()?.message ?: "Failed to withdraw bid"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
