import UIKit

class ProjectsViewController: UIViewController {
    
    // MARK: - Properties
    
    private var projects: [Project] = []
    private var filteredProjects: [Project] = []
    private var selectedCategory: String?
    private let categories = ["All", "Agriculture", "Real Estate", "Technology", "Energy", "Healthcare"]
    
    // MARK: - UI Components
    
    private let searchController = UISearchController(searchResultsController: nil)
    
    private let categoryScrollView: UIScrollView = {
        let sv = UIScrollView()
        sv.showsHorizontalScrollIndicator = false
        sv.translatesAutoresizingMaskIntoConstraints = false
        return sv
    }()
    
    private let categoryStack: UIStackView = {
        let stack = UIStackView()
        stack.axis = .horizontal
        stack.spacing = 8
        stack.translatesAutoresizingMaskIntoConstraints = false
        return stack
    }()
    
    private let tableView: UITableView = {
        let tv = UITableView()
        tv.translatesAutoresizingMaskIntoConstraints = false
        tv.separatorStyle = .none
        tv.backgroundColor = .systemBackground
        return tv
    }()
    
    private let refreshControl = UIRefreshControl()
    
    private let activityIndicator: UIActivityIndicatorView = {
        let ai = UIActivityIndicatorView(style: .large)
        ai.hidesWhenStopped = true
        ai.translatesAutoresizingMaskIntoConstraints = false
        return ai
    }()
    
    private let emptyLabel: UILabel = {
        let label = UILabel()
        label.text = "No projects available"
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
        setupTableView()
        setupSearchController()
        loadProjects()
    }
    
    // MARK: - Setup
    
