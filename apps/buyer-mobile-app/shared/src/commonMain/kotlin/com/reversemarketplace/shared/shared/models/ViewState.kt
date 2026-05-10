package com.reversemarketplace.shared.shared.models

sealed class ViewState<out T> {
    object Loading : ViewState<Nothing>()
    data class Success<T>(val data: T) : ViewState<T>()
    data class Error(val message: String) : ViewState<Nothing>()
    
    val isLoading: Boolean
        get() = this is Loading
    
    val data: T?
        get() = (this as? Success)?.data
    
    val errorMessage: String?
        get() = (this as? Error)?.message
}

// Request states for UI
enum class RequestStatus {
    DRAFT,
    ACTIVE,
    HAS_BIDS,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED,
    EXPIRED
}

enum class BidStatus {
    PENDING,
    ACCEPTED,
    REJECTED,
    WITHDRAWN,
    EXPIRED,
    AUTO_REJECTED
}

enum class MessageType {
    TEXT,
    IMAGE,
    VOICE,
    VIDEO,
    LOCATION,
    SYSTEM
}
