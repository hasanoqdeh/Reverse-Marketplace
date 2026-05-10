package com.reversemarketplace.merchantshared.features.auth

import com.reversemarketplace.merchantshared.core.network.ApiClient
import com.reversemarketplace.merchantshared.core.network.AuthRequest
import com.reversemarketplace.merchantshared.core.network.AuthResponse
import com.reversemarketplace.merchantshared.core.network.Merchant

interface AuthRepository {
    suspend fun requestOtp(phone: String): Result<AuthResponse>
    suspend fun verifyOtp(phone: String, otp: String): Result<AuthResponse>
    suspend fun refreshToken(refreshToken: String): Result<AuthResponse>
    suspend fun logout(): Result<Unit>
    suspend fun getCurrentMerchant(): Result<Merchant>
}

class AuthRepositoryImpl(
    private val apiClient: ApiClient
) : AuthRepository {
    
    override suspend fun requestOtp(phone: String): Result<AuthResponse> {
        return try {
            val response = apiClient.post<AuthResponse>(
                endpoint = "/auth/request-otp",
                body = AuthRequest(phone)
            )
            
            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to request OTP"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun verifyOtp(phone: String, otp: String): Result<AuthResponse> {
        return try {
            val response = apiClient.post<AuthResponse>(
                endpoint = "/auth/verify-otp",
                body = mapOf(
                    "phone" to phone,
                    "otp" to otp
                )
            )
            
            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to verify OTP"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun refreshToken(refreshToken: String): Result<AuthResponse> {
        return try {
            val response = apiClient.post<AuthResponse>(
                endpoint = "/auth/refresh",
                body = mapOf("refreshToken" to refreshToken)
            )
            
            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to refresh token"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun logout(): Result<Unit> {
        return try {
            val response = apiClient.post<Unit>(
                endpoint = "/auth/logout"
            )
            
            if (response.success) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.message ?: "Failed to logout"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getCurrentMerchant(): Result<Merchant> {
        return try {
            val response = apiClient.get<Merchant>(
                endpoint = "/auth/me",
                requiresAuth = true
            )
            
            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to get merchant profile"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
