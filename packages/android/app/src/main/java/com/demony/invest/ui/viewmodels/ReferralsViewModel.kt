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
 * Referrals ViewModel
 * 
 * Handles referral data and operations
 */
@HiltViewModel
class ReferralsViewModel @Inject constructor(
    private val repository: DemonyRepository
) : ViewModel() {

    private val _referralCode = MutableStateFlow<ReferralCode?>(null)
    val referralCode: StateFlow<ReferralCode?> = _referralCode.asStateFlow()

    private val _referralHistory = MutableStateFlow<List<ReferralHistory>>(emptyList())
    val referralHistory: StateFlow<List<ReferralHistory>> = _referralHistory.asStateFlow()

    private val _leaderboard = MutableStateFlow<List<Map<String, Any>>>(emptyList())
    val leaderboard: StateFlow<List<Map<String, Any>>> = _leaderboard.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init {
        loadReferralData()
    }

    fun loadReferralData() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null

            // Load referral code
            repository.getReferralCode()
                .onSuccess { code ->
                    _referralCode.value = code
                }
                .onFailure { exception ->
                    _error.value = exception.message
                }

            // Load referral history
            repository.getReferralHistory()
                .onSuccess { response ->
                    _referralHistory.value = response.referrals
                }

            // Load leaderboard
            repository.getReferralLeaderboard()
                .onSuccess { leaders ->
                    _leaderboard.value = leaders
                }

            _isLoading.value = false
        }
    }

    fun clearError() {
        _error.value = null
    }

    fun refresh() {
        loadReferralData()
    }
}
