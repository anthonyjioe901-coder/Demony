package com.demony.invest.ui.screens.support

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
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

data class FAQ(
    val category: String,
    val question: String,
    val answer: String
)

private object SupportContactInfo {
    const val EMAIL = "support@demony.com"
    const val PHONE = "+233249251305"
    const val WHATSAPP_URL = "https://wa.me/233249251305"
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SupportScreen(
    navController: NavController,
    viewModel: SupportViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    var selectedTab by remember { mutableIntStateOf(0) }
    var showNewTicketDialog by remember { mutableStateOf(false) }
    var ticketSubject by remember { mutableStateOf("") }
    var ticketMessage by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("other") }
    var selectedPriority by remember { mutableStateOf("medium") }
    var ticketEmail by remember { mutableStateOf("") }
    var faqQuery by remember { mutableStateOf("") }
    var selectedFaqCategory by remember { mutableStateOf("All") }
    
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()
    val successMessage by viewModel.successMessage.collectAsState()
    val ticketSubmitted by viewModel.ticketSubmitted.collectAsState()
    val myTickets by viewModel.myTickets.collectAsState()
    val currentUserEmail by viewModel.currentUserEmail.collectAsState()
    val systemStatus by viewModel.systemStatus.collectAsState()
    val isStatusLoading by viewModel.isStatusLoading.collectAsState()
    val ticketDetails by viewModel.ticketDetails.collectAsState()
    val isTicketDetailsLoading by viewModel.isTicketDetailsLoading.collectAsState()
    val ticketDetailsError by viewModel.ticketDetailsError.collectAsState()

    var showTicketDetailsDialog by remember { mutableStateOf(false) }

    val categoryOptions = remember {
        listOf(
            "other" to "General",
            "investment" to "Investment",
            "withdrawal" to "Withdrawal",
            "technical" to "Technical",
            "account" to "Account",
            "deposit" to "Deposit",
            "feedback" to "Feedback",
            "business" to "Business"
        )
    }
    val priorityOptions = remember {
        listOf(
            "low" to "Low",
            "medium" to "Medium",
            "high" to "High"
        )
    }

    LaunchedEffect(currentUserEmail) {
        if (ticketEmail.isBlank() && currentUserEmail.isNotBlank()) {
            ticketEmail = currentUserEmail
        }
    }
    
    // Handle successful ticket submission
    LaunchedEffect(ticketSubmitted) {
        if (ticketSubmitted) {
            showNewTicketDialog = false
            ticketSubject = ""
            ticketMessage = ""
            selectedCategory = "other"
            selectedPriority = "medium"
            viewModel.clearTicketSubmitted()
        }
    }

    LaunchedEffect(selectedTab) {
        if (selectedTab == 1) {
            viewModel.loadMyTickets()
        }
    }
    
