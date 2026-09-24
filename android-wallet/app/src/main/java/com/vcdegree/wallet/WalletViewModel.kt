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
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

sealed class ProofUiState {
    data object Idle : ProofUiState()
    data object Working : ProofUiState()
    data class Done(val result: ProofResult, val submitted: Boolean) : ProofUiState()
    data class Error(val message: String) : ProofUiState()
}

sealed class ImportUiState {
    data object Idle : ImportUiState()
    data object Working : ImportUiState()
    data class Success(val message: String) : ImportUiState()
    data class Error(val message: String) : ImportUiState()
}

class WalletViewModel(
    private val app: VcWalletApp
) : ViewModel() {

    var credentials by mutableStateOf(app.credentialRepository.loadCredentials())
        private set

    var proofState by mutableStateOf<ProofUiState>(ProofUiState.Idle)
        private set

    var importState by mutableStateOf<ImportUiState>(ImportUiState.Idle)
        private set

    val sdkReady: Boolean get() = app.walletBridge.isReady()
    val defaultApiBaseUrl: String get() = BuildConfig.API_BASE_URL

    fun refreshCredentials() {
        credentials = app.credentialRepository.loadCredentials()
    }

    fun credentialById(id: String): UniversityDegreeCredential? =
        app.credentialRepository.getById(id)

    fun loadDemoVerificationRequest(): VerificationRequest =
        app.credentialRepository.loadSampleVerificationRequest()

    fun verificationRequest(requestId: String): VerificationRequest {
        val sample = loadDemoVerificationRequest()
        return if (sample.requestId == requestId) sample
        else sample.copy(requestId = requestId)
    }

    fun clearImportState() {
        importState = ImportUiState.Idle
    }

    fun importFromJson(raw: String) {
        viewModelScope.launch {
            importState = ImportUiState.Working
            try {
                val cred = withContext(Dispatchers.IO) {
                    app.credentialRepository.importFromJson(raw)
                }
                refreshCredentials()
                importState = ImportUiState.Success(
                    "Imported ${cred.claims.degree} ${cred.claims.branch} (${cred.credentialId})"
                )
            } catch (e: Exception) {
                importState = ImportUiState.Error(e.message ?: "Import failed")
            }
        }
    }

    fun fetchFromServer(baseUrl: String, studentDid: String) {
        viewModelScope.launch {
            importState = ImportUiState.Working
            try {
                val list = withContext(Dispatchers.IO) {
                    app.credentialRepository.fetchFromServer(baseUrl, studentDid)
                }
                refreshCredentials()
                importState = ImportUiState.Success(
                    "Fetched ${list.size} credential(s) for $studentDid"
                )
            } catch (e: Exception) {
                importState = ImportUiState.Error(e.message ?: "Fetch failed")
            }
        }
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
