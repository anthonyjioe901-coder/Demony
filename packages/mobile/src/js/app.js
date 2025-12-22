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
      '<div class="list-item" id="support-btn">' +
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

  // Support button
  document.getElementById('support-btn').addEventListener('click', showSupportModal);

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
  var raised = Number(project.raised_amount) || 0;
  var percent = Math.round((raised / (Number(project.goal_amount) || 0)) * 100) || 0;

  return '<div class="project-item">' +
    '<div class="icon">' + (project.image_url || '🏢') + '</div>' +
    '<div class="info">' +
      '<div class="name">' + project.name + '</div>' +
      '<div class="category">' + (project.category || 'General') + '</div>' +
    '</div>' +
    '<div class="progress">' +
      '<div class="amount">$' + ((raised / 1000).toFixed(0) || '0') + 'k</div>' +
      '<div class="percent">' + (percent || '0') + '%</div>' +
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

// Support Modal
function showSupportModal() {
  var user = JSON.parse(localStorage.getItem('demony_user'));
  var modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = 
    '<div class="modal-content" style="max-height: 90vh; overflow-y: auto;">' +
      '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">' +
        '<h2>Help & Support</h2>' +
        '<button class="btn btn-icon" id="close-support-modal">✕</button>' +
      '</div>' +
      
      '<div class="card" style="background: var(--surface-elevated); margin-bottom: 1rem;">' +
        '<h3 style="font-size: 1rem; margin-bottom: 0.75rem;">Contact Us</h3>' +
        '<div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.9rem;">' +
          '<a href="tel:+233249251305" style="display: flex; align-items: center; gap: 0.5rem; color: var(--primary-color); text-decoration: none;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> +233 24 925 1305</a>' +
          '<a href="https://wa.me/233249251305" target="_blank" style="display: flex; align-items: center; gap: 0.5rem; color: #25D366; text-decoration: none;"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> WhatsApp</a>' +
          '<a href="mailto:support@demony.com" style="display: flex; align-items: center; gap: 0.5rem; color: var(--primary-color); text-decoration: none;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M22 7l-10 7L2 7"></path></svg> support@demony.com</a>' +
        '</div>' +
        '<p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.75rem;">Mon-Fri: 9AM-6PM GMT</p>' +
      '</div>' +
      
      '<form id="support-form">' +
        '<h3 style="font-size: 1rem; margin-bottom: 0.75rem;">Submit a Ticket</h3>' +
        '<div class="form-group">' +
          '<label>Category</label>' +
          '<select id="support-category" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px;">' +
            '<option value="">Select...</option>' +
            '<option value="account">Account Issues</option>' +
            '<option value="deposit">Deposits</option>' +
            '<option value="withdrawal">Withdrawals</option>' +
            '<option value="investment">Investments</option>' +
            '<option value="technical">Technical Problem</option>' +
            '<option value="feedback">Feedback</option>' +
            '<option value="other">Other</option>' +
          '</select>' +
        '</div>' +
        '<div class="form-group">' +
          '<label>Subject</label>' +
          '<input type="text" id="support-subject" required placeholder="Brief description" />' +
        '</div>' +
        '<div class="form-group">' +
          '<label>Email</label>' +
          '<input type="email" id="support-email" required value="' + (user ? user.email : '') + '" placeholder="Your email" />' +
        '</div>' +
        '<div class="form-group">' +
          '<label>Message</label>' +
          '<textarea id="support-message" required rows="4" placeholder="Describe your issue..." style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; resize: vertical;"></textarea>' +
        '</div>' +
        '<button type="submit" class="btn btn-primary" style="width: 100%;">Submit Ticket</button>' +
      '</form>' +
    '</div>';
  
  document.body.appendChild(modal);
  
  document.getElementById('close-support-modal').addEventListener('click', function() {
    modal.remove();
  });
  
  document.getElementById('support-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    var ticketData = {
      category: document.getElementById('support-category').value,
      subject: document.getElementById('support-subject').value,
      email: document.getElementById('support-email').value,
      message: document.getElementById('support-message').value
    };
    
    api.submitSupportTicket(ticketData)
      .then(function(result) {
        modal.remove();
        showTicketSuccessModal(result.ticketId);
      })
      .catch(function(err) {
        alert('Failed to submit ticket: ' + err.message);
      });
  });
}

function showTicketSuccessModal(ticketId) {
  var successModal = document.createElement('div');
  successModal.className = 'modal active';
  successModal.innerHTML = 
    '<div class="modal-content" style="text-align: center;">' +
      '<div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>' +
      '<h2>Ticket Submitted!</h2>' +
      '<p style="color: var(--text-muted); margin-bottom: 1rem;">We\'ll respond within 24-48 hours.</p>' +
      '<div style="background: var(--surface-elevated); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">' +
        '<p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.25rem;">Your Ticket ID:</p>' +
        '<p style="font-size: 1.25rem; font-weight: 700; color: var(--primary-color); font-family: monospace;">' + ticketId + '</p>' +
      '</div>' +
      '<button class="btn btn-primary" id="close-success-modal" style="width: 100%;">Done</button>' +
    '</div>';
  
  document.body.appendChild(successModal);
  
  document.getElementById('close-success-modal').addEventListener('click', function() {
    successModal.remove();
  });
}

renderHome();

console.log('Demony Mobile App initialized');
