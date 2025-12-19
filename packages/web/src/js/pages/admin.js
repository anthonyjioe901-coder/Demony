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
    '<section>' +
      '<h2>Admin Dashboard</h2>' +
      '<p style="color: var(--text-muted); margin-bottom: 2rem;">Manage users, projects, and finances</p>' +
      
      // Stats cards
      '<div class="card-grid" id="admin-stats" style="margin-bottom: 2rem;">' +
        '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">Loading stats...</div>' +
      '</div>' +
      
      // Tabs
      '<div class="tabs" style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; flex-wrap: wrap;">' +
        '<button class="btn admin-tab active" data-tab="pending-kyc">Pending KYC</button>' +
        '<button class="btn admin-tab" data-tab="pending-projects">Pending Projects</button>' +
        '<button class="btn admin-tab" data-tab="pending-withdrawals">Pending Withdrawals</button>' +
        '<button class="btn admin-tab" data-tab="all-users">All Users</button>' +
        '<button class="btn admin-tab" data-tab="create-project" style="background: var(--secondary-color);">+ Create Project</button>' +
        '<button class="btn admin-tab" data-tab="all-projects">All Projects</button>' +
      '</div>' +
      
      // Tab content
      '<div id="admin-content"></div>' +
    '</section>';
  
  container.innerHTML = html;
  
  // Load stats
  loadAdminStats(adminApi);
  
  // Tab switching
  document.querySelectorAll('.admin-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.admin-tab').forEach(function(t) { t.classList.remove('active'); });
      this.classList.add('active');
      loadAdminTab(adminApi, this.getAttribute('data-tab'));
    });
  });
  
  // Load initial tab
  loadAdminTab(adminApi, 'pending-kyc');
}

function loadAdminStats(adminApi) {
  var statsContainer = document.getElementById('admin-stats');
  
  adminApi.getStats()
    .then(function(stats) {
      statsContainer.innerHTML = 
        '<div class="card" style="padding: 1.5rem; text-align: center;">' +
          '<div style="font-size: 2rem; font-weight: bold; color: var(--primary-color);">' + stats.users.total + '</div>' +
          '<div style="color: var(--text-muted);">Total Users</div>' +
          '<div style="font-size: 0.875rem; margin-top: 0.5rem;">' + stats.users.pendingKyc + ' pending KYC</div>' +
        '</div>' +
        '<div class="card" style="padding: 1.5rem; text-align: center;">' +
          '<div style="font-size: 2rem; font-weight: bold; color: var(--secondary-color);">' + stats.projects.total + '</div>' +
          '<div style="color: var(--text-muted);">Total Projects</div>' +
          '<div style="font-size: 0.875rem; margin-top: 0.5rem;">' + stats.projects.pending + ' pending review</div>' +
        '</div>' +
        '<div class="card" style="padding: 1.5rem; text-align: center;">' +
          '<div style="font-size: 2rem; font-weight: bold; color: var(--accent-color);">$' + stats.investments.totalAmount.toLocaleString() + '</div>' +
          '<div style="color: var(--text-muted);">Total Invested</div>' +
          '<div style="font-size: 0.875rem; margin-top: 0.5rem;">' + stats.investments.total + ' investments</div>' +
        '</div>' +
        '<div class="card" style="padding: 1.5rem; text-align: center;">' +
          '<div style="font-size: 2rem; font-weight: bold; color: #ef4444;">$' + stats.withdrawals.pendingAmount.toLocaleString() + '</div>' +
          '<div style="color: var(--text-muted);">Pending Withdrawals</div>' +
          '<div style="font-size: 0.875rem; margin-top: 0.5rem;">' + stats.withdrawals.pending + ' requests</div>' +
        '</div>';
    })
    .catch(function(err) {
      statsContainer.innerHTML = '<div style="grid-column: 1/-1; color: #ef4444;">Error loading stats: ' + err.message + '</div>';
    });
}

