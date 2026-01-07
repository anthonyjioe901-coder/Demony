package com.demony.invest.ui.screens.settings

import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.demony.invest.ui.components.BottomNavigationBar
import com.demony.invest.ui.navigation.Screen
import com.demony.invest.ui.viewmodels.AuthViewModel
import com.demony.invest.ui.viewmodels.SettingsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    navController: NavController,
    authViewModel: AuthViewModel = hiltViewModel(),
    settingsViewModel: SettingsViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    
    val pushNotifications by settingsViewModel.pushNotifications.collectAsState()
    val emailNotifications by settingsViewModel.emailNotifications.collectAsState()
    val biometricEnabled by settingsViewModel.biometricLogin.collectAsState()
    val darkModeEnabled by settingsViewModel.darkMode.collectAsState()
    val showToast by settingsViewModel.showToast.collectAsState()
    
    var showDeleteDialog by remember { mutableStateOf(false) }
    var showPasswordDialog by remember { mutableStateOf(false) }
    var currentPassword by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }

    // Show toast messages
    LaunchedEffect(showToast) {
        showToast?.let { message ->
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
            settingsViewModel.clearToast()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        bottomBar = {
            BottomNavigationBar(navController = navController)
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Notifications Section
            item {
                Text(
                    text = "Notifications",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            }
            
            item {
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column {
                        SettingsToggleRow(
                            icon = Icons.Default.Notifications,
                            title = "Push Notifications",
                            subtitle = "Receive updates about investments and profits",
                            checked = pushNotifications,
                            onCheckedChange = { settingsViewModel.setPushNotifications(it) }
                        )
                        Divider()
                        SettingsToggleRow(
                            icon = Icons.Default.Email,
                            title = "Email Notifications",
                            subtitle = "Receive email updates about your account",
                            checked = emailNotifications,
                            onCheckedChange = { settingsViewModel.setEmailNotifications(it) }
                        )
                    }
                }
            }
            
            // Security Section
            item {
                Text(
                    text = "Security",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            }
            
            item {
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column {
                        SettingsToggleRow(
                            icon = Icons.Default.Fingerprint,
                            title = "Biometric Login",
                            subtitle = "Use fingerprint or face to login",
                            checked = biometricEnabled,
                            onCheckedChange = { settingsViewModel.setBiometricLogin(it) }
                        )
                        Divider()
                        SettingsActionRow(
                            icon = Icons.Default.Lock,
                            title = "Change Password",
                            subtitle = "Update your account password",
                            onClick = { showPasswordDialog = true }
                        )
                        Divider()
                        SettingsActionRow(
                            icon = Icons.Default.Security,
                            title = "Two-Factor Authentication",
                            subtitle = "Add extra security to your account",
                            onClick = {
                                Toast.makeText(context, "2FA coming soon", Toast.LENGTH_SHORT).show()
                            }
                        )
                    }
                }
            }
            
            // Appearance Section
            item {
                Text(
                    text = "Appearance",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            }
            
            item {
                Card(modifier = Modifier.fillMaxWidth()) {
                    SettingsToggleRow(
                        icon = Icons.Default.DarkMode,
                        title = "Dark Mode",
                        subtitle = "Switch to dark theme",
                        checked = darkModeEnabled,
                        onCheckedChange = { 
                            settingsViewModel.setDarkMode(it)
                            // Also update AuthViewModel so theme changes immediately
                            authViewModel.setDarkMode(it)
                        }
                    )
                }
            }
            
            // About Section
            item {
                Text(
                    text = "About",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            }
            
            item {
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column {
                        SettingsInfoRow(
                            icon = Icons.Default.Info,
                            title = "App Version",
                            value = "1.0.0"
                        )
                        Divider()
                        SettingsActionRow(
                            icon = Icons.Default.Description,
                            title = "Terms of Service",
                            subtitle = "Read our terms",
                            onClick = {
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://demony.app/terms"))
                                context.startActivity(intent)
                            }
                        )
                        Divider()
                        SettingsActionRow(
                            icon = Icons.Default.PrivacyTip,
                            title = "Privacy Policy",
                            subtitle = "How we handle your data",
                            onClick = {
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://demony.app/privacy"))
                                context.startActivity(intent)
                            }
                        )
                    }
                }
            }
            
            // Danger Zone
            item {
                Text(
                    text = "Danger Zone",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.error
                )
            }
            
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.3f)
                    )
                ) {
                    SettingsActionRow(
                        icon = Icons.Default.Delete,
                        title = "Delete Account",
                        subtitle = "Permanently delete your account and all data",
                        onClick = { showDeleteDialog = true },
                        isDestructive = true
                    )
                }
            }
            
            // Logout
            item {
                Button(
                    onClick = {
                        authViewModel.logout()
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
        
        // Delete Account Dialog
        if (showDeleteDialog) {
            AlertDialog(
                onDismissRequest = { showDeleteDialog = false },
                icon = { Icon(Icons.Default.Warning, contentDescription = null) },
                title = { Text("Delete Account?") },
                text = {
                    Text(
                        "This action cannot be undone. All your data, including investments and earnings, will be permanently deleted."
                    )
                },
                confirmButton = {
                    Button(
                        onClick = {
                            showDeleteDialog = false
                            Toast.makeText(context, "Account deletion coming soon. Contact support.", Toast.LENGTH_LONG).show()
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.error
                        )
                    ) {
                        Text("Delete Account")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showDeleteDialog = false }) {
                        Text("Cancel")
                    }
                }
            )
        }
        
        // Change Password Dialog
        if (showPasswordDialog) {
            AlertDialog(
                onDismissRequest = { 
                    showPasswordDialog = false
                    currentPassword = ""
                    newPassword = ""
                    confirmPassword = ""
                },
                title = { Text("Change Password") },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = currentPassword,
                            onValueChange = { currentPassword = it },
                            label = { Text("Current Password") },
                            modifier = Modifier.fillMaxWidth()
                        )
                        OutlinedTextField(
                            value = newPassword,
                            onValueChange = { newPassword = it },
                            label = { Text("New Password") },
                            modifier = Modifier.fillMaxWidth()
                        )
                        OutlinedTextField(
                            value = confirmPassword,
                            onValueChange = { confirmPassword = it },
                            label = { Text("Confirm New Password") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            if (newPassword == confirmPassword && newPassword.length >= 6) {
                                settingsViewModel.changePassword(currentPassword, newPassword)
                                showPasswordDialog = false
                                currentPassword = ""
                                newPassword = ""
                                confirmPassword = ""
                            } else {
                                Toast.makeText(context, "Passwords must match and be at least 6 characters", Toast.LENGTH_SHORT).show()
                            }
                        },
                        enabled = currentPassword.isNotEmpty() && newPassword.isNotEmpty() && confirmPassword.isNotEmpty()
                    ) {
                        Text("Change Password")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { 
                        showPasswordDialog = false
                        currentPassword = ""
                        newPassword = ""
                        confirmPassword = ""
                    }) {
                        Text("Cancel")
                    }
                }
            )
        }
    }
}

@Composable
private fun SettingsToggleRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
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
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyMedium
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange
        )
    }
}

@Composable
private fun SettingsActionRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit,
    isDestructive: Boolean = false
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
                tint = if (isDestructive) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodyMedium,
                    color = if (isDestructive) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Icon(
                Icons.Default.ChevronRight,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun SettingsInfoRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
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
        Text(
            text = title,
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.weight(1f)
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
