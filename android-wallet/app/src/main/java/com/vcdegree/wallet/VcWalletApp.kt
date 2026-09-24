package com.vcdegree.wallet

import android.app.Application
import com.vcdegree.wallet.data.CredentialRepository
import com.vcdegree.wallet.wallet.PrivadoWalletBridge

class VcWalletApp : Application() {

    lateinit var credentialRepository: CredentialRepository
        private set

    lateinit var walletBridge: PrivadoWalletBridge
        private set

    override fun onCreate() {
        super.onCreate()
        credentialRepository = CredentialRepository(this)
        walletBridge = PrivadoWalletBridge(this).also { it.init() }
    }
}
