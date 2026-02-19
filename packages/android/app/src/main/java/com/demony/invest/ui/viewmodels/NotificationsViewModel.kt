package com.demony.invest.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.demony.invest.data.models.Notification
import com.demony.invest.data.repository.DemonyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class NotificationsViewModel @Inject constructor(
    private val repository: DemonyRepository
) : ViewModel() {

    private val _notifications = MutableStateFlow<List<Notification>>(emptyList())
    val notifications: StateFlow<List<Notification>> = _notifications.asStateFlow()

    private val _unreadCount = MutableStateFlow(0)
    val unreadCount: StateFlow<Int> = _unreadCount.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private var isPolling = false
    private var pollingJob: kotlinx.coroutines.Job? = null

    init {
        loadNotifications()
        startPolling()
    }

    fun loadNotifications() {
        viewModelScope.launch {
            _isLoading.value = true
            repository.getNotifications(limit = 30)
                .onSuccess { response ->
                    _notifications.value = response.notifications
                    _unreadCount.value = response.unreadCount
                }
            _isLoading.value = false
        }
    }

    fun markAsRead(notificationId: String) {
        viewModelScope.launch {
            repository.markNotificationRead(notificationId)
                .onSuccess {
                    _notifications.value = _notifications.value.map { notif ->
                        if (notif.id == notificationId) notif.copy(read = true) else notif
                    }
                    _unreadCount.value = maxOf(0, _unreadCount.value - 1)
                }
        }
    }

    fun markAllAsRead() {
        viewModelScope.launch {
            repository.markAllNotificationsRead()
                .onSuccess {
                    _notifications.value = _notifications.value.map { it.copy(read = true) }
                    _unreadCount.value = 0
                }
        }
    }

    fun refresh() {
        loadNotifications()
    }

    fun startPolling() {
        if (isPolling) return
        isPolling = true
        pollingJob = viewModelScope.launch {
            while (isPolling) {
                delay(30_000) // Poll every 30 seconds
                repository.getUnreadCount()
                    .onSuccess { response ->
                        val newCount = response.unreadCount
                        if (newCount != _unreadCount.value) {
                            _unreadCount.value = newCount
                            loadNotifications()
                        }
                    }
            }
        }
    }

    fun stopPolling() {
        isPolling = false
        pollingJob?.cancel()
        pollingJob = null
    }

    override fun onCleared() {
        super.onCleared()
        stopPolling()
    }
}
