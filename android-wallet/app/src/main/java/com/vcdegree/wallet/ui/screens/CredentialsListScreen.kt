package com.vcdegree.wallet.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Download
import androidx.compose.material.icons.outlined.QrCodeScanner
import androidx.compose.material.icons.outlined.Verified
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.vcdegree.wallet.data.UniversityDegreeCredential

@Composable
fun CredentialsListScreen(
    credentials: List<UniversityDegreeCredential>,
    sdkReady: Boolean,
    onOpenCredential: (String) -> Unit,
    onImport: () -> Unit,
    onOpenDemoRequest: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .statusBarsPadding()
            .padding(horizontal = 20.dp)
    ) {
        Spacer(Modifier.height(16.dp))
        Text(
            text = "Degree Wallet",
            style = MaterialTheme.typography.displayLarge,
            color = MaterialTheme.colorScheme.primary
        )
        Text(
            text = "Student holder · credentials stay on this device",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f)
        )
        Spacer(Modifier.height(8.dp))
        Text(
            text = if (sdkReady) "Wallet bridge ready (mock or SDK)"
            else "Wallet bridge not ready",
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.secondary
        )

        Spacer(Modifier.height(24.dp))
        Text(
            text = "My Credentials",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(Modifier.height(12.dp))

        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(bottom = 16.dp)
        ) {
            items(credentials, key = { it.credentialId }) { cred ->
                CredentialCard(cred) { onOpenCredential(cred.credentialId) }
            }
        }

        Button(
            onClick = onImport,
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 8.dp)
        ) {
            Icon(Icons.Outlined.Download, contentDescription = null)
            Spacer(Modifier.width(8.dp))
            Text("Import credential")
        }

        OutlinedButton(
            onClick = onOpenDemoRequest,
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 8.dp)
        ) {
            Icon(Icons.Outlined.QrCodeScanner, contentDescription = null)
            Spacer(Modifier.width(8.dp))
            Text("Demo verification request")
        }
        Spacer(Modifier.height(12.dp))
    }
}

@Composable
private fun CredentialCard(
    credential: UniversityDegreeCredential,
    onClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                MaterialTheme.colorScheme.surface,
                shape = MaterialTheme.shapes.medium
            )
            .clickable(onClick = onClick)
            .padding(18.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = "${credential.claims.degree} ${credential.claims.branch}",
                style = MaterialTheme.typography.titleLarge,
                modifier = Modifier.weight(1f)
            )
            Icon(
                Icons.Outlined.Verified,
                contentDescription = "Valid",
                tint = MaterialTheme.colorScheme.secondary
            )
        }
        Spacer(Modifier.height(8.dp))
        Text(
            text = "Issuer: ${shortDid(credential.issuer)}",
            style = MaterialTheme.typography.bodyMedium
        )
        Text(
            text = "Year: ${credential.claims.graduationYear}  ·  Status: ${credential.status}",
            style = MaterialTheme.typography.bodyMedium
        )
    }
}

internal fun shortDid(did: String): String {
    if (did.length <= 28) return did
    return did.take(18) + "…" + did.takeLast(8)
}
