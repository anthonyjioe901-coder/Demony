// Admin Dashboard Page - Improved UI/UX
function renderAdmin(container, api) {
  // Check if user is admin
  var user = api.user;
  if (!user || user.role !== 'admin') {
    container.innerHTML = '<section class="admin-denied"><h2>Access Denied</h2><p>Admin privileges required.</p></section>';
    return;
  }
  
  // Get admin API helper
  var adminApi = api.getAdmin();
  
  var html = 
    '<section class="admin-dashboard">' +
      // Header
      '<div class="admin-header">' +
        '<h1>Admin Dashboard</h1>' +
        '<p class="admin-subtitle">Manage your platform</p>' +
      '</div>' +
      
      // Action Cards - Only shows pending items that need attention
      '<div id="admin-alerts"></div>' +
      
      // Main Actions Grid
      '<div class="admin-actions-grid">' +
        // Create Project Card
        '<div class="admin-action-card create-card" data-action="create-project">' +
          '<div class="action-icon create-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>' +
          '<div class="action-info">' +
            '<h3>Create Project</h3>' +
            '<p>Add new investment project</p>' +
          '</div>' +
        '</div>' +
        
        // Users Card
        '<div class="admin-action-card" data-action="all-users">' +
          '<div class="action-icon users-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>' +
          '<div class="action-info">' +
            '<h3>Manage Users</h3>' +
            '<p>View all investors</p>' +
          '</div>' +
        '</div>' +

        // Investments Card
        '<div class="admin-action-card" data-action="all-investments">' +
          '<div class="action-icon investments-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg></div>' +
          '<div class="action-info">' +
            '<h3>Investments</h3>' +
            '<p>View latest investments</p>' +
          '</div>' +
        '</div>' +
        
        // Projects Card
        '<div class="admin-action-card active" data-action="all-projects">' +
          '<div class="action-icon projects-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg></div>' +
          '<div class="action-info">' +
            '<h3>All Projects</h3>' +
            '<p>Manage projects</p>' +
          '</div>' +
        '</div>' +
      '</div>' +
      
      // Content Area
      '<div id="admin-content"></div>' +
    '</section>';
  
  container.innerHTML = html;
  
  // Load alerts (pending items)
  loadAdminAlerts(adminApi);
  
  // Default: show all projects
  loadAdminTab(adminApi, api, 'all-projects');
  
  // Action card click handlers
  document.querySelectorAll('.admin-action-card').forEach(function(card) {
    card.addEventListener('click', function() {
      var action = this.getAttribute('data-action');
      // Remove active from all cards
      document.querySelectorAll('.admin-action-card').forEach(function(c) {
        c.classList.remove('active');
      });
      this.classList.add('active');
      loadAdminTab(adminApi, api, action);
    });
  });
}

// Load alerts for pending items
function loadAdminAlerts(adminApi) {
  var alertsContainer = document.getElementById('admin-alerts');
  
  adminApi.getStats()
    .then(function(stats) {
      var alerts = [];
      
      if (stats.users.pendingKyc > 0) {
        alerts.push(
          '<div class="admin-alert kyc-alert" data-action="pending-kyc">' +
            '<div class="alert-left">' +
              '<span class="alert-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg></span>' +
              '<div class="alert-info">' +
                '<strong>' + stats.users.pendingKyc + ' Pending KYC</strong>' +
                '<span>Users waiting for verification</span>' +
              '</div>' +
            '</div>' +
            '<button class="btn btn-sm">Review</button>' +
          '</div>'
        );
      }
      
      if (stats.projects.pending > 0) {
        alerts.push(
          '<div class="admin-alert project-alert" data-action="pending-projects">' +
            '<div class="alert-left">' +
              '<span class="alert-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="15" x2="15" y2="15"/></svg></span>' +
              '<div class="alert-info">' +
                '<strong>' + stats.projects.pending + ' Pending Projects</strong>' +
                '<span>Projects awaiting approval</span>' +
              '</div>' +
            '</div>' +
            '<button class="btn btn-sm">Review</button>' +
          '</div>'
        );
      }
      
      if (stats.withdrawals.pending > 0) {
        alerts.push(
          '<div class="admin-alert withdrawal-alert" data-action="pending-withdrawals">' +
            '<div class="alert-left">' +
              '<span class="alert-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></span>' +
              '<div class="alert-info">' +
                '<strong>' + stats.withdrawals.pending + ' Withdrawals</strong> <span class="amount">GH₵' + stats.withdrawals.pendingAmount.toLocaleString() + '</span>' +
                '<span>Waiting for processing</span>' +
              '</div>' +
            '</div>' +
            '<button class="btn btn-sm btn-danger">Process</button>' +
          '</div>'
        );
      }
      
      if (alerts.length > 0) {
        alertsContainer.innerHTML = 
          '<div class="alerts-section">' +
            '<h3 class="alerts-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display: inline; margin-right: 8px; vertical-align: middle;"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> Requires Action</h3>' +
            '<div class="alerts-list">' + alerts.join('') + '</div>' +
          '</div>';
        
        document.querySelectorAll('.admin-alert').forEach(function(card) {
          card.addEventListener('click', function() {
            var action = this.getAttribute('data-action');
            loadAdminTab(window.adminApiRef, window.apiRef, action);
          });
        });
      } else {
        alertsContainer.innerHTML = 
          '<div class="no-alerts">' +
            '<span class="check-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg></span>' +
            '<p>All caught up! No pending actions.</p>' +
          '</div>';
      }
    })
    .catch(function(err) {
      alertsContainer.innerHTML = '<div class="alert-error">Error loading alerts: ' + err.message + '</div>';
    });
}

