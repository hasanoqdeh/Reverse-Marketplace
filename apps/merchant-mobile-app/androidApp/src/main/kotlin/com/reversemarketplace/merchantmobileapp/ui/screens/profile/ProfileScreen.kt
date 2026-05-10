package com.reversemarketplace.merchantmobileapp.ui.screens.profile

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
import com.reversemarketplace.merchantshared.core.network.Merchant
import org.koin.androidx.compose.koinViewModel

@Composable
fun ProfileScreen(navController: NavController) {
    var merchant by remember { mutableStateOf<ViewState<Merchant>>(ViewState.Loading) }
    
    // TODO: Load merchant profile from repository
    // LaunchedEffect(Unit) {
    //     authRepository.getCurrentMerchant().onSuccess { result ->
    //         merchant = ViewState.Success(result)
    //     }.onFailure { error ->
    //         merchant = ViewState.Error(error.message ?: "Failed to load profile")
    //     }
    // }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Merchant Profile",
                style = MaterialTheme.typography.headlineMedium
            )
            
            IconButton(
                onClick = { navController.popBackStack() }
            ) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back")
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        when (val merchantState = merchant) {
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
                    text = merchantState.message,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.fillMaxWidth().weight(1f)
                )
            }
            
            is ViewState.Success -> {
                val merchantProfile = merchantState.data
                
                LazyColumn(
                    modifier = Modifier.fillMaxWidth().weight(1f),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    item {
                        // Profile Header Card
                        Card(
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier.padding(20.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                // Avatar placeholder
                                Surface(
                                    modifier = Modifier.size(80.dp),
                                    shape = MaterialTheme.shapes.large,
                                    color = MaterialTheme.colorScheme.primary
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Store,
                                        contentDescription = "Business",
                                        modifier = Modifier.size(40.dp),
                                        tint = MaterialTheme.colorScheme.onPrimary
                                    )
                                }
                                
                                Spacer(modifier = Modifier.height(16.dp))
                                
                                Text(
                                    text = merchantProfile.businessName,
                                    style = MaterialTheme.typography.headlineSmall,
                                    fontWeight = FontWeight.Bold
                                )
                                
                                Text(
                                    text = merchantProfile.email ?: merchantProfile.phone,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                
                                // Verification Status
                                Surface(
                                    color = when (merchantProfile.verificationStatus) {
                                        "VERIFIED" -> MaterialTheme.colorScheme.success
                                        "PENDING" -> MaterialTheme.colorScheme.warning
                                        "REJECTED" -> MaterialTheme.colorScheme.error
                                        "SUSPENDED" -> MaterialTheme.colorScheme.error
                                        else -> MaterialTheme.colorScheme.onSurfaceVariant
                                    },
                                    shape = MaterialTheme.shapes.small
                                ) {
                                    Text(
                                        text = merchantProfile.verificationStatus,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onPrimary,
                                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                                    )
                                }
                            }
                        }
                    }
                    
                    item {
                        // Business Stats Card
                        Card(
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp)
                            ) {
                                Text(
                                    text = "Business Statistics",
                                    style = MaterialTheme.typography.titleMedium,
                                    modifier = Modifier.padding(bottom = 16.dp)
                                )
                                
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceEvenly
                                ) {
                                    StatItem(
                                        title = "Rating",
                                        value = String.format("%.1f", merchantProfile.rating),
                                        icon = Icons.Default.Star
                                    )
                                    
                                    StatItem(
                                        title = "Total Deals",
                                        value = merchantProfile.totalDeals.toString(),
                                        icon = Icons.Default.ShoppingCart
                                    )
                                }
                                
                                Spacer(modifier = Modifier.height(16.dp))
                                
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceEvenly
                                ) {
                                    StatItem(
                                        title = "Subscription",
                                        value = merchantProfile.subscriptionPlan,
                                        icon = Icons.Default.Crown
                                    )
                                    
                                    StatItem(
                                        title = "Member Since",
                                        value = formatDate(merchantProfile.createdAt),
                                        icon = Icons.Default.Calendar
                                    )
                                }
                            }
                        }
                    }
                    
                    item {
                        // Quick Actions Card
                        Card(
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp)
                            ) {
                                Text(
                                    text = "Quick Actions",
                                    style = MaterialTheme.typography.titleMedium,
                                    modifier = Modifier.padding(bottom = 16.dp)
                                )
                                
                                ActionButton(
                                    icon = Icons.Default.Edit,
                                    title = "Edit Profile",
                                    subtitle = "Update business information"
                                ) {
                                    // TODO: Navigate to edit profile
                                }
                                
                                ActionButton(
                                    icon = Icons.Default.FileText,
                                    title = "View Documents",
                                    subtitle = "Manage verification documents"
                                ) {
                                    // TODO: Navigate to documents
                                }
                                
                                ActionButton(
                                    icon = Icons.Default.Settings,
                                    title = "Settings",
                                    subtitle = "App preferences and settings"
                                ) {
                                    // TODO: Navigate to settings
                                }
                            }
                        }
                    }
                    
                    item {
                        Spacer(modifier = Modifier.height(32.dp))
                        
                        // Logout Button
                        Button(
                            onClick = {
                                // TODO: Implement logout
                                navController.navigate(Screen.PhoneLogin.route) {
                                    popUpTo(0) { inclusive = true }
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.error
                            )
                        ) {
                            Text("Logout")
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun StatItem(title: String, value: String, icon: androidx.compose.ui.graphics.vector.ImageVector) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = icon,
            contentDescription = title,
            modifier = Modifier.size(24.dp),
            tint = MaterialTheme.colorScheme.primary
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Text(
            text = title,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        
        Text(
            text = value,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
        )
    }
}

@Composable
private fun ActionButton(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Surface(
            modifier = Modifier.size(48.dp),
            shape = MaterialTheme.shapes.small,
            color = MaterialTheme.colorScheme.primaryContainer
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                modifier = Modifier.size(24.dp),
                tint = MaterialTheme.colorScheme.onPrimaryContainer
            )
        }
        
        Spacer(modifier = Modifier.width(16.dp))
        
        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium
            )
            
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        
        Icon(
            imageVector = Icons.Default.ChevronRight,
            contentDescription = "Navigate",
            modifier = Modifier.size(20.dp),
            tint = MaterialTheme.colorScheme.onSurfaceVariant
        )
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
