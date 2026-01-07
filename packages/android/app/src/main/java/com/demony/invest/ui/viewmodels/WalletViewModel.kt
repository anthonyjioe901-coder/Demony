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
 * Wallet ViewModel
 * 
 * Handles wallet balance and transactions
 */
@HiltViewModel
class WalletViewModel @Inject constructor(
    private val repository: DemonyRepository
) : ViewModel() {

    private val _walletBalance = MutableStateFlow<WalletBalance?>(null)
    val walletBalance: StateFlow<WalletBalance?> = _walletBalance.asStateFlow()

    private val _transactions = MutableStateFlow<List<Transaction>>(emptyList())
    val transactions: StateFlow<List<Transaction>> = _transactions.asStateFlow()

    private val _banks = MutableStateFlow<List<Bank>>(emptyList())
    val banks: StateFlow<List<Bank>> = _banks.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _depositUrl = MutableStateFlow<String?>(null)
    val depositUrl: StateFlow<String?> = _depositUrl.asStateFlow()

    private val _successMessage = MutableStateFlow<String?>(null)
    val successMessage: StateFlow<String?> = _successMessage.asStateFlow()

    init {
        loadWalletData()
    }

    fun loadWalletData() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null

            // Load balance
            repository.getWalletBalance()
                .onSuccess { balance ->
                    _walletBalance.value = balance
                }
                .onFailure { exception ->
                    _error.value = exception.message
                }

            // Load transactions
            repository.getTransactions()
                .onSuccess { response ->
                    _transactions.value = response.transactions
                }

            _isLoading.value = false
        }
    }

    fun loadBanks() {
        viewModelScope.launch {
            repository.getBanks()
                .onSuccess { response ->
                    _banks.value = response.banks
                }
        }
    }

    fun initializeDeposit(amount: Double) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null

            repository.initializeDeposit(amount)
                .onSuccess { response ->
                    _depositUrl.value = response.authorizationUrl
                }
                .onFailure { exception ->
                    _error.value = exception.message ?: "Failed to initialize deposit"
                }

            _isLoading.value = false
        }
    }

    fun verifyDeposit(reference: String) {
        viewModelScope.launch {
            _isLoading.value = true
            
            repository.verifyDeposit(reference)
                .onSuccess {
                    _successMessage.value = "Deposit successful!"
                    loadWalletData()
                }
                .onFailure { exception ->
                    _error.value = exception.message ?: "Deposit verification failed"
                }

            _isLoading.value = false
        }
    }

    fun requestWithdrawal(
        amount: Double,
        bankCode: String,
        accountNumber: String,
        accountName: String
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null

            repository.requestWithdrawal(
                WithdrawRequest(
                    amount = amount,
                    bankCode = bankCode,
                    accountNumber = accountNumber,
                    accountName = accountName
                )
            )
                .onSuccess {
                    _successMessage.value = "Withdrawal request submitted successfully!"
                    loadWalletData()
                }
                .onFailure { exception ->
                    _error.value = exception.message ?: "Withdrawal request failed"
                }

            _isLoading.value = false
        }
    }

    fun verifyBankAccount(accountNumber: String, bankCode: String, onResult: (String?) -> Unit) {
        viewModelScope.launch {
            repository.verifyBankAccount(accountNumber, bankCode)
                .onSuccess { result ->
                    val accountName = result["account_name"] as? String
                    onResult(accountName)
                }
                .onFailure {
                    onResult(null)
                }
        }
    }

    fun clearDepositUrl() {
        _depositUrl.value = null
    }

    fun clearMessages() {
        _error.value = null
        _successMessage.value = null
    }

    fun refresh() {
        loadWalletData()
    }
}
