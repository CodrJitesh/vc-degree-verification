package com.vcdegree.wallet.ui.navigation

sealed class Route(val path: String) {
    data object Credentials : Route("credentials")
    data object Import : Route("import")
    data object CredentialDetail : Route("credential/{credentialId}") {
        fun create(credentialId: String) = "credential/$credentialId"
    }
    data object VerificationRequest : Route("verify/{requestId}") {
        fun create(requestId: String = "VR-18291") = "verify/$requestId"
    }
}
