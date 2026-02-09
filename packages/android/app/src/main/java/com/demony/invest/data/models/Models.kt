package com.demony.invest.data.models

import com.google.gson.annotations.SerializedName

/**
 * User model matching the backend API
 * Note: Backend returns different User shapes for login vs /me endpoint
 * Login returns: id, name, email, role, isVerified, kycStatus, walletBalance
 * /me returns: full user object with kyc object
 */
data class User(
    val id: String,
    val name: String,
    val email: String,
    val role: String = "investor",
    val phone: String? = null,
    @SerializedName("isVerified")
    val isVerified: Boolean = false,
    @SerializedName("isActive")
    val isActive: Boolean = true,
    @SerializedName("walletBalance")
    val walletBalance: Double = 0.0,
    @SerializedName("totalInvested")
    val totalInvested: Double = 0.0,
    @SerializedName("totalEarnings")
    val totalEarnings: Double = 0.0,
    // Full KYC object (from /me endpoint)
    val kyc: KycInfo? = null,
    // Flattened kycStatus (from login endpoint)
    @SerializedName("kycStatus")
    val kycStatus: String? = null,
    val business: BusinessInfo? = null,
    @SerializedName("createdAt")
    val createdAt: String? = null
) {
    // Helper to get KYC status from either field
    fun getKycStatusValue(): String {
        return kyc?.status ?: kycStatus ?: "pending"
    }
}

data class KycInfo(
    val status: String = "pending", // pending, submitted, verified, rejected
    @SerializedName("idDocument")
    val idDocument: String? = null,
    val selfie: String? = null,
    @SerializedName("submittedAt")
    val submittedAt: String? = null,
    @SerializedName("verifiedAt")
    val verifiedAt: String? = null,
    @SerializedName("rejectionReason")
    val rejectionReason: String? = null
)

data class BusinessInfo(
    val name: String,
    @SerializedName("registrationNumber")
    val registrationNumber: String,
    val verified: Boolean = false,
    val documents: List<String> = emptyList()
)

/**
 * Authentication request/response models
 */
data class LoginRequest(
    val email: String,
    val password: String
)

data class SignupRequest(
    val name: String,
    val email: String,
    val password: String,
    val role: String = "investor",
    val phone: String? = null,
    val businessName: String? = null,
    val businessRegistration: String? = null,
    val referralCode: String? = null
)

data class AuthResponse(
    val token: String,
    val user: User
)

/**
 * Project model
 */
data class Project(
    val id: String,
    val name: String,
    val description: String,
    val category: String,
    @SerializedName("image_url")
    val imageUrl: String? = null,
    @SerializedName("goal_amount")
    val goalAmount: Double = 0.0,
    @SerializedName("raised_amount")
    val raisedAmount: Double = 0.0,
    @SerializedName("min_investment")
    val minInvestment: Double = 100.0,
    @SerializedName("target_return")
    val targetReturn: String = "10-15%",
    val duration: String = "12 months",
    @SerializedName("risk_level")
    val riskLevel: String = "medium",
    @SerializedName("end_date")
    val endDate: String? = null,
    val status: String = "active",
    val featured: Boolean = false,
    val priority: Int = 0,
    val tags: List<String> = emptyList(),
    @SerializedName("investor_count")
    val investorCount: Int = 0,
    @SerializedName("profit_distribution_frequency")
    val profitDistributionFrequency: String = "as_realized",
    @SerializedName("lock_in_period_months")
    val lockInPeriodMonths: String = "12",
    @SerializedName("profit_sharing_ratio")
    val profitSharingRatio: ProfitSharingRatio? = null,
    @SerializedName("risk_factors")
    val riskFactors: List<String> = emptyList(),
    @SerializedName("risk_disclaimer")
    val riskDisclaimer: String? = null,
    @SerializedName("progress_status")
    val progressStatus: String = "not_started"
) {
    val fundingProgress: Float
        get() = if (goalAmount > 0) (raisedAmount / goalAmount).toFloat().coerceIn(0f, 1f) else 0f
    
    val fundingPercentage: Int
        get() = (fundingProgress * 100).toInt()
}

data class ProfitSharingRatio(
    val investor: Int = 80,
    val platform: Int = 20
)

data class ProjectsResponse(
    val projects: List<Project>,
    val pagination: Pagination? = null
)

data class Pagination(
    val total: Int,
    val page: Int,
    val limit: Int,
    val pages: Int
)

/**
 * Investment model
 */
