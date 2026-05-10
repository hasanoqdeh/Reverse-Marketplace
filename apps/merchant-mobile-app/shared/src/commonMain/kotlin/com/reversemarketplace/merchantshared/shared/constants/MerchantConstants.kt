package com.reversemarketplace.merchantshared.shared.constants

object MerchantConstants {
    // Bidding limits
    const val MAX_BID_DESCRIPTION_LENGTH = 500
    const val MAX_DELIVERY_TIME_DAYS = 30
    const val MIN_DELIVERY_TIME_HOURS = 1
    const val MAX_BID_IMAGES = 5
    
    // Request filters
    const val DEFAULT_SEARCH_RADIUS_KM = 50
    const val MAX_SEARCH_RADIUS_KM = 200
    
    // Subscription plans
    object SubscriptionPlans {
        const val FREE = "FREE"
        const val BASIC = "BASIC"
        const val PRO = "PRO"
        const val ENTERPRISE = "ENTERPRISE"
    }
    
    // Request statuses
    object RequestStatuses {
        const val DRAFT = "DRAFT"
        const val ACTIVE = "ACTIVE"
        const val IN_PROGRESS = "IN_PROGRESS"
        const val COMPLETED = "COMPLETED"
        const val CANCELLED = "CANCELLED"
        const val EXPIRED = "EXPIRED"
    }
    
    // Bid statuses
    object BidStatuses {
        const val PENDING = "PENDING"
        const val ACCEPTED = "ACCEPTED"
        const val REJECTED = "REJECTED"
        const val WITHDRAWN = "WITHDRAWN"
        const val EXPIRED = "EXPIRED"
        const val AUTO_REJECTED = "AUTO_REJECTED"
    }
    
    // Deal statuses
    object DealStatuses {
        const val ACCEPTED = "ACCEPTED"
        const val IN_PROGRESS = "IN_PROGRESS"
        const val COMPLETED = "COMPLETED"
        const val CANCELLED = "CANCELLED"
        const val DISPUTED = "DISPUTED"
    }
    
    // Message types
    object MessageTypes {
        const val TEXT = "TEXT"
        const val IMAGE = "IMAGE"
        const val VOICE = "VOICE"
        const val VIDEO = "VIDEO"
        const val LOCATION = "LOCATION"
        const val SYSTEM = "SYSTEM"
    }
    
    // Transaction types
    object TransactionTypes {
        const val CREDIT = "CREDIT"
        const val DEBIT = "DEBIT"
        const val FEE = "FEE"
        const val REFUND = "REFUND"
    }
    
    // Socket events
    object SocketEvents {
        const val NEW_REQUEST = "new_request"
        const val BID_ACCEPTED = "bid_accepted"
        const val BID_REJECTED = "bid_rejected"
        const val REQUEST_EXPIRED = "request_expired"
        const val CHAT_MESSAGE = "chat_message"
        const val BUYER_TYPING = "buyer_typing"
        const val DEAL_COMPLETED = "deal_completed"
        const val SUBSCRIPTION_UPDATED = "subscription_updated"
        const val MERCHANT_READY = "merchant_ready"
        const val SUBMIT_BID = "submit_bid"
        const val MARK_READ = "mark_read"
        const val TYPING = "typing"
        const val SUBSCRIBE_REQUESTS = "subscribe_requests"
        const val UNSUBSCRIBE_REQUESTS = "unsubscribe_requests"
    }
    
    // Quick bid templates
    object QuickBidTemplates {
        const val CHEAP_OFFER = "cheap_offer"
        const val PREMIUM_OFFER = "premium_offer"
        const val FAST_DELIVERY = "fast_delivery"
        const val BALANCED = "balanced"
    }
    
    // Performance targets
    object PerformanceTargets {
        const val BID_SUBMIT_TIME_MS = 10000 // 10 seconds
        const val SOCKET_LATENCY_MS = 200 // 200ms
        const val REQUEST_FEED_REFRESH_MS = 5000 // 5 seconds
        const val IMAGE_LOAD_TIME_MS = 2000 // 2 seconds
    }
    
    // Categories (same as buyer app)
    object Categories {
        const val SPARE_PARTS = "spare_parts"
        const val ELECTRONICS = "electronics"
        const val FURNITURE = "furniture"
        const val CUSTOM = "custom"
    }
    
    // Quick replies
    object QuickReplies {
        const val AVAILABLE = "Available"
        const val YES_IN_STOCK = "Yes, in stock"
        const val DELIVERY_TODAY = "Delivery available today"
        const val CONFIRM_ORDER = "Confirm order details"
        const val NEED_MORE_INFO = "Need more information"
        const val PROCESSING = "Processing your request"
    }
    
    // Verification statuses
    object VerificationStatuses {
        const val PENDING = "PENDING"
        const val VERIFIED = "VERIFIED"
        const val REJECTED = "REJECTED"
        const val SUSPENDED = "SUSPENDED"
    }
    
    // Analytics periods
    object AnalyticsPeriods {
        const val DAY = "DAY"
        const val WEEK = "WEEK"
        const val MONTH = "MONTH"
        const val YEAR = "YEAR"
    }
    
    // Wallet limits
    object WalletLimits {
        const val MIN_WITHDRAWAL_AMOUNT = 10.0
        const val MAX_WITHDRAWAL_AMOUNT = 10000.0
        const val WITHDRAWAL_FEE_PERCENTAGE = 0.02 // 2%
    }
}
