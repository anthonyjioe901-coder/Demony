import UIKit

class MainTabBarController: UITabBarController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupTabs()
        setupAppearance()
    }
    
    private func setupTabs() {
        // Home Tab
        let homeVC = HomeViewController()
        let homeNav = UINavigationController(rootViewController: homeVC)
        homeNav.tabBarItem = UITabBarItem(
            title: "Home",
            image: UIImage(systemName: "house"),
            selectedImage: UIImage(systemName: "house.fill")
        )
        
        // Projects Tab
        let projectsVC = ProjectsViewController()
        let projectsNav = UINavigationController(rootViewController: projectsVC)
        projectsNav.tabBarItem = UITabBarItem(
            title: "Projects",
            image: UIImage(systemName: "folder"),
            selectedImage: UIImage(systemName: "folder.fill")
        )
        
        // Wallet Tab
        let walletVC = WalletViewController()
        let walletNav = UINavigationController(rootViewController: walletVC)
        walletNav.tabBarItem = UITabBarItem(
            title: "Wallet",
            image: UIImage(systemName: "creditcard"),
            selectedImage: UIImage(systemName: "creditcard.fill")
        )
        
        // Portfolio Tab
        let portfolioVC = PortfolioViewController()
        let portfolioNav = UINavigationController(rootViewController: portfolioVC)
        portfolioNav.tabBarItem = UITabBarItem(
            title: "Portfolio",
            image: UIImage(systemName: "chart.pie"),
            selectedImage: UIImage(systemName: "chart.pie.fill")
        )
        
        // Profile Tab
        let profileVC = ProfileViewController()
        let profileNav = UINavigationController(rootViewController: profileVC)
        profileNav.tabBarItem = UITabBarItem(
            title: "Profile",
            image: UIImage(systemName: "person"),
            selectedImage: UIImage(systemName: "person.fill")
        )
        
        viewControllers = [homeNav, projectsNav, walletNav, portfolioNav, profileNav]
    }
    
    private func setupAppearance() {
        // Primary color: #6366F1
        let primaryColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        tabBar.tintColor = primaryColor
    }
}
