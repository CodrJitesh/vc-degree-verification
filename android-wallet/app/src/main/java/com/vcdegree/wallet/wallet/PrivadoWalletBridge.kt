package com.vcdegree.wallet.wallet

import android.content.Context
import android.util.Log
import com.vcdegree.wallet.BuildConfig
import com.vcdegree.wallet.data.ProofResult
import com.vcdegree.wallet.data.UniversityDegreeCredential
import com.vcdegree.wallet.data.VerificationRequest
import kotlinx.coroutines.delay
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

/**
 * Bridge to Privado ID / Polygon ID Wallet SDK.
 *
 * MVP: mock CGPA predicate + POST presentation to Utkarsh verifier endpoints
 * (integrated from branch `utkarsh` into unified backend on :3000).
 */
class PrivadoWalletBridge(private val context: Context) {

    companion object {
        private const val TAG = "PrivadoWalletBridge"
    }

    private var initialized = false
    var apiBaseUrl: String = BuildConfig.API_BASE_URL

    fun init() {
        if (!BuildConfig.PRIVADO_SDK_ENABLED) {
            Log.i(TAG, "Privado SDK disabled — mock proofs + HTTP submit to Node facade.")
            initialized = true
            return
        }
        Log.w(TAG, "PRIVADO_SDK_ENABLED=true but SDK init not wired yet.")
        initialized = false
    }

    fun isReady(): Boolean = initialized

    suspend fun generatePresentation(
        credential: UniversityDegreeCredential,
        request: VerificationRequest
    ): ProofResult {
        if (!BuildConfig.PRIVADO_SDK_ENABLED) {
            delay(600)
            val cgpaOk = request.required.cgpa?.let { constraint ->
                when (constraint.op) {
                    ">=" -> credential.claims.cgpa >= constraint.value.toDouble()
                    ">" -> credential.claims.cgpa > constraint.value.toDouble()
                    else -> true
                }
            } ?: true

            if (!cgpaOk) {
                return ProofResult(
                    requestId = request.requestId,
                    success = false,
                    message = "Credential does not satisfy CGPA condition."
                )
            }

            val mockPresentation = JSONObject()
                .put("type", "MockVerifiablePresentation")
                .put("requestId", request.requestId)
                .put(
                    "revealed",
                    JSONObject()
                        .put("degree", credential.claims.degree)
                        .put("branch", credential.claims.branch)
                        .put("graduationYear", credential.claims.graduationYear)
                )
                .put(
                    "predicates",
                    JSONObject().put(
                        "cgpa",
                        JSONObject()
                            .put("op", ">=")
                            .put("value", request.required.cgpa?.value ?: 8)
                            .put("satisfied", true)
                    )
                )
                .put(
                    "note",
                    "MOCK presentation — Privado ZK later; submit hits Utkarsh verifier API"
                )
                .toString()

            return ProofResult(
                requestId = request.requestId,
                success = true,
                message = "Mock presentation created. Exact CGPA hidden.",
                presentationPayload = mockPresentation
            )
        }

        return ProofResult(
            requestId = request.requestId,
            success = false,
            message = "SDK enabled but prove() not implemented yet."
        )
    }

    /**
     * POST to TEAM_CONTRACT path; falls back to Utkarsh alias.
     */
    suspend fun submitPresentation(result: ProofResult): Boolean {
        val payload = result.presentationPayload ?: return false
        return try {
            val body = JSONObject()
                .put("requestId", result.requestId)
                .put("presentation", payload)
                .put("proof", JSONObject(payload))
                .toString()

            val okPrimary = postJson(
                "${apiBaseUrl.trimEnd('/')}/api/verify/presentations",
                body
            )
            if (okPrimary) return true

            postJson(
                "${apiBaseUrl.trimEnd('/')}/api/verifier/submit-proof",
                body
            )
        } catch (e: Exception) {
            Log.e(TAG, "submitPresentation failed", e)
            false
        }
    }

    private fun postJson(urlString: String, body: String): Boolean {
        val conn = (URL(urlString).openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            connectTimeout = 10_000
            readTimeout = 10_000
            doOutput = true
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("Accept", "application/json")
        }
        return try {
            OutputStreamWriter(conn.outputStream).use { it.write(body) }
            val code = conn.responseCode
            val stream = if (code in 200..299) conn.inputStream else conn.errorStream
            val response = BufferedReader(InputStreamReader(stream)).use { it.readText() }
            Log.i(TAG, "POST $urlString → $code $response")
            code in 200..299
        } finally {
            conn.disconnect()
        }
    }
}
