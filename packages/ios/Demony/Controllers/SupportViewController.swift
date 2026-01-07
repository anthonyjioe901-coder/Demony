import UIKit

class SupportViewController: UIViewController {
    
    // MARK: - Properties
    
    private var tickets: [SupportTicket] = []
    
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
    
    private let headerCard: UIView = {
        let view = UIView()
        view.backgroundColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 0.1)
        view.layer.cornerRadius = 16
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()
    
    private let headerIcon: UIImageView = {
        let iv = UIImageView(image: UIImage(systemName: "headphones.circle.fill"))
        iv.tintColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        iv.translatesAutoresizingMaskIntoConstraints = false
        return iv
    }()
    
    private let headerTitle: UILabel = {
        let label = UILabel()
        label.text = "How can we help?"
        label.font = .systemFont(ofSize: 20, weight: .bold)
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let headerSubtitle: UILabel = {
        let label = UILabel()
        label.text = "Our support team is here to assist you"
        label.font = .systemFont(ofSize: 14)
        label.textColor = .secondaryLabel
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
    
    private let faqTitleLabel: UILabel = {
        let label = UILabel()
        label.text = "Frequently Asked Questions"
        label.font = .systemFont(ofSize: 18, weight: .bold)
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let faqStack: UIStackView = {
        let stack = UIStackView()
        stack.axis = .vertical
        stack.spacing = 8
        stack.translatesAutoresizingMaskIntoConstraints = false
        return stack
    }()
    
    private let ticketsTitleLabel: UILabel = {
        let label = UILabel()
        label.text = "Your Support Tickets"
        label.font = .systemFont(ofSize: 18, weight: .bold)
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let ticketsStack: UIStackView = {
        let stack = UIStackView()
        stack.axis = .vertical
        stack.spacing = 8
        stack.translatesAutoresizingMaskIntoConstraints = false
        return stack
    }()
    
    private let emptyLabel: UILabel = {
        let label = UILabel()
        label.text = "No support tickets yet"
        label.font = .systemFont(ofSize: 15)
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
        setupQuickActions()
        setupFAQs()
        loadTickets()
    }
    
    // MARK: - Setup
    
    private func setupUI() {
        view.backgroundColor = .systemBackground
        title = "Support"
        navigationController?.navigationBar.prefersLargeTitles = true
        
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            image: UIImage(systemName: "plus.circle.fill"),
            style: .plain,
            target: self,
            action: #selector(newTicketTapped)
        )
        
        view.addSubview(scrollView)
        scrollView.addSubview(contentView)
        scrollView.refreshControl = refreshControl
        refreshControl.addTarget(self, action: #selector(refresh), for: .valueChanged)
        
        contentView.addSubview(headerCard)
        headerCard.addSubview(headerIcon)
        headerCard.addSubview(headerTitle)
        headerCard.addSubview(headerSubtitle)
        
        contentView.addSubview(quickActionsStack)
        contentView.addSubview(faqTitleLabel)
        contentView.addSubview(faqStack)
        contentView.addSubview(ticketsTitleLabel)
        contentView.addSubview(ticketsStack)
        contentView.addSubview(emptyLabel)
        
        view.addSubview(activityIndicator)
        
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
            
            headerCard.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 16),
            headerCard.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            headerCard.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            
            headerIcon.topAnchor.constraint(equalTo: headerCard.topAnchor, constant: 20),
            headerIcon.leadingAnchor.constraint(equalTo: headerCard.leadingAnchor, constant: 20),
            headerIcon.widthAnchor.constraint(equalToConstant: 48),
            headerIcon.heightAnchor.constraint(equalToConstant: 48),
            
            headerTitle.topAnchor.constraint(equalTo: headerCard.topAnchor, constant: 20),
            headerTitle.leadingAnchor.constraint(equalTo: headerIcon.trailingAnchor, constant: 16),
            
            headerSubtitle.topAnchor.constraint(equalTo: headerTitle.bottomAnchor, constant: 4),
            headerSubtitle.leadingAnchor.constraint(equalTo: headerIcon.trailingAnchor, constant: 16),
            headerSubtitle.bottomAnchor.constraint(equalTo: headerCard.bottomAnchor, constant: -20),
            
            quickActionsStack.topAnchor.constraint(equalTo: headerCard.bottomAnchor, constant: 20),
            quickActionsStack.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            quickActionsStack.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            quickActionsStack.heightAnchor.constraint(equalToConstant: 80),
            
            faqTitleLabel.topAnchor.constraint(equalTo: quickActionsStack.bottomAnchor, constant: 24),
            faqTitleLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            
            faqStack.topAnchor.constraint(equalTo: faqTitleLabel.bottomAnchor, constant: 12),
            faqStack.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            faqStack.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            
            ticketsTitleLabel.topAnchor.constraint(equalTo: faqStack.bottomAnchor, constant: 24),
            ticketsTitleLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            
            ticketsStack.topAnchor.constraint(equalTo: ticketsTitleLabel.bottomAnchor, constant: 12),
            ticketsStack.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            ticketsStack.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            ticketsStack.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -24),
            
            emptyLabel.topAnchor.constraint(equalTo: ticketsTitleLabel.bottomAnchor, constant: 24),
            emptyLabel.centerXAnchor.constraint(equalTo: contentView.centerXAnchor),
            
            activityIndicator.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            activityIndicator.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
    }
    
    private func setupQuickActions() {
        let actions = [
            ("envelope.fill", "Email Us", #selector(emailTapped)),
            ("phone.fill", "Call Us", #selector(callTapped)),
            ("message.fill", "Live Chat", #selector(chatTapped))
        ]
        
        for (icon, title, action) in actions {
            let button = createQuickAction(icon: icon, title: title, action: action)
            quickActionsStack.addArrangedSubview(button)
        }
    }
    
    private func createQuickAction(icon: String, title: String, action: Selector) -> UIView {
        let container = UIView()
        container.backgroundColor = .secondarySystemBackground
        container.layer.cornerRadius = 12
        
        let iconView = UIImageView(image: UIImage(systemName: icon))
        iconView.tintColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        iconView.translatesAutoresizingMaskIntoConstraints = false
        
        let titleLabel = UILabel()
        titleLabel.text = title
        titleLabel.font = .systemFont(ofSize: 12, weight: .medium)
        titleLabel.textColor = .secondaryLabel
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        
        container.addSubview(iconView)
        container.addSubview(titleLabel)
        
        NSLayoutConstraint.activate([
            iconView.centerXAnchor.constraint(equalTo: container.centerXAnchor),
            iconView.centerYAnchor.constraint(equalTo: container.centerYAnchor, constant: -10),
            iconView.widthAnchor.constraint(equalToConstant: 28),
            iconView.heightAnchor.constraint(equalToConstant: 28),
            
            titleLabel.topAnchor.constraint(equalTo: iconView.bottomAnchor, constant: 8),
            titleLabel.centerXAnchor.constraint(equalTo: container.centerXAnchor)
        ])
        
        let tap = UITapGestureRecognizer(target: self, action: action)
        container.addGestureRecognizer(tap)
        container.isUserInteractionEnabled = true
        
        return container
    }
    
    private func setupFAQs() {
        let faqs = [
            ("How do I make a deposit?", "Navigate to Wallet, tap 'Deposit', enter amount and follow instructions."),
            ("How long until I see returns?", "Returns are calculated daily and credited to your wallet automatically."),
            ("How do I withdraw my funds?", "Go to Wallet, tap 'Withdraw', enter amount and bank details."),
            ("Is my investment safe?", "All investments are protected by our security measures and insurance.")
        ]
        
        for (question, answer) in faqs {
            let faqItem = createFAQItem(question: question, answer: answer)
            faqStack.addArrangedSubview(faqItem)
        }
    }
    
    private func createFAQItem(question: String, answer: String) -> UIView {
        let container = UIView()
        container.backgroundColor = .secondarySystemBackground
        container.layer.cornerRadius = 12
        container.translatesAutoresizingMaskIntoConstraints = false
        
        let questionLabel = UILabel()
        questionLabel.text = question
        questionLabel.font = .systemFont(ofSize: 15, weight: .medium)
        questionLabel.numberOfLines = 0
        questionLabel.translatesAutoresizingMaskIntoConstraints = false
        
        let answerLabel = UILabel()
        answerLabel.text = answer
        answerLabel.font = .systemFont(ofSize: 14)
        answerLabel.textColor = .secondaryLabel
        answerLabel.numberOfLines = 0
        answerLabel.translatesAutoresizingMaskIntoConstraints = false
        
        container.addSubview(questionLabel)
        container.addSubview(answerLabel)
        
        NSLayoutConstraint.activate([
            questionLabel.topAnchor.constraint(equalTo: container.topAnchor, constant: 16),
            questionLabel.leadingAnchor.constraint(equalTo: container.leadingAnchor, constant: 16),
            questionLabel.trailingAnchor.constraint(equalTo: container.trailingAnchor, constant: -16),
            
            answerLabel.topAnchor.constraint(equalTo: questionLabel.bottomAnchor, constant: 8),
            answerLabel.leadingAnchor.constraint(equalTo: container.leadingAnchor, constant: 16),
            answerLabel.trailingAnchor.constraint(equalTo: container.trailingAnchor, constant: -16),
            answerLabel.bottomAnchor.constraint(equalTo: container.bottomAnchor, constant: -16)
        ])
        
        return container
    }
    
    // MARK: - Data Loading
    
    private func loadTickets() {
        activityIndicator.startAnimating()
        
        APIManager.shared.getSupportTickets { [weak self] result in
            self?.activityIndicator.stopAnimating()
            self?.refreshControl.endRefreshing()
            
            switch result {
            case .success(let response):
                self?.tickets = response.tickets
                self?.updateTicketsUI()
            case .failure(let error):
                print("Failed to load tickets: \(error)")
                self?.updateTicketsUI()
            }
        }
    }
    
    private func updateTicketsUI() {
        ticketsStack.arrangedSubviews.forEach { $0.removeFromSuperview() }
        
        if tickets.isEmpty {
            emptyLabel.isHidden = false
            return
        }
        
        emptyLabel.isHidden = true
        
        for ticket in tickets {
            let row = createTicketRow(ticket: ticket)
            ticketsStack.addArrangedSubview(row)
        }
    }
    
    private func createTicketRow(ticket: SupportTicket) -> UIView {
        let row = UIView()
        row.backgroundColor = .secondarySystemBackground
        row.layer.cornerRadius = 12
        row.translatesAutoresizingMaskIntoConstraints = false
        
        let subjectLabel = UILabel()
        subjectLabel.text = ticket.subject
        subjectLabel.font = .systemFont(ofSize: 15, weight: .medium)
        subjectLabel.translatesAutoresizingMaskIntoConstraints = false
        
        let dateLabel = UILabel()
        dateLabel.text = ticket.createdAt.prefix(10).description
        dateLabel.font = .systemFont(ofSize: 13)
        dateLabel.textColor = .secondaryLabel
        dateLabel.translatesAutoresizingMaskIntoConstraints = false
        
        let statusBadge = UILabel()
        statusBadge.text = "  \(ticket.status.capitalized)  "
        statusBadge.font = .systemFont(ofSize: 11, weight: .medium)
        
        switch ticket.status {
        case "open":
            statusBadge.backgroundColor = UIColor.systemOrange.withAlphaComponent(0.1)
            statusBadge.textColor = .systemOrange
        case "resolved":
            statusBadge.backgroundColor = UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 0.1)
            statusBadge.textColor = UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0)
        default:
            statusBadge.backgroundColor = .secondarySystemBackground
            statusBadge.textColor = .secondaryLabel
        }
        
        statusBadge.layer.cornerRadius = 6
        statusBadge.clipsToBounds = true
        statusBadge.translatesAutoresizingMaskIntoConstraints = false
        
        row.addSubview(subjectLabel)
        row.addSubview(dateLabel)
        row.addSubview(statusBadge)
        
        NSLayoutConstraint.activate([
            row.heightAnchor.constraint(equalToConstant: 72),
            
            subjectLabel.topAnchor.constraint(equalTo: row.topAnchor, constant: 16),
            subjectLabel.leadingAnchor.constraint(equalTo: row.leadingAnchor, constant: 16),
            subjectLabel.trailingAnchor.constraint(lessThanOrEqualTo: statusBadge.leadingAnchor, constant: -8),
            
            dateLabel.topAnchor.constraint(equalTo: subjectLabel.bottomAnchor, constant: 4),
            dateLabel.leadingAnchor.constraint(equalTo: row.leadingAnchor, constant: 16),
            
            statusBadge.centerYAnchor.constraint(equalTo: row.centerYAnchor),
            statusBadge.trailingAnchor.constraint(equalTo: row.trailingAnchor, constant: -16)
        ])
        
        return row
    }
    
    // MARK: - Actions
    
    @objc private func refresh() {
        loadTickets()
    }
    
    @objc private func newTicketTapped() {
        let alert = UIAlertController(
            title: "New Support Ticket",
            message: "Describe your issue and we'll get back to you soon.",
            preferredStyle: .alert
        )
        
        alert.addTextField { textField in
            textField.placeholder = "Subject"
        }
        
        alert.addTextField { textField in
            textField.placeholder = "Describe your issue..."
        }
        
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        alert.addAction(UIAlertAction(title: "Submit", style: .default) { [weak self, weak alert] _ in
            guard let subject = alert?.textFields?[0].text, !subject.isEmpty,
                  let message = alert?.textFields?[1].text, !message.isEmpty else {
                return
            }
            
            self?.submitTicket(subject: subject, message: message)
        })
        
        present(alert, animated: true)
    }
    
    private func submitTicket(subject: String, message: String) {
        activityIndicator.startAnimating()
        
        APIManager.shared.createSupportTicket(subject: subject, message: message) { [weak self] result in
            self?.activityIndicator.stopAnimating()
            
            switch result {
            case .success:
                let successAlert = UIAlertController(
                    title: "Ticket Submitted",
                    message: "We'll get back to you soon.",
                    preferredStyle: .alert
                )
                successAlert.addAction(UIAlertAction(title: "OK", style: .default))
                self?.present(successAlert, animated: true)
                self?.loadTickets()
                
            case .failure(let error):
                let errorAlert = UIAlertController(
                    title: "Error",
                    message: error.localizedDescription,
                    preferredStyle: .alert
                )
                errorAlert.addAction(UIAlertAction(title: "OK", style: .default))
                self?.present(errorAlert, animated: true)
            }
        }
    }
    
    @objc private func emailTapped() {
        if let url = URL(string: "mailto:support@demony.com") {
            UIApplication.shared.open(url)
        }
    }
    
    @objc private func callTapped() {
        if let url = URL(string: "tel:+233000000000") {
            UIApplication.shared.open(url)
        }
    }
    
    @objc private func chatTapped() {
        let alert = UIAlertController(
            title: "Live Chat",
            message: "Live chat feature coming soon!",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
}
