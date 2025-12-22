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
        
        return '<div class="card project-card">' +
          '<div class="project-image" style="height: 200px;">' +
            '<img src="' + imageUrl + '" alt="' + (project.name || 'Project') + '" loading="lazy" onerror="this.onerror=null;this.src=\'' + 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800' + '\'' + ';">' +
          '</div>' +
          '<div class="project-content" style="padding: 1.5rem;">' +
            '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">' +
              '<span class="badge">' + (project.category || 'General') + '</span>' +
              '<span style="color: var(--text-muted); font-size: 0.875rem;">📅 ' + ageDisplay + '</span>' +
            '</div>' +
            '<h3>' + project.name + '</h3>' +
            '<p style="color: var(--text-muted); margin-bottom: 1rem; line-height: 1.5;">' + (project.description || '').substring(0, 100) + '...</p>' +
            
            // Investment Terms Box
            '<div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; margin-bottom: 1rem; font-size: 0.8rem;">' +
              '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">' +
                '<div>💰 Min: GH₵' + (project.min_investment || 100) + '</div>' +
                '<div>📆 Profits: ' + frequencyDisplay + '</div>' +
                '<div>👥 Investors: ' + investorCount + '</div>' +
                '<div>💼 Share: ' + profitSharing.investor + '%</div>' +
              '</div>' +
              '<div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between;">' +
                '<span>⚠️ Risk: <strong style="color: ' + riskColor + ';">' + riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1) + '</strong></span>' +
              '</div>' +
            '</div>' +
            
            '<div class="progress-bar" style="margin-bottom: 0.5rem;">' +
              '<div class="progress-fill" style="width: ' + percent + '%;"></div>' +
            '</div>' +
            '<div style="display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.875rem;">' +
              '<span>GH₵' + (raised && !isNaN(raised) ? raised.toLocaleString() : '0') + ' raised</span>' +
              '<span>' + (percent && !isNaN(percent) ? percent : '0') + '%</span>' +
            '</div>' +
            '<div style="display: flex; gap: 0.5rem;">' +
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
    var minInvestment = project.min_investment || 100;
    
    var modal = document.createElement('div');
    modal.className = 'modal active';
    
    modal.innerHTML = 
      '<div class="modal-content" style="max-width: 500px; max-height: 90vh; overflow-y: auto;">' +
        '<h2>Invest in ' + project.name + '</h2>' +
        
        // Risk Disclosure Banner
        '<div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 1px solid #f59e0b; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">' +
          '<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">' +
            '<span style="font-size: 1.5rem;">⚠️</span>' +
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
          
          // Required Acknowledgments
          '<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 1rem; margin: 1.5rem 0;">' +
            '<h4 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #991b1b;">⚠️ Required Acknowledgments</h4>' +
            '<div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.85rem;">' +
              '<label style="display: flex; gap: 0.5rem; cursor: pointer;">' +
                '<input type="checkbox" id="terms-check" required style="margin-top: 2px;">' +
                '<span>I have read and accept the <a href="#/legal" target="_blank">Terms & Conditions</a></span>' +
              '</label>' +
              '<label style="display: flex; gap: 0.5rem; cursor: pointer;">' +
                '<input type="checkbox" id="risk-check" required style="margin-top: 2px;">' +
                '<span>I understand that <strong>profits are NOT guaranteed</strong> and depend on actual project performance</span>' +
              '</label>' +
              '<label style="display: flex; gap: 0.5rem; cursor: pointer;">' +
                '<input type="checkbox" id="loss-check" required style="margin-top: 2px;">' +
                '<span>I understand and <strong>can afford to lose my entire investment</strong> if the project underperforms</span>' +
              '</label>' +
              '<label style="display: flex; gap: 0.5rem; cursor: pointer;">' +
                '<input type="checkbox" id="lockin-check" required style="margin-top: 2px;">' +
                '<span>I understand my principal (GH₵<span id="amount-display">0</span>) will be <strong>LOCKED for ' + lockInPeriod + ' months</strong></span>' +
              '</label>' +
            '</div>' +
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
    var termsCheck = document.getElementById('terms-check');
    var riskCheck = document.getElementById('risk-check');
    var lossCheck = document.getElementById('loss-check');
    var lockinCheck = document.getElementById('lockin-check');
    
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

      var allChecked = termsCheck.checked && riskCheck.checked && lossCheck.checked && lockinCheck.checked;
      confirmBtn.disabled = !allChecked || !isValidAmount;

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
    termsCheck.addEventListener('change', updateUI);
    riskCheck.addEventListener('change', updateUI);
    lossCheck.addEventListener('change', updateUI);
    lockinCheck.addEventListener('change', updateUI);
    
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
          '<input type="number" id="calc-amount" min="100" step="1" value="1000">' +
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
      if (amount < 100) {
        calcResults.innerHTML = '<div style="text-align: center; color: var(--text-muted);">Minimum amount is GH₵100</div>';
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

export { renderProjects };
