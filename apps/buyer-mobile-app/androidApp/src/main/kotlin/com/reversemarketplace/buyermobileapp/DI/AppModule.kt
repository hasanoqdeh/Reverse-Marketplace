package com.reversemarketplace.buyermobileapp.DI

import com.russhwolf.settings.Settings
import com.russhwolf.settings.SharedPreferencesSettings
import android.content.Context
import org.koin.android.ext.koin.androidContext
import org.koin.dsl.module

val appModule = module {
    // Android-specific implementations
    single<Settings> { SharedPreferencesSettings(androidContext()) }
    
    // Include shared module
    includes(sharedModule)
}