function loadAdminTab(adminApi, api, tab) {
  // Store refs for alert click handlers
  window.adminApiRef = adminApi;
  window.apiRef = api;
  
  var content = document.getElementById('admin-content');
  
  var titles = {
    'pending-kyc': { icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>', title: 'Pending KYC Verifications' },
    'pending-projects': { icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="15" x2="15" y2="15"/></svg>', title: 'Pending Project Approvals' },
    'pending-withdrawals': { icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', title: 'Pending Withdrawals' },
    'all-users': { icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', title: 'All Users' },
    'all-investments': { icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg>', title: 'All Investments' },
    'all-projects': { icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>', title: 'All Projects' },
    'create-project': { icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>', title: 'Create New Project' }
  };
  
  var sectionInfo = titles[tab] || { icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a6 6 0 0 0-6-6 6 6 0 0 0-6 6v1h12v-1z"/><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/></svg>', title: 'Admin' };
  
  content.innerHTML = 
    '<div class="admin-section-header">' +
      '<span class="section-icon" style="display: flex; align-items: center; justify-content: center;">' + sectionInfo.icon + '</span>' +
      '<h2>' + sectionInfo.title + '</h2>' +
    '</div>' +
    '<div id="tab-content" class="tab-content"><div class="loading">Loading...</div></div>';
  
  var tabContent = document.getElementById('tab-content');
  
  // ========== PENDING KYC ==========
  if (tab === 'pending-kyc') {
    adminApi.getUsers({ kycStatus: 'submitted' })
      .then(function(result) {
        if (result.users.length === 0) {
          tabContent.innerHTML = '<div class="empty-state"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; margin-right: 8px; vertical-align: middle;"><path d="M20 6L9 17l-5-5"/></svg> No pending KYC verifications</div>';
          return;
        }
        
        tabContent.innerHTML = '<div class="admin-list">' + result.users.map(function(user) {
          return '<div class="admin-list-item">' +
            '<div class="item-main">' +
              '<h4>' + user.name + '</h4>' +
              '<p>' + user.email + '</p>' +
              '<span class="badge">' + user.role + '</span>' +
            '</div>' +
            '<div class="item-actions">' +
              '<button class="btn btn-sm btn-primary approve-kyc-btn" data-id="' + user.id + '">Approve</button>' +
              '<button class="btn btn-sm btn-outline reject-kyc-btn" data-id="' + user.id + '">Reject</button>' +
            '</div>' +
          '</div>';
        }).join('') + '</div>';
        
        attachKYCHandlers(adminApi, api);
      });
  }
  
  // ========== PENDING PROJECTS ==========
  else if (tab === 'pending-projects') {
    adminApi.getProjects({ status: 'pending_review' })
      .then(function(result) {
        if (result.projects.length === 0) {
          tabContent.innerHTML = '<div class="empty-state"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; margin-right: 8px; vertical-align: middle;"><path d="M20 6L9 17l-5-5"/></svg> No pending project reviews</div>';
          return;
        }
        
        tabContent.innerHTML = '<div class="admin-list">' + result.projects.map(function(project) {
          return '<div class="admin-list-item">' +
            '<div class="item-main">' +
              '<h4>' + project.name + '</h4>' +
              '<p>' + project.description.substring(0, 100) + '...</p>' +
              '<div class="badges">' +
                '<span class="badge">' + project.category + '</span>' +
                '<span class="badge badge-success">Goal: GH₵' + (project.goalAmount || 0).toLocaleString() + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="item-actions">' +
              '<button class="btn btn-sm btn-primary approve-project-btn" data-id="' + project.id + '">Approve</button>' +
              '<button class="btn btn-sm btn-outline request-changes-btn" data-id="' + project.id + '">Request Changes</button>' +
            '</div>' +
          '</div>';
        }).join('') + '</div>';
        
        attachProjectReviewHandlers(adminApi, api);
      });
  }
  
  // ========== PENDING WITHDRAWALS ==========
  else if (tab === 'pending-withdrawals') {
    adminApi.getWithdrawals({ status: 'pending' })
      .then(function(result) {
        if (result.withdrawals.length === 0) {
          tabContent.innerHTML = '<div class="empty-state"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; margin-right: 8px; vertical-align: middle;"><path d="M20 6L9 17l-5-5"/></svg> No pending withdrawals</div>';
          return;
        }
        
        tabContent.innerHTML = '<div class="admin-list">' + result.withdrawals.map(function(w) {
          return '<div class="admin-list-item">' +
            '<div class="item-main">' +
              '<h4>GH₵' + w.amount.toLocaleString() + '</h4>' +
              '<p>' + (w.user ? w.user.name + ' (' + w.user.email + ')' : 'User ' + w.userId) + '</p>' +
              '<div class="badges">' +
                '<span class="badge">' + w.method + '</span>' +
                '<span class="date">' + new Date(w.createdAt).toLocaleDateString() + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="item-actions">' +
              '<button class="btn btn-sm btn-primary approve-withdrawal-btn" data-id="' + w.id + '">Approve & Pay</button>' +
              '<button class="btn btn-sm btn-outline reject-withdrawal-btn" data-id="' + w.id + '">Reject</button>' +
            '</div>' +
          '</div>';
        }).join('') + '</div>';
        
        attachWithdrawalHandlers(adminApi, api);
      });
  }

  // ========== ALL INVESTMENTS ==========
  else if (tab === 'all-investments') {
    // Show filters and search
    tabContent.innerHTML = 
      '<div class="admin-investments-header" style="margin-bottom: 1.5rem;">' +
        '<div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; margin-bottom: 1rem;">' +
          '<select id="admin-inv-status-filter" style="padding: 0.75rem 1rem; border: 2px solid var(--border-color); border-radius: 10px; background: var(--card-bg); color: var(--text-color);">' +
            '<option value="">All Statuses</option>' +
            '<option value="active" selected>Active</option>' +
            '<option value="completed">Completed</option>' +
            '<option value="withdrawn">Withdrawn</option>' +
            '<option value="orphaned">Orphaned</option>' +
            '<option value="cancelled">Cancelled</option>' +
          '</select>' +
          '<button id="cleanup-orphaned-btn" class="btn-secondary" style="padding: 0.75rem 1rem;">🧹 Cleanup Orphaned</button>' +
        '</div>' +
        '<div id="admin-inv-count" style="color: var(--text-muted); font-size: 0.9rem; font-weight: 600;">Loading...</div>' +
      '</div>' +
      '<div id="admin-investments-list">Loading investments...</div>';
    
    // Load investments function
    function loadInvestments() {
      var status = document.getElementById('admin-inv-status-filter').value;
      var listContainer = document.getElementById('admin-investments-list');
      
      listContainer.innerHTML = '<div style="text-align: center; padding: 2rem;">Loading investments...</div>';
      
      adminApi.getInvestments({ limit: 100, status: status || undefined })
        .then(function(result) {
          // Update count
          var countEl = document.getElementById('admin-inv-count');
          if (countEl) {
            countEl.innerHTML = '📊 Found: <strong>' + (result.investments ? result.investments.length : 0) + ' investments</strong>';
          }
          
          if (!result.investments || result.investments.length === 0) {
            listContainer.innerHTML = '<div class="empty-state"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; margin-right: 8px; vertical-align: middle;"><path d="M20 6L9 17l-5-5"/></svg> No investments found</div>';
            return;
          }
          
          listContainer.innerHTML = '<div class="admin-list">' + result.investments.map(function(inv) {
            var investorName = inv.user ? (inv.user.name || inv.user.email) : 'Unknown User';
            var investorEmail = inv.user ? inv.user.email : '';
            var statusClass = inv.status === 'active' ? 'badge-success' : 
                              inv.status === 'completed' ? 'badge-info' :
                              inv.status === 'withdrawn' ? 'badge-warning' :
                              inv.status === 'orphaned' ? 'badge-error' : '';
            var canWithdraw = inv.status === 'active' && inv.user;
            
            return '<div class="admin-list-item" data-investment-id="' + (inv._id || inv.id) + '">' +
              '<div class="item-main" style="flex: 1;">' +
                '<h4>GH₵' + (inv.amount || 0).toLocaleString() + ' • ' + (inv.projectName || 'Project') + '</h4>' +
                '<p>' + investorName + (investorEmail ? ' (' + investorEmail + ')' : '') + '</p>' +
                '<div class="badges">' +
                  '<span class="badge ' + statusClass + '">' + (inv.status || 'unknown') + '</span>' +
                  '<span class="date">' + new Date(inv.createdAt).toLocaleDateString() + '</span>' +
                '</div>' +
              '</div>' +
              '<div class="item-actions">' +
                (canWithdraw ? '<button class="btn-small btn-warning withdraw-investment-btn" data-id="' + (inv._id || inv.id) + '" data-amount="' + inv.amount + '" data-project="' + (inv.projectName || 'Project') + '" data-user="' + investorName + '">End Investment</button>' : '') +
              '</div>' +
            '</div>';
          }).join('') + '</div>';
          
          // Add withdraw button handlers
          document.querySelectorAll('.withdraw-investment-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
              e.stopPropagation();
              var id = this.getAttribute('data-id');
              var amount = this.getAttribute('data-amount');
              var project = this.getAttribute('data-project');
              var user = this.getAttribute('data-user');
              showWithdrawInvestmentModal(adminApi, id, amount, project, user, loadInvestments);
            });
          });
        })
        .catch(function(err) {
          listContainer.innerHTML = '<div class="alert-error">Error loading investments: ' + err.message + '</div>';
        });
    }
    
    // Initial load
    loadInvestments();
    
    // Filter change handler
    document.getElementById('admin-inv-status-filter').addEventListener('change', loadInvestments);
    
    // Cleanup orphaned button
    document.getElementById('cleanup-orphaned-btn').addEventListener('click', function() {
      if (!confirm('This will mark investments with deleted users as "orphaned" and recalculate project stats. Continue?')) return;
      
      this.disabled = true;
      this.textContent = 'Cleaning up...';
      
      adminApi.cleanupOrphanedInvestments()
        .then(function(result) {
          alert('Cleanup complete!\n\nOrphaned: ' + result.count + ' investments\nAffected Projects: ' + result.affectedProjects);
          loadInvestments();
        })
        .catch(function(err) {
          alert('Error: ' + err.message);
        })
        .finally(function() {
          var btn = document.getElementById('cleanup-orphaned-btn');
          if (btn) {
            btn.disabled = false;
            btn.textContent = '🧹 Cleanup Orphaned';
          }
        });
    });
  }
  
  // ========== ALL USERS ==========
  else if (tab === 'all-users') {
    // Show search and filter UI first
    tabContent.innerHTML = 
      '<div class="admin-users-header" style="margin-bottom: 1.5rem;">' +
        '<div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; margin-bottom: 1rem;">' +
          '<div style="flex: 1; min-width: 250px; position: relative;">' +
            '<input type="text" id="admin-user-search" placeholder="Search by name, email, or phone..." ' +
              'style="width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border: 2px solid var(--border-color); border-radius: 10px; background: var(--card-bg); color: var(--text-color);">' +
            '<svg style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>' +
            '</svg>' +
          '</div>' +
          '<select id="admin-role-filter" style="padding: 0.75rem 1rem; border: 2px solid var(--border-color); border-radius: 10px; background: var(--card-bg); color: var(--text-color);">' +
            '<option value="">All Roles</option>' +
            '<option value="investor">Investors</option>' +
            '<option value="business_owner">Business Owners</option>' +
          '</select>' +
          '<select id="admin-user-sort" style="padding: 0.75rem 1rem; border: 2px solid var(--border-color); border-radius: 10px; background: var(--card-bg); color: var(--text-color);">' +
            '<option value="name">Sort by Name (A-Z)</option>' +
            '<option value="newest">Newest First</option>' +
            '<option value="oldest">Oldest First</option>' +
          '</select>' +
        '</div>' +
        '<div id="admin-user-count" style="color: var(--text-muted); font-size: 0.9rem; font-weight: 600;">Loading...</div>' +
      '</div>' +
      '<div id="admin-users-table">Loading users...</div>';
    
    // Load users function
    function loadAdminUsers() {
      var search = document.getElementById('admin-user-search').value.trim();
      var role = document.getElementById('admin-role-filter').value;
      var sortBy = document.getElementById('admin-user-sort').value;
      var tableContainer = document.getElementById('admin-users-table');
      
      tableContainer.innerHTML = '<div style="text-align: center; padding: 2rem;">Loading users...</div>';
      
      adminApi.getUsers({ search: search, role: role, sortBy: sortBy })
        .then(function(result) {
          var nonAdminUsers = result.users.filter(function(user) {
            return user.role !== 'admin';
          });
          
          // Update count
          var countEl = document.getElementById('admin-user-count');
          if (countEl) {
            countEl.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle; margin-right: 6px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Total: <strong>' + result.pagination.total + ' users</strong>' + (nonAdminUsers.length !== result.pagination.total ? ' (' + nonAdminUsers.length + ' shown)' : '');
          }
          
          if (nonAdminUsers.length === 0) {
            tableContainer.innerHTML = '<div class="empty-state">No users found matching your criteria.</div>';
            return;
          }
          
          tableContainer.innerHTML = 
            '<div class="admin-table-wrapper">' +
              '<table class="admin-table">' +
                '<thead>' +
                  '<tr>' +
                    '<th>Name</th>' +
                    '<th>Email</th>' +
                    '<th>Role</th>' +
                    '<th>KYC</th>' +
                    '<th>Status</th>' +
                  '</tr>' +
                '</thead>' +
                '<tbody>' +
                  nonAdminUsers.map(function(user) {
                    var kycStatus = user.kyc ? user.kyc.status : 'pending';
                    var kycClass = kycStatus === 'verified' ? 'badge-success' : kycStatus === 'submitted' ? 'badge-warning' : '';
                    return '<tr>' +
                      '<td><strong>' + user.name + '</strong></td>' +
                      '<td>' + user.email + '</td>' +
                      '<td><span class="badge ' + (user.role === 'business_owner' ? 'badge-purple' : '') + '">' + user.role.replace('_', ' ') + '</span></td>' +
                      '<td><span class="badge ' + kycClass + '">' + kycStatus + '</span></td>' +
                      '<td>' + (user.isActive !== false ? '<span class="status-active"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; margin-right: 4px; vertical-align: middle;"><path d="M20 6L9 17l-5-5"/></svg> Active</span>' : '<span class="status-suspended"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; margin-right: 4px; vertical-align: middle;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Suspended</span>') + '</td>' +
                    '</tr>';
                  }).join('') +
                '</tbody>' +
              '</table>' +
            '</div>';
        })
        .catch(function(err) {
          tableContainer.innerHTML = '<div class="error-state"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; margin-right: 8px; vertical-align: middle;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Error loading users: ' + err.message + '</div>';
        });
    }
    
    // Initial load
    loadAdminUsers();
    
    // Event listeners
    var searchTimeout;
    document.getElementById('admin-user-search').addEventListener('input', function() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(loadAdminUsers, 300);
    });
    document.getElementById('admin-role-filter').addEventListener('change', loadAdminUsers);
    document.getElementById('admin-user-sort').addEventListener('change', loadAdminUsers);
  }
  
  // ========== CREATE PROJECT ==========
  else if (tab === 'create-project') {
    tabContent.innerHTML = 
      '<div class="create-project-form">' +
        '<form id="create-project-form">' +
          // Image Upload Section
          '<div class="form-section">' +
            '<h3>Project Image</h3>' +
            '<div class="image-upload-area" id="image-upload-area">' +
              '<div id="image-preview" class="image-preview">' +
                '<span class="upload-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></span>' +
                '<p>Click to upload or drag & drop</p>' +
                '<span class="upload-hint">PNG, JPG up to 5MB</span>' +
              '</div>' +
              '<input type="file" id="image-input" accept="image/*" style="display: none;">' +
              '<input type="hidden" name="imageUrl" id="image-url-input">' +
            '</div>' +
          '</div>' +
          
          // Basic Info Section
          '<div class="form-section">' +
            '<h3>Basic Information</h3>' +
            '<div class="form-row">' +
              '<div class="form-group full">' +
                '<label>Project Name <span class="required">*</span></label>' +
                '<input type="text" name="name" required class="input" placeholder="e.g. Pure Water Selling Business">' +
              '</div>' +
            '</div>' +
            '<div class="form-row">' +
              '<div class="form-group">' +
                '<label>Category <span class="required">*</span></label>' +
                '<select name="category" required class="input">' +
                  '<option value="">Select Category</option>' +
                  '<option value="Technology">Technology</option>' +
                  '<option value="Real Estate">Real Estate</option>' +
                  '<option value="Agriculture">Agriculture</option>' +
                  '<option value="Healthcare">Healthcare</option>' +
                  '<option value="Renewable Energy">Renewable Energy</option>' +
                  '<option value="Retail">Retail</option>' +
                  '<option value="Manufacturing">Manufacturing</option>' +
                  '<option value="Financial Services">Financial Services</option>' +
                  '<option value="Food & Beverage">Food & Beverage</option>' +
                  '<option value="Telecommunications">Telecommunications</option>' +
                  '<option value="Other">Other</option>' +
                '</select>' +
              '</div>' +
              '<div class="form-group">' +
                '<label>Risk Level</label>' +
                '<select name="riskLevel" class="input">' +
                  '<option value="low">Low Risk</option>' +
                  '<option value="medium" selected>Medium Risk</option>' +
                  '<option value="high">High Risk</option>' +
                '</select>' +
              '</div>' +
            '</div>' +
            '<div class="form-group full">' +
              '<label>Description <span class="required">*</span></label>' +
              '<textarea name="description" required class="input" rows="4" placeholder="Detailed description of the project, business plan, and how funds will be used..."></textarea>' +
            '</div>' +
            '<div class="form-group full">' +
              '<label>Tags <span style="color: var(--text-muted); font-weight: 400;">(comma-separated)</span></label>' +
              '<input type="text" name="tags" class="input" placeholder="e.g. women-owned, agriculture, export">' +
            '</div>' +
          '</div>' +
          
          // Financial Info Section
          '<div class="form-section">' +
            '<h3>Financial Details</h3>' +
            '<div class="form-row">' +
              '<div class="form-group">' +
                '<label>Funding Goal (GH₵) <span class="required">*</span></label>' +
                '<input type="number" name="goalAmount" required min="100" class="input" placeholder="1000">' +
              '</div>' +
              '<div class="form-group">' +
                '<label>Min Investment (GH₵)</label>' +
                '<input type="number" name="minInvestment" value="100" min="10" class="input">' +
              '</div>' +
            '</div>' +
            '<div class="form-row">' +
              '<div class="form-group">' +
                '<label>Target Return</label>' +
                '<input type="text" name="targetReturn" value="10-15%" class="input" placeholder="e.g. 10-15%">' +
              '</div>' +
              '<div class="form-group">' +
                '<label>Duration</label>' +
                '<input type="text" name="duration" value="30 days" class="input" placeholder="e.g. 30 days">' +
              '</div>' +
            '</div>' +
            '<div class="form-row">' +
              '<div class="form-group">' +
                '<label>Priority</label>' +
                '<input type="number" name="priority" value="0" class="input" placeholder="Higher shows first">' +
              '</div>' +
              '<div class="form-group">' +
                '<label>Status</label>' +
                '<select name="status" class="input">' +
                  '<option value="active" selected>Active (visible to users)</option>' +
                  '<option value="inactive">Inactive (hidden from users)</option>' +
                '</select>' +
              '</div>' +
            '</div>' +
            '<div class="form-row">' +
              '<div class="form-group">' +
                '<label>Project Progress</label>' +
                '<select name="progressStatus" class="input">' +
                  '<option value="not_started" selected>⏳ Not Started</option>' +
                  '<option value="ongoing">🚀 Ongoing (In Progress)</option>' +
                  '<option value="completed">✅ Completed</option>' +
                '</select>' +
              '</div>' +
            '</div>' +
          '</div>' +
          
          // Options Section
          '<div class="form-section">' +
            '<div class="checkbox-group">' +
              '<label class="checkbox-label">' +
                '<input type="checkbox" name="featured">' +
                '<span class="checkmark"></span>' +
                '<span><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" style="display: inline; margin-right: 4px; vertical-align: middle;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Featured Project (show prominently on homepage)</span>' +
              '</label>' +
            '</div>' +
          '</div>' +
          
          '<button type="submit" class="btn btn-primary btn-lg btn-full">Create & Publish Project</button>' +
        '</form>' +
      '</div>';
    
    // Setup image upload handlers
    setupImageUpload(api);
    
    // Form submission
    document.getElementById('create-project-form').addEventListener('submit', function(e) {
      e.preventDefault();
      var form = e.target;
      var submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating...';
      
      var data = {
        name: form.name.value,
        category: form.category.value,
        description: form.description.value,
        goalAmount: parseFloat(form.goalAmount.value),
        minInvestment: parseFloat(form.minInvestment.value) || 100,
        targetReturn: form.targetReturn.value || '10-15%',
        duration: form.duration.value || '30 days',
        riskLevel: form.riskLevel.value,
        imageUrl: document.getElementById('image-url-input').value || '',
        featured: form.featured.checked,
        priority: parseInt(form.priority.value, 10) || 0,
        status: form.status.value,
        progressStatus: form.progressStatus.value || 'not_started',
        tags: parseTags(form.tags.value)
      };
      
      adminApi.createProject(data)
        .then(function(result) {
          alert('Project created and published successfully!');
          loadAdminTab(adminApi, api, 'all-projects');
          loadAdminAlerts(adminApi);
        })
        .catch(function(err) {
          alert('Error: ' + err.message);
          submitBtn.disabled = false;
          submitBtn.textContent = 'Create & Publish Project';
        });
    });
  }
  
  // ========== ALL PROJECTS ==========
  else if (tab === 'all-projects') {
    // First show search/filter UI
    tabContent.innerHTML = 
      '<div class="admin-projects-header" style="margin-bottom: 1.5rem;">' +
        '<div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; margin-bottom: 1rem;">' +
          '<div style="flex: 1; min-width: 250px; position: relative;">' +
            '<input type="text" id="admin-project-search" placeholder="Search projects..." ' +
              'style="width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border: 2px solid var(--border-color); border-radius: 10px; background: var(--card-bg); color: var(--text-color);">' +
            '<svg style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>' +
            '</svg>' +
          '</div>' +
          '<select id="admin-status-filter" style="padding: 0.75rem 1rem; border: 2px solid var(--border-color); border-radius: 10px; background: var(--card-bg); color: var(--text-color);">' +
            '<option value="">All Status</option>' +
            '<option value="active">Active</option>' +
            '<option value="pending_review">Pending Review</option>' +
            '<option value="inactive">Inactive</option>' +
            '<option value="completed">Completed</option>' +
            '<option value="rejected">Rejected</option>' +
          '</select>' +
          '<select id="admin-category-filter" style="padding: 0.75rem 1rem; border: 2px solid var(--border-color); border-radius: 10px; background: var(--card-bg); color: var(--text-color);">' +
            '<option value="">All Categories</option>' +
          '</select>' +
        '</div>' +
        '<div id="admin-project-count" style="color: var(--text-muted); font-size: 0.9rem;">Loading...</div>' +
      '</div>' +
      '<div id="admin-projects-grid" class="projects-grid">Loading projects...</div>';
    
    // Load projects function
    function loadAdminProjects() {
      var search = document.getElementById('admin-project-search').value.trim();
      var status = document.getElementById('admin-status-filter').value;
      var category = document.getElementById('admin-category-filter').value;
      var grid = document.getElementById('admin-projects-grid');
      
      grid.innerHTML = '<div style="text-align: center; padding: 2rem;">Loading projects...</div>';
      
      adminApi.getProjects({ search: search, status: status, category: category })
        .then(function(result) {
          // Update count
          var countEl = document.getElementById('admin-project-count');
          if (countEl) {
            countEl.textContent = result.pagination.total + ' project' + (result.pagination.total !== 1 ? 's' : '') + ' found';
          }
          
          // Populate categories dropdown (once)
          if (result.categories && result.categories.length > 0) {
            var catSelect = document.getElementById('admin-category-filter');
            var currentVal = catSelect.value;
            if (catSelect.options.length <= 1) {
              result.categories.forEach(function(cat) {
                var opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat.split('-').map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
                catSelect.appendChild(opt);
              });
            }
            catSelect.value = currentVal;
          }
          
          if (result.projects.length === 0) {
            grid.innerHTML = '<div class="empty-state">No projects found matching your criteria.</div>';
            return;
          }

          // Keep a lookup map for edit actions
          window.__adminProjectsById = {};
          result.projects.forEach(function(p) {
            window.__adminProjectsById[p.id] = p;
          });
          
          grid.innerHTML = result.projects.map(function(project) {
            var statusColors = {
              'pending_review': 'badge-warning',
              'active': 'badge-success',
              'inactive': 'badge-outline',
              'funded': 'badge-primary',
              'completed': 'badge-success',
              'rejected': 'badge-danger',
              'changes_requested': 'badge-purple',
              'removed': 'badge-danger'
            };
            var statusClass = statusColors[project.status] || '';
            var progress = project.goalAmount > 0 ? Math.min(100, ((project.currentFunding || 0) / project.goalAmount) * 100) : 0;
            
            // Progress status display
            var progressStatus = project.progressStatus || 'not_started';
            var progressStatusInfo = {
              'not_started': { label: 'NOT STARTED', class: 'badge-outline', color: '#64748b', icon: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>' },
              'ongoing': { label: 'ONGOING', class: 'badge-primary', color: '#6366f1', icon: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>' },
              'completed': { label: 'COMPLETED', class: 'badge-success', color: '#10b981', icon: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>' }
            };
            var progressInfo = progressStatusInfo[progressStatus] || progressStatusInfo['not_started'];
            
            // Use imageUrl or fallback
            var imageUrl = project.imageUrl || project.image_url || project.dataUrl || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400';
            
            return '<div class="project-card-admin">' +
              '<div class="project-image" style="background-image: url(\'' + imageUrl + '\');">' +
                (project.featured ? '<span class="featured-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Featured</span>' : '') +
                '<span class="progress-status-badge" style="position: absolute; bottom: 8px; left: 8px; background: ' + progressInfo.color + '; color: white; padding: 5px 12px; border-radius: 6px; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.5px; display: flex; align-items: center; gap: 5px;">' + progressInfo.icon + ' ' + progressInfo.label + '</span>' +
              '</div>' +
              '<div class="project-content">' +
                '<div class="project-header">' +
                  '<h4>' + project.name + '</h4>' +
                  '<span class="badge ' + statusClass + '">' + (project.status || 'active').replace('_', ' ') + '</span>' +
                '</div>' +
                '<p class="project-desc">' + (project.description || '').substring(0, 80) + '...</p>' +
                '<div class="project-meta">' +
                  '<span class="badge">' + (project.category || 'Other') + '</span>' +
                  '<span class="badge badge-outline">' + (project.riskLevel || 'medium') + ' risk</span>' +
                  '<span class="badge badge-outline">Priority: ' + (project.priority || 0) + '</span>' +
                '</div>' +
                '<div class="project-funding">' +
                  '<div class="funding-info">' +
                    '<span>GH₵' + (project.currentFunding || 0).toLocaleString() + '</span>' +
                    '<span>of GH₵' + (project.goalAmount || 0).toLocaleString() + '</span>' +
                  '</div>' +
                  '<div class="progress-bar"><div class="progress-fill" style="width: ' + progress + '%;"></div></div>' +
                  '<div class="funding-stats">' +
                    '<span>' + (project.investorCount || 0) + ' investors</span>' +
                    '<span>' + (project.targetReturn || '10-15%') + ' return</span>' +
                  '</div>' +
                '</div>' +
                '<div class="project-actions">' +
                  '<button class="btn btn-sm btn-outline edit-project-btn" data-id="' + project.id + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit</button>' +
                  '<button class="btn btn-sm btn-outline toggle-status-btn" data-id="' + project.id + '" data-status="' + (project.status || 'active') + '">' +
                    ((project.status || 'active') === 'active' ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> Pause' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Activate') +
                  '</button>' +
                  '<button class="btn btn-sm btn-outline toggle-progress-btn" data-id="' + project.id + '" data-progress="' + progressStatus + '" title="Toggle project progress">' +
                    (progressStatus === 'not_started' ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> Start' : progressStatus === 'ongoing' ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Complete' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg> Restart') +
                  '</button>' +
                  '<button class="btn btn-sm btn-danger remove-project-btn" data-id="' + project.id + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Remove</button>' +
                  (project.status === 'active' ? 
                    '<button class="btn btn-sm btn-outline distribute-btn" data-id="' + project.id + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Distribute</button>' : '') +
                  (project.status === 'active' ? 
                    '<button class="btn btn-sm btn-success complete-project-btn" data-id="' + project.id + '" data-name="' + encodeURIComponent(project.name) + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> End</button>' +
                    '<button class="btn btn-sm btn-warning cancel-project-btn" data-id="' + project.id + '" data-name="' + encodeURIComponent(project.name) + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Cancel</button>' : '') +
                  '<button class="btn btn-sm btn-outline post-update-btn" data-id="' + project.id + '" data-name="' + project.name + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Update</button>' +
                  '<button class="btn btn-sm ' + (project.featured ? 'btn-warning' : 'btn-outline') + ' toggle-featured-btn" data-id="' + project.id + '" data-featured="' + project.featured + '">' + 
                    (project.featured ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Unfeature' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Feature') + 
                  '</button>' +
                '</div>' +
              '</div>' +
            '</div>';
          }).join('');
        
        attachProjectListHandlers(adminApi, api);
      })
      .catch(function(err) {
        var grid = document.getElementById('admin-projects-grid');
        if (grid) grid.innerHTML = '<div class="error-state">⚠️ Error loading projects: ' + err.message + '</div>';
      });
    }
    
    // Initial load
    loadAdminProjects();
    
    // Attach event listeners for search/filter
    var searchTimeout;
    document.getElementById('admin-project-search').addEventListener('input', function() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(loadAdminProjects, 300);
    });
    document.getElementById('admin-status-filter').addEventListener('change', loadAdminProjects);
    document.getElementById('admin-category-filter').addEventListener('change', loadAdminProjects);
  }
}

function parseTags(tagsText) {
  if (!tagsText) return [];
  return tagsText
    .split(',')
    .map(function(t) { return t.trim(); })
    .filter(Boolean);
}

function openEditProjectModal(project, adminApi, api) {
  var modal = document.createElement('div');
  modal.className = 'modal active';

  var tagsText = Array.isArray(project.tags) ? project.tags.join(', ') : '';
  var imageUrl = project.imageUrl || project.image_url || project.dataUrl || '';
  var status = project.status || 'active';
  var priority = project.priority || 0;
  var progressStatus = project.progressStatus || 'not_started';

  modal.innerHTML =
    '<div class="modal-content modal-lg">' +
      '<h2>Edit Project</h2>' +
      '<form id="edit-project-form">' +
        '<div class="form-section">' +
          '<h3>Image</h3>' +
          '<div class="image-upload-area" id="edit-image-upload-area">' +
            '<div id="edit-image-preview" class="image-preview' + (imageUrl ? ' has-image' : '') + '">' +
              (imageUrl ? ('<img src="' + imageUrl + '" alt="Preview">') : ('<span class="upload-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></span><p>Click to upload or drag & drop</p><span class="upload-hint">PNG, JPG up to 5MB</span>')) +
            '</div>' +
            '<input type="file" id="edit-image-input" accept="image/*" style="display: none;">' +
            '<input type="hidden" id="edit-image-url-input" value="' + imageUrl + '">' +
          '</div>' +
        '</div>' +

        '<div class="form-section">' +
          '<h3>Details</h3>' +
          '<div class="form-row">' +
            '<div class="form-group full">' +
              '<label>Name <span class="required">*</span></label>' +
              '<input type="text" name="name" required class="input" value="' + (project.name || '') + '">' +
            '</div>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="form-group">' +
              '<label>Category <span class="required">*</span></label>' +
              '<input type="text" name="category" required class="input" value="' + (project.category || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
              '<label>Risk Level</label>' +
              '<select name="riskLevel" class="input">' +
                '<option value="low"' + ((project.riskLevel || 'medium') === 'low' ? ' selected' : '') + '>Low</option>' +
                '<option value="medium"' + ((project.riskLevel || 'medium') === 'medium' ? ' selected' : '') + '>Medium</option>' +
                '<option value="high"' + ((project.riskLevel || 'medium') === 'high' ? ' selected' : '') + '>High</option>' +
              '</select>' +
            '</div>' +
          '</div>' +
          '<div class="form-group full">' +
            '<label>Description</label>' +
            '<textarea name="description" class="input" rows="4">' + (project.description || '') + '</textarea>' +
          '</div>' +
          '<div class="form-group full">' +
            '<label>Tags <span style="color: var(--text-muted); font-weight: 400;">(comma-separated)</span></label>' +
            '<input type="text" name="tags" class="input" value="' + tagsText + '">' +
          '</div>' +
        '</div>' +

        '<div class="form-section">' +
          '<h3>Funding & Visibility</h3>' +
          '<div class="form-row">' +
            '<div class="form-group">' +
              '<label>Goal Amount (GH₵)</label>' +
              '<input type="number" name="goalAmount" class="input" value="' + (project.goalAmount || 0) + '">' +
            '</div>' +
            '<div class="form-group">' +
              '<label>Min Investment (GH₵)</label>' +
              '<input type="number" name="minInvestment" class="input" value="' + (project.minInvestment || 100) + '">' +
            '</div>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="form-group">' +
              '<label>Target Return</label>' +
              '<input type="text" name="targetReturn" class="input" value="' + (project.targetReturn || '10-15%') + '">' +
            '</div>' +
            '<div class="form-group">' +
              '<label>Duration</label>' +
              '<input type="text" name="duration" class="input" value="' + (project.duration || '') + '">' +
            '</div>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="form-group">' +
              '<label>Priority</label>' +
              '<input type="number" name="priority" class="input" value="' + priority + '">' +
            '</div>' +
            '<div class="form-group">' +
              '<label>Status</label>' +
              '<select name="status" class="input">' +
                '<option value="active"' + (status === 'active' ? ' selected' : '') + '>Active</option>' +
                '<option value="inactive"' + (status === 'inactive' ? ' selected' : '') + '>Inactive</option>' +
                '<option value="pending_review"' + (status === 'pending_review' ? ' selected' : '') + '>Pending review</option>' +
                '<option value="changes_requested"' + (status === 'changes_requested' ? ' selected' : '') + '>Changes requested</option>' +
                '<option value="funded"' + (status === 'funded' ? ' selected' : '') + '>Funded</option>' +
                '<option value="completed"' + (status === 'completed' ? ' selected' : '') + '>Completed</option>' +
                '<option value="rejected"' + (status === 'rejected' ? ' selected' : '') + '>Rejected</option>' +
              '</select>' +
            '</div>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="form-group">' +
              '<label>Project Progress</label>' +
              '<select name="progressStatus" class="input">' +
                '<option value="not_started"' + (progressStatus === 'not_started' ? ' selected' : '') + '>Not Started</option>' +
                '<option value="ongoing"' + (progressStatus === 'ongoing' ? ' selected' : '') + '>Ongoing (In Progress)</option>' +
                '<option value="completed"' + (progressStatus === 'completed' ? ' selected' : '') + '>Completed</option>' +
              '</select>' +
            '</div>' +
          '</div>' +
          '<div class="checkbox-group">' +
            '<label class="checkbox-label">' +
              '<input type="checkbox" name="featured"' + (project.featured ? ' checked' : '') + '>' +
              '<span><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" style="display: inline; margin-right: 4px; vertical-align: middle;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Featured</span>' +
            '</label>' +
          '</div>' +
        '</div>' +

        '<div class="form-actions">' +
          '<button type="button" class="btn btn-outline" id="cancel-edit-project">Cancel</button>' +
          '<button type="submit" class="btn btn-primary" id="save-edit-project">Save Changes</button>' +
        '</div>' +
      '</form>' +
    '</div>';

  document.body.appendChild(modal);

  var uploadArea = modal.querySelector('#edit-image-upload-area');
  var imageInput = modal.querySelector('#edit-image-input');
  var imagePreview = modal.querySelector('#edit-image-preview');
  var imageUrlInput = modal.querySelector('#edit-image-url-input');

  uploadArea.addEventListener('click', function() { imageInput.click(); });
  uploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  uploadArea.addEventListener('dragleave', function() { uploadArea.classList.remove('dragover'); });
  uploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    var file = e.dataTransfer.files[0];
    if (file && file.type && file.type.startsWith('image/')) {
      handleImageFile(file, api, imagePreview, imageUrlInput);
    }
  });
  imageInput.addEventListener('change', function() {
    var file = this.files[0];
    if (file) {
      handleImageFile(file, api, imagePreview, imageUrlInput);
    }
  });

  modal.addEventListener('click', function(e) {
    if (e.target === modal) modal.remove();
  });
  modal.querySelector('#cancel-edit-project').addEventListener('click', function() {
    modal.remove();
  });

  modal.querySelector('#edit-project-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var form = e.target;
    var saveBtn = modal.querySelector('#save-edit-project');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    var update = {
      name: form.name.value,
      category: form.category.value,
      description: form.description.value,
      goalAmount: parseFloat(form.goalAmount.value) || 0,
      minInvestment: parseFloat(form.minInvestment.value) || 100,
      targetReturn: form.targetReturn.value,
      duration: form.duration.value,
      riskLevel: form.riskLevel.value,
      imageUrl: imageUrlInput.value || '',
      featured: form.featured.checked,
      priority: parseInt(form.priority.value, 10) || 0,
      status: form.status.value,
      progressStatus: form.progressStatus.value || 'not_started',
      tags: parseTags(form.tags.value)
    };

    adminApi.updateProject(project.id, update)
      .then(function() {
        modal.remove();
        loadAdminTab(adminApi, api, 'all-projects');
        loadAdminAlerts(adminApi);
      })
      .catch(function(err) {
        alert('❌ Error: ' + err.message);
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
      });
  });
}

// ========== IMAGE UPLOAD HANDLER ==========
function setupImageUpload(api) {
  var uploadArea = document.getElementById('image-upload-area');
  var imageInput = document.getElementById('image-input');
  var imagePreview = document.getElementById('image-preview');
  var imageUrlInput = document.getElementById('image-url-input');
  
  uploadArea.addEventListener('click', function() {
    imageInput.click();
  });
  
  uploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  
  uploadArea.addEventListener('dragleave', function() {
    uploadArea.classList.remove('dragover');
  });
  
  uploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    var file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFile(file, api, imagePreview, imageUrlInput);
    }
  });
  
  imageInput.addEventListener('change', function() {
    var file = this.files[0];
    if (file) {
      handleImageFile(file, api, imagePreview, imageUrlInput);
    }
  });
}

function handleImageFile(file, api, imagePreview, imageUrlInput) {
  if (file.size > 5 * 1024 * 1024) {
    alert('Image too large. Max 5MB.');
    return;
  }
  
  var reader = new FileReader();
  reader.onload = function(e) {
    var base64 = e.target.result;
    
    // Show preview immediately
    imagePreview.innerHTML = '<img src="' + base64 + '" alt="Preview">';
    imagePreview.classList.add('has-image');
    
    // Upload to server
    api.uploadImage(base64, file.name)
      .then(function(result) {
        // Use dataUrl for display (works on Render)
        imageUrlInput.value = result.dataUrl || result.url;
      })
      .catch(function(err) {
        // Still use the base64 as fallback
        imageUrlInput.value = base64;
        console.warn('Upload failed, using base64:', err);
      });
  };
  reader.readAsDataURL(file);
}

// ========== EVENT HANDLERS ==========
function attachKYCHandlers(adminApi, api) {
  document.querySelectorAll('.approve-kyc-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = this.getAttribute('data-id');
      if (confirm('Approve KYC for this user?')) {
        var button = this;
        button.disabled = true;
        button.textContent = '...';
        adminApi.verifyKyc(id, 'approve')
          .then(function() {
            alert('KYC approved!');
            loadAdminTab(adminApi, api, 'pending-kyc');
            loadAdminAlerts(adminApi);
          })
          .catch(function(err) {
            alert('Error: ' + err.message);
            button.disabled = false;
            button.textContent = 'Approve';
          });
      }
    });
  });
  
  document.querySelectorAll('.reject-kyc-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = this.getAttribute('data-id');
      var reason = prompt('Rejection reason:');
      if (reason) {
        var button = this;
        button.disabled = true;
        adminApi.verifyKyc(id, 'reject', reason)
          .then(function() {
            alert('KYC rejected');
            loadAdminTab(adminApi, api, 'pending-kyc');
            loadAdminAlerts(adminApi);
          })
          .catch(function(err) {
            alert('Error: ' + err.message);
            button.disabled = false;
          });
      }
    });
  });
}

