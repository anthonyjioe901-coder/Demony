package com.demony.invest.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.demony.invest.data.models.SupportTicket
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
 * Handles support tickets and system status
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

    private val _systemStatus = MutableStateFlow<Map<String, Any>?>(null)
    val systemStatus: StateFlow<Map<String, Any>?> = _systemStatus.asStateFlow()

    init {
        loadSystemStatus()
    }

    fun submitTicket(subject: String, category: String, message: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null

            repository.submitSupportTicket(
                SupportTicket(
                    subject = subject,
                    category = category,
                    message = message
                )
            )
                .onSuccess { response ->
                    _successMessage.value = "Ticket submitted successfully! We'll get back to you soon."
                }
                .onFailure { exception ->
                    _error.value = exception.message ?: "Failed to submit ticket"
                }

            _isLoading.value = false
        }
    }

    fun loadSystemStatus() {
        viewModelScope.launch {
            repository.getSystemStatus()
                .onSuccess { status ->
                    _systemStatus.value = status
                }
        }
    }

    fun clearMessages() {
        _error.value = null
        _successMessage.value = null
    }
}
