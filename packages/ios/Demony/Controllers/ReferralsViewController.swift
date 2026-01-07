import UIKit

class ReferralsViewController: UIViewController {
    
    // MARK: - Properties
    
    private var referralData: ReferralData?
    private var referrals: [Referral] = []
    
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
    
    private let codeCard: UIView = {
        let view = UIView()
        view.backgroundColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        view.layer.cornerRadius = 16
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()
    
    private let codeTitleLabel: UILabel = {
        let label = UILabel()
        label.text = "Your Referral Code"
        label.font = .systemFont(ofSize: 14)
        label.textColor = .white.withAlphaComponent(0.8)
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let codeLabel: UILabel = {
        let label = UILabel()
        label.text = "------"
        label.font = .monospacedSystemFont(ofSize: 32, weight: .bold)
        label.textColor = .white
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let copyButton: UIButton = {
        let button = UIButton(type: .system)
        button.setTitle(" Copy Code", for: .normal)
        button.setImage(UIImage(systemName: "doc.on.doc"), for: .normal)
        button.tintColor = .white
        button.backgroundColor = .white.withAlphaComponent(0.2)
        button.layer.cornerRadius = 8
        button.translatesAutoresizingMaskIntoConstraints = false
        return button
    }()
    
    private let shareButton: UIButton = {
        let button = UIButton(type: .system)
        button.setTitle(" Share", for: .normal)
        button.setImage(UIImage(systemName: "square.and.arrow.up"), for: .normal)
        button.tintColor = .white
        button.backgroundColor = .white.withAlphaComponent(0.2)
        button.layer.cornerRadius = 8
        button.translatesAutoresizingMaskIntoConstraints = false
        return button
    }()
    
    private let statsStack: UIStackView = {
        let stack = UIStackView()
        stack.axis = .horizontal
        stack.distribution = .fillEqually
        stack.spacing = 12
        stack.translatesAutoresizingMaskIntoConstraints = false
        return stack
    }()
    
    private let referralsTitleLabel: UILabel = {
        let label = UILabel()
        label.text = "Your Referrals"
        label.font = .systemFont(ofSize: 20, weight: .bold)
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let referralsStack: UIStackView = {
        let stack = UIStackView()
        stack.axis = .vertical
        stack.spacing = 8
        stack.translatesAutoresizingMaskIntoConstraints = false
        return stack
    }()
    
    private let emptyLabel: UILabel = {
        let label = UILabel()
        label.text = "No referrals yet. Share your code!"
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
        loadData()
    }
    
    // MARK: - Setup
    
    private func setupUI() {
        view.backgroundColor = .systemBackground
        title = "Referrals"
        navigationController?.navigationBar.prefersLargeTitles = true
        
        view.addSubview(scrollView)
        scrollView.addSubview(contentView)
        scrollView.refreshControl = refreshControl
        refreshControl.addTarget(self, action: #selector(refresh), for: .valueChanged)
        
        contentView.addSubview(codeCard)
        codeCard.addSubview(codeTitleLabel)
        codeCard.addSubview(codeLabel)
        codeCard.addSubview(copyButton)
        codeCard.addSubview(shareButton)
        
        contentView.addSubview(statsStack)
        contentView.addSubview(referralsTitleLabel)
        contentView.addSubview(referralsStack)
        contentView.addSubview(emptyLabel)
        
        view.addSubview(activityIndicator)
        
        copyButton.addTarget(self, action: #selector(copyCode), for: .touchUpInside)
        shareButton.addTarget(self, action: #selector(shareCode), for: .touchUpInside)
        
        // Stats cards
        let referralsCard = createStatCard(title: "Total Referrals", value: "0", icon: "person.2.fill", tag: 100)
        let earningsCard = createStatCard(title: "Total Earnings", value: "GH₵ 0", icon: "dollarsign.circle.fill", tag: 101)
        statsStack.addArrangedSubview(referralsCard)
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
            
            codeCard.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 16),
            codeCard.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            codeCard.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            
            codeTitleLabel.topAnchor.constraint(equalTo: codeCard.topAnchor, constant: 20),
            codeTitleLabel.centerXAnchor.constraint(equalTo: codeCard.centerXAnchor),
            
            codeLabel.topAnchor.constraint(equalTo: codeTitleLabel.bottomAnchor, constant: 12),
            codeLabel.centerXAnchor.constraint(equalTo: codeCard.centerXAnchor),
            
            copyButton.topAnchor.constraint(equalTo: codeLabel.bottomAnchor, constant: 20),
            copyButton.leadingAnchor.constraint(equalTo: codeCard.leadingAnchor, constant: 20),
            copyButton.heightAnchor.constraint(equalToConstant: 40),
            copyButton.bottomAnchor.constraint(equalTo: codeCard.bottomAnchor, constant: -20),
            
            shareButton.topAnchor.constraint(equalTo: codeLabel.bottomAnchor, constant: 20),
            shareButton.leadingAnchor.constraint(equalTo: copyButton.trailingAnchor, constant: 12),
            shareButton.trailingAnchor.constraint(equalTo: codeCard.trailingAnchor, constant: -20),
            shareButton.widthAnchor.constraint(equalTo: copyButton.widthAnchor),
            shareButton.heightAnchor.constraint(equalToConstant: 40),
            
            statsStack.topAnchor.constraint(equalTo: codeCard.bottomAnchor, constant: 20),
            statsStack.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            statsStack.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            statsStack.heightAnchor.constraint(equalToConstant: 100),
            
            referralsTitleLabel.topAnchor.constraint(equalTo: statsStack.bottomAnchor, constant: 24),
            referralsTitleLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            
            referralsStack.topAnchor.constraint(equalTo: referralsTitleLabel.bottomAnchor, constant: 16),
            referralsStack.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            referralsStack.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            referralsStack.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -24),
            
            emptyLabel.topAnchor.constraint(equalTo: referralsTitleLabel.bottomAnchor, constant: 32),
            emptyLabel.centerXAnchor.constraint(equalTo: contentView.centerXAnchor),
            
            activityIndicator.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            activityIndicator.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
    }
    
    private func createStatCard(title: String, value: String, icon: String, tag: Int) -> UIView {
        let card = UIView()
        card.backgroundColor = .secondarySystemBackground
        card.layer.cornerRadius = 12
        
        let iconView = UIImageView(image: UIImage(systemName: icon))
        iconView.tintColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        iconView.translatesAutoresizingMaskIntoConstraints = false
        
        let titleLabel = UILabel()
        titleLabel.text = title
        titleLabel.font = .systemFont(ofSize: 12)
        titleLabel.textColor = .secondaryLabel
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        
        let valueLabel = UILabel()
        valueLabel.text = value
        valueLabel.font = .systemFont(ofSize: 20, weight: .bold)
        valueLabel.tag = tag
        valueLabel.translatesAutoresizingMaskIntoConstraints = false
        
        card.addSubview(iconView)
        card.addSubview(titleLabel)
        card.addSubview(valueLabel)
        
        NSLayoutConstraint.activate([
            iconView.topAnchor.constraint(equalTo: card.topAnchor, constant: 16),
            iconView.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 16),
            iconView.widthAnchor.constraint(equalToConstant: 28),
            iconView.heightAnchor.constraint(equalToConstant: 28),
            
            titleLabel.topAnchor.constraint(equalTo: iconView.bottomAnchor, constant: 12),
            titleLabel.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 16),
            
            valueLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 4),
            valueLabel.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 16)
        ])
        
        return card
    }
    
    // MARK: - Data Loading
    
    private func loadData() {
        activityIndicator.startAnimating()
        
        APIManager.shared.getReferralStats { [weak self] result in
            self?.activityIndicator.stopAnimating()
            self?.refreshControl.endRefreshing()
            
            switch result {
            case .success(let response):
                self?.referralData = response.data
                self?.referrals = response.data?.referrals ?? []
                self?.updateUI()
            case .failure(let error):
                print("Failed to load referral data: \(error)")
            }
        }
    }
    
    private func updateUI() {
        if let data = referralData {
            codeLabel.text = data.referralCode
            
            if let countLabel = view.viewWithTag(100) as? UILabel {
                countLabel.text = "\(data.totalReferrals)"
            }
            
            if let earningsLabel = view.viewWithTag(101) as? UILabel {
                earningsLabel.text = String(format: "GH₵ %.2f", data.totalEarnings)
            }
        }
        
        updateReferralsUI()
    }
    
    private func updateReferralsUI() {
        referralsStack.arrangedSubviews.forEach { $0.removeFromSuperview() }
        
        if referrals.isEmpty {
            emptyLabel.isHidden = false
            return
        }
        
        emptyLabel.isHidden = true
        
        for referral in referrals {
            let row = createReferralRow(referral: referral)
            referralsStack.addArrangedSubview(row)
        }
    }
    
    private func createReferralRow(referral: Referral) -> UIView {
        let row = UIView()
        row.backgroundColor = .secondarySystemBackground
        row.layer.cornerRadius = 12
        row.translatesAutoresizingMaskIntoConstraints = false
        
        let avatarView = UIView()
        avatarView.backgroundColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 0.1)
        avatarView.layer.cornerRadius = 20
        avatarView.translatesAutoresizingMaskIntoConstraints = false
        
        let avatarLabel = UILabel()
        avatarLabel.text = String(referral.name.prefix(1)).uppercased()
        avatarLabel.font = .systemFont(ofSize: 16, weight: .bold)
        avatarLabel.textColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        avatarLabel.translatesAutoresizingMaskIntoConstraints = false
        
        let nameLabel = UILabel()
        nameLabel.text = referral.name
        nameLabel.font = .systemFont(ofSize: 16, weight: .medium)
        nameLabel.translatesAutoresizingMaskIntoConstraints = false
        
        let dateLabel = UILabel()
        dateLabel.text = "Joined \(referral.joinedAt.prefix(10))"
        dateLabel.font = .systemFont(ofSize: 13)
        dateLabel.textColor = .secondaryLabel
        dateLabel.translatesAutoresizingMaskIntoConstraints = false
        
        let statusBadge = UILabel()
        statusBadge.text = "  \(referral.status.capitalized)  "
        statusBadge.font = .systemFont(ofSize: 11, weight: .medium)
        statusBadge.backgroundColor = referral.status == "active" ? UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 0.1) : .secondarySystemBackground
        statusBadge.textColor = referral.status == "active" ? UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0) : .secondaryLabel
        statusBadge.layer.cornerRadius = 6
        statusBadge.clipsToBounds = true
        statusBadge.translatesAutoresizingMaskIntoConstraints = false
        
        row.addSubview(avatarView)
        avatarView.addSubview(avatarLabel)
        row.addSubview(nameLabel)
        row.addSubview(dateLabel)
        row.addSubview(statusBadge)
        
        NSLayoutConstraint.activate([
            row.heightAnchor.constraint(equalToConstant: 72),
            
            avatarView.leadingAnchor.constraint(equalTo: row.leadingAnchor, constant: 16),
            avatarView.centerYAnchor.constraint(equalTo: row.centerYAnchor),
            avatarView.widthAnchor.constraint(equalToConstant: 40),
            avatarView.heightAnchor.constraint(equalToConstant: 40),
            
            avatarLabel.centerXAnchor.constraint(equalTo: avatarView.centerXAnchor),
            avatarLabel.centerYAnchor.constraint(equalTo: avatarView.centerYAnchor),
            
            nameLabel.topAnchor.constraint(equalTo: row.topAnchor, constant: 16),
            nameLabel.leadingAnchor.constraint(equalTo: avatarView.trailingAnchor, constant: 12),
            
            dateLabel.topAnchor.constraint(equalTo: nameLabel.bottomAnchor, constant: 4),
            dateLabel.leadingAnchor.constraint(equalTo: avatarView.trailingAnchor, constant: 12),
            
            statusBadge.centerYAnchor.constraint(equalTo: row.centerYAnchor),
            statusBadge.trailingAnchor.constraint(equalTo: row.trailingAnchor, constant: -16)
        ])
        
        return row
    }
    
    // MARK: - Actions
    
    @objc private func refresh() {
        loadData()
    }
    
    @objc private func copyCode() {
        guard let code = referralData?.referralCode else { return }
        UIPasteboard.general.string = code
        
        let alert = UIAlertController(
            title: "Copied!",
            message: "Referral code copied to clipboard.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
    
    @objc private func shareCode() {
        guard let code = referralData?.referralCode else { return }
        
        let text = """
        Join Demony and start investing today! Use my referral code: \(code)
        
        Download now and get started!
        """
        
        let activityVC = UIActivityViewController(activityItems: [text], applicationActivities: nil)
        present(activityVC, animated: true)
    }
}
