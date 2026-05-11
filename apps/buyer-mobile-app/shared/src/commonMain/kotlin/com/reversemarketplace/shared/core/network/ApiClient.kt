package com.reversemarketplace.shared.core.network

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.defaultRequest
import io.ktor.client.plugins.logging.LogLevel
import io.ktor.client.plugins.logging.Logger
import io.ktor.client.plugins.logging.Logging
import io.ktor.client.plugins.logging.SIMPLE
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.URLProtocol
import io.ktor.serialization.kotlinx.json.json
import io.ktor.client.statement.HttpResponse
import io.ktor.client.request.get
import io.ktor.client.request.patch
import io.ktor.client.request.parameter

class ApiClient(
    private val baseUrl: String,
    private val getAuthToken: () -> String?
) {
    private val httpClient = HttpClient {
        install(ContentNegotiation) {
            json()
        }
        
        install(Logging) {
            logger = Logger.SIMPLE
            level = LogLevel.INFO
        }
        
        defaultRequest {
            url(baseUrl) {
                protocol = URLProtocol.HTTPS
            }
        }
    }
    
    suspend fun <T> post(
        endpoint: String,
        body: Any,
        requiresAuth: Boolean = false,
        headers: Map<String, String> = emptyMap()
    ): Result<ApiResponse<T>> {
        return try {
            val response = httpClient.post(endpoint) {
                if (requiresAuth) {
                    val token = getAuthToken()
                    if (token != null) {
                        header(HttpHeaders.Authorization, "Bearer $token")
                    }
                }
                
                headers.forEach { (key, value) ->
                    header(key, value)
                }
                
                setBody(body)
                contentType(ContentType.Application.Json)
            }
            
            Result.success(response.body<ApiResponse<T>>())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun <T> get(
        endpoint: String,
        requiresAuth: Boolean = false,
        parameters: Map<String, String> = emptyMap()
    ): Result<ApiResponse<T>> {
        return try {
            val response = httpClient.get(endpoint) {
                if (requiresAuth) {
                    val token = getAuthToken()
                    if (token != null) {
                        header(HttpHeaders.Authorization, "Bearer $token")
                    }
                }
                
                parameters.forEach { (key, value) ->
                    parameter(key, value)
                }
            }
            
            Result.success(response.body<ApiResponse<T>>())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun <T> patch(
        endpoint: String,
        body: Any,
        requiresAuth: Boolean = false
    ): Result<ApiResponse<T>> {
        return try {
            val response = httpClient.patch(endpoint) {
                if (requiresAuth) {
                    val token = getAuthToken()
                    if (token != null) {
                        header(HttpHeaders.Authorization, "Bearer $token")
                    }
                }
                
                setBody(body)
                contentType(ContentType.Application.Json)
            }
            
            Result.success(response.body<ApiResponse<T>>())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

// API Endpoints
object ApiEndpoints {
    const val AUTH_REQUEST_OTP = "/api/identity/auth/request-otp"
    const val AUTH_VERIFY_OTP = "/api/identity/auth/verify-otp"
    const val AUTH_REFRESH = "/api/identity/auth/refresh"
    const val AUTH_LOGOUT = "/api/identity/auth/logout"
    
    const val REQUESTS_DRAFT = "/api/request/requests/draft"
    const val REQUESTS_MY_REQUESTS = "/api/request/requests/my-requests"
    const val REQUESTS_BY_ID = "/api/request/requests/{id}"
    const val REQUESTS_PUBLISH = "/api/request/requests/{id}/publish"
    const val REQUESTS_IMAGES = "/api/request/requests/{id}/images"
    
    const val BIDS_BY_REQUEST = "/api/bidding/bids/request/{requestId}"
    const val BIDS_ACCEPT = "/api/bidding/bids/{id}/status"
    
    const val CHAT_CONVERSATIONS = "/api/chat/chat/conversations"
    const val CHAT_MESSAGES = "/api/chat/chat/messages/conversation/{conversationId}"
    const val CHAT_SEND_MESSAGE = "/api/chat/chat/messages"
    const val CHAT_MARK_READ = "/api/chat/chat/messages/read"
}
