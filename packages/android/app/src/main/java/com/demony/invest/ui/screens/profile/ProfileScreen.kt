package com.demony.invest.ui.screens.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.demony.invest.ui.components.BottomNavigationBar
import com.demony.invest.ui.navigation.Screen
import com.demony.invest.ui.viewmodels.AuthViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    navController: NavController,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val user by viewModel.currentUser.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.refreshUser()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Profile", fontWeight = FontWeight.Bold) },
                actions = {
                    IconButton(onClick = { navController.navigate(Screen.Settings.route) }) {
                        Icon(Icons.Default.Settings, contentDescription = "Settings")
                    }
                }
            )
        },
        bottomBar = {
            BottomNavigationBar(navController = navController)
        }
    ) { paddingValues ->
        if (isLoading && user == null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Profile Header
                item {
                    Card(modifier = Modifier.fillMaxWidth()) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Surface(
                                modifier = Modifier.size(80.dp),
                                shape = CircleShape,
                                color = MaterialTheme.colorScheme.primary
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text(
                                        text = user?.name?.firstOrNull()?.uppercase() ?: "U",
                                        style = MaterialTheme.typography.headlineMedium,
                                        color = MaterialTheme.colorScheme.onPrimary
                                    )
                                }
                            }
                            
                            Spacer(modifier = Modifier.height(12.dp))
                            
                            Text(
                                text = user?.name ?: "User",
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold
                            )
                            
                            Text(
                                text = user?.email ?: "",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            
                            Spacer(modifier = Modifier.height(8.dp))
                            
                            // Verification Status
                            Surface(
                                color = if (user?.getKycStatusValue() == "verified")
                                    MaterialTheme.colorScheme.secondary.copy(alpha = 0.1f)
                                else
                                    MaterialTheme.colorScheme.tertiary.copy(alpha = 0.1f),
                                shape = MaterialTheme.shapes.small
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = if (user?.getKycStatusValue() == "verified")
                                            Icons.Default.VerifiedUser
                                        else
                                            Icons.Default.Warning,
                                        contentDescription = null,
                                        modifier = Modifier.size(16.dp),
                                        tint = if (user?.getKycStatusValue() == "verified")
                                            MaterialTheme.colorScheme.secondary
                                        else
                                            MaterialTheme.colorScheme.tertiary
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = when (user?.getKycStatusValue()) {
                                            "verified" -> "Verified"
                                            "pending", "submitted" -> "Verification Pending"
                                            else -> "Not Verified"
                                        },
                                        style = MaterialTheme.typography.labelMedium
                                    )
                                }
                            }
                        }
                    }
                }
                
                // Account Details
                item {
                    Text(
                        text = "Account Details",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
                
                item {
                    Card(modifier = Modifier.fillMaxWidth()) {
                        Column {
                            ProfileDetailRow(
                                icon = Icons.Default.Phone,
                                label = "Phone Number",
                                value = user?.phone ?: "Not provided"
                            )
                            Divider()
                            ProfileDetailRow(
                                icon = Icons.Default.DateRange,
                                label = "Member Since",
                                value = user?.createdAt?.take(10) ?: "N/A"
                            )
                            Divider()
                            ProfileDetailRow(
                                icon = Icons.Default.Badge,
                                label = "Account Type",
                                value = if (user?.role == "admin") "Administrator" else "Investor"
                            )
                        }
                    }
                }
                
                // KYC Info
                user?.kyc?.let { kyc ->
                    item {
                        Text(
                            text = "KYC Information",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    
                    item {
                        Card(modifier = Modifier.fillMaxWidth()) {
                            Column {
                                ProfileDetailRow(
                                    icon = Icons.Default.VerifiedUser,
                                    label = "KYC Status",
                                    value = kyc.status.replaceFirstChar { it.uppercase() }
                                )
                                Divider()
                                ProfileDetailRow(
                                    icon = Icons.Default.DateRange,
                                    label = "Submitted At",
                                    value = kyc.submittedAt?.take(10) ?: "Not submitted"
                                )
                                Divider()
                                ProfileDetailRow(
                                    icon = Icons.Default.CheckCircle,
                                    label = "Verified At",
                                    value = kyc.verifiedAt?.take(10) ?: "Not verified"
                                )
                            }
                        }
                    }
                }
                
                // Actions
                item {
                    Text(
                        text = "Quick Actions",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
                
                item {
                    Card(modifier = Modifier.fillMaxWidth()) {
                        Column {
                            ProfileActionRow(
                                icon = Icons.Default.PieChart,
                                label = "My Portfolio",
                                onClick = { navController.navigate(Screen.Portfolio.route) }
                            )
                            Divider()
                            ProfileActionRow(
                                icon = Icons.Default.Verified,
                                label = "Complete KYC Verification",
                                onClick = { /* Navigate to KYC */ }
                            )
                            Divider()
                            ProfileActionRow(
                                icon = Icons.Default.Share,
                                label = "Referral Program",
                                onClick = { navController.navigate(Screen.Referrals.route) }
                            )
                            Divider()
                            ProfileActionRow(
                                icon = Icons.Default.Help,
                                label = "Help & Support",
                                onClick = { navController.navigate(Screen.Support.route) }
                            )
                        }
                    }
                }
                
                // Logout
                item {
                    Button(
                        onClick = {
                            viewModel.logout()
                            navController.navigate(Screen.Login.route) {
                                popUpTo(0) { inclusive = true }
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.error
                        )
                    ) {
                        Icon(Icons.Default.Logout, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Logout")
                    }
                }
            }
        }
    }
}

@Composable
private fun ProfileDetailRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    value: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.width(16.dp))
        Column {
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = value,
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}

@Composable
private fun ProfileActionRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(16.dp))
            Text(
                text = label,
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.weight(1f)
            )
            Icon(
                Icons.Default.ChevronRight,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
