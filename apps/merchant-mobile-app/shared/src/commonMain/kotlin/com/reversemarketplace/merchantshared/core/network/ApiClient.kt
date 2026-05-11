package com.reversemarketplace.merchantshared.core.network

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
    // Authentication
    const val AUTH_REQUEST_OTP = "/api/identity/auth/request-otp"
    const val AUTH_VERIFY_OTP = "/api/identity/auth/verify-otp"
    const val AUTH_REFRESH = "/api/identity/auth/refresh"
    const val AUTH_LOGOUT = "/api/identity/auth/logout"
    
    // Requests
    const val REQUESTS_ACTIVE = "/api/request/requests"
    const val REQUESTS_BY_ID = "/api/request/requests/{id}"
    const val REQUESTS_WATCHLIST = "/api/request/requests/watchlist"
    
    // Bids
    const val BIDS_CREATE = "/api/bidding/bids"
    const val BIDS_MY_BIDS = "/api/bidding/bids/my-bids"
    const val BIDS_BY_REQUEST = "/api/bidding/bids/request/{requestId}"
    
    // Deals
    const val DEALS_ACTIVE = "/api/request/requests"
    const val DEALS_HISTORY = "/api/request/requests/my-requests"
    const val DEALS_COMPLETE = "/api/request/requests/{id}/status"
    
    // Wallet
    const val WALLET_BALANCE = "/api/payment/wallet/balance"
    const val WALLET_TRANSACTIONS = "/api/payment/wallet/transactions"
    
    // Subscription
    const val SUBSCRIPTION_PLANS = "/api/payment/wallet/stats"
    const val SUBSCRIPTION_CURRENT = "/api/payment/wallet"
    const val SUBSCRIPTION_UPGRADE = "/api/payment/wallet"
    
    // Chat
    const val CHAT_CONVERSATIONS = "/api/chat/chat/conversations"
    const val CHAT_MESSAGES = "/api/chat/chat/messages/conversation/{conversationId}"
    const val CHAT_SEND_MESSAGE = "/api/chat/chat/messages"
    const val CHAT_QUICK_REPLIES = "/api/chat/chat/messages"
    
    // Analytics
    const val ANALYTICS_OVERVIEW = "/api/analytics/overview"
    const val ANALYTICS_PERFORMANCE = "/api/analytics/ratios"
    const val ANALYTICS_COMPETITION = "/api/analytics/category-trends"
}
