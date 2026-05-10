package com.reversemarketplace.buyermobileapp.ui.screens.home

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.reversemarketplace.buyermobileapp.navigation.Screen
import com.reversemarketplace.shared.shared.models.ViewState
import com.reversemarketplace.shared.core.network.Request

@Composable
fun HomeScreen(navController: NavController) {
    var requests by remember { mutableStateOf<ViewState<List<Request>>>(ViewState.Loading) }
    
    // TODO: Load requests from repository
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Requests") },
                actions = {
                    IconButton(
                        onClick = {
                            navController.navigate(Screen.ChatList.route)
                        }
                    ) {
                        Icon(Icons.Default.Chat, contentDescription = "Chats")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    navController.navigate(Screen.CreateRequest.route)
                }
            ) {
                Icon(Icons.Default.Add, contentDescription = "Create Request")
            }
        }
    ) { paddingValues ->
        when (val state = requests) {
            is ViewState.Loading -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            
            is ViewState.Success -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(state.data) { request ->
                        RequestCard(
                            request = request,
                            onClick = {
                                navController.navigate("${Screen.BidList.route}/${request.id}")
                            }
                        )
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
                            text = "Error loading requests",
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
private fun RequestCard(
    request: Request,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth(),
        onClick = onClick,
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = request.title,
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            
            Text(
                text = request.description,
                style = MaterialTheme.typography.bodyMedium,
                maxLines = 2,
                modifier = Modifier.padding(bottom = 12.dp)
            )
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Status: ${request.status}",
                    style = MaterialTheme.typography.bodySmall,
                    color = when (request.status) {
                        "ACTIVE" -> MaterialTheme.colorScheme.primary
                        "HAS_BIDS" -> MaterialTheme.colorScheme.secondary
                        "COMPLETED" -> MaterialTheme.colorScheme.tertiary
                        else -> MaterialTheme.colorScheme.onSurfaceVariant
                    }
                )
                
                Text(
                    text = "Created: ${request.createdAt.substring(0, 10)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
