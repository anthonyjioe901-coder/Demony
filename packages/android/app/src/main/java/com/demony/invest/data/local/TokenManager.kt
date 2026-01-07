package com.demony.invest.data.local

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.demony.invest.data.models.User
import com.google.gson.Gson
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Token Manager for secure JWT token storage
 * 
 * Uses EncryptedSharedPreferences for secure storage of:
 * - JWT authentication token
 * - User data
 * - Biometric preferences
 */
@Singleton
class TokenManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val securePrefs = EncryptedSharedPreferences.create(
        context,
        "demony_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    private val gson = Gson()

    companion object {
        private const val KEY_TOKEN = "jwt_token"
        private const val KEY_USER = "user_data"
        private const val KEY_BIOMETRIC_ENABLED = "biometric_enabled"
        private const val KEY_DARK_MODE = "dark_mode"
        private const val KEY_NOTIFICATIONS_ENABLED = "notifications_enabled"
    }

    // Token Management
    fun saveToken(token: String) {
        securePrefs.edit().putString(KEY_TOKEN, token).apply()
    }

    fun getToken(): String? {
        return securePrefs.getString(KEY_TOKEN, null)
    }

    fun clearToken() {
        securePrefs.edit().remove(KEY_TOKEN).apply()
    }

    // User Management
    fun saveUser(user: User) {
        val userJson = gson.toJson(user)
        securePrefs.edit().putString(KEY_USER, userJson).apply()
    }

    fun getUser(): User? {
        val userJson = securePrefs.getString(KEY_USER, null) ?: return null
        return try {
            gson.fromJson(userJson, User::class.java)
        } catch (e: Exception) {
            null
        }
    }

    fun clearUser() {
        securePrefs.edit().remove(KEY_USER).apply()
    }

    // Biometric Settings
    fun setBiometricEnabled(enabled: Boolean) {
        securePrefs.edit().putBoolean(KEY_BIOMETRIC_ENABLED, enabled).apply()
    }

    fun isBiometricEnabled(): Boolean {
        return securePrefs.getBoolean(KEY_BIOMETRIC_ENABLED, false)
    }

    // Theme Settings
    fun setDarkMode(enabled: Boolean) {
        securePrefs.edit().putBoolean(KEY_DARK_MODE, enabled).apply()
    }

    fun isDarkMode(): Boolean {
        return securePrefs.getBoolean(KEY_DARK_MODE, false)
    }

    // Notification Settings
    fun setNotificationsEnabled(enabled: Boolean) {
        securePrefs.edit().putBoolean(KEY_NOTIFICATIONS_ENABLED, enabled).apply()
    }

    fun areNotificationsEnabled(): Boolean {
        return securePrefs.getBoolean(KEY_NOTIFICATIONS_ENABLED, true)
    }

    // Clear all data (logout)
    fun clearAll() {
        securePrefs.edit().clear().apply()
    }

    // Check if user is logged in
    fun isLoggedIn(): Boolean {
        return getToken() != null && getUser() != null
    }
}
