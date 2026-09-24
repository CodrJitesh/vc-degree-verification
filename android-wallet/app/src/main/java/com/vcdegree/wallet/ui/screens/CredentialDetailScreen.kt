package com.vcdegree.wallet.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.vcdegree.wallet.data.UniversityDegreeCredential

@Composable
fun CredentialDetailScreen(
    credential: UniversityDegreeCredential?,
    onBack: () -> Unit,
    onRespondToRequest: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .statusBarsPadding()
            .padding(horizontal = 20.dp)
    ) {
        IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
        }

        if (credential == null) {
            Text("Credential not found", style = MaterialTheme.typography.titleLarge)
            return
        }

        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
        ) {
            Text(
                text = "${credential.claims.degree}",
                style = MaterialTheme.typography.displayLarge,
                color = MaterialTheme.colorScheme.primary
            )
            Text(
                text = credential.claims.branch,
                style = MaterialTheme.typography.headlineMedium
            )
            Spacer(Modifier.height(20.dp))

            DetailRow("Name", credential.claims.name)
            DetailRow("Graduation year", credential.claims.graduationYear.toString())
            DetailRow("CGPA", credential.claims.cgpa.toString())
            DetailRow("Status", credential.status)
            DetailRow("Credential ID", credential.credentialId)
            DetailRow("Issuer", credential.issuer)
            DetailRow("Subject", credential.subject)
            DetailRow("Issued", credential.issuanceDate)
            DetailRow("Type", credential.credentialType)
        }

        Button(
            onClick = onRespondToRequest,
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp)
        ) {
            Text("Respond to verification request")
        }
    }
}

@Composable
private fun DetailRow(label: String, value: String) {
    Column(modifier = Modifier.padding(vertical = 8.dp)) {
        Text(
            text = label.uppercase(),
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.secondary
        )
        Text(text = value, style = MaterialTheme.typography.bodyLarge)
    }
}
