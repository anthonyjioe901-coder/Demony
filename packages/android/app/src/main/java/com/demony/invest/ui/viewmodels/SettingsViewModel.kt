package com.demony.invest.ui.viewmodels

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.demony.invest.data.repository.DemonyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

@HiltViewModel
class SettingsViewModel @Inject constructor(
    @ApplicationContext private val context: Context,
    private val repository: DemonyRepository
) : ViewModel() {

    companion object {
        private val PUSH_NOTIFICATIONS = booleanPreferencesKey("push_notifications")
        private val EMAIL_NOTIFICATIONS = booleanPreferencesKey("email_notifications")
        private val BIOMETRIC_LOGIN = booleanPreferencesKey("biometric_login")
    }

    private val _pushNotifications = MutableStateFlow(true)
    val pushNotifications: StateFlow<Boolean> = _pushNotifications.asStateFlow()

    private val _emailNotifications = MutableStateFlow(true)
    val emailNotifications: StateFlow<Boolean> = _emailNotifications.asStateFlow()

    private val _biometricLogin = MutableStateFlow(false)
    val biometricLogin: StateFlow<Boolean> = _biometricLogin.asStateFlow()

    private val _darkMode = MutableStateFlow(false)
    val darkMode: StateFlow<Boolean> = _darkMode.asStateFlow()

    private val _showPasswordDialog = MutableStateFlow(false)
    val showPasswordDialog: StateFlow<Boolean> = _showPasswordDialog.asStateFlow()

    private val _showToast = MutableStateFlow<String?>(null)
    val showToast: StateFlow<String?> = _showToast.asStateFlow()

    init {
        loadSettings()
    }

    private fun loadSettings() {
        viewModelScope.launch {
            // Load dark mode from repository (same source as AuthViewModel)
            _darkMode.value = repository.isDarkMode()
            
            context.dataStore.data.collect { preferences ->
                _pushNotifications.value = preferences[PUSH_NOTIFICATIONS] ?: true
                _emailNotifications.value = preferences[EMAIL_NOTIFICATIONS] ?: true
                _biometricLogin.value = preferences[BIOMETRIC_LOGIN] ?: false
            }
        }
    }

    fun setPushNotifications(enabled: Boolean) {
        viewModelScope.launch {
            context.dataStore.edit { preferences ->
                preferences[PUSH_NOTIFICATIONS] = enabled
            }
            _pushNotifications.value = enabled
            syncNotificationPreferences()
            _showToast.value = if (enabled) "Push notifications enabled" else "Push notifications disabled"
        }
    }

    fun setEmailNotifications(enabled: Boolean) {
        viewModelScope.launch {
            context.dataStore.edit { preferences ->
                preferences[EMAIL_NOTIFICATIONS] = enabled
            }
            _emailNotifications.value = enabled
            syncNotificationPreferences()
            _showToast.value = if (enabled) "Email notifications enabled" else "Email notifications disabled"
        }
    }

    fun setBiometricLogin(enabled: Boolean) {
        viewModelScope.launch {
            context.dataStore.edit { preferences ->
                preferences[BIOMETRIC_LOGIN] = enabled
            }
            _biometricLogin.value = enabled
            _showToast.value = if (enabled) "Biometric login enabled" else "Biometric login disabled"
        }
    }

    // Callback to notify AuthViewModel of dark mode change
    var onDarkModeChanged: ((Boolean) -> Unit)? = null

    fun setDarkMode(enabled: Boolean) {
        viewModelScope.launch {
            // Use repository to save dark mode (same as AuthViewModel)
            repository.setDarkMode(enabled)
            _darkMode.value = enabled
            // Notify parent to update theme
            onDarkModeChanged?.invoke(enabled)
            _showToast.value = if (enabled) "Dark mode enabled" else "Dark mode disabled"
        }
    }

    fun showChangePasswordDialog() {
        _showPasswordDialog.value = true
    }

    fun hideChangePasswordDialog() {
        _showPasswordDialog.value = false
    }

    fun changePassword(currentPassword: String, newPassword: String) {
        viewModelScope.launch {
            _showPasswordDialog.value = false
            repository.changePassword(currentPassword, newPassword)
                .onSuccess {
                    _showToast.value = "Password changed successfully!"
                }
                .onFailure { e ->
                    _showToast.value = e.message ?: "Failed to change password"
                }
        }
    }

    fun clearToast() {
        _showToast.value = null
    }

    private fun syncNotificationPreferences() {
        viewModelScope.launch {
            repository.updateNotificationPreferences(
                emailNotifications = _emailNotifications.value,
                investmentUpdates = _pushNotifications.value,
                referralNotifications = _pushNotifications.value,
                marketingNotifications = false
            )
        }
    }
}
