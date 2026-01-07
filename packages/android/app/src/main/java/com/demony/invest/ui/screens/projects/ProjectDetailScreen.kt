package com.demony.invest.ui.screens.projects

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.demony.invest.ui.components.Base64Image
import com.demony.invest.ui.components.RiskBadge
import com.demony.invest.ui.viewmodels.InvestmentsViewModel
import com.demony.invest.ui.viewmodels.ProjectsViewModel
import com.demony.invest.ui.viewmodels.WalletViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProjectDetailScreen(
    projectId: String,
    onNavigateBack: () -> Unit,
    onInvestSuccess: () -> Unit,
    projectsViewModel: ProjectsViewModel = hiltViewModel(),
    investmentsViewModel: InvestmentsViewModel = hiltViewModel(),
    walletViewModel: WalletViewModel = hiltViewModel()
) {
    val project by projectsViewModel.selectedProject.collectAsState()
    val isLoading by projectsViewModel.isLoading.collectAsState()
    val error by projectsViewModel.error.collectAsState()
    val walletBalance by walletViewModel.walletBalance.collectAsState()
    val investSuccess by investmentsViewModel.investSuccess.collectAsState()
    val investError by investmentsViewModel.error.collectAsState()
    val isInvesting by investmentsViewModel.isLoading.collectAsState()
    
    var investAmount by remember { mutableStateOf("") }
    var showInvestDialog by remember { mutableStateOf(false) }
    var termsAccepted by remember { mutableStateOf(false) }
    var riskAcknowledged by remember { mutableStateOf(false) }
    var lossAcknowledged by remember { mutableStateOf(false) }
    var lockInAcknowledged by remember { mutableStateOf(false) }
    
    LaunchedEffect(projectId) {
        projectsViewModel.getProject(projectId)
    }
    
    LaunchedEffect(investSuccess) {
        if (investSuccess) {
            investmentsViewModel.clearInvestSuccess()
            showInvestDialog = false
            onInvestSuccess()
        }
    }
    
    DisposableEffect(Unit) {
        onDispose {
            projectsViewModel.clearSelectedProject()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Project Details") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else if (project == null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Project not found")
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(onClick = onNavigateBack) {
                        Text("Go Back")
                    }
                }
            }
        } else {
            val proj = project!!
            
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .verticalScroll(rememberScrollState())
            ) {
                // Project Image
                if (!proj.imageUrl.isNullOrEmpty()) {
                    val imageModifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp)
                    
                    // Check if it's a base64 data URL or a regular URL
                    if (proj.imageUrl.startsWith("data:")) {
                        Base64Image(
                            base64String = proj.imageUrl,
                            contentDescription = proj.name,
                            modifier = imageModifier,
                            contentScale = ContentScale.Crop
                        )
                    } else {
                        AsyncImage(
                            model = proj.imageUrl,
                            contentDescription = proj.name,
                            modifier = imageModifier,
                            contentScale = ContentScale.Crop
                        )
                    }
                }
                
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Title & Category
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Top
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = proj.name,
                                style = MaterialTheme.typography.headlineSmall,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            AssistChip(
                                onClick = {},
                                label = { Text(proj.category) }
                            )
                        }
                        RiskBadge(riskLevel = proj.riskLevel)
                    }
                    
                    // Description
                    Text(
                        text = proj.description,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    
                    // Funding Progress
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)
                        )
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "${proj.fundingPercentage}% Funded",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.primary
                                )
                                Text(
                                    text = "${proj.investorCount} investors",
                                    style = MaterialTheme.typography.bodyMedium
                                )
                            }
                            
                            Spacer(modifier = Modifier.height(8.dp))
                            
                            LinearProgressIndicator(
                                progress = proj.fundingProgress.coerceIn(0f, 1f),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(12.dp)
                                    .clip(MaterialTheme.shapes.medium)
                            )
                            
                            Spacer(modifier = Modifier.height(8.dp))
                            
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Raised: GH₵ %.0f".format(proj.raisedAmount))
                                Text("Goal: GH₵ %.0f".format(proj.goalAmount))
                            }
                        }
                    }
                    
                    // Investment Details
                    Card {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = "Investment Details",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            
                            Spacer(modifier = Modifier.height(12.dp))
                            
                            DetailRow("Target Returns", proj.targetReturn)
                            DetailRow("Duration", "${proj.duration} months")
                            DetailRow("Min Investment", "GH₵ %.0f".format(proj.minInvestment))
                            DetailRow("Lock-in Period", proj.lockInPeriodMonths)
                            DetailRow("Profit Distribution", proj.profitDistributionFrequency.replace("_", " ").replaceFirstChar { it.uppercase() })
                            
                            proj.profitSharingRatio?.let { ratio ->
                                DetailRow("Investor Share", "${ratio.investor}%")
                            }
                        }
                    }
                    
                    // Risk Information
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.2f)
                        )
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    Icons.Default.Warning,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.error
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Risk Information",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            
                            Spacer(modifier = Modifier.height(8.dp))
                            
                            proj.riskDisclaimer?.let {
                                Text(
                                    text = it,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            
                            Spacer(modifier = Modifier.height(8.dp))
                            
                            proj.riskFactors.forEach { factor ->
                                Row(modifier = Modifier.padding(vertical = 2.dp)) {
                                    Text("• ", color = MaterialTheme.colorScheme.error)
                                    Text(
                                        text = factor,
                                        style = MaterialTheme.typography.bodySmall
                                    )
                                }
                            }
                        }
                    }
                    
                    // Wallet Balance Info
                    walletBalance?.let { balance ->
                        Card(
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.3f)
                            )
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(
                                        text = "Your Wallet Balance",
                                        style = MaterialTheme.typography.labelMedium
                                    )
                                    Text(
                                        text = "GH₵ %.2f".format(balance.balance),
                                        style = MaterialTheme.typography.titleLarge,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                                Icon(
                                    Icons.Default.AccountBalanceWallet,
                                    contentDescription = null,
                                    modifier = Modifier.size(32.dp),
                                    tint = MaterialTheme.colorScheme.secondary
                                )
                            }
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    // Invest Button
                    Button(
                        onClick = { showInvestDialog = true },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        enabled = proj.status == "active"
                    ) {
                        Icon(Icons.Default.TrendingUp, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (proj.status == "active") "Invest Now" else "Project Closed",
                            style = MaterialTheme.typography.titleMedium
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }
        }
        
        // Investment Dialog
        if (showInvestDialog && project != null) {
            AlertDialog(
                onDismissRequest = { showInvestDialog = false },
                title = { Text("Invest in ${project!!.name}") },
                text = {
                    Column {
                        // Error message
                        investError?.let { errorMessage ->
                            Card(
                                colors = CardDefaults.cardColors(
                                    containerColor = MaterialTheme.colorScheme.errorContainer
                                ),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(
                                    text = errorMessage,
                                    modifier = Modifier.padding(12.dp),
                                    color = MaterialTheme.colorScheme.onErrorContainer
                                )
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                        }
                        
                        OutlinedTextField(
                            value = investAmount,
                            onValueChange = { investAmount = it },
                            label = { Text("Amount (GH₵)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.fillMaxWidth(),
                            supportingText = {
                                Text("Min: GH₵ %.0f".format(project!!.minInvestment))
                            }
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Risk Acknowledgments
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Checkbox(
                                checked = termsAccepted,
                                onCheckedChange = { termsAccepted = it }
                            )
                            Text(
                                text = "I accept the investment terms",
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                        
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Checkbox(
                                checked = riskAcknowledged,
                                onCheckedChange = { riskAcknowledged = it }
                            )
                            Text(
                                text = "I understand profits are not guaranteed",
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                        
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Checkbox(
                                checked = lossAcknowledged,
                                onCheckedChange = { lossAcknowledged = it }
                            )
                            Text(
                                text = "I can afford to lose this investment",
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                        
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Checkbox(
                                checked = lockInAcknowledged,
                                onCheckedChange = { lockInAcknowledged = it }
                            )
                            Text(
                                text = "I understand principal is locked",
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            val amount = investAmount.toDoubleOrNull()
                            if (amount != null && amount >= project!!.minInvestment) {
                                investmentsViewModel.invest(projectId, amount)
                            }
                        },
                        enabled = !isInvesting && 
                                  termsAccepted && 
                                  riskAcknowledged && 
                                  lossAcknowledged && 
                                  lockInAcknowledged &&
                                  (investAmount.toDoubleOrNull() ?: 0.0) >= project!!.minInvestment
                    ) {
                        if (isInvesting) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text("Confirm Investment")
                        }
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showInvestDialog = false }) {
                        Text("Cancel")
                    }
                }
            )
        }
    }
}

@Composable
private fun DetailRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.SemiBold
        )
    }
}
