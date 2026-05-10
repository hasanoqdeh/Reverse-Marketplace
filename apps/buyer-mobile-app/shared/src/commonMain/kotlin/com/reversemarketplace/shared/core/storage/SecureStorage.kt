package com.reversemarketplace.shared.core.storage

import com.russhwolf.settings.Settings
import com.russhwolf.settings.set
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

interface SecureStorage {
    suspend fun saveAuthToken(token: String)
    suspend fun getAuthToken(): String?
    suspend fun saveRefreshToken(token: String)
    suspend fun getRefreshToken(): String?
    suspend fun clearTokens()
    fun getAuthTokenFlow(): Flow<String?>
}

class SecureStorageImpl(
    private val settings: Settings
) : SecureStorage {
    
    companion object {
        private const val AUTH_TOKEN_KEY = "auth_token"
        private const val REFRESH_TOKEN_KEY = "refresh_token"
    }
    
    private val _authTokenFlow = MutableStateFlow<String?>(null)
    
    override suspend fun saveAuthToken(token: String) {
        settings[AUTH_TOKEN_KEY] = token
        _authTokenFlow.value = token
    }
    
    override suspend fun getAuthToken(): String? {
        return settings.getStringOrNull(AUTH_TOKEN_KEY)
    }
    
    override suspend fun saveRefreshToken(token: String) {
        settings[REFRESH_TOKEN_KEY] = token
    }
    
    override suspend fun getRefreshToken(): String? {
        return settings.getStringOrNull(REFRESH_TOKEN_KEY)
    }
    
    override suspend fun clearTokens() {
        settings.remove(AUTH_TOKEN_KEY)
        settings.remove(REFRESH_TOKEN_KEY)
        _authTokenFlow.value = null
    }
    
    override fun getAuthTokenFlow(): Flow<String?> {
        return _authTokenFlow.asStateFlow()
    }
    
    init {
        // Initialize flow with stored token
        _authTokenFlow.value = getAuthToken()
    }
}
