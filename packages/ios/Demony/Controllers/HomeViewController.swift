import UIKit

class HomeViewController: UIViewController {
    
    // MARK: - Properties
    
    private var walletBalance: WalletBalance?
    private var featuredProjects: [Project] = []
    
    // MARK: - UI Components
    
    private let scrollView: UIScrollView = {
        let sv = UIScrollView()
        sv.translatesAutoresizingMaskIntoConstraints = false
        sv.showsVerticalScrollIndicator = false
        return sv
    }()
    
    private let contentView: UIView = {
        let view = UIView()
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()
    
    private let refreshControl = UIRefreshControl()
    
    private let greetingLabel: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 28, weight: .bold)
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let balanceCard: UIView = {
        let view = UIView()
        view.backgroundColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        view.layer.cornerRadius = 16
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()
    
    private let balanceLabel: UILabel = {
        let label = UILabel()
        label.text = "Available Balance"
        label.font = .systemFont(ofSize: 14)
        label.textColor = .white.withAlphaComponent(0.8)
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let amountLabel: UILabel = {
        let label = UILabel()
        label.text = "GH₵ 0.00"
        label.font = .systemFont(ofSize: 32, weight: .bold)
        label.textColor = .white
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let investedLabel: UILabel = {
        let label = UILabel()
        label.text = "Total Invested: GH₵ 0.00"
        label.font = .systemFont(ofSize: 14)
        label.textColor = .white.withAlphaComponent(0.8)
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let earningsLabel: UILabel = {
        let label = UILabel()
        label.text = "Total Earnings: GH₵ 0.00"
        label.font = .systemFont(ofSize: 14)
        label.textColor = .white.withAlphaComponent(0.8)
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let quickActionsStack: UIStackView = {
        let stack = UIStackView()
        stack.axis = .horizontal
        stack.distribution = .fillEqually
        stack.spacing = 12
        stack.translatesAutoresizingMaskIntoConstraints = false
        return stack
    }()
    
    private let featuredTitleLabel: UILabel = {
        let label = UILabel()
        label.text = "Featured Projects"
        label.font = .systemFont(ofSize: 20, weight: .bold)
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let viewAllButton: UIButton = {
        let button = UIButton(type: .system)
        button.setTitle("View All", for: .normal)
        button.translatesAutoresizingMaskIntoConstraints = false
        return button
    }()
    
    private let projectsStackView: UIStackView = {
        let stack = UIStackView()
        stack.axis = .vertical
        stack.spacing = 12
        stack.translatesAutoresizingMaskIntoConstraints = false
        return stack
    }()
    
    private let emptyProjectsLabel: UILabel = {
        let label = UILabel()
        label.text = "No featured projects available"
        label.font = .systemFont(ofSize: 16)
        label.textColor = .secondaryLabel
        label.textAlignment = .center
        label.isHidden = true
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    // MARK: - Lifecycle
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        setupActions()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        loadData()
    }
    
    // MARK: - Setup
    
    private func setupUI() {
        view.backgroundColor = .systemBackground
        title = "Home"
        navigationController?.navigationBar.prefersLargeTitles = true
        
        view.addSubview(scrollView)
        scrollView.addSubview(contentView)
        scrollView.refreshControl = refreshControl
        
        contentView.addSubview(greetingLabel)
        contentView.addSubview(balanceCard)
        balanceCard.addSubview(balanceLabel)
        balanceCard.addSubview(amountLabel)
        balanceCard.addSubview(investedLabel)
        balanceCard.addSubview(earningsLabel)
        
        contentView.addSubview(quickActionsStack)
        contentView.addSubview(featuredTitleLabel)
        contentView.addSubview(viewAllButton)
        contentView.addSubview(projectsStackView)
        contentView.addSubview(emptyProjectsLabel)
        
        // Add quick action buttons
        let depositButton = createQuickActionButton(title: "Deposit", icon: "plus.circle.fill")
        let investButton = createQuickActionButton(title: "Invest", icon: "chart.line.uptrend.xyaxis")
        let withdrawButton = createQuickActionButton(title: "Withdraw", icon: "arrow.down.circle.fill")
        
        quickActionsStack.addArrangedSubview(depositButton)
        quickActionsStack.addArrangedSubview(investButton)
        quickActionsStack.addArrangedSubview(withdrawButton)
        
        updateGreeting()
        
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
            
            greetingLabel.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 16),
            greetingLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            greetingLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            
            balanceCard.topAnchor.constraint(equalTo: greetingLabel.bottomAnchor, constant: 16),
            balanceCard.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            balanceCard.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            
            balanceLabel.topAnchor.constraint(equalTo: balanceCard.topAnchor, constant: 20),
            balanceLabel.leadingAnchor.constraint(equalTo: balanceCard.leadingAnchor, constant: 20),
            
            amountLabel.topAnchor.constraint(equalTo: balanceLabel.bottomAnchor, constant: 8),
            amountLabel.leadingAnchor.constraint(equalTo: balanceCard.leadingAnchor, constant: 20),
            
            investedLabel.topAnchor.constraint(equalTo: amountLabel.bottomAnchor, constant: 16),
            investedLabel.leadingAnchor.constraint(equalTo: balanceCard.leadingAnchor, constant: 20),
            
            earningsLabel.topAnchor.constraint(equalTo: investedLabel.bottomAnchor, constant: 4),
            earningsLabel.leadingAnchor.constraint(equalTo: balanceCard.leadingAnchor, constant: 20),
            earningsLabel.bottomAnchor.constraint(equalTo: balanceCard.bottomAnchor, constant: -20),
            
            quickActionsStack.topAnchor.constraint(equalTo: balanceCard.bottomAnchor, constant: 24),
            quickActionsStack.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            quickActionsStack.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            quickActionsStack.heightAnchor.constraint(equalToConstant: 80),
            
            featuredTitleLabel.topAnchor.constraint(equalTo: quickActionsStack.bottomAnchor, constant: 24),
            featuredTitleLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            
            viewAllButton.centerYAnchor.constraint(equalTo: featuredTitleLabel.centerYAnchor),
            viewAllButton.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            
            projectsStackView.topAnchor.constraint(equalTo: featuredTitleLabel.bottomAnchor, constant: 16),
            projectsStackView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            projectsStackView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            projectsStackView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -24),
            
            emptyProjectsLabel.topAnchor.constraint(equalTo: featuredTitleLabel.bottomAnchor, constant: 32),
            emptyProjectsLabel.centerXAnchor.constraint(equalTo: contentView.centerXAnchor)
        ])
    }
    
    private func setupActions() {
        refreshControl.addTarget(self, action: #selector(refresh), for: .valueChanged)
        viewAllButton.addTarget(self, action: #selector(viewAllTapped), for: .touchUpInside)
    }
    
    private func createQuickActionButton(title: String, icon: String) -> UIView {
        let container = UIView()
        container.backgroundColor = .secondarySystemBackground
        container.layer.cornerRadius = 12
        
        let stack = UIStackView()
        stack.axis = .vertical
        stack.alignment = .center
        stack.spacing = 8
        stack.translatesAutoresizingMaskIntoConstraints = false
        
        let imageView = UIImageView(image: UIImage(systemName: icon))
        imageView.tintColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        imageView.contentMode = .scaleAspectFit
        
        let label = UILabel()
        label.text = title
        label.font = .systemFont(ofSize: 12, weight: .medium)
        label.textColor = .label
        
        stack.addArrangedSubview(imageView)
        stack.addArrangedSubview(label)
        
        container.addSubview(stack)
        
        NSLayoutConstraint.activate([
            stack.centerXAnchor.constraint(equalTo: container.centerXAnchor),
            stack.centerYAnchor.constraint(equalTo: container.centerYAnchor),
            imageView.widthAnchor.constraint(equalToConstant: 28),
            imageView.heightAnchor.constraint(equalToConstant: 28)
        ])
        
        return container
    }
    
    private func updateGreeting() {
        let hour = Calendar.current.component(.hour, from: Date())
        let greeting: String
        
        switch hour {
        case 0..<12:
            greeting = "Good Morning"
        case 12..<17:
            greeting = "Good Afternoon"
        default:
            greeting = "Good Evening"
        }
        
        let userName = TokenManager.shared.currentUser?.name.components(separatedBy: " ").first ?? "User"
        greetingLabel.text = "\(greeting), \(userName)!"
    }
    
    // MARK: - Data Loading
    
    private func loadData() {
        loadWalletBalance()
        loadFeaturedProjects()
    }
    
    private func loadWalletBalance() {
        APIManager.shared.getWalletBalance { [weak self] result in
            switch result {
            case .success(let response):
                self?.walletBalance = response.data
                self?.updateBalanceUI()
            case .failure(let error):
                print("Failed to load balance: \(error)")
            }
        }
    }
    
    private func loadFeaturedProjects() {
        APIManager.shared.getProjects { [weak self] result in
            self?.refreshControl.endRefreshing()
            
            switch result {
            case .success(let response):
                self?.featuredProjects = Array(response.projects.prefix(3))
                self?.updateProjectsUI()
            case .failure(let error):
                print("Failed to load projects: \(error)")
                self?.emptyProjectsLabel.isHidden = false
            }
        }
    }
    
    private func updateBalanceUI() {
        guard let balance = walletBalance else { return }
        
        amountLabel.text = String(format: "GH₵ %.2f", balance.balance)
        investedLabel.text = String(format: "Total Invested: GH₵ %.2f", balance.totalInvested)
        earningsLabel.text = String(format: "Total Earnings: GH₵ %.2f", balance.totalEarnings)
    }
    
    private func updateProjectsUI() {
        // Clear existing views
        projectsStackView.arrangedSubviews.forEach { $0.removeFromSuperview() }
        
        if featuredProjects.isEmpty {
            emptyProjectsLabel.isHidden = false
            return
        }
        
        emptyProjectsLabel.isHidden = true
        
        for project in featuredProjects {
            let card = createProjectCard(project: project)
            projectsStackView.addArrangedSubview(card)
        }
    }
    
    private func createProjectCard(project: Project) -> UIView {
        let card = UIView()
        card.backgroundColor = .secondarySystemBackground
        card.layer.cornerRadius = 12
        
        let nameLabel = UILabel()
        nameLabel.text = project.name
        nameLabel.font = .systemFont(ofSize: 16, weight: .semibold)
        nameLabel.translatesAutoresizingMaskIntoConstraints = false
        
        let categoryLabel = UILabel()
        categoryLabel.text = project.category
        categoryLabel.font = .systemFont(ofSize: 13)
        categoryLabel.textColor = .secondaryLabel
        categoryLabel.translatesAutoresizingMaskIntoConstraints = false
        
        let returnLabel = UILabel()
        returnLabel.text = String(format: "%.1f%% return", project.returnRate)
        returnLabel.font = .systemFont(ofSize: 14, weight: .medium)
        returnLabel.textColor = UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0)
        returnLabel.translatesAutoresizingMaskIntoConstraints = false
        
        let progressView = UIProgressView(progressViewStyle: .default)
        progressView.progress = Float(project.fundingProgress)
        progressView.tintColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        progressView.translatesAutoresizingMaskIntoConstraints = false
        
        let progressLabel = UILabel()
        progressLabel.text = "\(project.fundingPercentage)% funded"
        progressLabel.font = .systemFont(ofSize: 12)
        progressLabel.textColor = .secondaryLabel
        progressLabel.translatesAutoresizingMaskIntoConstraints = false
        
        card.addSubview(nameLabel)
        card.addSubview(categoryLabel)
        card.addSubview(returnLabel)
        card.addSubview(progressView)
        card.addSubview(progressLabel)
        
        NSLayoutConstraint.activate([
            nameLabel.topAnchor.constraint(equalTo: card.topAnchor, constant: 16),
            nameLabel.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 16),
            nameLabel.trailingAnchor.constraint(lessThanOrEqualTo: returnLabel.leadingAnchor, constant: -8),
            
            categoryLabel.topAnchor.constraint(equalTo: nameLabel.bottomAnchor, constant: 4),
            categoryLabel.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 16),
            
            returnLabel.topAnchor.constraint(equalTo: card.topAnchor, constant: 16),
            returnLabel.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -16),
            
            progressView.topAnchor.constraint(equalTo: categoryLabel.bottomAnchor, constant: 12),
            progressView.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 16),
            progressView.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -16),
            
            progressLabel.topAnchor.constraint(equalTo: progressView.bottomAnchor, constant: 4),
            progressLabel.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 16),
            progressLabel.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -16)
        ])
        
        // Add tap gesture
        let tap = UITapGestureRecognizer(target: self, action: #selector(projectTapped(_:)))
        card.addGestureRecognizer(tap)
        card.isUserInteractionEnabled = true
        card.tag = featuredProjects.firstIndex(where: { $0.id == project.id }) ?? 0
        
        return card
    }
    
    // MARK: - Actions
    
    @objc private func refresh() {
        loadData()
    }
    
    @objc private func viewAllTapped() {
        tabBarController?.selectedIndex = 1 // Projects tab
    }
    
    @objc private func projectTapped(_ sender: UITapGestureRecognizer) {
        guard let view = sender.view else { return }
        let project = featuredProjects[view.tag]
        
        let detailVC = ProjectDetailViewController(project: project)
        navigationController?.pushViewController(detailVC, animated: true)
    }
}
