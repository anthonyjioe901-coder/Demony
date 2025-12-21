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
          '<div class="action-icon create-icon">➕</div>' +
          '<div class="action-info">' +
            '<h3>Create Project</h3>' +
            '<p>Add new investment project</p>' +
          '</div>' +
        '</div>' +
        
        // Users Card
        '<div class="admin-action-card" data-action="all-users">' +
          '<div class="action-icon users-icon">👥</div>' +
          '<div class="action-info">' +
            '<h3>Manage Users</h3>' +
            '<p>View all investors</p>' +
          '</div>' +
        '</div>' +
        
        // Projects Card
        '<div class="admin-action-card active" data-action="all-projects">' +
          '<div class="action-icon projects-icon">📊</div>' +
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
              '<span class="alert-icon">📋</span>' +
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
              '<span class="alert-icon">🏢</span>' +
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
              '<span class="alert-icon">💸</span>' +
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
            '<h3 class="alerts-title">⚡ Requires Action</h3>' +
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
            '<span class="check-icon">✅</span>' +
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
    'pending-kyc': { icon: '📋', title: 'Pending KYC Verifications' },
    'pending-projects': { icon: '🏢', title: 'Pending Project Approvals' },
    'pending-withdrawals': { icon: '💸', title: 'Pending Withdrawals' },
    'all-users': { icon: '👥', title: 'All Users' },
    'all-projects': { icon: '📊', title: 'All Projects' },
    'create-project': { icon: '➕', title: 'Create New Project' }
  };
  
  var sectionInfo = titles[tab] || { icon: '📁', title: 'Admin' };
  
  content.innerHTML = 
    '<div class="admin-section-header">' +
      '<span class="section-icon">' + sectionInfo.icon + '</span>' +
      '<h2>' + sectionInfo.title + '</h2>' +
    '</div>' +
    '<div id="tab-content" class="tab-content"><div class="loading">Loading...</div></div>';
  
  var tabContent = document.getElementById('tab-content');
  
  // ========== PENDING KYC ==========
  if (tab === 'pending-kyc') {
    adminApi.getUsers({ kycStatus: 'submitted' })
      .then(function(result) {
        if (result.users.length === 0) {
          tabContent.innerHTML = '<div class="empty-state">✅ No pending KYC verifications</div>';
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
          tabContent.innerHTML = '<div class="empty-state">✅ No pending project reviews</div>';
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
          tabContent.innerHTML = '<div class="empty-state">✅ No pending withdrawals</div>';
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
  
  // ========== ALL USERS ==========
  else if (tab === 'all-users') {
    adminApi.getUsers({})
      .then(function(result) {
        var nonAdminUsers = result.users.filter(function(user) {
          return user.role !== 'admin';
        });
        
        if (nonAdminUsers.length === 0) {
          tabContent.innerHTML = '<div class="empty-state">No users found</div>';
          return;
        }
        
        tabContent.innerHTML = 
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
                    '<td>' + (user.isActive !== false ? '<span class="status-active">✅ Active</span>' : '<span class="status-suspended">🚫 Suspended</span>') + '</td>' +
                  '</tr>';
                }).join('') +
              '</tbody>' +
            '</table>' +
          '</div>';
      })
      .catch(function(err) {
        tabContent.innerHTML = '<div class="error-state">⚠️ Error loading users: ' + err.message + '</div>';
      });
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
                '<span class="upload-icon">📷</span>' +
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
          '</div>' +
          
          // Options Section
          '<div class="form-section">' +
            '<div class="checkbox-group">' +
              '<label class="checkbox-label">' +
                '<input type="checkbox" name="featured">' +
                '<span class="checkmark"></span>' +
                '<span>⭐ Featured Project (show prominently on homepage)</span>' +
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
        tags: parseTags(form.tags.value)
      };
      
      adminApi.createProject(data)
        .then(function(result) {
          alert('✅ Project created and published successfully!');
          loadAdminTab(adminApi, api, 'all-projects');
          loadAdminAlerts(adminApi);
        })
        .catch(function(err) {
          alert('❌ Error: ' + err.message);
          submitBtn.disabled = false;
          submitBtn.textContent = 'Create & Publish Project';
        });
    });
  }
  
  // ========== ALL PROJECTS ==========
  else if (tab === 'all-projects') {
    // Don't pass status filter to get ALL projects
    adminApi.getProjects({})
      .then(function(result) {
        if (result.projects.length === 0) {
          tabContent.innerHTML = '<div class="empty-state">No projects yet. Create your first project!</div>';
          return;
        }

        // Keep a lookup map for edit actions
        window.__adminProjectsById = {};
        result.projects.forEach(function(p) {
          window.__adminProjectsById[p.id] = p;
        });
        
        tabContent.innerHTML = '<div class="projects-grid">' + 
          result.projects.map(function(project) {
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
            
            // Use imageUrl or fallback
            var imageUrl = project.imageUrl || project.image_url || project.dataUrl || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400';
            
            return '<div class="project-card-admin">' +
              '<div class="project-image" style="background-image: url(\'' + imageUrl + '\');">' +
                (project.featured ? '<span class="featured-badge">⭐ Featured</span>' : '') +
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
                  '<button class="btn btn-sm btn-outline edit-project-btn" data-id="' + project.id + '">✏️ Edit</button>' +
                  '<button class="btn btn-sm btn-outline toggle-status-btn" data-id="' + project.id + '" data-status="' + (project.status || 'active') + '">' +
                    ((project.status || 'active') === 'active' ? '🚫 Inactivate' : '✅ Activate') +
                  '</button>' +
                  '<button class="btn btn-sm btn-danger remove-project-btn" data-id="' + project.id + '">🗑 Remove</button>' +
                  (project.status === 'active' ? 
                    '<button class="btn btn-sm btn-outline distribute-btn" data-id="' + project.id + '">💰 Distribute</button>' : '') +
                  '<button class="btn btn-sm btn-outline post-update-btn" data-id="' + project.id + '" data-name="' + project.name + '">📢 Post Update</button>' +
                  '<button class="btn btn-sm ' + (project.featured ? 'btn-warning' : 'btn-outline') + ' toggle-featured-btn" data-id="' + project.id + '" data-featured="' + project.featured + '">' + 
                    (project.featured ? '⭐ Unfeature' : '☆ Feature') + 
                  '</button>' +
                '</div>' +
              '</div>' +
            '</div>';
          }).join('') + '</div>';
        
        attachProjectListHandlers(adminApi, api);
      })
      .catch(function(err) {
        tabContent.innerHTML = '<div class="error-state">⚠️ Error loading projects: ' + err.message + '</div>';
      });
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

  modal.innerHTML =
    '<div class="modal-content modal-lg">' +
      '<h2>Edit Project</h2>' +
      '<form id="edit-project-form">' +
        '<div class="form-section">' +
          '<h3>Image</h3>' +
          '<div class="image-upload-area" id="edit-image-upload-area">' +
            '<div id="edit-image-preview" class="image-preview' + (imageUrl ? ' has-image' : '') + '">' +
              (imageUrl ? ('<img src="' + imageUrl + '" alt="Preview">') : ('<span class="upload-icon">📷</span><p>Click to upload or drag & drop</p><span class="upload-hint">PNG, JPG up to 5MB</span>')) +
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
          '<div class="checkbox-group">' +
            '<label class="checkbox-label">' +
              '<input type="checkbox" name="featured"' + (project.featured ? ' checked' : '') + '>' +
              '<span>⭐ Featured</span>' +
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
            alert('✅ KYC approved!');
            loadAdminTab(adminApi, api, 'pending-kyc');
            loadAdminAlerts(adminApi);
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
        adminApi.verifyKyc(id, 'reject', reason)
          .then(function() {
            alert('✅ KYC rejected');
            loadAdminTab(adminApi, api, 'pending-kyc');
            loadAdminAlerts(adminApi);
          })
          .catch(function(err) {
            alert('❌ Error: ' + err.message);
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
  
  // Post Update handlers
  document.querySelectorAll('.post-update-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = this.getAttribute('data-id');
      var name = this.getAttribute('data-name');
      showPostUpdateModal(id, name, adminApi, api);
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

export { renderAdmin };
