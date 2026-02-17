import { escapeHtml, escapeAttr } from '../utils.js';

// Professional Admin Dashboard - Complete Redesign
// Features: Sidebar navigation, Stats dashboard, User management, Support tickets, Reports

function renderAdmin(container, api) {
  var user = api.user;
  if (!user || user.role !== 'admin') {
    container.innerHTML = '<section class="admin-denied"><h2>Access Denied</h2><p>Admin privileges required.</p></section>';
    return;
  }
  
  var adminApi = api.getAdmin();
  
  // Store refs for inline onclick handlers (non-enumerable to prevent casual console discovery)
  Object.defineProperty(window, '_adminApi', { value: adminApi, configurable: true, writable: true, enumerable: false });
  Object.defineProperty(window, '_api', { value: api, configurable: true, writable: true, enumerable: false });
  
  var html = 
    '<div class="admin-layout">' +
      // Sidebar
      '<aside class="admin-sidebar" id="admin-sidebar">' +
        '<div class="sidebar-header">' +
          '<h2><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Admin Panel</h2>' +
        '</div>' +
        '<nav class="sidebar-nav">' +
          // Overview Section
          '<div class="nav-section">' +
            '<div class="nav-section-title">Overview</div>' +
            '<div class="nav-item active" data-page="dashboard">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>' +
              '<span>Dashboard</span>' +
            '</div>' +
          '</div>' +
          
          // Management Section
          '<div class="nav-section">' +
            '<div class="nav-section-title">Management</div>' +
            '<div class="nav-item" data-page="users">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' +
              '<span>Users</span>' +
              '<span class="badge-count" id="nav-users-count" style="display:none;"></span>' +
            '</div>' +
            '<div class="nav-item" data-page="projects">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>' +
              '<span>Projects</span>' +
            '</div>' +
            '<div class="nav-item" data-page="investments">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' +
              '<span>Investments</span>' +
            '</div>' +
          '</div>' +
          
          // Actions Section
          '<div class="nav-section">' +
            '<div class="nav-section-title">Actions Required</div>' +
            '<div class="nav-item" data-page="withdrawals">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
              '<span>Withdrawals</span>' +
              '<span class="badge-count" id="nav-withdrawals-count" style="display:none;"></span>' +
            '</div>' +
            '<div class="nav-item" data-page="kyc">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' +
              '<span>KYC Verification</span>' +
              '<span class="badge-count warning" id="nav-kyc-count" style="display:none;"></span>' +
            '</div>' +
            '<div class="nav-item" data-page="support">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
              '<span>Support Tickets</span>' +
              '<span class="badge-count" id="nav-support-count" style="display:none;"></span>' +
            '</div>' +
          '</div>' +
          
          // Reports Section
          '<div class="nav-section">' +
            '<div class="nav-section-title">Reports & Tools</div>' +
            '<div class="nav-item" data-page="reports">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>' +
              '<span>Financial Reports</span>' +
            '</div>' +
            '<div class="nav-item" data-page="transactions">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' +
              '<span>Transactions</span>' +
            '</div>' +
            '<div class="nav-item" data-page="referrals">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>' +
              '<span>Referrals</span>' +
            '</div>' +
            '<div class="nav-item" data-page="audit">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>' +
              '<span>Audit Log</span>' +
            '</div>' +
          '</div>' +
        '</nav>' +
      '</aside>' +
      
      // Mobile sidebar overlay
      '<div class="sidebar-overlay" id="sidebar-overlay"></div>' +
      
      // Main content
      '<main class="admin-main" id="admin-main">' +
        '<div class="loading-spinner"><div class="spinner"></div></div>' +
      '</main>' +
      
      // Mobile toggle button
      '<button class="sidebar-toggle" id="sidebar-toggle">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>' +
      '</button>' +
    '</div>';
  
  container.innerHTML = html;
  
  // Setup event listeners
  setupSidebarNavigation(adminApi, api);
  setupMobileToggle();
  
  // Load initial dashboard
  loadDashboard(adminApi, api);
  updateNavBadges(adminApi);
}

// Setup sidebar navigation
function setupSidebarNavigation(adminApi, api) {
  document.querySelectorAll('.nav-item').forEach(function(item) {
    item.addEventListener('click', function() {
      var page = this.getAttribute('data-page');
      
      // Update active state
      document.querySelectorAll('.nav-item').forEach(function(i) { i.classList.remove('active'); });
      this.classList.add('active');
      
      // Close mobile sidebar
      document.getElementById('admin-sidebar').classList.remove('open');
      document.getElementById('sidebar-overlay').classList.remove('show');
      
      // Load page
      loadPage(page, adminApi, api);
    });
  });
}

// Setup mobile toggle
function setupMobileToggle() {
  var toggle = document.getElementById('sidebar-toggle');
  var sidebar = document.getElementById('admin-sidebar');
  var overlay = document.getElementById('sidebar-overlay');
  
  toggle.addEventListener('click', function() {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
  });
  
  overlay.addEventListener('click', function() {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });
}

// Update navigation badges
function updateNavBadges(adminApi) {
  adminApi.getStats().then(function(stats) {
    if (stats.withdrawals.pending > 0) {
      var el = document.getElementById('nav-withdrawals-count');
      el.textContent = stats.withdrawals.pending;
      el.style.display = 'inline';
    }
    if (stats.users.pendingKyc > 0) {
      var el = document.getElementById('nav-kyc-count');
      el.textContent = stats.users.pendingKyc;
      el.style.display = 'inline';
    }
  });
  
  // Check support tickets
  adminApi.getSupportTickets && adminApi.getSupportTickets({ status: 'open' }).then(function(result) {
    if (result && result.tickets && result.tickets.length > 0) {
      var el = document.getElementById('nav-support-count');
      el.textContent = result.tickets.length;
      el.style.display = 'inline';
    }
  }).catch(function() {});
}

// Load page based on navigation
function loadPage(page, adminApi, api) {
  var main = document.getElementById('admin-main');
  main.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
  
  switch(page) {
    case 'dashboard': loadDashboard(adminApi, api); break;
    case 'users': loadUsersPage(adminApi, api); break;
    case 'projects': loadProjectsPage(adminApi, api); break;
    case 'investments': loadInvestmentsPage(adminApi, api); break;
    case 'withdrawals': loadWithdrawalsPage(adminApi, api); break;
    case 'kyc': loadKycPage(adminApi, api); break;
    case 'support': loadSupportPage(adminApi, api); break;
    case 'reports': loadReportsPage(adminApi, api); break;
    case 'transactions': loadTransactionsPage(adminApi, api); break;
    case 'referrals': loadReferralsPage(adminApi, api); break;
    case 'audit': loadAuditPage(adminApi, api); break;
    default: loadDashboard(adminApi, api);
  }
}

// ==================== DASHBOARD ====================
function loadDashboard(adminApi, api) {
  var main = document.getElementById('admin-main');
  
  adminApi.getStats().then(function(stats) {
    var html = 
      // Page Header
      '<div class="admin-page-header">' +
        '<div class="page-title-section">' +
          '<h1>Dashboard</h1>' +
          '<div class="breadcrumb">Welcome back, ' + escapeHtml(api.user.name || 'Admin') + '</div>' +
        '</div>' +
        '<div class="page-actions">' +
          '<button class="btn btn-primary" onclick="showCreateProjectModal()">+ Create Project</button>' +
        '</div>' +
      '</div>' +
      
      // Stats Grid
      '<div class="stats-grid">' +
        '<div class="stat-card">' +
          '<div class="stat-icon blue"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>' +
          '<div class="stat-content">' +
            '<div class="stat-label">Total Users</div>' +
            '<div class="stat-value">' + stats.users.total.toLocaleString() + '</div>' +
            '<div class="stat-change positive">Active platform members</div>' +
          '</div>' +
        '</div>' +
        '<div class="stat-card">' +
          '<div class="stat-icon green"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>' +
          '<div class="stat-content">' +
            '<div class="stat-label">Total Investments</div>' +
            '<div class="stat-value">GH₵' + (stats.investments.totalAmount || 0).toLocaleString() + '</div>' +
            '<div class="stat-change positive">' + stats.investments.total + ' investments</div>' +
          '</div>' +
        '</div>' +
        '<div class="stat-card">' +
          '<div class="stat-icon purple"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>' +
          '<div class="stat-content">' +
            '<div class="stat-label">Active Projects</div>' +
            '<div class="stat-value">' + stats.projects.active + '</div>' +
            '<div class="stat-change">' + stats.projects.total + ' total projects</div>' +
          '</div>' +
        '</div>' +
        '<div class="stat-card">' +
          '<div class="stat-icon orange"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>' +
          '<div class="stat-content">' +
            '<div class="stat-label">Pending Actions</div>' +
            '<div class="stat-value">' + (stats.withdrawals.pending + stats.users.pendingKyc) + '</div>' +
            '<div class="stat-change">Requires attention</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    
    // Alerts if any
    if (stats.withdrawals.pending > 0 || stats.users.pendingKyc > 0 || stats.projects.pending > 0) {
      html += '<div class="alerts-grid">';
      
      if (stats.withdrawals.pending > 0) {
        html += 
          '<div class="alert-card danger" onclick="loadPage(\'withdrawals\', window._adminApi, window._api)">' +
            '<div class="alert-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></div>' +
            '<div class="alert-card-content">' +
              '<strong>' + stats.withdrawals.pending + ' Pending Withdrawals</strong>' +
              '<span>GH₵' + (stats.withdrawals.pendingAmount || 0).toLocaleString() + ' waiting</span>' +
            '</div>' +
            '<div class="alert-card-action">Process →</div>' +
          '</div>';
      }
      
      if (stats.users.pendingKyc > 0) {
        html += 
          '<div class="alert-card warning" onclick="loadPage(\'kyc\', window._adminApi, window._api)">' +
            '<div class="alert-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>' +
            '<div class="alert-card-content">' +
              '<strong>' + stats.users.pendingKyc + ' KYC Pending</strong>' +
              '<span>Users awaiting verification</span>' +
            '</div>' +
            '<div class="alert-card-action">Review →</div>' +
          '</div>';
      }
      
      html += '</div>';
    }
    
    // Quick Actions
    html += 
      '<div class="admin-panel">' +
        '<div class="panel-header">' +
          '<h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Quick Actions</h3>' +
        '</div>' +
        '<div class="panel-body">' +
          '<div class="quick-actions-grid">' +
            '<button class="quick-action-btn" onclick="showCreateProjectModal()">' +
              '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
              '<span>New Project</span>' +
            '</button>' +
            '<button class="quick-action-btn" onclick="showCreditWalletModal()">' +
              '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>' +
              '<span>Credit Wallet</span>' +
            '</button>' +
            '<button class="quick-action-btn" onclick="showBroadcastModal()">' +
              '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>' +
              '<span>Send Email</span>' +
            '</button>' +
            '<button class="quick-action-btn" onclick="loadPage(\'reports\', window._adminApi, window._api)">' +
              '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>' +
              '<span>View Reports</span>' +
            '</button>' +
            '<button class="quick-action-btn" onclick="runOrphanedCleanup()">' +
              '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>' +
              '<span>Cleanup Data</span>' +
            '</button>' +
            '<button class="quick-action-btn" onclick="loadPage(\'audit\', window._adminApi, window._api)">' +
              '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
              '<span>Audit Log</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    
    // Recent Activity (latest investments)
    html += 
      '<div class="admin-panel">' +
        '<div class="panel-header">' +
          '<h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> Recent Activity</h3>' +
          '<button class="btn btn-sm btn-outline" onclick="loadPage(\'investments\', window._adminApi, window._api)">View All</button>' +
        '</div>' +
        '<div class="panel-body no-padding" id="recent-activity-table">' +
          '<div class="loading-spinner"><div class="spinner"></div></div>' +
        '</div>' +
      '</div>';
    
    main.innerHTML = html;
    
    // Load recent activity
    loadRecentActivity(adminApi);
    
  }).catch(function(err) {
    main.innerHTML = '<div class="admin-panel"><div class="panel-body"><p class="text-danger">Error loading dashboard: ' + escapeHtml(err.message) + '</p></div></div>';
  });
}

