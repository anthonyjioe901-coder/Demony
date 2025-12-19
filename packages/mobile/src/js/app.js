// Demony Mobile App - Pure JavaScript
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar } from '@capacitor/status-bar';
import { Api } from './api.js';

// Initialize Capacitor plugins
if (Capacitor.isNativePlatform()) {
  StatusBar.setStyle({ style: 'Dark' });
  
  App.addListener('backButton', function(event) {
    if (event.canGoBack) {
      window.history.back();
    } else {
      App.exitApp();
    }
  });
}

// Initialize API
const api = new Api();

// Tab navigation
var currentTab = 'home';
var mainContent = document.getElementById('main-content');

document.querySelectorAll('.tab-item').forEach(function(tab) {
  tab.addEventListener('click', function() {
    var tabName = this.getAttribute('data-tab');
    switchTab(tabName);
  });
});

function switchTab(tabName) {
  // Update active tab
  document.querySelectorAll('.tab-item').forEach(function(tab) {
    tab.classList.remove('active');
    if (tab.getAttribute('data-tab') === tabName) {
      tab.classList.add('active');
    }
  });
  
  currentTab = tabName;
  renderTab(tabName);
}

function renderTab(tabName) {
  switch (tabName) {
    case 'home':
      renderHome();
      break;
    case 'projects':
      renderProjects();
      break;
    case 'investments':
      renderInvestments();
      break;
    case 'portfolio':
      renderPortfolio();
      break;
    case 'profile':
      renderProfile();
      break;
  }
}

// Home Tab
function renderHome() {
  mainContent.innerHTML = 
    '<div class="page-header">' +
      '<h1>Welcome to Demony</h1>' +
      '<p>Invest in local businesses</p>' +
    '</div>' +
    
    '<div id="home-stats" class="stats-grid">' +
      'Loading stats...' +
    '</div>' +
    
    '<div class="card">' +
      '<h3>Featured Projects</h3>' +
      '<div id="featured-projects" class="project-list">' +
        'Loading projects...' +
      '</div>' +
    '</div>';
    
  // Load data
  if (api.token) {
    api.getPortfolio().then(function(portfolio) {
      document.getElementById('home-stats').innerHTML = 
        '<div class="card stat-card">' +
          '<div class="value">$' + portfolio.currentValue.toLocaleString() + '</div>' +
          '<div class="label">Portfolio Value</div>' +
        '</div>' +
        '<div class="card stat-card">' +
          '<div class="value" style="color: var(--secondary-color);">+' + portfolio.returnPercent.toFixed(1) + '%</div>' +
          '<div class="label">Total Return</div>' +
        '</div>' +
        '<div class="card stat-card">' +
          '<div class="value">' + portfolio.activeInvestments + '</div>' +
          '<div class="label">Investments</div>' +
        '</div>';
    }).catch(function() {
      document.getElementById('home-stats').innerHTML = '<div>Please login to view stats</div>';
    });
  } else {
    document.getElementById('home-stats').innerHTML = 
      '<div class="card" style="grid-column: 1/-1; text-align: center;">' +
        '<p>Login to view your portfolio stats</p>' +
        '<button class="btn btn-primary" onclick="switchTab(\'profile\')">Login</button>' +
      '</div>';
  }
  
  api.getProjects({ sort: 'most-funded' }).then(function(response) {
    var projects = response.projects || response;
    document.getElementById('featured-projects').innerHTML = projects.slice(0, 3).map(function(p) {
      return createProjectItem(p);
    }).join('');
  });
}

// Projects Tab
function renderProjects() {
  mainContent.innerHTML = 
    '<div class="page-header">' +
      '<h1>Projects</h1>' +
      '<p>Browse investment opportunities</p>' +
    '</div>' +
    
    '<div id="projects-list" class="project-list">' +
      'Loading projects...' +
    '</div>';
    
  api.getProjects().then(function(response) {
    var projects = response.projects || response;
    document.getElementById('projects-list').innerHTML = projects.map(function(p) {
      return createProjectItem(p);
    }).join('');
    
    // Add click listeners for investment
    document.querySelectorAll('.invest-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var id = this.getAttribute('data-id');
        showInvestModal(id);
      });
    });
  });
}