function attachProjectReviewHandlers(adminApi, api) {
  document.querySelectorAll('.approve-project-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = this.getAttribute('data-id');
      if (confirm('Approve this project?')) {
        var button = this;
        button.disabled = true;
        adminApi.reviewProject(id, 'approve', 'Approved')
          .then(function() {
            alert('✅ Project approved!');
            loadAdminTab(adminApi, api, 'pending-projects');
            loadAdminAlerts(adminApi);
          })
          .catch(function(err) {
            alert('❌ Error: ' + err.message);
            button.disabled = false;
          });
      }
    });
  });
  
  document.querySelectorAll('.request-changes-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = this.getAttribute('data-id');
      var feedback = prompt('What changes are required?');
      if (feedback) {
        adminApi.reviewProject(id, 'request_changes', feedback)
          .then(function() {
            alert('✅ Changes requested');
            loadAdminTab(adminApi, api, 'pending-projects');
          })
          .catch(function(err) { alert('❌ Error: ' + err.message); });
      }
    });
  });
}

function attachWithdrawalHandlers(adminApi, api) {
  document.querySelectorAll('.approve-withdrawal-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = this.getAttribute('data-id');
      var txRef = prompt('Enter transaction reference:');
      if (txRef) {
        var button = this;
        button.disabled = true;
        adminApi.processWithdrawal(id, 'approve', null, txRef)
          .then(function() {
            alert('✅ Withdrawal approved!');
            loadAdminTab(adminApi, api, 'pending-withdrawals');
            loadAdminAlerts(adminApi);
          })
          .catch(function(err) {
            alert('❌ Error: ' + err.message);
            button.disabled = false;
          });
      }
    });
  });
  
  document.querySelectorAll('.reject-withdrawal-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = this.getAttribute('data-id');
      var reason = prompt('Rejection reason:');
      if (reason) {
        adminApi.processWithdrawal(id, 'reject', reason)
          .then(function() {
            alert('✅ Withdrawal rejected');
            loadAdminTab(adminApi, api, 'pending-withdrawals');
            loadAdminAlerts(adminApi);
          })
          .catch(function(err) { alert('❌ Error: ' + err.message); });
      }
    });
  });
}

