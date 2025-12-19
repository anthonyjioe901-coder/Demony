// My Investments Page
function renderInvestments(container, api) {
  if (!api.token) {
    container.innerHTML = '<div style="text-align: center; padding: 4rem;"><h2>Please login to view your investments</h2></div>';
    return;
  }

  var html = 
    '<section>' +
      '<h2>My Investments</h2>' +
      '<p style="color: var(--text-muted); margin-bottom: 2rem;">Track your active investments and returns</p>' +
      '<div id="portfolio-summary">Loading summary...</div>' +
      '<h3 style="margin-bottom: 1rem;">Active Investments</h3>' +
      '<div id="investments-list">Loading investments...</div>' +
    '</section>';
  
  container.innerHTML = html;
  loadInvestments(api);
}

function loadInvestments(api) {
  var investmentsList = document.getElementById('investments-list');
  var summaryContainer = document.getElementById('portfolio-summary');
  
  api.getPortfolio()
    .then(function(portfolio) {
      summaryContainer.innerHTML = 
        '<div class="card" style="margin-bottom: 2rem;">' +
          '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem;">' +
            '<div>' +
              '<p style="color: var(--text-muted);">Total Invested</p>' +
              '<h2 style="color: var(--primary-color);">$' + portfolio.totalInvested.toLocaleString() + '</h2>' +
            '</div>' +
            '<div>' +
              '<p style="color: var(--text-muted);">Current Value</p>' +
              '<h2 style="color: var(--secondary-color);">$' + portfolio.currentValue.toLocaleString() + '</h2>' +
            '</div>' +
            '<div>' +
              '<p style="color: var(--text-muted);">Total Return</p>' +
              '<h2 style="color: var(--secondary-color);">+$' + portfolio.totalReturn.toLocaleString() + ' (' + portfolio.returnPercent.toFixed(1) + '%)</h2>' +
            '</div>' +
            '<div>' +
              '<p style="color: var(--text-muted);">Active Investments</p>' +
              '<h2>' + portfolio.activeInvestments + '</h2>' +
            '</div>' +
          '</div>' +
        '</div>';
    })
    .catch(function(err) {
      summaryContainer.innerHTML = '<div style="color: #ef4444;">Error loading summary</div>';
    });
  
  api.getMyInvestments()
    .then(function(investments) {
      if (investments.length === 0) {
        investmentsList.innerHTML = '<div class="card">No active investments found.</div>';
        return;
      }
      
      investmentsList.innerHTML = investments.map(function(inv) {
        var currentValue = parseFloat(inv.amount) * 1.1;
        var returnPercent = 10;
        
        return '<div class="card investment-item" style="margin-bottom: 1rem;">' +
          '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">' +
            '<div>' +
              '<h3 style="margin-bottom: 0.25rem;">' + (inv.project_name || 'Project #' + inv.project_id) + '</h3>' +
              '<span class="badge">' + (inv.category || 'General') + '</span>' +
            '</div>' +
            '<div style="text-align: right;">' +
              '<div style="font-size: 1.25rem; font-weight: 600;">$' + parseFloat(inv.amount).toLocaleString() + '</div>' +
              '<div style="color: var(--text-muted);">Invested</div>' +
            '</div>' +
            '<div style="text-align: right;">' +
              '<div style="font-size: 1.25rem; font-weight: 600; color: var(--secondary-color);">$' + currentValue.toLocaleString() + '</div>' +
              '<div style="color: var(--secondary-color);">+' + returnPercent + '% Return</div>' +
            '</div>' +
            '<div>' +
              '<span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #10b981;">Active</span>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    })
    .catch(function(err) {
      investmentsList.innerHTML = '<div style="color: #ef4444;">Error loading investments: ' + err.message + '</div>';
    });
}

export { renderInvestments };
