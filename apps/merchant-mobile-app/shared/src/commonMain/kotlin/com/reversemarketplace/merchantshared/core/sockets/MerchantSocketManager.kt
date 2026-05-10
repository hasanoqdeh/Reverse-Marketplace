package com.reversemarketplace.merchantshared.core.sockets

import io.socket.client.IO
import io.socket.client.Socket
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.serialization.json.Json
import org.json.JSONObject

data class SocketMessage(
    val type: String,
    val data: Map<String, Any>
)

class MerchantSocketManager(
    private val getAuthToken: () -> String?
) {
    private val json = Json { ignoreUnknownKeys = true }
    private var socket: Socket? = null
    private var isConnected = false
    
    private val _messageFlow = MutableSharedFlow<SocketMessage>()
    val messageFlow: SharedFlow<SocketMessage> = _messageFlow.asSharedFlow()
    
    fun connect(url: String) {
        try {
            val token = getAuthToken()
            if (token == null) {
                throw Exception("No auth token available")
            }
            
            val options = IO.Options().apply {
                auth = mapOf("token" to token)
                reconnection = true
                reconnectionDelay = 5000
                reconnectionAttempts = 10
            }
            
            socket = IO.socket("${url}/merchant-socket", options)
            
            socket?.apply {
                on(Socket.EVENT_CONNECT) {
                    isConnected = true
                    // Emit merchant ready event
                    emit("merchant_ready", JSONObject())
                }
                
                on(Socket.EVENT_DISCONNECT) {
                    isConnected = false
                }
                
                on(Socket.EVENT_CONNECT_ERROR) { error ->
                    isConnected = false
                    // Handle connection error
                }
                
                // Merchant-specific events
                on("new_request") { data ->
                    handleSocketEvent("new_request", data)
                }
                
                on("bid_accepted") { data ->
                    handleSocketEvent("bid_accepted", data)
                }
                
                on("bid_rejected") { data ->
                    handleSocketEvent("bid_rejected", data)
                }
                
                on("request_expired") { data ->
                    handleSocketEvent("request_expired", data)
                }
                
                on("chat_message") { data ->
                    handleSocketEvent("chat_message", data)
                }
                
                on("buyer_typing") { data ->
                    handleSocketEvent("buyer_typing", data)
                }
                
                on("deal_completed") { data ->
                    handleSocketEvent("deal_completed", data)
                }
                
                on("subscription_updated") { data ->
                    handleSocketEvent("subscription_updated", data)
                }
            }
            
            socket?.connect()
        } catch (e: Exception) {
            isConnected = false
            throw e
        }
    }
    
    fun disconnect() {
        socket?.disconnect()
        socket = null
        isConnected = false
    }
    
    fun sendMessage(event: String, data: Map<String, Any>) {
        socket?.emit(event, JSONObject(data))
    }
    
    fun bidOnRequest(requestId: String, bidData: Map<String, Any>) {
        sendMessage("submit_bid", mapOf(
            "requestId" to requestId,
            "bidData" to bidData
        ))
    }
    
    fun markMessageAsRead(conversationId: String, messageId: String) {
        sendMessage("mark_read", mapOf(
            "conversationId" to conversationId,
            "messageId" to messageId
        ))
    }
    
    fun sendTypingIndicator(conversationId: String, isTyping: Boolean) {
        sendMessage("typing", mapOf(
            "conversationId" to conversationId,
            "isTyping" to isTyping
        ))
    }
    
    fun subscribeToRequests(filters: Map<String, Any>) {
        sendMessage("subscribe_requests", filters)
    }
    
    fun unsubscribeFromRequests() {
        sendMessage("unsubscribe_requests", emptyMap<String, Any>())
    }
    
    fun getConnectionStatus(): Boolean = isConnected
    
    private fun handleSocketEvent(eventType: String, data: Array<Any>) {
        try {
            if (data.isNotEmpty() && data[0] is JSONObject) {
                val jsonObject = data[0] as JSONObject
                val dataMap = jsonObject.toMap().mapValues { 
                    when (val value = it.value) {
                        is String -> value
                        is Number -> value
                        is Boolean -> value
                        else -> value.toString()
                    }
                }
                
                val socketMessage = SocketMessage(eventType, dataMap)
                _messageFlow.tryEmit(socketMessage)
            }
        } catch (e: Exception) {
            // Handle parsing error
        }
    }
}

// Extension function to convert JSONObject to Map
private fun JSONObject.toMap(): Map<String, Any> {
    return keys().asSequence().associateWith { get(it) }
}
