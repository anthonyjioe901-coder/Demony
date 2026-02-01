package com.demony.invest.ui.screens.profile

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.util.Base64
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.demony.invest.ui.components.BottomNavigationBar
import com.demony.invest.ui.navigation.Screen
import com.demony.invest.ui.viewmodels.AuthViewModel
import java.io.ByteArrayOutputStream

// Helper function to convert Uri to Base64
fun uriToBase64(context: Context, uri: Uri): String? {
    return try {
        val inputStream = context.contentResolver.openInputStream(uri)
        val bitmap = BitmapFactory.decodeStream(inputStream)
        val outputStream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, 70, outputStream)
        val bytes = outputStream.toByteArray()
        "data:image/jpeg;base64," + Base64.encodeToString(bytes, Base64.NO_WRAP)
    } catch (e: Exception) {
        null
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    navController: NavController,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val user by viewModel.currentUser.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val kycSubmitSuccess by viewModel.kycSubmitSuccess.collectAsState()
    
    // KYC Dialog state
    var showKycDialog by remember { mutableStateOf(false) }
    var kycStep by remember { mutableStateOf(0) } // 0 = intro, 1 = ID type & number, 2 = ID upload, 3 = selfie, 4 = submitting, 5 = submitted
    var selectedIdType by remember { mutableStateOf("Ghana Card") }
    var idNumber by remember { mutableStateOf("") }
    var selectedIdUri by remember { mutableStateOf<Uri?>(null) }
    var selectedSelfieUri by remember { mutableStateOf<Uri?>(null) }
    var kycError by remember { mutableStateOf<String?>(null) }
    var isSubmitting by remember { mutableStateOf(false) }
    
    val idTypes = listOf("Ghana Card", "Passport", "Driver's License", "Voter's ID")
    
    // Watch for KYC submit success
    LaunchedEffect(kycSubmitSuccess) {
        if (kycSubmitSuccess) {
            kycStep = 5
            isSubmitting = false
            viewModel.clearKycSubmitSuccess()
        }
    }
    
    // Image pickers
    val idDocumentPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let { selectedIdUri = it }
    }
    
    val selfiePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let { selectedSelfieUri = it }
    }

    LaunchedEffect(Unit) {
        viewModel.refreshUser()
    }
    
    // KYC Verification Dialog
    if (showKycDialog) {
        AlertDialog(
            onDismissRequest = { 
                if (!isSubmitting) {
                    showKycDialog = false
                    kycStep = 0
                    selectedIdType = "Ghana Card"
                    idNumber = ""
                    selectedIdUri = null
                    selectedSelfieUri = null
                    kycError = null
                }
            },
            title = {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = when (kycStep) {
                            0 -> "KYC Verification"
                            1 -> "ID Information"
                            2 -> "Upload ID Document"
                            3 -> "Take a Selfie"
                            4 -> "Submitting..."
                            else -> "Verification Submitted"
                        },
                        fontWeight = FontWeight.Bold
                    )
                    if (!isSubmitting) {
                        IconButton(onClick = { 
                            showKycDialog = false
                            kycStep = 0
                            selectedIdType = "Ghana Card"
                            idNumber = ""
                            selectedIdUri = null
                            selectedSelfieUri = null
                            kycError = null
                        }) {
                            Icon(Icons.Default.Close, contentDescription = "Close")
                        }
                    }
                }
            },
            text = {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    // Show error if any
                    kycError?.let { error ->
                        Card(
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.errorContainer
                            ),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = error,
                                modifier = Modifier.padding(12.dp),
                                color = MaterialTheme.colorScheme.onErrorContainer
                            )
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                    }
                    
                    when (kycStep) {
                        0 -> {
                            // Introduction
                            Icon(
                                Icons.Default.VerifiedUser,
                                contentDescription = null,
                                modifier = Modifier.size(64.dp),
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "Complete your KYC verification to unlock all features",
                                style = MaterialTheme.typography.bodyMedium,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "You will need:",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Badge, null, Modifier.size(20.dp))
                                Spacer(Modifier.width(8.dp))
                                Text("Valid Government ID (Ghana Card, Passport, etc.)")
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.CameraAlt, null, Modifier.size(20.dp))
                                Spacer(Modifier.width(8.dp))
                                Text("A clear selfie photo")
                            }
                        }
                        1 -> {
                            // ID Type and Number
                            Icon(
                                Icons.Default.Badge,
                                contentDescription = null,
                                modifier = Modifier.size(64.dp),
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "Enter your ID details",
                                style = MaterialTheme.typography.bodyMedium,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            
                            // ID Type Dropdown
                            var idTypeExpanded by remember { mutableStateOf(false) }
                            ExposedDropdownMenuBox(
                                expanded = idTypeExpanded,
                                onExpandedChange = { idTypeExpanded = !idTypeExpanded }
                            ) {
                                OutlinedTextField(
                                    value = selectedIdType,
                                    onValueChange = {},
                                    readOnly = true,
                                    label = { Text("ID Type") },
                                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = idTypeExpanded) },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .menuAnchor()
                                )
                                ExposedDropdownMenu(
                                    expanded = idTypeExpanded,
                                    onDismissRequest = { idTypeExpanded = false }
                                ) {
                                    idTypes.forEach { type ->
                                        DropdownMenuItem(
                                            text = { Text(type) },
                                            onClick = {
                                                selectedIdType = type
                                                idTypeExpanded = false
                                            }
                                        )
                                    }
                                }
                            }
                            
                            Spacer(modifier = Modifier.height(12.dp))
                            
                            OutlinedTextField(
                                value = idNumber,
                                onValueChange = { idNumber = it },
                                label = { Text("ID Number") },
                                placeholder = { Text("Enter your ID number") },
                                singleLine = true,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                        2 -> {
                            // ID Upload
                            Icon(
                                Icons.Default.Badge,
                                contentDescription = null,
                                modifier = Modifier.size(64.dp),
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "Upload a clear photo of your $selectedIdType",
                                style = MaterialTheme.typography.bodyMedium,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            
                            if (selectedIdUri != null) {
                                Card(
                                    colors = CardDefaults.cardColors(
                                        containerColor = MaterialTheme.colorScheme.secondaryContainer
                                    )
                                ) {
                                    Row(
                                        modifier = Modifier.padding(12.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(Icons.Default.CheckCircle, null, tint = MaterialTheme.colorScheme.secondary)
                                        Spacer(Modifier.width(8.dp))
                                        Text("ID Document selected")
                                    }
                                }
                            }
                            
                            Spacer(modifier = Modifier.height(8.dp))
                            OutlinedButton(
                                onClick = { idDocumentPicker.launch("image/*") }
                            ) {
                                Icon(Icons.Default.Upload, null)
                                Spacer(Modifier.width(8.dp))
                                Text(if (selectedIdUri == null) "Choose File" else "Change File")
                            }
                        }
                        3 -> {
                            // Selfie
                            Icon(
                                Icons.Default.CameraAlt,
                                contentDescription = null,
                                modifier = Modifier.size(64.dp),
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "Upload a clear selfie photo for identity verification",
                                style = MaterialTheme.typography.bodyMedium,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            
                            if (selectedSelfieUri != null) {
                                Card(
                                    colors = CardDefaults.cardColors(
                                        containerColor = MaterialTheme.colorScheme.secondaryContainer
                                    )
                                ) {
                                    Row(
                                        modifier = Modifier.padding(12.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(Icons.Default.CheckCircle, null, tint = MaterialTheme.colorScheme.secondary)
                                        Spacer(Modifier.width(8.dp))
                                        Text("Selfie selected")
                                    }
                                }
                            }
                            
                            Spacer(modifier = Modifier.height(8.dp))
                            OutlinedButton(
                                onClick = { selfiePicker.launch("image/*") }
                            ) {
                                Icon(Icons.Default.Upload, null)
                                Spacer(Modifier.width(8.dp))
                                Text(if (selectedSelfieUri == null) "Choose Photo" else "Change Photo")
                            }
                        }
                        4 -> {
                            // Submitting
                            CircularProgressIndicator(
                                modifier = Modifier.size(64.dp)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "Uploading documents...",
                                style = MaterialTheme.typography.titleMedium,
                                textAlign = TextAlign.Center
                            )
                            Text(
                                text = "Please wait while we upload your documents.",
                                style = MaterialTheme.typography.bodySmall,
                                textAlign = TextAlign.Center,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        else -> {
                            // Submitted
                            Icon(
                                Icons.Default.CheckCircle,
                                contentDescription = null,
                                modifier = Modifier.size(64.dp),
                                tint = MaterialTheme.colorScheme.secondary
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "Your KYC verification has been submitted!",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "We'll review your documents and notify you within 24-48 hours.",
                                style = MaterialTheme.typography.bodyMedium,
                                textAlign = TextAlign.Center,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            },
            confirmButton = {
                when (kycStep) {
                    0 -> Button(onClick = { kycStep = 1 }) { Text("Start Verification") }
                    1 -> Button(
                        onClick = { kycStep = 2 },
                        enabled = idNumber.isNotBlank()
                    ) { Text("Continue") }
                    2 -> Button(
                        onClick = { kycStep = 3 },
                        enabled = selectedIdUri != null
                    ) { Text("Continue") }
                    3 -> Button(
                        onClick = { 
                            // Convert URIs to Base64 and submit
                            kycStep = 4
                            isSubmitting = true
                            kycError = null
                            
                            val idBase64 = selectedIdUri?.let { uriToBase64(context, it) }
                            val selfieBase64 = selectedSelfieUri?.let { uriToBase64(context, it) }
                            
                            if (idBase64 != null && selfieBase64 != null) {
                                viewModel.submitKyc(
                                    idDocumentBase64 = idBase64, 
                                    selfieBase64 = selfieBase64,
                                    idType = selectedIdType,
                                    idNumber = idNumber
                                ) { success, error ->
                                    if (success) {
                                        kycStep = 5
                                    } else {
                                        kycStep = 3
                                        kycError = error ?: "Failed to submit KYC"
                                    }
                                    isSubmitting = false
                                }
                            } else {
                                kycStep = 3
                                kycError = "Failed to process images. Please try again."
                                isSubmitting = false
                            }
                        },
                        enabled = selectedSelfieUri != null && !isSubmitting
                    ) { Text("Submit") }
                    4 -> { /* Show nothing while submitting */ }
                    else -> Button(onClick = { 
                        showKycDialog = false
                        kycStep = 0
                        selectedIdType = "Ghana Card"
                        idNumber = ""
                        selectedIdUri = null
                        selectedSelfieUri = null
                        kycError = null
                    }) { Text("Done") }
                }
            },
            dismissButton = {
                if (kycStep > 0 && kycStep < 4 && !isSubmitting) {
                    TextButton(onClick = { kycStep-- }) {
                        Text("Back")
                    }
                }
            }
        )
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
                                onClick = { showKycDialog = true }
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