function attachProjectListHandlers(adminApi, api) {
  document.querySelectorAll('.distribute-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = this.getAttribute('data-id');
      var amount = prompt('Enter profit amount to distribute (GH₵):');
      if (amount && parseFloat(amount) > 0) {
        var description = prompt('Description:') || 'Profit distribution';
        adminApi.distributeProfits(id, parseFloat(amount), description)
          .then(function(result) {
            alert('✅ Distributed GH₵' + amount + ' to ' + result.distributions.length + ' investors!');
          })
          .catch(function(err) { alert('❌ Error: ' + err.message); });
      }
    });
  });
  
  document.querySelectorAll('.toggle-featured-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = this.getAttribute('data-id');
      var isFeatured = this.getAttribute('data-featured') === 'true';
      adminApi.updateProject(id, { featured: !isFeatured })
        .then(function() {
          loadAdminTab(adminApi, api, 'all-projects');
        });
    });
  });

  document.querySelectorAll('.edit-project-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = this.getAttribute('data-id');
      var project = (window.__adminProjectsById && window.__adminProjectsById[id]) || null;
      if (!project) {
        alert('Project data not found. Please refresh.');
        return;
      }
      openEditProjectModal(project, adminApi, api);
    });
  });

  document.querySelectorAll('.toggle-status-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = this.getAttribute('data-id');
      var status = this.getAttribute('data-status') || 'active';
      var nextStatus = status === 'active' ? 'inactive' : 'active';
      var confirmMsg = nextStatus === 'inactive'
        ? 'Inactivate this project? It will be hidden from users and investments will be blocked.'
        : 'Activate this project? It will be visible to users and open for investments.';
      if (!confirm(confirmMsg)) return;

      adminApi.updateProject(id, { status: nextStatus })
        .then(function() {
          loadAdminTab(adminApi, api, 'all-projects');
          loadAdminAlerts(adminApi);
        })
        .catch(function(err) {
          alert('❌ Error: ' + err.message);
        });
    });
  });

  // Progress Status Toggle (Not Started -> Ongoing -> Completed -> Not Started)
  document.querySelectorAll('.toggle-progress-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = this.getAttribute('data-id');
      var currentProgress = this.getAttribute('data-progress') || 'not_started';
      
      // Cycle through: not_started -> ongoing -> completed -> not_started
      var progressCycle = {
        'not_started': 'ongoing',
        'ongoing': 'completed',
        'completed': 'not_started'
      };
      var nextProgress = progressCycle[currentProgress] || 'not_started';
      
      var progressLabels = {
        'not_started': '⏳ Not Started',
        'ongoing': '🚀 Ongoing',
        'completed': '✅ Completed'
      };
      
      if (!confirm('Change project progress to "' + progressLabels[nextProgress] + '"?')) return;

      adminApi.updateProject(id, { progressStatus: nextProgress })
        .then(function() {
          loadAdminTab(adminApi, api, 'all-projects');
        })
        .catch(function(err) {
          alert('❌ Error: ' + err.message);
        });
    });
  });

  document.querySelectorAll('.remove-project-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = this.getAttribute('data-id');
      if (!confirm('Remove this project? This is a soft remove (status set to removed).')) return;
      adminApi.removeProject(id)
        .then(function() {
          loadAdminTab(adminApi, api, 'all-projects');
          loadAdminAlerts(adminApi);
        })
        .catch(function(err) {
          alert('❌ Error: ' + err.message);
        });
    });
  });
  
  // Complete Project handlers
  document.querySelectorAll('.complete-project-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = this.getAttribute('data-id');
      var name = decodeURIComponent(this.getAttribute('data-name'));
      showCompleteProjectModal(id, name, adminApi, api);
    });
  });
  
  // Cancel Project handlers
  document.querySelectorAll('.cancel-project-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = this.getAttribute('data-id');
      var name = decodeURIComponent(this.getAttribute('data-name'));
      showCancelProjectModal(id, name, adminApi, api);
    });
  });
  
  // Post Update handlers
  document.querySelectorAll('.post-update-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = this.getAttribute('data-id');
      var name = this.getAttribute('data-name');
      showPostUpdateModal(id, name, adminApi, api);
    });
  });
}

