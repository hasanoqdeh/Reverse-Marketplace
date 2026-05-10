package com.reversemarketplace.shared.core.network

import kotlinx.serialization.Serializable

// Domain Models
@Serializable
data class User(
    val id: String,
    val phone: String,
    val role: String,
    val isVerified: Boolean,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class AuthRequest(
    val phone: String
)

@Serializable
data class VerifyOtpRequest(
    val phone: String,
    val otp: String
)

@Serializable
data class AuthResponse(
    val user: User,
    val accessToken: String,
    val refreshToken: String
)

@Serializable
data class RefreshTokenRequest(
    val refreshToken: String
)

@Serializable
data class RefreshTokenResponse(
    val accessToken: String,
    val refreshToken: String
)

// Request Models
@Serializable
data class CreateRequestDraft(
    val categoryId: String,
    val title: String,
    val description: String,
    val locationId: String
)

@Serializable
data class Request(
    val id: String,
    val buyerId: String,
    val categoryId: String,
    val title: String,
    val description: String,
    val locationId: String,
    val status: String,
    val createdAt: String,
    val updatedAt: String,
    val images: List<RequestImage> = emptyList()
)

@Serializable
data class RequestImage(
    val id: String,
    val requestId: String,
    val imageUrl: String,
    val thumbnailUrl: String,
    val sortOrder: Int
)

// Bid Models
@Serializable
data class Bid(
    val id: String,
    val requestId: String,
    val merchantId: String,
    val price: Double,
    val currency: String,
    val deliveryTime: Int,
    val description: String,
    val status: String,
    val createdAt: String,
    val images: List<BidImage> = emptyList()
)

@Serializable
data class BidImage(
    val id: String,
    val bidId: String,
    val imageUrl: String,
    val thumbnailUrl: String
)

// Chat Models
@Serializable
data class Conversation(
    val id: String,
    val requestId: String,
    val buyerId: String,
    val merchantId: String,
    val status: String,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class Message(
    val id: String,
    val conversationId: String,
    val senderId: String,
    val messageType: String,
    val text: String?,
    val mediaUrl: String?,
    val isRead: Boolean,
    val createdAt: String
)

// API Response Wrapper
@Serializable
data class ApiResponse<T>(
    val success: Boolean,
    val data: T?,
    val message: String?,
    val errors: List<String>?
)

// Socket Events
@Serializable
data class SocketEvent(
    val type: String,
    val data: Map<String, String>
)
