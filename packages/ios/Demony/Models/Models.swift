import Foundation

// MARK: - User Models

struct User: Codable {
    let id: String
    let name: String
    let email: String
    let phone: String?
    let role: String
    let kycStatus: String?
    let kycInfo: KycInfo?
    let businessInfo: BusinessInfo?
    let referralCode: String?
    let createdAt: String?
    let updatedAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case name, email, phone, role
        case kycStatus, kycInfo, businessInfo
        case referralCode, createdAt, updatedAt
    }
}

struct KycInfo: Codable {
    let idType: String?
    let idNumber: String?
    let idImage: String?
    let address: String?
    let dateOfBirth: String?
}

struct BusinessInfo: Codable {
    let businessName: String?
    let businessType: String?
    let registrationNumber: String?
    let address: String?
}

// MARK: - Auth Models

struct LoginRequest: Codable {
    let email: String
    let password: String
}

struct SignupRequest: Codable {
    let name: String
    let email: String
    let phone: String
    let password: String
    let referralCode: String?
}

struct AuthResponse: Codable {
    let success: Bool
    let token: String?
    let user: User?
    let message: String?
}

// MARK: - Project Models

struct Project: Codable, Identifiable {
    let id: String
    let name: String
    let description: String
    let category: String
    let image: String?
    let targetAmount: Double
    let raisedAmount: Double
    let minimumInvestment: Double
    let maximumInvestment: Double?
    let returnRate: Double
    let returnPeriod: String
    let lockInPeriodMonths: Int
    let status: String
    let riskLevel: String
    let startDate: String?
    let endDate: String?
    let profitSharingRatios: ProfitSharingRatio?
    let documents: [String]?
    let featured: Bool?
    let createdAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case name, description, category, image
        case targetAmount, raisedAmount
        case minimumInvestment, maximumInvestment
        case returnRate, returnPeriod
        case lockInPeriodMonths, status, riskLevel
        case startDate, endDate
        case profitSharingRatios, documents, featured
        case createdAt
    }
    
    var fundingProgress: Double {
        guard targetAmount > 0 else { return 0 }
        return min(raisedAmount / targetAmount, 1.0)
    }
    
    var fundingPercentage: Int {
        Int(fundingProgress * 100)
    }
}

struct ProfitSharingRatio: Codable {
    let investor: Double
    let platform: Double
    let project: Double?
}

struct ProjectsResponse: Codable {
    let success: Bool
    let projects: [Project]
    let pagination: Pagination?
}

struct Pagination: Codable {
    let currentPage: Int
    let totalPages: Int
    let totalProjects: Int
}

// MARK: - Investment Models

struct Investment: Codable, Identifiable {
    let id: String
    let projectId: String
    let projectName: String
    let category: String?
    let amount: Double
    let earnings: Double
    let totalValue: Double
    let returnPercentage: Double
    let lockInPeriodMonths: Int
    let status: String
    let investedAt: String
    let maturityDate: String?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case projectId, projectName, category
        case amount, earnings, totalValue
        case returnPercentage, lockInPeriodMonths
        case status, investedAt, maturityDate
    }
}

struct InvestRequest: Codable {
    let projectId: String
    let amount: Double
}

struct InvestmentsResponse: Codable {
    let success: Bool
    let investments: [Investment]
    let summary: InvestmentSummary?
}

struct InvestmentSummary: Codable {
    let totalInvested: Double
    let totalEarnings: Double
    let activeInvestments: Int
}

// MARK: - Wallet Models

struct WalletBalance: Codable {
    let balance: Double
    let totalInvested: Double
    let totalEarnings: Double
    let pendingWithdrawals: Double?
}

struct Transaction: Codable, Identifiable {
    let id: String
    let type: String
    let amount: Double
    let status: String
    let description: String?
    let reference: String?
    let createdAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case type, amount, status
        case description, reference, createdAt
    }
}

struct TransactionsResponse: Codable {
    let success: Bool
    let transactions: [Transaction]
}

struct DepositRequest: Codable {
    let amount: Double
}

struct DepositResponse: Codable {
    let success: Bool
    let authorizationUrl: String?
    let reference: String?
    let message: String?
}

struct WithdrawRequest: Codable {
    let amount: Double
    let bankCode: String
    let accountNumber: String
    let accountName: String
}

struct Bank: Codable, Identifiable {
    let id: Int
    let name: String
    let code: String
}

// MARK: - Portfolio Models

struct Portfolio: Codable {
    let totalValue: Double
    let totalInvested: Double
    let totalEarnings: Double
    let returnPercentage: Double
    let investments: [Investment]
    let categoryBreakdown: [String: Double]?
}

struct PortfolioResponse: Codable {
    let success: Bool
    let portfolio: Portfolio
}

// MARK: - Referral Models

struct ReferralCode: Codable {
    let code: String
    let totalReferrals: Int
    let totalEarnings: Double
    let activeReferrals: Int?
}

struct ReferralHistory: Codable, Identifiable {
    let id: String
    let referredUserId: String
    let referredUserName: String
    let status: String
    let commissionEarned: Double
    let joinedDate: String
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case referredUserId, referredUserName
        case status, commissionEarned, joinedDate
    }
}

struct LeaderboardEntry: Codable {
    let userId: String
    let userName: String
    let totalReferrals: Int
    let totalEarnings: Double
    let rank: Int
}

struct ReferralResponse: Codable {
    let success: Bool
    let referralCode: ReferralCode?
    let history: [ReferralHistory]?
    let leaderboard: [LeaderboardEntry]?
}

// MARK: - Support Models

struct SupportTicket: Codable, Identifiable {
    let id: String
    let subject: String
    let message: String
    let category: String
    let status: String
    let createdAt: String
    let updatedAt: String?
    let response: String?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case subject, message, category
        case status, createdAt, updatedAt, response
    }
}

struct CreateTicketRequest: Codable {
    let subject: String
    let message: String
    let category: String
}

// MARK: - Generic API Response

struct APIResponse<T: Codable>: Codable {
    let success: Bool
    let data: T?
    let message: String?
}

struct MessageResponse: Codable {
    let success: Bool
    let message: String
}