// Complete Project Modal
function showCompleteProjectModal(projectId, projectName, adminApi, api) {
  var modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = 
    '<div class="modal-content" style="max-width: 450px;">' +
      '<h2>✅ Complete Project</h2>' +
      '<p style="color: var(--text-muted); margin-bottom: 1rem;">Project: <strong>' + projectName + '</strong></p>' +
      
      '<div style="background: #d1fae5; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">' +
        '<p style="margin: 0; font-size: 0.9rem;"><strong>This will:</strong></p>' +
        '<ul style="margin: 0.5rem 0 0 1rem; padding: 0; font-size: 0.85rem;">' +
          '<li>Mark all investments as completed</li>' +
          '<li>Return principal to investors (if selected)</li>' +
          '<li>Close the project to new investments</li>' +
          '<li>Send completion emails to all investors</li>' +
        '</ul>' +
      '</div>' +
      
      '<form id="complete-project-form">' +
        '<div class="form-group">' +
          '<label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">' +
            '<input type="checkbox" id="return-principal" checked>' +
            '<span>Return principal to investors\' wallets</span>' +
          '</label>' +
        '</div>' +
        
        '<div class="form-group">' +
          '<label>Completion Note (optional)</label>' +
          '<textarea id="completion-note" rows="2" placeholder="e.g., Project completed successfully after 12 months" style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 4px;"></textarea>' +
        '</div>' +
        
        '<div style="display: flex; gap: 1rem;">' +
          '<button type="button" class="btn btn-outline close-modal" style="flex: 1;">Cancel</button>' +
          '<button type="submit" class="btn btn-success" id="submit-complete-btn" style="flex: 1;">✅ Complete Project</button>' +
        '</div>' +
      '</form>' +
    '</div>';
  
  document.body.appendChild(modal);
  
  modal.querySelector('.close-modal').addEventListener('click', function() { modal.remove(); });
  modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
  
  modal.querySelector('#complete-project-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    var returnPrincipal = document.getElementById('return-principal').checked;
    var note = document.getElementById('completion-note').value || 'Project completed successfully';
    var submitBtn = document.getElementById('submit-complete-btn');
    
    if (!confirm('Are you sure you want to complete this project? This action cannot be undone.')) return;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    adminApi.completeProject(projectId, returnPrincipal, note)
      .then(function(result) {
        alert('✅ Project completed! ' + result.investorCount + ' investors notified. Principal returned: GH₵' + (result.totalPrincipalReturned || 0).toLocaleString());
        modal.remove();
        loadAdminTab(adminApi, api, 'all-projects');
      })
      .catch(function(err) {
        alert('❌ Error: ' + err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = '✅ Complete Project';
      });
  });
}

