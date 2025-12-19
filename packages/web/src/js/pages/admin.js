// Admin Dashboard Page
function renderAdmin(container, api) {
  // Check if user is admin
  var user = api.user;
  if (!user || user.role !== 'admin') {
    container.innerHTML = '<section><h2>Access Denied</h2><p>Admin privileges required.</p></section>';
    return;
  }
  
  // Get admin API helper
  var adminApi = api.getAdmin();
  
  var html = 
    '<section style="max-width: 1200px; margin: 0 auto; padding: 1rem;">' +
      // Header
      '<div style="margin-bottom: 2rem;">' +
        '<h2 style="margin: 0; font-size: 1.75rem; font-weight: 700;">Admin Dashboard</h2>' +
      '</div>' +
      
      // Action Cards - Only shows pending items that need attention
      '<div id="admin-alerts" style="margin-bottom: 2rem;"></div>' +
      
      // Main Actions Grid
      '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">' +
        
        // Create Project Card
        '<div class="card action-card" data-action="create-project" style="cursor: pointer; padding: 1.5rem; border: 2px solid var(--secondary-color); background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%);">' +
          '<div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem;">' +
            '<div style="width: 48px; height: 48px; border-radius: 12px; background: var(--secondary-color); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">➕</div>' +
            '<div>' +
              '<h3 style="margin: 0; font-size: 1.1rem; font-weight: 600;">Create Project</h3>' +
              '<p style="margin: 0; font-size: 0.875rem; color: var(--text-muted);">Add new investment project</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
        
        // Users Card
        '<div class="card action-card" data-action="all-users" style="cursor: pointer; padding: 1.5rem;">' +
          '<div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem;">' +
            '<div style="width: 48px; height: 48px; border-radius: 12px; background: var(--primary-color); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">👥</div>' +
            '<div>' +
              '<h3 style="margin: 0; font-size: 1.1rem; font-weight: 600;">Manage Users</h3>' +
              '<p style="margin: 0; font-size: 0.875rem; color: var(--text-muted);">View all investors</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
        
        // Projects Card
        '<div class="card action-card" data-action="all-projects" style="cursor: pointer; padding: 1.5rem;">' +
          '<div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem;">' +
            '<div style="width: 48px; height: 48px; border-radius: 12px; background: #8b5cf6; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">📊</div>' +
            '<div>' +
              '<h3 style="margin: 0; font-size: 1.1rem; font-weight: 600;">All Projects</h3>' +
              '<p style="margin: 0; font-size: 0.875rem; color: var(--text-muted);">Manage projects</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
        
      '</div>' +
      
      // Content Area
      '<div id="admin-content" style="margin-top: 2rem;"></div>' +
    '</section>';
  
  container.innerHTML = html;
  
  // Load alerts (pending items)
  loadAdminAlerts(adminApi);
  
  // Action card click handlers
  document.querySelectorAll('.action-card').forEach(function(card) {
    card.addEventListener('click', function() {
      var action = this.getAttribute('data-action');
      loadAdminTab(adminApi, action);
      // Scroll to content
      document.getElementById('admin-content').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// Load alerts for pending items
function loadAdminAlerts(adminApi) {
  var alertsContainer = document.getElementById('admin-alerts');
  
  adminApi.getStats()
    .then(function(stats) {
      var alerts = [];
      
      // Only show alerts if there are pending items
      if (stats.users.pendingKyc > 0) {
        alerts.push(
          '<div class="card alert-card" data-action="pending-kyc" style="cursor: pointer; padding: 1rem; border-left: 4px solid #f59e0b; background: rgba(245, 158, 11, 0.1); display: flex; justify-content: space-between; align-items: center;">' +
            '<div style="display: flex; align-items: center; gap: 0.75rem;">' +
              '<span style="font-size: 1.25rem;">📋</span>' +
              '<div>' +
                '<strong>' + stats.users.pendingKyc + ' Pending KYC</strong>' +
                '<p style="margin: 0; font-size: 0.875rem; color: var(--text-muted);">Users waiting for verification</p>' +
              '</div>' +
            '</div>' +
            '<button class="btn btn-primary" style="padding: 0.5rem 1rem;">Review</button>' +
          '</div>'
        );
      }
      
      if (stats.projects.pending > 0) {
        alerts.push(
          '<div class="card alert-card" data-action="pending-projects" style="cursor: pointer; padding: 1rem; border-left: 4px solid var(--primary-color); background: rgba(99, 102, 241, 0.1); display: flex; justify-content: space-between; align-items: center;">' +
            '<div style="display: flex; align-items: center; gap: 0.75rem;">' +
              '<span style="font-size: 1.25rem;">🏢</span>' +
              '<div>' +
                '<strong>' + stats.projects.pending + ' Pending Projects</strong>' +
                '<p style="margin: 0; font-size: 0.875rem; color: var(--text-muted);">Projects awaiting approval</p>' +
              '</div>' +
            '</div>' +
            '<button class="btn btn-primary" style="padding: 0.5rem 1rem;">Review</button>' +
          '</div>'
        );
      }
      
      if (stats.withdrawals.pending > 0) {
        alerts.push(
          '<div class="card alert-card" data-action="pending-withdrawals" style="cursor: pointer; padding: 1rem; border-left: 4px solid #ef4444; background: rgba(239, 68, 68, 0.1); display: flex; justify-content: space-between; align-items: center;">' +
            '<div style="display: flex; align-items: center; gap: 0.75rem;">' +
              '<span style="font-size: 1.25rem;">💸</span>' +
              '<div>' +
                '<strong>' + stats.withdrawals.pending + ' Pending Withdrawals</strong> <span style="color: #ef4444; font-weight: 600;">($' + stats.withdrawals.pendingAmount.toLocaleString() + ')</span>' +
                '<p style="margin: 0; font-size: 0.875rem; color: var(--text-muted);">Waiting for processing</p>' +
              '</div>' +
            '</div>' +
            '<button class="btn" style="padding: 0.5rem 1rem; background: #ef4444; color: white;">Process</button>' +
          '</div>'
        );
      }
      
      if (alerts.length > 0) {
        alertsContainer.innerHTML = 
          '<h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-muted);">⚡ Requires Action</h3>' +
          '<div style="display: flex; flex-direction: column; gap: 0.75rem;">' + alerts.join('') + '</div>';
        
        // Add click handlers for alert cards
        document.querySelectorAll('.alert-card').forEach(function(card) {
          card.addEventListener('click', function() {
            var action = this.getAttribute('data-action');
            loadAdminTab(adminApi, action);
            document.getElementById('admin-content').scrollIntoView({ behavior: 'smooth' });
          });
        });
      } else {
        alertsContainer.innerHTML = 
          '<div class="card" style="padding: 1.5rem; text-align: center; background: rgba(16, 185, 129, 0.1); border: 1px solid var(--secondary-color);">' +
            '<span style="font-size: 2rem;">✅</span>' +
            '<p style="margin: 0.5rem 0 0 0; font-weight: 500; color: var(--secondary-color);">All caught up! No pending actions.</p>' +
          '</div>';
      }
    })
    .catch(function(err) {
      alertsContainer.innerHTML = '<div style="color: #ef4444;">Error loading alerts: ' + err.message + '</div>';
    });
}

function loadAdminTab(adminApi, tab) {
  var content = document.getElementById('admin-content');
  
  // Section titles
  var titles = {
    'pending-kyc': { icon: '📋', title: 'Pending KYC Verifications' },
    'pending-projects': { icon: '🏢', title: 'Pending Project Approvals' },
    'pending-withdrawals': { icon: '💸', title: 'Pending Withdrawals' },
    'all-users': { icon: '👥', title: 'All Users' },
    'all-projects': { icon: '📊', title: 'All Projects' },
    'create-project': { icon: '➕', title: 'Create New Project' }
  };
  
  var sectionInfo = titles[tab] || { icon: '📁', title: 'Admin' };
  
  content.innerHTML = 
    '<div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">' +
      '<span style="font-size: 1.5rem;">' + sectionInfo.icon + '</span>' +
      '<h3 style="margin: 0; font-size: 1.25rem; font-weight: 600;">' + sectionInfo.title + '</h3>' +
    '</div>' +
    '<div id="tab-content"><div style="text-align: center; padding: 2rem;">Loading...</div></div>';
  
  var tabContent = document.getElementById('tab-content');
  
  if (tab === 'pending-kyc') {
    adminApi.getUsers({ kycStatus: 'submitted' })
      .then(function(result) {
        if (result.users.length === 0) {
          tabContent.innerHTML = '<div class="card" style="padding: 2rem; text-align: center; color: var(--text-muted);">✅ No pending KYC verifications</div>';
          return;
        }
        
        tabContent.innerHTML = result.users.map(function(user) {
          return '<div class="card" style="padding: 1.5rem; margin-bottom: 1rem;">' +
            '<div style="display: flex; justify-content: space-between; align-items: flex-start;">' +
              '<div>' +
                '<h3 style="margin-bottom: 0.5rem;">' + user.name + '</h3>' +
                '<p style="color: var(--text-muted); margin-bottom: 0.5rem;">' + user.email + '</p>' +
                '<span class="badge">' + user.role + '</span>' +
              '</div>' +
              '<div style="display: flex; gap: 0.5rem;">' +
                '<button class="btn btn-primary approve-kyc-btn" data-id="' + user.id + '">Approve</button>' +
                '<button class="btn btn-outline reject-kyc-btn" data-id="' + user.id + '">Reject</button>' +
              '</div>' +
            '</div>' +
            (user.kyc && user.kyc.idDocument ? 
              '<div style="margin-top: 1rem;">' +
                '<p style="font-size: 0.875rem; color: var(--text-muted);">ID Document submitted</p>' +
              '</div>' : '') +
          '</div>';
        }).join('');
        
        // Add event listeners
        document.querySelectorAll('.approve-kyc-btn').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            if (confirm('Approve KYC for this user?')) {
              var button = this;
              button.disabled = true;
              button.textContent = 'Processing...';
              adminApi.verifyKyc(id, 'approve')
                .then(function() {
                  alert('✅ KYC approved successfully!');
                  loadAdminTab(adminApi, 'pending-kyc');
                  loadAdminStats(adminApi);
                })
                .catch(function(err) {
                  alert('❌ Error: ' + err.message);
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
              button.textContent = 'Processing...';
              adminApi.verifyKyc(id, 'reject', reason)
                .then(function() {
                  alert('✅ KYC rejected with reason: ' + reason);
                  loadAdminTab(adminApi, 'pending-kyc');
                  loadAdminStats(adminApi);
                })
                .catch(function(err) {
                  alert('❌ Error: ' + err.message);
                  button.disabled = false;
                  button.textContent = 'Reject';
                });
            }
          });
        });
      });
  }
  
  else if (tab === 'pending-projects') {
    adminApi.getProjects({ status: 'pending_review' })
      .then(function(result) {
        if (result.projects.length === 0) {
          tabContent.innerHTML = '<div class="card" style="padding: 2rem; text-align: center; color: var(--text-muted);">✅ No pending project reviews</div>';
          return;
        }
        
        tabContent.innerHTML = result.projects.map(function(project) {
          return '<div class="card" style="padding: 1.5rem; margin-bottom: 1rem;">' +
            '<div style="display: flex; justify-content: space-between; align-items: flex-start;">' +
              '<div>' +
                '<h3 style="margin-bottom: 0.5rem;">' + project.name + '</h3>' +
                '<p style="color: var(--text-muted); margin-bottom: 0.5rem;">' + project.description.substring(0, 100) + '...</p>' +
                '<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">' +
                  '<span class="badge">' + project.category + '</span>' +
                  '<span class="badge" style="background: var(--secondary-color);">Goal: $' + project.goalAmount.toLocaleString() + '</span>' +
                  '<span class="badge" style="background: var(--accent-color);">Return: ' + project.targetReturn + '</span>' +
                '</div>' +
              '</div>' +
              '<div style="display: flex; gap: 0.5rem; flex-direction: column;">' +
                '<button class="btn btn-primary approve-project-btn" data-id="' + project.id + '">Approve</button>' +
                '<button class="btn btn-outline request-changes-btn" data-id="' + project.id + '">Request Changes</button>' +
                '<button class="btn" style="background: #ef4444;" data-id="' + project.id + '" class="reject-project-btn">Reject</button>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('');
        
        // Event listeners
        document.querySelectorAll('.approve-project-btn').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            if (confirm('Approve this project for funding?')) {
              var button = this;
              button.disabled = true;
              button.textContent = 'Processing...';
              adminApi.reviewProject(id, 'approve', 'Project approved for funding')
                .then(function() {
                  alert('✅ Project approved successfully!');
                  loadAdminTab(adminApi, 'pending-projects');
                  loadAdminStats(adminApi);
                })
                .catch(function(err) {
                  alert('❌ Error: ' + err.message);
                  button.disabled = false;
                  button.textContent = 'Approve';
                });
            }
          });
        });
        
        document.querySelectorAll('.request-changes-btn').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            var feedback = prompt('What changes are required?');
            if (feedback) {
              var button = this;
              button.disabled = true;
              button.textContent = 'Processing...';
              adminApi.reviewProject(id, 'request_changes', feedback)
                .then(function() {
                  alert('✅ Changes requested successfully');
                  loadAdminTab(adminApi, 'pending-projects');
                  loadAdminStats(adminApi);
                })
                .catch(function(err) {
                  alert('❌ Error: ' + err.message);
                  button.disabled = false;
                  button.textContent = 'Request Changes';
                });
            }
          });
        });
      });
  }
  
  else if (tab === 'pending-withdrawals') {
    adminApi.getWithdrawals({ status: 'pending' })
      .then(function(result) {
        if (result.withdrawals.length === 0) {
          tabContent.innerHTML = '<div class="card" style="padding: 2rem; text-align: center; color: var(--text-muted);">✅ No pending withdrawals</div>';
          return;
        }
        
        tabContent.innerHTML = result.withdrawals.map(function(w) {
          return '<div class="card" style="padding: 1.5rem; margin-bottom: 1rem;">' +
            '<div style="display: flex; justify-content: space-between; align-items: flex-start;">' +
              '<div>' +
                '<h3 style="margin-bottom: 0.5rem;">$' + w.amount.toLocaleString() + '</h3>' +
                '<p style="color: var(--text-muted); margin-bottom: 0.5rem;">' + (w.user ? w.user.name + ' (' + w.user.email + ')' : 'User ' + w.userId) + '</p>' +
                '<div style="display: flex; gap: 0.5rem;">' +
                  '<span class="badge">' + w.method + '</span>' +
                  '<span style="font-size: 0.875rem; color: var(--text-muted);">' + new Date(w.createdAt).toLocaleDateString() + '</span>' +
                '</div>' +
              '</div>' +
              '<div style="display: flex; gap: 0.5rem;">' +
                '<button class="btn btn-primary approve-withdrawal-btn" data-id="' + w.id + '">Approve & Pay</button>' +
                '<button class="btn btn-outline reject-withdrawal-btn" data-id="' + w.id + '">Reject</button>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('');
        
        document.querySelectorAll('.approve-withdrawal-btn').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            var txRef = prompt('Enter transaction reference:');
            if (txRef) {
              var button = this;
              button.disabled = true;
              button.textContent = 'Processing...';
              adminApi.processWithdrawal(id, 'approve', null, txRef)
                .then(function() {
                  alert('✅ Withdrawal approved and marked as paid!');
                  loadAdminTab(adminApi, 'pending-withdrawals');
                  loadAdminStats(adminApi);
                })
                .catch(function(err) {
                  alert('❌ Error: ' + err.message);
                  button.disabled = false;
                  button.textContent = 'Approve & Pay';
                });
            }
          });
        });
        
        document.querySelectorAll('.reject-withdrawal-btn').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            var reason = prompt('Rejection reason:');
            if (reason) {
              var button = this;
              button.disabled = true;
              button.textContent = 'Processing...';
              adminApi.processWithdrawal(id, 'reject', reason)
                .then(function() {
                  alert('✅ Withdrawal rejected, funds returned to user');
                  loadAdminTab(adminApi, 'pending-withdrawals');
                  loadAdminStats(adminApi);
                })
                .catch(function(err) {
                  alert('❌ Error: ' + err.message);
                  button.disabled = false;
                  button.textContent = 'Reject';
                });
            }
          });
        });
      });
  }
  
  else if (tab === 'all-users') {
    adminApi.getUsers({})
      .then(function(result) {
        // Filter out admin users from the display
        var nonAdminUsers = result.users.filter(function(user) {
          return user.role !== 'admin';
        });
        
        if (nonAdminUsers.length === 0) {
          tabContent.innerHTML = '<div class="card" style="padding: 2rem; text-align: center; color: var(--text-muted);">No users found</div>';
          return;
        }
        
        tabContent.innerHTML = 
          '<div style="overflow-x: auto;">' +
            '<table style="width: 100%; border-collapse: collapse; background: var(--surface-color); border-radius: 0.75rem; overflow: hidden;">' +
              '<thead>' +
                '<tr style="background: var(--surface-elevated); border-bottom: 2px solid var(--border-color);">' +
                  '<th style="text-align: left; padding: 1rem; font-weight: 600; color: var(--text-secondary); font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.5px;">Name</th>' +
                  '<th style="text-align: left; padding: 1rem; font-weight: 600; color: var(--text-secondary); font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.5px;">Email</th>' +
                  '<th style="text-align: left; padding: 1rem; font-weight: 600; color: var(--text-secondary); font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.5px;">Role</th>' +
                  '<th style="text-align: left; padding: 1rem; font-weight: 600; color: var(--text-secondary); font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.5px;">KYC</th>' +
                  '<th style="text-align: left; padding: 1rem; font-weight: 600; color: var(--text-secondary); font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.5px;">Status</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>' +
                nonAdminUsers.map(function(user) {
                  return '<tr style="border-bottom: 1px solid var(--border-color); transition: background 0.2s;" onmouseover="this.style.background=\'var(--surface-elevated)\'" onmouseout="this.style.background=\'transparent\'">' +
                    '<td style="padding: 1rem; font-weight: 500;">' + user.name + '</td>' +
                    '<td style="padding: 1rem; color: var(--text-secondary);">' + user.email + '</td>' +
                    '<td style="padding: 1rem;"><span class="badge" style="background: ' + (user.role === 'business_owner' ? '#8b5cf6' : 'var(--primary-color)') + ';">' + user.role.replace('_', ' ') + '</span></td>' +
                    '<td style="padding: 1rem;"><span class="badge" style="background: ' + 
                      (user.kyc && user.kyc.status === 'verified' ? 'var(--secondary-color)' : user.kyc && user.kyc.status === 'submitted' ? '#f59e0b' : '#6b7280') + ';">' + 
                      (user.kyc ? user.kyc.status : 'pending') + '</span></td>' +
                    '<td style="padding: 1rem;">' + (user.isActive !== false ? '<span style="color: var(--secondary-color); font-weight: 600;">✅ Active</span>' : '<span style="color: #ef4444; font-weight: 600;">🚫 Suspended</span>') + '</td>' +
                  '</tr>';
                }).join('') +
              '</tbody>' +
            '</table>' +
          '</div>';
      })
      .catch(function(err) {
        tabContent.innerHTML = '<div class="card" style="padding: 2rem; text-align: center; color: #ef4444;">⚠️ Error loading users: ' + err.message + '</div>';
      });
  }
  
  else if (tab === 'create-project') {
    tabContent.innerHTML = 
      '<div class="card" style="padding: 2rem; max-width: 800px;">' +
        '<form id="create-project-form">' +
          '<div style="margin-bottom: 1rem;">' +
            '<label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Project Name *</label>' +
            '<input type="text" name="name" required class="input" style="width: 100%;">' +
          '</div>' +
          '<div style="margin-bottom: 1rem;">' +
            '<label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Category *</label>' +
            '<select name="category" required class="input" style="width: 100%;">' +
              '<option value="">Select Category</option>' +
              '<option value="technology">Technology</option>' +
              '<option value="real_estate">Real Estate</option>' +
              '<option value="agriculture">Agriculture</option>' +
              '<option value="healthcare">Healthcare</option>' +
              '<option value="renewable_energy">Renewable Energy</option>' +
              '<option value="retail">Retail</option>' +
              '<option value="manufacturing">Manufacturing</option>' +
              '<option value="finance">Finance</option>' +
              '<option value="other">Other</option>' +
            '</select>' +
          '</div>' +
          '<div style="margin-bottom: 1rem;">' +
            '<label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Description *</label>' +
            '<textarea name="description" required class="input" style="width: 100%; min-height: 120px;" placeholder="Detailed description of the project..."></textarea>' +
          '</div>' +
          '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">' +
            '<div>' +
              '<label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Funding Goal ($) *</label>' +
              '<input type="number" name="goalAmount" required min="1000" class="input" style="width: 100%;" placeholder="100000">' +
            '</div>' +
            '<div>' +
              '<label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Min Investment ($)</label>' +
              '<input type="number" name="minInvestment" value="100" min="10" class="input" style="width: 100%;">' +
            '</div>' +
          '</div>' +
          '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">' +
            '<div>' +
              '<label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Target Return</label>' +
              '<input type="text" name="targetReturn" value="10-15%" class="input" style="width: 100%;" placeholder="e.g. 10-15%">' +
            '</div>' +
            '<div>' +
              '<label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Duration</label>' +
              '<input type="text" name="duration" value="12 months" class="input" style="width: 100%;" placeholder="e.g. 12 months">' +
            '</div>' +
          '</div>' +
          '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">' +
            '<div>' +
              '<label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Risk Level</label>' +
              '<select name="riskLevel" class="input" style="width: 100%;">' +
                '<option value="low">Low</option>' +
                '<option value="medium" selected>Medium</option>' +
                '<option value="high">High</option>' +
              '</select>' +
            '</div>' +
            '<div>' +
              '<label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Image URL</label>' +
              '<input type="url" name="imageUrl" class="input" style="width: 100%;" placeholder="https://...">' +
            '</div>' +
          '</div>' +
          '<div style="margin-bottom: 1.5rem;">' +
            '<label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">' +
              '<input type="checkbox" name="featured">' +
              '<span>Featured Project (show prominently on homepage)</span>' +
            '</label>' +
          '</div>' +
          '<button type="submit" class="btn btn-primary" style="width: 100%;">Create & Publish Project</button>' +
        '</form>' +
      '</div>';
    
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
        duration: form.duration.value || '12 months',
        riskLevel: form.riskLevel.value,
        imageUrl: form.imageUrl.value || '',
        featured: form.featured.checked
      };
      
      adminApi.createProject(data)
        .then(function(result) {
          alert('Project created and published successfully!');
          loadAdminTab(adminApi, 'all-projects');
          loadAdminStats(adminApi);
        })
        .catch(function(err) {
          alert('Error: ' + err.message);
          submitBtn.disabled = false;
          submitBtn.textContent = 'Create & Publish Project';
        });
    });
  }
  
  else if (tab === 'all-projects') {
    adminApi.getProjects({ status: 'all' })
      .then(function(result) {
        if (result.projects.length === 0) {
          tabContent.innerHTML = '<div class="card" style="padding: 2rem; text-align: center; color: var(--text-muted);">No projects yet. Create your first project!</div>';
          return;
        }
        
        tabContent.innerHTML = 
          result.projects.map(function(project) {
            var statusColor = {
              'pending_review': '#f59e0b',
              'active': 'var(--secondary-color)',
              'funded': 'var(--primary-color)',
              'completed': '#10b981',
              'rejected': '#ef4444',
              'changes_requested': '#8b5cf6'
            }[project.status] || '#6b7280';
            
            return '<div class="card" style="padding: 1.5rem; margin-bottom: 1rem;">' +
              '<div style="display: flex; justify-content: space-between; align-items: flex-start;">' +
                '<div style="flex: 1;">' +
                  '<div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">' +
                    '<h3 style="margin: 0;">' + project.name + '</h3>' +
                    (project.isCompanyProject ? '<span class="badge" style="background: var(--primary-color);">Company</span>' : '') +
                    (project.featured ? '<span class="badge" style="background: #f59e0b;">Featured</span>' : '') +
                  '</div>' +
                  '<p style="color: var(--text-muted); margin-bottom: 0.5rem;">' + project.description.substring(0, 100) + '...</p>' +
                  '<div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem;">' +
                    '<span class="badge">' + project.category + '</span>' +
                    '<span class="badge" style="background: ' + statusColor + ';">' + project.status.replace('_', ' ') + '</span>' +
                  '</div>' +
                  '<div style="font-size: 0.875rem; color: var(--text-muted);">' +
                    'Goal: $' + project.goalAmount.toLocaleString() + ' | ' +
                    'Funded: $' + (project.currentFunding || 0).toLocaleString() + ' | ' +
                    'Investors: ' + (project.investorCount || 0) +
                  '</div>' +
                '</div>' +
                '<div style="display: flex; gap: 0.5rem; flex-direction: column;">' +
                  (project.status === 'active' ? 
                    '<button class="btn btn-outline distribute-btn" data-id="' + project.id + '">Distribute Profits</button>' : '') +
                  '<button class="btn btn-outline toggle-featured-btn" data-id="' + project.id + '" data-featured="' + project.featured + '">' + 
                    (project.featured ? 'Unfeature' : 'Feature') + 
                  '</button>' +
                '</div>' +
              '</div>' +
            '</div>';
          }).join('');
        
        // Distribute profits button
        document.querySelectorAll('.distribute-btn').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            var amount = prompt('Enter profit amount to distribute ($):');
            if (amount && parseFloat(amount) > 0) {
              var description = prompt('Description for this distribution:') || 'Profit distribution';
              adminApi.distributeProfits(id, parseFloat(amount), description)
                .then(function(result) {
                  alert('Distributed $' + amount + ' to ' + result.distributions.length + ' investors!');
                })
                .catch(function(err) {
                  alert('Error: ' + err.message);
                });
            }
          });
        });
        
        // Toggle featured button
        document.querySelectorAll('.toggle-featured-btn').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            var isFeatured = this.getAttribute('data-featured') === 'true';
            adminApi.updateProject(id, { featured: !isFeatured })
              .then(function() {
                loadAdminTab(adminApi, 'all-projects');
              });
          });
        });
      });
  }
}

export { renderAdmin };
