// Projects Page
function renderProjects(container, api) {
  var html = 
    '<section>' +
      '<h2>Investment Projects</h2>' +
      '<p style="color: var(--text-muted); margin-bottom: 2rem;">Browse and invest in local businesses and projects</p>' +
      
      '<div class="filters" style="margin-bottom: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">' +
        '<select id="category-filter" class="btn btn-outline" style="padding: 0.5rem 1rem;">' +
          '<option value="">All Categories</option>' +
          '<option value="technology">Technology</option>' +
          '<option value="agriculture">Agriculture</option>' +
          '<option value="real-estate">Real Estate</option>' +
          '<option value="renewable-energy">Renewable Energy</option>' +
          '<option value="food-beverage">Food & Beverage</option>' +
          '<option value="retail">Retail</option>' +
        '</select>' +
        '<select id="sort-filter" class="btn btn-outline" style="padding: 0.5rem 1rem;">' +
          '<option value="newest">Newest First</option>' +
          '<option value="ending-soon">Ending Soon</option>' +
          '<option value="most-funded">Most Funded</option>' +
          '<option value="least-funded">Least Funded</option>' +
        '</select>' +
      '</div>' +
      
      '<div class="card-grid" id="projects-list">' +
        '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">Loading projects...</div>' +
      '</div>' +
    '</section>';
  
  container.innerHTML = html;
  loadProjects(api);
  
  document.getElementById('category-filter').addEventListener('change', function() { loadProjects(api); });
  document.getElementById('sort-filter').addEventListener('change', function() { loadProjects(api); });
}

function loadProjects(api) {
  var projectsList = document.getElementById('projects-list');
  var category = document.getElementById('category-filter').value;
  var sort = document.getElementById('sort-filter').value;
  
  projectsList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">Loading projects...</div>';
  
  api.getProjects({ category: category, sort: sort })
    .then(function(response) {
      var projects = response.projects || response;
      
      if (projects.length === 0) {
        projectsList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">No projects found.</div>';
        return;
      }
      
      projectsList.innerHTML = projects.map(function(project) {
        var goal = Number(project.goal_amount) || 0;
        var raised = Number(project.raised_amount) || 0;
        var percent = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
        var daysLeft = 30;

        var imageUrl = project.image_url || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800';
        
        return '<div class="card project-card">' +
          '<div class="project-image" style="height: 200px;">' +
            '<img src="' + imageUrl + '" alt="' + (project.name || 'Project') + '" loading="lazy" onerror="this.onerror=null;this.src=\'' + 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800' + '\'' + ';">' +
          '</div>' +
          '<div class="project-content" style="padding: 1.5rem;">' +
            '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">' +
              '<span class="badge">' + (project.category || 'General') + '</span>' +
              '<span style="color: var(--text-muted); font-size: 0.875rem;">' + daysLeft + ' days left</span>' +
            '</div>' +
            '<h3>' + project.name + '</h3>' +
            '<p style="color: var(--text-muted); margin-bottom: 1.5rem; line-height: 1.5;">' + (project.description || '') + '</p>' +
            '<div class="progress-bar" style="margin-bottom: 0.5rem;">' +
              '<div class="progress-fill" style="width: ' + percent + '%;"></div>' +
            '</div>' +
            '<div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem; font-size: 0.875rem;">' +
              '<span>$' + raised.toLocaleString() + ' raised</span>' +
              '<span>' + percent + '%</span>' +
            '</div>' +
            '<div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--border-color);">' +
              '<div>' +
                '<div style="font-size: 0.75rem; color: var(--text-muted);">Target Return</div>' +
                '<div style="font-weight: 600; color: var(--secondary-color);">' + (project.target_return || '10-15%') + '</div>' +
              '</div>' +
              '<button class="btn btn-primary invest-btn" data-id="' + project.id + '">Invest</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
      
      document.querySelectorAll('.invest-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var id = this.getAttribute('data-id');
          showInvestModal(id, api);
        });
      });
    })
    .catch(function(err) {
      projectsList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #ef4444;">Error loading projects: ' + err.message + '</div>';
    });
}

function showInvestModal(projectId, api) {
  if (!api.token) {
    alert('Please login to invest');
    return;
  }
  
  var modal = document.createElement('div');
  modal.className = 'modal active';
  
  modal.innerHTML = 
    '<div class="modal-content">' +
      '<h2>Invest in Project</h2>' +
      '<form id="invest-form">' +
        '<div class="form-group">' +
          '<label for="amount">Investment Amount ($)</label>' +
          '<input type="number" id="amount" min="100" step="100" required>' +
          '<small style="color: var(--text-muted);">Minimum investment: $100</small>' +
        '</div>' +
        '<div class="form-actions">' +
          '<button type="button" class="btn btn-outline" id="close-invest-modal">Cancel</button>' +
          '<button type="submit" class="btn btn-primary">Confirm Investment</button>' +
        '</div>' +
      '</form>' +
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
        loadProjects(api);
      })
      .catch(function(err) {
        alert('Investment failed: ' + err.message);
      });
  });
}

export { renderProjects };
