import UIKit

protocol SignupViewControllerDelegate: AnyObject {
    func signupViewControllerDidSignup(_ controller: SignupViewController)
}

class SignupViewController: UIViewController {
    
    weak var delegate: SignupViewControllerDelegate?
    
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
    
    private let titleLabel: UILabel = {
        let label = UILabel()
        label.text = "Create Account"
        label.font = .systemFont(ofSize: 28, weight: .bold)
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let subtitleLabel: UILabel = {
        let label = UILabel()
        label.text = "Start your investment journey"
        label.font = .systemFont(ofSize: 16)
        label.textColor = .secondaryLabel
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let nameTextField: UITextField = {
        let tf = UITextField()
        tf.placeholder = "Full Name"
        tf.borderStyle = .roundedRect
        tf.autocapitalizationType = .words
        tf.translatesAutoresizingMaskIntoConstraints = false
        return tf
    }()
    
    private let emailTextField: UITextField = {
        let tf = UITextField()
        tf.placeholder = "Email"
        tf.borderStyle = .roundedRect
        tf.keyboardType = .emailAddress
        tf.autocapitalizationType = .none
        tf.autocorrectionType = .no
        tf.translatesAutoresizingMaskIntoConstraints = false
        return tf
    }()
    
    private let phoneTextField: UITextField = {
        let tf = UITextField()
        tf.placeholder = "Phone Number"
        tf.borderStyle = .roundedRect
        tf.keyboardType = .phonePad
        tf.translatesAutoresizingMaskIntoConstraints = false
        return tf
    }()
    
    private let passwordTextField: UITextField = {
        let tf = UITextField()
        tf.placeholder = "Password"
        tf.borderStyle = .roundedRect
        tf.isSecureTextEntry = true
        tf.translatesAutoresizingMaskIntoConstraints = false
        return tf
    }()
    
    private let confirmPasswordTextField: UITextField = {
        let tf = UITextField()
        tf.placeholder = "Confirm Password"
        tf.borderStyle = .roundedRect
        tf.isSecureTextEntry = true
        tf.translatesAutoresizingMaskIntoConstraints = false
        return tf
    }()
    
    private let referralTextField: UITextField = {
        let tf = UITextField()
        tf.placeholder = "Referral Code (Optional)"
        tf.borderStyle = .roundedRect
        tf.autocapitalizationType = .allCharacters
        tf.translatesAutoresizingMaskIntoConstraints = false
        return tf
    }()
    
    private let signupButton: UIButton = {
        let button = UIButton(type: .system)
        button.setTitle("Sign Up", for: .normal)
        button.setTitleColor(.white, for: .normal)
        button.titleLabel?.font = .systemFont(ofSize: 17, weight: .semibold)
        button.backgroundColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        button.layer.cornerRadius = 12
        button.translatesAutoresizingMaskIntoConstraints = false
        return button
    }()
    
    private let activityIndicator: UIActivityIndicatorView = {
        let ai = UIActivityIndicatorView(style: .medium)
        ai.hidesWhenStopped = true
        ai.color = .white
        ai.translatesAutoresizingMaskIntoConstraints = false
        return ai
    }()
    
    private let errorLabel: UILabel = {
        let label = UILabel()
        label.textColor = .systemRed
        label.font = .systemFont(ofSize: 14)
        label.textAlignment = .center
        label.numberOfLines = 0
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
    
    // MARK: - Setup
    
    private func setupUI() {
        view.backgroundColor = .systemBackground
        title = "Sign Up"
        
        view.addSubview(scrollView)
        scrollView.addSubview(contentView)
        
        contentView.addSubview(titleLabel)
        contentView.addSubview(subtitleLabel)
        contentView.addSubview(nameTextField)
        contentView.addSubview(emailTextField)
        contentView.addSubview(phoneTextField)
        contentView.addSubview(passwordTextField)
        contentView.addSubview(confirmPasswordTextField)
        contentView.addSubview(referralTextField)
        contentView.addSubview(errorLabel)
        contentView.addSubview(signupButton)
        
        signupButton.addSubview(activityIndicator)
        
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
            
            titleLabel.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 32),
            titleLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 24),
            titleLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -24),
            
            subtitleLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 8),
            subtitleLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 24),
            subtitleLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -24),
            
            nameTextField.topAnchor.constraint(equalTo: subtitleLabel.bottomAnchor, constant: 32),
            nameTextField.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 24),
            nameTextField.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -24),
            nameTextField.heightAnchor.constraint(equalToConstant: 50),
            
            emailTextField.topAnchor.constraint(equalTo: nameTextField.bottomAnchor, constant: 16),
            emailTextField.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 24),
            emailTextField.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -24),
            emailTextField.heightAnchor.constraint(equalToConstant: 50),
            
            phoneTextField.topAnchor.constraint(equalTo: emailTextField.bottomAnchor, constant: 16),
            phoneTextField.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 24),
            phoneTextField.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -24),
            phoneTextField.heightAnchor.constraint(equalToConstant: 50),
            
            passwordTextField.topAnchor.constraint(equalTo: phoneTextField.bottomAnchor, constant: 16),
            passwordTextField.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 24),
            passwordTextField.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -24),
            passwordTextField.heightAnchor.constraint(equalToConstant: 50),
            
            confirmPasswordTextField.topAnchor.constraint(equalTo: passwordTextField.bottomAnchor, constant: 16),
            confirmPasswordTextField.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 24),
            confirmPasswordTextField.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -24),
            confirmPasswordTextField.heightAnchor.constraint(equalToConstant: 50),
            
            referralTextField.topAnchor.constraint(equalTo: confirmPasswordTextField.bottomAnchor, constant: 16),
            referralTextField.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 24),
            referralTextField.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -24),
            referralTextField.heightAnchor.constraint(equalToConstant: 50),
            
            errorLabel.topAnchor.constraint(equalTo: referralTextField.bottomAnchor, constant: 16),
            errorLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 24),
            errorLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -24),
            
            signupButton.topAnchor.constraint(equalTo: errorLabel.bottomAnchor, constant: 16),
            signupButton.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 24),
            signupButton.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -24),
            signupButton.heightAnchor.constraint(equalToConstant: 50),
            signupButton.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -24),
            
            activityIndicator.centerXAnchor.constraint(equalTo: signupButton.centerXAnchor),
            activityIndicator.centerYAnchor.constraint(equalTo: signupButton.centerYAnchor)
        ])
    }
    
    private func setupActions() {
        signupButton.addTarget(self, action: #selector(signupTapped), for: .touchUpInside)
        
        let tapGesture = UITapGestureRecognizer(target: self, action: #selector(dismissKeyboard))
        view.addGestureRecognizer(tapGesture)
    }
    
    // MARK: - Actions
    
    @objc private func signupTapped() {
        guard let name = nameTextField.text, !name.isEmpty,
              let email = emailTextField.text, !email.isEmpty,
              let phone = phoneTextField.text, !phone.isEmpty,
              let password = passwordTextField.text, !password.isEmpty,
              let confirmPassword = confirmPasswordTextField.text, !confirmPassword.isEmpty else {
            showError("Please fill in all required fields")
            return
        }
        
        guard password == confirmPassword else {
            showError("Passwords do not match")
            return
        }
        
        guard password.count >= 6 else {
            showError("Password must be at least 6 characters")
            return
        }
        
        let referralCode = referralTextField.text?.isEmpty == true ? nil : referralTextField.text
        
        setLoading(true)
        hideError()
        
        APIManager.shared.signup(
            name: name,
            email: email,
            phone: phone,
            password: password,
            referralCode: referralCode
        ) { [weak self] result in
            self?.setLoading(false)
            
            switch result {
            case .success(let response):
                if response.success, let token = response.token, let user = response.user {
                    TokenManager.shared.token = token
                    TokenManager.shared.currentUser = user
                    self?.delegate?.signupViewControllerDidSignup(self!)
                } else {
                    self?.showError(response.message ?? "Signup failed")
                }
            case .failure(let error):
                self?.showError(error.localizedDescription)
            }
        }
    }
    
    @objc private func dismissKeyboard() {
        view.endEditing(true)
    }
    
    // MARK: - Helpers
    
    private func setLoading(_ loading: Bool) {
        signupButton.isEnabled = !loading
        [nameTextField, emailTextField, phoneTextField, passwordTextField, confirmPasswordTextField, referralTextField].forEach {
            $0.isEnabled = !loading
        }
        
        if loading {
            signupButton.setTitle("", for: .normal)
            activityIndicator.startAnimating()
        } else {
            signupButton.setTitle("Sign Up", for: .normal)
            activityIndicator.stopAnimating()
        }
    }
    
    private func showError(_ message: String) {
        errorLabel.text = message
        errorLabel.isHidden = false
    }
    
    private func hideError() {
        errorLabel.isHidden = true
    }
}