// Cancel Project Modal
function showCancelProjectModal(projectId, projectName, adminApi, api) {
  var modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = 
    '<div class="modal-content" style="max-width: 450px;">' +
      '<h2>⚠️ Cancel Project</h2>' +
      '<p style="color: var(--text-muted); margin-bottom: 1rem;">Project: <strong>' + projectName + '</strong></p>' +
      
      '<div style="background: #fef3c7; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">' +
        '<p style="margin: 0; font-size: 0.9rem;"><strong>⚠️ Warning - This will:</strong></p>' +
        '<ul style="margin: 0.5rem 0 0 1rem; padding: 0; font-size: 0.85rem;">' +
          '<li>Cancel all investments</li>' +
          '<li>Refund ALL principals to investors</li>' +
          '<li>Reset project funding to 0</li>' +
          '<li>Send cancellation emails to all investors</li>' +
        '</ul>' +
      '</div>' +
      
      '<form id="cancel-project-form">' +
        '<div class="form-group">' +
          '<label>Cancellation Reason <span style="color: #ef4444;">*</span></label>' +
          '<textarea id="cancellation-reason" rows="3" required placeholder="e.g., Project owner unable to continue operations" style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 4px;"></textarea>' +
        '</div>' +
        
        '<div style="display: flex; gap: 1rem;">' +
          '<button type="button" class="btn btn-outline close-modal" style="flex: 1;">Cancel</button>' +
          '<button type="submit" class="btn btn-danger" id="submit-cancel-btn" style="flex: 1;">⚠️ Cancel & Refund</button>' +
        '</div>' +
      '</form>' +
    '</div>';
  
  document.body.appendChild(modal);
  
  modal.querySelector('.close-modal').addEventListener('click', function() { modal.remove(); });
  modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
  
  modal.querySelector('#cancel-project-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    var reason = document.getElementById('cancellation-reason').value;
    var submitBtn = document.getElementById('submit-cancel-btn');
    
    if (!confirm('FINAL WARNING: This will refund ALL investments and cancel the project permanently. Continue?')) return;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Cancelling...';
    
    adminApi.cancelProject(projectId, reason)
      .then(function(result) {
        alert('✅ Project cancelled. ' + result.investorCount + ' investors refunded. Total: GH₵' + (result.totalRefunded || 0).toLocaleString());
        modal.remove();
        loadAdminTab(adminApi, api, 'all-projects');
      })
      .catch(function(err) {
        alert('❌ Error: ' + err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = '⚠️ Cancel & Refund';
      });
  });
}

