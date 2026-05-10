package com.reversemarketplace.buyermobileapp.navigation

import androidx.compose.runtime.*
import androidx.navigation.NavController
import androidx.navigation.NavGraph.Companion.findStartDestination
import com.reversemarketplace.shared.core.storage.SecureStorage
import org.koin.androidx.compose.koinViewModel

@Composable
fun NavigationGuard(
    navController: NavController,
    startDestination: String,
    content: @Composable () -> Unit
) {
    val secureStorage: SecureStorage = koinViewModel()
    val isAuthenticated by remember { mutableStateOf(false) }
    
    // Check authentication status
    LaunchedEffect(Unit) {
        val token = secureStorage.getAuthToken()
        isAuthenticated.value = !token.isNullOrEmpty()
    }
    
    // Redirect to login if not authenticated and not on login screen
    LaunchedEffect(isAuthenticated.value) {
        val currentRoute = navController.currentDestination?.route
        if (!isAuthenticated.value && currentRoute != startDestination) {
            navController.navigate(startDestination) {
                popUpTo(startDestination) { inclusive = true }
            }
        }
    }
    
    // Show content only if authenticated or on login screen
    if (isAuthenticated.value || navController.currentDestination?.route == startDestination) {
        content()
    }
}
