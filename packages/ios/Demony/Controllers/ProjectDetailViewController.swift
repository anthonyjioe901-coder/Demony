import UIKit

class ProjectDetailViewController: UIViewController {
    
    // MARK: - Properties
    
    private let project: Project
    private var walletBalance: Double = 0
    
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
    
    private let headerImageView: UIImageView = {
        let iv = UIImageView()
        iv.contentMode = .scaleAspectFill
        iv.backgroundColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 0.1)
        iv.clipsToBounds = true
        iv.translatesAutoresizingMaskIntoConstraints = false
        return iv
    }()
    
    private let categoryBadge: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 12, weight: .medium)
        label.textColor = .white
        label.backgroundColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        label.layer.cornerRadius = 8
        label.clipsToBounds = true
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let nameLabel: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 24, weight: .bold)
        label.numberOfLines = 0
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let descriptionLabel: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 15)
        label.textColor = .secondaryLabel
        label.numberOfLines = 0
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let fundingCard: UIView = {
        let view = UIView()
        view.backgroundColor = .secondarySystemBackground
        view.layer.cornerRadius = 12
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()
    
    private let progressView: UIProgressView = {
        let pv = UIProgressView(progressViewStyle: .default)
        pv.tintColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        pv.layer.cornerRadius = 4
        pv.clipsToBounds = true
        pv.translatesAutoresizingMaskIntoConstraints = false
        return pv
    }()
    
    private let raisedLabel: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 14)
        label.textColor = .secondaryLabel
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let targetLabel: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 14)
        label.textColor = .secondaryLabel
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let detailsStack: UIStackView = {
        let stack = UIStackView()
        stack.axis = .vertical
        stack.spacing = 16
        stack.translatesAutoresizingMaskIntoConstraints = false
        return stack
    }()
    
    private let investButton: UIButton = {
        let button = UIButton(type: .system)
        button.setTitle("Invest Now", for: .normal)
        button.setTitleColor(.white, for: .normal)
        button.titleLabel?.font = .systemFont(ofSize: 17, weight: .semibold)
        button.backgroundColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        button.layer.cornerRadius = 12
        button.translatesAutoresizingMaskIntoConstraints = false
        return button
    }()
    
    // MARK: - Init
    
    init(project: Project) {
        self.project = project
        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    // MARK: - Lifecycle
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        configureWithProject()
        loadWalletBalance()
    }
    
    // MARK: - Setup
    
    private func setupUI() {
        view.backgroundColor = .systemBackground
        title = "Project Details"
        
        view.addSubview(scrollView)
        scrollView.addSubview(contentView)
        
        contentView.addSubview(headerImageView)
        contentView.addSubview(categoryBadge)
        contentView.addSubview(nameLabel)
        contentView.addSubview(descriptionLabel)
        contentView.addSubview(fundingCard)
        fundingCard.addSubview(progressView)
        fundingCard.addSubview(raisedLabel)
        fundingCard.addSubview(targetLabel)
        contentView.addSubview(detailsStack)
        
        view.addSubview(investButton)
        
        investButton.addTarget(self, action: #selector(investTapped), for: .touchUpInside)
        
        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: investButton.topAnchor, constant: -16),
            
            contentView.topAnchor.constraint(equalTo: scrollView.topAnchor),
            contentView.leadingAnchor.constraint(equalTo: scrollView.leadingAnchor),
            contentView.trailingAnchor.constraint(equalTo: scrollView.trailingAnchor),
            contentView.bottomAnchor.constraint(equalTo: scrollView.bottomAnchor),
            contentView.widthAnchor.constraint(equalTo: scrollView.widthAnchor),
            
            headerImageView.topAnchor.constraint(equalTo: contentView.topAnchor),
            headerImageView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
            headerImageView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
            headerImageView.heightAnchor.constraint(equalToConstant: 200),
            
            categoryBadge.topAnchor.constraint(equalTo: headerImageView.bottomAnchor, constant: 16),
            categoryBadge.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            categoryBadge.heightAnchor.constraint(equalToConstant: 24),
            categoryBadge.widthAnchor.constraint(greaterThanOrEqualToConstant: 80),
            
            nameLabel.topAnchor.constraint(equalTo: categoryBadge.bottomAnchor, constant: 12),
            nameLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            nameLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            
            descriptionLabel.topAnchor.constraint(equalTo: nameLabel.bottomAnchor, constant: 12),
            descriptionLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            descriptionLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            
            fundingCard.topAnchor.constraint(equalTo: descriptionLabel.bottomAnchor, constant: 24),
            fundingCard.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            fundingCard.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            
            progressView.topAnchor.constraint(equalTo: fundingCard.topAnchor, constant: 16),
            progressView.leadingAnchor.constraint(equalTo: fundingCard.leadingAnchor, constant: 16),
            progressView.trailingAnchor.constraint(equalTo: fundingCard.trailingAnchor, constant: -16),
            progressView.heightAnchor.constraint(equalToConstant: 8),
            
            raisedLabel.topAnchor.constraint(equalTo: progressView.bottomAnchor, constant: 12),
            raisedLabel.leadingAnchor.constraint(equalTo: fundingCard.leadingAnchor, constant: 16),
            raisedLabel.bottomAnchor.constraint(equalTo: fundingCard.bottomAnchor, constant: -16),
            
            targetLabel.topAnchor.constraint(equalTo: progressView.bottomAnchor, constant: 12),
            targetLabel.trailingAnchor.constraint(equalTo: fundingCard.trailingAnchor, constant: -16),
            
            detailsStack.topAnchor.constraint(equalTo: fundingCard.bottomAnchor, constant: 24),
            detailsStack.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            detailsStack.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            detailsStack.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -24),
            
            investButton.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
            investButton.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),
            investButton.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -16),
            investButton.heightAnchor.constraint(equalToConstant: 50)
        ])
    }
    
    private func configureWithProject() {
        categoryBadge.text = "  \(project.category)  "
        nameLabel.text = project.name
        descriptionLabel.text = project.description
        
        progressView.progress = Float(project.fundingProgress)
        raisedLabel.text = String(format: "Raised: GH₵ %.0f", project.raisedAmount)
        targetLabel.text = String(format: "Target: GH₵ %.0f", project.targetAmount)
        
        // Add detail rows
        addDetailRow(title: "Return Rate", value: String(format: "%.1f%%", project.returnRate))
        addDetailRow(title: "Return Period", value: project.returnPeriod)
        addDetailRow(title: "Lock-in Period", value: "\(project.lockInPeriodMonths) months")
        addDetailRow(title: "Minimum Investment", value: String(format: "GH₵ %.0f", project.minimumInvestment))
        if let maxInvestment = project.maximumInvestment {
            addDetailRow(title: "Maximum Investment", value: String(format: "GH₵ %.0f", maxInvestment))
        }
        addDetailRow(title: "Risk Level", value: project.riskLevel.capitalized)
        addDetailRow(title: "Status", value: project.status.capitalized)
        
        // Load image if available
        if let imageUrl = project.image, let url = URL(string: imageUrl) {
            loadImage(from: url)
        } else {
            headerImageView.image = UIImage(systemName: "building.2.fill")
            headerImageView.tintColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
            headerImageView.contentMode = .scaleAspectFit
        }
    }
    
    private func addDetailRow(title: String, value: String) {
        let row = UIView()
        row.translatesAutoresizingMaskIntoConstraints = false
        
        let titleLabel = UILabel()
        titleLabel.text = title
        titleLabel.font = .systemFont(ofSize: 15)
        titleLabel.textColor = .secondaryLabel
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        
        let valueLabel = UILabel()
        valueLabel.text = value
        valueLabel.font = .systemFont(ofSize: 15, weight: .medium)
        valueLabel.textAlignment = .right
        valueLabel.translatesAutoresizingMaskIntoConstraints = false
        
        row.addSubview(titleLabel)
        row.addSubview(valueLabel)
        
        NSLayoutConstraint.activate([
            titleLabel.leadingAnchor.constraint(equalTo: row.leadingAnchor),
            titleLabel.centerYAnchor.constraint(equalTo: row.centerYAnchor),
            
            valueLabel.trailingAnchor.constraint(equalTo: row.trailingAnchor),
            valueLabel.centerYAnchor.constraint(equalTo: row.centerYAnchor),
            valueLabel.leadingAnchor.constraint(greaterThanOrEqualTo: titleLabel.trailingAnchor, constant: 16),
            
            row.heightAnchor.constraint(equalToConstant: 32)
        ])
        
        detailsStack.addArrangedSubview(row)
    }
    
    private func loadImage(from url: URL) {
        URLSession.shared.dataTask(with: url) { [weak self] data, _, _ in
            guard let data = data, let image = UIImage(data: data) else { return }
            DispatchQueue.main.async {
                self?.headerImageView.image = image
                self?.headerImageView.contentMode = .scaleAspectFill
            }
        }.resume()
    }
    
    private func loadWalletBalance() {
        APIManager.shared.getWalletBalance { [weak self] result in
            switch result {
            case .success(let response):
                self?.walletBalance = response.data?.balance ?? 0
            case .failure:
                break
            }
        }
    }
    
    // MARK: - Actions
    
    @objc private func investTapped() {
        let alert = UIAlertController(
            title: "Invest in \(project.name)",
            message: "Enter the amount you want to invest.\n\nYour balance: GH₵ \(String(format: "%.2f", walletBalance))\nMinimum: GH₵ \(String(format: "%.0f", project.minimumInvestment))",
            preferredStyle: .alert
        )
        
        alert.addTextField { textField in
            textField.placeholder = "Amount (GH₵)"
            textField.keyboardType = .decimalPad
        }
        
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        alert.addAction(UIAlertAction(title: "Invest", style: .default) { [weak self, weak alert] _ in
            guard let self = self,
                  let text = alert?.textFields?.first?.text,
                  let amount = Double(text) else { return }
            
            self.processInvestment(amount: amount)
        })
        
        present(alert, animated: true)
    }
    
    private func processInvestment(amount: Double) {
        guard amount >= project.minimumInvestment else {
            showError("Minimum investment is GH₵ \(String(format: "%.0f", project.minimumInvestment))")
            return
        }
        
        guard amount <= walletBalance else {
            showError("Insufficient balance. Please deposit funds first.")
            return
        }
        
        // Show confirmation
        let confirmAlert = UIAlertController(
            title: "Confirm Investment",
            message: "You are about to invest GH₵ \(String(format: "%.2f", amount)) in \(project.name).\n\nThis investment has a lock-in period of \(project.lockInPeriodMonths) months.\n\nDo you want to proceed?",
            preferredStyle: .alert
        )
        
        confirmAlert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        confirmAlert.addAction(UIAlertAction(title: "Confirm", style: .default) { [weak self] _ in
            self?.submitInvestment(amount: amount)
        })
        
        present(confirmAlert, animated: true)
    }
    
    private func submitInvestment(amount: Double) {
        investButton.isEnabled = false
        
        APIManager.shared.invest(projectId: project.id, amount: amount) { [weak self] result in
            self?.investButton.isEnabled = true
            
            switch result {
            case .success(let response):
                if response.success {
                    self?.showSuccess("Investment successful!")
                    self?.navigationController?.popViewController(animated: true)
                } else {
                    self?.showError(response.message)
                }
            case .failure(let error):
                self?.showError(error.localizedDescription)
            }
        }
    }
    
    private func showError(_ message: String) {
        let alert = UIAlertController(title: "Error", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
    
    private func showSuccess(_ message: String) {
        let alert = UIAlertController(title: "Success", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
}
