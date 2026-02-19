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

    fun login(identifier: String, password: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null

            repository.login(identifier, password)
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
                .onFailure { exception ->
                    // CRIT-4: Fixed - check ApiException (from safeApiCall) instead of retrofit2.HttpException
                    when (exception) {
                        is com.demony.invest.data.api.ApiException -> {
                            if (exception.statusCode == 401 || exception.statusCode == 403) {
                                logout()
                            }
                        }
                        // Network errors, timeouts, etc. - keep user logged in
                        is java.io.IOException -> { /* offline, don't logout */ }
                        else -> { /* unknown error, don't logout */ }
                    }
                }
        }
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

    fun forgotPassword(email: String, onResult: (success: Boolean, error: String?) -> Unit) {
        viewModelScope.launch {
            repository.forgotPassword(email)
                .onSuccess {
                    onResult(true, null)
                }
                .onFailure { exception ->
                    onResult(false, exception.message ?: "Failed to send reset email")
                }
        }
    }
    
    fun submitKyc(
        idDocumentUrl: String, 
        selfieUrl: String,
        documentType: String = "ghana_card",
        onResult: (success: Boolean, error: String?) -> Unit
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            repository.submitKyc(idDocumentUrl, selfieUrl, documentType)
                .onSuccess {
                    // Refresh user to get updated KYC status
                    refreshUser()
                    onResult(true, null)
                }
                .onFailure { exception ->
                    onResult(false, exception.message ?: "Failed to submit KYC documents")
                }
            _isLoading.value = false
        }
    }
    
    fun uploadAndSubmitKyc(
        idDocumentBase64: String,
        selfieBase64: String,
        documentType: String = "ghana_card",
        onResult: (success: Boolean, error: String?) -> Unit
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            
            // Upload ID document
            val idUploadResult = repository.uploadImage(idDocumentBase64, "kyc_id_document.jpg")
            val idUrl = idUploadResult.getOrNull()?.get("url")
            
            if (idUrl == null) {
                onResult(false, "Failed to upload ID document")
                _isLoading.value = false
                return@launch
            }
            
            // Upload selfie
            val selfieUploadResult = repository.uploadImage(selfieBase64, "kyc_selfie.jpg")
            val selfieUrl = selfieUploadResult.getOrNull()?.get("url")
            
            if (selfieUrl == null) {
                onResult(false, "Failed to upload selfie")
                _isLoading.value = false
                return@launch
            }
            
            // Submit KYC
            repository.submitKyc(idUrl, selfieUrl, documentType)
                .onSuccess {
                    refreshUser()
                    onResult(true, null)
                }
                .onFailure { exception ->
                    onResult(false, exception.message ?: "Failed to submit KYC documents")
                }
            
            _isLoading.value = false
        }
    }
    
    fun updatePhone(phone: String, onResult: (success: Boolean, error: String?) -> Unit) {
        viewModelScope.launch {
            repository.updatePhone(phone)
                .onSuccess {
                    onResult(true, null)
                }
                .onFailure { exception ->
                    onResult(false, exception.message ?: "Failed to update phone number")
                }
        }
    }

    fun updateProfile(
        name: String,
        phone: String? = null,
        businessName: String? = null,
        onResult: (success: Boolean, error: String?) -> Unit
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            repository.updateProfile(name, phone, businessName)
                .onSuccess { user ->
                    _currentUser.value = user
                    onResult(true, null)
                }
                .onFailure { exception ->
                    onResult(false, exception.message ?: "Failed to update profile")
                }
            _isLoading.value = false
        }
    }

    fun deleteAccount(onResult: (success: Boolean, error: String?) -> Unit) {
        viewModelScope.launch {
            _isLoading.value = true
            repository.deleteAccount()
                .onSuccess {
                    _currentUser.value = null
                    _isAuthenticated.value = false
                    onResult(true, null)
                }
                .onFailure { exception ->
                    onResult(false, exception.message ?: "Failed to delete account")
                }
            _isLoading.value = false
        }
    }
}
