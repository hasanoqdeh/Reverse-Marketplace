package com.reversemarketplace.shared.core.sockets

import io.ktor.client.HttpClient
import io.ktor.client.plugins.websocket.WebSocketSession
import io.ktor.client.plugins.websocket.webSocket
import io.ktor.http.URLProtocol
import io.ktor.websocket.Frame
import io.ktor.websocket.WebSocketException
import io.ktor.websocket.readText
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.serialization.json.Json

data class SocketMessage(
    val type: String,
    val data: Map<String, String>
)

class SocketManager(
    private val httpClient: HttpClient,
    private val getAuthToken: () -> String?
) {
    private val json = Json { ignoreUnknownKeys = true }
    private val scope = CoroutineScope(Dispatchers.Default)
    
    private val _messageFlow = MutableSharedFlow<SocketMessage>()
    val messageFlow: Flow<SocketMessage> = _messageFlow.asSharedFlow()
    
    private var session: WebSocketSession? = null
    private var isConnected = false
    
    suspend fun connect(url: String) {
        try {
            val token = getAuthToken()
            if (token == null) {
                throw Exception("No auth token available")
            }
            
            val wsUrl = "${url.replace("https", "wss")}/socket.io/?token=$token"
            
            httpClient.webSocket(
                request = {
                    url(wsUrl)
                    protocol = URLProtocol.WS
                }
            ) {
                isConnected = true
                session = this
                
                // Listen for incoming messages
                incoming.receiveAsFlow().collect { frame ->
                    if (frame is Frame.Text) {
                        try {
                            val messageText = frame.readText()
                            val message = json.decodeFromString<SocketMessage>(messageText)
                            _messageFlow.emit(message)
                        } catch (e: Exception) {
                            // Log error but continue
                        }
                    }
                }
            }
        } catch (e: WebSocketException) {
            isConnected = false
            // Handle reconnection logic
            reconnect(url)
        } catch (e: Exception) {
            isConnected = false
            throw e
        }
    }
    
    suspend fun sendMessage(message: SocketMessage) {
        try {
            session?.send(json.encodeToString(message))
        } catch (e: Exception) {
            // Handle send error
        }
    }
    
    suspend fun disconnect() {
        try {
            session?.close()
            isConnected = false
        } catch (e: Exception) {
            // Handle disconnect error
        }
    }
    
    private suspend fun reconnect(url: String) {
        while (!isConnected) {
            try {
                kotlinx.coroutines.delay(5000) // Wait 5 seconds before reconnecting
                connect(url)
            } catch (e: Exception) {
                // Log and continue retrying
                kotlinx.coroutines.delay(10000) // Wait longer after failed attempt
            }
        }
    }
    
    fun getConnectionStatus(): Boolean = isConnected
}
