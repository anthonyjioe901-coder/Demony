import UIKit

class WalletViewController: UIViewController {
    
    // MARK: - Properties
    
    private var walletBalance: WalletBalance?
    private var transactions: [Transaction] = []
    
    // MARK: - UI Components
    
    private let scrollView: UIScrollView = {
        let sv = UIScrollView()
        sv.translatesAutoresizingMaskIntoConstraints = false
        sv.alwaysBounceVertical = true
        return sv
    }()
    
    private let contentView: UIView = {
        let view = UIView()
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()
    
    private let refreshControl = UIRefreshControl()
    
    private let balanceCard: UIView = {
        let view = UIView()
        view.backgroundColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        view.layer.cornerRadius = 16
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()
    
    private let balanceTitleLabel: UILabel = {
        let label = UILabel()
        label.text = "Available Balance"
        label.font = .systemFont(ofSize: 14)
        label.textColor = .white.withAlphaComponent(0.8)
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let balanceAmountLabel: UILabel = {
        let label = UILabel()
        label.text = "GH₵ 0.00"
        label.font = .systemFont(ofSize: 36, weight: .bold)
        label.textColor = .white
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let statsStack: UIStackView = {
        let stack = UIStackView()
        stack.axis = .horizontal
        stack.distribution = .fillEqually
        stack.spacing = 16
        stack.translatesAutoresizingMaskIntoConstraints = false
        return stack
    }()
    
    private let actionsStack: UIStackView = {
        let stack = UIStackView()
        stack.axis = .horizontal
        stack.distribution = .fillEqually
        stack.spacing = 12
        stack.translatesAutoresizingMaskIntoConstraints = false
        return stack
    }()
    
    private let transactionsLabel: UILabel = {
        let label = UILabel()
        label.text = "Transaction History"
        label.font = .systemFont(ofSize: 20, weight: .bold)
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let transactionsStack: UIStackView = {
        let stack = UIStackView()
        stack.axis = .vertical
        stack.spacing = 8
        stack.translatesAutoresizingMaskIntoConstraints = false
        return stack
    }()
    
    private let emptyLabel: UILabel = {
        let label = UILabel()
        label.text = "No transactions yet"
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
        setupActions()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        loadData()
    }
    
    // MARK: - Setup
    
    private func setupUI() {
        view.backgroundColor = .systemBackground
        title = "Wallet"
        navigationController?.navigationBar.prefersLargeTitles = true
        
        view.addSubview(scrollView)
        scrollView.addSubview(contentView)
        scrollView.refreshControl = refreshControl
        
        contentView.addSubview(balanceCard)
        balanceCard.addSubview(balanceTitleLabel)
        balanceCard.addSubview(balanceAmountLabel)
        balanceCard.addSubview(statsStack)
        
        contentView.addSubview(actionsStack)
        contentView.addSubview(transactionsLabel)
        contentView.addSubview(transactionsStack)
        contentView.addSubview(emptyLabel)
        
        view.addSubview(activityIndicator)
        
        // Stats labels
        let investedView = createStatView(title: "Invested", value: "GH₵ 0")
        let earningsView = createStatView(title: "Earnings", value: "GH₵ 0")
        statsStack.addArrangedSubview(investedView)
        statsStack.addArrangedSubview(earningsView)
        
        // Action buttons
        let depositButton = createActionButton(title: "Deposit", icon: "plus.circle.fill", action: #selector(depositTapped))
        let withdrawButton = createActionButton(title: "Withdraw", icon: "arrow.down.circle.fill", action: #selector(withdrawTapped))
        actionsStack.addArrangedSubview(depositButton)
        actionsStack.addArrangedSubview(withdrawButton)
        
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
            
            balanceCard.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 16),
            balanceCard.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            balanceCard.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            
            balanceTitleLabel.topAnchor.constraint(equalTo: balanceCard.topAnchor, constant: 20),
            balanceTitleLabel.leadingAnchor.constraint(equalTo: balanceCard.leadingAnchor, constant: 20),
            
            balanceAmountLabel.topAnchor.constraint(equalTo: balanceTitleLabel.bottomAnchor, constant: 8),
            balanceAmountLabel.leadingAnchor.constraint(equalTo: balanceCard.leadingAnchor, constant: 20),
            
            statsStack.topAnchor.constraint(equalTo: balanceAmountLabel.bottomAnchor, constant: 20),
            statsStack.leadingAnchor.constraint(equalTo: balanceCard.leadingAnchor, constant: 20),
            statsStack.trailingAnchor.constraint(equalTo: balanceCard.trailingAnchor, constant: -20),
            statsStack.bottomAnchor.constraint(equalTo: balanceCard.bottomAnchor, constant: -20),
            
            actionsStack.topAnchor.constraint(equalTo: balanceCard.bottomAnchor, constant: 24),
            actionsStack.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            actionsStack.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            actionsStack.heightAnchor.constraint(equalToConstant: 50),
            
            transactionsLabel.topAnchor.constraint(equalTo: actionsStack.bottomAnchor, constant: 32),
            transactionsLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            
            transactionsStack.topAnchor.constraint(equalTo: transactionsLabel.bottomAnchor, constant: 16),
            transactionsStack.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            transactionsStack.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            transactionsStack.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -24),
            
            emptyLabel.topAnchor.constraint(equalTo: transactionsLabel.bottomAnchor, constant: 32),
            emptyLabel.centerXAnchor.constraint(equalTo: contentView.centerXAnchor),
            
            activityIndicator.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            activityIndicator.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
    }
    
    private func setupActions() {
        refreshControl.addTarget(self, action: #selector(refresh), for: .valueChanged)
    }
    
    private func createStatView(title: String, value: String) -> UIView {
        let container = UIView()
        
        let titleLabel = UILabel()
        titleLabel.text = title
        titleLabel.font = .systemFont(ofSize: 12)
        titleLabel.textColor = .white.withAlphaComponent(0.7)
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        
        let valueLabel = UILabel()
        valueLabel.text = value
        valueLabel.font = .systemFont(ofSize: 16, weight: .semibold)
        valueLabel.textColor = .white
        valueLabel.tag = title == "Invested" ? 100 : 101
        valueLabel.translatesAutoresizingMaskIntoConstraints = false
        
        container.addSubview(titleLabel)
        container.addSubview(valueLabel)
        
        NSLayoutConstraint.activate([
            titleLabel.topAnchor.constraint(equalTo: container.topAnchor),
            titleLabel.leadingAnchor.constraint(equalTo: container.leadingAnchor),
            
            valueLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 4),
            valueLabel.leadingAnchor.constraint(equalTo: container.leadingAnchor),
            valueLabel.bottomAnchor.constraint(equalTo: container.bottomAnchor)
        ])
        
        return container
    }
    
    private func createActionButton(title: String, icon: String, action: Selector) -> UIButton {
        let button = UIButton(type: .system)
        button.setTitle(" \(title)", for: .normal)
        button.setImage(UIImage(systemName: icon), for: .normal)
        button.titleLabel?.font = .systemFont(ofSize: 16, weight: .semibold)
        button.layer.cornerRadius = 12
        button.addTarget(self, action: action, for: .touchUpInside)
        
        if title == "Deposit" {
            button.backgroundColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
            button.tintColor = .white
            button.setTitleColor(.white, for: .normal)
        } else {
            button.backgroundColor = .secondarySystemBackground
            button.tintColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        }
        
        return button
    }
    
    // MARK: - Data Loading
    
    private func loadData() {
        activityIndicator.startAnimating()
        
        let group = DispatchGroup()
        
        group.enter()
        APIManager.shared.getWalletBalance { [weak self] result in
            defer { group.leave() }
            switch result {
            case .success(let response):
                self?.walletBalance = response.data
            case .failure(let error):
                print("Failed to load balance: \(error)")
            }
        }
        
        group.enter()
        APIManager.shared.getTransactions { [weak self] result in
            defer { group.leave() }
            switch result {
            case .success(let response):
                self?.transactions = response.transactions
            case .failure(let error):
                print("Failed to load transactions: \(error)")
            }
        }
        
        group.notify(queue: .main) { [weak self] in
            self?.activityIndicator.stopAnimating()
            self?.refreshControl.endRefreshing()
            self?.updateUI()
        }
    }
    
    private func updateUI() {
        if let balance = walletBalance {
            balanceAmountLabel.text = String(format: "GH₵ %.2f", balance.balance)
            
            if let investedLabel = statsStack.arrangedSubviews[0].viewWithTag(100) as? UILabel {
                investedLabel.text = String(format: "GH₵ %.2f", balance.totalInvested)
            }
            
            if let earningsLabel = statsStack.arrangedSubviews[1].viewWithTag(101) as? UILabel {
                earningsLabel.text = String(format: "GH₵ %.2f", balance.totalEarnings)
            }
        }
        
        updateTransactionsUI()
    }
    
    private func updateTransactionsUI() {
        transactionsStack.arrangedSubviews.forEach { $0.removeFromSuperview() }
        
        if transactions.isEmpty {
            emptyLabel.isHidden = false
            return
        }
        
        emptyLabel.isHidden = true
        
        for transaction in transactions.prefix(10) {
            let row = createTransactionRow(transaction: transaction)
            transactionsStack.addArrangedSubview(row)
        }
    }
    
    private func createTransactionRow(transaction: Transaction) -> UIView {
        let row = UIView()
        row.backgroundColor = .secondarySystemBackground
        row.layer.cornerRadius = 12
        row.translatesAutoresizingMaskIntoConstraints = false
        
        let iconView = UIImageView()
        iconView.contentMode = .scaleAspectFit
        iconView.translatesAutoresizingMaskIntoConstraints = false
        
        switch transaction.type {
        case "deposit":
            iconView.image = UIImage(systemName: "plus.circle.fill")
            iconView.tintColor = UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0)
        case "withdrawal":
            iconView.image = UIImage(systemName: "arrow.down.circle.fill")
            iconView.tintColor = .systemRed
        case "investment":
            iconView.image = UIImage(systemName: "chart.line.uptrend.xyaxis")
            iconView.tintColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        case "profit":
            iconView.image = UIImage(systemName: "dollarsign.circle.fill")
            iconView.tintColor = UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0)
        default:
            iconView.image = UIImage(systemName: "arrow.left.arrow.right.circle.fill")
            iconView.tintColor = .secondaryLabel
        }
        
        let titleLabel = UILabel()
        titleLabel.text = transaction.type.capitalized
        titleLabel.font = .systemFont(ofSize: 16, weight: .medium)
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        
        let dateLabel = UILabel()
        dateLabel.text = transaction.createdAt?.prefix(10).description ?? ""
        dateLabel.font = .systemFont(ofSize: 13)
        dateLabel.textColor = .secondaryLabel
        dateLabel.translatesAutoresizingMaskIntoConstraints = false
        
        let amountLabel = UILabel()
        let isPositive = transaction.type == "deposit" || transaction.type == "profit"
        amountLabel.text = String(format: "%@GH₵ %.2f", isPositive ? "+" : "-", transaction.amount)
        amountLabel.font = .systemFont(ofSize: 16, weight: .semibold)
        amountLabel.textColor = isPositive ? UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0) : .systemRed
        amountLabel.translatesAutoresizingMaskIntoConstraints = false
        
        let statusLabel = UILabel()
        statusLabel.text = transaction.status.capitalized
        statusLabel.font = .systemFont(ofSize: 12)
        statusLabel.textColor = .secondaryLabel
        statusLabel.translatesAutoresizingMaskIntoConstraints = false
        
        row.addSubview(iconView)
        row.addSubview(titleLabel)
        row.addSubview(dateLabel)
        row.addSubview(amountLabel)
        row.addSubview(statusLabel)
        
        NSLayoutConstraint.activate([
            row.heightAnchor.constraint(equalToConstant: 72),
            
            iconView.leadingAnchor.constraint(equalTo: row.leadingAnchor, constant: 16),
            iconView.centerYAnchor.constraint(equalTo: row.centerYAnchor),
            iconView.widthAnchor.constraint(equalToConstant: 32),
            iconView.heightAnchor.constraint(equalToConstant: 32),
            
            titleLabel.topAnchor.constraint(equalTo: row.topAnchor, constant: 16),
            titleLabel.leadingAnchor.constraint(equalTo: iconView.trailingAnchor, constant: 12),
            
            dateLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 4),
            dateLabel.leadingAnchor.constraint(equalTo: iconView.trailingAnchor, constant: 12),
            
            amountLabel.topAnchor.constraint(equalTo: row.topAnchor, constant: 16),
            amountLabel.trailingAnchor.constraint(equalTo: row.trailingAnchor, constant: -16),
            
            statusLabel.topAnchor.constraint(equalTo: amountLabel.bottomAnchor, constant: 4),
            statusLabel.trailingAnchor.constraint(equalTo: row.trailingAnchor, constant: -16)
        ])
        
        return row
    }
    
    // MARK: - Actions
    
    @objc private func refresh() {
        loadData()
    }
    
    @objc private func depositTapped() {
        let alert = UIAlertController(
            title: "Deposit Funds",
            message: "Enter the amount you want to deposit (minimum GH₵ 10)",
            preferredStyle: .alert
        )
        
        alert.addTextField { textField in
            textField.placeholder = "Amount (GH₵)"
            textField.keyboardType = .decimalPad
        }
        
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        alert.addAction(UIAlertAction(title: "Continue", style: .default) { [weak self, weak alert] _ in
            guard let text = alert?.textFields?.first?.text,
                  let amount = Double(text),
                  amount >= 10 else {
                self?.showError("Please enter a valid amount (minimum GH₵ 10)")
                return
            }
            
            self?.initiateDeposit(amount: amount)
        })
        
        present(alert, animated: true)
    }
    
    private func initiateDeposit(amount: Double) {
        APIManager.shared.initializeDeposit(amount: amount) { [weak self] result in
            switch result {
            case .success(let response):
                if let url = response.authorizationUrl, let paymentUrl = URL(string: url) {
                    UIApplication.shared.open(paymentUrl)
                } else {
                    self?.showError(response.message ?? "Failed to initialize payment")
                }
            case .failure(let error):
                self?.showError(error.localizedDescription)
            }
        }
    }
    
    @objc private func withdrawTapped() {
        let alert = UIAlertController(
            title: "Withdraw Funds",
            message: "Withdrawal feature allows you to transfer funds to your bank account.",
            preferredStyle: .alert
        )
        
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
    
    private func showError(_ message: String) {
        let alert = UIAlertController(title: "Error", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
}
