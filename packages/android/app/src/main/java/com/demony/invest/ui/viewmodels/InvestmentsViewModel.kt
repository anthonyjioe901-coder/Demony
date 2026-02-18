package com.demony.invest.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.demony.invest.data.models.*
import com.demony.invest.data.repository.DemonyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Investments ViewModel
 * 
 * Handles user investments
 */
@HiltViewModel
class InvestmentsViewModel @Inject constructor(
    private val repository: DemonyRepository
) : ViewModel() {

    private val _investments = MutableStateFlow<List<Investment>>(emptyList())
    val investments: StateFlow<List<Investment>> = _investments.asStateFlow()

    private val _summary = MutableStateFlow<InvestmentSummary?>(null)
    val summary: StateFlow<InvestmentSummary?> = _summary.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _investSuccess = MutableStateFlow(false)
    val investSuccess: StateFlow<Boolean> = _investSuccess.asStateFlow()

    init {
        loadInvestments()
    }

    fun loadInvestments() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null

            repository.getMyInvestments()
                .onSuccess { investments ->
                    _investments.value = investments
                    // Calculate summary from the investments list
                    val totalInvested = investments.sumOf { it.amount }
                    val totalEarnings = investments.sumOf { it.earnings }
                    val activeCount = investments.count { it.status == "active" }
                    _summary.value = InvestmentSummary(
                        totalInvested = totalInvested,
                        totalEarnings = totalEarnings,
                        activeInvestments = activeCount
                    )
                }
                .onFailure { exception ->
                    _error.value = exception.message ?: "Failed to load investments"
                }

            _isLoading.value = false
        }
    }

    fun invest(
        projectId: String,
        amount: Double,
        termsAccepted: Boolean,
        riskAcknowledged: Boolean,
        lossAcknowledged: Boolean,
        lockInAcknowledged: Boolean
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null

            repository.invest(
                InvestRequest(
                    projectId = projectId,
                    amount = amount,
                    termsAccepted = termsAccepted,
                    riskAcknowledged = riskAcknowledged,
                    lossAcknowledged = lossAcknowledged,
                    lockInAcknowledged = lockInAcknowledged
                )
            )
                .onSuccess {
                    _investSuccess.value = true
                    loadInvestments()
                }
                .onFailure { exception ->
                    _error.value = exception.message ?: "Investment failed"
                }

            _isLoading.value = false
        }
    }

    fun clearInvestSuccess() {
        _investSuccess.value = false
    }

    fun clearError() {
        _error.value = null
    }

    fun refresh() {
        loadInvestments()
    }
}
