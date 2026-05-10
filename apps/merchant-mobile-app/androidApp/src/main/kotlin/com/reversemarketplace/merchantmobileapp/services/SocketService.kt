package com.reversemarketplace.merchantmobileapp.services

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.reversemarketplace.merchantshared.core.sockets.MerchantSocketManager
import com.reversemarketplace.merchantshared.shared.constants.MerchantConstants
import com.reversemarketplace.merchantshared.shared.models.SocketEvent
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import org.koin.android.ext.koin.androidContext
import org.koin.core.scope.KoinScope
import org.koin.core.scope.koinScope

class SocketService(
    private val application: Application,
    private val socketManager: MerchantSocketManager
) : KoinScope {
    
    private val _socketEvents = MutableSharedFlow<SocketEvent>()
    val socketEvents: SharedFlow<SocketEvent> = _socketEvents.asSharedFlow()
    
    private var notificationManager: NotificationManager? = null
    
    init {
        createNotificationChannel()
        setupSocketListeners()
    }
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "merchant_socket_events",
                "Merchant Socket Events",
                "Notifications for real-time merchant events"
            ).apply {
                description = "Shows notifications for new requests, bid updates, and deal changes"
                importance = NotificationManager.IMPORTANCE_HIGH
            }
            
            notificationManager = application.getSystemService(Application.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager?.createNotificationChannel(channel)
        }
    }
    
    private fun setupSocketListeners() {
        // Listen to socket events
        socketManager.messageFlow.collect { event ->
            _socketEvents.tryEmit(event)
            handleSocketEvent(event)
        }
    }
    
    private fun handleSocketEvent(event: SocketEvent) {
        when (event.type) {
            MerchantConstants.SocketEvents.NEW_REQUEST -> {
                showNotification(
                    title = "New Request Available!",
                    message = "A new buyer request matching your filters is available"
                )
            }
            
            MerchantConstants.SocketEvents.BID_ACCEPTED -> {
                showNotification(
                    title = "Bid Accepted! 🎉",
                    message = "Your bid has been accepted by the buyer"
                )
            }
            
            MerchantConstants.SocketEvents.BID_REJECTED -> {
                showNotification(
                    title = "Bid Rejected",
                    message = "Your bid was not selected"
                )
            }
            
            MerchantConstants.SocketEvents.REQUEST_EXPIRED -> {
                showNotification(
                    title = "Request Expired",
                    message = "A request you bid on has expired"
                )
            }
            
            MerchantConstants.SocketEvents.DEAL_COMPLETED -> {
                showNotification(
                    title = "Deal Completed! 💰",
                    message = "Your deal has been marked as completed"
                )
            }
            
            MerchantConstants.SocketEvents.SUBSCRIPTION_UPDATED -> {
                showNotification(
                    title = "Subscription Updated",
                    message = "Your subscription plan has been updated"
                )
            }
        }
    }
    
    private fun showNotification(title: String, message: String) {
        val notification = NotificationCompat.Builder(application, "merchant_socket_events")
            .setSmallIcon(androidx.core.R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()
        
        notificationManager?.notify(0, notification)
    }
    
    fun connect() {
        socketManager.connect("ws://localhost:3000/merchant-socket")
    }
    
    fun disconnect() {
        socketManager.disconnect()
    }
    
    fun getConnectionStatus(): Boolean {
        return socketManager.getConnectionStatus()
    }
    
    fun subscribeToRequests(filters: Map<String, Any>) {
        socketManager.subscribeToRequests(filters)
    }
    
    fun unsubscribeFromRequests() {
        socketManager.unsubscribeFromRequests()
    }
}
