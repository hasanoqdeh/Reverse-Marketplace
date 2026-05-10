package com.reversemarketplace.merchantmobileapp.ui.screens.auth

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.Pending
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.reversemarketplace.merchantmobileapp.navigation.Screen
import com.reversemarketplace.merchantshared.core.network.Merchant
import com.reversemarketplace.merchantshared.shared.models.ViewState

@Composable
fun VerificationGateScreen(navController: NavController) {
    var merchant by remember { mutableStateOf<ViewState<Merchant>>(ViewState.Loading) }
    
    // TODO: Load merchant profile to check verification status
    
    when (val state = merchant) {
        is ViewState.Loading -> {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        }
        
        is ViewState.Success -> {
            when (state.data.verificationStatus) {
                "VERIFIED" -> {
                    // Verified merchant - proceed to main app
                    LaunchedEffect(Unit) {
                        navController.navigate(Screen.RequestsFeed.route) {
                            popUpTo(Screen.PhoneLogin.route) { inclusive = true }
                        }
                    }
                }
                
                "PENDING" -> {
                    VerificationStatusScreen(
                        status = "Pending Verification",
                        title = "Verification in Progress",
                        description = "Your business verification is being reviewed. You'll be notified once approved.",
                        icon = Icons.Default.Pending,
                        iconColor = MaterialTheme.colorScheme.primary,
                        onBack = { navController.popBackStack() }
                    )
                }
                
                "REJECTED" -> {
                    VerificationStatusScreen(
                        status = "Verification Rejected",
                        title = "Verification Failed",
                        description = "Your business verification was rejected. Please contact support for assistance.",
                        icon = Icons.Default.Business,
                        iconColor = MaterialTheme.colorScheme.error,
                        onBack = { navController.popBackStack() }
                    )
                }
                
                "SUSPENDED" -> {
                    VerificationStatusScreen(
                        status = "Account Suspended",
                        title = "Account Suspended",
                        description = "Your merchant account has been suspended. Please contact support for details.",
                        icon = Icons.Default.Business,
                        iconColor = MaterialTheme.colorScheme.error,
                        onBack = { navController.popBackStack() }
                    )
                }
                
                else -> {
                    VerificationStatusScreen(
                        status = "Unknown Status",
                        title = "Verification Required",
                        description = "Please complete your business verification to start bidding.",
                        icon = Icons.Default.Pending,
                        iconColor = MaterialTheme.colorScheme.tertiary,
                        onBack = { navController.popBackStack() }
                    )
                }
            }
        }
        
        is ViewState.Error -> {
            VerificationStatusScreen(
                status = "Error",
                title = "Connection Error",
                description = "Unable to verify your account. Please check your connection and try again.",
                icon = Icons.Default.Business,
                iconColor = MaterialTheme.colorScheme.error,
                onBack = { navController.popBackStack() }
            )
        }
    }
}

@Composable
private fun VerificationStatusScreen(
    status: String,
    title: String,
    description: String,
    icon: ImageVector,
    iconColor: androidx.compose.ui.graphics.Color,
    onBack: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(status) },
                navigationIcon = {
                    IconButton(
                        onClick = onBack
                    ) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = status,
                modifier = Modifier.size(80.dp),
                tint = iconColor
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Text(
                text = title,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = description,
                style = MaterialTheme.typography.bodyLarge,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            if (status == "Pending Verification") {
                Spacer(modifier = Modifier.height(32.dp))
                
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Text(
                            text = "What happens next?",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Text(
                            text = "• Our team will review your business documents\n• Verification typically takes 1-2 business days\n• You'll receive an email and push notification\n• Once approved, you can start bidding immediately",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.weight(1f))
            
            if (status == "Verification Rejected" || status == "Account Suspended") {
                Button(
                    onClick = {
                        // TODO: Open support contact
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Contact Support")
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                OutlinedButton(
                    onClick = onBack,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Back to Login")
                }
            }
        }
    }
}
