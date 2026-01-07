import Foundation

// MARK: - API Errors

enum APIError: LocalizedError {
    case invalidURL
    case noData
    case decodingError(Error)
    case networkError(Error)
    case serverError(String)
    case unauthorized
    case unknown
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .noData:
            return "No data received"
        case .decodingError(let error):
            return "Decoding error: \(error.localizedDescription)"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .serverError(let message):
            return message
        case .unauthorized:
            return "Unauthorized. Please login again."
        case .unknown:
            return "An unknown error occurred"
        }
    }
}

// MARK: - API Manager

class APIManager {
    
    static let shared = APIManager()
    
    #if DEBUG
    private let baseURL = "http://localhost:3001/api"
    #else
    private let baseURL = "https://demony-api.onrender.com/api"
    #endif
    
    private var session: URLSession!
    
    private init() {}
    
    func configure() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        session = URLSession(configuration: config)
    }
    
    // MARK: - Generic Request Method
    
    func request<T: Codable>(
        endpoint: String,
        method: String = "GET",
        body: Encodable? = nil,
        authenticated: Bool = true,
        completion: @escaping (Result<T, APIError>) -> Void
    ) {
        guard let url = URL(string: "\(baseURL)\(endpoint)") else {
            completion(.failure(.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Add auth token if needed
        if authenticated, let token = TokenManager.shared.token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        // Add body if present
        if let body = body {
            do {
                request.httpBody = try JSONEncoder().encode(body)
            } catch {
                completion(.failure(.decodingError(error)))
                return
            }
        }
        
        session.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                if let error = error {
                    completion(.failure(.networkError(error)))
                    return
                }
                
                guard let httpResponse = response as? HTTPURLResponse else {
                    completion(.failure(.unknown))
                    return
                }
                
                // Handle unauthorized
                if httpResponse.statusCode == 401 {
                    TokenManager.shared.logout()
                    completion(.failure(.unauthorized))
                    return
                }
                
                guard let data = data else {
                    completion(.failure(.noData))
                    return
                }
                
                // Check for error response
                if httpResponse.statusCode >= 400 {
                    if let errorResponse = try? JSONDecoder().decode(MessageResponse.self, from: data) {
                        completion(.failure(.serverError(errorResponse.message)))
                    } else {
                        completion(.failure(.serverError("Server error: \(httpResponse.statusCode)")))
                    }
                    return
                }
                
                do {
                    let decoded = try JSONDecoder().decode(T.self, from: data)
                    completion(.success(decoded))
                } catch {
                    completion(.failure(.decodingError(error)))
                }
            }
        }.resume()
    }
    
    // MARK: - Auth Endpoints
    
    func login(email: String, password: String, completion: @escaping (Result<AuthResponse, APIError>) -> Void) {
        let body = LoginRequest(email: email, password: password)
        request(endpoint: "/auth/login", method: "POST", body: body, authenticated: false, completion: completion)
    }
    
    func signup(name: String, email: String, phone: String, password: String, referralCode: String?, completion: @escaping (Result<AuthResponse, APIError>) -> Void) {
        let body = SignupRequest(name: name, email: email, phone: phone, password: password, referralCode: referralCode)
        request(endpoint: "/auth/signup", method: "POST", body: body, authenticated: false, completion: completion)
    }
    
    func getMe(completion: @escaping (Result<AuthResponse, APIError>) -> Void) {
        request(endpoint: "/auth/me", completion: completion)
    }
    
    // MARK: - Projects Endpoints
    
    func getProjects(category: String? = nil, page: Int = 1, completion: @escaping (Result<ProjectsResponse, APIError>) -> Void) {
        var endpoint = "/projects?page=\(page)"
        if let category = category {
            endpoint += "&category=\(category)"
        }
        request(endpoint: endpoint, completion: completion)
    }
    
    func getProject(id: String, completion: @escaping (Result<APIResponse<Project>, APIError>) -> Void) {
        request(endpoint: "/projects/\(id)", completion: completion)
    }
    
    func calculateReturns(projectId: String, amount: Double, completion: @escaping (Result<[String: Any], APIError>) -> Void) {
        struct ReturnRequest: Codable {
            let amount: Double
        }
        let body = ReturnRequest(amount: amount)
        request(endpoint: "/projects/\(projectId)/calculate-returns", method: "POST", body: body, completion: completion)
    }
    
    // MARK: - Investments Endpoints
    
    func invest(projectId: String, amount: Double, completion: @escaping (Result<MessageResponse, APIError>) -> Void) {
        let body = InvestRequest(projectId: projectId, amount: amount)
        request(endpoint: "/investments", method: "POST", body: body, completion: completion)
    }
    
    func getInvestments(completion: @escaping (Result<InvestmentsResponse, APIError>) -> Void) {
        request(endpoint: "/investments", completion: completion)
    }
    
    // MARK: - Wallet Endpoints
    
    func getWalletBalance(completion: @escaping (Result<APIResponse<WalletBalance>, APIError>) -> Void) {
        request(endpoint: "/wallet/balance", completion: completion)
    }
    
    func getTransactions(completion: @escaping (Result<TransactionsResponse, APIError>) -> Void) {
        request(endpoint: "/wallet/transactions", completion: completion)
    }
    
    func initializeDeposit(amount: Double, completion: @escaping (Result<DepositResponse, APIError>) -> Void) {
        let body = DepositRequest(amount: amount)
        request(endpoint: "/wallet/deposit/initialize", method: "POST", body: body, completion: completion)
    }
    
    func requestWithdrawal(request: WithdrawRequest, completion: @escaping (Result<MessageResponse, APIError>) -> Void) {
        self.request(endpoint: "/wallet/withdraw", method: "POST", body: request, completion: completion)
    }
    
    func getBanks(completion: @escaping (Result<APIResponse<[Bank]>, APIError>) -> Void) {
        request(endpoint: "/wallet/banks", completion: completion)
    }
    
    // MARK: - Portfolio Endpoints
    
    func getPortfolio(completion: @escaping (Result<PortfolioResponse, APIError>) -> Void) {
        request(endpoint: "/portfolio", completion: completion)
    }
    
    // MARK: - Referrals Endpoints
    
    func getReferralCode(completion: @escaping (Result<APIResponse<ReferralCode>, APIError>) -> Void) {
        request(endpoint: "/referrals/code", completion: completion)
    }
    
    func getReferralHistory(completion: @escaping (Result<APIResponse<[ReferralHistory]>, APIError>) -> Void) {
        request(endpoint: "/referrals/history", completion: completion)
    }
    
    func getReferralLeaderboard(completion: @escaping (Result<APIResponse<[LeaderboardEntry]>, APIError>) -> Void) {
        request(endpoint: "/referrals/leaderboard", completion: completion)
    }
    
    // MARK: - Support Endpoints
    
    func getSupportTickets(completion: @escaping (Result<APIResponse<[SupportTicket]>, APIError>) -> Void) {
        request(endpoint: "/support/tickets", completion: completion)
    }
    
    func createSupportTicket(subject: String, message: String, category: String, completion: @escaping (Result<MessageResponse, APIError>) -> Void) {
        let body = CreateTicketRequest(subject: subject, message: message, category: category)
        request(endpoint: "/support/tickets", method: "POST", body: body, completion: completion)
    }
}
