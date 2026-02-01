package com.demony.invest.ui.screens.support

import android.content.Intent
import android.net.Uri
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.demony.invest.ui.components.BottomNavigationBar
import com.demony.invest.ui.viewmodels.SupportViewModel

data class LocalSupportTicket(
    val id: String,
    val subject: String,
    val message: String,
    val status: String,
    val createdAt: String,
    val category: String
)

data class FAQ(
    val question: String,
    val answer: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SupportScreen(
    navController: NavController,
    viewModel: SupportViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()
    val successMessage by viewModel.successMessage.collectAsState()
    
    var selectedTab by remember { mutableIntStateOf(0) }
    var showNewTicketDialog by remember { mutableStateOf(false) }
    var ticketSubject by remember { mutableStateOf("") }
    var ticketMessage by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("General") }
    
    // Show success message and close dialog
    LaunchedEffect(successMessage) {
        if (successMessage != null) {
            showNewTicketDialog = false
            ticketSubject = ""
            ticketMessage = ""
            selectedCategory = "General"
        }
    }
    
    val faqs = remember {
        listOf(
            FAQ(
                question = "How do I make an investment?",
                answer = "Browse available projects in the Projects tab, select one you're interested in, enter the amount you want to invest, accept the terms, and confirm your investment."
            ),
            FAQ(
                question = "When will I receive my profits?",
                answer = "Profits are distributed according to each project's schedule, typically monthly. You can view pending profits in your Portfolio section."
            ),
            FAQ(
                question = "How do I withdraw my funds?",
                answer = "Go to the Wallet tab, click Withdraw, enter the amount and your bank details. Withdrawals are processed within 1-3 business days."
            ),
            FAQ(
                question = "What is the minimum investment amount?",
                answer = "The minimum investment varies by project but typically starts at GH₵ 100. Check each project's details for specific requirements."
            ),
            FAQ(
                question = "How do I complete KYC verification?",
                answer = "Go to Profile, tap on Complete KYC Verification, and provide the required documents including a valid ID and proof of address."
            ),
            FAQ(
                question = "Is my money safe?",
                answer = "We take security seriously. All investments are protected through our escrow system, and we conduct thorough due diligence on all projects."
            )
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Help & Support", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        bottomBar = {
            BottomNavigationBar(navController = navController)
        },
        snackbarHost = {
            successMessage?.let { message ->
                Snackbar(
                    action = {
                        TextButton(onClick = { viewModel.clearMessages() }) {
                            Text("Dismiss")
                        }
                    }
                ) {
                    Text(message)
                }
            }
            error?.let { errorMessage ->
                Snackbar(
                    containerColor = MaterialTheme.colorScheme.errorContainer,
                    contentColor = MaterialTheme.colorScheme.onErrorContainer,
                    action = {
                        TextButton(onClick = { viewModel.clearMessages() }) {
                            Text("Dismiss")
                        }
                    }
                ) {
                    Text(errorMessage)
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Tabs
            TabRow(selectedTabIndex = selectedTab) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = { Text("FAQs") },
                    icon = { Icon(Icons.Default.QuestionAnswer, contentDescription = null) }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = { Text("Submit Ticket") },
                    icon = { Icon(Icons.Default.SupportAgent, contentDescription = null) }
                )
            }
            
            when (selectedTab) {
                0 -> {
                    // FAQs
                    LazyColumn(
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(
                                    containerColor = MaterialTheme.colorScheme.primaryContainer
                                )
                            ) {
                                Row(
                                    modifier = Modifier.padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        Icons.Default.Help,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.onPrimaryContainer
                                    )
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Column {
                                        Text(
                                            text = "Frequently Asked Questions",
                                            style = MaterialTheme.typography.titleMedium,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            text = "Find quick answers to common questions",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f)
                                        )
                                    }
                                }
                            }
                        }
                        
                        items(faqs) { faq ->
                            FAQItem(faq = faq)
                        }
                        
                        // Contact Options
                        item {
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Still need help?",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        
                        item {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Card(
                                    modifier = Modifier.weight(1f),
                                    onClick = {
                                        val intent = Intent(Intent.ACTION_SENDTO).apply {
                                            data = Uri.parse("mailto:support@demony.app")
                                            putExtra(Intent.EXTRA_SUBJECT, "Support Request")
                                        }
                                        context.startActivity(intent)
                                    }
                                ) {
                                    Column(
                                        modifier = Modifier.padding(16.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Icon(
                                            Icons.Default.Email,
                                            contentDescription = null,
                                            tint = MaterialTheme.colorScheme.primary
                                        )
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Text(
                                            text = "Email Us",
                                            style = MaterialTheme.typography.labelLarge
                                        )
                                    }
                                }
                                
                                Card(
                                    modifier = Modifier.weight(1f),
                                    onClick = {
                                        val intent = Intent(Intent.ACTION_DIAL).apply {
                                            data = Uri.parse("tel:+233200000000")
                                        }
                                        context.startActivity(intent)
                                    }
                                ) {
                                    Column(
                                        modifier = Modifier.padding(16.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Icon(
                                            Icons.Default.Phone,
                                            contentDescription = null,
                                            tint = MaterialTheme.colorScheme.primary
                                        )
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Text(
                                            text = "Call Us",
                                            style = MaterialTheme.typography.labelLarge
                                        )
                                    }
                                }
                                
                                Card(
                                    modifier = Modifier.weight(1f),
                                    onClick = {
                                        // Open WhatsApp for live chat
                                        val intent = Intent(Intent.ACTION_VIEW).apply {
                                            data = Uri.parse("https://wa.me/233200000000?text=Hi,%20I%20need%20help%20with%20my%20Demony%20account")
                                        }
                                        context.startActivity(intent)
                                    }
                                ) {
                                    Column(
                                        modifier = Modifier.padding(16.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Icon(
                                            Icons.Default.Chat,
                                            contentDescription = null,
                                            tint = MaterialTheme.colorScheme.primary
                                        )
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Text(
                                            text = "Live Chat",
                                            style = MaterialTheme.typography.labelLarge
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
                1 -> {
                    // Submit Ticket Form
                    LazyColumn(
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(
                                    containerColor = MaterialTheme.colorScheme.primaryContainer
                                )
                            ) {
                                Row(
                                    modifier = Modifier.padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        Icons.Default.SupportAgent,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.onPrimaryContainer,
                                        modifier = Modifier.size(40.dp)
                                    )
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Column {
                                        Text(
                                            text = "Need Help?",
                                            style = MaterialTheme.typography.titleMedium,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            text = "Submit a support ticket and we'll get back to you within 24 hours",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f)
                                        )
                                    }
                                }
                            }
                        }
                        
                        item {
                            // Category Dropdown
                            var expanded by remember { mutableStateOf(false) }
                            ExposedDropdownMenuBox(
                                expanded = expanded,
                                onExpandedChange = { expanded = !expanded }
                            ) {
                                OutlinedTextField(
                                    value = selectedCategory,
                                    onValueChange = {},
                                    readOnly = true,
                                    label = { Text("Category") },
                                    leadingIcon = { Icon(Icons.Default.Category, contentDescription = null) },
                                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .menuAnchor()
                                )
                                ExposedDropdownMenu(
                                    expanded = expanded,
                                    onDismissRequest = { expanded = false }
                                ) {
                                    listOf("General", "Investment", "Withdrawal", "Technical", "Account").forEach { category ->
                                        DropdownMenuItem(
                                            text = { Text(category) },
                                            onClick = {
                                                selectedCategory = category
                                                expanded = false
                                            }
                                        )
                                    }
                                }
                            }
                        }
                        
                        item {
                            OutlinedTextField(
                                value = ticketSubject,
                                onValueChange = { ticketSubject = it },
                                label = { Text("Subject") },
                                leadingIcon = { Icon(Icons.Default.Subject, contentDescription = null) },
                                placeholder = { Text("Brief description of your issue") },
                                singleLine = true,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                        
                        item {
                            OutlinedTextField(
                                value = ticketMessage,
                                onValueChange = { ticketMessage = it },
                                label = { Text("Message") },
                                leadingIcon = { Icon(Icons.Default.Message, contentDescription = null) },
                                placeholder = { Text("Describe your issue in detail...") },
                                minLines = 5,
                                maxLines = 10,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                        
                        item {
                            Button(
                                onClick = {
                                    viewModel.submitTicket(selectedCategory, ticketSubject, ticketMessage)
                                },
                                enabled = ticketSubject.isNotBlank() && ticketMessage.isNotBlank() && !isLoading,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                if (isLoading) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(20.dp),
                                        color = MaterialTheme.colorScheme.onPrimary,
                                        strokeWidth = 2.dp
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Submitting...")
                                } else {
                                    Icon(Icons.Default.Send, contentDescription = null)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Submit Ticket")
                                }
                            }
                        }
                        
                        item {
                            Divider()
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Or contact us directly:",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        
                        item {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                OutlinedCard(
                                    modifier = Modifier.weight(1f),
                                    onClick = {
                                        val intent = Intent(Intent.ACTION_SENDTO).apply {
                                            data = Uri.parse("mailto:support@demony.app")
                                            putExtra(Intent.EXTRA_SUBJECT, "Support Request: $ticketSubject")
                                            putExtra(Intent.EXTRA_TEXT, ticketMessage)
                                        }
                                        context.startActivity(intent)
                                    }
                                ) {
                                    Column(
                                        modifier = Modifier.padding(12.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Icon(
                                            Icons.Default.Email,
                                            contentDescription = null,
                                            tint = MaterialTheme.colorScheme.primary
                                        )
                                        Text("Email", style = MaterialTheme.typography.labelMedium)
                                    }
                                }
                                
                                OutlinedCard(
                                    modifier = Modifier.weight(1f),
                                    onClick = {
                                        val intent = Intent(Intent.ACTION_VIEW).apply {
                                            data = Uri.parse("https://wa.me/233200000000?text=Hi,%20I%20need%20help")
                                        }
                                        context.startActivity(intent)
                                    }
                                ) {
                                    Column(
                                        modifier = Modifier.padding(12.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Icon(
                                            Icons.Default.Chat,
                                            contentDescription = null,
                                            tint = MaterialTheme.colorScheme.primary
                                        )
                                        Text("WhatsApp", style = MaterialTheme.typography.labelMedium)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FAQItem(faq: FAQ) {
    var expanded by remember { mutableStateOf(false) }
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        onClick = { expanded = !expanded }
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = faq.question,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.weight(1f)
                )
                Icon(
                    imageVector = if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = null
                )
            }
            
            if (expanded) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = faq.answer,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
