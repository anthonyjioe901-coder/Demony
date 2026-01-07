import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    
    var window: UIWindow?
    
    func scene(
        _ scene: UIScene,
        willConnectTo session: UISceneSession,
        options connectionOptions: UIScene.ConnectionOptions
    ) {
        guard let windowScene = (scene as? UIWindowScene) else { return }
        
        window = UIWindow(windowScene: windowScene)
        
        // Check authentication status
        if TokenManager.shared.isAuthenticated {
            showMainApp()
        } else {
            showLogin()
        }
        
        window?.makeKeyAndVisible()
    }
    
    func sceneDidDisconnect(_ scene: UIScene) {
        // Handle scene disconnection
    }
    
    func sceneDidBecomeActive(_ scene: UIScene) {
        // Handle scene becoming active
    }
    
    func sceneWillResignActive(_ scene: UIScene) {
        // Handle scene resigning active
    }
    
    func sceneWillEnterForeground(_ scene: UIScene) {
        // Handle scene entering foreground
    }
    
    func sceneDidEnterBackground(_ scene: UIScene) {
        // Handle scene entering background
    }
    
    // MARK: - Navigation
    
    func showLogin() {
        let loginVC = LoginViewController()
        loginVC.delegate = self
        let navController = UINavigationController(rootViewController: loginVC)
        navController.modalPresentationStyle = .fullScreen
        window?.rootViewController = navController
    }
    
    func showMainApp() {
        let tabBarController = MainTabBarController()
        window?.rootViewController = tabBarController
    }
    
    // MARK: - Deep Linking
    
    func scene(
        _ scene: UIScene,
        openURLContexts URLContexts: Set<UIOpenURLContext>
    ) {
        guard let url = URLContexts.first?.url else { return }
        handleDeepLink(url: url)
    }
    
    private func handleDeepLink(url: URL) {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: true) else {
            return
        }
        
        let path = components.path
        
        // Handle different deep link paths
        switch path {
        case let p where p.hasPrefix("/project/"):
            if let projectId = p.components(separatedBy: "/").last {
                navigateToProject(projectId: projectId)
            }
        case "/wallet":
            navigateToWallet()
        case "/investments":
            navigateToInvestments()
        default:
            break
        }
    }
    
    private func navigateToProject(projectId: String) {
        guard let tabBar = window?.rootViewController as? MainTabBarController else { return }
        tabBar.selectedIndex = 1 // Projects tab
        // Additional navigation to specific project
    }
    
    private func navigateToWallet() {
        guard let tabBar = window?.rootViewController as? MainTabBarController else { return }
        tabBar.selectedIndex = 2 // Wallet tab
    }
    
    private func navigateToInvestments() {
        guard let tabBar = window?.rootViewController as? MainTabBarController else { return }
        tabBar.selectedIndex = 3 // Portfolio tab
    }
}

// MARK: - LoginViewControllerDelegate

extension SceneDelegate: LoginViewControllerDelegate {
    func loginViewControllerDidLogin(_ controller: LoginViewController) {
        showMainApp()
    }
}
