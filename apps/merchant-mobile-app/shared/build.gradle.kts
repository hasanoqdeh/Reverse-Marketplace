plugins {
    kotlin("multiplatform")
    kotlin("plugin.serialization")
    id("com.android.library")
    id("app.cash.sqldelight")
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
            baseName = "Shared"
            isStatic = true
        }
    }
    
    sourceSets {
        commonMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
            implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
            implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.4.1")
            
            implementation("io.ktor:ktor-client-core:2.3.5")
            implementation("io.ktor:ktor-client-content-negotiation:2.3.5")
            implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.5")
            implementation("io.ktor:ktor-client-logging:2.3.5")
            
            implementation("io.insert-koin:koin-core:3.5.0")
            
            implementation("russhwolf:multiplatform-settings:1.1.0")
            implementation("russhwolf:multiplatform-settings-serialization:1.1.0")
            
            implementation("app.cash.sqldelight:runtime:2.0.0")
            implementation("app.cash.sqldelight:coroutines-extensions:2.0.0")
            
            implementation("io.socket:socket.io-client:2.0.1")
        }
        
        androidMain.dependencies {
            implementation("io.ktor:ktor-client-okhttp:2.3.5")
            implementation("app.cash.sqldelight:android-driver:2.0.0")
        }
        
        iosMain.dependencies {
            implementation("io.ktor:ktor-client-darwin:2.3.5")
            implementation("app.cash.sqldelight:native-driver:2.0.0")
        }
    }
}

android {
    namespace = "com.reversemarketplace.merchantshared"
    compileSdk = 34
    
    defaultConfig {
        minSdk = 24
    }
    
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

sqldelight {
    databases {
        create("MerchantMobileAppDatabase") {
            packageName.set("com.reversemarketplace.merchantshared.database")
        }
    }
}
