import UIKit

class SettingsViewController: UIViewController {
    
    // MARK: - UI Components
    
    private let tableView: UITableView = {
        let tv = UITableView(frame: .zero, style: .insetGrouped)
        tv.translatesAutoresizingMaskIntoConstraints = false
        return tv
    }()
    
    private var settings: [[SettingItem]] = []
    
    struct SettingItem {
        let icon: String
        let title: String
        let type: SettingType
        var isOn: Bool = false
    }
    
    enum SettingType {
        case toggle
        case navigation
        case action
    }
    
    // MARK: - Lifecycle
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupSettings()
        setupUI()
    }
    
    // MARK: - Setup
    
    private func setupSettings() {
        settings = [
            // Notifications
            [
                SettingItem(icon: "bell.fill", title: "Push Notifications", type: .toggle, isOn: true),
                SettingItem(icon: "envelope.fill", title: "Email Notifications", type: .toggle, isOn: true),
                SettingItem(icon: "chart.line.uptrend.xyaxis", title: "Investment Updates", type: .toggle, isOn: true)
            ],
            // Security
            [
                SettingItem(icon: "faceid", title: "Biometric Login", type: .toggle, isOn: false),
                SettingItem(icon: "lock.fill", title: "Change Password", type: .navigation),
                SettingItem(icon: "key.fill", title: "Two-Factor Authentication", type: .navigation)
            ],
            // App
            [
                SettingItem(icon: "moon.fill", title: "Dark Mode", type: .toggle, isOn: false),
                SettingItem(icon: "globe", title: "Language", type: .navigation),
                SettingItem(icon: "dollarsign.circle.fill", title: "Currency", type: .navigation)
            ],
            // About
            [
                SettingItem(icon: "info.circle.fill", title: "About Demony", type: .navigation),
                SettingItem(icon: "star.fill", title: "Rate App", type: .action),
                SettingItem(icon: "square.and.arrow.up.fill", title: "Share App", type: .action)
            ]
        ]
    }
    
    private func setupUI() {
        view.backgroundColor = .systemBackground
        title = "Settings"
        navigationController?.navigationBar.prefersLargeTitles = true
        
        view.addSubview(tableView)
        tableView.delegate = self
        tableView.dataSource = self
        tableView.register(SettingCell.self, forCellReuseIdentifier: "SettingCell")
        
        NSLayoutConstraint.activate([
            tableView.topAnchor.constraint(equalTo: view.topAnchor),
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
    }
}

// MARK: - UITableViewDelegate & DataSource

extension SettingsViewController: UITableViewDelegate, UITableViewDataSource {
    
    func numberOfSections(in tableView: UITableView) -> Int {
        return settings.count
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return settings[section].count
    }
    
    func tableView(_ tableView: UITableView, titleForHeaderInSection section: Int) -> String? {
        switch section {
        case 0: return "Notifications"
        case 1: return "Security"
        case 2: return "App"
        case 3: return "About"
        default: return nil
        }
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "SettingCell", for: indexPath) as! SettingCell
        let item = settings[indexPath.section][indexPath.row]
        cell.configure(with: item)
        cell.onToggle = { [weak self] isOn in
            self?.settings[indexPath.section][indexPath.row].isOn = isOn
            self?.handleToggle(section: indexPath.section, row: indexPath.row, isOn: isOn)
        }
        return cell
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        
        let item = settings[indexPath.section][indexPath.row]
        
        switch item.type {
        case .toggle:
            break
        case .navigation:
            handleNavigation(item: item)
        case .action:
            handleAction(item: item)
        }
    }
    
    private func handleToggle(section: Int, row: Int, isOn: Bool) {
        let item = settings[section][row]
        print("Toggle \(item.title): \(isOn)")
    }
    
    private func handleNavigation(item: SettingItem) {
        let alert = UIAlertController(
            title: item.title,
            message: "This feature is coming soon.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
    
    private func handleAction(item: SettingItem) {
        if item.title == "Rate App" {
            // Open App Store rating
            print("Opening App Store for rating")
        } else if item.title == "Share App" {
            let text = "Check out Demony - Your Smart Investment Platform!"
            let activityVC = UIActivityViewController(activityItems: [text], applicationActivities: nil)
            present(activityVC, animated: true)
        }
    }
}

// MARK: - SettingCell

class SettingCell: UITableViewCell {
    
    var onToggle: ((Bool) -> Void)?
    
    private let iconView: UIImageView = {
        let iv = UIImageView()
        iv.contentMode = .scaleAspectFit
        iv.tintColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        iv.translatesAutoresizingMaskIntoConstraints = false
        return iv
    }()
    
    private let titleLabel: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 16)
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let toggle: UISwitch = {
        let sw = UISwitch()
        sw.onTintColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        sw.translatesAutoresizingMaskIntoConstraints = false
        return sw
    }()
    
    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        setupUI()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupUI() {
        contentView.addSubview(iconView)
        contentView.addSubview(titleLabel)
        contentView.addSubview(toggle)
        
        toggle.addTarget(self, action: #selector(toggleChanged), for: .valueChanged)
        
        NSLayoutConstraint.activate([
            iconView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            iconView.centerYAnchor.constraint(equalTo: contentView.centerYAnchor),
            iconView.widthAnchor.constraint(equalToConstant: 24),
            iconView.heightAnchor.constraint(equalToConstant: 24),
            
            titleLabel.leadingAnchor.constraint(equalTo: iconView.trailingAnchor, constant: 12),
            titleLabel.centerYAnchor.constraint(equalTo: contentView.centerYAnchor),
            
            toggle.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            toggle.centerYAnchor.constraint(equalTo: contentView.centerYAnchor)
        ])
    }
    
    func configure(with item: SettingsViewController.SettingItem) {
        iconView.image = UIImage(systemName: item.icon)
        titleLabel.text = item.title
        
        switch item.type {
        case .toggle:
            toggle.isHidden = false
            toggle.isOn = item.isOn
            accessoryType = .none
        case .navigation:
            toggle.isHidden = true
            accessoryType = .disclosureIndicator
        case .action:
            toggle.isHidden = true
            accessoryType = .none
        }
    }
    
    @objc private func toggleChanged() {
        onToggle?(toggle.isOn)
    }
}
