package com.demony.invest.data.api

import com.demony.invest.data.models.*
import retrofit2.Response
import retrofit2.http.*

/**
 * Demony API Service
 * 
 * Retrofit interface defining all API endpoints for the Demony investment platform.
 * Base URL: https://demony-api.onrender.com/api
 */
interface DemonyApiService {

    // ==================== AUTHENTICATION ====================
    
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
    
    @POST("auth/signup")
    suspend fun signup(@Body request: SignupRequest): Response<AuthResponse>
    
    @GET("auth/me")
    suspend fun getMe(): Response<User>
    
    @POST("auth/kyc/submit")
    suspend fun submitKyc(@Body data: Map<String, Any>): Response<MessageResponse>
    
    @POST("auth/forgot-password")
    suspend fun forgotPassword(@Body data: Map<String, String>): Response<MessageResponse>
    
    @POST("auth/reset-password")
    suspend fun resetPassword(@Body data: Map<String, String>): Response<MessageResponse>
    
    @POST("auth/change-password")
    suspend fun changePassword(@Body data: Map<String, String>): Response<MessageResponse>
    
    // ==================== PROJECTS ====================
    
    @GET("projects")
    suspend fun getProjects(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 10,
        @Query("category") category: String? = null,
        @Query("sort") sort: String? = null,
        @Query("search") search: String? = null
    ): Response<ProjectsResponse>
    
    @GET("projects/{id}")
    suspend fun getProject(@Path("id") id: String): Response<Project>
    
    @POST("projects/{id}/calculate-returns")
    suspend fun calculateReturns(
        @Path("id") projectId: String,
        @Body data: Map<String, Any>
    ): Response<Map<String, Any>>
    
    // ==================== INVESTMENTS ====================
    
    @POST("investments")
    suspend fun invest(@Body request: InvestRequest): Response<Investment>
    
    @GET("investments/my")
    suspend fun getMyInvestments(): Response<List<Investment>>
    
    @GET("investments/{id}/profit-history")
    suspend fun getProfitHistory(@Path("id") investmentId: String): Response<List<Map<String, Any>>>
    
    @GET("investments/{id}/project-updates")
    suspend fun getProjectUpdates(@Path("id") investmentId: String): Response<List<Map<String, Any>>>
    
    // ==================== WALLET ====================
    
    @GET("wallet/balance")
    suspend fun getWalletBalance(): Response<WalletBalance>
    
    @GET("wallet/transactions")
    suspend fun getTransactions(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("type") type: String? = null
    ): Response<TransactionsResponse>
    
    @POST("wallet/deposit/initialize")
    suspend fun initializeDeposit(@Body request: DepositRequest): Response<DepositResponse>
    
    @GET("wallet/deposit/verify/{reference}")
    suspend fun verifyDeposit(@Path("reference") reference: String): Response<MessageResponse>
    
    @GET("wallet/banks")
    suspend fun getBanks(): Response<BanksResponse>
    
    @GET("wallet/verify-account")
    suspend fun verifyBankAccount(
        @Query("account_number") accountNumber: String,
        @Query("bank_code") bankCode: String
    ): Response<Map<String, Any>>
    
    @POST("wallet/withdraw")
    suspend fun requestWithdrawal(@Body request: WithdrawRequest): Response<MessageResponse>
    
    // ==================== WITHDRAWALS ====================
    
    @GET("withdrawals/my")
    suspend fun getMyWithdrawals(): Response<TransactionsResponse>
    
    @DELETE("withdrawals/{id}")
    suspend fun cancelWithdrawal(@Path("id") id: String): Response<MessageResponse>
    
    // ==================== PORTFOLIO ====================
    
    @GET("portfolio")
    suspend fun getPortfolio(): Response<Portfolio>
    
    // ==================== REFERRALS ====================
    
    @GET("referrals/my-code")
    suspend fun getReferralCode(): Response<ReferralCode>
    
    @GET("referrals/history")
    suspend fun getReferralHistory(): Response<ReferralHistoryResponse>
    
    @GET("referrals/validate/{code}")
    suspend fun validateReferralCode(@Path("code") code: String): Response<Map<String, Any>>
    
    @GET("referrals/leaderboard")
    suspend fun getReferralLeaderboard(): Response<List<Map<String, Any>>>
    
    // ==================== SUPPORT ====================
    
    @POST("support/tickets")
    suspend fun submitSupportTicket(@Body ticket: SupportTicket): Response<TicketResponse>
    
    @GET("support/tickets/{id}")
    suspend fun getTicketStatus(@Path("id") ticketId: String): Response<SupportTicket>
    
    @GET("support/status")
    suspend fun getSystemStatus(): Response<Map<String, Any>>
    
    // ==================== UPLOAD ====================
    
    @POST("upload/image")
    suspend fun uploadImage(@Body data: Map<String, String>): Response<Map<String, String>>
}
