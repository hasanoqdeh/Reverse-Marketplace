package com.reversemarketplace.merchantmobileapp.ui.screens.bidding

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.reversemarketplace.merchantmobileapp.navigation.Screen
import com.reversemarketplace.merchantshared.core.network.BuyerRequest
import com.reversemarketplace.merchantshared.core.network.CreateBidRequest
import com.reversemarketplace.merchantshared.core.network.QuickBidTemplate
import com.reversemarketplace.merchantshared.shared.models.ViewState

@Composable
fun SubmitBidScreen(navController: NavController, requestId: String) {
    var request by remember { mutableStateOf<ViewState<BuyerRequest>>(ViewState.Loading) }
    var quickBidTemplates by remember { mutableStateOf<ViewState<List<QuickBidTemplate>>>(ViewState.Loading) }
    
    var price by remember { mutableStateOf("") }
    var deliveryTime by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var warranty by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    
    // TODO: Load request details and quick bid templates
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Submit Bid") },
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
        when (val requestState = request) {
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
                        .verticalScroll(rememberScrollState())
                ) {
                    // Request summary
                    RequestSummaryCard(requestState.data)
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Quick bid templates
                    QuickBidTemplatesSection(
                        templates = when (val templatesState = quickBidTemplates) {
                            is ViewState.Success -> templatesState.data
                            else -> emptyList()
                        },
                        onTemplateSelected = { template ->
                            price = String.format("%.2f", template.priceMultiplier * 100.0)
                            deliveryTime = template.deliveryTimeDays.toString()
                            description = template.description
                        }
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Bid form
                    BidForm(
                        price = price,
                        onPriceChange = { price = it },
                        deliveryTime = deliveryTime,
                        onDeliveryTimeChange = { deliveryTime = it },
                        description = description,
                        onDescriptionChange = { description = it },
                        warranty = warranty,
                        onWarrantyChange = { warranty = it },
                        errorMessage = errorMessage
                    )
                    
                    Spacer(modifier = Modifier.weight(1f))
                    
                    // Submit button
                    Button(
                        onClick = {
                            if (validateBidForm(price, deliveryTime, description)) {
                                isLoading = true
                                errorMessage = ""
                                
                                val bidRequest = CreateBidRequest(
                                    requestId = requestId,
                                    price = price.toDoubleOrNull() ?: 0.0,
                                    currency = "USD",
                                    deliveryTime = deliveryTime.toIntOrNull() ?: 1,
                                    description = description,
                                    warranty = warranty
                                )
                                
                                // TODO: Submit bid via repository
                                isLoading = false
                                navController.popBackStack()
                            } else {
                                errorMessage = "Please fill all required fields"
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        enabled = !isLoading
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(20.dp),
                                color = MaterialTheme.colorScheme.onPrimary
                            )
                        } else {
                            Text("Submit Bid")
                        }
                    }
                }
            }
            
            is ViewState.Error -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Error loading request",
                        style = MaterialTheme.typography.bodyLarge
                    )
                }
            }
        }
    }
}

@Composable
private fun RequestSummaryCard(request: BuyerRequest) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = request.title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = request.description,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Location: ${request.locationName}",
                    style = MaterialTheme.typography.bodySmall
                )
                
                Text(
                    text = "${request.bidCount} bids",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

@Composable
private fun QuickBidTemplatesSection(
    templates: List<QuickBidTemplate>,
    onTemplateSelected: (QuickBidTemplate) -> Unit
) {
    val templateNames = mapOf(
        "cheap_offer" to "Cheap Offer",
        "premium_offer" to "Premium Offer",
        "fast_delivery" to "Fast Delivery",
        "balanced" to "Balanced"
    )
    
    Column(
        modifier = Modifier.padding(horizontal = 16.dp)
    ) {
        Text(
            text = "Quick Bid Templates",
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            templates.forEach { template ->
                FilterChip(
                    selected = false,
                    onClick = { onTemplateSelected(template) },
                    label = { Text(templateNames[template.id] ?: template.name) }
                )
            }
        }
    }
}

@Composable
private fun BidForm(
    price: String,
    onPriceChange: (String) -> Unit,
    deliveryTime: String,
    onDeliveryTimeChange: (String) -> Unit,
    description: String,
    onDescriptionChange: (String) -> Unit,
    warranty: Boolean,
    onWarrantyChange: (Boolean) -> Unit,
    errorMessage: String
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Price input
            OutlinedTextField(
                value = price,
                onValueChange = onPriceChange,
                label = { Text("Price (USD)") },
                leadingIcon = { Text("$") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.fillMaxWidth()
            )
            
            // Delivery time input
            OutlinedTextField(
                value = deliveryTime,
                onValueChange = onDeliveryTimeChange,
                label = { Text("Delivery Time (days)") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.fillMaxWidth()
            )
            
            // Description input
            OutlinedTextField(
                value = description,
                onValueChange = onDescriptionChange,
                label = { Text("Bid Description") },
                placeholder = { Text("Describe your offer and any special conditions...") },
                modifier = Modifier.fillMaxWidth(),
                maxLines = 4
            )
            
            // Warranty checkbox
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Checkbox(
                    checked = warranty,
                    onCheckedChange = onWarrantyChange
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Include warranty",
                    style = MaterialTheme.typography.bodyMedium
                )
            }
            
            // Error message
            if (errorMessage.isNotEmpty()) {
                Text(
                    text = errorMessage,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }
    }
}

private fun validateBidForm(price: String, deliveryTime: String, description: String): Boolean {
    return price.isNotBlank() && 
           price.toDoubleOrNull() != null && 
           price.toDoubleOrNull()!! > 0 &&
           deliveryTime.isNotBlank() && 
           deliveryTime.toIntOrNull() != null && 
           deliveryTime.toIntOrNull()!! > 0 &&
           description.isNotBlank()
}
