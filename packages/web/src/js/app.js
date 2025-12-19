// Demony - Main Application Entry Point
import { Router } from './router.js';
import { Api } from './api.js';
import { renderHome } from './pages/home.js';
import { renderProjects } from './pages/projects.js';
import { renderInvestments } from './pages/investments.js';
import { renderPortfolio } from './pages/portfolio.js';
import { renderAdmin } from './pages/admin.js';
import { renderBusinessDashboard } from './pages/business.js';
import { renderWallet } from './pages/wallet.js';
import { renderProfile } from './pages/profile.js';
import { renderTerms, renderPrivacy, renderRiskDisclosure, renderAgreementModal } from './pages/legal.js';

// Initialize API client
const api = new Api();

// Theme Logic
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
if (themeToggle) {
  themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  });
}

// Initialize Router
const router = new Router('main-content');

// Register routes
router.addRoute('home', function(container) { renderHome(container, api); });
router.addRoute('projects', function(container) { renderProjects(container, api); });
router.addRoute('investments', function(container) { renderInvestments(container, api); });
router.addRoute('portfolio', function(container) { renderPortfolio(container, api); });
router.addRoute('wallet', function(container) { renderWallet(container, api); });
router.addRoute('profile', function(container) { renderProfile(container, api); });
router.addRoute('admin', function(container) { renderAdmin(container, api); });
router.addRoute('business', function(container) { renderBusinessDashboard(container, api); });
// Legal pages
router.addRoute('terms', function(container) { renderTerms(container); });
router.addRoute('privacy', function(container) { renderPrivacy(container); });
router.addRoute('risk', function(container) { renderRiskDisclosure(container); });

// Expose app globally
window.DemonyApp = {
  router: router,
  api: api
};

// Navigation event listeners (delegated so new links work too)
var navLinksEl = document.getElementById('nav-links');
if (navLinksEl) {
  navLinksEl.addEventListener('click', function(e) {
    var target = e.target.closest('[data-page]');
    if (!target) return;
    e.preventDefault();
    var page = target.getAttribute('data-page');
    router.navigate(page);
    // Close mobile menu after navigation
    navLinksEl.classList.remove('active');
    var authButtons = document.getElementById('auth-buttons');
    if (authButtons) authButtons.classList.remove('active');
    var mobileBtn = document.getElementById('mobile-menu-btn');
    if (mobileBtn) mobileBtn.classList.remove('active');
  });
}

// Mobile Menu Toggle
var mobileMenuBtn = document.getElementById('mobile-menu-btn');
if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', function() {
    var navLinks = document.getElementById('nav-links');
    var authButtons = document.getElementById('auth-buttons');
    if (navLinks) navLinks.classList.toggle('active');
    if (authButtons) authButtons.classList.toggle('active');
    this.classList.toggle('active');
  });
}

// Auth State Management
function updateAuthState() {
  var user = localStorage.getItem('demony_user');
  var authButtons = document.getElementById('auth-buttons');
  var userMenu = document.getElementById('user-menu');
  var navLinks = document.getElementById('nav-links');
  
  // Remove old role-based nav items
  var removableLinks = document.querySelectorAll('[data-page="admin"], [data-page="business"]');
  removableLinks.forEach(function(link) {
    if (link.parentElement) link.parentElement.remove();
  });
  
  if (user) {
    user = JSON.parse(user);
    if (authButtons) authButtons.style.display = 'none';
    if (userMenu) {
      userMenu.style.display = 'flex';
      var userName = document.getElementById('user-name');
      if (userName) userName.textContent = user.name;
    }
    
    // Hide investor-specific links for admin and business owners
    var investorLinks = document.querySelectorAll('[data-page="projects"], [data-page="wallet"], [data-page="investments"], [data-page="portfolio"]');
    if (user.role === 'admin' || user.role === 'business_owner') {
      investorLinks.forEach(function(link) {
        if (link.parentElement) link.parentElement.style.display = 'none';
      });
    } else {
      investorLinks.forEach(function(link) {
        if (link.parentElement) link.parentElement.style.display = '';
      });
    }
    
    // Add role-based navigation
    if (navLinks && user.role === 'admin') {
      var adminLi = document.createElement('li');
      adminLi.innerHTML = '<a href="#" data-page="admin">Admin Dashboard</a>';
      navLinks.appendChild(adminLi);
      adminLi.querySelector('a').addEventListener('click', function(e) {
        e.preventDefault();
        router.navigate('admin');
      });
      // Auto-navigate to admin on login if on home
      if (window.location.hash === '' || window.location.hash === '#home') {
        router.navigate('admin');
      }
    }
    
    if (navLinks && user.role === 'business_owner') {
      var businessLi = document.createElement('li');
      businessLi.innerHTML = '<a href="#" data-page="business">My Business</a>';
      navLinks.appendChild(businessLi);
      businessLi.querySelector('a').addEventListener('click', function(e) {
        e.preventDefault();
        router.navigate('business');
      });
    }
  } else {
    if (authButtons) authButtons.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
    // Show all investor links when logged out
    var investorLinks = document.querySelectorAll('[data-page="projects"], [data-page="wallet"], [data-page="investments"], [data-page="portfolio"]');
    investorLinks.forEach(function(link) {
      if (link.parentElement) link.parentElement.style.display = '';
    });
  }
}

