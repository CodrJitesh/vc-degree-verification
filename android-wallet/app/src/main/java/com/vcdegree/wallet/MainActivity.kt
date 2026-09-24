package com.vcdegree.wallet

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.vcdegree.wallet.ui.navigation.Route
import com.vcdegree.wallet.ui.screens.CredentialDetailScreen
import com.vcdegree.wallet.ui.screens.CredentialsListScreen
import com.vcdegree.wallet.ui.screens.ImportCredentialScreen
import com.vcdegree.wallet.ui.screens.VerificationRequestScreen
import com.vcdegree.wallet.ui.theme.VcWalletTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val deepLinkRequestId = parseRequestId(intent)

        setContent {
            VcWalletTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    val app = application as VcWalletApp
                    val navController = rememberNavController()
                    val vm: WalletViewModel = viewModel(
                        factory = WalletViewModel.factory(app)
                    )
                    var pendingRequestId by remember {
                        mutableStateOf(deepLinkRequestId)
                    }

                    NavHost(
                        navController = navController,
                        startDestination = Route.Credentials.path
                    ) {
                        composable(Route.Credentials.path) {
                            CredentialsListScreen(
                                credentials = vm.credentials,
                                sdkReady = vm.sdkReady,
                                onOpenCredential = { id ->
                                    navController.navigate(Route.CredentialDetail.create(id))
                                },
                                onImport = {
                                    vm.clearImportState()
                                    navController.navigate(Route.Import.path)
                                },
                                onOpenDemoRequest = {
                                    val req = vm.loadDemoVerificationRequest()
                                    navController.navigate(
                                        Route.VerificationRequest.create(req.requestId)
                                    )
                                }
                            )
                        }

                        composable(Route.Import.path) {
                            ImportCredentialScreen(
                                importState = vm.importState,
                                defaultBaseUrl = vm.defaultApiBaseUrl,
                                onBack = { navController.popBackStack() },
                                onImportJson = { raw -> vm.importFromJson(raw) },
                                onFetchFromServer = { base, did ->
                                    vm.fetchFromServer(base, did)
                                },
                                onClearMessage = { vm.clearImportState() }
                            )
                        }

                        composable(
                            route = Route.CredentialDetail.path,
                            arguments = listOf(
                                navArgument("credentialId") { type = NavType.StringType }
                            )
                        ) { entry ->
                            val id = entry.arguments?.getString("credentialId").orEmpty()
                            CredentialDetailScreen(
                                credential = vm.credentialById(id),
                                onBack = { navController.popBackStack() },
                                onRespondToRequest = {
                                    val req = vm.loadDemoVerificationRequest()
                                    navController.navigate(
                                        Route.VerificationRequest.create(req.requestId)
                                    )
                                }
                            )
                        }

                        composable(
                            route = Route.VerificationRequest.path,
                            arguments = listOf(
                                navArgument("requestId") { type = NavType.StringType }
                            )
                        ) { entry ->
                            val requestId = entry.arguments?.getString("requestId").orEmpty()
                            LaunchedEffect(requestId) {
                                vm.prepareVerificationRequest(requestId)
                            }
                            VerificationRequestScreen(
                                request = vm.activeVerificationRequest
                                    ?: vm.verificationRequest(requestId),
                                credential = vm.credentials.firstOrNull(),
                                proofState = vm.proofState,
                                onApprove = { req, cred -> vm.approve(req, cred) },
                                onReject = {
                                    vm.reject()
                                    navController.popBackStack(Route.Credentials.path, false)
                                },
                                onDone = {
                                    navController.popBackStack(Route.Credentials.path, false)
                                },
                                onBack = { navController.popBackStack() }
                            )
                        }
                    }

                    pendingRequestId?.let { id ->
                        pendingRequestId = null
                        navController.navigate(Route.VerificationRequest.create(id))
                    }
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
    }

    private fun parseRequestId(intent: Intent?): String? {
        val data: Uri = intent?.data ?: return null
        return data.lastPathSegment
    }
}
