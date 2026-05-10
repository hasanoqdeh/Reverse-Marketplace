package com.reversemarketplace.merchantmobileapp.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.reversemarketplace.merchantmobileapp.ui.screens.auth.PhoneLoginScreen
import com.reversemarketplace.merchantmobileapp.ui.screens.auth.OtpVerificationScreen
import com.reversemarketplace.merchantmobileapp.ui.screens.auth.VerificationGateScreen
import com.reversemarketplace.merchantmobileapp.ui.screens.requests_feed.RequestsFeedScreen
import com.reversemarketplace.merchantmobileapp.ui.screens.requests_feed.RequestDetailScreen
import com.reversemarketplace.merchantmobileapp.ui.screens.bidding.SubmitBidScreen
import com.reversemarketplace.merchantmobileapp.ui.screens.deals.DealsDashboardScreen
import com.reversemarketplace.merchantmobileapp.ui.screens.chat.ChatListScreen
import com.reversemarketplace.merchantmobileapp.ui.screens.chat.ChatScreen
import com.reversemarketplace.merchantmobileapp.ui.screens.wallet.WalletScreen
import com.reversemarketplace.merchantmobileapp.ui.screens.subscription.SubscriptionScreen
import com.reversemarketplace.merchantmobileapp.ui.screens.analytics.AnalyticsScreen
import com.reversemarketplace.merchantmobileapp.ui.screens.profile.ProfileScreen

sealed class Screen(val route: String) {
    object PhoneLogin : Screen("phone_login")
    object OtpVerification : Screen("otp_verification")
    object VerificationGate : Screen("verification_gate")
    object RequestsFeed : Screen("requests_feed")
    object RequestDetail : Screen("request_detail/{requestId}")
    object SubmitBid : Screen("submit_bid/{requestId}")
    object DealsDashboard : Screen("deals_dashboard")
    object ChatList : Screen("chat_list")
    object Chat : Screen("chat/{conversationId}")
    object Wallet : Screen("wallet")
    object Subscription : Screen("subscription")
    object Analytics : Screen("analytics")
    object Profile : Screen("profile")
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
        
        composable(Screen.VerificationGate.route) {
            VerificationGateScreen(navController)
        }
        
        composable(Screen.RequestsFeed.route) {
            RequestsFeedScreen(navController)
        }
        
        composable(Screen.RequestDetail.route) { backStackEntry ->
            val requestId = backStackEntry.arguments?.getString("requestId") ?: ""
            RequestDetailScreen(navController, requestId)
        }
        
        composable(Screen.SubmitBid.route) { backStackEntry ->
            val requestId = backStackEntry.arguments?.getString("requestId") ?: ""
            SubmitBidScreen(navController, requestId)
        }
        
        composable(Screen.DealsDashboard.route) {
            DealsDashboardScreen(navController)
        }
        
        composable(Screen.ChatList.route) {
            ChatListScreen(navController)
        }
        
        composable(Screen.Chat.route) { backStackEntry ->
            val conversationId = backStackEntry.arguments?.getString("conversationId") ?: ""
            ChatScreen(navController, conversationId)
        }
        
        composable(Screen.Wallet.route) {
            WalletScreen(navController)
        }
        
        composable(Screen.Subscription.route) {
            SubscriptionScreen(navController)
        }
        
        composable(Screen.Analytics.route) {
            AnalyticsScreen(navController)
        }
        
        composable(Screen.Profile.route) {
            ProfileScreen(navController)
        }
    }
}
