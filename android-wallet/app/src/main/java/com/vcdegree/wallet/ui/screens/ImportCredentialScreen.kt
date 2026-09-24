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
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.vcdegree.wallet.ImportUiState

@Composable
fun ImportCredentialScreen(
    importState: ImportUiState,
    defaultBaseUrl: String,
    onBack: () -> Unit,
    onImportJson: (String) -> Unit,
    onFetchFromServer: (baseUrl: String, studentDid: String) -> Unit,
    onClearMessage: () -> Unit
) {
    var jsonText by remember { mutableStateOf("") }
    var baseUrl by remember { mutableStateOf(defaultBaseUrl) }
    var studentDid by remember {
        mutableStateOf("did:polygon:student-jitesh-demo")
    }

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

        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
        ) {
            Text(
                text = "Import credential",
                style = MaterialTheme.typography.displayLarge,
                color = MaterialTheme.colorScheme.primary
            )
            Text(
                text = "Paste JSON from the issuer dashboard (Copy JSON), or fetch from the Node API.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f)
            )

            Spacer(Modifier.height(20.dp))
            Text("Paste JSON", style = MaterialTheme.typography.headlineMedium)
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = jsonText,
                onValueChange = {
                    jsonText = it
                    onClearMessage()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp),
                placeholder = { Text("{ \"credentialType\": \"UniversityDegreeCredential\", … }") }
            )
            Spacer(Modifier.height(12.dp))
            Button(
                onClick = { onImportJson(jsonText) },
                enabled = importState !is ImportUiState.Working,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Import pasted JSON")
            }

            Spacer(Modifier.height(28.dp))
            Text("Or fetch from server", style = MaterialTheme.typography.headlineMedium)
            Text(
                text = "Physical device: use your laptop LAN IP, e.g. http://192.168.1.10:3000",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = baseUrl,
                onValueChange = {
                    baseUrl = it
                    onClearMessage()
                },
                label = { Text("API base URL") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = studentDid,
                onValueChange = {
                    studentDid = it
                    onClearMessage()
                },
                label = { Text("Student DID") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            Spacer(Modifier.height(12.dp))
            OutlinedButton(
                onClick = { onFetchFromServer(baseUrl, studentDid) },
                enabled = importState !is ImportUiState.Working,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Fetch from /api/holder/credentials")
            }

            Spacer(Modifier.height(16.dp))
            when (val state = importState) {
                ImportUiState.Idle -> Unit
                ImportUiState.Working -> {
                    CircularProgressIndicator()
                    Text("Working…", modifier = Modifier.padding(top = 8.dp))
                }
                is ImportUiState.Success -> {
                    Text(
                        text = state.message,
                        color = MaterialTheme.colorScheme.secondary,
                        style = MaterialTheme.typography.titleLarge
                    )
                }
                is ImportUiState.Error -> {
                    Text(
                        text = state.message,
                        color = MaterialTheme.colorScheme.tertiary,
                        style = MaterialTheme.typography.titleLarge
                    )
                }
            }
            Spacer(Modifier.height(24.dp))
        }
    }
}
