// Portfolio Page
function renderPortfolio(container, api) {
  if (!api.token) {
    container.innerHTML = 
      '<section>' +
        '<div class="page-header">' +
          '<h1>Portfolio</h1>' +
          '<p>Your investment overview</p>' +
        '</div>' +
        '<div class="card" style="text-align: center; padding: 2rem;">' +
          '<p style="margin-bottom: 1rem;">Please login to view your portfolio</p>' +
          '<button class="btn btn-primary" onclick="document.getElementById(\'login-btn\').click()">Login</button>' +
        '</div>' +
      '</section>';
    return;
  }

  var html = 
    '<section>' +
      '<div class="page-header">' +
        '<h1>Portfolio</h1>' +
        '<p>Your investment overview</p>' +
      '</div>' +
      
      // Main Portfolio Value Card
      '<div id="portfolio-value" class="card" style="margin-bottom: 1.5rem;">' +
        '<div style="text-align: center; padding: 0.5rem;">' +
          '<h3 style="color: var(--text-muted); font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem;">Portfolio Value</h3>' +
          '<div style="font-size: 2rem; font-weight: 800; color: var(--primary-color);">Loading...</div>' +
        '</div>' +
      '</div>' +
      
      // Stats Grid
      '<div class="stats-grid" id="portfolio-stats" style="margin-bottom: 1.5rem;">' +
        '<div class="card stat-card">' +
          '<div class="value">-</div>' +
          '<div class="label">Total Invested</div>' +
        '</div>' +
        '<div class="card stat-card">' +
          '<div class="value">-</div>' +
          '<div class="label">Total Return</div>' +
        '</div>' +
      '</div>' +
      
      // Allocation Card
      '<div class="card" style="margin-bottom: 1rem;">' +
        '<h3>Allocation</h3>' +
        '<div id="allocation-chart" style="margin-top: 1rem;">' +
          '<div style="text-align: center; color: var(--text-muted);">Loading...</div>' +
        '</div>' +
      '</div>' +
      
      // Risk Analysis
      '<div class="stats-grid" id="risk-stats">' +
        '<div class="card stat-card">' +
          '<div class="value">-</div>' +
          '<div class="label">Risk Level</div>' +
        '</div>' +
        '<div class="card stat-card">' +
          '<div class="value">-</div>' +
          '<div class="label">Diversification</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  
  container.innerHTML = html;
  
  loadPortfolio(api);
}

function loadPortfolio(api) {
  api.getPortfolio()
    .then(function(portfolio) {
      // Portfolio Value Card
      document.getElementById('portfolio-value').innerHTML = 
        '<div style="text-align: center; padding: 0.5rem;">' +
          '<h3 style="color: var(--text-muted); font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem;">Portfolio Value</h3>' +
          '<div style="font-size: 2rem; font-weight: 800; color: var(--primary-color);">$' + portfolio.currentValue.toLocaleString() + '</div>' +
          '<div style="color: var(--secondary-color); font-size: 0.9rem; margin-top: 0.25rem;">+$' + portfolio.totalReturn.toLocaleString() + ' (' + portfolio.returnPercent.toFixed(1) + '%) all time</div>' +
        '</div>';
      
      // Stats Grid
      document.getElementById('portfolio-stats').innerHTML = 
        '<div class="card stat-card">' +
          '<div class="value" style="color: var(--secondary-color);">$' + portfolio.totalInvested.toLocaleString() + '</div>' +
          '<div class="label">Total Invested</div>' +
        '</div>' +
        '<div class="card stat-card">' +
          '<div class="value">' + portfolio.activeInvestments + '</div>' +
          '<div class="label">Active Investments</div>' +
        '</div>';
        
      // Allocation
      var colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
      document.getElementById('allocation-chart').innerHTML = 
        '<div style="display: flex; flex-direction: column; gap: 1rem;">' +
          portfolio.allocation.map(function(item, index) {
            return createAllocationBar(item.category, item.percent, colors[index % colors.length]);
          }).join('') +
        '</div>';
        
      // Risk Stats
      document.getElementById('risk-stats').innerHTML = 
        '<div class="card stat-card">' +
          '<div class="value">' + portfolio.riskLevel + '</div>' +
          '<div class="label">Risk Level</div>' +
        '</div>' +
        '<div class="card stat-card">' +
          '<div class="value">' + portfolio.diversificationScore + '/10</div>' +
          '<div class="label">Diversification</div>' +
        '</div>';
    })
    .catch(function(err) {
      console.error(err);
      document.getElementById('portfolio-value').innerHTML = 
        '<div style="text-align: center; padding: 1rem; color: #ef4444;">Error loading portfolio data</div>';
    });
}

function createAllocationBar(label, percent, color) {
  return '<div>' +
    '<div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">' +
      '<span style="font-weight: 600;">' + label + '</span>' +
      '<span style="color: var(--text-muted);">' + percent + '%</span>' +
    '</div>' +
    '<div class="progress-bar" style="height: 8px; background: var(--border-color); border-radius: 999px; overflow: hidden;">' +
      '<div class="progress-fill" style="height: 100%; width: ' + percent + '%; background: ' + color + '; border-radius: 999px;"></div>' +
    '</div>' +
  '</div>';
}

export { renderPortfolio };