// Post Update Modal for Admin
function showPostUpdateModal(projectId, projectName, adminApi, api) {
  var modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = 
    '<div class="modal-content" style="max-width: 500px;">' +
      '<h2>📢 Post Update to Investors</h2>' +
      '<p style="color: var(--text-muted); margin-bottom: 1rem;">Project: <strong>' + projectName + '</strong></p>' +
      
      '<form id="post-update-form">' +
        '<div class="form-group">' +
          '<label>Update Type</label>' +
          '<select id="update-type" required style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 4px;">' +
            '<option value="info">ℹ️ Information</option>' +
            '<option value="profit">💰 Profit Distribution</option>' +
            '<option value="milestone">🎯 Milestone Achieved</option>' +
            '<option value="warning">⚠️ Important Notice</option>' +
          '</select>' +
        '</div>' +
        
        '<div class="form-group">' +
          '<label>Title</label>' +
          '<input type="text" id="update-title" required placeholder="e.g., Profit Distribution for December" style="width: 100%;">' +
        '</div>' +
        
        '<div class="form-group">' +
          '<label>Message</label>' +
          '<textarea id="update-message" required rows="4" placeholder="Write your update message here..." style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 4px;"></textarea>' +
        '</div>' +
        
        '<div style="background: #fef3c7; border-radius: 8px; padding: 0.75rem; margin-bottom: 1rem; font-size: 0.85rem;">' +
          '<strong>💡 Note:</strong> This update will be visible to all investors who have invested in this project.' +
        '</div>' +
        
        '<div style="display: flex; gap: 1rem;">' +
          '<button type="button" class="btn btn-outline" id="close-update-modal" style="flex: 1;">Cancel</button>' +
          '<button type="submit" class="btn btn-primary" id="submit-update-btn" style="flex: 1;">📢 Post Update</button>' +
        '</div>' +
      '</form>' +
    '</div>';
  
  document.body.appendChild(modal);
  
  document.getElementById('close-update-modal').addEventListener('click', function() {
    modal.remove();
  });
  
  document.getElementById('post-update-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    var type = document.getElementById('update-type').value;
    var title = document.getElementById('update-title').value;
    var message = document.getElementById('update-message').value;
    var submitBtn = document.getElementById('submit-update-btn');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting...';
    
    adminApi.postProjectUpdate(projectId, title, message, type)
      .then(function() {
        alert('✅ Update posted successfully! Investors can now see this in their project details.');
        modal.remove();
      })
      .catch(function(err) {
        alert('❌ Error: ' + err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = '📢 Post Update';
      });
  });
}

