package com.demony.invest.ui.screens.wallet

import android.annotation.SuppressLint
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.demony.invest.data.models.Bank
import com.demony.invest.data.models.Transaction
import com.demony.invest.ui.components.BottomNavigationBar
import com.demony.invest.ui.viewmodels.WalletViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WalletScreen(
    navController: NavController,
    viewModel: WalletViewModel = hiltViewModel()
) {
    val walletBalance by viewModel.walletBalance.collectAsState()
    val transactions by viewModel.transactions.collectAsState()
    val banks by viewModel.banks.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()
    val successMessage by viewModel.successMessage.collectAsState()
    val depositUrl by viewModel.depositUrl.collectAsState()
    
    var showDepositDialog by remember { mutableStateOf(false) }
    var showWithdrawDialog by remember { mutableStateOf(false) }
    var showPaystackWebView by remember { mutableStateOf(false) }
    var depositAmount by remember { mutableStateOf("") }
    var currentPaymentUrl by remember { mutableStateOf("") }
    
    // Watch for deposit URL changes
    LaunchedEffect(depositUrl) {
        depositUrl?.let { url ->
            currentPaymentUrl = url
            showPaystackWebView = true
            viewModel.clearDepositUrl()
        }
    }
    
    LaunchedEffect(Unit) {
        viewModel.loadWalletData()
    }
    
    // Paystack WebView Screen
    if (showPaystackWebView && currentPaymentUrl.isNotEmpty()) {
        PaystackWebViewScreen(
            url = currentPaymentUrl,
            onPaymentComplete = { reference ->
                showPaystackWebView = false
                currentPaymentUrl = ""
                if (reference != null) {
                    viewModel.verifyDeposit(reference)
                }
            },
            onCancel = {
                showPaystackWebView = false
                currentPaymentUrl = ""
            }
        )
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Wallet", fontWeight = FontWeight.Bold) },
                actions = {
                    IconButton(onClick = { viewModel.refresh() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                }
            )
        },
        bottomBar = {
            BottomNavigationBar(navController = navController)
        }
    ) { paddingValues ->
        if (isLoading && walletBalance == null) {
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
                // Error/Success Messages
                item {
                    error?.let { errorMessage ->
                        Card(
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.errorContainer
                            ),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    Icons.Default.Error,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.error
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = errorMessage,
                                    modifier = Modifier.weight(1f)
                                )
                                IconButton(onClick = { viewModel.clearMessages() }) {
                                    Icon(Icons.Default.Close, contentDescription = "Dismiss")
                                }
                            }
                        }
                    }
                    
                    successMessage?.let { message ->
                        Card(
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.secondaryContainer
                            ),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    Icons.Default.CheckCircle,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.secondary
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = message,
                                    modifier = Modifier.weight(1f)
                                )
                                IconButton(onClick = { viewModel.clearMessages() }) {
                                    Icon(Icons.Default.Close, contentDescription = "Dismiss")
                                }
                            }
                        }
                    }
                }
                
                // Balance Card
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.primary
                        )
                    ) {
                        Column(
                            modifier = Modifier.padding(24.dp)
                        ) {
                            Text(
                                text = "Available Balance",
                                style = MaterialTheme.typography.labelLarge,
                                color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.7f)
                            )
                            
                            Spacer(modifier = Modifier.height(4.dp))
                            
                            Text(
                                text = "GH₵ %.2f".format(walletBalance?.balance ?: 0.0),
                                style = MaterialTheme.typography.displaySmall,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onPrimary
                            )
                            
                            Spacer(modifier = Modifier.height(16.dp))
                            
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column {
                                    Text(
                                        text = "Total Invested",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.7f)
                                    )
                                    Text(
                                        text = "GH₵ %.2f".format(walletBalance?.totalInvested ?: 0.0),
                                        style = MaterialTheme.typography.titleMedium,
                                        color = MaterialTheme.colorScheme.onPrimary
                                    )
                                }
                                Column(horizontalAlignment = Alignment.End) {
                                    Text(
                                        text = "Total Earnings",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.7f)
                                    )
                                    Text(
                                        text = "GH₵ %.2f".format(walletBalance?.totalEarnings ?: 0.0),
                                        style = MaterialTheme.typography.titleMedium,
                                        color = MaterialTheme.colorScheme.onPrimary
                                    )
                                }
                            }
                        }
                    }
                }
                
                // Action Buttons
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Button(
                            onClick = { showDepositDialog = true },
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Deposit")
                        }
                        
                        OutlinedButton(
                            onClick = { showWithdrawDialog = true },
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.Remove, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Withdraw")
                        }
                    }
                }
                
                // Transaction History
                item {
                    Text(
                        text = "Transaction History",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                }
                
                if (transactions.isEmpty()) {
                    item {
                        Card(modifier = Modifier.fillMaxWidth()) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(32.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(
                                    Icons.Default.Receipt,
                                    contentDescription = null,
                                    modifier = Modifier.size(48.dp),
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "No transactions yet",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                } else {
                    items(transactions) { transaction ->
                        TransactionItem(transaction = transaction)
                    }
                }
            }
        }
        
        // Deposit Dialog
        if (showDepositDialog) {
            AlertDialog(
                onDismissRequest = { showDepositDialog = false },
                title = { Text("Deposit Funds") },
                text = {
                    Column {
                        OutlinedTextField(
                            value = depositAmount,
                            onValueChange = { depositAmount = it },
                            label = { Text("Amount (GH₵)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.fillMaxWidth(),
                            supportingText = { Text("Minimum deposit: GH₵ 10") }
                        )
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Text(
                            text = "You will be redirected to Paystack to complete your payment.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            val amount = depositAmount.toDoubleOrNull()
                            if (amount != null && amount >= 10) {
                                viewModel.initializeDeposit(amount)
                                showDepositDialog = false
                                depositAmount = ""
                            }
                        },
                        enabled = (depositAmount.toDoubleOrNull() ?: 0.0) >= 10
                    ) {
                        Text("Continue to Payment")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showDepositDialog = false }) {
                        Text("Cancel")
                    }
                }
            )
        }
        
        // Withdraw Dialog (full implementation)
        if (showWithdrawDialog) {
            WithdrawDialog(
                banks = banks,
                onLoadBanks = { viewModel.loadBanks() },
                onVerifyAccount = { accountNumber, bankCode, callback ->
                    viewModel.verifyBankAccount(accountNumber, bankCode, callback)
                },
                onSubmit = { amount, bankCode, accountNumber, accountName ->
                    viewModel.requestWithdrawal(amount, bankCode, accountNumber, accountName)
                    showWithdrawDialog = false
                },
                onDismiss = { showWithdrawDialog = false },
                isLoading = isLoading,
                availableBalance = walletBalance?.availableForWithdrawal ?: walletBalance?.balance ?: 0.0
            )
        }
    }
}

@Composable
private fun TransactionItem(transaction: Transaction) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                val (icon, color) = when (transaction.type) {
                    "deposit" -> Icons.Default.Add to MaterialTheme.colorScheme.secondary
                    "withdrawal" -> Icons.Default.Remove to MaterialTheme.colorScheme.error
                    "investment" -> Icons.Default.TrendingUp to MaterialTheme.colorScheme.primary
                    "profit" -> Icons.Default.AttachMoney to MaterialTheme.colorScheme.secondary
                    else -> Icons.Default.SwapHoriz to MaterialTheme.colorScheme.onSurfaceVariant
                }
                
                Surface(
                    color = color.copy(alpha = 0.1f),
                    shape = MaterialTheme.shapes.small,
                    modifier = Modifier.size(36.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = icon,
                            contentDescription = null,
                            modifier = Modifier.size(20.dp),
                            tint = color
                        )
                    }
                }
                
                Spacer(modifier = Modifier.width(10.dp))
                
                Column {
                    Text(
                        text = transaction.type.replaceFirstChar { it.uppercase() },
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = transaction.description ?: formatDate(transaction.createdAt),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1
                    )
                }
            }
            
            Column(horizontalAlignment = Alignment.End) {
                val isPositive = transaction.type in listOf("deposit", "profit")
                Text(
                    text = "${if (isPositive) "+" else "-"} GH₵ %.2f".format(kotlin.math.abs(transaction.amount)),
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold,
                    color = if (isPositive) MaterialTheme.colorScheme.secondary else MaterialTheme.colorScheme.error
                )
                
                Text(
                    text = transaction.status.replaceFirstChar { it.uppercase() },
                    style = MaterialTheme.typography.labelSmall,
                    color = when (transaction.status) {
                        "completed", "success" -> MaterialTheme.colorScheme.secondary
                        "pending" -> MaterialTheme.colorScheme.tertiary
                        else -> MaterialTheme.colorScheme.error
                    }
                )
            }
        }
    }
}