// Load recent activity table
function loadRecentActivity(adminApi) {
  adminApi.getInvestments({ limit: 10 }).then(function(result) {
    var container = document.getElementById('recent-activity-table');
    if (!result.investments || result.investments.length === 0) {
      container.innerHTML = '<div class="empty-state-box"><p>No recent activity</p></div>';
      return;
    }
    
    var html = 
      '<table class="data-table">' +
        '<thead><tr>' +
          '<th>User</th>' +
          '<th>Project</th>' +
          '<th>Amount</th>' +
          '<th>Status</th>' +
          '<th>Date</th>' +
        '</tr></thead>' +
        '<tbody>';
    
    result.investments.forEach(function(inv) {
      var userName = inv.user ? (inv.user.name || inv.user.email) : 'Unknown';
      var initials = userName.substring(0, 2).toUpperCase();
      var statusClass = inv.status === 'active' ? 'badge-success' : inv.status === 'completed' ? 'badge-info' : inv.status === 'orphaned' ? 'badge-error' : '';
      
      html += 
        '<tr>' +
          '<td>' +
            '<div class="table-user">' +
              '<div class="table-avatar">' + initials + '</div>' +
              '<div class="table-user-info">' +
                '<div class="table-user-name">' + userName + '</div>' +
              '</div>' +
            '</div>' +
          '</td>' +
          '<td>' + (inv.projectName || 'N/A') + '</td>' +
          '<td><strong>GH₵' + (inv.amount || 0).toLocaleString() + '</strong></td>' +
          '<td><span class="badge ' + statusClass + '">' + (inv.status || 'unknown') + '</span></td>' +
          '<td>' + new Date(inv.createdAt).toLocaleDateString() + '</td>' +
        '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
  }).catch(function() {
    document.getElementById('recent-activity-table').innerHTML = '<div class="empty-state-box"><p>Failed to load activity</p></div>';
  });
}

// ==================== USERS PAGE ====================
function loadUsersPage(adminApi, api) {
  var main = document.getElementById('admin-main');
  
  var html = 
    '<div class="admin-page-header">' +
      '<div class="page-title-section">' +
        '<h1>Users Management</h1>' +
        '<div class="breadcrumb"><a href="#" onclick="loadPage(\'dashboard\', window._adminApi, window._api)">Dashboard</a> / Users</div>' +
      '</div>' +
    '</div>' +
    
    // Filters
    '<div class="filters-bar">' +
      '<div class="search-input-wrapper">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>' +
        '<input type="text" id="user-search" placeholder="Search users..." onkeyup="filterUsers()">' +
      '</div>' +
      '<div class="filter-group">' +
        '<label>Role:</label>' +
        '<select class="filter-input" id="user-role-filter" onchange="filterUsers()">' +
          '<option value="">All Roles</option>' +
          '<option value="investor">Investors</option>' +
          '<option value="business_owner">Business Owners</option>' +
        '</select>' +
      '</div>' +
      '<div class="filter-group">' +
        '<label>KYC:</label>' +
        '<select class="filter-input" id="user-kyc-filter" onchange="filterUsers()">' +
          '<option value="">All Status</option>' +
          '<option value="verified">Verified</option>' +
          '<option value="submitted">Pending</option>' +
          '<option value="pending">Not Submitted</option>' +
        '</select>' +
      '</div>' +
    '</div>' +
    
    // Users Table
    '<div class="admin-panel">' +
      '<div class="panel-body no-padding">' +
        '<div id="users-table-container"><div class="loading-spinner"><div class="spinner"></div></div></div>' +
      '</div>' +
    '</div>';
  
  main.innerHTML = html;
  loadUsersTable(adminApi);
}

var allUsersCache = [];

function loadUsersTable(adminApi) {
  adminApi.getUsers({ limit: 500 }).then(function(result) {
    allUsersCache = result.users.filter(function(u) { return u.role !== 'admin'; });
    renderUsersTable(allUsersCache);
  }).catch(function(err) {
    document.getElementById('users-table-container').innerHTML = '<div class="empty-state-box"><p>Error: ' + escapeHtml(err.message) + '</p></div>';
  });
}

function filterUsers() {
  var search = document.getElementById('user-search').value.toLowerCase();
  var role = document.getElementById('user-role-filter').value;
  var kyc = document.getElementById('user-kyc-filter').value;
  
  var filtered = allUsersCache.filter(function(user) {
    var matchSearch = !search || 
      (user.name && user.name.toLowerCase().includes(search)) || 
      (user.email && user.email.toLowerCase().includes(search)) ||
      (user.phone && user.phone.includes(search));
    var matchRole = !role || user.role === role;
    var kycStatus = user.kyc ? user.kyc.status : 'pending';
    var matchKyc = !kyc || kycStatus === kyc;
    return matchSearch && matchRole && matchKyc;
  });
  
  renderUsersTable(filtered);
}

function renderUsersTable(users) {
  var container = document.getElementById('users-table-container');
  
  if (users.length === 0) {
    container.innerHTML = '<div class="empty-state-box"><h3>No users found</h3><p>Try adjusting your filters</p></div>';
    return;
  }
  
  var html = 
    '<table class="data-table">' +
      '<thead><tr>' +
        '<th>User</th>' +
        '<th>Role</th>' +
        '<th>KYC Status</th>' +
        '<th>Wallet</th>' +
        '<th>Invested</th>' +
        '<th>Joined</th>' +
        '<th>Actions</th>' +
      '</tr></thead>' +
      '<tbody>';
  
  users.forEach(function(user) {
    var initials = (user.name || user.email || 'U').substring(0, 2).toUpperCase();
    var kycStatus = user.kyc ? user.kyc.status : 'pending';
    var kycClass = kycStatus === 'verified' ? 'badge-success' : kycStatus === 'submitted' ? 'badge-warning' : '';
    
    html += 
      '<tr class="clickable" onclick="showUserDetail(\'' + user.id + '\')">' +
        '<td>' +
          '<div class="table-user">' +
            '<div class="table-avatar">' + initials + '</div>' +
            '<div class="table-user-info">' +
              '<div class="table-user-name">' + escapeHtml(user.name || 'No Name') + '</div>' +
              '<div class="table-user-email">' + escapeHtml(user.email) + '</div>' +
            '</div>' +
          '</div>' +
        '</td>' +
        '<td><span class="badge">' + (user.role || 'investor').replace('_', ' ') + '</span></td>' +
        '<td><span class="badge ' + kycClass + '">' + kycStatus + '</span></td>' +
        '<td>GH₵' + (user.walletBalance || 0).toLocaleString() + '</td>' +
        '<td>GH₵' + (user.totalInvested || 0).toLocaleString() + '</td>' +
        '<td>' + new Date(user.createdAt).toLocaleDateString() + '</td>' +
        '<td onclick="event.stopPropagation()">' +
          '<div class="table-actions">' +
            '<button class="btn-icon" title="View" onclick="showUserDetail(\'' + user.id + '\')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>' +
            '<button class="btn-icon" title="Credit Wallet" onclick="showCreditWalletModal(\'' + user.id + '\', \'' + escapeAttr(user.name || user.email) + '\')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></button>' +
            '<button class="btn-icon danger" title="Delete" onclick="confirmDeleteUser(\'' + user.id + '\', \'' + escapeAttr(user.name || user.email) + '\')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>' +
          '</div>' +
        '</td>' +
      '</tr>';
  });
  
  html += '</tbody></table>';
  html += '<div class="table-pagination"><div class="pagination-info">Showing ' + users.length + ' users</div></div>';
  container.innerHTML = html;
}

// ==================== INVESTMENTS PAGE ====================
function loadInvestmentsPage(adminApi, api) {
  var main = document.getElementById('admin-main');
  
  var html = 
    '<div class="admin-page-header">' +
      '<div class="page-title-section">' +
        '<h1>Investments</h1>' +
        '<div class="breadcrumb"><a href="#" onclick="loadPage(\'dashboard\', window._adminApi, window._api)">Dashboard</a> / Investments</div>' +
      '</div>' +
      '<div class="page-actions">' +
        '<button class="btn btn-outline" onclick="runOrphanedCleanup()">🧹 Cleanup Orphaned</button>' +
      '</div>' +
    '</div>' +
    
    // Filters
    '<div class="filters-bar">' +
      '<div class="filter-group">' +
        '<label>Status:</label>' +
        '<select class="filter-input" id="inv-status-filter" onchange="loadInvestmentsTable()">' +
          '<option value="">All</option>' +
          '<option value="active" selected>Active</option>' +
          '<option value="completed">Completed</option>' +
          '<option value="withdrawn">Withdrawn</option>' +
          '<option value="orphaned">Orphaned</option>' +
          '<option value="cancelled">Cancelled</option>' +
        '</select>' +
      '</div>' +
    '</div>' +
    
    // Investments Table
    '<div class="admin-panel">' +
      '<div class="panel-body no-padding">' +
        '<div id="investments-table-container"><div class="loading-spinner"><div class="spinner"></div></div></div>' +
      '</div>' +
    '</div>';
  
  main.innerHTML = html;
  loadInvestmentsTable();
}

function loadInvestmentsTable() {
  var status = document.getElementById('inv-status-filter') ? document.getElementById('inv-status-filter').value : 'active';
  var container = document.getElementById('investments-table-container');
  
  window._adminApi.getInvestments({ limit: 200, status: status || undefined }).then(function(result) {
    if (!result.investments || result.investments.length === 0) {
      container.innerHTML = '<div class="empty-state-box"><h3>No investments found</h3><p>No ' + (status || 'any') + ' investments</p></div>';
      return;
    }
    
    var html = 
      '<table class="data-table">' +
        '<thead><tr>' +
          '<th>Investor</th>' +
          '<th>Project</th>' +
          '<th>Amount</th>' +
          '<th>Status</th>' +
          '<th>Date</th>' +
          '<th>Actions</th>' +
        '</tr></thead>' +
        '<tbody>';
    
    result.investments.forEach(function(inv) {
      var userName = inv.user ? (inv.user.name || inv.user.email) : 'Unknown/Deleted';
      var initials = userName.substring(0, 2).toUpperCase();
      var statusClass = inv.status === 'active' ? 'badge-success' : inv.status === 'completed' ? 'badge-info' : inv.status === 'orphaned' ? 'badge-error' : inv.status === 'withdrawn' ? 'badge-warning' : '';
      var canWithdraw = inv.status === 'active' && inv.user;
      
      html += 
        '<tr>' +
          '<td>' +
            '<div class="table-user">' +
              '<div class="table-avatar">' + initials + '</div>' +
              '<div class="table-user-info">' +
                '<div class="table-user-name">' + userName + '</div>' +
              '</div>' +
            '</div>' +
          '</td>' +
          '<td>' + (inv.projectName || 'N/A') + '</td>' +
          '<td><strong>GH₵' + (inv.amount || 0).toLocaleString() + '</strong></td>' +
          '<td><span class="badge ' + statusClass + '">' + inv.status + '</span></td>' +
          '<td>' + new Date(inv.createdAt).toLocaleDateString() + '</td>' +
          '<td>' +
            (canWithdraw ? '<button class="btn btn-sm btn-warning" onclick="showWithdrawInvestmentModal(\'' + (inv._id || inv.id) + '\', ' + inv.amount + ', \'' + (inv.projectName || 'Project').replace(/'/g, "\\'") + '\', \'' + userName.replace(/'/g, "\\'") + '\')">End</button>' : '-') +
          '</td>' +
        '</tr>';
    });
    
    html += '</tbody></table>';
    html += '<div class="table-pagination"><div class="pagination-info">Showing ' + result.investments.length + ' investments</div></div>';
    container.innerHTML = html;
  }).catch(function(err) {
    container.innerHTML = '<div class="empty-state-box"><p>Error: ' + escapeHtml(err.message) + '</p></div>';
  });
}

// ==================== WITHDRAWALS PAGE ====================
function loadWithdrawalsPage(adminApi, api) {
  var main = document.getElementById('admin-main');
  
  var html = 
    '<div class="admin-page-header">' +
      '<div class="page-title-section">' +
        '<h1>Withdrawals</h1>' +
        '<div class="breadcrumb"><a href="#" onclick="loadPage(\'dashboard\', window._adminApi, window._api)">Dashboard</a> / Withdrawals</div>' +
      '</div>' +
    '</div>' +
    
    '<div class="filters-bar">' +
      '<div class="filter-group">' +
        '<label>Status:</label>' +
        '<select class="filter-input" id="withdrawal-status-filter" onchange="loadWithdrawalsTable()">' +
          '<option value="pending" selected>Pending</option>' +
          '<option value="completed">Completed</option>' +
          '<option value="rejected">Rejected</option>' +
          '<option value="">All</option>' +
        '</select>' +
      '</div>' +
    '</div>' +
    
    '<div class="admin-panel">' +
      '<div class="panel-body no-padding">' +
        '<div id="withdrawals-table-container"><div class="loading-spinner"><div class="spinner"></div></div></div>' +
      '</div>' +
    '</div>';
  
  main.innerHTML = html;
  loadWithdrawalsTable();
}

function loadWithdrawalsTable() {
  var status = document.getElementById('withdrawal-status-filter') ? document.getElementById('withdrawal-status-filter').value : 'pending';
  var container = document.getElementById('withdrawals-table-container');
  
  window._adminApi.getWithdrawals({ status: status || undefined }).then(function(result) {
    if (!result.withdrawals || result.withdrawals.length === 0) {
      container.innerHTML = '<div class="empty-state-box"><h3>No withdrawals</h3><p>No ' + (status || 'any') + ' withdrawal requests</p></div>';
      return;
    }
    
    var html = 
      '<table class="data-table">' +
        '<thead><tr>' +
          '<th>User</th>' +
          '<th>Amount</th>' +
          '<th>Method</th>' +
          '<th>Account</th>' +
          '<th>Status</th>' +
          '<th>Date</th>' +
          '<th>Actions</th>' +
        '</tr></thead>' +
        '<tbody>';
    
    result.withdrawals.forEach(function(w) {
      var userName = w.user ? (w.user.name || w.user.email) : 'Unknown';
      var isPending = w.status === 'pending';
      
      html += 
        '<tr>' +
          '<td><strong>' + escapeHtml(userName) + '</strong></td>' +
          '<td><strong style="color: var(--secondary-color);">GH₵' + (w.amount || 0).toLocaleString() + '</strong></td>' +
          '<td>' + (w.method || 'Mobile Money') + '</td>' +
          '<td>' + (w.accountNumber || w.momoNumber || 'N/A') + ' (' + (w.provider || 'MTN') + ')</td>' +
          '<td><span class="badge ' + (isPending ? 'badge-warning' : w.status === 'completed' ? 'badge-success' : 'badge-error') + '">' + w.status + '</span></td>' +
          '<td>' + new Date(w.createdAt).toLocaleDateString() + '</td>' +
          '<td>' +
            (isPending ? 
              '<button class="btn btn-sm btn-success" onclick="processWithdrawal(\'' + (w._id || w.id) + '\', \'approve\')">✓ Approve</button> ' +
              '<button class="btn btn-sm btn-danger" onclick="processWithdrawal(\'' + (w._id || w.id) + '\', \'reject\')">✗ Reject</button>' 
              : '-') +
          '</td>' +
        '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
  }).catch(function(err) {
    container.innerHTML = '<div class="empty-state-box"><p>Error: ' + escapeHtml(err.message) + '</p></div>';
  });
}

// ==================== KYC PAGE ====================
function loadKycPage(adminApi, api) {
  var main = document.getElementById('admin-main');
  
  var html = 
    '<div class="admin-page-header">' +
      '<div class="page-title-section">' +
        '<h1>KYC Verification</h1>' +
        '<div class="breadcrumb"><a href="#" onclick="loadPage(\'dashboard\', window._adminApi, window._api)">Dashboard</a> / KYC</div>' +
      '</div>' +
    '</div>' +
    
    '<div class="admin-panel">' +
      '<div class="panel-body no-padding">' +
        '<div id="kyc-table-container"><div class="loading-spinner"><div class="spinner"></div></div></div>' +
      '</div>' +
    '</div>';
  
  main.innerHTML = html;
  
  adminApi.getUsers({ kycStatus: 'submitted' }).then(function(result) {
    var container = document.getElementById('kyc-table-container');
    var pending = result.users.filter(function(u) { return u.kyc && u.kyc.status === 'submitted'; });
    
    if (pending.length === 0) {
      container.innerHTML = '<div class="empty-state-box"><h3>All caught up!</h3><p>No pending KYC verifications</p></div>';
      return;
    }
    
    var html = 
      '<table class="data-table">' +
        '<thead><tr>' +
          '<th>User</th>' +
          '<th>Email</th>' +
          '<th>Submitted</th>' +
          '<th>Documents</th>' +
          '<th>Actions</th>' +
        '</tr></thead>' +
        '<tbody>';
    
    pending.forEach(function(user) {
      html += 
        '<tr>' +
          '<td><strong>' + escapeHtml(user.name || 'No Name') + '</strong></td>' +
          '<td>' + escapeHtml(user.email) + '</td>' +
          '<td>' + (user.kyc.submittedAt ? new Date(user.kyc.submittedAt).toLocaleDateString() : 'N/A') + '</td>' +
          '<td>' +
            (user.kyc.idDocument ? '<a href="' + user.kyc.idDocument + '" target="_blank" class="btn btn-sm btn-outline">ID Doc</a> ' : '') +
            (user.kyc.selfie ? '<a href="' + user.kyc.selfie + '" target="_blank" class="btn btn-sm btn-outline">Selfie</a>' : '') +
          '</td>' +
          '<td>' +
            '<button class="btn btn-sm btn-success" onclick="approveKyc(\'' + user.id + '\')">✓ Approve</button> ' +
            '<button class="btn btn-sm btn-danger" onclick="rejectKyc(\'' + user.id + '\')">✗ Reject</button>' +
          '</td>' +
        '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
  });
}

// ==================== PROJECTS PAGE ====================
function loadProjectsPage(adminApi, api) {
  var main = document.getElementById('admin-main');
  
  var html = 
    '<div class="admin-page-header">' +
      '<div class="page-title-section">' +
        '<h1>Projects</h1>' +
        '<div class="breadcrumb"><a href="#" onclick="loadPage(\'dashboard\', window._adminApi, window._api)">Dashboard</a> / Projects</div>' +
      '</div>' +
      '<div class="page-actions">' +
        '<button class="btn btn-primary" onclick="showCreateProjectModal()">+ Create Project</button>' +
      '</div>' +
    '</div>' +
    
    '<div class="filters-bar">' +
      '<div class="search-input-wrapper">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>' +
        '<input type="text" id="project-search" placeholder="Search projects..." onkeyup="filterProjects()">' +
      '</div>' +
      '<div class="filter-group">' +
        '<label>Status:</label>' +
        '<select class="filter-input" id="project-status-filter" onchange="filterProjects()">' +
          '<option value="">All</option>' +
          '<option value="active" selected>Active</option>' +
          '<option value="inactive">Inactive</option>' +
          '<option value="completed">Completed</option>' +
        '</select>' +
      '</div>' +
    '</div>' +
    
    '<div id="projects-grid-container"><div class="loading-spinner"><div class="spinner"></div></div></div>';
  
  main.innerHTML = html;
  loadProjectsGrid(adminApi);
}

var allProjectsCache = [];

function loadProjectsGrid(adminApi) {
  adminApi.getProjects({ limit: 200 }).then(function(result) {
    allProjectsCache = result.projects || [];
    filterProjects();
  });
}

function filterProjects() {
  var search = document.getElementById('project-search') ? document.getElementById('project-search').value.toLowerCase() : '';
  var status = document.getElementById('project-status-filter') ? document.getElementById('project-status-filter').value : 'active';
  
  var filtered = allProjectsCache.filter(function(p) {
    var matchSearch = !search || (p.name && p.name.toLowerCase().includes(search));
    var matchStatus = !status || p.status === status;
    return matchSearch && matchStatus;
  });
  
  renderProjectsGrid(filtered);
}

function renderProjectsGrid(projects) {
  var container = document.getElementById('projects-grid-container');
  
  if (projects.length === 0) {
    container.innerHTML = '<div class="empty-state-box"><h3>No projects found</h3></div>';
    return;
  }
  
  var html = '<div class="projects-grid">';
  
  projects.forEach(function(p) {
    var imageUrl = p.imageUrl || p.image_url || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400';
    var funding = p.currentFunding || p.raisedAmount || 0;
    var goal = p.goalAmount || p.goal_amount || 10000;
    var progress = Math.min((funding / goal) * 100, 100);
    var statusClass = p.status === 'active' ? 'badge-success' : p.status === 'completed' ? 'badge-info' : '';
    
    html += 
      '<div class="project-card-admin">' +
        '<div class="project-image" style="background-image: url(\'' + imageUrl + '\');">' +
          (p.featured ? '<span class="featured-badge">⭐ Featured</span>' : '') +
        '</div>' +
        '<div class="project-content">' +
          '<div class="project-header">' +
            '<h4>' + escapeHtml(p.name || 'Untitled') + '</h4>' +
            '<span class="badge ' + statusClass + '">' + (p.status || 'draft') + '</span>' +
          '</div>' +
          '<p class="project-desc">' + escapeHtml((p.description || '').substring(0, 80)) + '...</p>' +
          '<div class="project-funding">' +
            '<div class="funding-info">' +
              '<span>GH₵' + funding.toLocaleString() + '</span>' +
              '<span>' + progress.toFixed(0) + '%</span>' +
            '</div>' +
            '<div class="progress-bar"><div class="progress-fill" style="width: ' + progress + '%;"></div></div>' +
            '<div class="funding-stats">' +
              '<span>' + (p.investorCount || 0) + ' investors</span>' +
              '<span>Goal: GH₵' + goal.toLocaleString() + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="project-actions">' +
            '<button class="btn btn-sm btn-outline" onclick="showEditProjectModal(\'' + (p._id || p.id) + '\')">Edit</button>' +
            '<button class="btn btn-sm btn-outline" onclick="showDistributeProfitModal(\'' + (p._id || p.id) + '\', \'' + (p.name || 'Project').replace(/'/g, "\\'") + '\')">Distribute</button>' +
            (p.status === 'active' ? '<button class="btn btn-sm btn-warning" onclick="showCompleteProjectModal(\'' + (p._id || p.id) + '\', \'' + (p.name || 'Project').replace(/'/g, "\\'") + '\')">End</button>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
  });
  
  html += '</div>';
  container.innerHTML = html;
}

// ==================== SUPPORT TICKETS PAGE ====================
function loadSupportPage(adminApi, api) {
  var main = document.getElementById('admin-main');
  
  var html = 
    '<div class="admin-page-header">' +
      '<div class="page-title-section">' +
        '<h1>Support Tickets</h1>' +
        '<div class="breadcrumb"><a href="#" onclick="loadPage(\'dashboard\', window._adminApi, window._api)">Dashboard</a> / Support</div>' +
      '</div>' +
    '</div>' +
    
    '<div class="filters-bar">' +
      '<div class="filter-group">' +
        '<label>Status:</label>' +
        '<select class="filter-input" id="ticket-status-filter" onchange="loadTicketsTable()">' +
          '<option value="open" selected>Open</option>' +
          '<option value="in_progress">In Progress</option>' +
          '<option value="resolved">Resolved</option>' +
          '<option value="">All</option>' +
        '</select>' +
      '</div>' +
    '</div>' +
    
    '<div class="admin-panel">' +
      '<div class="panel-body no-padding">' +
        '<div id="tickets-table-container"><div class="loading-spinner"><div class="spinner"></div></div></div>' +
      '</div>' +
    '</div>';
  
  main.innerHTML = html;
  loadTicketsTable();
}

function loadTicketsTable() {
  var status = document.getElementById('ticket-status-filter') ? document.getElementById('ticket-status-filter').value : 'open';
  var container = document.getElementById('tickets-table-container');
  
  if (!window._adminApi.getSupportTickets) {
    container.innerHTML = '<div class="empty-state-box"><h3>Feature Coming Soon</h3><p>Support ticket management will be available shortly</p></div>';
    return;
  }
  
  window._adminApi.getSupportTickets({ status: status || undefined }).then(function(result) {
    if (!result.tickets || result.tickets.length === 0) {
      container.innerHTML = '<div class="empty-state-box"><h3>No tickets</h3><p>No ' + (status || 'any') + ' support tickets</p></div>';
      return;
    }
    
    var html = 
      '<table class="data-table">' +
        '<thead><tr>' +
          '<th>Ticket ID</th>' +
          '<th>Subject</th>' +
          '<th>Category</th>' +
          '<th>Priority</th>' +
          '<th>From</th>' +
          '<th>Date</th>' +
          '<th>Actions</th>' +
        '</tr></thead>' +
        '<tbody>';
    
    result.tickets.forEach(function(t) {
      var priorityClass = t.priority === 'high' ? 'badge-error' : t.priority === 'medium' ? 'badge-warning' : '';
      
      html += 
        '<tr>' +
          '<td><strong>' + escapeHtml(t.ticketId || t._id) + '</strong></td>' +
          '<td>' + escapeHtml((t.subject || '').substring(0, 40)) + '</td>' +
          '<td><span class="badge">' + escapeHtml(t.category || 'general') + '</span></td>' +
          '<td><span class="badge ' + priorityClass + '">' + escapeHtml(t.priority || 'low') + '</span></td>' +
          '<td>' + escapeHtml(t.email || 'N/A') + '</td>' +
          '<td>' + new Date(t.createdAt).toLocaleDateString() + '</td>' +
          '<td>' +
            '<button class="btn btn-sm btn-outline" onclick="showTicketDetail(\'' + (t._id || t.ticketId) + '\')">View</button>' +
            (t.status !== 'resolved' ? ' <button class="btn btn-sm btn-success" onclick="resolveTicket(\'' + (t._id || t.ticketId) + '\')">Resolve</button>' : '') +
          '</td>' +
        '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
  }).catch(function(err) {
    container.innerHTML = '<div class="empty-state-box"><p>Error: ' + escapeHtml(err.message) + '</p></div>';
  });
}

// ==================== REFERRALS PAGE ====================
function loadReferralsPage(adminApi, api) {
  var main = document.getElementById('admin-main');
  
  var html = 
    '<div class="admin-page-header">' +
      '<div class="page-title-section">' +
        '<h1>Referral Program</h1>' +
        '<div class="breadcrumb"><a href="#" onclick="loadPage(\'dashboard\', window._adminApi, window._api)">Dashboard</a> / Referrals</div>' +
      '</div>' +
    '</div>' +
    
    '<div class="admin-panel">' +
      '<div class="panel-body no-padding">' +
        '<div id="referrals-table-container"><div class="loading-spinner"><div class="spinner"></div></div></div>' +
      '</div>' +
    '</div>';
  
  main.innerHTML = html;
  
  if (adminApi.getReferrals) {
    adminApi.getReferrals({ limit: 100 }).then(function(result) {
      renderReferralsTable(result.referrals || []);
    }).catch(function(err) {
      document.getElementById('referrals-table-container').innerHTML = '<div class="empty-state-box"><p>Error: ' + escapeHtml(err.message) + '</p></div>';
    });
  } else {
    document.getElementById('referrals-table-container').innerHTML = '<div class="empty-state-box"><h3>Coming Soon</h3><p>Referral tracking will be available shortly</p></div>';
  }
}

function renderReferralsTable(referrals) {
  var container = document.getElementById('referrals-table-container');
  if (referrals.length === 0) {
    container.innerHTML = '<div class="empty-state-box"><h3>No referrals yet</h3></div>';
    return;
  }
  
  var html = 
    '<table class="data-table">' +
      '<thead><tr><th>Referrer</th><th>Referred User</th><th>Status</th><th>Commission</th><th>Date</th></tr></thead>' +
      '<tbody>';
  
  referrals.forEach(function(r) {
    html += '<tr><td>' + (r.referrerEmail || r.referrerId || 'N/A') + '</td><td>' + (r.referredEmail || r.referredId || 'N/A') + '</td><td><span class="badge">' + (r.status || 'pending') + '</span></td><td>GH₵' + (r.commission || 0).toLocaleString() + '</td><td>' + new Date(r.createdAt).toLocaleDateString() + '</td></tr>';
  });
  
  html += '</tbody></table>';
  container.innerHTML = html;
}

// ==================== REPORTS PAGE ====================
function loadReportsPage(adminApi, api) {
  var main = document.getElementById('admin-main');
  
  var endDate = new Date();
  var startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  var html = 
    '<div class="admin-page-header">' +
      '<div class="page-title-section">' +
        '<h1>Financial Reports</h1>' +
        '<div class="breadcrumb"><a href="#" onclick="loadPage(\'dashboard\', window._adminApi, window._api)">Dashboard</a> / Reports</div>' +
      '</div>' +
    '</div>' +
    
    '<div class="filters-bar">' +
      '<div class="filter-group">' +
        '<label>From:</label>' +
        '<input type="date" class="filter-input" id="report-start" value="' + startDate.toISOString().split('T')[0] + '" onchange="loadReportData()">' +
      '</div>' +
      '<div class="filter-group">' +
        '<label>To:</label>' +
        '<input type="date" class="filter-input" id="report-end" value="' + endDate.toISOString().split('T')[0] + '" onchange="loadReportData()">' +
      '</div>' +
      '<button class="btn btn-outline" onclick="exportReport()">📥 Export CSV</button>' +
    '</div>' +
    
    '<div id="report-content"><div class="loading-spinner"><div class="spinner"></div></div></div>';
  
  main.innerHTML = html;
  loadReportData();
}

function loadReportData() {
  var startDate = document.getElementById('report-start').value;
  var endDate = document.getElementById('report-end').value;
  var container = document.getElementById('report-content');
  
  window._adminApi.getFinancialReport(startDate, endDate).then(function(report) {
    var html = 
      '<div class="stats-grid">' +
        '<div class="stat-card">' +
          '<div class="stat-icon green"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg></div>' +
          '<div class="stat-content">' +
            '<div class="stat-label">Total Investments</div>' +
            '<div class="stat-value">GH₵' + (report.investments.total || 0).toLocaleString() + '</div>' +
            '<div class="stat-change">' + (report.investments.count || 0) + ' transactions</div>' +
          '</div>' +
        '</div>' +
        '<div class="stat-card">' +
          '<div class="stat-icon red"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/></svg></div>' +
          '<div class="stat-content">' +
            '<div class="stat-label">Total Withdrawals</div>' +
            '<div class="stat-value">GH₵' + (report.withdrawals.total || 0).toLocaleString() + '</div>' +
            '<div class="stat-change">' + (report.withdrawals.count || 0) + ' withdrawals</div>' +
          '</div>' +
        '</div>' +
        '<div class="stat-card">' +
          '<div class="stat-icon purple"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 8l-4 4-4-4"/></svg></div>' +
          '<div class="stat-content">' +
            '<div class="stat-label">Profit Distributed</div>' +
            '<div class="stat-value">GH₵' + (report.profitDistributions.total || 0).toLocaleString() + '</div>' +
            '<div class="stat-change">' + (report.profitDistributions.count || 0) + ' distributions</div>' +
          '</div>' +
        '</div>' +
        '<div class="stat-card">' +
          '<div class="stat-icon blue"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>' +
          '<div class="stat-content">' +
            '<div class="stat-label">Net Flow</div>' +
            '<div class="stat-value">GH₵' + ((report.investments.total || 0) - (report.withdrawals.total || 0)).toLocaleString() + '</div>' +
            '<div class="stat-change">Period: ' + startDate + ' to ' + endDate + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    
    // Daily breakdown table
    if (report.dailyBreakdown && report.dailyBreakdown.length > 0) {
      html += 
        '<div class="admin-panel">' +
          '<div class="panel-header"><h3>Daily Breakdown</h3></div>' +
          '<div class="panel-body no-padding">' +
            '<table class="data-table">' +
              '<thead><tr><th>Date</th><th>Investments</th><th>Count</th></tr></thead>' +
              '<tbody>';
      
      report.dailyBreakdown.slice(-14).forEach(function(day) {
        html += '<tr><td>' + day._id + '</td><td>GH₵' + (day.amount || 0).toLocaleString() + '</td><td>' + (day.count || 0) + '</td></tr>';
      });
      
      html += '</tbody></table></div></div>';
    }
    
    container.innerHTML = html;
  }).catch(function(err) {
    container.innerHTML = '<div class="empty-state-box"><p>Error loading report: ' + escapeHtml(err.message) + '</p></div>';
  });
}

// ==================== TRANSACTIONS PAGE ====================
function loadTransactionsPage(adminApi, api) {
  var main = document.getElementById('admin-main');
  
  var html = 
    '<div class="admin-page-header">' +
      '<div class="page-title-section">' +
        '<h1>All Transactions</h1>' +
        '<div class="breadcrumb"><a href="#" onclick="loadPage(\'dashboard\', window._adminApi, window._api)">Dashboard</a> / Transactions</div>' +
      '</div>' +
    '</div>' +
    
    '<div class="admin-panel">' +
      '<div class="panel-body no-padding">' +
        '<div id="transactions-table-container"><div class="loading-spinner"><div class="spinner"></div></div></div>' +
      '</div>' +
    '</div>';
  
  main.innerHTML = html;
  
  if (adminApi.getTransactions) {
    adminApi.getTransactions({ limit: 100 }).then(function(result) {
      renderTransactionsTable(result.transactions || []);
    }).catch(function(err) {
      document.getElementById('transactions-table-container').innerHTML = '<div class="empty-state-box"><p>Error: ' + escapeHtml(err.message) + '</p></div>';
    });
  } else {
    document.getElementById('transactions-table-container').innerHTML = '<div class="empty-state-box"><h3>Coming Soon</h3><p>Transaction history will be available shortly</p></div>';
  }
}

function renderTransactionsTable(transactions) {
  var container = document.getElementById('transactions-table-container');
  if (transactions.length === 0) {
    container.innerHTML = '<div class="empty-state-box"><h3>No transactions</h3></div>';
    return;
  }
  
  var html = 
    '<table class="data-table">' +
      '<thead><tr><th>Type</th><th>User</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>' +
      '<tbody>';
  
  transactions.forEach(function(t) {
    var typeClass = t.type === 'deposit' || t.type === 'investment' ? 'badge-success' : 'badge-warning';
    html += '<tr><td><span class="badge ' + typeClass + '">' + t.type + '</span></td><td>' + (t.userId || 'N/A') + '</td><td>GH₵' + (t.amount || 0).toLocaleString() + '</td><td>' + (t.status || 'N/A') + '</td><td>' + new Date(t.createdAt).toLocaleString() + '</td></tr>';
  });
  
  html += '</tbody></table>';
  container.innerHTML = html;
}

// ==================== AUDIT LOG PAGE ====================
function loadAuditPage(adminApi, api) {
  var main = document.getElementById('admin-main');
  
  var html = 
    '<div class="admin-page-header">' +
      '<div class="page-title-section">' +
        '<h1>Audit Log</h1>' +
        '<div class="breadcrumb"><a href="#" onclick="loadPage(\'dashboard\', window._adminApi, window._api)">Dashboard</a> / Audit</div>' +
      '</div>' +
    '</div>' +
    
    '<div class="admin-panel">' +
      '<div class="panel-body no-padding">' +
        '<div id="audit-table-container"><div class="loading-spinner"><div class="spinner"></div></div></div>' +
      '</div>' +
    '</div>';
  
  main.innerHTML = html;
  
  if (adminApi.getAuditLog) {
    adminApi.getAuditLog({ limit: 100 }).then(function(result) {
      renderAuditTable(result.logs || []);
    }).catch(function(err) {
      document.getElementById('audit-table-container').innerHTML = '<div class="empty-state-box"><p>Error: ' + escapeHtml(err.message) + '</p></div>';
    });
  } else {
    document.getElementById('audit-table-container').innerHTML = '<div class="empty-state-box"><h3>Coming Soon</h3><p>Audit log will track all admin actions</p></div>';
  }
}

function renderAuditTable(logs) {
  var container = document.getElementById('audit-table-container');
  if (logs.length === 0) {
    container.innerHTML = '<div class="empty-state-box"><h3>No audit logs</h3></div>';
    return;
  }
  
  var html = 
    '<table class="data-table">' +
      '<thead><tr><th>Action</th><th>Admin</th><th>Target</th><th>Details</th><th>Date</th></tr></thead>' +
      '<tbody>';
  
  logs.forEach(function(log) {
    html += '<tr><td><strong>' + log.action + '</strong></td><td>' + (log.adminName || log.adminId) + '</td><td>' + (log.targetType || '-') + '</td><td>' + (log.details || '-') + '</td><td>' + new Date(log.createdAt).toLocaleString() + '</td></tr>';
  });
  
  html += '</tbody></table>';
  container.innerHTML = html;
}

// ==================== MODAL FUNCTIONS ====================

// Credit Wallet Modal
function showCreditWalletModal(userId, userName) {
  var modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = 
    '<div class="modal-content" style="max-width: 400px;">' +
      '<h2>💳 Credit User Wallet</h2>' +
      (userName ? '<p style="color: var(--text-muted);">User: <strong>' + userName + '</strong></p>' : '') +
      '<form id="credit-wallet-form">' +
        (!userId ? '<div class="form-group"><label>User Email</label><input type="email" id="credit-user-email" required placeholder="user@example.com"></div>' : '<input type="hidden" id="credit-user-id" value="' + userId + '">') +
        '<div class="form-group"><label>Amount (GH₵)</label><input type="number" id="credit-amount" required min="1" step="0.01" placeholder="100"></div>' +
        '<div class="form-group"><label>Reason</label><input type="text" id="credit-reason" required placeholder="e.g., Bank transfer deposit"></div>' +
        '<div style="display: flex; gap: 1rem;">' +
          '<button type="button" class="btn btn-outline" onclick="this.closest(\'.modal\').remove()" style="flex:1;">Cancel</button>' +
          '<button type="submit" class="btn btn-primary" style="flex:1;">Credit Wallet</button>' +
        '</div>' +
      '</form>' +
    '</div>';
  
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
  
  modal.querySelector('#credit-wallet-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var amount = parseFloat(document.getElementById('credit-amount').value);
    var reason = document.getElementById('credit-reason').value;
    var targetUserId = userId || null;
    var email = document.getElementById('credit-user-email') ? document.getElementById('credit-user-email').value : null;
    
    var btn = this.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Processing...';
    
    window._adminApi.creditUserWallet({ userId: targetUserId, email: email, amount: amount, reason: reason })
      .then(function(result) {
        alert('✅ Wallet credited successfully! New balance: GH₵' + (result.newBalance || 0).toLocaleString());
        modal.remove();
        if (typeof filterUsers === 'function' && document.getElementById('users-table-container')) filterUsers();
      })
      .catch(function(err) {
        alert('❌ Error: ' + err.message);
        btn.disabled = false;
        btn.textContent = 'Credit Wallet';
      });
  });
}

// Broadcast Email Modal
function showBroadcastModal() {
  var modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = 
    '<div class="modal-content" style="max-width: 500px;">' +
      '<h2>📧 Broadcast Email</h2>' +
      '<form id="broadcast-form">' +
        '<div class="form-group">' +
          '<label>Recipients</label>' +
          '<select id="broadcast-target" required style="width:100%; padding: 0.5rem;">' +
            '<option value="all">All Users</option>' +
            '<option value="investors">Investors Only</option>' +
            '<option value="verified">Verified Users</option>' +
          '</select>' +
        '</div>' +
        '<div class="form-group"><label>Subject</label><input type="text" id="broadcast-subject" required placeholder="Important Update"></div>' +
        '<div class="form-group"><label>Message</label><textarea id="broadcast-message" required rows="5" placeholder="Write your message..." style="width:100%; padding: 0.5rem;"></textarea></div>' +
        '<div style="display: flex; gap: 1rem;">' +
          '<button type="button" class="btn btn-outline" onclick="this.closest(\'.modal\').remove()" style="flex:1;">Cancel</button>' +
          '<button type="submit" class="btn btn-primary" style="flex:1;">Send Email</button>' +
        '</div>' +
      '</form>' +
    '</div>';
  
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
  
  modal.querySelector('#broadcast-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var target = document.getElementById('broadcast-target').value;
    var subject = document.getElementById('broadcast-subject').value;
    var message = document.getElementById('broadcast-message').value;
    
    if (!confirm('Send email to ' + target + ' users?')) return;
    
    var btn = this.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending...';
    
    window._adminApi.sendBroadcastEmail({ target: target, subject: subject, message: message })
      .then(function(result) {
        alert('✅ Email sent to ' + (result.sentCount || 0) + ' users');
        modal.remove();
      })
      .catch(function(err) {
        alert('❌ Error: ' + err.message);
        btn.disabled = false;
        btn.textContent = 'Send Email';
      });
  });
}

// Withdraw Investment Modal
function showWithdrawInvestmentModal(investmentId, amount, projectName, userName) {
  var modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = 
    '<div class="modal-content" style="max-width: 450px;">' +
      '<h2>💸 End Investment</h2>' +
      '<p>User: <strong>' + userName + '</strong></p>' +
      '<p>Project: <strong>' + projectName + '</strong></p>' +
      '<p>Amount: <strong>GH₵' + amount.toLocaleString() + '</strong></p>' +
      '<form id="withdraw-inv-form">' +
        '<div class="form-group"><label>Reason</label><input type="text" id="withdraw-reason" required value="User requested withdrawal"></div>' +
        '<div class="form-group">' +
          '<label class="checkbox-label"><input type="checkbox" id="apply-penalty"> Apply early withdrawal penalty</label>' +
        '</div>' +
        '<div class="form-group" id="penalty-group" style="display:none;">' +
          '<label>Penalty %</label>' +
          '<select id="penalty-percent" style="width:100%; padding: 0.5rem;"><option value="5">5%</option><option value="10" selected>10%</option><option value="15">15%</option><option value="20">20%</option></select>' +
        '</div>' +
        '<div id="refund-preview" style="background: var(--surface-elevated); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">' +
          '<div style="display:flex; justify-content:space-between;"><span>Principal:</span><span>GH₵' + amount.toLocaleString() + '</span></div>' +
          '<div style="display:flex; justify-content:space-between;" id="penalty-row"><span>Penalty:</span><span id="penalty-amount">-GH₵0</span></div>' +
          '<div style="display:flex; justify-content:space-between; font-weight:bold; border-top: 1px solid var(--border-color); padding-top: 0.5rem; margin-top: 0.5rem;"><span>Refund:</span><span id="refund-amount">GH₵' + amount.toLocaleString() + '</span></div>' +
        '</div>' +
        '<div style="display: flex; gap: 1rem;">' +
          '<button type="button" class="btn btn-outline" onclick="this.closest(\'.modal\').remove()" style="flex:1;">Cancel</button>' +
          '<button type="submit" class="btn btn-warning" style="flex:1;">End Investment</button>' +
        '</div>' +
      '</form>' +
    '</div>';
  
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
  
  var penaltyCheckbox = modal.querySelector('#apply-penalty');
  var penaltyGroup = modal.querySelector('#penalty-group');
  var penaltySelect = modal.querySelector('#penalty-percent');
  
  function updatePreview() {
    var penalty = penaltyCheckbox.checked ? (amount * parseFloat(penaltySelect.value) / 100) : 0;
    modal.querySelector('#penalty-amount').textContent = '-GH₵' + penalty.toLocaleString();
    modal.querySelector('#refund-amount').textContent = 'GH₵' + (amount - penalty).toLocaleString();
    modal.querySelector('#penalty-row').style.display = penaltyCheckbox.checked ? 'flex' : 'none';
  }
  
  penaltyCheckbox.addEventListener('change', function() {
    penaltyGroup.style.display = this.checked ? 'block' : 'none';
    updatePreview();
  });
  penaltySelect.addEventListener('change', updatePreview);
  updatePreview();
  
  modal.querySelector('#withdraw-inv-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var reason = document.getElementById('withdraw-reason').value;
    var applyPenalty = penaltyCheckbox.checked;
    var penaltyPercent = parseFloat(penaltySelect.value);
    
    var btn = this.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Processing...';
    
    window._adminApi.withdrawInvestment(investmentId, { reason: reason, applyPenalty: applyPenalty, penaltyPercent: penaltyPercent })
      .then(function(result) {
        alert('✅ Investment ended. Refunded: GH₵' + (result.refundAmount || 0).toLocaleString());
        modal.remove();
        loadInvestmentsTable();
      })
      .catch(function(err) {
        alert('❌ Error: ' + err.message);
        btn.disabled = false;
        btn.textContent = 'End Investment';
      });
  });
}

// Complete Project Modal
function showCompleteProjectModal(projectId, projectName) {
  var modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = 
    '<div class="modal-content" style="max-width: 450px;">' +
      '<h2>✅ Complete Project</h2>' +
      '<p>Project: <strong>' + projectName + '</strong></p>' +
      '<div style="background: #d1fae5; padding: 1rem; border-radius: 8px; margin: 1rem 0;">' +
        '<p style="margin:0;"><strong>This will:</strong></p>' +
        '<ul style="margin: 0.5rem 0 0 1rem; padding: 0;"><li>Mark project as completed</li><li>Return all principals to investors</li><li>Send completion emails</li></ul>' +
      '</div>' +
      '<div style="display: flex; gap: 1rem;">' +
        '<button class="btn btn-outline" onclick="this.closest(\'.modal\').remove()" style="flex:1;">Cancel</button>' +
        '<button class="btn btn-success" onclick="completeProject(\'' + projectId + '\', this)" style="flex:1;">Complete Project</button>' +
      '</div>' +
    '</div>';
  
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
}

function completeProject(projectId, btn) {
  btn.disabled = true;
  btn.textContent = 'Processing...';
  
  window._adminApi.completeProject(projectId)
    .then(function(result) {
      alert('✅ Project completed. ' + (result.investorCount || 0) + ' investors refunded.');
      btn.closest('.modal').remove();
      filterProjects();
    })
    .catch(function(err) {
      alert('❌ Error: ' + err.message);
      btn.disabled = false;
      btn.textContent = 'Complete Project';
    });
}

// User Detail Modal
function showUserDetail(userId) {
  window._adminApi.getUser(userId).then(function(user) {
    var modal = document.createElement('div');
    modal.className = 'modal active';
    var initials = (user.name || user.email || 'U').substring(0, 2).toUpperCase();
    var kycStatus = user.kyc ? user.kyc.status : 'pending';
    
    modal.innerHTML = 
      '<div class="modal-content" style="max-width: 600px; padding: 0; overflow: hidden;">' +
        '<div class="user-detail-header">' +
          '<div class="user-detail-avatar">' + initials + '</div>' +
          '<div class="user-detail-info">' +
            '<h2>' + escapeHtml(user.name || 'No Name') + '</h2>' +
            '<p>' + escapeHtml(user.email) + '</p>' +
            '<div class="user-detail-badges">' +
              '<span class="badge">' + (user.role || 'investor') + '</span>' +
              '<span class="badge">' + kycStatus + '</span>' +
            '</div>' +
          '</div>' +
          '<button class="btn btn-sm" style="position:absolute; top:1rem; right:1rem; background:rgba(255,255,255,0.2);" onclick="this.closest(\'.modal\').remove()">✕</button>' +
        '</div>' +
        '<div class="user-stats-row">' +
          '<div class="user-stat-item"><div class="value">GH₵' + (user.walletBalance || 0).toLocaleString() + '</div><div class="label">Wallet</div></div>' +
          '<div class="user-stat-item"><div class="value">GH₵' + (user.totalInvested || 0).toLocaleString() + '</div><div class="label">Invested</div></div>' +
          '<div class="user-stat-item"><div class="value">GH₵' + (user.totalEarnings || 0).toLocaleString() + '</div><div class="label">Earnings</div></div>' +
          '<div class="user-stat-item"><div class="value">' + (user.investments ? user.investments.length : 0) + '</div><div class="label">Investments</div></div>' +
        '</div>' +
        '<div style="padding: 1.5rem;">' +
          '<h4 style="margin-bottom: 0.5rem;">Quick Actions</h4>' +
          '<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">' +
            '<button class="btn btn-sm btn-outline" onclick="showCreditWalletModal(\'' + user.id + '\', \'' + (user.name || user.email).replace(/'/g, "\\'") + '\')">💳 Credit Wallet</button>' +
            (kycStatus === 'submitted' ? '<button class="btn btn-sm btn-success" onclick="approveKyc(\'' + user.id + '\')">✓ Approve KYC</button>' : '') +
            '<button class="btn btn-sm btn-outline" onclick="verifyUserEmail(\'' + user.id + '\')">📧 Verify Email</button>' +
            '<button class="btn btn-sm btn-danger" onclick="confirmDeleteUser(\'' + user.id + '\', \'' + (user.name || user.email).replace(/'/g, "\\'") + '\')">🗑️ Delete</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
  }).catch(function(err) {
    alert('Error loading user: ' + err.message);
  });
}

// Delete User Confirmation
function confirmDeleteUser(userId, userName) {
  if (!confirm('Delete user "' + userName + '"?\n\nThis will:\n- Mark their investments as orphaned\n- Remove user from system\n\nThis cannot be undone!')) return;
  
  window._adminApi.deleteUser(userId)
    .then(function(result) {
      alert('✅ User deleted. ' + (result.investmentsOrphaned || 0) + ' investments orphaned.');
      if (typeof filterUsers === 'function' && document.getElementById('users-table-container')) filterUsers();
      document.querySelectorAll('.modal').forEach(function(m) { m.remove(); });
    })
    .catch(function(err) {
      alert('❌ Error: ' + err.message);
    });
}

// Approve/Reject KYC
function approveKyc(userId) {
  window._adminApi.reviewKyc(userId, 'approve')
    .then(function() {
      alert('✅ KYC approved');
      loadPage('kyc', window._adminApi, window._api);
    })
    .catch(function(err) { alert('Error: ' + err.message); });
}

function rejectKyc(userId) {
  var reason = prompt('Enter rejection reason:');
  if (!reason) return;
  
  window._adminApi.reviewKyc(userId, 'reject', reason)
    .then(function() {
      alert('KYC rejected');
      loadPage('kyc', window._adminApi, window._api);
    })
    .catch(function(err) { alert('Error: ' + err.message); });
}

// Verify Email
function verifyUserEmail(userId) {
  window._adminApi.verifyUserEmail(userId)
    .then(function() { alert('✅ Email verified'); })
    .catch(function(err) { alert('Error: ' + err.message); });
}

// Process Withdrawal
function processWithdrawal(withdrawalId, action) {
  var reason = action === 'reject' ? prompt('Rejection reason:') : null;
  if (action === 'reject' && !reason) return;
  
  window._adminApi.processWithdrawal(withdrawalId, action, reason)
    .then(function() {
      alert('✅ Withdrawal ' + action + 'd');
      loadWithdrawalsTable();
    })
    .catch(function(err) { alert('Error: ' + err.message); });
}

// Cleanup Orphaned
function runOrphanedCleanup() {
  if (!confirm('Cleanup orphaned investments and recalculate project stats?')) return;
  
  window._adminApi.cleanupOrphanedInvestments()
    .then(function(result) {
      alert('✅ Cleanup complete!\nOrphaned: ' + (result.count || 0) + '\nProjects updated: ' + (result.affectedProjects || 0));
    })
    .catch(function(err) { alert('Error: ' + err.message); });
}

// Export Report
function exportReport() {
  var startDate = document.getElementById('report-start').value;
  var endDate = document.getElementById('report-end').value;
  alert('Export feature coming soon.\n\nPeriod: ' + startDate + ' to ' + endDate + '\n\nThe data is displayed above for now.');
}

// Show Ticket Detail
function showTicketDetail(ticketId) {
  if (!window._adminApi.getTicketDetail) {
    alert('Ticket details will be available soon.');
    return;
  }
  
  window._adminApi.getTicketDetail(ticketId).then(function(ticket) {
    var modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = 
      '<div class="modal-content" style="max-width: 600px;">' +
        '<h2>🎫 Ticket: ' + escapeHtml(ticket.ticketId || ticket._id) + '</h2>' +
        '<div style="margin-bottom: 1rem;">' +
          '<p><strong>Subject:</strong> ' + escapeHtml(ticket.subject || 'N/A') + '</p>' +
          '<p><strong>From:</strong> ' + escapeHtml(ticket.email || 'N/A') + '</p>' +
          '<p><strong>Category:</strong> ' + escapeHtml(ticket.category || 'general') + '</p>' +
          '<p><strong>Status:</strong> <span class="badge">' + (ticket.status || 'open') + '</span></p>' +
        '</div>' +
        '<div style="background: var(--surface-elevated); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">' +
          '<strong>Message:</strong><br>' +
          '<p style="white-space: pre-wrap;">' + escapeHtml(ticket.message || 'No message') + '</p>' +
        '</div>' +
        '<div style="display: flex; gap: 1rem;">' +
          '<button class="btn btn-outline" onclick="this.closest(\'.modal\').remove()" style="flex:1;">Close</button>' +
          (ticket.status !== 'resolved' ? '<button class="btn btn-success" onclick="resolveTicket(\'' + (ticket._id || ticket.ticketId) + '\'); this.closest(\'.modal\').remove();" style="flex:1;">Mark Resolved</button>' : '') +
        '</div>' +
      '</div>';
    
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
  }).catch(function(err) {
    alert('Error loading ticket: ' + err.message);
  });
}

// Resolve Ticket
function resolveTicket(ticketId) {
  if (!window._adminApi.resolveTicket) {
    alert('This feature will be available soon.');
    return;
  }
  
  window._adminApi.resolveTicket(ticketId)
    .then(function() {
      alert('✅ Ticket resolved');
      loadTicketsTable();
    })
    .catch(function(err) { alert('Error: ' + err.message); });
}

function readImageFileAsDataUrl(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function() { resolve(reader.result); };
    reader.onerror = function() { reject(new Error('Failed to read image file')); };
    reader.readAsDataURL(file);
  });
}

function uploadProjectImage(file) {
  if (!file) {
    return Promise.resolve(null);
  }
  if (!window._api || !window._api.uploadImage) {
    return Promise.reject(new Error('Image upload is not available'));
  }
  return readImageFileAsDataUrl(file).then(function(dataUrl) {
    return window._api.uploadImage(dataUrl, file.name).then(function(result) {
      return result.dataUrl || result.url || dataUrl;
    });
  });
}

// Create Project Modal
function showCreateProjectModal() {
  var modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = 
    '<div class="modal-content" style="max-width: 600px;">' +
      '<h2>🏗️ Create New Project</h2>' +
      '<form id="create-project-form">' +
        '<div class="form-group"><label>Project Name *</label><input type="text" id="proj-name" required placeholder="e.g., Kente Weaving Enterprise"></div>' +
        '<div class="form-group"><label>Description *</label><textarea id="proj-description" required rows="3" placeholder="Describe the project..."></textarea></div>' +
        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">' +
          '<div class="form-group"><label>Goal Amount (GH₵) *</label><input type="number" id="proj-goal" required min="100" placeholder="50000"></div>' +
          '<div class="form-group"><label>Min. Investment (GH₵)</label><input type="number" id="proj-min" min="10" value="100"></div>' +
        '</div>' +
        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">' +
          '<div class="form-group"><label>ROI (%)</label><input type="number" id="proj-roi" min="0" max="100" value="15" step="0.1"></div>' +
          '<div class="form-group"><label>Duration (months)</label><input type="number" id="proj-duration" min="1" max="60" value="12"></div>' +
        '</div>' +
        '<div class="form-group"><label>Category</label><select id="proj-category" style="width:100%; padding: 0.5rem;"><option value="agriculture">Agriculture</option><option value="manufacturing">Manufacturing</option><option value="technology">Technology</option><option value="services">Services</option><option value="retail">Retail</option><option value="real_estate">Real Estate</option></select></div>' +
        '<div class="form-group"><label>Project Image</label><input type="file" id="proj-image" accept="image/*"></div>' +
        '<div class="form-group"><label class="checkbox-label"><input type="checkbox" id="proj-featured"> Mark as Featured</label></div>' +
        '<div style="display: flex; gap: 1rem;">' +
          '<button type="button" class="btn btn-outline" onclick="this.closest(\'.modal\').remove()" style="flex:1;">Cancel</button>' +
          '<button type="submit" class="btn btn-primary" style="flex:1;">Create Project</button>' +
        '</div>' +
      '</form>' +
    '</div>';
  
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
  
  modal.querySelector('#create-project-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var btn = this.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Creating...';
    
    var imageFile = document.getElementById('proj-image').files[0] || null;
    var projectData = {
      name: document.getElementById('proj-name').value,
      description: document.getElementById('proj-description').value,
      goalAmount: parseFloat(document.getElementById('proj-goal').value),
      minInvestment: parseFloat(document.getElementById('proj-min').value) || 100,
      roi: parseFloat(document.getElementById('proj-roi').value) || 15,
      duration: parseInt(document.getElementById('proj-duration').value) || 12,
      category: document.getElementById('proj-category').value,
      featured: document.getElementById('proj-featured').checked,
      status: 'active'
    };

    uploadProjectImage(imageFile)
      .then(function(imageUrl) {
        if (imageUrl) {
          projectData.imageUrl = imageUrl;
        }
        return window._adminApi.createProject(projectData);
      })
      .then(function(result) {
        alert('✅ Project created successfully!');
        modal.remove();
        loadPage('projects', window._adminApi, window._api);
      })
      .catch(function(err) {
        alert('❌ Error: ' + err.message);
        btn.disabled = false;
        btn.textContent = 'Create Project';
      });
  });
}

// Edit Project Modal
function showEditProjectModal(projectId) {
  window._adminApi.getProject(projectId).then(function(project) {
    var existingImageUrl = (project.imageUrl || project.image_url || '').replace(/"/g, '&quot;');
    var modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = 
      '<div class="modal-content" style="max-width: 600px;">' +
        '<h2>✏️ Edit Project</h2>' +
        '<form id="edit-project-form">' +
          '<input type="hidden" id="edit-proj-id" value="' + projectId + '">' +
          '<div class="form-group"><label>Project Name</label><input type="text" id="edit-proj-name" required value="' + (project.name || '').replace(/"/g, '&quot;') + '"></div>' +
          '<div class="form-group"><label>Description</label><textarea id="edit-proj-description" rows="3">' + (project.description || '') + '</textarea></div>' +
          '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">' +
            '<div class="form-group"><label>Goal Amount (GH₵)</label><input type="number" id="edit-proj-goal" value="' + (project.goalAmount || project.goal_amount || 0) + '"></div>' +
            '<div class="form-group"><label>Min. Investment (GH₵)</label><input type="number" id="edit-proj-min" value="' + (project.minInvestment || project.min_investment || 100) + '"></div>' +
          '</div>' +
          '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">' +
            '<div class="form-group"><label>ROI (%)</label><input type="number" id="edit-proj-roi" value="' + (project.roi || project.expected_returns || 15) + '" step="0.1"></div>' +
            '<div class="form-group"><label>Status</label><select id="edit-proj-status" style="width:100%; padding: 0.5rem;"><option value="active"' + (project.status === 'active' ? ' selected' : '') + '>Active</option><option value="inactive"' + (project.status === 'inactive' ? ' selected' : '') + '>Inactive</option><option value="completed"' + (project.status === 'completed' ? ' selected' : '') + '>Completed</option></select></div>' +
          '</div>' +
          '<div class="form-group"><label>Project Image</label><input type="file" id="edit-proj-image" accept="image/*" data-current-url="' + existingImageUrl + '"></div>' +
          '<div class="form-group"><label class="checkbox-label"><input type="checkbox" id="edit-proj-featured"' + (project.featured ? ' checked' : '') + '> Mark as Featured</label></div>' +
          '<div style="display: flex; gap: 1rem;">' +
            '<button type="button" class="btn btn-outline" onclick="this.closest(\'.modal\').remove()" style="flex:1;">Cancel</button>' +
            '<button type="submit" class="btn btn-primary" style="flex:1;">Save Changes</button>' +
          '</div>' +
        '</form>' +
      '</div>';
    
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
    
    modal.querySelector('#edit-project-form').addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = this.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Saving...';

      var imageFile = document.getElementById('edit-proj-image').files[0] || null;
      var currentImageUrl = document.getElementById('edit-proj-image').getAttribute('data-current-url') || '';
      
      var updates = {
        name: document.getElementById('edit-proj-name').value,
        description: document.getElementById('edit-proj-description').value,
        goalAmount: parseFloat(document.getElementById('edit-proj-goal').value),
        minInvestment: parseFloat(document.getElementById('edit-proj-min').value),
        roi: parseFloat(document.getElementById('edit-proj-roi').value),
        status: document.getElementById('edit-proj-status').value,
        featured: document.getElementById('edit-proj-featured').checked
      };

      uploadProjectImage(imageFile)
        .then(function(imageUrl) {
          updates.imageUrl = imageUrl || currentImageUrl || undefined;
          return window._adminApi.updateProject(projectId, updates);
        })
        .then(function(result) {
          alert('✅ Project updated!');
          modal.remove();
          loadPage('projects', window._adminApi, window._api);
        })
        .catch(function(err) {
          alert('❌ Error: ' + err.message);
          btn.disabled = false;
          btn.textContent = 'Save Changes';
        });
    });
  }).catch(function(err) {
    alert('Error loading project: ' + err.message);
  });
}

// Distribute Profit Modal
function showDistributeProfitModal(projectId, projectName) {
  var modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = 
    '<div class="modal-content" style="max-width: 450px;">' +
      '<h2>💰 Distribute Profits</h2>' +
      '<p>Project: <strong>' + projectName + '</strong></p>' +
      '<form id="distribute-form">' +
        '<div class="form-group"><label>Profit Amount (GH₵)</label><input type="number" id="profit-amount" required min="1" step="0.01" placeholder="5000"></div>' +
        '<div class="form-group"><label>Description</label><input type="text" id="profit-desc" placeholder="Monthly profit distribution"></div>' +
        '<div style="background: var(--surface-elevated); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">' +
          '<p style="margin: 0; font-size: 0.9rem;"><strong>Note:</strong> Profits will be distributed proportionally to all active investors based on their investment amounts.</p>' +
        '</div>' +
        '<div style="display: flex; gap: 1rem;">' +
          '<button type="button" class="btn btn-outline" onclick="this.closest(\'.modal\').remove()" style="flex:1;">Cancel</button>' +
          '<button type="submit" class="btn btn-success" style="flex:1;">Distribute</button>' +
        '</div>' +
      '</form>' +
    '</div>';
  
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
  
  modal.querySelector('#distribute-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var amount = parseFloat(document.getElementById('profit-amount').value);
    var description = document.getElementById('profit-desc').value;
    
    if (!confirm('Distribute GH₵' + amount.toLocaleString() + ' to all investors?')) return;
    
    var btn = this.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Distributing...';
    
    window._adminApi.distributeProfits(projectId, amount, description)
      .then(function(result) {
        alert('✅ Distributed GH₵' + (result.totalDistributed || amount).toLocaleString() + ' to ' + (result.investorCount || 0) + ' investors');
        modal.remove();
      })
      .catch(function(err) {
        alert('❌ Error: ' + err.message);
        btn.disabled = false;
        btn.textContent = 'Distribute';
      });
  });
}

// =====================
// Expose functions to window for onclick handlers
// (ES modules scope functions locally, but inline onclick needs global access)
// =====================
window.loadPage = loadPage;
window.showCreateProjectModal = showCreateProjectModal;
window.showCreditWalletModal = showCreditWalletModal;
window.showBroadcastModal = showBroadcastModal;
window.runOrphanedCleanup = runOrphanedCleanup;
window.showUserDetail = showUserDetail;
window.confirmDeleteUser = confirmDeleteUser;
window.showWithdrawInvestmentModal = showWithdrawInvestmentModal;
window.processWithdrawal = processWithdrawal;
window.approveKyc = approveKyc;
window.rejectKyc = rejectKyc;
window.showEditProjectModal = showEditProjectModal;
window.showDistributeProfitModal = showDistributeProfitModal;
window.showCompleteProjectModal = showCompleteProjectModal;
window.completeProject = completeProject;
window.showTicketDetail = showTicketDetail;
window.resolveTicket = resolveTicket;
window.exportReport = exportReport;
window.verifyUserEmail = verifyUserEmail;
window.filterProjects = filterProjects;

export { renderAdmin };
