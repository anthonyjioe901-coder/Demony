// Business Owner Dashboard Page
function renderBusinessDashboard(container, api) {
  var user = api.user;
  if (!user || user.role !== 'business_owner') {
    container.innerHTML = '<section><h2>Access Denied</h2><p>Business owner account required.</p></section>';
    return;
  }
  
  var html = 
    '<section>' +
      '<h2>Business Dashboard</h2>' +
      '<p style="color: var(--text-muted); margin-bottom: 2rem;">Manage your projects and track funding</p>' +
      
      // KYC Warning if not verified
      '<div id="kyc-warning"></div>' +
      
      // Action buttons
      '<div style="margin-bottom: 2rem;">' +
        '<button class="btn btn-primary" id="submit-project-btn">+ Submit New Project</button>' +
      '</div>' +
      
      // My Projects
      '<h3 style="margin-bottom: 1rem;">My Projects</h3>' +
      '<div id="my-projects">' +
        '<div style="text-align: center; padding: 2rem;">Loading your projects...</div>' +
      '</div>' +
    '</section>';
  
  container.innerHTML = html;
  
  // Check KYC status
  api.getMe().then(function(profile) {
    if (!profile.isVerified) {
      document.getElementById('kyc-warning').innerHTML = 
        '<div class="card" style="padding: 1.5rem; margin-bottom: 2rem; border-left: 4px solid #f59e0b; background: rgba(245, 158, 11, 0.1);">' +
          '<h3 style="color: #f59e0b; margin-bottom: 0.5rem;">⚠️ KYC Verification Required</h3>' +
          '<p>Please complete KYC verification before submitting projects.</p>' +
          '<button class="btn btn-primary" id="start-kyc-btn" style="margin-top: 1rem;">Complete KYC</button>' +
        '</div>';
      
      document.getElementById('start-kyc-btn').addEventListener('click', function() {
        showKycModal(api);
      });
    }
  });
  
  // Load projects
  loadMyProjects(api);
  
  // Submit project button
  document.getElementById('submit-project-btn').addEventListener('click', function() {
    showSubmitProjectModal(api);
  });
}

function loadMyProjects(api) {
  var projectsContainer = document.getElementById('my-projects');
  
  api.getMyProjects()
    .then(function(result) {
      var projects = result.projects;
      
      if (projects.length === 0) {
        projectsContainer.innerHTML = 
          '<div class="card" style="padding: 2rem; text-align: center;">' +
            '<p>You haven\'t submitted any projects yet.</p>' +
            '<p style="color: var(--text-muted); margin-top: 0.5rem;">Click "Submit New Project" to get started.</p>' +
          '</div>';
        return;
      }
      
      projectsContainer.innerHTML = projects.map(function(project) {
        var statusColors = {
          'pending_review': '#f59e0b',
          'changes_requested': '#ef4444',
          'active': '#10b981',
          'funded': '#3b82f6',
          'completed': '#6b7280',
          'rejected': '#ef4444'
        };
        
        var percent = project.goal_amount > 0 ? Math.round((project.raised_amount / project.goal_amount) * 100) : 0;
        
        return '<div class="card" style="padding: 1.5rem; margin-bottom: 1rem;">' +
          '<div style="display: flex; justify-content: space-between; align-items: flex-start;">' +
            '<div style="flex: 1;">' +
              '<div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">' +
                '<h3>' + project.name + '</h3>' +
                '<span class="badge" style="background: ' + (statusColors[project.status] || '#6b7280') + ';">' + 
                  project.status.replace('_', ' ').toUpperCase() + 
                '</span>' +
              '</div>' +
              '<p style="color: var(--text-muted); margin-bottom: 1rem;">' + project.description.substring(0, 150) + '...</p>' +
              
              (project.status === 'active' || project.status === 'funded' ? 
                '<div style="margin-bottom: 1rem;">' +
                  '<div class="progress-bar" style="margin-bottom: 0.5rem;">' +
                    '<div class="progress-fill" style="width: ' + percent + '%;"></div>' +
                  '</div>' +
                  '<div style="display: flex; justify-content: space-between; font-size: 0.875rem;">' +
                    '<span>$' + project.raised_amount.toLocaleString() + ' raised</span>' +
                    '<span>' + percent + '% of $' + project.goal_amount.toLocaleString() + '</span>' +
                  '</div>' +
                '</div>' : '') +
              
              (project.status === 'changes_requested' ? 
                '<div style="padding: 1rem; background: rgba(239, 68, 68, 0.1); border-radius: 0.5rem; margin-bottom: 1rem;">' +
                  '<strong>Changes Requested:</strong>' +
                  '<p style="margin-top: 0.5rem; color: var(--text-muted);">Please update your project and resubmit.</p>' +
                '</div>' : '') +
            '</div>' +
            
            (project.status === 'pending_review' || project.status === 'changes_requested' ? 
              '<button class="btn btn-outline edit-project-btn" data-id="' + project.id + '">Edit</button>' : '') +
          '</div>' +
        '</div>';
      }).join('');
      
      // Edit buttons
      document.querySelectorAll('.edit-project-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var id = this.getAttribute('data-id');
          var project = projects.find(function(p) { return p.id === id; });
          showSubmitProjectModal(api, project);
        });
      });
    })
    .catch(function(err) {
      projectsContainer.innerHTML = '<div style="color: #ef4444;">Error loading projects: ' + err.message + '</div>';
    });
}

