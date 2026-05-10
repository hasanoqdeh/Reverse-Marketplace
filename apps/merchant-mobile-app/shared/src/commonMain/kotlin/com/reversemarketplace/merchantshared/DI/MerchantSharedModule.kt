package com.reversemarketplace.merchantshared.DI

import com.reversemarketplace.merchantshared.core.network.ApiClient
import com.reversemarketplace.merchantshared.core.sockets.MerchantSocketManager
import com.reversemarketplace.merchantshared.core.storage.SecureStorage
import com.reversemarketplace.merchantshared.core.storage.SecureStorageImpl
import com.reversemarketplace.merchantshared.features.requests_feed.RequestsFeedRepository
import com.reversemarketplace.merchantshared.features.requests_feed.RequestsFeedRepositoryImpl
import com.reversemarketplace.merchantshared.features.bidding.BiddingRepository
import com.reversemarketplace.merchantshared.features.bidding.BiddingRepositoryImpl
import com.reversemarketplace.merchantshared.features.auth.AuthRepository
import com.reversemarketplace.merchantshared.features.auth.AuthRepositoryImpl
import io.ktor.client.HttpClient
import org.koin.core.module.Module
import org.koin.dsl.module

val merchantSharedModule: Module = module {
    
    // Network
    single { HttpClient() }
    single<ApiClient> { ApiClient(get(), { get<SecureStorage>().getAuthToken() }) }
    
    // Storage
    single<SecureStorage> { SecureStorageImpl(get()) }
    
    // Sockets
    single<MerchantSocketManager> { MerchantSocketManager({ get<SecureStorage>().getAuthToken() }) }
    
    // Repositories
    single<AuthRepository> { AuthRepositoryImpl(get(), get()) }
    single<RequestsFeedRepository> { RequestsFeedRepositoryImpl(get()) }
    single<BiddingRepository> { BiddingRepositoryImpl(get()) }
    
    // TODO: Add other repositories and services as they are created
}
