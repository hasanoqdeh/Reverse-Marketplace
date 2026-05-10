package com.reversemarketplace.buyermobileapp.ui.screens.requests

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Image
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.reversemarketplace.buyermobileapp.navigation.Screen
import com.reversemarketplace.shared.shared.constants.AppConstants

data class RequestDraft(
    var category: String = "",
    var title: String = "",
    var description: String = "",
    var locationId: String = "",
    var images: List<String> = emptyList()
)

@Composable
fun CreateRequestScreen(navController: NavController) {
    var currentStep by remember { mutableStateOf(1) }
    var requestDraft by remember { mutableStateOf(RequestDraft()) }
    var isLoading by remember { mutableStateOf(false) }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Create Request") },
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
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Step indicator
            StepIndicator(currentStep = currentStep)
            
            when (currentStep) {
                1 -> CategorySelectionStep(
                    selectedCategory = requestDraft.category,
                    onCategorySelected = { category ->
                        requestDraft = requestDraft.copy(category = category)
                        currentStep = 2
                    }
                )
                
                2 -> DescriptionInputStep(
                    requestDraft = requestDraft,
                    onDraftUpdated = { updatedDraft ->
                        requestDraft = updatedDraft
                    },
                    onNext = {
                        currentStep = 3
                    },
                    onBack = {
                        currentStep = 1
                    }
                )
                
                3 -> PublishStep(
                    requestDraft = requestDraft,
                    isLoading = isLoading,
                    onPublish = {
                        isLoading = true
                        // TODO: Call repository to create and publish request
                        isLoading = false
                        navController.popBackStack()
                    },
                    onBack = {
                        currentStep = 2
                    }
                )
            }
        }
    }
}

@Composable
private fun StepIndicator(currentStep: Int) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        listOf("Category", "Details", "Publish").forEachIndexed { index, title ->
            StepDot(
                stepNumber = index + 1,
                title = title,
                isActive = currentStep == index + 1,
                isCompleted = currentStep > index + 1
            )
        }
    }
}

@Composable
private fun StepDot(
    stepNumber: Int,
    title: String,
    isActive: Boolean,
    isCompleted: Boolean
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Surface(
            shape = CircleShape,
            color = when {
                isCompleted -> MaterialTheme.colorScheme.primary
                isActive -> MaterialTheme.colorScheme.primary
                else -> MaterialTheme.colorScheme.surface
            },
            border = if (!isActive && !isCompleted) {
                BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
            } else null,
            modifier = Modifier.size(32.dp)
        ) {
            Box(
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = stepNumber.toString(),
                    color = if (isActive || isCompleted) {
                        MaterialTheme.colorScheme.onPrimary
                    } else {
                        MaterialTheme.colorScheme.onSurface
                    }
                )
            }
        }
        
        Spacer(modifier = Modifier.height(4.dp))
        
        Text(
            text = title,
            style = MaterialTheme.typography.bodySmall,
            color = if (isActive || isCompleted) {
                MaterialTheme.colorScheme.primary
            } else {
                MaterialTheme.colorScheme.onSurfaceVariant
            }
        )
    }
}

@Composable
private fun CategorySelectionStep(
    selectedCategory: String,
    onCategorySelected: (String) -> Unit
) {
    val categories = listOf(
        AppConstants.Categories.SPARE_PARTS to "Spare Parts",
        AppConstants.Categories.ELECTRONICS to "Electronics", 
        AppConstants.Categories.FURNITURE to "Furniture",
        AppConstants.Categories.CUSTOM to "Custom"
    )
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Select Category",
            style = MaterialTheme.typography.headlineSmall,
            modifier = Modifier.padding(bottom = 24.dp)
        )
        
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(categories) { (category, displayName) ->
                CategoryCard(
                    displayName = displayName,
                    isSelected = selectedCategory == category,
                    onClick = { onCategorySelected(category) }
                )
            }
        }
    }
}

@Composable
private fun CategoryCard(
    displayName: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth(),
        onClick = onClick,
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
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = displayName,
                style = MaterialTheme.typography.bodyLarge,
                color = if (isSelected) {
                    MaterialTheme.colorScheme.onPrimaryContainer
                } else {
                    MaterialTheme.colorScheme.onSurface
                }
            )
        }
    }
}

@Composable
private fun DescriptionInputStep(
    requestDraft: RequestDraft,
    onDraftUpdated: (RequestDraft) -> Unit,
    onNext: () -> Unit,
    onBack: () -> Unit
) {
    var title by remember { mutableStateOf(requestDraft.title) }
    var description by remember { mutableStateOf(requestDraft.description) }
    var images by remember { mutableStateOf(requestDraft.images) }
    
    LaunchedEffect(title, description, images) {
        onDraftUpdated(requestDraft.copy(
            title = title,
            description = description,
            images = images
        ))
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Request Details",
            style = MaterialTheme.typography.headlineSmall,
            modifier = Modifier.padding(bottom = 24.dp)
        )
        
        OutlinedTextField(
            value = title,
            onValueChange = { title = it },
            label = { Text("Title") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        OutlinedTextField(
            value = description,
            onValueChange = { description = it },
            label = { Text("Description") },
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp),
            maxLines = 4
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "Add Images",
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        
        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Show existing images
            images.forEach { imageUrl ->
                ImagePreview(imageUrl = imageUrl)
            }
            
            // Add image buttons
            if (images.size < AppConstants.MAX_IMAGES_PER_REQUEST) {
                IconButton(
                    onClick = {
                        // TODO: Open camera
                    }
                ) {
                    Icon(Icons.Default.CameraAlt, contentDescription = "Take Photo")
                }
                
                IconButton(
                    onClick = {
                        // TODO: Open gallery
                    }
                ) {
                    Icon(Icons.Default.Image, contentDescription = "Choose from Gallery")
                }
            }
        }
        
        Spacer(modifier = Modifier.weight(1f))
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            OutlinedButton(
                onClick = onBack,
                modifier = Modifier.weight(1f)
            ) {
                Text("Back")
            }
            
            Button(
                onClick = onNext,
                modifier = Modifier.weight(1f),
                enabled = title.isNotBlank() && description.isNotBlank()
            ) {
                Text("Next")
            }
        }
    }
}

@Composable
private fun ImagePreview(imageUrl: String) {
    Card(
        modifier = Modifier.size(80.dp)
    ) {
        // TODO: Load image from URL
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(4.dp),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(modifier = Modifier.size(24.dp))
        }
    }
}

@Composable
private fun PublishStep(
    requestDraft: RequestDraft,
    isLoading: Boolean,
    onPublish: () -> Unit,
    onBack: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Review & Publish",
            style = MaterialTheme.typography.headlineSmall,
            modifier = Modifier.padding(bottom = 24.dp)
        )
        
        // Request summary
        Card(
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "Category: ${requestDraft.category}",
                    style = MaterialTheme.typography.bodyMedium
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Title: ${requestDraft.title}",
                    style = MaterialTheme.typography.bodyMedium
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Description: ${requestDraft.description}",
                    style = MaterialTheme.typography.bodyMedium
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Images: ${requestDraft.images.size}",
                    style = MaterialTheme.typography.bodyMedium
                )
            }
        }
        
        Spacer(modifier = Modifier.weight(1f))
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            OutlinedButton(
                onClick = onBack,
                modifier = Modifier.weight(1f)
            ) {
                Text("Back")
            }
            
            Button(
                onClick = onPublish,
                modifier = Modifier.weight(1f),
                enabled = !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                } else {
                    Text("Publish Request")
                }
            }
        }
    }
}