function showSubmitProjectModal(api, existingProject) {
  var isEdit = !!existingProject;
  var modal = document.createElement('div');
  modal.className = 'modal active';
  
  modal.innerHTML = 
    '<div class="modal-content" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">' +
      '<h2>' + (isEdit ? 'Edit Project' : 'Submit New Project') + '</h2>' +
      '<form id="project-form">' +
        '<div class="form-group">' +
          '<label for="project-name">Project Name *</label>' +
          '<input type="text" id="project-name" required value="' + (isEdit ? existingProject.name : '') + '">' +
        '</div>' +
        
        '<div class="form-group">' +
          '<label for="project-description">Description *</label>' +
          '<textarea id="project-description" rows="4" required>' + (isEdit ? existingProject.description : '') + '</textarea>' +
        '</div>' +
        
        '<div class="form-group">' +
          '<label for="project-category">Category *</label>' +
          '<select id="project-category" required>' +
            '<option value="">Select category</option>' +
            '<option value="technology"' + (isEdit && existingProject.category === 'technology' ? ' selected' : '') + '>Technology</option>' +
            '<option value="agriculture"' + (isEdit && existingProject.category === 'agriculture' ? ' selected' : '') + '>Agriculture</option>' +
            '<option value="real-estate"' + (isEdit && existingProject.category === 'real-estate' ? ' selected' : '') + '>Real Estate</option>' +
            '<option value="renewable-energy"' + (isEdit && existingProject.category === 'renewable-energy' ? ' selected' : '') + '>Renewable Energy</option>' +
            '<option value="food-beverage"' + (isEdit && existingProject.category === 'food-beverage' ? ' selected' : '') + '>Food & Beverage</option>' +
            '<option value="retail"' + (isEdit && existingProject.category === 'retail' ? ' selected' : '') + '>Retail</option>' +
            '<option value="manufacturing"' + (isEdit && existingProject.category === 'manufacturing' ? ' selected' : '') + '>Manufacturing</option>' +
            '<option value="services"' + (isEdit && existingProject.category === 'services' ? ' selected' : '') + '>Services</option>' +
          '</select>' +
        '</div>' +
        
        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">' +
          '<div class="form-group">' +
            '<label for="goal-amount">Funding Goal ($) *</label>' +
            '<input type="number" id="goal-amount" min="1000" step="100" required value="' + (isEdit ? existingProject.goal_amount : '') + '">' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="min-investment">Min Investment ($)</label>' +
            '<input type="number" id="min-investment" min="100" step="50" value="' + (isEdit ? existingProject.min_investment : '100') + '">' +
          '</div>' +
        '</div>' +
        
        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">' +
          '<div class="form-group">' +
            '<label for="target-return">Target Return (%)</label>' +
            '<input type="text" id="target-return" placeholder="e.g., 10-15%" value="' + (isEdit ? existingProject.target_return : '10-15%') + '">' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="duration">Duration (months)</label>' +
            '<input type="number" id="duration" min="1" max="60" value="' + (isEdit ? existingProject.duration || 12 : '12') + '">' +
          '</div>' +
        '</div>' +
        
        '<div class="form-group">' +
          '<label for="risk-level">Risk Level</label>' +
          '<select id="risk-level">' +
            '<option value="low"' + (isEdit && existingProject.risk_level === 'low' ? ' selected' : '') + '>Low</option>' +
            '<option value="medium"' + (!isEdit || existingProject.risk_level === 'medium' ? ' selected' : '') + '>Medium</option>' +
            '<option value="high"' + (isEdit && existingProject.risk_level === 'high' ? ' selected' : '') + '>High</option>' +
          '</select>' +
        '</div>' +
        
        '<div class="form-group">' +
          '<label for="business-plan">Business Plan *</label>' +
          '<textarea id="business-plan" rows="6" required placeholder="Describe your business model, market opportunity, use of funds, etc.">' + 
            (isEdit && existingProject.businessPlan ? existingProject.businessPlan : '') + 
          '</textarea>' +
        '</div>' +
        
        '<div class="form-group">' +
          '<label for="financial-projections">Financial Projections</label>' +
          '<textarea id="financial-projections" rows="4" placeholder="Revenue projections, expected ROI, break-even timeline...">' +
            (isEdit && existingProject.financialProjections ? existingProject.financialProjections : '') +
          '</textarea>' +
        '</div>' +
        
        '<div class="form-actions">' +
          '<button type="button" class="btn btn-outline" id="close-project-modal">Cancel</button>' +
          '<button type="submit" class="btn btn-primary">' + (isEdit ? 'Update & Resubmit' : 'Submit for Review') + '</button>' +
        '</div>' +
      '</form>' +
    '</div>';
  
  document.body.appendChild(modal);
  
  document.getElementById('close-project-modal').addEventListener('click', function() {
    modal.remove();
  });
  
  document.getElementById('project-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    var projectData = {
      name: document.getElementById('project-name').value,
      description: document.getElementById('project-description').value,
      category: document.getElementById('project-category').value,
      goalAmount: parseFloat(document.getElementById('goal-amount').value),
      minInvestment: parseFloat(document.getElementById('min-investment').value) || 100,
      targetReturn: document.getElementById('target-return').value,
      duration: parseInt(document.getElementById('duration').value) || 12,
      riskLevel: document.getElementById('risk-level').value,
      businessPlan: document.getElementById('business-plan').value,
      financialProjections: document.getElementById('financial-projections').value
    };
    
    var promise = isEdit 
      ? api.updateMyProject(existingProject.id, projectData)
      : api.submitProject(projectData);
    
    promise
      .then(function() {
        alert(isEdit ? 'Project updated and resubmitted!' : 'Project submitted for review!');
        modal.remove();
        loadMyProjects(api);
      })
      .catch(function(err) {
        alert('Error: ' + err.message);
      });
  });
}

