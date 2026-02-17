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
 * Portfolio ViewModel
 * 
 * Handles portfolio data
 */
@HiltViewModel
class PortfolioViewModel @Inject constructor(
    private val repository: DemonyRepository
) : ViewModel() {

    private val _portfolio = MutableStateFlow<Portfolio?>(null)
    val portfolio: StateFlow<Portfolio?> = _portfolio.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _referralCode = MutableStateFlow<ReferralCode?>(null)
    val referralCode: StateFlow<ReferralCode?> = _referralCode.asStateFlow()

    init {
        loadPortfolio()
    }

    fun loadPortfolio() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null

            repository.getPortfolio()
                .onSuccess { portfolio ->
                    _portfolio.value = portfolio
                }
                .onFailure { exception ->
                    _error.value = exception.message ?: "Failed to load portfolio"
                }

            repository.getReferralCode()
                .onSuccess { code ->
                    _referralCode.value = code
                }

            _isLoading.value = false
        }
    }

    fun clearError() {
        _error.value = null
    }

    fun refresh() {
        loadPortfolio()
    }
}
