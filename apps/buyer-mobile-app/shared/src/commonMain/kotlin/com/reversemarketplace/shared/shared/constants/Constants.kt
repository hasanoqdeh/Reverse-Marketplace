package com.reversemarketplace.shared.shared.constants

object AppConstants {
    // Request limits
    const val MAX_IMAGES_PER_REQUEST = 10
    const val MAX_IMAGE_SIZE_MB = 10
    const val MAX_DESCRIPTION_LENGTH = 1000
    
    // OTP settings
    const val OTP_LENGTH = 6
    const val OTP_RESEND_DELAY_SECONDS = 30
    const val OTP_EXPIRY_SECONDS = 300
    
    // Pagination
    const val DEFAULT_PAGE_SIZE = 20
    const val MAX_PAGE_SIZE = 100
    
    // Socket events
    object SocketEvents {
        const val BID_SUBMITTED = "bid.submitted"
        const val BID_ACCEPTED = "bid.accepted"
        const val BID_REJECTED = "bid.rejected"
        const val MESSAGE_SENT = "chat.message.sent"
        const val MESSAGE_READ = "chat.message.read"
        const val TYPING_START = "chat.user.typing"
        const val TYPING_STOP = "chat.user.stop_typing"
        const val REQUEST_UPDATED = "request.updated"
        const val REQUEST_COMPLETED = "request.completed"
        const val REQUEST_CANCELLED = "request.cancelled"
    }
    
    // Categories
    object Categories {
        const val SPARE_PARTS = "spare_parts"
        const val ELECTRONICS = "electronics"
        const val FURNITURE = "furniture"
        const val CUSTOM = "custom"
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
    
    // Message types
    object MessageTypes {
        const val TEXT = "TEXT"
        const val IMAGE = "IMAGE"
        const val VOICE = "VOICE"
        const val VIDEO = "VIDEO"
        const val LOCATION = "LOCATION"
        const val SYSTEM = "SYSTEM"
    }
    
    // User roles
    object UserRoles {
        const val USER = "USER"
        const val MERCHANT = "MERCHANT"
        const val ADMIN = "ADMIN"
    }
}
