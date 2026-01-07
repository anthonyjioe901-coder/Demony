import Foundation
import Security

class TokenManager {
    
    static let shared = TokenManager()
    
    private let tokenKey = "com.demony.invest.authToken"
    private let userKey = "com.demony.invest.currentUser"
    
    private init() {}
    
    // MARK: - Token Management
    
    var token: String? {
        get { getFromKeychain(key: tokenKey) }
        set {
            if let value = newValue {
                saveToKeychain(key: tokenKey, value: value)
            } else {
                deleteFromKeychain(key: tokenKey)
            }
        }
    }
    
    var isAuthenticated: Bool {
        return token != nil
    }
    
    // MARK: - User Management
    
    var currentUser: User? {
        get {
            guard let data = UserDefaults.standard.data(forKey: userKey) else { return nil }
            return try? JSONDecoder().decode(User.self, from: data)
        }
        set {
            if let user = newValue, let data = try? JSONEncoder().encode(user) {
                UserDefaults.standard.set(data, forKey: userKey)
            } else {
                UserDefaults.standard.removeObject(forKey: userKey)
            }
        }
    }
    
    // MARK: - Logout
    
    func logout() {
        token = nil
        currentUser = nil
        UserDefaults.standard.removeObject(forKey: userKey)
    }
    
    // MARK: - Keychain Operations
    
    private func saveToKeychain(key: String, value: String) {
        guard let data = value.data(using: .utf8) else { return }
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data
        ]
        
        // Delete existing item
        SecItemDelete(query as CFDictionary)
        
        // Add new item
        SecItemAdd(query as CFDictionary, nil)
    }
    
    private func getFromKeychain(key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        guard status == errSecSuccess,
              let data = result as? Data,
              let value = String(data: data, encoding: .utf8) else {
            return nil
        }
        
        return value
    }
    
    private func deleteFromKeychain(key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key
        ]
        
        SecItemDelete(query as CFDictionary)
    }
}
