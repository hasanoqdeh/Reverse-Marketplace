package com.reversemarketplace.buyermobileapp.ui.screens.requests

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.reversemarketplace.buyermobileapp.navigation.Screen
import com.reversemarketplace.shared.shared.models.ViewState
import com.reversemarketplace.shared.core.network.BuyerRequest
import com.reversemarketplace.shared.core.network.Bid
import com.reversemarketplace.shared.features.requests.RequestRepository
import org.koin.androidx.compose.koinViewModel

@Composable
fun RequestDetailScreen(navController: NavController, requestId: String) {
    val requestRepository: RequestRepository = koinViewModel()
    var request by remember { mutableStateOf<ViewState<BuyerRequest>>(ViewState.Loading) }
    var bids by remember { mutableStateOf<ViewState<List<Bid>>>(ViewState.Loading) }
    
    LaunchedEffect(requestId) {
        // Load request details
        requestRepository.getRequestById(requestId).onSuccess { result ->
            request = ViewState.Success(result)
        }.onFailure { error ->
            request = ViewState.Error(error.message ?: "Failed to load request")
        }
        
        // Load bids for this request
        requestRepository.getBidsForRequest(requestId).onSuccess { result ->
            bids = ViewState.Success(result)
        }.onFailure { error ->
            bids = ViewState.Error(error.message ?: "Failed to load bids")
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
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        
                        Text(
                            text = "Status: ${requestDetail.status}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.primary
                        )
                        
                        Text(
                            text = "Bids: ${requestDetail.bidCount}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Bids section
                Text(
                    text = "Bids",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                
                when (val bidsState = bids) {
                    is ViewState.Loading -> {
                        Box(
                            modifier = Modifier.fillMaxWidth(),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator()
                        }
                    }
                    
                    is ViewState.Error -> {
                        Text(
                            text = bidsState.message,
                            color = MaterialTheme.colorScheme.error,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    
                    is ViewState.Success -> {
                        if (bidsState.data.isEmpty()) {
                            Text(
                                text = "No bids yet",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.fillMaxWidth()
                            )
                        } else {
                            LazyColumn(
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                items(bidsState.data) { bid ->
                                    BidCard(bid = bid)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun BidCard(bid: Bid) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "$${bid.price}",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = bid.currency,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                Text(
                    text = bid.status,
                    style = MaterialTheme.typography.bodySmall,
                    color = when (bid.status) {
                        "ACCEPTED" -> MaterialTheme.colorScheme.success
                        "PENDING" -> MaterialTheme.colorScheme.warning
                        "REJECTED" -> MaterialTheme.colorScheme.error
                        else -> MaterialTheme.colorScheme.onSurfaceVariant
                    }
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = bid.description,
                style = MaterialTheme.typography.bodyMedium
            )
            
            Text(
                text = "Delivery: ${bid.deliveryTime} days",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            if (bid.warranty) {
                Text(
                    text = "✓ Warranty included",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.success
                )
            }
        }
    }
}
