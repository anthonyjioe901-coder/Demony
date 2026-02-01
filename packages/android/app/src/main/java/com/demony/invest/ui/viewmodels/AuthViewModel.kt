package com.demony.invest.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.demony.invest.data.models.User
import com.demony.invest.data.repository.DemonyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Authentication ViewModel
 * 
 * Handles user authentication state and operations
 */
@HiltViewModel
class AuthViewModel @Inject constructor(
    private val repository: DemonyRepository
) : ViewModel() {

    private val _isAuthenticated = MutableStateFlow(repository.isLoggedIn())
    val isAuthenticated: StateFlow<Boolean> = _isAuthenticated.asStateFlow()

    private val _currentUser = MutableStateFlow(repository.getCurrentUser())
    val currentUser: StateFlow<User?> = _currentUser.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _isDarkMode = MutableStateFlow(repository.isDarkMode())
    val isDarkMode: StateFlow<Boolean> = _isDarkMode.asStateFlow()

    init {
        // Verify token is still valid on app start
        if (repository.isLoggedIn()) {
            refreshUser()
        }
    }

    fun login(email: String, password: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null

            repository.login(email, password)
                .onSuccess { response ->
                    _currentUser.value = response.user
                    _isAuthenticated.value = true
                    onSuccess()
                }
                .onFailure { exception ->
                    _error.value = exception.message ?: "Login failed"
                }

            _isLoading.value = false
        }
    }

    fun signup(
        name: String,
        email: String,
        password: String,
        role: String = "investor",
        phone: String? = null,
        businessName: String? = null,
        businessRegistration: String? = null,
        referralCode: String? = null,
        onSuccess: () -> Unit
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null

            repository.signup(
                name = name,
                email = email,
                password = password,
                role = role,
                phone = phone,
                businessName = businessName,
                businessRegistration = businessRegistration,
                referralCode = referralCode
            )
                .onSuccess { response ->
                    _currentUser.value = response.user
                    _isAuthenticated.value = true
                    onSuccess()
                }
                .onFailure { exception ->
                    _error.value = exception.message ?: "Signup failed"
                }

            _isLoading.value = false
        }
    }

    fun logout() {
        repository.logout()
        _currentUser.value = null
        _isAuthenticated.value = false
    }

    fun refreshUser() {
        viewModelScope.launch {
            repository.getMe()
                .onSuccess { user ->
                    _currentUser.value = user
                }
                .onFailure {
                    // Token might be invalid, logout
                    logout()
                }
        }
    }

    private val _kycSubmitSuccess = MutableStateFlow(false)
    val kycSubmitSuccess: StateFlow<Boolean> = _kycSubmitSuccess.asStateFlow()

    fun submitKyc(
        idDocumentBase64: String, 
        selfieBase64: String, 
        idType: String = "Ghana Card",
        idNumber: String = "",
        onResult: (Boolean, String?) -> Unit
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null

            // First upload the ID document
            val idUploadResult = repository.uploadImage(idDocumentBase64, "kyc_id_document.jpg")
            var idDocumentUrl: String? = null
            
            idUploadResult.onSuccess { result ->
                idDocumentUrl = result["url"]
            }.onFailure { exception ->
                _error.value = "Failed to upload ID document: ${exception.message}"
                _isLoading.value = false
                onResult(false, "Failed to upload ID document")
                return@launch
            }

            // Then upload the selfie
            val selfieUploadResult = repository.uploadImage(selfieBase64, "kyc_selfie.jpg")
            var selfieUrl: String? = null
            
            selfieUploadResult.onSuccess { result ->
                selfieUrl = result["url"]
            }.onFailure { exception ->
                _error.value = "Failed to upload selfie: ${exception.message}"
                _isLoading.value = false
                onResult(false, "Failed to upload selfie")
                return@launch
            }

            // Now submit KYC with the uploaded URLs
            if (idDocumentUrl != null && selfieUrl != null) {
                // Call KYC submit endpoint
                val kycData = mapOf<String, Any>(
                    "idType" to idType,
                    "idNumber" to idNumber,
                    "idDocument" to (idDocumentUrl ?: ""),
                    "selfie" to (selfieUrl ?: "")
                )
                
                repository.submitKyc(kycData)
                    .onSuccess {
                        _kycSubmitSuccess.value = true
                        refreshUser() // Refresh user to get updated KYC status
                        onResult(true, null)
                    }
                    .onFailure { exception ->
                        _error.value = "Failed to submit KYC: ${exception.message}"
                        onResult(false, exception.message ?: "Failed to submit KYC")
                    }
            }

            _isLoading.value = false
        }
    }

    fun clearKycSubmitSuccess() {
        _kycSubmitSuccess.value = false
    }

    private val _forgotPasswordSuccess = MutableStateFlow(false)
    val forgotPasswordSuccess: StateFlow<Boolean> = _forgotPasswordSuccess.asStateFlow()

    fun forgotPassword(email: String, onResult: (Boolean, String?) -> Unit) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null

            repository.forgotPassword(email)
                .onSuccess {
                    _forgotPasswordSuccess.value = true
                    onResult(true, null)
                }
                .onFailure { exception ->
                    _error.value = exception.message
                    onResult(false, exception.message ?: "Failed to send reset email")
                }

            _isLoading.value = false
        }
    }

    fun clearForgotPasswordSuccess() {
        _forgotPasswordSuccess.value = false
    }

    fun clearError() {
        _error.value = null
    }

    fun setDarkMode(enabled: Boolean) {
        repository.setDarkMode(enabled)
        _isDarkMode.value = enabled
    }

    fun toggleDarkMode() {
        setDarkMode(!_isDarkMode.value)
    }
}