// Withdraw Investment Modal (Admin ends a user's investment)
function showWithdrawInvestmentModal(adminApi, investmentId, amount, projectName, userName, onSuccess) {
  var modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = 
    '<div class="modal-content" style="max-width: 450px;">' +
      '<h2>💸 End Investment</h2>' +
      '<p style="color: var(--text-muted); margin-bottom: 1rem;">User: <strong>' + userName + '</strong></p>' +
      '<p style="color: var(--text-muted); margin-bottom: 1rem;">Project: <strong>' + projectName + '</strong></p>' +
      '<p style="color: var(--text-muted); margin-bottom: 1rem;">Amount: <strong>GH₵' + parseFloat(amount).toLocaleString() + '</strong></p>' +
      
      '<div style="background: #fef3c7; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">' +
        '<p style="margin: 0; font-size: 0.9rem;"><strong>ℹ️ This will:</strong></p>' +
        '<ul style="margin: 0.5rem 0 0 1rem; padding: 0; font-size: 0.85rem;">' +
          '<li>Mark the investment as "withdrawn"</li>' +
          '<li>Refund the principal to user\'s wallet</li>' +
          '<li>Optionally apply an early withdrawal penalty</li>' +
          '<li>Send notification email to the user</li>' +
        '</ul>' +
      '</div>' +
      
      '<form id="withdraw-investment-form">' +
        '<div class="form-group">' +
          '<label>Reason for Withdrawal <span style="color: #ef4444;">*</span></label>' +
          '<textarea id="withdraw-reason" rows="2" required placeholder="e.g., User requested to exit investment" style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 4px;"></textarea>' +
        '</div>' +
        
        '<div class="form-group" style="margin-bottom: 1rem;">' +
          '<label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">' +
            '<input type="checkbox" id="apply-penalty" style="width: 18px; height: 18px;">' +
            '<span>Apply early withdrawal penalty</span>' +
          '</label>' +
        '</div>' +
        
        '<div class="form-group" id="penalty-options" style="display: none; background: #fef2f2; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">' +
          '<label>Penalty Percentage</label>' +
          '<select id="penalty-percent" style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 4px;">' +
            '<option value="5">5%</option>' +
            '<option value="10" selected>10%</option>' +
            '<option value="15">15%</option>' +
            '<option value="20">20%</option>' +
          '</select>' +
          '<p id="penalty-preview" style="margin-top: 0.5rem; font-size: 0.85rem; color: #ef4444;"></p>' +
        '</div>' +
        
        '<div style="display: flex; gap: 1rem;">' +
          '<button type="button" class="btn btn-outline close-modal" style="flex: 1;">Cancel</button>' +
          '<button type="submit" class="btn btn-warning" id="submit-withdraw-btn" style="flex: 1;">💸 End Investment</button>' +
        '</div>' +
      '</form>' +
    '</div>';
  
  document.body.appendChild(modal);
  
  var penaltyCheckbox = document.getElementById('apply-penalty');
  var penaltyOptions = document.getElementById('penalty-options');
  var penaltyPercent = document.getElementById('penalty-percent');
  var penaltyPreview = document.getElementById('penalty-preview');
  
  function updatePenaltyPreview() {
    var percent = parseInt(penaltyPercent.value);
    var penalty = Math.round(parseFloat(amount) * (percent / 100));
    var refund = parseFloat(amount) - penalty;
    penaltyPreview.innerHTML = 'Penalty: <strong>-GH₵' + penalty.toLocaleString() + '</strong> | Refund: <strong>GH₵' + refund.toLocaleString() + '</strong>';
  }
  
  penaltyCheckbox.addEventListener('change', function() {
    penaltyOptions.style.display = this.checked ? 'block' : 'none';
    if (this.checked) updatePenaltyPreview();
  });
  
  penaltyPercent.addEventListener('change', updatePenaltyPreview);
  
  modal.querySelector('.close-modal').addEventListener('click', function() { modal.remove(); });
  modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
  
  modal.querySelector('#withdraw-investment-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    var reason = document.getElementById('withdraw-reason').value;
    var applyPenalty = penaltyCheckbox.checked;
    var penaltyPct = applyPenalty ? parseInt(penaltyPercent.value) : 0;
    var submitBtn = document.getElementById('submit-withdraw-btn');
    
    if (!confirm('Are you sure you want to end this investment? The principal will be refunded to the user\'s wallet.')) return;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    adminApi.withdrawInvestment(investmentId, { reason: reason, applyPenalty: applyPenalty, penaltyPercent: penaltyPct })
      .then(function(result) {
        alert('✅ Investment ended successfully!\n\nPrincipal: GH₵' + result.principalAmount.toLocaleString() + 
              (result.penaltyAmount > 0 ? '\nPenalty: -GH₵' + result.penaltyAmount.toLocaleString() : '') +
              '\nRefunded: GH₵' + result.refundAmount.toLocaleString());
        modal.remove();
        if (onSuccess) onSuccess();
      })
      .catch(function(err) {
        alert('❌ Error: ' + err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = '💸 End Investment';
      });
  });
}

export { renderAdmin };
