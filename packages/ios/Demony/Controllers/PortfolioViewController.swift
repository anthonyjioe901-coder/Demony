import UIKit

class PortfolioViewController: UIViewController {
    
    // MARK: - Properties
    
    private var portfolio: Portfolio?
    
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
    
    private let refreshControl = UIRefreshControl()
    
    private let valueCard: UIView = {
        let view = UIView()
        view.backgroundColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        view.layer.cornerRadius = 16
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()
    
    private let valueTitleLabel: UILabel = {
        let label = UILabel()
        label.text = "Total Portfolio Value"
        label.font = .systemFont(ofSize: 14)
        label.textColor = .white.withAlphaComponent(0.8)
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let valueAmountLabel: UILabel = {
        let label = UILabel()
        label.text = "GH₵ 0.00"
        label.font = .systemFont(ofSize: 36, weight: .bold)
        label.textColor = .white
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let returnLabel: UILabel = {
        let label = UILabel()
        label.text = "+0.0% return"
        label.font = .systemFont(ofSize: 14, weight: .medium)
        label.textColor = .white
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let statsStack: UIStackView = {
        let stack = UIStackView()
        stack.axis = .horizontal
        stack.distribution = .fillEqually
        stack.spacing = 12
        stack.translatesAutoresizingMaskIntoConstraints = false
        return stack
    }()
    
    private let investmentsTitleLabel: UILabel = {
        let label = UILabel()
        label.text = "Your Investments"
        label.font = .systemFont(ofSize: 20, weight: .bold)
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let investmentsStack: UIStackView = {
        let stack = UIStackView()
        stack.axis = .vertical
        stack.spacing = 12
        stack.translatesAutoresizingMaskIntoConstraints = false
        return stack
    }()
    
    private let emptyLabel: UILabel = {
        let label = UILabel()
        label.text = "No investments in portfolio"
        label.font = .systemFont(ofSize: 16)
        label.textColor = .secondaryLabel
        label.textAlignment = .center
        label.isHidden = true
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let activityIndicator: UIActivityIndicatorView = {
        let ai = UIActivityIndicatorView(style: .large)
        ai.hidesWhenStopped = true
        ai.translatesAutoresizingMaskIntoConstraints = false
        return ai
    }()
    
    // MARK: - Lifecycle
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        loadPortfolio()
    }
    
    // MARK: - Setup
    
    private func setupUI() {
        view.backgroundColor = .systemBackground
        title = "Portfolio"
        navigationController?.navigationBar.prefersLargeTitles = true
        
        view.addSubview(scrollView)
        scrollView.addSubview(contentView)
        scrollView.refreshControl = refreshControl
        refreshControl.addTarget(self, action: #selector(refresh), for: .valueChanged)
        
        contentView.addSubview(valueCard)
        valueCard.addSubview(valueTitleLabel)
        valueCard.addSubview(valueAmountLabel)
        valueCard.addSubview(returnLabel)
        
        contentView.addSubview(statsStack)
        contentView.addSubview(investmentsTitleLabel)
        contentView.addSubview(investmentsStack)
        contentView.addSubview(emptyLabel)
        
        view.addSubview(activityIndicator)
        
        // Stats cards
        let investedCard = createStatCard(title: "Invested", value: "GH₵ 0", tag: 100)
        let earningsCard = createStatCard(title: "Earnings", value: "GH₵ 0", tag: 101)
        statsStack.addArrangedSubview(investedCard)
        statsStack.addArrangedSubview(earningsCard)
        
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
            
            valueCard.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 16),
            valueCard.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            valueCard.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            
            valueTitleLabel.topAnchor.constraint(equalTo: valueCard.topAnchor, constant: 20),
            valueTitleLabel.leadingAnchor.constraint(equalTo: valueCard.leadingAnchor, constant: 20),
            
            valueAmountLabel.topAnchor.constraint(equalTo: valueTitleLabel.bottomAnchor, constant: 8),
            valueAmountLabel.leadingAnchor.constraint(equalTo: valueCard.leadingAnchor, constant: 20),
            
            returnLabel.topAnchor.constraint(equalTo: valueAmountLabel.bottomAnchor, constant: 8),
            returnLabel.leadingAnchor.constraint(equalTo: valueCard.leadingAnchor, constant: 20),
            returnLabel.bottomAnchor.constraint(equalTo: valueCard.bottomAnchor, constant: -20),
            
            statsStack.topAnchor.constraint(equalTo: valueCard.bottomAnchor, constant: 16),
            statsStack.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            statsStack.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            statsStack.heightAnchor.constraint(equalToConstant: 80),
            
            investmentsTitleLabel.topAnchor.constraint(equalTo: statsStack.bottomAnchor, constant: 24),
            investmentsTitleLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            
            investmentsStack.topAnchor.constraint(equalTo: investmentsTitleLabel.bottomAnchor, constant: 16),
            investmentsStack.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            investmentsStack.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            investmentsStack.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -24),
            
            emptyLabel.topAnchor.constraint(equalTo: investmentsTitleLabel.bottomAnchor, constant: 32),
            emptyLabel.centerXAnchor.constraint(equalTo: contentView.centerXAnchor),
            
            activityIndicator.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            activityIndicator.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
    }
    
    private func createStatCard(title: String, value: String, tag: Int) -> UIView {
        let card = UIView()
        card.backgroundColor = .secondarySystemBackground
        card.layer.cornerRadius = 12
        
        let iconView = UIImageView()
        iconView.image = title == "Invested" ? UIImage(systemName: "chart.line.uptrend.xyaxis") : UIImage(systemName: "dollarsign.circle.fill")
        iconView.tintColor = title == "Invested" ? UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0) : UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0)
        iconView.translatesAutoresizingMaskIntoConstraints = false
        
        let titleLabel = UILabel()
        titleLabel.text = title
        titleLabel.font = .systemFont(ofSize: 13)
        titleLabel.textColor = .secondaryLabel
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        
        let valueLabel = UILabel()
        valueLabel.text = value
        valueLabel.font = .systemFont(ofSize: 17, weight: .semibold)
        valueLabel.tag = tag
        valueLabel.translatesAutoresizingMaskIntoConstraints = false
        
        card.addSubview(iconView)
        card.addSubview(titleLabel)
        card.addSubview(valueLabel)
        
        NSLayoutConstraint.activate([
            iconView.topAnchor.constraint(equalTo: card.topAnchor, constant: 16),
            iconView.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 16),
            iconView.widthAnchor.constraint(equalToConstant: 24),
            iconView.heightAnchor.constraint(equalToConstant: 24),
            
            titleLabel.topAnchor.constraint(equalTo: iconView.bottomAnchor, constant: 8),
            titleLabel.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 16),
            
            valueLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 4),
            valueLabel.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 16)
        ])
        
        return card
    }
    
    // MARK: - Data Loading
    
    private func loadPortfolio() {
        activityIndicator.startAnimating()
        
        APIManager.shared.getPortfolio { [weak self] result in
            self?.activityIndicator.stopAnimating()
            self?.refreshControl.endRefreshing()
            
            switch result {
            case .success(let response):
                self?.portfolio = response.portfolio
                self?.updateUI()
            case .failure(let error):
                print("Failed to load portfolio: \(error)")
            }
        }
    }
    
    private func updateUI() {
        guard let portfolio = portfolio else { return }
        
        valueAmountLabel.text = String(format: "GH₵ %.2f", portfolio.totalValue)
        returnLabel.text = String(format: "%+.1f%% return", portfolio.returnPercentage)
        
        if let investedLabel = view.viewWithTag(100) as? UILabel {
            investedLabel.text = String(format: "GH₵ %.2f", portfolio.totalInvested)
        }
        
        if let earningsLabel = view.viewWithTag(101) as? UILabel {
            earningsLabel.text = String(format: "GH₵ %.2f", portfolio.totalEarnings)
        }
        
        updateInvestmentsUI(portfolio.investments)
    }
    
    private func updateInvestmentsUI(_ investments: [Investment]) {
        investmentsStack.arrangedSubviews.forEach { $0.removeFromSuperview() }
        
        if investments.isEmpty {
            emptyLabel.isHidden = false
            return
        }
        
        emptyLabel.isHidden = true
        
        for investment in investments {
            let card = createInvestmentCard(investment: investment)
            investmentsStack.addArrangedSubview(card)
        }
    }
    
    private func createInvestmentCard(investment: Investment) -> UIView {
        let card = UIView()
        card.backgroundColor = .secondarySystemBackground
        card.layer.cornerRadius = 12
        card.translatesAutoresizingMaskIntoConstraints = false
        
        let nameLabel = UILabel()
        nameLabel.text = investment.projectName
        nameLabel.font = .systemFont(ofSize: 16, weight: .semibold)
        nameLabel.translatesAutoresizingMaskIntoConstraints = false
        
        let categoryLabel = UILabel()
        categoryLabel.text = investment.category
        categoryLabel.font = .systemFont(ofSize: 13)
        categoryLabel.textColor = .secondaryLabel
        categoryLabel.translatesAutoresizingMaskIntoConstraints = false
        
        let valueLabel = UILabel()
        valueLabel.text = String(format: "GH₵ %.2f", investment.totalValue)
        valueLabel.font = .systemFont(ofSize: 16, weight: .bold)
        valueLabel.textColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        valueLabel.translatesAutoresizingMaskIntoConstraints = false
        
        let returnLabel = UILabel()
        returnLabel.text = String(format: "%+.1f%%", investment.returnPercentage)
        returnLabel.font = .systemFont(ofSize: 13, weight: .medium)
        returnLabel.textColor = UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0)
        returnLabel.translatesAutoresizingMaskIntoConstraints = false
        
        let statusBadge = UILabel()
        statusBadge.text = "  \(investment.status.capitalized)  "
        statusBadge.font = .systemFont(ofSize: 11, weight: .medium)
        statusBadge.backgroundColor = investment.status == "active" ? UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 0.1) : .secondarySystemBackground
        statusBadge.textColor = investment.status == "active" ? UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0) : .secondaryLabel
        statusBadge.layer.cornerRadius = 6
        statusBadge.clipsToBounds = true
        statusBadge.translatesAutoresizingMaskIntoConstraints = false
        
        card.addSubview(nameLabel)
        card.addSubview(categoryLabel)
        card.addSubview(valueLabel)
        card.addSubview(returnLabel)
        card.addSubview(statusBadge)
        
        NSLayoutConstraint.activate([
            card.heightAnchor.constraint(equalToConstant: 80),
            
            nameLabel.topAnchor.constraint(equalTo: card.topAnchor, constant: 16),
            nameLabel.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 16),
            nameLabel.trailingAnchor.constraint(lessThanOrEqualTo: valueLabel.leadingAnchor, constant: -8),
            
            categoryLabel.topAnchor.constraint(equalTo: nameLabel.bottomAnchor, constant: 4),
            categoryLabel.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 16),
            
            statusBadge.topAnchor.constraint(equalTo: categoryLabel.bottomAnchor, constant: 4),
            statusBadge.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 16),
            
            valueLabel.topAnchor.constraint(equalTo: card.topAnchor, constant: 16),
            valueLabel.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -16),
            
            returnLabel.topAnchor.constraint(equalTo: valueLabel.bottomAnchor, constant: 4),
            returnLabel.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -16)
        ])
        
        return card
    }
    
    // MARK: - Actions
    
    @objc private func refresh() {
        loadPortfolio()
    }
}
