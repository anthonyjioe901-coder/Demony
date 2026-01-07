package com.demony.invest.ui.screens.support

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
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.demony.invest.ui.components.BottomNavigationBar

data class SupportTicket(
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
    navController: NavController
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    var showNewTicketDialog by remember { mutableStateOf(false) }
    var ticketSubject by remember { mutableStateOf("") }
    var ticketMessage by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("General") }
    
    // Sample data - in real app, this would come from ViewModel
    val tickets = remember {
        listOf<SupportTicket>()
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
                                    onClick = { /* Open email */ }
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
                                    onClick = { /* Open phone */ }
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
                                    onClick = { /* Open chat */ }
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
                    // My Tickets
                    if (tickets.isEmpty()) {
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
                            items(tickets) { ticket ->
                                TicketItem(ticket = ticket)
                            }
                        }
                    }
                }
            }
        }
        
        // New Ticket Dialog
        if (showNewTicketDialog) {
            AlertDialog(
                onDismissRequest = { showNewTicketDialog = false },
                title = { Text("Create Support Ticket") },
                text = {
                    Column(
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Category
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
                        
                        OutlinedTextField(
                            value = ticketSubject,
                            onValueChange = { ticketSubject = it },
                            label = { Text("Subject") },
                            modifier = Modifier.fillMaxWidth(),
                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next)
                        )
                        
                        OutlinedTextField(
                            value = ticketMessage,
                            onValueChange = { ticketMessage = it },
                            label = { Text("Message") },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(150.dp),
                            maxLines = 5
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            // Submit ticket
                            showNewTicketDialog = false
                            ticketSubject = ""
                            ticketMessage = ""
                        },
                        enabled = ticketSubject.isNotBlank() && ticketMessage.isNotBlank()
                    ) {
                        Text("Submit")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showNewTicketDialog = false }) {
                        Text("Cancel")
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

@Composable
private fun TicketItem(ticket: SupportTicket) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = ticket.subject,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = ticket.category,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                Surface(
                    color = when (ticket.status) {
                        "open" -> MaterialTheme.colorScheme.secondary.copy(alpha = 0.1f)
                        "pending" -> MaterialTheme.colorScheme.tertiary.copy(alpha = 0.1f)
                        "resolved" -> MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
                        else -> MaterialTheme.colorScheme.surfaceVariant
                    },
                    shape = MaterialTheme.shapes.small
                ) {
                    Text(
                        text = ticket.status.replaceFirstChar { it.uppercase() },
                        style = MaterialTheme.typography.labelSmall,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = ticket.message,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 2
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "Created: ${ticket.createdAt}",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
            )
        }
    }
}
