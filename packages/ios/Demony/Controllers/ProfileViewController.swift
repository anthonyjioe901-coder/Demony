import UIKit

class ProfileViewController: UIViewController {
    
    // MARK: - UI Components
    
    private let scrollView: UIScrollView = {
        let sv = UIScrollView()
        sv.translatesAutoresizingMaskIntoConstraints = false
        return sv
    }()
    
    private let contentView: UIView = {
        let view = UIView()
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()
    
    private let avatarView: UIView = {
        let view = UIView()
        view.backgroundColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        view.layer.cornerRadius = 40
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()
    
    private let avatarLabel: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 32, weight: .bold)
        label.textColor = .white
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let nameLabel: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 24, weight: .bold)
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let emailLabel: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 15)
        label.textColor = .secondaryLabel
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let verificationBadge: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 13, weight: .medium)
        label.textAlignment = .center
        label.layer.cornerRadius = 12
        label.clipsToBounds = true
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let menuStack: UIStackView = {
        let stack = UIStackView()
        stack.axis = .vertical
        stack.spacing = 8
        stack.translatesAutoresizingMaskIntoConstraints = false
        return stack
    }()
    
    private let logoutButton: UIButton = {
        let button = UIButton(type: .system)
        button.setTitle("Logout", for: .normal)
        button.setTitleColor(.white, for: .normal)
        button.titleLabel?.font = .systemFont(ofSize: 17, weight: .semibold)
        button.backgroundColor = .systemRed
        button.layer.cornerRadius = 12
        button.translatesAutoresizingMaskIntoConstraints = false
        return button
    }()
    
    // MARK: - Lifecycle
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        setupMenuItems()
        loadUserData()
    }
    
    // MARK: - Setup
    
    private func setupUI() {
        view.backgroundColor = .systemBackground
        title = "Profile"
        navigationController?.navigationBar.prefersLargeTitles = true
        
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            image: UIImage(systemName: "gearshape"),
            style: .plain,
            target: self,
            action: #selector(settingsTapped)
        )
        
        view.addSubview(scrollView)
        scrollView.addSubview(contentView)
        
        contentView.addSubview(avatarView)
        avatarView.addSubview(avatarLabel)
        contentView.addSubview(nameLabel)
        contentView.addSubview(emailLabel)
        contentView.addSubview(verificationBadge)
        contentView.addSubview(menuStack)
        contentView.addSubview(logoutButton)
        
        logoutButton.addTarget(self, action: #selector(logoutTapped), for: .touchUpInside)
        
        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            
            contentView.topAnchor.constraint(equalTo: scrollView.topAnchor),
            contentView.leadingAnchor.constraint(equalTo: scrollView.leadingAnchor),
            contentView.trailingAnchor.constraint(equalTo: scrollView.trailingAnchor),
            contentView.bottomAnchor.constraint(equalTo: scrollView.bottomAnchor),
            contentView.widthAnchor.constraint(equalTo: scrollView.widthAnchor),
            
            avatarView.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 24),
            avatarView.centerXAnchor.constraint(equalTo: contentView.centerXAnchor),
            avatarView.widthAnchor.constraint(equalToConstant: 80),
            avatarView.heightAnchor.constraint(equalToConstant: 80),
            
            avatarLabel.centerXAnchor.constraint(equalTo: avatarView.centerXAnchor),
            avatarLabel.centerYAnchor.constraint(equalTo: avatarView.centerYAnchor),
            
            nameLabel.topAnchor.constraint(equalTo: avatarView.bottomAnchor, constant: 16),
            nameLabel.centerXAnchor.constraint(equalTo: contentView.centerXAnchor),
            
            emailLabel.topAnchor.constraint(equalTo: nameLabel.bottomAnchor, constant: 4),
            emailLabel.centerXAnchor.constraint(equalTo: contentView.centerXAnchor),
            
            verificationBadge.topAnchor.constraint(equalTo: emailLabel.bottomAnchor, constant: 12),
            verificationBadge.centerXAnchor.constraint(equalTo: contentView.centerXAnchor),
            verificationBadge.heightAnchor.constraint(equalToConstant: 28),
            
            menuStack.topAnchor.constraint(equalTo: verificationBadge.bottomAnchor, constant: 32),
            menuStack.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            menuStack.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            
            logoutButton.topAnchor.constraint(equalTo: menuStack.bottomAnchor, constant: 32),
            logoutButton.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            logoutButton.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            logoutButton.heightAnchor.constraint(equalToConstant: 50),
            logoutButton.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -24)
        ])
    }
    
    private func setupMenuItems() {
        let menuItems = [
            ("person.text.rectangle", "Complete KYC Verification", #selector(kycTapped)),
            ("gift", "Referral Program", #selector(referralsTapped)),
            ("questionmark.circle", "Help & Support", #selector(supportTapped)),
            ("doc.text", "Terms of Service", #selector(termsTapped)),
            ("lock.shield", "Privacy Policy", #selector(privacyTapped))
        ]
        
        for (icon, title, action) in menuItems {
            let item = createMenuItem(icon: icon, title: title, action: action)
            menuStack.addArrangedSubview(item)
        }
    }
    
    private func createMenuItem(icon: String, title: String, action: Selector) -> UIView {
        let container = UIView()
        container.backgroundColor = .secondarySystemBackground
        container.layer.cornerRadius = 12
        container.translatesAutoresizingMaskIntoConstraints = false
        
        let iconView = UIImageView(image: UIImage(systemName: icon))
        iconView.tintColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        iconView.translatesAutoresizingMaskIntoConstraints = false
        
        let titleLabel = UILabel()
        titleLabel.text = title
        titleLabel.font = .systemFont(ofSize: 16)
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        
        let chevron = UIImageView(image: UIImage(systemName: "chevron.right"))
        chevron.tintColor = .tertiaryLabel
        chevron.translatesAutoresizingMaskIntoConstraints = false
        
        container.addSubview(iconView)
        container.addSubview(titleLabel)
        container.addSubview(chevron)
        
        NSLayoutConstraint.activate([
            container.heightAnchor.constraint(equalToConstant: 56),
            
            iconView.leadingAnchor.constraint(equalTo: container.leadingAnchor, constant: 16),
            iconView.centerYAnchor.constraint(equalTo: container.centerYAnchor),
            iconView.widthAnchor.constraint(equalToConstant: 24),
            iconView.heightAnchor.constraint(equalToConstant: 24),
            
            titleLabel.leadingAnchor.constraint(equalTo: iconView.trailingAnchor, constant: 12),
            titleLabel.centerYAnchor.constraint(equalTo: container.centerYAnchor),
            
            chevron.trailingAnchor.constraint(equalTo: container.trailingAnchor, constant: -16),
            chevron.centerYAnchor.constraint(equalTo: container.centerYAnchor)
        ])
        
        let tap = UITapGestureRecognizer(target: self, action: action)
        container.addGestureRecognizer(tap)
        container.isUserInteractionEnabled = true
        
        return container
    }
    
    private func loadUserData() {
        if let user = TokenManager.shared.currentUser {
            nameLabel.text = user.name
            emailLabel.text = user.email
            avatarLabel.text = String(user.name.prefix(1)).uppercased()
            
            if user.kycStatus == "verified" {
                verificationBadge.text = "  ✓ Verified  "
                verificationBadge.backgroundColor = UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 0.1)
                verificationBadge.textColor = UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0)
            } else {
                verificationBadge.text = "  ⚠ Not Verified  "
                verificationBadge.backgroundColor = UIColor.systemOrange.withAlphaComponent(0.1)
                verificationBadge.textColor = .systemOrange
            }
        }
    }
    
    // MARK: - Actions
    
    @objc private func settingsTapped() {
        let settingsVC = SettingsViewController()
        navigationController?.pushViewController(settingsVC, animated: true)
    }
    
    @objc private func kycTapped() {
        showAlert(title: "KYC Verification", message: "KYC verification feature coming soon.")
    }
    
    @objc private func referralsTapped() {
        let referralsVC = ReferralsViewController()
        navigationController?.pushViewController(referralsVC, animated: true)
    }
    
    @objc private func supportTapped() {
        let supportVC = SupportViewController()
        navigationController?.pushViewController(supportVC, animated: true)
    }
    
    @objc private func termsTapped() {
        showAlert(title: "Terms of Service", message: "Terms of Service will be displayed here.")
    }
    
    @objc private func privacyTapped() {
        showAlert(title: "Privacy Policy", message: "Privacy Policy will be displayed here.")
    }
    
    @objc private func logoutTapped() {
        let alert = UIAlertController(
            title: "Logout",
            message: "Are you sure you want to logout?",
            preferredStyle: .alert
        )
        
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        alert.addAction(UIAlertAction(title: "Logout", style: .destructive) { [weak self] _ in
            TokenManager.shared.logout()
            if let sceneDelegate = self?.view.window?.windowScene?.delegate as? SceneDelegate {
                sceneDelegate.showLogin()
            }
        })
        
        present(alert, animated: true)
    }
    
    private func showAlert(title: String, message: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
}
