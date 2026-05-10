package com.reversemarketplace.merchantmobileapp.ui.screens.deals

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.reversemarketplace.merchantmobileapp.navigation.Screen
import com.reversemarketplace.merchantshared.shared.models.ViewState
import com.reversemarketplace.merchantshared.core.network.Deal
import org.koin.androidx.compose.koinViewModel

@Composable
fun DealsDashboardScreen(navController: NavController) {
    var deals by remember { mutableStateOf<ViewState<List<Deal>>>(ViewState.Loading) }
    var selectedTab by remember { mutableStateOf(0) } // 0: Active, 1: History
    
    // TODO: Load deals from repository
    // LaunchedEffect(Unit) {
    //     dealsRepository.getMyDeals().onSuccess { result ->
    //         deals = ViewState.Success(result)
    //     }.onFailure { error ->
    //         deals = ViewState.Error(error.message ?: "Failed to load deals")
    //     }
    // }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Header
        Text(
            text = "Deals Dashboard",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(bottom = 16.dp)
        )
        
        // Tabs
        TabRow(
            selectedTabIndex = selectedTab,
            modifier = Modifier.fillMaxWidth()
        ) {
            Tab(
                selected = selectedTab == 0,
                onClick = { selectedTab = 0 },
                text = { Text("Active Deals") }
            )
            Tab(
                selected = selectedTab == 1,
                onClick = { selectedTab = 1 },
                text = { Text("Deal History") }
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Content based on selected tab
        when (selectedTab) {
            0 -> ActiveDealsContent(deals)
            1 -> DealHistoryContent(deals)
        }
    }
}

@Composable
private fun ActiveDealsContent(deals: ViewState<List<Deal>>) {
    when (deals) {
        is ViewState.Loading -> {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        }
        
        is ViewState.Error -> {
            Text(
                text = deals.message,
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier.fillMaxWidth()
            )
        }
        
        is ViewState.Success -> {
            if (deals.data.isEmpty()) {
                Text(
                    text = "No active deals",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.fillMaxWidth()
                )
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(deals.data.filter { it.status == "ACCEPTED" || it.status == "IN_PROGRESS" }) { deal ->
                        DealCard(deal = deal)
                    }
                }
            }
        }
    }
}

@Composable
private fun DealHistoryContent(deals: ViewState<List<Deal>>) {
    when (deals) {
        is ViewState.Loading -> {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        }
        
        is ViewState.Error -> {
            Text(
                text = deals.message,
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier.fillMaxWidth()
            )
        }
        
        is ViewState.Success -> {
            if (deals.data.isEmpty()) {
                Text(
                    text = "No deal history",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.fillMaxWidth()
                )
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(deals.data.filter { it.status == "COMPLETED" || it.status == "CANCELLED" }) { deal ->
                        DealCard(deal = deal)
                    }
                }
            }
        }
    }
}

@Composable
private fun DealCard(deal: Deal) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // Header with status
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Deal #${deal.id}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                
                Surface(
                    color = when (deal.status) {
                        "ACCEPTED" -> MaterialTheme.colorScheme.primary
                        "IN_PROGRESS" -> MaterialTheme.colorScheme.primary
                        "COMPLETED" -> MaterialTheme.colorScheme.success
                        "CANCELLED" -> MaterialTheme.colorScheme.error
                        "DISPUTED" -> MaterialTheme.colorScheme.error
                        else -> MaterialTheme.colorScheme.onSurfaceVariant
                    },
                    shape = MaterialTheme.shapes.small
                ) {
                    Text(
                        text = deal.status,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onPrimary,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Deal details
            Column(
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Final Price:",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "$${deal.finalPrice} ${deal.currency}",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Created:",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = formatDate(deal.createdAt),
                        style = MaterialTheme.typography.bodySmall
                    )
                }
                
                if (deal.completedAt != null) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Completed:",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = formatDate(deal.completedAt),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.success
                        )
                    }
                }
            }
            
            // Action buttons for active deals
            if (deal.status == "IN_PROGRESS") {
                Spacer(modifier = Modifier.height(12.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = {
                            // TODO: View buyer details
                        },
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("View Buyer")
                    }
                    
                    Button(
                        onClick = {
                            // TODO: Complete deal
                        },
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Complete Deal")
                    }
                }
            }
        }
    }
}

private fun formatDate(dateString: String): String {
    // Simple date formatting - in real app, use proper date library
    return try {
        val date = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.getDefault())
            .parse(dateString)
        java.text.SimpleDateFormat("MMM dd, yyyy", java.util.Locale.getDefault())
            .format(date)
    } catch (e: Exception) {
        dateString
    }
}
