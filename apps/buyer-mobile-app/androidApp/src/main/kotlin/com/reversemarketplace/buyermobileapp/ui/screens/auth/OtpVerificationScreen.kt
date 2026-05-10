package com.reversemarketplace.buyermobileapp.ui.screens.auth

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.reversemarketplace.buyermobileapp.navigation.Screen
import kotlinx.coroutines.delay

@Composable
fun OtpVerificationScreen(navController: NavController, phone: String) {
    var otp by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    var timeRemaining by remember { mutableStateOf(30) }
    
    // Timer for OTP resend
    LaunchedEffect(Unit) {
        while (timeRemaining > 0) {
            delay(1000)
            timeRemaining--
        }
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Verify Your Phone",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(bottom = 16.dp)
        )
        
        Text(
            text = "We sent a 6-digit code to $phone",
            style = MaterialTheme.typography.bodyLarge,
            modifier = Modifier.padding(bottom = 32.dp)
        )
        
        OutlinedTextField(
            value = otp,
            onValueChange = { 
                if (it.length <= 6) otp = it 
            },
            label = { Text("Enter OTP") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.fillMaxWidth(),
            enabled = !isLoading
        )
        
        if (errorMessage.isNotEmpty()) {
            Text(
                text = errorMessage,
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier.padding(vertical = 8.dp)
            )
        }
        
        Button(
            onClick = {
                if (otp.length == 6) {
                    isLoading = true
                    errorMessage = ""
                    // TODO: Call auth repository to verify OTP
                    // For now, navigate to home
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.PhoneLogin.route) { inclusive = true }
                    }
                    isLoading = false
                } else {
                    errorMessage = "Please enter the 6-digit code"
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp),
            enabled = !isLoading && otp.length == 6
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    color = MaterialTheme.colorScheme.onPrimary
                )
            } else {
                Text("Verify OTP")
            }
        }
        
        Row(
            modifier = Modifier.padding(top = 24.dp),
            horizontalArrangement = Arrangement.Center
        ) {
            Text(
                text = "Didn't receive the code? ",
                style = MaterialTheme.typography.bodyMedium
            )
            
            TextButton(
                onClick = {
                    if (timeRemaining == 0) {
                        // TODO: Resend OTP
                        timeRemaining = 30
                    }
                },
                enabled = timeRemaining == 0
            ) {
                Text(if (timeRemaining > 0) "Resend (${timeRemaining}s)" else "Resend")
            }
        }
    }
}
