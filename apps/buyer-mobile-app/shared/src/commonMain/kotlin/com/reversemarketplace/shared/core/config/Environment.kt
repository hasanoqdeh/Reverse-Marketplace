package com.reversemarketplace.shared.core.config

enum class Environment {
    DEVELOPMENT,
    STAGING,
    PRODUCTION
}

class AppConfig {
    companion object {
        private const val BASE_URL_DEV = "http://localhost:3000"
        private const val BASE_URL_STAGING = "https://api-staging.reversemarketplace.com"
        private const val BASE_URL_PROD = "https://api.reversemarketplace.com"
        
        private const val WS_URL_DEV = "http://localhost:3000"
        private const val WS_URL_STAGING = "https://api-staging.reversemarketplace.com"
        private const val WS_URL_PROD = "https://api.reversemarketplace.com"
        
        fun getBaseUrl(environment: Environment): String {
            return when (environment) {
                Environment.DEVELOPMENT -> BASE_URL_DEV
                Environment.STAGING -> BASE_URL_STAGING
                Environment.PRODUCTION -> BASE_URL_PROD
            }
        }
        
        fun getWebSocketUrl(environment: Environment): String {
            return when (environment) {
                Environment.DEVELOPMENT -> WS_URL_DEV
                Environment.STAGING -> WS_URL_STAGING
                Environment.PRODUCTION -> WS_URL_PROD
            }
        }
        
        fun getCurrentEnvironment(): Environment {
            // In a real app, this would be determined by build configuration
            return Environment.DEVELOPMENT
        }
    }
}
