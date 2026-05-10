plugins {
    // Kotlin Multiplatform plugin
    kotlin("multiplatform") version "1.9.20"
    kotlin("plugin.serialization") version "1.9.20"
    
    // Android plugins
    id("com.android.application") version "8.1.2"
    id("org.jetbrains.kotlin.android") version "1.9.20"
    
    // iOS plugin
    id("org.jetbrains.kotlin.native.cocoapods") version "1.9.20"
}

kotlin {
    androidTarget {
        compilations.all {
            kotlinOptions {
                jvmTarget = "17"
            }
        }
    }
    
    listOf(
        iosX64(),
        iosArm64(),
        iosSimulatorArm64()
    ).forEach { iosTarget ->
        iosTarget.binaries.framework {
            baseName = "MerchantMobileApp"
            isStatic = true
        }
    }
    
    sourceSets {
        commonMain.dependencies {
            // Kotlin libraries
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
            implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
            implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.4.1")
            
            // Ktor for networking
            implementation("io.ktor:ktor-client-core:2.3.5")
            implementation("io.ktor:ktor-client-content-negotiation:2.3.5")
            implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.5")
            implementation("io.ktor:ktor-client-logging:2.3.5")
            
            // Koin for dependency injection
            implementation("io.insert-koin:koin-core:3.5.0")
            
            // Multiplatform storage
            implementation("russhwolf:multiplatform-settings:1.1.0")
            implementation("russhwolf:multiplatform-settings-serialization:1.1.0")
            
            // SQLDelight for local storage
            implementation("app.cash.sqldelight:runtime:2.0.0")
            implementation("app.cash.sqldelight:coroutines-extensions:2.0.0")
            
            // Image loading
            implementation("io.kamel:kamel-image:0.9.0")
            
            // Socket.io client
            implementation("io.socket:socket.io-client:2.0.1")
        }
        
        androidMain.dependencies {
            implementation("io.ktor:ktor-client-okhttp:2.3.5")
            implementation("app.cash.sqldelight:android-driver:2.0.0")
            implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0")
            implementation("androidx.activity:activity-compose:1.8.1")
            implementation("androidx.compose.ui:ui:1.5.4")
            implementation("androidx.compose.ui:ui-tooling-preview:1.5.4")
            implementation("androidx.compose.material3:material3:1.1.2")
            implementation("androidx.compose.runtime:runtime:1.5.4")
            implementation("androidx.navigation:navigation-compose:2.7.5")
            
            // Firebase for push notifications
            implementation("com.google.firebase:firebase-messaging:23.4.0")
            implementation("com.google.firebase:firebase-analytics:21.5.0")
        }
        
        iosMain.dependencies {
            implementation("io.ktor:ktor-client-darwin:2.3.5")
            implementation("app.cash.sqldelight:native-driver:2.0.0")
        }
    }
}

android {
    namespace = "com.reversemarketplace.merchantmobileapp"
    compileSdk = 34
    
    defaultConfig {
        applicationId = "com.reversemarketplace.merchantmobileapp"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }
    
    buildFeatures {
        compose = true
    }
    
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.4"
    }
    
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}
