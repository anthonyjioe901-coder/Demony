package com.demony.invest.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.demony.invest.data.models.SupportTicketDetails
import com.demony.invest.data.models.SupportTicket
import com.demony.invest.data.models.TicketResponse
import com.demony.invest.data.repository.DemonyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Support ViewModel
 * 
 * Handles support ticket operations
 */
@HiltViewModel
class SupportViewModel @Inject constructor(
    private val repository: DemonyRepository
) : ViewModel() {

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _successMessage = MutableStateFlow<String?>(null)
    val successMessage: StateFlow<String?> = _successMessage.asStateFlow()

    private val _ticketSubmitted = MutableStateFlow(false)
    val ticketSubmitted: StateFlow<Boolean> = _ticketSubmitted.asStateFlow()

    private val _currentUserEmail = MutableStateFlow("")
    val currentUserEmail: StateFlow<String> = _currentUserEmail.asStateFlow()
    
    // Local list of submitted tickets (persisted in memory for session)
    private val _myTickets = MutableStateFlow<List<SupportTicket>>(emptyList())
    val myTickets: StateFlow<List<SupportTicket>> = _myTickets.asStateFlow()

    private val _systemStatus = MutableStateFlow<String?>(null)
    val systemStatus: StateFlow<String?> = _systemStatus.asStateFlow()

    private val _isStatusLoading = MutableStateFlow(false)
    val isStatusLoading: StateFlow<Boolean> = _isStatusLoading.asStateFlow()

    private val _ticketDetails = MutableStateFlow<SupportTicketDetails?>(null)
    val ticketDetails: StateFlow<SupportTicketDetails?> = _ticketDetails.asStateFlow()

    private val _isTicketDetailsLoading = MutableStateFlow(false)
    val isTicketDetailsLoading: StateFlow<Boolean> = _isTicketDetailsLoading.asStateFlow()

    private val _ticketDetailsError = MutableStateFlow<String?>(null)
    val ticketDetailsError: StateFlow<String?> = _ticketDetailsError.asStateFlow()

    init {
        _currentUserEmail.value = repository.getCurrentUser()?.email ?: ""
        loadSystemStatus()
    }

    fun submitTicket(
        subject: String,
        message: String,
        category: String,
        priority: String,
        email: String,
        onSuccess: () -> Unit = {}
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null

            val ticket = SupportTicket(
                subject = subject,
                message = message,
                category = category,
                priority = priority,
                email = email.trim()
            )

            repository.submitSupportTicket(ticket)
                .onSuccess { response ->
                    _successMessage.value = "Ticket submitted successfully! Reference: ${response.ticketId}"
                    _ticketSubmitted.value = true
                    // Add to local tickets list
                    val submittedTicket = SupportTicket(
                        id = response.ticketId,
                        subject = subject,
                        message = message,
                        category = category,
                        status = "open",
                        priority = priority,
                        email = email,
                        createdAt = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.getDefault()).format(java.util.Date())
                    )
                    _myTickets.value = listOf(submittedTicket) + _myTickets.value
                    onSuccess()
                }
                .onFailure { exception ->
                    _error.value = exception.message ?: "Failed to submit ticket"
                }

            _isLoading.value = false
        }
    }

    fun loadMyTickets() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null

            repository.getMySupportTickets()
                .onSuccess { response ->
                    _myTickets.value = response.tickets
                }
                .onFailure { exception ->
                    _error.value = exception.message ?: "Failed to load support tickets"
                }

            _isLoading.value = false
        }
    }

    fun loadSystemStatus() {
        viewModelScope.launch {
            _isStatusLoading.value = true

            repository.getSystemStatus()
                .onSuccess { response ->
                    _systemStatus.value = response["status"]?.toString() ?: "unknown"
                }
                .onFailure {
                    _systemStatus.value = null
                }

            _isStatusLoading.value = false
        }
    }

    fun loadTicketDetails(ticketId: String) {
        viewModelScope.launch {
            _isTicketDetailsLoading.value = true
            _ticketDetailsError.value = null
            _ticketDetails.value = null

            repository.getTicketDetails(ticketId)
                .onSuccess { details ->
                    _ticketDetails.value = details
                }
                .onFailure { exception ->
                    _ticketDetailsError.value = exception.message ?: "Failed to load ticket details"
                }

            _isTicketDetailsLoading.value = false
        }
    }

    fun clearTicketDetails() {
        _ticketDetails.value = null
        _ticketDetailsError.value = null
    }

    fun clearMessages() {
        _error.value = null
        _successMessage.value = null
    }
    
    fun clearError() {
        _error.value = null
    }
    
    fun clearSuccessMessage() {
        _successMessage.value = null
    }

    fun clearTicketSubmitted() {
        _ticketSubmitted.value = false
    }
}
