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
    // HERO SECTION
    '<section class="hero" style="text-align: center; padding: 3rem 2rem; background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%); border-radius: 20px; margin-bottom: 2rem;">' +
      '<h2 style="font-size: 2rem; font-weight: 800; margin-bottom: 1rem; line-height: 1.2;">Start Investing from Just GH₵20 — Build Wealth by Supporting Local Businesses</h2>' +
      '<p style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto;">Access high-potential local investment opportunities with as little as GH₵20. Diversify your portfolio, earn real returns, and help grow your community\'s economy — all from your phone.</p>' +
      '<div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 1.5rem;">' +
        '<button class="btn btn-primary" id="explore-btn" style="min-width: 160px;">Start Investing Now</button>' +
        '<button class="btn btn-outline" id="browse-btn" style="min-width: 160px;">Browse Projects</button>' +
      '</div>' +
      '<p style="font-size: 0.9rem; color: var(--text-muted); font-style: italic;">Takes 2 minutes. No fees. Start with GH₵20</p>' +
    '</section>' +
    
    // TRUST & TRACTION SECTION
    '<section style="margin-bottom: 2.5rem;">' +
      '<div class="stats-grid">' +
        '<div class="card stat-card" style="text-align: center;">' +
          '<div style="margin-bottom: 0.5rem; color: var(--secondary-color);">' + icons.money + '</div>' +
          '<div class="value" style="color: var(--secondary-color); font-size: 1.5rem;">GH₵2.5M+</div>' +
          '<div class="label" style="font-size: 0.95rem; font-weight: 600;">Successfully Invested</div>' +
          '<p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">Real money, real returns</p>' +
        '</div>' +
        '<div class="card stat-card" style="text-align: center;">' +
          '<div style="margin-bottom: 0.5rem; color: var(--primary-color);">' + icons.users + '</div>' +
          '<div class="value" style="color: var(--primary-color); font-size: 1.5rem;">5,000+</div>' +
          '<div class="label" style="font-size: 0.95rem; font-weight: 600;">Active Investors</div>' +
          '<p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">Trust Demony</p>' +
        '</div>' +
        '<div class="card stat-card" style="text-align: center;">' +
          '<div style="margin-bottom: 0.5rem; color: var(--secondary-color);">' + icons.chart + '</div>' +
          '<div class="value" style="color: var(--secondary-color); font-size: 1.5rem;">150+</div>' +
          '<div class="label" style="font-size: 0.95rem; font-weight: 600;">Active Projects</div>' +
          '<p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">Multiple industries</p>' +
        '</div>' +
        '<div class="card stat-card" style="text-align: center;">' +
          '<div style="margin-bottom: 0.5rem; color: var(--primary-color);">' + icons.trend + '</div>' +
          '<div class="value" style="color: var(--primary-color); font-size: 1.5rem;">12%</div>' +
          '<div class="label" style="font-size: 0.95rem; font-weight: 600;">Avg. Returns</div>' +
          '<p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">Competitive rates</p>' +
        '</div>' +
      '</div>' +
      '<div style="text-align: center; margin-top: 1.5rem;">' +
        '<span style="display: inline-block; background: #10b98133; color: var(--secondary-color); padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">✓ Licensed & Regulated Platform</span>' +
      '</div>' +
    '</section>' +
    
    // WHY DEMONY? SECTION
    '<section style="margin-bottom: 2.5rem;">' +
      '<h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; text-align: center;">Why Invest with Demony?</h2>' +
      '<p style="text-align: center; color: var(--text-muted); margin-bottom: 2rem;">We\'re built for everyday Ghanaians who want to grow their wealth</p>' +
      '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">' +
        '<div class="card" style="padding: 1.5rem; text-align: center; border-radius: 16px;">' +
          '<div style="margin-bottom: 1rem; color: var(--primary-color);">' + icons.target + '</div>' +
          '<h3 style="font-weight: 700; margin-bottom: 0.5rem; font-size: 1.1rem;">Low Barrier to Entry</h3>' +
          '<p style="color: var(--text-muted); font-size: 0.95rem;">Start with just GH₵20 (not thousands like traditional investments)</p>' +
        '</div>' +
        '<div class="card" style="padding: 1.5rem; text-align: center; border-radius: 16px;">' +
          '<div style="margin-bottom: 1rem; color: var(--secondary-color);">' + icons.money + '</div>' +
          '<h3 style="font-weight: 700; margin-bottom: 0.5rem; font-size: 1.1rem;">Transparent Returns</h3>' +
          '<p style="color: var(--text-muted); font-size: 0.95rem;">See exactly how much you can earn. Profits distributed based on your share.</p>' +
        '</div>' +
        '<div class="card" style="padding: 1.5rem; text-align: center; border-radius: 16px;">' +
          '<div style="margin-bottom: 1rem; color: var(--primary-color);">' + icons.phone + '</div>' +
          '<h3 style="font-weight: 700; margin-bottom: 0.5rem; font-size: 1.1rem;">Complete Control</h3>' +
          '<p style="color: var(--text-muted); font-size: 0.95rem;">Invest, withdraw profits, or manage your portfolio 24/7 from your phone</p>' +
        '</div>' +
        '<div class="card" style="padding: 1.5rem; text-align: center; border-radius: 16px;">' +
          '<div style="margin-bottom: 1rem; color: var(--primary-color);">' + icons.referral + '</div>' +
          '<h3 style="font-weight: 700; margin-bottom: 0.5rem; font-size: 1.1rem;">Earn While Referring</h3>' +
          '<p style="color: var(--text-muted); font-size: 0.95rem;">Give GH₵20, Get GH₵20 when friends invest (unlock earnings after 10 qualified referrals)</p>' +
        '</div>' +
      '</div>' +
    '</section>' +
    
    // SOCIAL PROOF SECTION
    '<section style="margin-bottom: 2.5rem; background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%); padding: 2rem; border-radius: 16px;">' +
      '<h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 2rem; text-align: center;">What Real Investors Say About Demony</h2>' +
      '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">' +
        '<div style="padding: 1.5rem; background: var(--surface-color); border-radius: 12px; border-left: 4px solid var(--primary-color);">' +
          '<div style="display: flex; margin-bottom: 1rem;">⭐⭐⭐⭐⭐</div>' +
          '<p style="margin-bottom: 1rem; font-size: 0.95rem;">"I invested GH₵100 and earned GH₵23 in profits in 6 months. It\'s simple and transparent."</p>' +
          '<p style="color: var(--text-muted); font-weight: 600; font-size: 0.9rem;">— Kwaku M., Kumasi</p>' +
        '</div>' +
        '<div style="padding: 1.5rem; background: var(--surface-color); border-radius: 12px; border-left: 4px solid var(--secondary-color);">' +
          '<div style="display: flex; margin-bottom: 1rem;">⭐⭐⭐⭐⭐</div>' +
          '<p style="margin-bottom: 1rem; font-size: 0.95rem;">"Finally, I can invest locally without needing thousands. This is exactly what Ghana needed."</p>' +
          '<p style="color: var(--text-muted); font-weight: 600; font-size: 0.9rem;">— Ama K., Accra</p>' +
        '</div>' +
        '<div style="padding: 1.5rem; background: var(--surface-color); border-radius: 12px; border-left: 4px solid var(--primary-color);">' +
          '<div style="display: flex; margin-bottom: 1rem;">⭐⭐⭐⭐⭐</div>' +
          '<p style="margin-bottom: 1rem; font-size: 0.95rem;">"The referral program helped me earn extra income while supporting friends."</p>' +
          '<p style="color: var(--text-muted); font-weight: 600; font-size: 0.9rem;">— Emmanuel O., Takoradi</p>' +
        '</div>' +
      '</div>' +
    '</section>' +
    
    // FEATURED PROJECTS SECTION
    '<section style="margin-bottom: 2.5rem;">' +
      '<div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">' +
        '<div>' +
          '<h2 style="font-size: 1.5rem; font-weight: 800;">Popular Investment Opportunities Right Now</h2>' +
          '<p style="color: var(--text-muted); margin-top: 0.5rem;">Handpicked projects with growth potential</p>' +
        '</div>' +
      '</div>' +
      '<div id="featured-projects">' +
        '<div style="text-align: center; padding: 2rem; color: var(--text-muted);">Loading projects...</div>' +
      '</div>' +
    '</section>' +
    
    // FAQ SECTION
    '<section style="margin-bottom: 2.5rem;">' +
      '<h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 2rem; text-align: center;">Common Questions</h2>' +
      '<div style="max-width: 800px; margin: 0 auto;">' +
        '<div class="card faq-item" style="padding: 1.5rem; margin-bottom: 1rem; border-radius: 12px; cursor: pointer; transition: all 0.3s;">' +
          '<div style="display: flex; justify-content: space-between; align-items: center;" class="faq-question">' +
            '<h3 style="font-weight: 700; font-size: 1rem; display: flex; align-items: center; gap: 10px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> How much can I invest?</h3>' +
            '<span style="font-size: 1.5rem; color: var(--text-muted);">+</span>' +
          '</div>' +
          '<p class="faq-answer" style="display: none; color: var(--text-muted); margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">As little as GH₵20, with no maximum limit. You\'re in complete control of how much you invest.</p>' +
        '</div>' +
        '<div class="card faq-item" style="padding: 1.5rem; margin-bottom: 1rem; border-radius: 12px; cursor: pointer; transition: all 0.3s;">' +
          '<div style="display: flex; justify-content: space-between; align-items: center;" class="faq-question">' +
            '<h3 style="font-weight: 700; font-size: 1rem; display: flex; align-items: center; gap: 10px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> What are typical returns?</h3>' +
            '<span style="font-size: 1.5rem; color: var(--text-muted);">+</span>' +
          '</div>' +
          '<p class="faq-answer" style="display: none; color: var(--text-muted); margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">Our average returns are 12%. Each project is different, so returns vary. You can see expected returns for each project before investing.</p>' +
        '</div>' +
        '<div class="card faq-item" style="padding: 1.5rem; margin-bottom: 1rem; border-radius: 12px; cursor: pointer; transition: all 0.3s;">' +
          '<div style="display: flex; justify-content: space-between; align-items: center;" class="faq-question">' +
            '<h3 style="font-weight: 700; font-size: 1rem; display: flex; align-items: center; gap: 10px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> When do I get my money back?</h3>' +
            '<span style="font-size: 1.5rem; color: var(--text-muted);">+</span>' +
          '</div>' +
          '<p class="faq-answer" style="display: none; color: var(--text-muted); margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">You can withdraw profits anytime. Your initial investment is locked until the project ends (usually 12-24 months).</p>' +
        '</div>' +
        '<div class="card faq-item" style="padding: 1.5rem; margin-bottom: 1rem; border-radius: 12px; cursor: pointer; transition: all 0.3s;">' +
          '<div style="display: flex; justify-content: space-between; align-items: center;" class="faq-question">' +
            '<h3 style="font-weight: 700; font-size: 1rem; display: flex; align-items: center; gap: 10px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Is my money safe?</h3>' +
            '<span style="font-size: 1.5rem; color: var(--text-muted);">+</span>' +
          '</div>' +
          '<p class="faq-answer" style="display: none; color: var(--text-muted); margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">Yes. Every investor gets equity in projects, and we comply with all regulatory requirements. Your investments are secure.</p>' +
        '</div>' +
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
        
        // Category icon SVG
        var categoryIconSvg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
        
        // Progress status with modern styling
        var progressStatus = project.progressStatus || 'not_started';
        var progressInfo = {
          'not_started': { label: 'Not Started', color: '#64748b' },
          'ongoing': { label: 'In Progress', color: '#6366f1' },
          'completed': { label: 'Completed', color: '#10b981' }
        }[progressStatus] || { label: 'Not Started', color: '#64748b' };
        
        return '<div class="project-item" style="display: flex; align-items: center; padding: 1rem; background: var(--surface-elevated); border-radius: 14px; border: 1px solid var(--border-color); margin-bottom: 0.75rem; cursor: pointer;" onclick="window.DemonyApp.router.navigate(\'projects\')">' +
          '<div class="icon" style="width: 48px; height: 48px; border-radius: 14px; background: rgba(99, 102, 241, 0.15); display: flex; align-items: center; justify-content: center; margin-right: 0.85rem;">' +
            categoryIconSvg +
          '</div>' +
          '<div class="info" style="flex: 1; min-width: 0;">' +
            '<div class="name" style="font-weight: 700; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + project.name + '</div>' +
            '<div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">' +
              '<span style="color: var(--text-muted); font-size: 0.75rem;">' + (project.category || 'General') + '</span>' +
              '<span style="font-size: 0.65rem; padding: 2px 8px; border-radius: 4px; background: ' + progressInfo.color + '22; color: ' + progressInfo.color + '; font-weight: 600;">' + progressInfo.label + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="progress" style="text-align: right; min-width: 80px;">' +
            '<div class="amount" style="font-weight: 800; font-size: 0.9rem;">GH₵' + parseFloat(project.raised_amount || 0).toLocaleString() + '</div>' +
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