// Initial auth check
updateAuthState();

// Logout
var logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    api.logout();
    updateAuthState();
    router.navigate('home');
  });
}

// Auth button listeners
var loginBtn = document.getElementById('login-btn');
if (loginBtn) {
  loginBtn.addEventListener('click', function() {
    showAuthModal('login');
  });
}

var signupBtn = document.getElementById('signup-btn');
if (signupBtn) {
  signupBtn.addEventListener('click', function() {
    showAuthModal('signup');
  });
}

// Auth Modal
function showAuthModal(type) {
  var modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'auth-modal';
  
  var title = type === 'login' ? 'Welcome Back' : 'Create Account';
  var submitText = type === 'login' ? 'Login' : 'Continue';
  
  var roleSelect = type === 'signup' ? 
    '<div class="form-group">' +
      '<label for="role">I want to</label>' +
      '<select id="role" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background: var(--surface-color); color: var(--text-color);">' +
        '<option value="investor">Invest in projects</option>' +
        '<option value="business_owner">Submit my business for funding</option>' +
      '</select>' +
    '</div>' : '';
  
  var businessFields = type === 'signup' ?
    '<div id="business-fields" style="display: none;">' +
      '<div class="form-group">' +
        '<label for="phone">Phone Number</label>' +
        '<input type="tel" id="phone" placeholder="+1234567890">' +
      '</div>' +
      '<div class="form-group">' +
        '<label for="businessName">Business Name</label>' +
        '<input type="text" id="businessName" placeholder="Your business name">' +
      '</div>' +
    '</div>' : '';
  
  var legalNotice = type === 'signup' ?
    '<p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 1rem; text-align: center;">' +
      'By signing up, you\'ll be asked to accept our ' +
      '<a href="#terms" style="color: var(--primary-color);">Terms</a>, ' +
      '<a href="#privacy" style="color: var(--primary-color);">Privacy Policy</a>, and ' +
      '<a href="#risk" style="color: var(--primary-color);">Risk Disclosure</a>.' +
    '</p>' : '';
  
  modal.innerHTML = 
    '<div class="modal-content">' +
      '<div style="text-align: center; margin-bottom: 1.5rem;">' +
        '<span style="font-size: 2.5rem;">💎</span>' +
        '<h2 style="margin-top: 0.5rem;">' + title + '</h2>' +
      '</div>' +
      '<form id="auth-form">' +
        (type === 'signup' ? '<div class="form-group"><label for="name">Full Name</label><input type="text" id="name" required placeholder="John Doe"></div>' : '') +
        '<div class="form-group">' +
          '<label for="email">Email</label>' +
          '<input type="email" id="email" required placeholder="you@example.com">' +
        '</div>' +
        '<div class="form-group">' +
          '<label for="password">Password</label>' +
          '<input type="password" id="password" required placeholder="••••••••"' + (type === 'signup' ? ' minlength="8"' : '') + '>' +
        '</div>' +
        roleSelect +
        businessFields +
        '<div class="form-actions" style="margin-top: 1.5rem;">' +
          '<button type="button" class="btn btn-outline" id="close-modal">Cancel</button>' +
          '<button type="submit" class="btn btn-primary">' + submitText + '</button>' +
        '</div>' +
        legalNotice +
      '</form>' +
    '</div>';
  
  document.body.appendChild(modal);
  
  // Toggle business fields visibility
  if (type === 'signup') {
    var roleEl = document.getElementById('role');
    var businessFieldsEl = document.getElementById('business-fields');
    if (roleEl && businessFieldsEl) {
      roleEl.addEventListener('change', function() {
        businessFieldsEl.style.display = this.value === 'business_owner' ? 'block' : 'none';
      });
    }
  }
  
  document.getElementById('close-modal').addEventListener('click', function() {
    modal.remove();
  });
  
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  document.getElementById('auth-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var name = type === 'signup' ? document.getElementById('name').value : null;
    var role = type === 'signup' ? document.getElementById('role').value : null;
    var phone = type === 'signup' ? (document.getElementById('phone').value || null) : null;
    var businessName = type === 'signup' ? (document.getElementById('businessName').value || null) : null;
    
    if (type === 'login') {
      // Login flow - no agreement needed
      api.login({ email: email, password: password })
        .then(function() {
          modal.remove();
          updateAuthState();
          navigateAfterAuth();
        })
        .catch(function(err) {
          alert(err.message);
        });
    } else {
      // Signup flow - show agreement modal first
      var signupData = {
        name: name,
        email: email,
        password: password,
        role: role,
        phone: phone,
        businessName: businessName,
        agreedToTerms: true,
        agreedToPrivacy: true,
        agreedToRisk: true,
        agreementDate: new Date().toISOString()
      };
      
      modal.remove();
      
      // Show agreement modal
      renderAgreementModal(
        function onAccept() {
          // User accepted - proceed with signup
          api.signup(signupData)
            .then(function() {
              updateAuthState();
              navigateAfterAuth();
              // Show welcome message
              showWelcomeMessage(name);
            })
            .catch(function(err) {
              alert(err.message);
            });
        },
        function onDecline() {
          // User declined - show message
          alert('You must accept the terms to create an account.');
        }
      );
    }
  });
}