    val faqs = remember {
        listOf(
            FAQ(
                category = "Getting Started",
                question = "How do I create an account?",
                answer = "Tap Sign Up, enter your details, choose Investor or Business Owner, then verify your email. You can browse immediately, but KYC is required before investing."
            ),
            FAQ(
                category = "Getting Started",
                question = "What is KYC verification and why is it required?",
                answer = "KYC verifies identity to prevent fraud and comply with regulations. You’ll submit a valid ID and a selfie; review usually takes 24–48 hours."
            ),
            FAQ(
                category = "Getting Started",
                question = "What documents do I need for verification?",
                answer = "You need a valid government-issued ID and a recent selfie. Business owners may also need business registration documents."
            ),
            FAQ(
                category = "Deposits & Wallet",
                question = "How do I deposit money into my wallet?",
                answer = "Open Wallet, tap Deposit, enter amount, then complete payment through Paystack using card, MoMo, or bank transfer."
            ),
            FAQ(
                category = "Deposits & Wallet",
                question = "How long do deposits take to reflect?",
                answer = "Card and MoMo are usually instant. Bank transfers may take 1–3 business days. If delayed, contact support with your payment reference."
            ),
            FAQ(
                category = "Deposits & Wallet",
                question = "Are my funds safe?",
                answer = "Wallet funds are secured with strong controls and payment-provider protections. Invested funds still carry project risk."
            ),
            FAQ(
                category = "Investments",
                question = "How do I make an investment?",
                answer = "Browse available projects in the Projects tab, select one you're interested in, enter the amount you want to invest, accept the terms, and confirm your investment."
            ),
            FAQ(
                category = "Investments",
                question = "When will I receive my profits?",
                answer = "Profits are distributed according to each project's schedule, typically monthly. You can view pending profits in your Portfolio section."
            ),
            FAQ(
                category = "Withdrawals",
                question = "How do I withdraw my funds?",
                answer = "Go to the Wallet tab, click Withdraw, enter the amount and your bank details. Withdrawals are processed within 1-3 business days."
            ),
            FAQ(
                category = "Investments",
                question = "What is the minimum investment amount?",
                answer = "The minimum investment varies by project but typically starts at GH₵ 100. Check each project's details for specific requirements."
            ),
            FAQ(
                category = "Account & Security",
                question = "How do I complete KYC verification?",
                answer = "Go to Profile, tap on Complete KYC Verification, and provide the required documents including a valid ID and proof of address."
            ),
            FAQ(
                category = "Account & Security",
                question = "How do I reset my password?",
                answer = "From Login, tap Forgot Password, enter your email, and follow the reset link. Check spam if it does not arrive quickly."
            ),
            FAQ(
                category = "Account & Security",
                question = "What should I do if I suspect unauthorized access?",
                answer = "Change your password immediately, review recent activity, and contact support so your account can be protected while we investigate."
            ),
            FAQ(
                category = "Business Owners",
                question = "How do I submit my business for funding?",
                answer = "Sign up as Business Owner, complete business profile details, and submit your project proposal for review."
            ),
            FAQ(
                category = "Business Owners",
                question = "How long does project approval take?",
                answer = "Initial review usually takes 5–10 business days. Complex submissions or missing documents can take longer."
            ),
            FAQ(
                category = "Investments",
                question = "Is my money safe?",
                answer = "We take security seriously. All investments are protected through our escrow system, and we conduct thorough due diligence on all projects."
            )
        )
    }

    val faqCategories = remember(faqs) {
        listOf("All") + faqs.map { it.category }.distinct()
    }

