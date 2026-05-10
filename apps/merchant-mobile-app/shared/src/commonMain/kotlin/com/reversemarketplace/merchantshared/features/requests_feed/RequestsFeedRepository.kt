package com.reversemarketplace.merchantshared.features.requests_feed

import com.reversemarketplace.merchantshared.core.network.ApiClient
import com.reversemarketplace.merchantshared.core.network.ApiEndpoints
import com.reversemarketplace.merchantshared.core.network.BuyerRequest
import com.reversemarketplace.merchantshared.shared.models.ViewState

interface RequestsFeedRepository {
    suspend fun getActiveRequests(
        category: String? = null,
        location: String? = null,
        radius: Int? = null
    ): Result<List<BuyerRequest>>
    
    suspend fun getRequestById(requestId: String): Result<BuyerRequest>
    suspend fun addToWatchlist(requestId: String): Result<Unit>
    suspend fun removeFromWatchlist(requestId: String): Result<Unit>
    suspend fun getWatchlist(): Result<List<BuyerRequest>>
}

class RequestsFeedRepositoryImpl(
    private val apiClient: ApiClient
) : RequestsFeedRepository {
    
    override suspend fun getActiveRequests(
        category: String?,
        location: String?,
        radius: Int?
    ): Result<List<BuyerRequest>> {
        return try {
            val parameters = mutableMapOf<String, String>()
            
            category?.let { parameters["category"] = it }
            location?.let { parameters["location"] = it }
            radius?.let { parameters["radius"] = it.toString() }
            
            val response = apiClient.get<List<BuyerRequest>>(
                endpoint = ApiEndpoints.REQUESTS_ACTIVE,
                requiresAuth = true,
                parameters = parameters
            )
            
            if (response.isSuccess && response.getOrNull()?.data != null) {
                Result.success(response.getOrNull()!!.data!!)
            } else {
                Result.failure(Exception(response.exceptionOrNull()?.message ?: "Failed to fetch requests"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getRequestById(requestId: String): Result<BuyerRequest> {
        return try {
            val endpoint = ApiEndpoints.REQUESTS_BY_ID.replace("{id}", requestId)
            val response = apiClient.get<BuyerRequest>(
                endpoint = endpoint,
                requiresAuth = true
            )
            
            if (response.isSuccess && response.getOrNull()?.data != null) {
                Result.success(response.getOrNull()!!.data!!)
            } else {
                Result.failure(Exception(response.exceptionOrNull()?.message ?: "Failed to fetch request"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun addToWatchlist(requestId: String): Result<Unit> {
        return try {
            val response = apiClient.post<Unit>(
                endpoint = ApiEndpoints.REQUESTS_WATCHLIST,
                body = mapOf("requestId" to requestId),
                requiresAuth = true
            )
            
            if (response.isSuccess) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.exceptionOrNull()?.message ?: "Failed to add to watchlist"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun removeFromWatchlist(requestId: String): Result<Unit> {
        return try {
            val endpoint = "${ApiEndpoints.REQUESTS_WATCHLIST}/$requestId"
            // Note: This would need a DELETE endpoint, using PATCH for now
            val response = apiClient.patch<Unit>(
                endpoint = endpoint,
                body = mapOf("action" to "remove"),
                requiresAuth = true
            )
            
            if (response.isSuccess) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.exceptionOrNull()?.message ?: "Failed to remove from watchlist"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getWatchlist(): Result<List<BuyerRequest>> {
        return try {
            val response = apiClient.get<List<BuyerRequest>>(
                endpoint = ApiEndpoints.REQUESTS_WATCHLIST,
                requiresAuth = true
            )
            
            if (response.isSuccess && response.getOrNull()?.data != null) {
                Result.success(response.getOrNull()!!.data!!)
            } else {
                Result.failure(Exception(response.exceptionOrNull()?.message ?: "Failed to fetch watchlist"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