function navigateAfterAuth() {
  var user = api.user;
  if (user && user.role === 'admin') {
    router.navigate('admin');
  } else if (user && user.role === 'business_owner') {
    router.navigate('business');
  } else {
    router.navigate('portfolio');
  }
  // Close mobile menu after auth
  var navLinks = document.getElementById('nav-links');
  var authButtons = document.getElementById('auth-buttons');
  var mobileBtn = document.getElementById('mobile-menu-btn');
  if (navLinks) navLinks.classList.remove('active');
  if (authButtons) authButtons.classList.remove('active');
  if (mobileBtn) mobileBtn.classList.remove('active');
}

function showWelcomeMessage(name) {
  var toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = 
    '<div style="display: flex; align-items: center; gap: 0.75rem;">' +
      '<span style="font-size: 1.5rem;">🎉</span>' +
      '<div>' +
        '<strong>Welcome to Demony, ' + (name || 'Investor') + '!</strong>' +
        '<p style="margin: 0; font-size: 0.875rem; opacity: 0.9;">Your account has been created successfully.</p>' +
      '</div>' +
    '</div>';
  document.body.appendChild(toast);
  
  setTimeout(function() {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(function() {
    toast.classList.remove('show');
    setTimeout(function() { toast.remove(); }, 300);
  }, 4000);
}

// Footer link handlers
var footerLinks = document.querySelectorAll('.footer-links a');
footerLinks.forEach(function(link) {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    var page = this.getAttribute('data-page');
    if (page) {
      router.navigate(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
});

// Mobile Tab Bar handlers
var mobileTabBar = document.getElementById('mobile-tab-bar');
if (mobileTabBar) {
  mobileTabBar.addEventListener('click', function(e) {
    var target = e.target.closest('.tab-item');
    if (!target) return;
    e.preventDefault();
    var page = target.getAttribute('data-page');
    if (page) {
      router.navigate(page);
    }
  });
}

// Update active nav link on route change
function updateActiveNavLink() {
  var currentHash = window.location.hash.replace('#', '') || 'home';
  
  // Update desktop nav links
  var navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(function(link) {
    var page = link.getAttribute('data-page');
    if (page === currentHash) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
  
  // Update mobile tab bar
  var tabItems = document.querySelectorAll('.mobile-tab-bar .tab-item');
  tabItems.forEach(function(tab) {
    var page = tab.getAttribute('data-page');
    if (page === currentHash) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}

window.addEventListener('hashchange', updateActiveNavLink);
updateActiveNavLink();

// Initial navigation - honor current hash
router.init('home');
