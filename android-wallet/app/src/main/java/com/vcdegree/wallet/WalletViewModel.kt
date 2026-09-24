package com.vcdegree.wallet

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.vcdegree.wallet.data.ProofResult
import com.vcdegree.wallet.data.UniversityDegreeCredential
import com.vcdegree.wallet.data.VerificationRequest
import kotlinx.coroutines.launch

sealed class ProofUiState {
    data object Idle : ProofUiState()
    data object Working : ProofUiState()
    data class Done(val result: ProofResult, val submitted: Boolean) : ProofUiState()
    data class Error(val message: String) : ProofUiState()
}

class WalletViewModel(
    private val app: VcWalletApp
) : ViewModel() {

    var credentials by mutableStateOf(app.credentialRepository.loadCredentials())
        private set

    var proofState by mutableStateOf<ProofUiState>(ProofUiState.Idle)
        private set

    val sdkReady: Boolean get() = app.walletBridge.isReady()

    fun credentialById(id: String): UniversityDegreeCredential? =
        app.credentialRepository.getById(id)

    fun loadDemoVerificationRequest(): VerificationRequest =
        app.credentialRepository.loadSampleVerificationRequest()

    fun verificationRequest(requestId: String): VerificationRequest {
        val sample = loadDemoVerificationRequest()
        return if (sample.requestId == requestId) sample
        else sample.copy(requestId = requestId)
    }

    fun approve(request: VerificationRequest, credential: UniversityDegreeCredential) {
        viewModelScope.launch {
            proofState = ProofUiState.Working
            try {
                val result = app.walletBridge.generatePresentation(credential, request)
                if (!result.success) {
                    proofState = ProofUiState.Error(result.message)
                    return@launch
                }
                val submitted = app.walletBridge.submitPresentation(result)
                proofState = ProofUiState.Done(result, submitted)
            } catch (e: Exception) {
                proofState = ProofUiState.Error(e.message ?: "Proof failed")
            }
        }
    }

    fun reject() {
        proofState = ProofUiState.Idle
    }

    companion object {
        fun factory(app: VcWalletApp): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    return WalletViewModel(app) as T
                }
            }
    }
}