function showKycModal(api) {
  var modal = document.createElement('div');
  modal.className = 'modal active';
  
  modal.innerHTML = 
    '<div class="modal-content">' +
      '<h2>KYC Verification</h2>' +
      '<p style="color: var(--text-muted); margin-bottom: 1.5rem;">Upload your ID document and a selfie for verification.</p>' +
      '<form id="kyc-form">' +
        '<div class="form-group">' +
          '<label for="id-document">ID Document (Passport, Driver License, National ID)</label>' +
          '<input type="file" id="id-document" accept="image/*" required>' +
        '</div>' +
        '<div class="form-group">' +
          '<label for="selfie">Selfie (holding your ID)</label>' +
          '<input type="file" id="selfie" accept="image/*" required>' +
        '</div>' +
        '<div class="form-actions">' +
          '<button type="button" class="btn btn-outline" id="close-kyc-modal">Cancel</button>' +
          '<button type="submit" class="btn btn-primary">Submit KYC</button>' +
        '</div>' +
      '</form>' +
    '</div>';
  
  document.body.appendChild(modal);
  
  document.getElementById('close-kyc-modal').addEventListener('click', function() {
    modal.remove();
  });
  
  document.getElementById('kyc-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    var idFile = document.getElementById('id-document').files[0];
    var selfieFile = document.getElementById('selfie').files[0];
    
    // Convert to base64
    Promise.all([
      fileToBase64(idFile),
      fileToBase64(selfieFile)
    ]).then(function(results) {
      return api.submitKyc({
        idDocument: results[0],
        selfie: results[1]
      });
    }).then(function() {
      alert('KYC documents submitted! You will be notified once verified.');
      modal.remove();
      // Refresh the page
      location.reload();
    }).catch(function(err) {
      alert('Error: ' + err.message);
    });
  });
}

function fileToBase64(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function() { resolve(reader.result); };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export { renderBusinessDashboard };
