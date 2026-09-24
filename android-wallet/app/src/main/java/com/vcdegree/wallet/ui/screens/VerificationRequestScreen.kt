package com.vcdegree.wallet.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
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
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.vcdegree.wallet.ProofUiState
import com.vcdegree.wallet.data.UniversityDegreeCredential
import com.vcdegree.wallet.data.VerificationRequest

@Composable
fun VerificationRequestScreen(
    request: VerificationRequest,
    credential: UniversityDegreeCredential?,
    proofState: ProofUiState,
    onApprove: (VerificationRequest, UniversityDegreeCredential) -> Unit,
    onReject: () -> Unit,
    onDone: () -> Unit,
    onBack: () -> Unit
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

        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
        ) {
            Text(
                text = request.verifierName,
                style = MaterialTheme.typography.displayLarge,
                color = MaterialTheme.colorScheme.primary
            )
            Text(
                text = "wants to verify",
                style = MaterialTheme.typography.bodyLarge
            )
            Text(
                text = "Request ${request.requestId}",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
            )

            Spacer(Modifier.height(20.dp))
            Text("Required", style = MaterialTheme.typography.headlineMedium)
            Spacer(Modifier.height(8.dp))
            request.required.degree?.let { Bullet("Degree = $it") }
            request.required.branch?.let { Bullet("Branch = $it") }
            request.required.graduationYear?.let {
                Bullet("Graduation year ${it.op} ${it.value}")
            }
            request.required.cgpa?.let {
                Bullet("CGPA ${it.op} ${it.value}")
            }

            Spacer(Modifier.height(20.dp))
            Text("Will be revealed", style = MaterialTheme.typography.headlineMedium)
            request.reveal.forEach { Bullet(it) }

            Spacer(Modifier.height(16.dp))
            Text("Stays private", style = MaterialTheme.typography.headlineMedium)
            request.keepPrivate.forEach { Bullet(it, muted = true) }

            when (val state = proofState) {
                is ProofUiState.Working -> {
                    Spacer(Modifier.height(24.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        CircularProgressIndicator()
                        Spacer(Modifier.width(12.dp))
                        Text("Generating presentation / proof…")
                    }
                }
                is ProofUiState.Done -> {
                    Spacer(Modifier.height(24.dp))
                    Text(
                        text = state.result.message,
                        style = MaterialTheme.typography.titleLarge,
                        color = MaterialTheme.colorScheme.secondary
                    )
                    Text(
                        text = if (state.submitted) "Submitted to verifier path (stub)."
                        else "Created locally; submit skipped.",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
                is ProofUiState.Error -> {
                    Spacer(Modifier.height(24.dp))
                    Text(
                        text = state.message,
                        color = MaterialTheme.colorScheme.tertiary,
                        style = MaterialTheme.typography.titleLarge
                    )
                }
                ProofUiState.Idle -> Unit
            }
        }

        when (proofState) {
            is ProofUiState.Done -> {
                Button(
                    onClick = onDone,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 16.dp)
                ) { Text("Done") }
            }
            is ProofUiState.Working -> {
                Spacer(Modifier.height(16.dp))
            }
            else -> {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = onReject,
                        modifier = Modifier.weight(1f)
                    ) { Text("Reject") }
                    Button(
                        onClick = {
                            if (credential != null) onApprove(request, credential)
                        },
                        enabled = credential != null,
                        modifier = Modifier.weight(1f)
                    ) { Text("Approve") }
                }
            }
        }
    }
}

@Composable
private fun Bullet(text: String, muted: Boolean = false) {
    Text(
        text = "•  $text",
        style = MaterialTheme.typography.bodyLarge,
        color = if (muted) {
            MaterialTheme.colorScheme.onBackground.copy(alpha = 0.55f)
        } else {
            MaterialTheme.colorScheme.onBackground
        },
        modifier = Modifier.padding(vertical = 2.dp)
    )
}