// Investments Tab
function renderInvestments() {
  if (!api.token) {
    mainContent.innerHTML = 
      '<div class="page-header"><h1>My Investments</h1></div>' +
      '<div class="card" style="text-align: center; padding: 2rem;">' +
        '<p>Please login to view your investments</p>' +
        '<button class="btn btn-primary" onclick="switchTab(\'profile\')">Login</button>' +
      '</div>';
    return;
  }

  mainContent.innerHTML = 
    '<div class="page-header">' +
      '<h1>My Investments</h1>' +
      '<p>Track your active investments</p>' +
    '</div>' +
    
    '<div id="investment-summary">Loading...</div>' +
    
    '<div class="card">' +
      '<h3>Active Investments</h3>' +
      '<div id="active-investments" class="list-item-container">' +
        'Loading...' +
      '</div>' +
    '</div>';
    
  api.getPortfolio().then(function(portfolio) {
    document.getElementById('investment-summary').innerHTML = 
      '<div class="card">' +
        '<div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">' +
          '<div>' +
            '<div class="label" style="color: var(--text-muted);">Total Invested</div>' +
            '<div style="font-size: 1.5rem; font-weight: 700;">$' + portfolio.totalInvested.toLocaleString() + '</div>' +
          '</div>' +
          '<div style="text-align: right;">' +
            '<div class="label" style="color: var(--text-muted);">Current Value</div>' +
            '<div style="font-size: 1.5rem; font-weight: 700; color: var(--secondary-color);">$' + portfolio.currentValue.toLocaleString() + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="progress-bar"><div class="progress-fill" style="width: 100%;"></div></div>' +
      '</div>';
  });
  
  api.getMyInvestments().then(function(investments) {
    if (investments.length === 0) {
      document.getElementById('active-investments').innerHTML = '<p>No active investments</p>';
      return;
    }
    
    document.getElementById('active-investments').innerHTML = investments.map(function(inv) {
      var currentValue = parseFloat(inv.amount) * 1.1; // Mock growth
      return '<div class="list-item">' +
        '<div>' +
          '<div style="font-weight: 600;">' + (inv.project_name || 'Project #' + inv.project_id) + '</div>' +
          '<div style="font-size: 0.75rem; color: var(--text-muted);">Invested $' + parseFloat(inv.amount).toLocaleString() + '</div>' +
        '</div>' +
        '<div style="text-align: right;">' +
          '<div style="font-weight: 600; color: var(--secondary-color);">$' + currentValue.toLocaleString() + '</div>' +
          '<div style="font-size: 0.75rem; color: var(--text-muted);">+10%</div>' +
        '</div>' +
      '</div>';
    }).join('');
  });
}

// Portfolio Tab
function renderPortfolio() {
  if (!api.token) {
    mainContent.innerHTML = 
      '<div class="page-header"><h1>Portfolio</h1></div>' +
      '<div class="card" style="text-align: center; padding: 2rem;">' +
        '<p>Please login to view your portfolio</p>' +
        '<button class="btn btn-primary" onclick="switchTab(\'profile\')">Login</button>' +
      '</div>';
    return;
  }

  mainContent.innerHTML = 
    '<div class="page-header">' +
      '<h1>Portfolio</h1>' +
      '<p>Your investment overview</p>' +
    '</div>' +
    
    '<div id="portfolio-content">Loading...</div>';
    
  api.getPortfolio().then(function(portfolio) {
    var colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    
    document.getElementById('portfolio-content').innerHTML = 
      '<div class="card">' +
        '<h3>Portfolio Value</h3>' +
        '<div style="font-size: 2rem; font-weight: 700; color: var(--primary-color); margin: 0.5rem 0;">$' + portfolio.currentValue.toLocaleString() + '</div>' +
        '<div style="color: var(--secondary-color);">+$' + portfolio.totalReturn.toLocaleString() + ' (' + portfolio.returnPercent.toFixed(1) + '%) all time</div>' +
      '</div>' +
      
      '<div class="card">' +
        '<h3>Allocation</h3>' +
        portfolio.allocation.map(function(item, index) {
          return createAllocationBar(item.category, item.percent, colors[index % colors.length]);
        }).join('') +
      '</div>' +
      
      '<div class="stats-grid">' +
        '<div class="card stat-card">' +
          '<div class="value">' + portfolio.riskLevel + '</div>' +
          '<div class="label">Risk Level</div>' +
        '</div>' +
        '<div class="card stat-card">' +
          '<div class="value">' + portfolio.diversificationScore + '</div>' +
          '<div class="label">Diversification</div>' +
        '</div>' +
      '</div>';
  });
}

