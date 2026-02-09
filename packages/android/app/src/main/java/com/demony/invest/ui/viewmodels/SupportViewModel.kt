package com.demony.invest.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
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
    
    // Local list of submitted tickets (persisted in memory for session)
    private val _myTickets = MutableStateFlow<List<SupportTicket>>(emptyList())
    val myTickets: StateFlow<List<SupportTicket>> = _myTickets.asStateFlow()

    fun submitTicket(
        subject: String,
        message: String,
        category: String,
        onSuccess: () -> Unit = {}
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null

            val ticket = SupportTicket(
                subject = subject,
                message = message,
                category = category
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
