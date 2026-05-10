package com.reversemarketplace.shared.DI

import com.reversemarketplace.shared.core.network.ApiClient
import com.reversemarketplace.shared.core.storage.SecureStorage
import com.reversemarketplace.shared.core.storage.SecureStorageImpl
import com.reversemarketplace.shared.core.sockets.SocketManager
import com.reversemarketplace.shared.features.auth.AuthRepository
import com.reversemarketplace.shared.features.auth.AuthRepositoryImpl
import com.reversemarketplace.shared.features.requests.RequestRepository
import com.reversemarketplace.shared.features.requests.RequestRepositoryImpl
import io.ktor.client.HttpClient
import org.koin.core.module.Module
import org.koin.dsl.module

val sharedModule: Module = module {
    
    // Network
    single { HttpClient() }
    single<ApiClient> { ApiClient(get(), { get<SecureStorage>().getAuthToken() }) }
    
    // Storage
    single<SecureStorage> { SecureStorageImpl(get()) }
    
    // Sockets
    single<SocketManager> { SocketManager(get(), { get<SecureStorage>().getAuthToken() }) }
    
    // Repositories
    single<AuthRepository> { AuthRepositoryImpl(get(), get()) }
    single<RequestRepository> { RequestRepositoryImpl(get()) }
    
    // TODO: Add other repositories and services as they are created
}
