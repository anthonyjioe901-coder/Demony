// Demony - Main Application Entry Point
import { Router } from './router.js';
import { Api } from './api.js';
import { renderHome } from './pages/home.js';
import { renderProjects } from './pages/projects.js';
import { renderInvestments } from './pages/investments.js';
import { renderPortfolio } from './pages/portfolio.js';
import { renderAdmin } from './pages/admin.js';
import { renderBusinessDashboard } from './pages/business.js';

// Initialize API client
const api = new Api();

// Initialize Router
const router = new Router('main-content');

// Register routes
router.addRoute('home', function(container) { renderHome(container, api); });
router.addRoute('projects', function(container) { renderProjects(container, api); });
router.addRoute('investments', function(container) { renderInvestments(container, api); });
router.addRoute('portfolio', function(container) { renderPortfolio(container, api); });
router.addRoute('admin', function(container) { renderAdmin(container, api); });
router.addRoute('business', function(container) { renderBusinessDashboard(container, api); });

// Expose app globally
window.DemonyApp = {
  router: router,
  api: api
};

// Navigation event listeners
document.querySelectorAll('[data-page]').forEach(function(link) {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    var page = this.getAttribute('data-page');
    router.navigate(page);
    // Close mobile menu after navigation
    var navLinks = document.getElementById('nav-links');
    if (navLinks) navLinks.classList.remove('active');
  });
});

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
  var oldAdminLink = document.querySelector('[data-page="admin"]');
  var oldBusinessLink = document.querySelector('[data-page="business"]');
  if (oldAdminLink && oldAdminLink.parentElement) oldAdminLink.parentElement.remove();
  if (oldBusinessLink && oldBusinessLink.parentElement) oldBusinessLink.parentElement.remove();
  
  if (user) {
    user = JSON.parse(user);
    if (authButtons) authButtons.style.display = 'none';
    if (userMenu) {
      userMenu.style.display = 'flex';
      var userName = document.getElementById('user-name');
      if (userName) userName.textContent = user.name;
    }
    
    // Add role-based navigation
    if (navLinks && user.role === 'admin') {
      var adminLi = document.createElement('li');
      adminLi.innerHTML = '<a href="#" data-page="admin">Admin</a>';
      navLinks.appendChild(adminLi);
      adminLi.querySelector('a').addEventListener('click', function(e) {
        e.preventDefault();
        router.navigate('admin');
      });
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
  
  var title = type === 'login' ? 'Login' : 'Sign Up';
  var submitText = type === 'login' ? 'Login' : 'Create Account';
  
  var roleSelect = type === 'signup' ? 
    '<div class="form-group">' +
      '<label for="role">I want to</label>' +
      '<select id="role" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">' +
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
  
  modal.innerHTML = 
    '<div class="modal-content">' +
      '<h2>' + title + '</h2>' +
      '<form id="auth-form">' +
        (type === 'signup' ? '<div class="form-group"><label for="name">Full Name</label><input type="text" id="name" required></div>' : '') +
        '<div class="form-group">' +
          '<label for="email">Email</label>' +
          '<input type="email" id="email" required>' +
        '</div>' +
        '<div class="form-group">' +
          '<label for="password">Password</label>' +
          '<input type="password" id="password" required>' +
        '</div>' +
        roleSelect +
        businessFields +
        '<div class="form-actions">' +
          '<button type="button" class="btn btn-outline" id="close-modal">Cancel</button>' +
          '<button type="submit" class="btn btn-primary">' + submitText + '</button>' +
        '</div>' +
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
    
    var promise = type === 'login' 
      ? api.login({ email: email, password: password })
      : api.signup({ 
          name: name, 
          email: email, 
          password: password, 
          role: role,
          phone: phone,
          businessName: businessName
        });
      
    promise.then(function() {
      modal.remove();
      updateAuthState();
      // Navigate based on role
      var user = api.user;
      if (user && user.role === 'admin') {
        router.navigate('admin');
      } else if (user && user.role === 'business_owner') {
        router.navigate('business');
      } else {
        router.navigate('portfolio');
      }
    }).catch(function(err) {
      alert(err.message);
    });
  });
}

// Initial navigation - honor current hash
router.init('home');
