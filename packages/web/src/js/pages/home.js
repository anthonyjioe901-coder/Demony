// Home Page
function renderHome(container, api) {
  var html = 
    '<section class="hero">' +
      '<h2>Invest in Local Businesses</h2>' +
      '<p>Discover and invest in promising local projects and companies. Build your portfolio while supporting your community.</p>' +
      '<button class="btn btn-primary" id="explore-btn">Explore Projects</button>' +
    '</section>' +
    
    '<section class="stats-section">' +
      '<div class="card-grid">' +
        '<div class="card">' +
          '<h3>$2.5M+</h3>' +
          '<p>Total Invested</p>' +
        '</div>' +
        '<div class="card">' +
          '<h3>150+</h3>' +
          '<p>Active Projects</p>' +
        '</div>' +
        '<div class="card">' +
          '<h3>5,000+</h3>' +
          '<p>Investors</p>' +
        '</div>' +
        '<div class="card">' +
          '<h3>12%</h3>' +
          '<p>Avg. Returns</p>' +
        '</div>' +
      '</div>' +
    '</section>' +
    
    '<section class="featured-section" style="margin-top: 3rem;">' +
      '<h2>Featured Projects</h2>' +
      '<div class="card-grid" id="featured-projects">' +
        '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">Loading featured projects...</div>' +
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
        featuredList.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">No projects found.</div>';
        return;
      }
      
      featuredList.innerHTML = projects.slice(0, 3).map(function(project) {
        var percent = Math.round((project.raised_amount / project.goal_amount) * 100);
        var daysLeft = 30;
        
        return '<div class="card project-card">' +
          '<div class="project-image" style="height: 150px; background: #1e293b; display: flex; align-items: center; justify-content: center; font-size: 2.5rem;">' +
            (project.image_url || '🏢') +
          '</div>' +
          '<div class="project-content" style="padding: 1.5rem;">' +
            '<h3>' + project.name + '</h3>' +
            '<span class="badge">' + (project.category || 'General') + '</span>' +
            '<p class="description" style="margin: 1rem 0; color: var(--text-muted);">' + (project.description || '').substring(0, 100) + '...</p>' +
            
            '<div class="progress-bar" style="margin-bottom: 0.5rem;">' +
              '<div class="progress-fill" style="width: ' + percent + '%;"></div>' +
            '</div>' +
            '<div class="stats" style="display: flex; justify-content: space-between; font-size: 0.875rem;">' +
              '<span>$' + parseFloat(project.raised_amount).toLocaleString() + ' / $' + parseFloat(project.goal_amount).toLocaleString() + '</span>' +
              '<span>' + daysLeft + ' days left</span>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    })
    .catch(function(err) {
      console.error(err);
      document.getElementById('featured-projects').innerHTML = 'Error loading projects.';
    });
}

export { renderHome };
