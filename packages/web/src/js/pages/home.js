// Home Page
function renderHome(container, api) {
  var html = 
    '<section class="hero">' +
      '<h2>Invest in Local Businesses</h2>' +
      '<p>Discover and invest in promising local projects and companies. Build your portfolio while supporting your community.</p>' +
      '<button class="btn btn-primary" id="explore-btn">Explore Projects</button>' +
    '</section>' +
    
    '<section>' +
      '<div class="stats-grid">' +
        '<div class="card stat-card">' +
          '<div class="value" style="color: var(--secondary-color);">$2.5M+</div>' +
          '<div class="label">Total Invested</div>' +
        '</div>' +
        '<div class="card stat-card">' +
          '<div class="value" style="color: var(--primary-color);">150+</div>' +
          '<div class="label">Active Projects</div>' +
        '</div>' +
        '<div class="card stat-card">' +
          '<div class="value">5,000+</div>' +
          '<div class="label">Investors</div>' +
        '</div>' +
        '<div class="card stat-card">' +
          '<div class="value" style="color: var(--secondary-color);">12%</div>' +
          '<div class="label">Avg. Returns</div>' +
        '</div>' +
      '</div>' +
    '</section>' +
    
    '<section style="margin-top: 2rem;">' +
      '<div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">' +
        '<div>' +
          '<h2 style="font-size: 1.25rem;">Featured Projects</h2>' +
          '<p>Top investment opportunities</p>' +
        '</div>' +
      '</div>' +
      '<div id="featured-projects">' +
        '<div style="text-align: center; padding: 2rem; color: var(--text-muted);">Loading projects...</div>' +
      '</div>' +
    '</section>';
  
  container.innerHTML = html;
  
  document.getElementById('explore-btn').addEventListener('click', function() {
    window.DemonyApp.router.navigate('projects');
  });
  
  // Load featured projects
  api.getProjects({ sort: 'most-funded' })
    .then(function(response) {
      var projects = response.projects || response;
      var featuredList = document.getElementById('featured-projects');
      
      if (projects.length === 0) {
        featuredList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-muted);">No projects found.</div>';
        return;
      }
      
      featuredList.innerHTML = projects.slice(0, 3).map(function(project) {
        var percent = Math.round((project.raised_amount / project.goal_amount) * 100);
        var categoryIcons = {
          'tech': '💻', 'technology': '💻',
          'agriculture': '🌾', 'agric': '🌾',
          'real estate': '🏢', 'realestate': '🏢',
          'retail': '🛒',
          'manufacturing': '🏭',
          'healthcare': '🏥',
          'education': '📚',
          'finance': '💰',
          'energy': '⚡',
          'default': '🏢'
        };
        var icon = categoryIcons[(project.category || '').toLowerCase()] || categoryIcons.default;
        
        return '<div class="project-item" style="display: flex; align-items: center; padding: 1rem; background: var(--surface-elevated); border-radius: 14px; border: 1px solid var(--border-color); margin-bottom: 0.75rem; cursor: pointer;" onclick="window.DemonyApp.router.navigate(\'projects\')">' +
          '<div class="icon" style="width: 48px; height: 48px; border-radius: 14px; background: rgba(99, 102, 241, 0.15); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; margin-right: 0.85rem;">' +
            icon +
          '</div>' +
          '<div class="info" style="flex: 1; min-width: 0;">' +
            '<div class="name" style="font-weight: 700; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + project.name + '</div>' +
            '<div class="category" style="color: var(--text-muted); font-size: 0.75rem;">' + (project.category || 'General') + '</div>' +
          '</div>' +
          '<div class="progress" style="text-align: right; min-width: 80px;">' +
            '<div class="amount" style="font-weight: 800; font-size: 0.9rem;">$' + parseFloat(project.raised_amount || 0).toLocaleString() + '</div>' +
            '<div class="percent" style="color: var(--text-muted); font-size: 0.7rem;">' + percent + '% funded</div>' +
          '</div>' +
        '</div>';
      }).join('');
    })
    .catch(function(err) {
      console.error(err);
      document.getElementById('featured-projects').innerHTML = '<div style="text-align: center; padding: 2rem; color: #ef4444;">Error loading projects.</div>';
    });
}

export { renderHome };
