package com.vcdegree.wallet.data

import android.content.Context
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.google.gson.JsonParser
import java.io.BufferedReader
import java.io.File
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

/**
 * Local holder storage — credential stays on device (Almighty Jitesh / TEAM_CONTRACT.md).
 */
class CredentialRepository(private val context: Context) {

    private val gson: Gson = GsonBuilder().setPrettyPrinting().create()
    private val storeFile: File
        get() = File(context.filesDir, "held_credentials.json")

    fun loadCredentials(): List<UniversityDegreeCredential> {
        val stored = readStored()
        if (stored.isNotEmpty()) return stored
        val sample = loadSampleCredential()
        saveCredentials(listOf(sample))
        return listOf(sample)
    }

    fun getById(credentialId: String): UniversityDegreeCredential? =
        loadCredentials().firstOrNull { it.credentialId == credentialId }

    fun saveCredentials(credentials: List<UniversityDegreeCredential>) {
        storeFile.writeText(gson.toJson(credentials))
    }

    /**
     * Parse dashboard JSON (raw credential, or { credential / androidImportJson } wrapper)
     * and upsert into local wallet storage.
     */
    fun importFromJson(raw: String): UniversityDegreeCredential {
        val trimmed = raw.trim()
        if (trimmed.isEmpty()) error("Paste is empty")

        val cred = parseCredentialJson(trimmed)
            ?: error("Could not parse credential JSON")

        require(cred.credentialId.isNotBlank()) { "credentialId missing" }
        require(cred.claims.degree.isNotBlank()) { "claims.degree missing" }

        val next = readStored().toMutableList()
        val idx = next.indexOfFirst { it.credentialId == cred.credentialId }
        if (idx >= 0) next[idx] = cred else next.add(0, cred)
        saveCredentials(next)
        return cred
    }

    /** GET /api/holder/credentials?studentDid=… */
    fun fetchFromServer(baseUrl: String, studentDid: String): List<UniversityDegreeCredential> {
        val base = baseUrl.trim().trimEnd('/')
        val encoded = URLEncoder.encode(studentDid.trim(), Charsets.UTF_8.name())
        val url = URL("$base/api/holder/credentials?studentDid=$encoded")
        val conn = (url.openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = 10_000
            readTimeout = 10_000
            setRequestProperty("Accept", "application/json")
        }
        try {
            val code = conn.responseCode
            val stream = if (code in 200..299) conn.inputStream else conn.errorStream
            val body = BufferedReader(InputStreamReader(stream)).use { it.readText() }
            if (code !in 200..299) error("Server $code: $body")
            val envelope = gson.fromJson(body, IssuedCredentialEnvelope::class.java)
            val list = envelope.credentials.orEmpty()
            if (list.isEmpty()) error("No credentials for this student DID")
            val next = readStored().toMutableList()
            for (cred in list) {
                val idx = next.indexOfFirst { it.credentialId == cred.credentialId }
                if (idx >= 0) next[idx] = cred else next.add(0, cred)
            }
            saveCredentials(next)
            return list
        } finally {
            conn.disconnect()
        }
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

    fun fetchVerificationRequest(baseUrl: String, requestId: String): VerificationRequest {
        val base = baseUrl.trim().trimEnd('/')
        val url = URL("$base/api/verifier/requests/$requestId")
        val conn = (url.openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = 10_000
            readTimeout = 10_000
            setRequestProperty("Accept", "application/json")
        }
        try {
            val code = conn.responseCode
            val stream = if (code in 200..299) conn.inputStream else conn.errorStream
            val body = BufferedReader(InputStreamReader(stream)).use { it.readText() }
            if (code !in 200..299) error("Server $code: $body")
            return gson.fromJson(body, VerificationRequest::class.java)
        } finally {
            conn.disconnect()
        }
    }

    private fun readStored(): List<UniversityDegreeCredential> {
        if (!storeFile.exists()) return emptyList()
        val json = storeFile.readText()
        if (json.isBlank()) return emptyList()
        return gson.fromJson(json, Array<UniversityDegreeCredential>::class.java)?.toList().orEmpty()
    }

    private fun parseCredentialJson(raw: String): UniversityDegreeCredential? {
        val element = JsonParser.parseString(raw)
        if (!element.isJsonObject) return null
        val obj = element.asJsonObject

        when {
            obj.has("credential") && obj.get("credential").isJsonObject ->
                return gson.fromJson(obj.get("credential"), UniversityDegreeCredential::class.java)
            obj.has("androidImportJson") && obj.get("androidImportJson").isJsonObject ->
                return gson.fromJson(obj.get("androidImportJson"), UniversityDegreeCredential::class.java)
            obj.has("claims") && obj.has("credentialId") ->
                return gson.fromJson(obj, UniversityDegreeCredential::class.java)
            obj.has("credentials") && obj.get("credentials").isJsonArray -> {
                val arr = obj.getAsJsonArray("credentials")
                if (arr.size() == 0) return null
                return gson.fromJson(arr[0], UniversityDegreeCredential::class.java)
            }
        }
        return null
    }
}
