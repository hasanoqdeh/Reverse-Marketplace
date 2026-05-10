package com.reversemarketplace.merchantshared.core.network

import kotlinx.serialization.Serializable

// Merchant Models
@Serializable
data class Merchant(
    val id: String,
    val phone: String,
    val businessName: String,
    val email: String,
    val role: String,
    val isVerified: Boolean,
    val verificationStatus: String,
    val subscriptionPlan: String,
    val rating: Double,
    val totalDeals: Int,
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
    val merchant: Merchant,
    val accessToken: String,
    val refreshToken: String
)

// Request Models (from buyer perspective)
@Serializable
data class BuyerRequest(
    val id: String,
    val buyerId: String,
    val categoryId: String,
    val title: String,
    val description: String,
    val locationId: String,
    val locationName: String,
    val distance: Double?,
    val status: String,
    val bidCount: Int,
    val lowestBid: Double?,
    val createdAt: String,
    val updatedAt: String,
    val images: List<RequestImage> = emptyList(),
    val timeRemaining: Int // seconds until expiry
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
data class CreateBidRequest(
    val requestId: String,
    val price: Double,
    val currency: String,
    val deliveryTime: Int,
    val description: String,
    val warranty: Boolean = false
)

@Serializable
data class Bid(
    val id: String,
    val requestId: String,
    val merchantId: String,
    val price: Double,
    val currency: String,
    val deliveryTime: Int,
    val description: String,
    val warranty: Boolean,
    val status: String,
    val createdAt: String,
    val updatedAt: String,
    val merchant: Merchant? = null
)

// Deal Models
@Serializable
data class Deal(
    val id: String,
    val requestId: String,
    val bidId: String,
    val buyerId: String,
    val merchantId: String,
    val status: String,
    val finalPrice: Double,
    val currency: String,
    val createdAt: String,
    val updatedAt: String,
    val completedAt: String?,
    val buyerRequest: BuyerRequest? = null,
    val acceptedBid: Bid? = null
)

// Wallet Models
@Serializable
data class Wallet(
    val id: String,
    val merchantId: String,
    val balance: Double,
    val currency: String,
    val totalEarnings: Double,
    val pendingEarnings: Double,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class Transaction(
    val id: String,
    val walletId: String,
    val type: String, // CREDIT, DEBIT, FEE
    val amount: Double,
    val currency: String,
    val description: String,
    val referenceId: String?,
    val createdAt: String
)

// Subscription Models
@Serializable
data class SubscriptionPlan(
    val id: String,
    val name: String,
    val price: Double,
    val currency: String,
    val duration: Int, // days
    val features: List<String>,
    val bidFeeReduction: Double,
    val maxBidsPerDay: Int,
    val priorityMatching: Boolean
)

@Serializable
data class MerchantSubscription(
    val id: String,
    val merchantId: String,
    val planId: String,
    val status: String,
    val startDate: String,
    val endDate: String,
    val autoRenew: Boolean,
    val plan: SubscriptionPlan? = null
)

// Analytics Models
@Serializable
data class MerchantAnalytics(
    val merchantId: String,
    val period: String, // DAY, WEEK, MONTH
    val totalBids: Int,
    val acceptedBids: Int,
    val conversionRate: Double,
    val totalRevenue: Double,
    val averageBidPrice: Double,
    val bestPerformingCategory: String,
    val competitionInsights: CompetitionInsights
)

@Serializable
data class CompetitionInsights(
    val averageCompetitionPerRequest: Double,
    val winRate: Double,
    val averageWinningPrice: Double,
    val priceCompetitiveness: Double
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
    val updatedAt: String,
    val lastMessage: Message? = null
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

@Serializable
data class QuickReply(
    val id: String,
    val text: String,
    val isDefault: Boolean
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
    val data: Map<String, Any>
)

// Quick Bid Templates
@Serializable
data class QuickBidTemplate(
    val id: String,
    val name: String,
    val priceMultiplier: Double,
    val deliveryTimeDays: Int,
    val description: String
)
