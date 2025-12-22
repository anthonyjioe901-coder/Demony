// Demony Mobile App - Pure JavaScript
import { Capacitor } from '@capacitor/core';
import { Api } from './api.js';

// Initialize Capacitor plugins
if (Capacitor.isNativePlatform()) {
  // Note: keep plugin imports dynamic so the web/Vite dev build doesn't choke
  // on Capacitor plugin export shapes.
  Promise.all([
    import('@capacitor/app'),
    import('@capacitor/status-bar')
  ])
    .then(function(mods) {
      var App = mods[0].App;
      var StatusBar = mods[1].StatusBar;
      var StatusBarStyle = mods[1].Style;

      if (StatusBar && StatusBarStyle) {
        StatusBar.setStyle({ style: StatusBarStyle.Dark });
      }

      if (App) {
        App.addListener('backButton', function(event) {
          if (event.canGoBack) {
            window.history.back();
          } else {
            App.exitApp();
          }
        });
      }
    })
    .catch(function() {
      // No-op: running in browser or plugin unavailable.
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
    case 'wallet':
      renderWallet();
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
      var statsContainer = document.getElementById('home-stats');
      if (statsContainer) {
        statsContainer.innerHTML = 
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
      }
    }).catch(function() {
      var statsContainer = document.getElementById('home-stats');
      if (statsContainer) {
        statsContainer.innerHTML = '<div>Please login to view stats</div>';
      }
    });
  } else {
    var statsContainer = document.getElementById('home-stats');
    if (statsContainer) {
      statsContainer.innerHTML = 
        '<div class="card" style="grid-column: 1/-1; text-align: center;">' +
          '<p>Login to view your portfolio stats</p>' +
          '<button class="btn btn-primary" onclick="switchTab(\'profile\')">Login</button>' +
        '</div>';
    }
  }
  
  api.getProjects({ sort: 'most-funded' }).then(function(response) {
    var projects = response.projects || response;
    var container = document.getElementById('featured-projects');
    if (container) {
      container.innerHTML = projects.slice(0, 3).map(function(p) {
        return createProjectItem(p);
      }).join('');
    }
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
    var list = document.getElementById('projects-list');
    if (list) {
      list.innerHTML = projects.map(function(p) {
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
    }
  });
}

// Wallet Tab
function renderWallet() {
  if (!api.token) {
    mainContent.innerHTML = 
      '<div class="page-header"><h1>Wallet</h1></div>' +
      '<div class="card" style="text-align: center; padding: 2rem;">' +
        '<p>Please login to access your wallet</p>' +
        '<button class="btn btn-primary" onclick="switchTab(\'profile\')">Login</button>' +
      '</div>';
    return;
  }

  mainContent.innerHTML = 
    '<div class="page-header">' +
      '<h1>Wallet</h1>' +
      '<p>Manage your funds</p>' +
    '</div>' +
    
    '<div id="wallet-balance" class="stats-grid">Loading...</div>' +
    
    '<div style="display: flex; gap: 0.75rem; margin: 1rem 0;">' +
      '<button class="btn btn-primary" style="flex: 1;" id="deposit-btn">Deposit</button>' +
      '<button class="btn btn-outline" style="flex: 1;" id="withdraw-btn">Withdraw</button>' +
    '</div>' +
    
    '<div class="card">' +
      '<h3>Recent Transactions</h3>' +
      '<div id="transactions-list" class="list-item-container">' +
        'Loading...' +
      '</div>' +
    '</div>';
    
  api.getWalletBalance().then(function(data) {
    var balanceEl = document.getElementById('wallet-balance');
    if (balanceEl) {
      balanceEl.innerHTML = 
        '<div class="card stat-card">' +
          '<div class="value">GH₵' + data.balance.toLocaleString() + '</div>' +
          '<div class="label">Available Balance</div>' +
        '</div>' +
        '<div class="card stat-card">' +
          '<div class="value">GH₵' + data.totalInvested.toLocaleString() + '</div>' +
          '<div class="label">Total Invested</div>' +
        '</div>' +
        '<div class="card stat-card">' +
          '<div class="value">GH₵' + data.totalEarnings.toLocaleString() + '</div>' +
          '<div class="label">Total Earnings</div>' +
        '</div>';
    }
  }).catch(function() {
    var balanceEl = document.getElementById('wallet-balance');
    if (balanceEl) {
      balanceEl.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #ef4444;">Error loading balance</div>';
    }
  });
  
  api.getTransactions({ limit: 10 }).then(function(data) {
    var txList = document.getElementById('transactions-list');
    if (!txList) return;

    if (!data.transactions || data.transactions.length === 0) {
      txList.innerHTML = '<p>No transactions yet</p>';
      return;
    }
    
    txList.innerHTML = data.transactions.map(function(tx) {
      var isCredit = tx.amount > 0;
      var icon = { 'deposit': '💰', 'withdrawal': '📤', 'investment': '📊', 'profit': '💵' }[tx.type] || '💳';
      return '<div class="list-item">' +
        '<div style="display: flex; align-items: center; gap: 0.75rem;">' +
          '<div style="font-size: 1.5rem;">' + icon + '</div>' +
          '<div>' +
            '<div style="font-weight: 600;">' + tx.type.replace('_', ' ').toUpperCase() + '</div>' +
            '<div style="font-size: 0.75rem; color: var(--text-muted);">' + new Date(tx.createdAt).toLocaleDateString() + '</div>' +
          '</div>' +
        '</div>' +
        '<div style="text-align: right;">' +
          '<div style="font-weight: 700; color: ' + (isCredit ? 'var(--secondary-color)' : '#ef4444') + ';">' +
            (isCredit ? '+' : '') + 'GH₵' + Math.abs(tx.amount).toLocaleString() +
          '</div>' +
          '<div style="font-size: 0.75rem; color: var(--text-muted);">' + tx.status + '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }).catch(function() {
    var txList = document.getElementById('transactions-list');
    if (txList) {
      txList.innerHTML = '<p style="color: #ef4444;">Error loading transactions</p>';
    }
  });
  
  document.getElementById('deposit-btn').addEventListener('click', function() {
    var amount = prompt('Enter deposit amount (GH₵):');
    if (amount && parseFloat(amount) >= 100) {
      api.initializeDeposit(parseFloat(amount))
        .then(function(result) {
          window.open(result.authorization_url, '_blank');
          alert('Complete payment in the opened window');
        })
        .catch(function(err) {
          alert('Error: ' + err.message);
        });
    } else if (amount) {
      alert('Minimum deposit is GH₵100');
    }
  });
  
  document.getElementById('withdraw-btn').addEventListener('click', function() {
    alert('Withdrawal feature coming soon. Contact support for withdrawals.');
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
    var content = document.getElementById('portfolio-content');
    if (!content) return;

    var colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    
    content.innerHTML = 
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
      '<div class="list-item" id="theme-toggle">' +
        '<span>Dark Mode</span>' +
        '<span id="theme-icon">🌙</span>' +
      '</div>' +
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
  
  // Theme Toggle Logic
  var currentTheme = localStorage.getItem('theme') || 'light';
  var themeIcon = document.getElementById('theme-icon');
  themeIcon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
  
  document.getElementById('theme-toggle').addEventListener('click', function() {
    var newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  });

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

  // First fetch project details
  api.getProject(projectId).then(function(project) {
    // Ensure lockInPeriod is a number
    var lockInPeriod = parseInt(project.lock_in_period_months) || parseInt(project.duration) || 12;
    var minInvestment = project.min_investment || 100;

    var modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML =
      '<div class="modal-content">' +
        '<h2>Invest in ' + project.name + '</h2>' +
        '<div id="wallet-info" style="background: var(--surface-secondary); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">Loading...</div>' +
        '<form id="invest-form">' +
          '<div class="form-group">' +
            '<label for="amount">Amount (GH₵)</label>' +
            '<input type="number" id="amount" min="' + minInvestment + '" step="1" required>' +
            '<small style="color: var(--text-muted);">Minimum investment: GH₵' + minInvestment + '</small>' +
          '</div>' +
          '<div class="form-group">' +
            '<label>Payment Method</label>' +
            '<select id="payment-method" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background: var(--surface-color); color: var(--text-primary);">' +
              '<option value="wallet">Wallet Balance</option>' +
              '<option value="paystack">Pay with Paystack</option>' +
            '</select>' +
          '</div>' +
          '<button type="submit" class="btn btn-primary">Invest Now</button>' +
        '</form>' +
        '<button class="btn btn-outline" style="margin-top: 0.75rem;" id="close-invest-modal">Cancel</button>' +
      '</div>';

    document.body.appendChild(modal);

    // Load wallet balance
    api.getWalletBalance().then(function(data) {
      document.getElementById('wallet-info').innerHTML =
        '<div style="display: flex; justify-content: space-between; align-items: center;">' +
          '<span style="color: var(--text-muted);">Wallet Balance</span>' +
          '<span style="font-weight: 700; color: var(--primary-color); font-size: 1.125rem;">GH₵' + data.balance.toLocaleString() + '</span>' +
        '</div>';
    }).catch(function() {
      document.getElementById('wallet-info').innerHTML = '<p style="color: #ef4444; font-size: 0.875rem;">Could not load wallet balance</p>';
    });

    document.getElementById('close-invest-modal').addEventListener('click', function() {
      modal.remove();
    });

    document.getElementById('invest-form').addEventListener('submit', function(e) {
      e.preventDefault();
      var amount = parseFloat(document.getElementById('amount').value);
      var method = document.getElementById('payment-method').value;

      if (method === 'wallet') {
        // Use wallet balance
        api.invest({ projectId: projectId, amount: amount })
          .then(function() {
            alert('Investment successful!');
            modal.remove();
            renderTab(currentTab);
          })
          .catch(function(err) {
            alert('Investment failed: ' + err.message);
          });
      } else {
        // Use Paystack
        api.investWithPaystack({ projectId: projectId, amount: amount })
          .then(function(result) {
            window.open(result.authorization_url, '_blank');
            alert('Complete payment in the opened window');
            modal.remove();
          })
          .catch(function(err) {
            alert('Payment initialization failed: ' + err.message);
          });
      }
    });
  }).catch(function(err) {
    alert('Error loading project: ' + err.message);
  });
}

// Initialize app
// Initialize Theme
var savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

renderHome();

console.log('Demony Mobile App initialized');
