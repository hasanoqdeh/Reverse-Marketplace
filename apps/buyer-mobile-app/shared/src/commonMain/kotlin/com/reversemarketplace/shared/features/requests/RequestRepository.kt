package com.reversemarketplace.shared.features.requests

import com.reversemarketplace.shared.core.network.ApiClient
import com.reversemarketplace.shared.core.network.ApiEndpoints
import com.reversemarketplace.shared.core.network.CreateRequestDraft
import com.reversemarketplace.shared.core.network.Request
import com.reversemarketplace.shared.core.network.RequestImage

interface RequestRepository {
    suspend fun createDraft(request: CreateRequestDraft): Result<Request>
    suspend fun publishRequest(requestId: String): Result<Request>
    suspend fun getMyRequests(): Result<List<Request>>
    suspend fun getRequestById(requestId: String): Result<Request>
    suspend fun uploadImages(requestId: String, images: List<ByteArray>): Result<List<RequestImage>>
}

class RequestRepositoryImpl(
    private val apiClient: ApiClient
) : RequestRepository {
    
    override suspend fun createDraft(request: CreateRequestDraft): Result<Request> {
        return try {
            val response = apiClient.post<Request>(
                endpoint = ApiEndpoints.REQUESTS_DRAFT,
                body = request,
                requiresAuth = true
            )
            
            if (response.isSuccess && response.getOrNull()?.data != null) {
                Result.success(response.getOrNull()!!.data!!)
            } else {
                Result.failure(Exception(response.exceptionOrNull()?.message ?: "Failed to create draft"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun publishRequest(requestId: String): Result<Request> {
        return try {
            val endpoint = ApiEndpoints.REQUESTS_PUBLISH.replace("{id}", requestId)
            val response = apiClient.patch<Request>(
                endpoint = endpoint,
                body = emptyMap<String, String>(),
                requiresAuth = true
            )
            
            if (response.isSuccess && response.getOrNull()?.data != null) {
                Result.success(response.getOrNull()!!.data!!)
            } else {
                Result.failure(Exception(response.exceptionOrNull()?.message ?: "Failed to publish request"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getMyRequests(): Result<List<Request>> {
        return try {
            val response = apiClient.get<List<Request>>(
                endpoint = ApiEndpoints.REQUESTS_MY_REQUESTS,
                requiresAuth = true
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
    
    override suspend fun getRequestById(requestId: String): Result<Request> {
        return try {
            val endpoint = ApiEndpoints.REQUESTS_BY_ID.replace("{id}", requestId)
            val response = apiClient.get<Request>(
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
    
    override suspend fun uploadImages(requestId: String, images: List<ByteArray>): Result<List<RequestImage>> {
        // This would need multipart form data implementation
        // For now, return a placeholder implementation
        return try {
            val endpoint = ApiEndpoints.REQUESTS_IMAGES.replace("{id}", requestId)
            // TODO: Implement multipart upload
            Result.success(emptyList())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