    private func setupUI() {
        view.backgroundColor = .systemBackground
        title = "Projects"
        navigationController?.navigationBar.prefersLargeTitles = true
        
        view.addSubview(categoryScrollView)
        categoryScrollView.addSubview(categoryStack)
        view.addSubview(tableView)
        view.addSubview(activityIndicator)
        view.addSubview(emptyLabel)
        
        // Create category buttons
        for (index, category) in categories.enumerated() {
            let button = createCategoryButton(title: category, tag: index)
            categoryStack.addArrangedSubview(button)
        }
        
        NSLayoutConstraint.activate([
            categoryScrollView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            categoryScrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            categoryScrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            categoryScrollView.heightAnchor.constraint(equalToConstant: 50),
            
            categoryStack.topAnchor.constraint(equalTo: categoryScrollView.topAnchor, constant: 8),
            categoryStack.leadingAnchor.constraint(equalTo: categoryScrollView.leadingAnchor, constant: 16),
            categoryStack.trailingAnchor.constraint(equalTo: categoryScrollView.trailingAnchor, constant: -16),
            categoryStack.bottomAnchor.constraint(equalTo: categoryScrollView.bottomAnchor, constant: -8),
            
            tableView.topAnchor.constraint(equalTo: categoryScrollView.bottomAnchor),
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            
            activityIndicator.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            activityIndicator.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            
            emptyLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            emptyLabel.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
    }
    
    private func setupTableView() {
        tableView.delegate = self
        tableView.dataSource = self
        tableView.register(ProjectCell.self, forCellReuseIdentifier: ProjectCell.identifier)
        tableView.refreshControl = refreshControl
        refreshControl.addTarget(self, action: #selector(refresh), for: .valueChanged)
    }
    
    private func setupSearchController() {
        searchController.searchResultsUpdater = self
        searchController.obscuresBackgroundDuringPresentation = false
        searchController.searchBar.placeholder = "Search projects..."
        navigationItem.searchController = searchController
        definesPresentationContext = true
    }
    
    private func createCategoryButton(title: String, tag: Int) -> UIButton {
        let button = UIButton(type: .system)
        button.setTitle(title, for: .normal)
        button.tag = tag
        button.titleLabel?.font = .systemFont(ofSize: 14, weight: .medium)
        
        if tag == 0 {
            button.backgroundColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
            button.setTitleColor(.white, for: .normal)
        } else {
            button.backgroundColor = .secondarySystemBackground
            button.setTitleColor(.label, for: .normal)
        }
        
        button.layer.cornerRadius = 16
        button.contentEdgeInsets = UIEdgeInsets(top: 8, left: 16, bottom: 8, right: 16)
        button.addTarget(self, action: #selector(categoryTapped(_:)), for: .touchUpInside)
        
        return button
    }
    
    // MARK: - Data Loading
    
    private func loadProjects() {
        activityIndicator.startAnimating()
        emptyLabel.isHidden = true
        
        APIManager.shared.getProjects(category: selectedCategory) { [weak self] result in
            self?.activityIndicator.stopAnimating()
            self?.refreshControl.endRefreshing()
            
            switch result {
            case .success(let response):
                self?.projects = response.projects
                self?.filterProjects()
            case .failure(let error):
                self?.showError(error.localizedDescription)
            }
        }
    }
    
    private func filterProjects() {
        let searchText = searchController.searchBar.text?.lowercased() ?? ""
        
        if searchText.isEmpty {
            filteredProjects = projects
        } else {
            filteredProjects = projects.filter {
                $0.name.lowercased().contains(searchText) ||
                $0.description.lowercased().contains(searchText) ||
                $0.category.lowercased().contains(searchText)
            }
        }
        
        emptyLabel.isHidden = !filteredProjects.isEmpty
        tableView.reloadData()
    }
    
    private func showError(_ message: String) {
        let alert = UIAlertController(title: "Error", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
    
    // MARK: - Actions
    
    @objc private func refresh() {
        loadProjects()
    }
    
    @objc private func categoryTapped(_ sender: UIButton) {
        // Update button appearances
        for case let button as UIButton in categoryStack.arrangedSubviews {
            if button.tag == sender.tag {
                button.backgroundColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
                button.setTitleColor(.white, for: .normal)
            } else {
                button.backgroundColor = .secondarySystemBackground
                button.setTitleColor(.label, for: .normal)
            }
        }
        
        // Update filter
        if sender.tag == 0 {
            selectedCategory = nil
        } else {
            selectedCategory = categories[sender.tag]
        }
        
        loadProjects()
    }
}

// MARK: - UITableViewDelegate, UITableViewDataSource

extension ProjectsViewController: UITableViewDelegate, UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return filteredProjects.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: ProjectCell.identifier, for: indexPath) as! ProjectCell
        cell.configure(with: filteredProjects[indexPath.row])
        return cell
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        let project = filteredProjects[indexPath.row]
        let detailVC = ProjectDetailViewController(project: project)
        navigationController?.pushViewController(detailVC, animated: true)
    }
    
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return 160
    }
}

// MARK: - UISearchResultsUpdating

extension ProjectsViewController: UISearchResultsUpdating {
    func updateSearchResults(for searchController: UISearchController) {
        filterProjects()
    }
}

// MARK: - ProjectCell

class ProjectCell: UITableViewCell {
    static let identifier = "ProjectCell"
    
    private let cardView: UIView = {
        let view = UIView()
        view.backgroundColor = .secondarySystemBackground
        view.layer.cornerRadius = 12
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()
    
    private let nameLabel: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 17, weight: .semibold)
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let categoryLabel: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 13)
        label.textColor = .secondaryLabel
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let descriptionLabel: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 14)
        label.textColor = .secondaryLabel
        label.numberOfLines = 2
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let returnLabel: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 15, weight: .medium)
        label.textColor = UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0)
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let progressView: UIProgressView = {
        let pv = UIProgressView(progressViewStyle: .default)
        pv.tintColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        pv.translatesAutoresizingMaskIntoConstraints = false
        return pv
    }()
    
    private let progressLabel: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 12)
        label.textColor = .secondaryLabel
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let minInvestLabel: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 12)
        label.textColor = .secondaryLabel
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        setupUI()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupUI() {
        selectionStyle = .none
        backgroundColor = .clear
        
        contentView.addSubview(cardView)
        cardView.addSubview(nameLabel)
        cardView.addSubview(categoryLabel)
        cardView.addSubview(descriptionLabel)
        cardView.addSubview(returnLabel)
        cardView.addSubview(progressView)
        cardView.addSubview(progressLabel)
        cardView.addSubview(minInvestLabel)
        
        NSLayoutConstraint.activate([
            cardView.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 8),
            cardView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            cardView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            cardView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -8),
            
            nameLabel.topAnchor.constraint(equalTo: cardView.topAnchor, constant: 16),
            nameLabel.leadingAnchor.constraint(equalTo: cardView.leadingAnchor, constant: 16),
            nameLabel.trailingAnchor.constraint(lessThanOrEqualTo: returnLabel.leadingAnchor, constant: -8),
            
            returnLabel.topAnchor.constraint(equalTo: cardView.topAnchor, constant: 16),
            returnLabel.trailingAnchor.constraint(equalTo: cardView.trailingAnchor, constant: -16),
            
            categoryLabel.topAnchor.constraint(equalTo: nameLabel.bottomAnchor, constant: 4),
            categoryLabel.leadingAnchor.constraint(equalTo: cardView.leadingAnchor, constant: 16),
            
            descriptionLabel.topAnchor.constraint(equalTo: categoryLabel.bottomAnchor, constant: 8),
            descriptionLabel.leadingAnchor.constraint(equalTo: cardView.leadingAnchor, constant: 16),
            descriptionLabel.trailingAnchor.constraint(equalTo: cardView.trailingAnchor, constant: -16),
            
            progressView.topAnchor.constraint(equalTo: descriptionLabel.bottomAnchor, constant: 12),
            progressView.leadingAnchor.constraint(equalTo: cardView.leadingAnchor, constant: 16),
            progressView.trailingAnchor.constraint(equalTo: cardView.trailingAnchor, constant: -16),
            
            progressLabel.topAnchor.constraint(equalTo: progressView.bottomAnchor, constant: 4),
            progressLabel.leadingAnchor.constraint(equalTo: cardView.leadingAnchor, constant: 16),
            
            minInvestLabel.topAnchor.constraint(equalTo: progressView.bottomAnchor, constant: 4),
            minInvestLabel.trailingAnchor.constraint(equalTo: cardView.trailingAnchor, constant: -16)
        ])
    }
    
    func configure(with project: Project) {
        nameLabel.text = project.name
        categoryLabel.text = project.category
        descriptionLabel.text = project.description
        returnLabel.text = String(format: "%.1f%% return", project.returnRate)
        progressView.progress = Float(project.fundingProgress)
        progressLabel.text = "\(project.fundingPercentage)% funded"
        minInvestLabel.text = String(format: "Min: GH₵ %.0f", project.minimumInvestment)
    }
}
