package com.reversemarketplace.buyermobileapp.services

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.reversemarketplace.shared.core.sockets.SocketManager
import com.reversemarketplace.shared.shared.constants.SocketEvents
import com.reversemarketplace.shared.shared.models.SocketEvent
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import org.koin.android.ext.koin.androidContext
import org.koin.core.scope.KoinScope
import org.koin.core.scope.koinScope

class SocketService(
    private val application: Application,
    private val socketManager: SocketManager
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
                "buyer_socket_events",
                "Buyer Socket Events",
                "Notifications for real-time buyer events"
            ).apply {
                description = "Shows notifications for new bids, chat messages, and deal updates"
                importance = NotificationManager.IMPORTANCE_HIGH
            }
            
            notificationManager = application.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
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
            SocketEvents.BID_SUBMITTED -> {
                showNotification(
                    title = "New Bid Received!",
                    message = "A merchant has placed a bid on your request"
                )
            }
            
            SocketEvents.BID_ACCEPTED -> {
                showNotification(
                    title = "Bid Accepted!",
                    message = "Your bid has been accepted by the buyer"
                )
            }
            
            SocketEvents.BID_REJECTED -> {
                showNotification(
                    title = "Bid Rejected",
                    message = "Your bid was not accepted"
                )
            }
            
            SocketEvents.REQUEST_EXPIRED -> {
                showNotification(
                    title = "Request Expired",
                    message = "Your request has expired without any accepted bids"
                )
            }
            
            SocketEvents.CHAT_MESSAGE -> {
                val messageData = event.data as? Map<String, Any>
                val messageText = messageData?.get("message") as? String
                val senderName = messageData?.get("senderName") as? String
                
                showNotification(
                    title = "New Message from $senderName",
                    message = messageText ?: "You received a new message"
                )
            }
            
            SocketEvents.DEAL_COMPLETED -> {
                showNotification(
                    title = "Deal Completed!",
                    message = "Your deal has been marked as completed"
                )
            }
        }
    }
    
    private fun showNotification(title: String, message: String) {
        val notification = NotificationCompat.Builder(application, "buyer_socket_events")
            .setSmallIcon(androidx.core.R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()
        
        notificationManager?.notify(0, notification)
    }
    
    fun connect() {
        socketManager.connect("ws://localhost:3000/buyer-socket")
    }
    
    fun disconnect() {
        socketManager.disconnect()
    }
    
    fun getConnectionStatus(): Boolean {
        return socketManager.getConnectionStatus()
    }
}