function loadAdminTab(adminApi, tab) {
  var content = document.getElementById('admin-content');
  content.innerHTML = '<div style="text-align: center; padding: 2rem;">Loading...</div>';
  
  if (tab === 'pending-kyc') {
    adminApi.getUsers({ kycStatus: 'submitted' })
      .then(function(result) {
        if (result.users.length === 0) {
          content.innerHTML = '<div class="card" style="padding: 2rem; text-align: center;">No pending KYC verifications</div>';
          return;
        }
        
        content.innerHTML = result.users.map(function(user) {
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
              adminApi.verifyKyc(id, 'approve')
                .then(function() {
                  alert('KYC approved!');
                  loadAdminTab(adminApi, 'pending-kyc');
                  loadAdminStats(adminApi);
                });
            }
          });
        });
        
        document.querySelectorAll('.reject-kyc-btn').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            var reason = prompt('Rejection reason:');
            if (reason) {
              adminApi.verifyKyc(id, 'reject', reason)
                .then(function() {
                  alert('KYC rejected');
                  loadAdminTab(adminApi, 'pending-kyc');
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
          content.innerHTML = '<div class="card" style="padding: 2rem; text-align: center;">No pending project reviews</div>';
          return;
        }
        
        content.innerHTML = result.projects.map(function(project) {
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
              adminApi.reviewProject(id, 'approve', 'Project approved for funding')
                .then(function() {
                  alert('Project approved!');
                  loadAdminTab(adminApi, 'pending-projects');
                  loadAdminStats(adminApi);
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
                  alert('Changes requested');
                  loadAdminTab(adminApi, 'pending-projects');
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
          content.innerHTML = '<div class="card" style="padding: 2rem; text-align: center;">No pending withdrawals</div>';
          return;
        }
        
        content.innerHTML = result.withdrawals.map(function(w) {
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
              adminApi.processWithdrawal(id, 'approve', null, txRef)
                .then(function() {
                  alert('Withdrawal approved and marked as paid!');
                  loadAdminTab(adminApi, 'pending-withdrawals');
                  loadAdminStats(adminApi);
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
                  alert('Withdrawal rejected, funds returned to user');
                  loadAdminTab(adminApi, 'pending-withdrawals');
                  loadAdminStats(adminApi);
                });
            }
          });
        });
      });
  }
  
  else if (tab === 'all-users') {
    adminApi.getUsers({})
      .then(function(result) {
        content.innerHTML = 
          '<table style="width: 100%; border-collapse: collapse;">' +
            '<thead>' +
              '<tr style="border-bottom: 1px solid var(--border-color);">' +
                '<th style="text-align: left; padding: 1rem;">Name</th>' +
                '<th style="text-align: left; padding: 1rem;">Email</th>' +
                '<th style="text-align: left; padding: 1rem;">Role</th>' +
                '<th style="text-align: left; padding: 1rem;">KYC</th>' +
                '<th style="text-align: left; padding: 1rem;">Status</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              result.users.map(function(user) {
                return '<tr style="border-bottom: 1px solid var(--border-color);">' +
                  '<td style="padding: 1rem;">' + user.name + '</td>' +
                  '<td style="padding: 1rem;">' + user.email + '</td>' +
                  '<td style="padding: 1rem;"><span class="badge">' + user.role + '</span></td>' +
                  '<td style="padding: 1rem;"><span class="badge" style="background: ' + 
                    (user.kyc && user.kyc.status === 'verified' ? 'var(--secondary-color)' : '#6b7280') + ';">' + 
                    (user.kyc ? user.kyc.status : 'pending') + '</span></td>' +
                  '<td style="padding: 1rem;">' + (user.isActive ? '✅ Active' : '🚫 Suspended') + '</td>' +
                '</tr>';
              }).join('') +
            '</tbody>' +
          '</table>';
      });
  }
  
  else if (tab === 'create-project') {
    content.innerHTML = 
      '<div class="card" style="padding: 2rem; max-width: 800px; margin: 0 auto;">' +
        '<h3 style="margin-bottom: 1.5rem;">Create Company Project</h3>' +
        '<p style="color: var(--text-muted); margin-bottom: 1.5rem;">Create a project directly from the company. This will be published immediately.</p>' +
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
          content.innerHTML = '<div class="card" style="padding: 2rem; text-align: center;">No projects yet</div>';
          return;
        }
        
        content.innerHTML = 
          '<div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">' +
            '<h3>' + result.projects.length + ' Projects</h3>' +
          '</div>' +
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