// Profile Tab
function renderProfile() {
  var user = JSON.parse(localStorage.getItem('demony_user'));
  
  mainContent.innerHTML = 
    '<div class="page-header">' +
      '<h1>Profile</h1>' +
      '<p>Manage your account</p>' +
    '</div>' +
    
    '<div class="card" style="text-align: center;">' +
      '<div style="width: 80px; height: 80px; border-radius: 50%; background: var(--primary-color); margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 2rem;">👤</div>' +
      '<h3>' + (user ? user.name : 'Guest User') + '</h3>' +
      '<p style="color: var(--text-muted);">' + (user ? user.email : 'Sign in to access your investments') + '</p>' +
      (user 
        ? '<button class="btn btn-outline" style="margin-top: 1rem;" id="logout-btn">Sign Out</button>'
        : '<button class="btn btn-primary" style="margin-top: 1rem;" id="signin-btn">Sign In</button>'
      ) +
    '</div>' +
    
    '<div class="card">' +
      '<h3>Settings</h3>' +
      '<div class="list-item">' +
        '<span>Notifications</span>' +
        '<span>→</span>' +
      '</div>' +
      '<div class="list-item">' +
        '<span>Security</span>' +
        '<span>→</span>' +
      '</div>' +
      '<div class="list-item">' +
        '<span>Help & Support</span>' +
        '<span>→</span>' +
      '</div>' +
      '<div class="list-item">' +
        '<span>About</span>' +
        '<span>→</span>' +
      '</div>' +
    '</div>';
  
  if (user) {
    document.getElementById('logout-btn').addEventListener('click', function() {
      api.logout();
      renderProfile();
    });
  } else {
    document.getElementById('signin-btn').addEventListener('click', showSignInModal);
  }
}

// Helper functions
function createProjectItem(project) {
  var percent = Math.round((project.raised_amount / project.goal_amount) * 100);
  return '<div class="project-item">' +
    '<div class="icon">' + (project.image_url || '🏢') + '</div>' +
    '<div class="info">' +
      '<div class="name">' + project.name + '</div>' +
      '<div class="category">' + (project.category || 'General') + '</div>' +
    '</div>' +
    '<div class="progress">' +
      '<div class="amount">$' + (project.raised_amount / 1000).toFixed(0) + 'k</div>' +
      '<div class="percent">' + percent + '%</div>' +
    '</div>' +
    '<button class="btn btn-sm btn-primary invest-btn" data-id="' + project.id + '" style="margin-left: 0.5rem;">Invest</button>' +
  '</div>';
}

function createAllocationBar(name, percent, color) {
  return '<div style="margin-bottom: 0.75rem;">' +
    '<div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem; font-size: 0.875rem;">' +
      '<span>' + name + '</span>' +
      '<span>' + percent + '%</span>' +
    '</div>' +
    '<div class="progress-bar"><div class="progress-fill" style="width: ' + percent + '%; background-color: ' + (color || 'var(--primary-color)') + ';"></div></div>' +
  '</div>';
}

function showSignInModal() {
  var modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = 
    '<div class="modal-content">' +
      '<h2>Sign In</h2>' +
      '<form id="signin-form">' +
        '<div class="form-group">' +
          '<label for="email">Email</label>' +
          '<input type="email" id="email" required>' +
        '</div>' +
        '<div class="form-group">' +
          '<label for="password">Password</label>' +
          '<input type="password" id="password" required>' +
        '</div>' +
        '<button type="submit" class="btn btn-primary">Sign In</button>' +
      '</form>' +
      '<button class="btn btn-outline" style="margin-top: 0.75rem;" id="close-modal">Cancel</button>' +
    '</div>';
  
  document.body.appendChild(modal);
  
  document.getElementById('close-modal').addEventListener('click', function() {
    modal.remove();
  });
  
  document.getElementById('signin-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    
    api.login({ email: email, password: password })
      .then(function() {
        modal.remove();
        renderProfile();
      })
      .catch(function(err) {
        alert('Login failed: ' + err.message);
      });
  });
}

function showInvestModal(projectId) {
  if (!api.token) {
    alert('Please login to invest');
    switchTab('profile');
    return;
  }
  
  var modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = 
    '<div class="modal-content">' +
      '<h2>Invest</h2>' +
      '<form id="invest-form">' +
        '<div class="form-group">' +
          '<label for="amount">Amount ($)</label>' +
          '<input type="number" id="amount" min="100" step="100" required>' +
        '</div>' +
        '<button type="submit" class="btn btn-primary">Confirm</button>' +
      '</form>' +
      '<button class="btn btn-outline" style="margin-top: 0.75rem;" id="close-invest-modal">Cancel</button>' +
    '</div>';
  
  document.body.appendChild(modal);
  
  document.getElementById('close-invest-modal').addEventListener('click', function() {
    modal.remove();
  });
  
  document.getElementById('invest-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var amount = document.getElementById('amount').value;
    
    api.invest({ projectId: projectId, amount: amount })
      .then(function() {
        alert('Investment successful!');
        modal.remove();
        renderTab(currentTab); // Refresh current tab
      })
      .catch(function(err) {
        alert('Investment failed: ' + err.message);
      });
  });
}

// Initialize app
renderHome();

console.log('Demony Mobile App initialized');
