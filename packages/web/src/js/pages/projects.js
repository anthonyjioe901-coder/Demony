// Projects Page
function renderProjects(container, api) {
  var html = 
    '<section>' +
      '<h2>Investment Projects</h2>' +
      '<p style="color: var(--text-muted); margin-bottom: 1.5rem;">Browse and invest in local businesses and projects</p>' +
      
      // Modern Search Bar
      '<div class="search-container" style="margin-bottom: 1rem;">' +
        '<div style="position: relative; max-width: 100%;">' +
          '<input type="text" id="project-search" placeholder="Search projects..." ' +
            'style="width: 100%; padding: 0.75rem 1rem 0.75rem 2.75rem; border: 2px solid var(--border-color); border-radius: 10px; font-size: 0.95rem; background: var(--card-bg); color: var(--text-color); transition: all 0.3s ease;">' +
          '<svg style="position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>' +
          '</svg>' +
        '</div>' +
      '</div>' +
      
      // Horizontal Scrollable Category Pills
      '<div class="category-scroll-container" style="margin-bottom: 1rem; position: relative;">' +
        '<div class="category-pills" id="category-pills" style="display: flex; gap: 0.5rem; overflow-x: auto; padding: 0.25rem 0; scrollbar-width: none; -ms-overflow-style: none;">' +
          '<button class="category-pill active" data-category="">All</button>' +
        '</div>' +
      '</div>' +
      
      // Sort and Count Row
      '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">' +
        '<div id="project-count" style="color: var(--text-muted); font-size: 0.85rem;">Loading...</div>' +
        '<select id="sort-filter" style="padding: 0.5rem 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; background: var(--card-bg); color: var(--text-color); font-size: 0.85rem; cursor: pointer;">' +
          '<option value="newest">Newest</option>' +
          '<option value="ending-soon">Ending Soon</option>' +
          '<option value="most-funded">Most Funded</option>' +
        '</select>' +
      '</div>' +
      
      '<div class="card-grid" id="projects-list">' +
        '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">Loading projects...</div>' +
      '</div>' +
    '</section>';
  
  container.innerHTML = html;
  
  // Add CSS for category pills - compact horizontal scroll
  var style = document.createElement('style');
  style.textContent = 
    '.category-pills::-webkit-scrollbar { display: none; }' +
    '.category-pill { padding: 0.4rem 0.9rem; border: 1.5px solid var(--border-color); border-radius: 20px; background: var(--card-bg); color: var(--text-color); cursor: pointer; font-size: 0.8rem; font-weight: 500; white-space: nowrap; flex-shrink: 0; transition: all 0.2s ease; }' +
    '.category-pill:hover { border-color: var(--primary-color); }' +
    '.category-pill.active { background: var(--primary-color); color: white; border-color: var(--primary-color); }' +
    '#project-search:focus { border-color: var(--primary-color); outline: none; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15); }';
  document.head.appendChild(style);
  
  loadProjects(api, true); // Load with categories
  
  // Search with debounce
  var searchTimeout;
  document.getElementById('project-search').addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function() { loadProjects(api); }, 300);
  });
  
  document.getElementById('sort-filter').addEventListener('change', function() { loadProjects(api); });
}