data class Investment(
    val id: String,
    @SerializedName("projectId")
    val projectId: String,
    @SerializedName("projectName")
    val projectName: String,
    val category: String? = null,
    val amount: Double,
    @SerializedName("ownershipPercent")
    val ownershipPercent: Double = 0.0,
    val status: String = "active",
    val earnings: Double = 0.0,
    @SerializedName("lockInPeriodMonths")
    val lockInPeriodMonths: String = "12",
    @SerializedName("lockInEndDate")
    val lockInEndDate: String? = null,
    @SerializedName("createdAt")
    val createdAt: String? = null
) {
    val totalValue: Double
        get() = amount + earnings
    
    val returnPercentage: Double
        get() = if (amount > 0) (earnings / amount) * 100 else 0.0
}

data class InvestRequest(
    val projectId: String,
    val amount: Double,
    val termsAccepted: Boolean = true,
    val riskAcknowledged: Boolean = true,
    val lossAcknowledged: Boolean = true,
    val lockInAcknowledged: Boolean = true
)

data class InvestmentsResponse(
    val investments: List<Investment>,
    val summary: InvestmentSummary? = null
)

data class InvestmentSummary(
    @SerializedName("totalInvested")
    val totalInvested: Double = 0.0,
    @SerializedName("totalEarnings")
    val totalEarnings: Double = 0.0,
    @SerializedName("activeInvestments")
    val activeInvestments: Int = 0
)

/**
 * Wallet models
 */
data class WalletBalance(
    val balance: Double = 0.0,
    @SerializedName("totalInvested")
    val totalInvested: Double = 0.0,
    @SerializedName("totalEarnings")
    val totalEarnings: Double = 0.0,
    @SerializedName("availableForWithdrawal")
    val availableForWithdrawal: Double = 0.0
)

data class Transaction(
    val id: String,
    val type: String, // deposit, withdrawal, investment, profit
    val amount: Double,
    val status: String, // pending, completed, failed
    val description: String? = null,
    val reference: String? = null,
    @SerializedName("createdAt")
    val createdAt: String? = null
)

data class TransactionsResponse(
    val transactions: List<Transaction>,
    val pagination: Pagination? = null
)

data class DepositRequest(
    val amount: Double
)

data class DepositResponse(
    @SerializedName("authorization_url")
    val authorizationUrl: String,
    val reference: String,
    @SerializedName("access_code")
    val accessCode: String? = null
)

data class WithdrawRequest(
    val amount: Double,
    @SerializedName("bank_code")
    val bankCode: String,
    @SerializedName("account_number")
    val accountNumber: String,
    @SerializedName("account_name")
    val accountName: String
)

data class Bank(
    val code: String,
    val name: String
)

data class BanksResponse(
    val banks: List<Bank>
)

/**
 * Portfolio models
 */
data class Portfolio(
    @SerializedName("currentValue")
    val totalValue: Double = 0.0,
    @SerializedName("totalInvested")
    val totalInvested: Double = 0.0,
    @SerializedName("totalEarnings")
    val totalEarnings: Double = 0.0,
    @SerializedName("returnPercent")
    val returnPercentage: Double = 0.0,
    @SerializedName("activeInvestments")
    val activeInvestments: Int = 0,
    val investments: List<Investment> = emptyList(),
    val allocation: List<CategoryAllocation>? = null
)

data class CategoryAllocation(
    val category: String,
    val value: Double = 0.0,
    val percent: Int = 0
)

/**
 * Referral models
 */
data class ReferralCode(
    val code: String,
    @SerializedName("totalReferrals")
    val totalReferrals: Int = 0,
    @SerializedName("qualifiedReferrals")
    val qualifiedReferrals: Int = 0,
    @SerializedName("pendingRewards")
    val pendingRewards: Double = 0.0,
    @SerializedName("earnedRewards")
    val earnedRewards: Double = 0.0,
    @SerializedName("referralLink")
    val referralLink: String? = null
)

data class ReferralHistory(
    val id: String,
    @SerializedName("refereeName")
    val refereeName: String,
    val status: String, // pending, qualified, rewarded
    val reward: Double = 0.0,
    @SerializedName("createdAt")
    val createdAt: String? = null
)

data class ReferralHistoryResponse(
    val referrals: List<ReferralHistory>
)

/**
 * Support models
 */
data class SupportTicket(
    val id: String? = null,
    val subject: String,
    val category: String,
    val message: String,
    val status: String = "open",
    val priority: String = "normal",
    val email: String? = null,
    @SerializedName("createdAt")
    val createdAt: String? = null
)

data class TicketResponse(
    val ticket: SupportTicket? = null,
    @SerializedName("ticketId")
    val ticketId: String? = null,
    val message: String? = null,
    val success: Boolean = true
)

/**
 * Generic API Response wrapper
 */
data class ApiError(
    val error: String,
    val message: String? = null
)

data class MessageResponse(
    val message: String,
    val success: Boolean = true
)
