package com.reversemarketplace.buyermobileapp.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.reversemarketplace.buyermobileapp.ui.screens.auth.PhoneLoginScreen
import com.reversemarketplace.buyermobileapp.ui.screens.auth.OtpVerificationScreen
import com.reversemarketplace.buyermobileapp.ui.screens.home.HomeScreen
import com.reversemarketplace.buyermobileapp.ui.screens.requests.CreateRequestScreen
import com.reversemarketplace.buyermobileapp.ui.screens.bids.BidListScreen
import com.reversemarketplace.buyermobileapp.ui.screens.chat.ChatListScreen
import com.reversemarketplace.buyermobileapp.ui.screens.chat.ChatScreen

sealed class Screen(val route: String) {
    object PhoneLogin : Screen("phone_login")
    object OtpVerification : Screen("otp_verification")
    object Home : Screen("home")
    object CreateRequest : Screen("create_request")
    object BidList : Screen("bid_list/{requestId}")
    object ChatList : Screen("chat_list")
    object Chat : Screen("chat/{conversationId}")
}

@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    
    NavHost(
        navController = navController,
        startDestination = Screen.PhoneLogin.route
    ) {
        composable(Screen.PhoneLogin.route) {
            PhoneLoginScreen(navController)
        }
        
        composable(Screen.OtpVerification.route + "/{phone}") { backStackEntry ->
            val phone = backStackEntry.arguments?.getString("phone") ?: ""
            OtpVerificationScreen(navController, phone)
        }
        
        composable(Screen.Home.route) {
            HomeScreen(navController)
        }
        
        composable(Screen.CreateRequest.route) {
            CreateRequestScreen(navController)
        }
        
        composable(Screen.BidList.route) { backStackEntry ->
            val requestId = backStackEntry.arguments?.getString("requestId") ?: ""
            BidListScreen(navController, requestId)
        }
        
        composable(Screen.ChatList.route) {
            ChatListScreen(navController)
        }
        
        composable(Screen.Chat.route) { backStackEntry ->
            val conversationId = backStackEntry.arguments?.getString("conversationId") ?: ""
            ChatScreen(navController, conversationId)
        }
    }
}
