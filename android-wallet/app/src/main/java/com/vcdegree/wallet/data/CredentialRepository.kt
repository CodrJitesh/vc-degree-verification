package com.vcdegree.wallet.data

import android.content.Context
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import java.io.File

/**
 * Local holder storage — credential stays on device (Almighty Jitesh / TEAM_CONTRACT.md).
 * Swap load path for Privado Wallet SDK credential store when Teammate C wires Issuer Node.
 */
class CredentialRepository(private val context: Context) {

    private val gson: Gson = GsonBuilder().setPrettyPrinting().create()
    private val storeFile: File
        get() = File(context.filesDir, "held_credentials.json")

    fun loadCredentials(): List<UniversityDegreeCredential> {
        if (storeFile.exists()) {
            val json = storeFile.readText()
            val array = gson.fromJson(json, Array<UniversityDegreeCredential>::class.java)
            return array?.toList().orEmpty()
        }
        val sample = loadSampleCredential()
        saveCredentials(listOf(sample))
        return listOf(sample)
    }

    fun getById(credentialId: String): UniversityDegreeCredential? =
        loadCredentials().firstOrNull { it.credentialId == credentialId }

    fun saveCredentials(credentials: List<UniversityDegreeCredential>) {
        storeFile.writeText(gson.toJson(credentials))
    }

    fun loadSampleCredential(): UniversityDegreeCredential {
        val json = context.assets.open("sample_credential.json").bufferedReader().use { it.readText() }
        return gson.fromJson(json, UniversityDegreeCredential::class.java)
    }

    fun loadSampleVerificationRequest(): VerificationRequest {
        val json = context.assets
            .open("sample_verification_request.json")
            .bufferedReader()
            .use { it.readText() }
        return gson.fromJson(json, VerificationRequest::class.java)
    }
}