    val filteredFaqs = remember(faqs, faqQuery, selectedFaqCategory) {
        val byCategory = if (selectedFaqCategory == "All") faqs else faqs.filter { it.category == selectedFaqCategory }
        if (faqQuery.isBlank()) byCategory else {
            val query = faqQuery.trim().lowercase()
            byCategory.filter { faq ->
                faq.question.lowercase().contains(query) || faq.answer.lowercase().contains(query)
            }
        }
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
        floatingActionButton = {
            if (selectedTab == 1) {
                FloatingActionButton(
                    onClick = { showNewTicketDialog = true }
                ) {
                    Icon(Icons.Default.Add, contentDescription = "New Ticket")
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
                    text = { Text("My Tickets") },
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

                        item {
                            OutlinedTextField(
                                value = faqQuery,
                                onValueChange = { faqQuery = it },
                                modifier = Modifier.fillMaxWidth(),
                                label = { Text("Search FAQs") },
                                placeholder = { Text("Search for answers...") },
                                leadingIcon = {
                                    Icon(Icons.Default.Search, contentDescription = null)
                                },
                                singleLine = true
                            )
                        }

                        item {
                            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                items(faqCategories) { category ->
                                    FilterChip(
                                        selected = selectedFaqCategory == category,
                                        onClick = { selectedFaqCategory = category },
                                        label = { Text(category) }
                                    )
                                }
                            }
                        }

                        if (filteredFaqs.isEmpty()) {
                            item {
                                Card(modifier = Modifier.fillMaxWidth()) {
                                    Text(
                                        text = "No FAQ matches your search.",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        modifier = Modifier.padding(16.dp)
                                    )
                                }
                            }
                        }
                        
                        items(filteredFaqs) { faq ->
                            FAQItem(faq = faq)
                        }

                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(
                                    containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
                                )
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(14.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            Icons.Default.Info,
                                            contentDescription = null,
                                            tint = MaterialTheme.colorScheme.primary
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text("System Status", style = MaterialTheme.typography.bodyMedium)
                                    }

                                    if (isStatusLoading) {
                                        CircularProgressIndicator(
                                            modifier = Modifier.size(16.dp),
                                            strokeWidth = 2.dp
                                        )
                                    } else {
                                        val statusLabel = when (systemStatus?.lowercase()) {
                                            "operational" -> "Operational"
                                            null -> "Unavailable"
                                            else -> systemStatus!!.replaceFirstChar { it.uppercase() }
                                        }
                                        val statusColor = when (systemStatus?.lowercase()) {
                                            "operational" -> MaterialTheme.colorScheme.secondary
                                            null -> MaterialTheme.colorScheme.onSurfaceVariant
                                            else -> MaterialTheme.colorScheme.tertiary
                                        }

                                        Text(
                                            text = statusLabel,
                                            color = statusColor,
                                            style = MaterialTheme.typography.labelLarge,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                    }
                                }
                            }
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
                                            data = Uri.parse("mailto:${SupportContactInfo.EMAIL}")
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
                                            data = Uri.parse("tel:${SupportContactInfo.PHONE}")
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
                                            data = Uri.parse(SupportContactInfo.WHATSAPP_URL)
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
                    // My Tickets - Show submitted tickets
                    if (isLoading) {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator()
                        }
                    } else if (myTickets.isEmpty()) {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(
                                    Icons.Default.SupportAgent,
                                    contentDescription = null,
                                    modifier = Modifier.size(64.dp),
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                                )
                                Spacer(modifier = Modifier.height(16.dp))
                                Text(
                                    text = "No support tickets",
                                    style = MaterialTheme.typography.titleMedium
                                )
                                Text(
                                    text = "Create a ticket if you need help",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Spacer(modifier = Modifier.height(16.dp))
                                Button(onClick = { showNewTicketDialog = true }) {
                                    Icon(Icons.Default.Add, contentDescription = null)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Create Ticket")
                                }
                            }
                        }
                    } else {
                        LazyColumn(
                            contentPadding = PaddingValues(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            items(myTickets) { ticket ->
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    onClick = {
                                        val selectedTicketId = ticket.ticketId ?: ticket.id
                                        if (!selectedTicketId.isNullOrBlank()) {
                                            showTicketDetailsDialog = true
                                            viewModel.loadTicketDetails(selectedTicketId)
                                        }
                                    }
                                ) {
                                    Column(modifier = Modifier.padding(16.dp)) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text(
                                                text = ticket.subject,
                                                style = MaterialTheme.typography.titleSmall,
                                                fontWeight = FontWeight.SemiBold,
                                                modifier = Modifier.weight(1f)
                                            )
                                            Surface(
                                                color = when (ticket.status) {
                                                    "open" -> MaterialTheme.colorScheme.tertiary.copy(alpha = 0.15f)
                                                    "resolved", "closed" -> MaterialTheme.colorScheme.secondary.copy(alpha = 0.15f)
                                                    else -> MaterialTheme.colorScheme.surfaceVariant
                                                },
                                                shape = MaterialTheme.shapes.small
                                            ) {
                                                Text(
                                                    text = ticket.status.replaceFirstChar { it.uppercase() },
                                                    style = MaterialTheme.typography.labelSmall,
                                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                                    color = when (ticket.status) {
                                                        "open" -> MaterialTheme.colorScheme.tertiary
                                                        "resolved", "closed" -> MaterialTheme.colorScheme.secondary
                                                        else -> MaterialTheme.colorScheme.onSurfaceVariant
                                                    }
                                                )
                                            }
                                        }
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(
                                            text = ticket.message,
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                            maxLines = 2
                                        )
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Text(
                                                text = ticket.category,
                                                style = MaterialTheme.typography.labelSmall,
                                                color = MaterialTheme.colorScheme.primary
                                            )
                                            Text(
                                                text = ticket.ticketId?.let { "ID: $it" } ?: ticket.id?.let { "ID: $it" } ?: "",
                                                style = MaterialTheme.typography.labelSmall,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            // Success message snackbar
            if (successMessage != null) {
                Snackbar(
                    modifier = Modifier.padding(16.dp),
                    action = {
                        TextButton(onClick = { viewModel.clearSuccessMessage() }) {
                            Text("OK")
                        }
                    }
                ) {
                    Text(successMessage ?: "")
                }
            }
        }
        
        // New Ticket Dialog
        if (showNewTicketDialog) {
            AlertDialog(
                onDismissRequest = { 
                    if (!isLoading) {
                        showNewTicketDialog = false
                        viewModel.clearError()
                    }
                },
                title = { Text("Create Support Ticket") },
                text = {
                    Column(
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Error message
                        if (error != null) {
                            Card(
                                colors = CardDefaults.cardColors(
                                    containerColor = MaterialTheme.colorScheme.errorContainer
                                ),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(
                                    text = error ?: "",
                                    color = MaterialTheme.colorScheme.onErrorContainer,
                                    modifier = Modifier.padding(12.dp)
                                )
                            }
                        }
                        
                        // Category
                        var categoryExpanded by remember { mutableStateOf(false) }
                        ExposedDropdownMenuBox(
                            expanded = categoryExpanded,
                            onExpandedChange = { if (!isLoading) categoryExpanded = !categoryExpanded }
                        ) {
                            OutlinedTextField(
                                value = categoryOptions.firstOrNull { it.first == selectedCategory }?.second ?: "General",
                                onValueChange = {},
                                readOnly = true,
                                enabled = !isLoading,
                                label = { Text("Category") },
                                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = categoryExpanded) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .menuAnchor()
                            )
                            ExposedDropdownMenu(
                                expanded = categoryExpanded,
                                onDismissRequest = { categoryExpanded = false }
                            ) {
                                categoryOptions.forEach { category ->
                                    DropdownMenuItem(
                                        text = { Text(category.second) },
                                        onClick = {
                                            selectedCategory = category.first
                                            categoryExpanded = false
                                        }
                                    )
                                }
                            }
                        }

                        // Priority
                        var priorityExpanded by remember { mutableStateOf(false) }
                        ExposedDropdownMenuBox(
                            expanded = priorityExpanded,
                            onExpandedChange = { if (!isLoading) priorityExpanded = !priorityExpanded }
                        ) {
                            OutlinedTextField(
                                value = priorityOptions.firstOrNull { it.first == selectedPriority }?.second ?: "Medium",
                                onValueChange = {},
                                readOnly = true,
                                enabled = !isLoading,
                                label = { Text("Priority") },
                                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = priorityExpanded) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .menuAnchor()
                            )
                            ExposedDropdownMenu(
                                expanded = priorityExpanded,
                                onDismissRequest = { priorityExpanded = false }
                            ) {
                                priorityOptions.forEach { priority ->
                                    DropdownMenuItem(
                                        text = { Text(priority.second) },
                                        onClick = {
                                            selectedPriority = priority.first
                                            priorityExpanded = false
                                        }
                                    )
                                }
                            }
                        }
                        
                        OutlinedTextField(
                            value = ticketSubject,
                            onValueChange = { ticketSubject = it },
                            label = { Text("Subject") },
                            enabled = !isLoading,
                            modifier = Modifier.fillMaxWidth(),
                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next)
                        )
                        
                        OutlinedTextField(
                            value = ticketMessage,
                            onValueChange = { ticketMessage = it },
                            label = { Text("Message") },
                            enabled = !isLoading,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(150.dp),
                            maxLines = 5
                        )

                        OutlinedTextField(
                            value = ticketEmail,
                            onValueChange = { ticketEmail = it },
                            label = { Text("Email") },
                            enabled = !isLoading,
                            modifier = Modifier.fillMaxWidth(),
                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done)
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            viewModel.submitTicket(
                                subject = ticketSubject,
                                message = ticketMessage,
                                category = selectedCategory,
                                priority = selectedPriority,
                                email = ticketEmail
                            )
                        },
                        enabled = ticketSubject.isNotBlank() && ticketMessage.isNotBlank() && ticketEmail.isNotBlank() && !isLoading
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(20.dp),
                                color = MaterialTheme.colorScheme.onPrimary,
                                strokeWidth = 2.dp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                        }
                        Text(if (isLoading) "Submitting..." else "Submit")
                    }
                },
                dismissButton = {
                    TextButton(
                        onClick = { 
                            showNewTicketDialog = false
                            viewModel.clearError()
                        },
                        enabled = !isLoading
                    ) {
                        Text("Cancel")
                    }
                }
            )
        }

        if (showTicketDetailsDialog) {
            AlertDialog(
                onDismissRequest = {
                    showTicketDetailsDialog = false
                    viewModel.clearTicketDetails()
                },
                title = {
                    Text(ticketDetails?.ticketId?.let { "Ticket $it" } ?: "Ticket Details")
                },
                text = {
                    when {
                        isTicketDetailsLoading -> {
                            Box(
                                modifier = Modifier.fillMaxWidth(),
                                contentAlignment = Alignment.Center
                            ) {
                                CircularProgressIndicator()
                            }
                        }

                        ticketDetailsError != null -> {
                            Text(
                                text = ticketDetailsError ?: "Unable to load ticket",
                                color = MaterialTheme.colorScheme.error,
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }

                        ticketDetails != null -> {
                            val details = ticketDetails!!
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .verticalScroll(rememberScrollState()),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text(details.subject, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                                Text("Status: ${details.status.replaceFirstChar { it.uppercase() }}", style = MaterialTheme.typography.bodySmall)
                                Text("Category: ${details.category}", style = MaterialTheme.typography.bodySmall)
                                Text("Priority: ${details.priority.replaceFirstChar { it.uppercase() }}", style = MaterialTheme.typography.bodySmall)
                                Divider()
                                Text(details.message, style = MaterialTheme.typography.bodyMedium)

                                if (details.responses.isNotEmpty()) {
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text("Responses", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                                    details.responses.forEach { response ->
                                        Card(
                                            colors = CardDefaults.cardColors(
                                                containerColor = if (response.isStaff)
                                                    MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)
                                                else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
                                            )
                                        ) {
                                            Column(modifier = Modifier.padding(10.dp)) {
                                                Text(
                                                    text = if (response.isStaff) "Support Team" else "You",
                                                    style = MaterialTheme.typography.labelMedium,
                                                    fontWeight = FontWeight.SemiBold
                                                )
                                                Spacer(modifier = Modifier.height(4.dp))
                                                Text(response.message, style = MaterialTheme.typography.bodySmall)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                confirmButton = {
                    TextButton(
                        onClick = {
                            showTicketDetailsDialog = false
                            viewModel.clearTicketDetails()
                        }
                    ) {
                        Text("Close")
                    }
                }
            )
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
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.weight(1f)
                )
                Icon(
                    imageVector = if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = if (expanded) "Collapse" else "Expand"
                )
            }
            
            if (expanded) {
                Spacer(modifier = Modifier.height(8.dp))
                Divider()
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
