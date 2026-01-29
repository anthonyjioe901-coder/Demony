// Home Page
function renderHome(container, api) {
  // SVG Icons
  const icons = {
    money: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-secondary"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
    users: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    chart: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-secondary"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
    trend: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>',
    target: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',
    phone: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>',
    referral: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>'
  };

  var html =
    '<section class="hero" style="text-align: center; padding: 2.5rem 1.5rem; background: var(--surface-elevated); border: 1px solid var(--border-color); border-radius: 16px; margin-bottom: 2rem;">' +
      '<h2 style="font-size: 1.9rem; font-weight: 800; margin-bottom: 0.75rem; line-height: 1.2;">Invest locally from GH₵20</h2>' +
      '<p style="font-size: 1rem; color: var(--text-muted); margin-bottom: 1.5rem; max-width: 540px; margin-left: auto; margin-right: auto;">Pick a project, invest in minutes, and track your returns from one clean dashboard.</p>' +
      '<div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">' +
        '<button class="btn btn-primary" id="explore-btn" style="min-width: 150px;">Start investing</button>' +
        '<button class="btn btn-outline" id="browse-btn" style="min-width: 150px;">See projects</button>' +
      '</div>' +
    '</section>' +

    '<section style="margin-bottom: 2rem; display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">' +
      '<div class="card" style="padding: 1rem; border-radius: 12px;">' +
        '<h3 style="margin: 0 0 0.5rem 0; font-size: 1rem;">Quick start</h3>' +
        '<p style="margin: 0; color: var(--text-muted);">Create an account and invest from GH₵20.</p>' +
      '</div>' +
      '<div class="card" style="padding: 1rem; border-radius: 12px;">' +
        '<h3 style="margin: 0 0 0.5rem 0; font-size: 1rem;">Transparent returns</h3>' +
        '<p style="margin: 0; color: var(--text-muted);">See projected profits before you confirm.</p>' +
      '</div>' +
      '<div class="card" style="padding: 1rem; border-radius: 12px;">' +
        '<h3 style="margin: 0 0 0.5rem 0; font-size: 1rem;">Cash out profits</h3>' +
        '<p style="margin: 0; color: var(--text-muted);">Withdraw earnings whenever they are available.</p>' +
      '</div>' +
    '</section>' +

    '<section style="margin-bottom: 2rem;">' +
      '<h2 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 0.75rem;">How it works</h2>' +
      '<ol style="padding-left: 1.25rem; color: var(--text-muted); line-height: 1.6; margin: 0; display: grid; gap: 0.5rem;">' +
        '<li>Pick a project that matches your goals.</li>' +
        '<li>Enter your amount and confirm the investment.</li>' +
        '<li>Track performance and withdraw profits when available.</li>' +
      '</ol>' +
    '</section>' +

    '<section style="margin-bottom: 2rem;">' +
      '<div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">' +
        '<h2 style="font-size: 1.3rem; font-weight: 800; margin: 0;">Projects open now</h2>' +
        '<a href="#projects" data-page="projects" style="font-size: 0.95rem; color: var(--primary);">View all</a>' +
      '</div>' +
      '<div id="featured-projects">' +
        '<div style="text-align: center; padding: 1.5rem; color: var(--text-muted);">Loading projects...</div>' +
      '</div>' +
    '</section>' +

    '<section style="margin-bottom: 1rem;">' +
      '<div class="card" style="padding: 1rem; border-radius: 12px;">' +
        '<h3 style="margin: 0 0 0.5rem 0; font-size: 1rem;">Need help?</h3>' +
        '<p style="margin: 0; color: var(--text-muted);">Check the Support page or chat with us in-app.</p>' +
      '</div>' +
    '</section>';
  
  container.innerHTML = html;
  
  // Button event listeners
  document.getElementById('explore-btn').addEventListener('click', function() {
    window.DemonyApp.router.navigate('projects');
  });
  
  document.getElementById('browse-btn').addEventListener('click', function() {
    window.DemonyApp.router.navigate('projects');
  });
  
  // FAQ interactivity
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function(item) {
    var question = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');
    var toggleSpan = question.querySelector('span');
    
    question.addEventListener('click', function() {
      var isOpen = answer.style.display !== 'none';
      answer.style.display = isOpen ? 'none' : 'block';
      toggleSpan.textContent = isOpen ? '+' : '−';
      item.style.background = isOpen ? 'var(--surface-elevated)' : 'rgba(99, 102, 241, 0.05)';
    });
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
        return '<div class="project-item" style="display: grid; grid-template-columns: 1fr auto; gap: 0.5rem; padding: 0.9rem; background: var(--surface-elevated); border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 0.65rem; cursor: pointer;" onclick="window.DemonyApp.router.navigate(\'projects\')">' +
          '<div style="display: grid; gap: 0.25rem;">' +
            '<div style="font-weight: 700; font-size: 1rem;">' + project.name + '</div>' +
            '<div style="color: var(--text-muted); font-size: 0.9rem;">' + (project.category || 'General') + '</div>' +
            '<div style="color: var(--text-muted); font-size: 0.85rem;">Min: GH₵' + (project.min_investment || 20) + '</div>' +
          '</div>' +
          '<div style="text-align: right; align-self: center;">' +
            '<div style="font-weight: 800; font-size: 0.95rem;">' + percent + '% funded</div>' +
            '<div style="color: var(--text-muted); font-size: 0.85rem;">GH₵' + parseFloat(project.raised_amount || 0).toLocaleString() + '</div>' +
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
