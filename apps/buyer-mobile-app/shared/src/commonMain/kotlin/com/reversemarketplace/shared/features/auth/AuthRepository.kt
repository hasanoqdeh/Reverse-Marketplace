package com.reversemarketplace.shared.features.auth

import com.reversemarketplace.shared.core.network.ApiClient
import com.reversemarketplace.shared.core.network.ApiEndpoints
import com.reversemarketplace.shared.core.network.AuthRequest
import com.reversemarketplace.shared.core.network.VerifyOtpRequest
import com.reversemarketplace.shared.core.network.RefreshTokenRequest
import com.reversemarketplace.shared.core.network.AuthResponse
import com.reversemarketplace.shared.core.network.RefreshTokenResponse
import com.reversemarketplace.shared.core.network.User
import com.reversemarketplace.shared.core.storage.SecureStorage

interface AuthRepository {
    suspend fun requestOtp(phone: String): Result<Unit>
    suspend fun verifyOtp(phone: String, otp: String): Result<AuthResponse>
    suspend fun refreshToken(): Result<RefreshTokenResponse>
    suspend fun logout(): Result<Unit>
    fun getCurrentUser(): User?
}

class AuthRepositoryImpl(
    private val apiClient: ApiClient,
    private val secureStorage: SecureStorage
) : AuthRepository {
    
    override suspend fun requestOtp(phone: String): Result<Unit> {
        return try {
            val response = apiClient.post<Unit>(
                endpoint = ApiEndpoints.AUTH_REQUEST_OTP,
                body = AuthRequest(phone)
            )
            
            if (response.isSuccess) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.exceptionOrNull()?.message ?: "Failed to request OTP"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun verifyOtp(phone: String, otp: String): Result<AuthResponse> {
        return try {
            val response = apiClient.post<AuthResponse>(
                endpoint = ApiEndpoints.AUTH_VERIFY_OTP,
                body = VerifyOtpRequest(phone, otp)
            )
            
            if (response.isSuccess && response.getOrNull()?.data != null) {
                val authData = response.getOrNull()!!.data!!
                // Store tokens
                secureStorage.saveAuthToken(authData.accessToken)
                secureStorage.saveRefreshToken(authData.refreshToken)
                Result.success(authData)
            } else {
                Result.failure(Exception(response.exceptionOrNull()?.message ?: "OTP verification failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun refreshToken(): Result<RefreshTokenResponse> {
        return try {
            val refreshToken = secureStorage.getRefreshToken()
            if (refreshToken == null) {
                return Result.failure(Exception("No refresh token available"))
            }
            
            val response = apiClient.post<RefreshTokenResponse>(
                endpoint = ApiEndpoints.AUTH_REFRESH,
                body = RefreshTokenRequest(refreshToken)
            )
            
            if (response.isSuccess && response.getOrNull()?.data != null) {
                val tokenData = response.getOrNull()!!.data!!
                // Update stored tokens
                secureStorage.saveAuthToken(tokenData.accessToken)
                secureStorage.saveRefreshToken(tokenData.refreshToken)
                Result.success(tokenData)
            } else {
                Result.failure(Exception("Token refresh failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun logout(): Result<Unit> {
        return try {
            // Call logout endpoint
            apiClient.post<Unit>(
                endpoint = ApiEndpoints.AUTH_LOGOUT,
                body = emptyMap<String, String>(),
                requiresAuth = true
            )
            
            // Clear local tokens
            secureStorage.clearTokens()
            Result.success(Unit)
        } catch (e: Exception) {
            // Even if API call fails, clear local tokens
            secureStorage.clearTokens()
            Result.success(Unit)
        }
    }
    
    override fun getCurrentUser(): User? {
        // In a real implementation, this would decode JWT or fetch from local storage
        return null
    }
}
