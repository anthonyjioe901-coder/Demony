package com.demony.invest.data.repository

import com.demony.invest.data.api.DemonyApiService
import com.demony.invest.data.local.TokenManager
import com.demony.invest.data.models.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.Response
import java.net.SocketTimeoutException
import java.net.UnknownHostException
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Main repository for Demony API operations
 * 
 * Handles all data operations with proper error handling and
 * abstracts the API layer from ViewModels
 */
@Singleton
class DemonyRepository @Inject constructor(
    private val apiService: DemonyApiService,
    private val tokenManager: TokenManager
) {

    // ==================== AUTHENTICATION ====================

    suspend fun login(identifier: String, password: String): Result<AuthResponse> = safeApiCall {
        val cleaned = identifier.trim()
        val isEmail = cleaned.contains("@")
        val phoneClean = cleaned.replace("[\\s\\-]".toRegex(), "")

        apiService.login(
            LoginRequest(
                email = if (isEmail) cleaned else null,
                phone = if (!isEmail) phoneClean else null,
                password = password
            )
        )
    }.also { result ->
        result.getOrNull()?.let { response ->
            tokenManager.saveToken(response.token)
            tokenManager.saveUser(response.user)
        }
    }

    suspend fun signup(
        name: String,
        email: String,
        password: String,
        role: String = "investor",
        phone: String? = null,
        businessName: String? = null,
        businessRegistration: String? = null,
        referralCode: String? = null
    ): Result<AuthResponse> = safeApiCall {
        apiService.signup(
            SignupRequest(
                name = name,
                email = email,
                password = password,
                role = role,
                phone = phone,
                businessName = businessName,
                businessRegistration = businessRegistration,
                referralCode = referralCode
            )
        )
    }.also { result ->
        result.getOrNull()?.let { response ->
            tokenManager.saveToken(response.token)
            tokenManager.saveUser(response.user)
        }
    }

    suspend fun getMe(): Result<User> = safeApiCall {
        apiService.getMe()
    }.also { result ->
        result.getOrNull()?.let { user ->
            tokenManager.saveUser(user)
        }
    }

    suspend fun forgotPassword(email: String): Result<MessageResponse> = safeApiCall {
        apiService.forgotPassword(mapOf("email" to email))
    }

    suspend fun changePassword(currentPassword: String, newPassword: String): Result<MessageResponse> = safeApiCall {
        apiService.changePassword(mapOf(
            "currentPassword" to currentPassword,
            "newPassword" to newPassword
        ))
    }

    suspend fun updatePhone(phone: String): Result<MessageResponse> = safeApiCall {
        apiService.updatePhone(mapOf("phone" to phone))
    }

    suspend fun updateProfile(
        name: String,
        phone: String? = null,
        businessName: String? = null
    ): Result<User> = safeApiCall {
        val payload = mutableMapOf<String, Any>(
            "name" to name
        )
        if (!phone.isNullOrBlank()) {
            payload["phone"] = phone
        }
        if (!businessName.isNullOrBlank()) {
            payload["businessName"] = businessName
        }
        apiService.updateProfile(payload)
    }.mapCatching { response ->
        response.user
    }.also { result ->
        result.getOrNull()?.let { updatedUser ->
            tokenManager.saveUser(updatedUser)
        }
    }

    suspend fun updateNotificationPreferences(
        emailNotifications: Boolean,
        investmentUpdates: Boolean,
        referralNotifications: Boolean,
        marketingNotifications: Boolean
    ): Result<MessageResponse> = safeApiCall {
        apiService.updateNotificationPreferences(
            NotificationPreferencesRequest(
                emailNotifications = emailNotifications,
                investmentUpdates = investmentUpdates,
                referralNotifications = referralNotifications,
                marketingNotifications = marketingNotifications
            )
        )
    }

    suspend fun deleteAccount(): Result<MessageResponse> = safeApiCall {
        apiService.deleteAccount()
    }.also { result ->
        if (result.isSuccess) {
            tokenManager.clearAll()
        }
    }

    fun logout() {
        tokenManager.clearAll()
    }

    fun isLoggedIn(): Boolean = tokenManager.isLoggedIn()

    fun getCurrentUser(): User? = tokenManager.getUser()

    // ==================== PROJECTS ====================

    suspend fun getProjects(
        page: Int = 1,
        limit: Int = 10,
        category: String? = null,
        sort: String? = null,
        search: String? = null
    ): Result<ProjectsResponse> = safeApiCall {
        apiService.getProjects(page, limit, category, sort, search)
    }

    suspend fun getProject(id: String): Result<Project> = safeApiCall {
        apiService.getProject(id)
    }

    suspend fun calculateReturns(
        projectId: String,
        amount: Double,
        durationMonths: Int
    ): Result<Map<String, Any>> = safeApiCall {
        apiService.calculateReturns(
            projectId,
            mapOf("amount" to amount, "durationMonths" to durationMonths)
        )
    }

    // ==================== INVESTMENTS ====================

    suspend fun invest(request: InvestRequest): Result<Investment> = safeApiCall {
        apiService.invest(request)
    }

    suspend fun getMyInvestments(): Result<List<Investment>> = safeApiCall {
        apiService.getMyInvestments()
    }

    suspend fun getProfitHistory(investmentId: String): Result<List<Map<String, Any>>> = safeApiCall {
        apiService.getProfitHistory(investmentId)
    }

    suspend fun getProjectUpdates(investmentId: String): Result<List<Map<String, Any>>> = safeApiCall {
        apiService.getProjectUpdates(investmentId)
    }

    // ==================== WALLET ====================

    suspend fun getWalletBalance(): Result<WalletBalance> = safeApiCall {
        apiService.getWalletBalance()
    }

    suspend fun getTransactions(
        page: Int = 1,
        limit: Int = 20,
        type: String? = null
    ): Result<TransactionsResponse> = safeApiCall {
        apiService.getTransactions(page, limit, type)
    }

    suspend fun initializeDeposit(amount: Double): Result<DepositResponse> = safeApiCall {
        apiService.initializeDeposit(DepositRequest(amount))
    }

    suspend fun verifyDeposit(reference: String): Result<MessageResponse> = safeApiCall {
        apiService.verifyDeposit(reference)
    }

    suspend fun getBanks(): Result<BanksResponse> = safeApiCall {
        apiService.getBanks()
    }

    suspend fun verifyBankAccount(
        accountNumber: String,
        bankCode: String
    ): Result<Map<String, Any>> = safeApiCall {
        apiService.verifyBankAccount(accountNumber, bankCode)
    }

    suspend fun requestWithdrawal(request: WithdrawRequest): Result<MessageResponse> = safeApiCall {
        apiService.requestWithdrawal(request)
    }

    suspend fun getMyWithdrawals(): Result<TransactionsResponse> = safeApiCall {
        apiService.getMyWithdrawals()
    }

    suspend fun cancelWithdrawal(id: String): Result<MessageResponse> = safeApiCall {
        apiService.cancelWithdrawal(id)
    }

    // ==================== PORTFOLIO ====================

    suspend fun getPortfolio(): Result<Portfolio> = safeApiCall {
        apiService.getPortfolio()
    }

    // ==================== REFERRALS ====================

    suspend fun getReferralCode(): Result<ReferralCode> = safeApiCall {
        apiService.getReferralCode()
    }

    suspend fun getReferralHistory(): Result<ReferralHistoryResponse> = safeApiCall {
        apiService.getReferralHistory()
    }

    suspend fun validateReferralCode(code: String): Result<Map<String, Any>> = safeApiCall {
        apiService.validateReferralCode(code)
    }

    suspend fun getReferralLeaderboard(): Result<List<Map<String, Any>>> = safeApiCall {
        apiService.getReferralLeaderboard()
    }

    // ==================== SUPPORT ====================

    suspend fun submitSupportTicket(ticket: SupportTicket): Result<TicketResponse> = safeApiCall {
        apiService.submitSupportTicket(ticket)
    }

    suspend fun getMySupportTickets(): Result<SupportTicketsResponse> = safeApiCall {
        apiService.getMySupportTickets()
    }

    suspend fun getTicketStatus(ticketId: String): Result<SupportTicket> = safeApiCall {
        apiService.getTicketStatus(ticketId)
    }

    suspend fun getTicketDetails(ticketId: String): Result<SupportTicketDetails> = safeApiCall {
        apiService.getTicketDetails(ticketId)
    }

    suspend fun getSystemStatus(): Result<Map<String, Any>> = safeApiCall {
        apiService.getSystemStatus()
    }

    // ==================== UPLOAD ====================

    suspend fun uploadImage(imageBase64: String, filename: String): Result<Map<String, String>> = safeApiCall {
        apiService.uploadImage(mapOf("image" to imageBase64, "filename" to filename))
    }

    // ==================== KYC ====================
    
    suspend fun submitKyc(idDocumentUrl: String, selfieUrl: String, documentType: String = "ghana_card"): Result<MessageResponse> = safeApiCall {
        apiService.submitKyc(mapOf(
            "idDocument" to idDocumentUrl,
            "selfie" to selfieUrl,
            "documentType" to documentType
        ))
    }

    // ==================== SETTINGS ====================

    fun isDarkMode(): Boolean = tokenManager.isDarkMode()
    
    fun setDarkMode(enabled: Boolean) {
        tokenManager.setDarkMode(enabled)
    }

    fun isBiometricEnabled(): Boolean = tokenManager.isBiometricEnabled()
    
    fun setBiometricEnabled(enabled: Boolean) {
        tokenManager.setBiometricEnabled(enabled)
    }

    fun areNotificationsEnabled(): Boolean = tokenManager.areNotificationsEnabled()
    
    fun setNotificationsEnabled(enabled: Boolean) {
        tokenManager.setNotificationsEnabled(enabled)
    }

    // ==================== NOTIFICATIONS ====================

    suspend fun getNotifications(limit: Int = 30, unread: Boolean? = null): Result<NotificationsResponse> = safeApiCall {
        apiService.getNotifications(limit, unread)
    }

    suspend fun markNotificationRead(id: String): Result<MessageResponse> = safeApiCall {
        apiService.markNotificationRead(id)
    }

    suspend fun markAllNotificationsRead(): Result<MessageResponse> = safeApiCall {
        apiService.markNotificationRead("all")
    }

    suspend fun getUnreadCount(): Result<UnreadCountResponse> = safeApiCall {
        apiService.getUnreadCount()
    }

    // ==================== HELPER FUNCTIONS ====================

    private suspend fun <T> safeApiCall(apiCall: suspend () -> Response<T>): Result<T> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiCall()
                if (response.isSuccessful) {
                    response.body()?.let {
                        Result.success(it)
                    } ?: Result.failure(Exception("Empty response body"))
                } else {
                    val errorBody = response.errorBody()?.string()
                    val errorMessage = try {
                        // Try to parse error message from JSON
                        com.google.gson.Gson().fromJson(errorBody, ApiError::class.java).error
                    } catch (e: Exception) {
                        errorBody ?: "Unknown error: ${response.code()}"
                    }
                    
                    // Handle authentication errors
                    if (response.code() == 401 || response.code() == 403) {
                        tokenManager.clearAll()
                    }
                    
                    // CRIT-3/4: Use ApiException to preserve HTTP status code so callers can react
                    Result.failure(com.demony.invest.data.api.ApiException(response.code(), errorMessage))
                }
            } catch (e: UnknownHostException) {
                Result.failure(Exception("No Internet Connection. Please check your network and try again."))
            } catch (e: SocketTimeoutException) {
                Result.failure(Exception("Connection timed out. Please try again."))
            } catch (e: IOException) {
                Result.failure(Exception("Network error. Please check your internet connection."))
            } catch (e: Exception) {
                Result.failure(Exception("Something went wrong. Please try again."))
            }
        }
    }
}
