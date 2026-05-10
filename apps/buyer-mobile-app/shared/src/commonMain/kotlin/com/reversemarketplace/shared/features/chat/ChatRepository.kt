package com.reversemarketplace.shared.features.chat

import com.reversemarketplace.shared.core.network.ApiClient
import com.reversemarketplace.shared.core.network.Conversation
import com.reversemarketplace.shared.core.network.Message
import com.reversemarketplace.shared.core.network.SendMessageRequest

interface ChatRepository {
    suspend fun getConversations(): Result<List<Conversation>>
    suspend fun getMessages(conversationId: String): Result<List<Message>>
    suspend fun sendMessage(request: SendMessageRequest): Result<Message>
    suspend fun markAsRead(conversationId: String, messageId: String): Result<Unit>
}

class ChatRepositoryImpl(
    private val apiClient: ApiClient
) : ChatRepository {
    
    override suspend fun getConversations(): Result<List<Conversation>> {
        return try {
            val response = apiClient.get<List<Conversation>>(
                endpoint = "/chat/conversations",
                requiresAuth = true
            )
            
            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to load conversations"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getMessages(conversationId: String): Result<List<Message>> {
        return try {
            val response = apiClient.get<List<Message>>(
                endpoint = "/chat/messages/conversation/$conversationId",
                requiresAuth = true
            )
            
            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to load messages"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun sendMessage(request: SendMessageRequest): Result<Message> {
        return try {
            val response = apiClient.post<Message>(
                endpoint = "/chat/messages",
                body = request,
                requiresAuth = true
            )
            
            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to send message"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun markAsRead(conversationId: String, messageId: String): Result<Unit> {
        return try {
            val response = apiClient.post<Unit>(
                endpoint = "/chat/messages/mark-read",
                body = mapOf(
                    "conversationId" to conversationId,
                    "messageId" to messageId
                ),
                requiresAuth = true
            )
            
            if (response.success) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.message ?: "Failed to mark message as read"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