private fun formatDate(dateString: String?): String {
    if (dateString == null) return "N/A"
    return try {
        // Parse ISO date and format nicely
        val date = dateString.take(10)
        val parts = date.split("-")
        if (parts.size == 3) {
            val months = listOf("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
            val month = months.getOrElse(parts[1].toInt() - 1) { "N/A" }
            "$month ${parts[2]}, ${parts[0]}"
        } else date
    } catch (e: Exception) {
        dateString.take(10)
    }
}

@SuppressLint("SetJavaScriptEnabled")
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PaystackWebViewScreen(
    url: String,
    onPaymentComplete: (reference: String?) -> Unit,
    onCancel: () -> Unit
) {
    var isLoading by remember { mutableStateOf(true) }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Complete Payment") },
                navigationIcon = {
                    IconButton(onClick = onCancel) {
                        Icon(Icons.Default.Close, contentDescription = "Cancel")
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            AndroidView(
                factory = { context ->
                    WebView(context).apply {
                        settings.javaScriptEnabled = true
                        settings.domStorageEnabled = true
                        settings.loadWithOverviewMode = true
                        settings.useWideViewPort = true
                        
                        webViewClient = object : WebViewClient() {
                            override fun onPageFinished(view: WebView?, url: String?) {
                                isLoading = false
                            }
                            
                            override fun shouldOverrideUrlLoading(
                                view: WebView?,
                                request: WebResourceRequest?
                            ): Boolean {
                                val requestUrl = request?.url?.toString() ?: return false
                                
                                // Check if payment completed (callback URL)
                                if (requestUrl.contains("status=success") || 
                                    requestUrl.contains("trxref=") ||
                                    requestUrl.contains("reference=")) {
                                    // Extract reference from URL
                                    val uri = request.url
                                    val reference = uri?.getQueryParameter("trxref") 
                                        ?: uri?.getQueryParameter("reference")
                                    onPaymentComplete(reference)
                                    return true
                                }
                                
                                // Check if payment cancelled/failed
                                if (requestUrl.contains("status=cancelled") ||
                                    requestUrl.contains("status=failed")) {
                                    onCancel()
                                    return true
                                }
                                
                                return false
                            }
                        }
                        
                        loadUrl(url)
                    }
                },
                modifier = Modifier.fillMaxSize()
            )
            
            if (isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        CircularProgressIndicator()
                        Spacer(modifier = Modifier.height(16.dp))
                        Text("Loading payment page...")
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WithdrawDialog(
    banks: List<Bank>,
    onLoadBanks: () -> Unit,
    onVerifyAccount: (String, String, (String?) -> Unit) -> Unit,
    onSubmit: (Double, String, String, String) -> Unit,
    onDismiss: () -> Unit,
    isLoading: Boolean,
    availableBalance: Double
) {
    var withdrawAmount by remember { mutableStateOf("") }
    var selectedBank by remember { mutableStateOf<Bank?>(null) }
    var accountNumber by remember { mutableStateOf("") }
    var accountName by remember { mutableStateOf<String?>(null) }
    var isVerifying by remember { mutableStateOf(false) }
    var expanded by remember { mutableStateOf(false) }
    var withdrawMethod by remember { mutableStateOf("bank") } // "bank" or "momo"
    
    // Load banks when dialog opens
    LaunchedEffect(Unit) {
        onLoadBanks()
    }
    
    // Auto-verify account when both bank and account number are filled
    LaunchedEffect(selectedBank, accountNumber) {
        if (selectedBank != null && accountNumber.length >= 10) {
            isVerifying = true
            accountName = null
            onVerifyAccount(accountNumber, selectedBank!!.code) { name ->
                accountName = name
                isVerifying = false
            }
        }
    }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Withdraw Funds") },
        text = {
            Column(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Available Balance Info
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.5f)
                    )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Available Balance", style = MaterialTheme.typography.bodySmall)
                        Text(
                            "GH₵ %.2f".format(availableBalance),
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.secondary
                        )
                    }
                }
                
                // Method Selection
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilterChip(
                        selected = withdrawMethod == "bank",
                        onClick = { withdrawMethod = "bank" },
                        label = { Text("Bank Transfer") },
                        modifier = Modifier.weight(1f)
                    )
                    FilterChip(
                        selected = withdrawMethod == "momo",
                        onClick = { withdrawMethod = "momo" },
                        label = { Text("Mobile Money") },
                        modifier = Modifier.weight(1f)
                    )
                }
                
                // Amount Field
                OutlinedTextField(
                    value = withdrawAmount,
                    onValueChange = { withdrawAmount = it },
                    label = { Text("Amount (GH₵)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth(),
                    supportingText = { Text("Minimum withdrawal: GH₵ 20") }
                )
                
                // Bank Selection
                ExposedDropdownMenuBox(
                    expanded = expanded,
                    onExpandedChange = { expanded = !expanded }
                ) {
                    OutlinedTextField(
                        value = selectedBank?.name ?: "",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text(if (withdrawMethod == "bank") "Select Bank" else "Select Network") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor()
                    )
                    ExposedDropdownMenu(
                        expanded = expanded,
                        onDismissRequest = { expanded = false }
                    ) {
                        if (banks.isEmpty()) {
                            DropdownMenuItem(
                                text = { Text("Loading...") },
                                onClick = {}
                            )
                        } else {
                            banks.forEach { bank ->
                                DropdownMenuItem(
                                    text = { Text(bank.name) },
                                    onClick = {
                                        selectedBank = bank
                                        expanded = false
                                        accountName = null
                                    }
                                )
                            }
                        }
                    }
                }
                
                // Account Number
                OutlinedTextField(
                    value = accountNumber,
                    onValueChange = { 
                        accountNumber = it
                        accountName = null
                    },
                    label = { Text(if (withdrawMethod == "bank") "Account Number" else "Phone Number") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth()
                )
                
                // Account Name (auto-verified)
                if (isVerifying) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Verifying account...", style = MaterialTheme.typography.bodySmall)
                    }
                } else if (accountName != null) {
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.secondaryContainer
                        )
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.secondary,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text(
                                    "Account Name",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.7f)
                                )
                                Text(
                                    accountName!!,
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }
                }
                
                // Warning
                Text(
                    text = "• Withdrawals are processed within 24-48 hours\n• Please ensure your account details are correct",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val amount = withdrawAmount.toDoubleOrNull()
                    if (amount != null && selectedBank != null && accountName != null) {
                        onSubmit(amount, selectedBank!!.code, accountNumber, accountName!!)
                    }
                },
                enabled = !isLoading && 
                          !isVerifying &&
                          (withdrawAmount.toDoubleOrNull() ?: 0.0) >= 20 &&
                          (withdrawAmount.toDoubleOrNull() ?: Double.MAX_VALUE) <= availableBalance &&
                          selectedBank != null &&
                          accountName != null
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        strokeWidth = 2.dp,
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                } else {
                    Text("Submit Withdrawal")
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
