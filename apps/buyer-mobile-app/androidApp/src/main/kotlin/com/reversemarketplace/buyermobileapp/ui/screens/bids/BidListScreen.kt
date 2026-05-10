package com.reversemarketplace.buyermobileapp.ui.screens.bids

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.reversemarketplace.shared.core.network.Bid
import com.reversemarketplace.shared.shared.models.ViewState

@Composable
fun BidListScreen(navController: NavController, requestId: String) {
    var bids by remember { mutableStateOf<ViewState<List<Bid>>>(ViewState.Loading) }
    var selectedBidId by remember { mutableStateOf<String?>(null) }
    
    // TODO: Load bids from repository
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Bids") },
                navigationIcon = {
                    IconButton(
                        onClick = { navController.popBackStack() }
                    ) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        when (val state = bids) {
            is ViewState.Loading -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            
            is ViewState.Success -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                ) {
                    // Sort options
                    SortOptions(
                        selectedSort = "price", // TODO: Add sort state
                        onSortSelected = { /* TODO: Handle sort */ }
                    )
                    
                    // Bids list
                    LazyColumn(
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(state.data.sortedBy { it.price }) { bid ->
                            BidCard(
                                bid = bid,
                                isSelected = selectedBidId == bid.id,
                                onSelect = { selectedBidId = bid.id },
                                onAccept = {
                                    // TODO: Accept bid
                                },
                                onChat = {
                                    // TODO: Navigate to chat
                                }
                            )
                        }
                    }
                }
            }
            
            is ViewState.Error -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Error loading bids",
                            style = MaterialTheme.typography.bodyLarge
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(
                            onClick = {
                                // TODO: Retry loading
                            }
                        ) {
                            Text("Retry")
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SortOptions(
    selectedSort: String,
    onSortSelected: (String) -> Unit
) {
    val sortOptions = listOf(
        "price" to "Price: Low to High",
        "delivery_time" to "Delivery Time",
        "rating" to "Merchant Rating"
    )
    
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        sortOptions.forEach { (value, label) ->
            FilterChip(
                selected = selectedSort == value,
                onClick = { onSortSelected(value) },
                label = { Text(label) }
            )
        }
    }
}

@Composable
private fun BidCard(
    bid: Bid,
    isSelected: Boolean,
    onSelect: () -> Unit,
    onAccept: () -> Unit,
    onChat: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth(),
        onClick = onSelect,
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) {
                MaterialTheme.colorScheme.primaryContainer
            } else {
                MaterialTheme.colorScheme.surface
            }
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = if (isSelected) 8.dp else 2.dp
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "${bid.currency} ${bid.price}",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = if (isSelected) {
                            MaterialTheme.colorScheme.onPrimaryContainer
                        } else {
                            MaterialTheme.colorScheme.primary
                        }
                    )
                    
                    Spacer(modifier = Modifier.height(4.dp))
                    
                    Text(
                        text = "Delivery: ${bid.deliveryTime} days",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Text(
                        text = bid.description,
                        style = MaterialTheme.typography.bodyMedium,
                        maxLines = 2
                    )
                }
                
                // Merchant info placeholder
                Column(
                    horizontalAlignment = Alignment.End
                ) {
                    Text(
                        text = "Merchant",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    
                    // TODO: Add merchant rating
                    Text(
                        text = "⭐ 4.5",
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = onChat,
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        Icons.Default.Chat,
                        contentDescription = "Chat",
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Chat")
                }
                
                Button(
                    onClick = onAccept,
                    modifier = Modifier.weight(1f),
                    enabled = isSelected
                ) {
                    Icon(
                        Icons.Default.Check,
                        contentDescription = "Accept",
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Accept")
                }
            }
        }
    }
}
