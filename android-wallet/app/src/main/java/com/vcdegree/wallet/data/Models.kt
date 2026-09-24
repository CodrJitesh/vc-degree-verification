package com.vcdegree.wallet.data

data class DegreeClaims(
    val name: String,
    val degree: String,
    val branch: String,
    val graduationYear: Int,
    val cgpa: Double
)

data class UniversityDegreeCredential(
    val credentialType: String,
    val issuer: String,
    val subject: String,
    val claims: DegreeClaims,
    val issuanceDate: String,
    val credentialId: String,
    val status: String = "Valid"
)

data class NumericConstraint(
    val op: String,
    val value: Number
)

data class VerificationRequirements(
    val degree: String? = null,
    val branch: String? = null,
    val graduationYear: NumericConstraint? = null,
    val cgpa: NumericConstraint? = null
)

data class VerificationRequest(
    val requestId: String,
    val verifierName: String,
    val required: VerificationRequirements,
    val reveal: List<String>,
    val keepPrivate: List<String>
)

data class ProofResult(
    val requestId: String,
    val success: Boolean,
    val message: String,
    val presentationPayload: String? = null
)
