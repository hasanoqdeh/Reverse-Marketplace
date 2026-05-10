package com.reversemarketplace.merchantmobileapp.ui.screens.requests_feed

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.reversemarketplace.merchantmobileapp.navigation.Screen
import com.reversemarketplace.merchantshared.shared.models.ViewState
import com.reversemarketplace.merchantshared.core.network.BuyerRequest
import com.reversemarketplace.merchantshared.features.requests_feed.RequestsFeedRepository
import org.koin.androidx.compose.koinViewModel

@Composable
fun RequestDetailScreen(navController: NavController, requestId: String) {
    val requestsFeedRepository: RequestsFeedRepository = koinViewModel()
    var request by remember { mutableStateOf<ViewState<BuyerRequest>>(ViewState.Loading) }
    
    LaunchedEffect(requestId) {
        // Load request details
        requestsFeedRepository.getRequestById(requestId).onSuccess { result ->
            request = ViewState.Success(result)
        }.onFailure { error ->
            request = ViewState.Error(error.message ?: "Failed to load request")
        }
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Top bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = { navController.popBackStack() }
            ) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back")
            }
            
            Spacer(modifier = Modifier.weight(1f))
            
            Text(
                text = "Request Details",
                style = MaterialTheme.typography.headlineMedium
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        when (val requestState = request) {
            is ViewState.Loading -> {
                Box(
                    modifier = Modifier.fillMaxWidth().weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            
            is ViewState.Error -> {
                Text(
                    text = requestState.message,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.fillMaxWidth().weight(1f)
                )
            }
            
            is ViewState.Success -> {
                val requestDetail = requestState.data
                
                // Request information
                Card(
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Text(
                            text = requestDetail.title,
                            style = MaterialTheme.typography.headlineSmall,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                        
                        Text(
                            text = requestDetail.description,
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                        
                        Text(
                            text = "Location: ${requestDetail.locationName}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                        
                        Text(
                            text = "Status: ${requestDetail.status}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                        
                        Text(
                            text = "Bids: ${requestDetail.bidCount}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                        
                        if (requestDetail.lowestBid != null) {
                            Text(
                                text = "Lowest Bid: $${requestDetail.lowestBid}",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.success,
                                modifier = Modifier.padding(bottom = 8.dp)
                            )
                        }
                        
                        Text(
                            text = "Distance: ${requestDetail.distance?.let { "${it.toInt()} km" } ?: "Not specified"}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                        
                        Text(
                            text = "Time Remaining: ${formatTimeRemaining(requestDetail.timeRemaining)}",
                            style = MaterialTheme.typography.bodySmall,
                            color = if (requestDetail.timeRemaining < 3600) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Action button
                Button(
                    onClick = {
                        navController.navigate("${Screen.SubmitBid.route}/$requestId")
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = requestDetail.status == "ACTIVE"
                ) {
                    Text("Submit Bid")
                }
            }
        }
    }
}

private fun formatTimeRemaining(seconds: Int): String {
    return when {
        seconds < 60 -> "${seconds}s"
        seconds < 3600 -> "${seconds / 60}m"
        seconds < 86400 -> "${seconds / 3600}h"
        else -> "${seconds / 86400}d"
    }
}