function loadProjects(api, loadCategories) {
  var projectsList = document.getElementById('projects-list');
  var searchInput = document.getElementById('project-search');
  var sortFilter = document.getElementById('sort-filter');
  var activeCategory = document.querySelector('.category-pill.active');
  
  var category = activeCategory ? activeCategory.getAttribute('data-category') : '';
  var sort = sortFilter ? sortFilter.value : 'newest';
  var search = searchInput ? searchInput.value.trim() : '';
  
  projectsList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">Loading projects...</div>';
  
  api.getProjects({ category: category, sort: sort, search: search })
    .then(function(response) {
      var projects = response.projects || response;
      var categories = response.categories || [];
      var pagination = response.pagination || { total: projects.length };
      
      // Update project count
      var countEl = document.getElementById('project-count');
      if (countEl) {
        countEl.textContent = pagination.total + ' project' + (pagination.total !== 1 ? 's' : '') + ' found';
      }
      
      // Populate category pills (only on first load)
      if (loadCategories && categories.length > 0) {
        var pillsContainer = document.getElementById('category-pills');
        if (pillsContainer) {
          var pillsHtml = '<button class="category-pill active" data-category="">All</button>';
          categories.forEach(function(cat) {
            // Format category name for display - keep it short
            var displayName = cat.split('-').map(function(word) {
              return word.charAt(0).toUpperCase() + word.slice(1);
            }).join(' ');
            // Shorten long names
            if (displayName === 'Renewable Energy') displayName = 'Renewable';
            if (displayName === 'Food Beverage') displayName = 'Food';
            if (displayName === 'Financial Services') displayName = 'Finance';
            if (displayName === 'Health Fitness') displayName = 'Fitness';
            if (displayName === 'Telecommunications') displayName = 'Telecom';
            pillsHtml += '<button class="category-pill" data-category="' + cat + '">' + displayName + '</button>';
          });
          pillsContainer.innerHTML = pillsHtml;
          
          // Add click handlers to pills
          pillsContainer.querySelectorAll('.category-pill').forEach(function(pill) {
            pill.addEventListener('click', function() {
              pillsContainer.querySelectorAll('.category-pill').forEach(function(p) { p.classList.remove('active'); });
              this.classList.add('active');
              loadProjects(api, false);
            });
          });
        }
      }
      
      if (projects.length === 0) {
        projectsList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">No projects found.</div>';
        return;
      }
      
      projectsList.innerHTML = projects.map(function(project) {
        var goal = Number(project.goal_amount) || 0;
        var raised = Number(project.raised_amount) || 0;
        var percent = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
        
        // Calculate project age
        var createdDate = project.createdAt ? new Date(project.createdAt) : new Date();
        var now = new Date();
        var ageInDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
        var ageDisplay = ageInDays === 0 ? 'Today' : ageInDays === 1 ? '1 day ago' : ageInDays + ' days ago';

        var imageUrl = project.image_url || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800';
        
        // Get investment terms
        var profitFrequency = project.profit_distribution_frequency || 'monthly';
        var profitSharing = project.profit_sharing_ratio || { investor: 80, platform: 20 };
        // Override old 60/40 ratios with new 80/20 standard
        if (profitSharing.investor === 60) {
          profitSharing = { investor: 80, platform: 20 };
        }
        var riskLevel = project.risk_level || 'medium';
        var investorCount = project.investor_count || 0;
        
        // Format profit frequency for display
        var frequencyDisplay = {
          'daily': 'Daily',
          'weekly': 'Weekly',
          'monthly': 'Monthly',
          'quarterly': 'Quarterly',
          'annually': 'Annually',
          'as_realized': 'As Realized'
        }[profitFrequency] || 'Monthly';
        
        // Risk level color
        var riskColor = {
          'low': '#10b981',
          'medium': '#f59e0b',
          'high': '#ef4444'
        }[riskLevel] || '#f59e0b';
        
        // Progress status display - improved visibility
        var progressStatus = project.progressStatus || 'not_started';
        var progressStatusInfo = {
          'not_started': { label: 'NOT STARTED', bgColor: 'rgba(0,0,0,0.85)', icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>' },
          'ongoing': { label: 'IN PROGRESS', bgColor: 'rgba(99, 102, 241, 0.95)', icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>' },
          'completed': { label: 'COMPLETED', bgColor: 'rgba(16, 185, 129, 0.95)', icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>' }
        };
        var progressInfo = progressStatusInfo[progressStatus] || progressStatusInfo['not_started'];
        
        return '<div class="card project-card">' +
          '<div class="project-image" style="height: 200px; position: relative;">' +
            '<img src="' + imageUrl + '" alt="' + (project.name || 'Project') + '" loading="lazy" onerror="this.onerror=null;this.src=\'' + 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800' + '\'' + ';">' +
            '<span class="progress-status-indicator" style="position: absolute; top: 12px; left: 12px; background: ' + progressInfo.bgColor + '; color: white; padding: 6px 14px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 6px; backdrop-filter: blur(4px);">' + progressInfo.icon + ' ' + progressInfo.label + '</span>' +
          '</div>' +
          '<div class="project-content">' +
            '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">' +
              '<span class="badge">' + (project.category || 'General') + '</span>' +
              '<div style="display: flex; align-items: center; gap: 0.5rem;">' +
                '<span style="color: var(--text-muted); font-size: 0.875rem; display: flex; align-items: center; gap: 4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ' + ageDisplay + '</span>' +
                '<button class="share-project-btn" data-id="' + project.id + '" data-name="' + encodeURIComponent(project.name) + '" title="Share project" style="background: none; border: none; cursor: pointer; padding: 0.25rem; display: flex; align-items: center;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></button>' +
              '</div>' +
            '</div>' +
            '<h3>' + project.name + '</h3>' +
            '<p class="project-desc">' + (project.description || '').substring(0, 100) + '...</p>' +
            
            // Investment Terms Box
            '<div class="investment-terms">' +
              '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">' +
                '<div style="display: flex; align-items: center; gap: 6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> <span style="color: var(--text-muted);">Min:</span> <strong>GH₵' + (project.min_investment || 20) + '</strong></div>' +
                '<div style="display: flex; align-items: center; gap: 6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> <span style="color: var(--text-muted);">Profits:</span> <strong>' + frequencyDisplay + '</strong></div>' +
                '<div style="display: flex; align-items: center; gap: 6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> <span style="color: var(--text-muted);">Investors:</span> <strong>' + investorCount + '</strong></div>' +
                '<div style="display: flex; align-items: center; gap: 6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> <span style="color: var(--text-muted);">Share:</span> <strong>' + profitSharing.investor + '%</strong></div>' +
              '</div>' +
              '<div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color); display: flex; align-items: center; gap: 6px;">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="' + riskColor + '" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
                '<span style="color: var(--text-muted);">Risk:</span> <strong style="color: ' + riskColor + ';">' + riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1) + '</strong>' +
              '</div>' +
            '</div>' +
            
            '<div class="progress-bar" style="margin-bottom: 0.5rem;">' +
              '<div class="progress-fill" style="width: ' + percent + '%;"></div>' +
            '</div>' +
            '<div style="display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.875rem;">' +
              '<span>GH₵' + (raised && !isNaN(raised) ? raised.toLocaleString() : '0') + ' raised</span>' +
              '<span>' + (percent && !isNaN(percent) ? percent : '0') + '%</span>' +
            '</div>' +
            '<div class="project-actions">' +
              '<button class="btn btn-outline calc-btn" data-id="' + project.id + '" style="flex: 1;">Calculator</button>' +
              '<button class="btn btn-primary invest-btn" data-id="' + project.id + '" style="flex: 1;">Invest</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
      
      // Attach invest button handlers
      document.querySelectorAll('.invest-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var id = this.getAttribute('data-id');
          showInvestModal(id, api);
        });
      });
      
      // Attach calculator button handlers
      document.querySelectorAll('.calc-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var id = this.getAttribute('data-id');
          showCalculatorModal(id, api);
        });
      });
      
      // Attach share button handlers
      document.querySelectorAll('.share-project-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var id = this.getAttribute('data-id');
          var name = decodeURIComponent(this.getAttribute('data-name'));
          showShareModal(id, name);
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
  
  // First fetch project details
  api.getProject(projectId).then(function(project) {
    // Ensure lockInPeriod is a number
    var lockInPeriod = parseInt(project.lock_in_period_months) || parseInt(project.duration) || 12;
    var profitSharing = project.profit_sharing_ratio || { investor: 80, platform: 20 };
    // Override old 60/40 ratios with new 80/20 standard
    if (profitSharing.investor === 60) {
      profitSharing = { investor: 80, platform: 20 };
    }
    var riskLevel = project.risk_level || 'medium';
    var minInvestment = project.min_investment || 20;
    
    var modal = document.createElement('div');
    modal.className = 'modal active';
    
    modal.innerHTML = 
      '<div class="modal-content" style="max-width: 500px; max-height: 90vh; overflow-y: auto;">' +
        '<h2>Invest in ' + project.name + '</h2>' +
        
        // Risk Disclosure Banner
        '<div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 1px solid #f59e0b; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">' +
          '<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">' +
            '<strong style="color: #92400e;">Investment Risk Disclosure</strong>' +
          '</div>' +
          '<p style="font-size: 0.85rem; color: #78350f; margin: 0;">This is a <strong>' + riskLevel.toUpperCase() + ' RISK</strong> investment. Profits are NOT guaranteed and depend on actual project performance.</p>' +
        '</div>' +
        
        // Key Terms Box
        '<div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">' +
          '<h4 style="margin: 0 0 0.75rem 0; font-size: 0.9rem;">Key Investment Terms</h4>' +
          '<div style="display: grid; gap: 0.5rem; font-size: 0.85rem;">' +
            '<div style="display: flex; justify-content: space-between;"><span>🔒 Principal Lock-in:</span><strong>' + lockInPeriod + ' months</strong></div>' +
            '<div style="display: flex; justify-content: space-between;"><span>💰 Your Profit Share:</span><strong>' + profitSharing.investor + '%</strong></div>' +
            '<div style="display: flex; justify-content: space-between;"><span>🏢 Platform Fee:</span><strong>' + profitSharing.platform + '%</strong></div>' +
            '<div style="display: flex; justify-content: space-between;"><span>📤 Profit Withdrawal:</span><strong>Anytime</strong></div>' +
              '<div style="display: flex; justify-content: space-between;"><span>💵 Min Investment:</span><strong>GH₵' + minInvestment + '</strong></div>' +
          '</div>' +
        '</div>' +
        
        '<form id="invest-form">' +
          '<div class="form-group">' +
            '<label for="amount">Investment Amount (GH₵)</label>' +
            '<div style="display:flex; align-items:center; gap:0.5rem;">' +
              '<span id="invest-currency" style="padding: 0.75rem 0.95rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background: var(--surface-color); cursor: pointer; user-select: none;">GH₵</span>' +
              '<input type="number" id="amount" min="' + minInvestment + '" step="1" required style="font-size: 1.25rem; padding: 0.75rem; flex:1;">' +
            '</div>' +
            '<small style="color: var(--text-muted);">Minimum investment: GH₵' + minInvestment + '</small>' +
          '</div>' +
          
          // Projected Returns Preview
          '<div id="return-preview" style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; margin: 1rem 0; display: none;">' +
            '<p style="color: var(--text-muted); font-size: 0.8rem; margin: 0;">Enter an amount to see projected returns</p>' +
          '</div>' +
          
          // Required Acknowledgment (single checkbox)
          '<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 1rem; margin: 1.5rem 0;">' +
            '<h4 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #991b1b;">Required Acknowledgment</h4>' +
            '<label style="display: flex; gap: 0.5rem; cursor: pointer; font-size: 0.85rem;">' +
              '<input type="checkbox" id="master-acknowledgment" required style="margin-top: 2px; min-width: 18px; min-height: 18px;">' +
              '<span>I have read and accept the <a href="#/legal" target="_blank">Terms & Conditions</a>. I understand that profits are NOT guaranteed, I can afford to lose my investment, and my principal (GH₵<span id="amount-display">0</span>) will be <strong>LOCKED for ' + lockInPeriod + ' months</strong>.</span>' +
            '</label>' +
          '</div>' +
          
          '<div class="form-actions" style="display: flex; gap: 1rem;">' +
            '<button type="button" class="btn btn-outline" id="close-invest-modal" style="flex: 1;">Cancel</button>' +
            '<button type="submit" class="btn btn-primary" id="confirm-invest-btn" style="flex: 1;" disabled>Confirm Investment</button>' +
          '</div>' +
        '</form>' +
      '</div>';
    
    document.body.appendChild(modal);
    
    var amountInput = document.getElementById('amount');
    var investCurrency = document.getElementById('invest-currency');
    var amountDisplay = document.getElementById('amount-display');
    var returnPreview = document.getElementById('return-preview');
    var confirmBtn = document.getElementById('confirm-invest-btn');
    var masterAcknowledgment = document.getElementById('master-acknowledgment');
    
    // Update amount display and button state
    function updateUI() {
      var amount = parseFloat(amountInput.value) || 0;
      var amountValue = amountInput.value.trim();

      // Validation
      var isValidNumber = !isNaN(amount) && amountValue !== '';
      var isPositive = amount > 0;
      var isAboveMinimum = amount >= minInvestment;
      var isBelowMaximum = amount <= 10000000; // Max 10 million cedis
      var isValidAmount = isValidNumber && isPositive && isAboveMinimum && isBelowMaximum;

      // Update display (safe)
      amountDisplay.textContent = (isValidNumber && isPositive && amount !== null && !isNaN(amount)) ? amount.toLocaleString() : '0';

      var isAcknowledged = masterAcknowledgment.checked;
      confirmBtn.disabled = !isAcknowledged || !isValidAmount;

      // Show validation errors
      var errorMsg = '';
      if (amountValue !== '' && !isValidNumber) {
        errorMsg = 'Please enter a valid number';
      } else if (isValidNumber && !isPositive) {
        errorMsg = 'Amount must be greater than 0';
      } else if (isValidNumber && isPositive && !isAboveMinimum) {
        errorMsg = 'Minimum investment is GH₵' + minInvestment.toLocaleString();
      } else if (isValidNumber && isPositive && !isBelowMaximum) {
        errorMsg = 'Maximum investment is GH₵10,000,000';
      }

      // Update input styling
      amountInput.style.borderColor = errorMsg ? '#ef4444' : 'var(--border-color)';

      // Fetch projected returns if amount is valid
      if (isValidAmount) {
        api.calculateReturns(projectId, amount).then(function(result) {
          if (result && result.projectedReturns) {
            returnPreview.style.display = 'block';
            returnPreview.innerHTML =
              '<h4 style="margin: 0 0 0.5rem 0; font-size: 0.85rem;">📊 Projected Returns (Not Guaranteed)</h4>' +
              '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.8rem;">' +
                '<div>Monthly: <strong style="color: var(--secondary-color);">GH₵' + (result.projectedReturns.monthlyProfit || 0).toLocaleString() + '</strong></div>' +
                '<div>Annual: <strong style="color: var(--secondary-color);">GH₵' + (result.projectedReturns.annualProfit || 0).toLocaleString() + '</strong></div>' +
              '</div>' +
              '<p style="color: #ef4444; font-size: 0.75rem; margin: 0.5rem 0 0 0;">⚠️ ' + (result.disclaimer ? result.disclaimer.substring(0, 80) + '...' : 'Profits are not guaranteed') + '</p>';
          } else {
            returnPreview.style.display = 'none';
          }
        }).catch(function() {
          returnPreview.style.display = 'none';
        });
      } else {
        returnPreview.style.display = 'none';
      }
    }
    
    amountInput.addEventListener('input', updateUI);
    if (investCurrency) {
      investCurrency.addEventListener('click', function() { amountInput.focus(); });
    }
    masterAcknowledgment.addEventListener('change', updateUI);
    
    document.getElementById('close-invest-modal').addEventListener('click', function() {
      modal.remove();
    });
    
    document.getElementById('invest-form').addEventListener('submit', function(e) {
      e.preventDefault();
      var amount = amountInput.value;
      
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Processing...';
      
      api.invest({ 
        projectId: projectId, 
        amount: amount,
        termsAccepted: true,
        riskAcknowledged: true,
        lossAcknowledged: true,
        lockInAcknowledged: true
      })
        .then(function(result) {
          modal.remove();
          
          // Show success modal with lock-in reminder
          var successModal = document.createElement('div');
          successModal.className = 'modal active';
          successModal.innerHTML = 
            '<div class="modal-content" style="max-width: 400px; text-align: center;">' +
              '<div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>' +
              '<h2 style="color: var(--secondary-color);">Investment Successful!</h2>' +
              '<p>You invested <strong>GH₵' + parseFloat(amount).toLocaleString() + '</strong> in ' + project.name + '</p>' +
              '<div style="background: #fef3c7; border-radius: 8px; padding: 1rem; margin: 1rem 0; text-align: left;">' +
                '<p style="margin: 0; font-size: 0.85rem;"><strong>🔒 Remember:</strong> Your principal is locked until ' + new Date(result.investment.lockInEndDate).toLocaleDateString() + '. Profits can be withdrawn anytime.</p>' +
              '</div>' +
              '<button class="btn btn-primary" onclick="this.closest(\'.modal\').remove()">Got it!</button>' +
            '</div>';
          document.body.appendChild(successModal);
          
          loadProjects(api);
        })
        .catch(function(err) {
          alert('Investment failed: ' + err.message);
          confirmBtn.disabled = false;
          confirmBtn.textContent = 'Confirm Investment';
        });
    });
  }).catch(function(err) {
    alert('Error loading project: ' + err.message);
  });
}

// ROI Calculator Modal
function showCalculatorModal(projectId, api) {
  api.getProject(projectId).then(function(project) {
    var minInvestment = project.min_investment || 20;
    var modal = document.createElement('div');
    modal.className = 'modal active';
    
    modal.innerHTML = 
      '<div class="modal-content" style="max-width: 500px;">' +
        '<h2>📊 ROI Calculator</h2>' +
        '<p style="color: var(--text-muted); margin-bottom: 1rem;">' + project.name + '</p>' +
        
        '<div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 0.75rem; margin-bottom: 1rem; font-size: 0.8rem;">' +
          '<strong>⚠️ Disclaimer:</strong> These are PROJECTED returns only. Actual profits depend on project performance and are NOT guaranteed.' +
        '</div>' +
        
        '<div class="form-group">' +
          '<label for="calc-amount">Investment Amount (GH₵)</label>' +
          '<input type="number" id="calc-amount" min="' + minInvestment + '" step="1" value="1000">' +
        '</div>' +
        
        '<div id="calc-results" style="margin: 1.5rem 0;">' +
          '<div style="text-align: center; color: var(--text-muted);">Enter an amount to calculate</div>' +
        '</div>' +
        
        '<div style="display: flex; gap: 1rem;">' +
          '<button type="button" class="btn btn-outline" id="close-calc-modal" style="flex: 1;">Close</button>' +
          '<button type="button" class="btn btn-primary" id="invest-from-calc" style="flex: 1;">Invest Now</button>' +
        '</div>' +
      '</div>';
    
    document.body.appendChild(modal);
    
    var calcAmount = document.getElementById('calc-amount');
    var calcResults = document.getElementById('calc-results');
    
    function calculateAndDisplay() {
      var amount = parseFloat(calcAmount.value) || 0;
      if (amount < minInvestment) {
        calcResults.innerHTML = '<div style="text-align: center; color: var(--text-muted);">Minimum amount is GH₵' + minInvestment + '</div>';
        return;
      }

      if (amount > 10000000) { // Max 10 million cedis
        calcResults.innerHTML = '<div style="text-align: center; color: #ef4444;">Maximum investment amount is GH₵10,000,000</div>';
        return;
      }

      calcResults.innerHTML = '<div style="text-align: center; color: var(--text-muted);">Calculating...</div>';

      api.calculateReturns(projectId, amount).then(function(result) {
        if (!result || !result.projectedReturns) {
          throw new Error('Invalid response from server');
        }

        var r = result.projectedReturns;
        var scenarios = result.returnScenarios;

        // Ensure all values are valid numbers (defensive programming)
        var monthlyProfit = (r && typeof r.monthlyProfit === 'number' && !isNaN(r.monthlyProfit) && r.monthlyProfit !== null) ? r.monthlyProfit : 0;
        var annualProfit = (r && typeof r.annualProfit === 'number' && !isNaN(r.annualProfit) && r.annualProfit !== null) ? r.annualProfit : 0;
        var totalProfit = (r && typeof r.totalProfit === 'number' && !isNaN(r.totalProfit) && r.totalProfit !== null) ? r.totalProfit : 0;
        var totalValue = (r && typeof r.totalValue === 'number' && !isNaN(r.totalValue) && r.totalValue !== null) ? r.totalValue : 0;

        calcResults.innerHTML =
          '<div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem;">' +
            '<h4 style="margin: 0 0 1rem 0;">Projected Returns</h4>' +
            '<div style="display: grid; gap: 0.75rem;">' +
              '<div style="display: flex; justify-content: space-between; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color);">' +
                '<span>Monthly Profit:</span>' +
                '<strong style="color: var(--secondary-color);">GH₵' + monthlyProfit.toLocaleString() + '</strong>' +
              '</div>' +
              '<div style="display: flex; justify-content: space-between; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color);">' +
                '<span>Annual Profit:</span>' +
                '<strong style="color: var(--secondary-color);">GH₵' + annualProfit.toLocaleString() + '</strong>' +
              '</div>' +
              '<div style="display: flex; justify-content: space-between; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color);">' +
                '<span>Total (' + (result.investment ? result.investment.durationMonths : 12) + ' mo):</span>' +
                '<strong style="color: var(--secondary-color);">GH₵' + totalProfit.toLocaleString() + '</strong>' +
              '</div>' +
              '<div style="display: flex; justify-content: space-between;">' +
                '<span>Total Value:</span>' +
                '<strong style="color: var(--primary-color); font-size: 1.1rem;">GH₵' + totalValue.toLocaleString() + '</strong>' +
              '</div>' +
            '</div>' +

            '<h4 style="margin: 1.5rem 0 0.75rem 0; font-size: 0.9rem;">Scenarios</h4>' +
            '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; font-size: 0.8rem; text-align: center;">' +
              '<div style="background: #fef2f2; padding: 0.5rem; border-radius: 4px;">' +
                '<div style="color: #991b1b;">Pessimistic</div>' +
                '<strong>GH₵' + (scenarios && scenarios.pessimistic && scenarios.pessimistic.totalProfit !== null && typeof scenarios.pessimistic.totalProfit === 'number' && !isNaN(scenarios.pessimistic.totalProfit) ? scenarios.pessimistic.totalProfit.toLocaleString() : '0') + '</strong>' +
              '</div>' +
              '<div style="background: #f0fdf4; padding: 0.5rem; border-radius: 4px;">' +
                '<div style="color: #166534;">Optimistic</div>' +
                '<strong>GH₵' + (scenarios && scenarios.optimistic && scenarios.optimistic.totalProfit !== null && typeof scenarios.optimistic.totalProfit === 'number' && !isNaN(scenarios.optimistic.totalProfit) ? scenarios.optimistic.totalProfit.toLocaleString() : '0') + '</strong>' +
              '</div>' +
              '<div style="background: #fef3c7; padding: 0.5rem; border-radius: 4px;">' +
                '<div style="color: #92400e;">Worst Case</div>' +
                '<strong>GH₵0</strong>' +
              '</div>' +
            '</div>' +

            '<p style="color: #ef4444; font-size: 0.75rem; margin: 1rem 0 0 0; text-align: center;">⚠️ Profits depend on actual project performance</p>' +
          '</div>';
      }).catch(function(err) {
        calcResults.innerHTML = '<div style="text-align: center; color: #ef4444;">Error calculating returns: ' + (err.message || 'Unknown error') + '</div>';
      });
    }
    
    calcAmount.addEventListener('input', calculateAndDisplay);
    calculateAndDisplay(); // Initial calculation
    
    document.getElementById('close-calc-modal').addEventListener('click', function() {
      modal.remove();
    });
    
    document.getElementById('invest-from-calc').addEventListener('click', function() {
      modal.remove();
      showInvestModal(projectId, api);
    });
  }).catch(function(err) {
    alert('Error loading project: ' + err.message);
  });
}

// Social Share Modal for Projects
function showShareModal(projectId, projectName) {
  var baseUrl = window.location.origin + window.location.pathname;
  var shareUrl = baseUrl + '#projects/' + projectId;
  var shareMessage = 'Check out this investment opportunity on Demony: ' + projectName + ' 🚀 Invest in local businesses and earn returns!';
  
  var modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = 
    '<div class="modal-content" style="max-width: 400px;">' +
      '<h2 style="margin-bottom: 1rem;">Share This Project</h2>' +
      '<p style="color: var(--text-muted); margin-bottom: 1.5rem;">Spread the word about this investment opportunity!</p>' +
      
      '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">' +
        '<button id="share-wa" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; background: #25D366; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">' +
          '<span>💬</span> WhatsApp' +
        '</button>' +
        '<button id="share-tw" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; background: #1DA1F2; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">' +
          '<span>🐦</span> Twitter' +
        '</button>' +
        '<button id="share-fb" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; background: #1877F2; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">' +
          '<span>📘</span> Facebook' +
        '</button>' +
        '<button id="share-copy" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; background: var(--primary-color); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">' +
          '<span>📋</span> Copy Link' +
        '</button>' +
      '</div>' +
      
      '<button class="btn btn-outline" id="close-share-modal" style="width: 100%; margin-top: 1.5rem;">Close</button>' +
    '</div>';
  
  document.body.appendChild(modal);
  
  document.getElementById('share-wa').addEventListener('click', function() {
    if (window.DemonyAnalytics) window.DemonyAnalytics.trackReferralShare('whatsapp');
    window.open('https://wa.me/?text=' + encodeURIComponent(shareMessage + ' ' + shareUrl), '_blank');
  });
  
  document.getElementById('share-tw').addEventListener('click', function() {
    if (window.DemonyAnalytics) window.DemonyAnalytics.trackReferralShare('twitter');
    window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareMessage) + '&url=' + encodeURIComponent(shareUrl), '_blank');
  });
  
  document.getElementById('share-fb').addEventListener('click', function() {
    if (window.DemonyAnalytics) window.DemonyAnalytics.trackReferralShare('facebook');
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareUrl) + '&quote=' + encodeURIComponent(shareMessage), '_blank');
  });
  
  document.getElementById('share-copy').addEventListener('click', function() {
    var btn = this;
    navigator.clipboard.writeText(shareUrl).then(function() {
      btn.innerHTML = '<span>✓</span> Copied!';
      setTimeout(function() {
        btn.innerHTML = '<span>📋</span> Copy Link';
      }, 2000);
    });
  });
  
  document.getElementById('close-share-modal').addEventListener('click', function() {
    modal.remove();
  });
  
  modal.addEventListener('click', function(e) {
    if (e.target === modal) modal.remove();
  });
}

export { renderProjects };
