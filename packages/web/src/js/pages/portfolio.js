// Portfolio Page
function renderPortfolio(container, api) {
  if (!api.token) {
    container.innerHTML = '<div style="text-align: center; padding: 4rem;"><h2>Please login to view your portfolio</h2></div>';
    return;
  }

  var html = 
    '<section>' +
      '<h2>Portfolio Overview</h2>' +
      '<p style="color: var(--text-muted); margin-bottom: 2rem;">Your investment portfolio analysis and performance</p>' +
      
      '<div class="card-grid" id="portfolio-stats">' +
        'Loading stats...' +
      '</div>' +
      
      '<div class="card" style="margin-top: 2rem;">' +
        '<h3>Portfolio Allocation</h3>' +
        '<div id="allocation-chart" style="margin-top: 1rem;">' +
          'Loading allocation...' +
        '</div>' +
      '</div>' +
      
      '<div class="card" style="margin-top: 2rem;">' +
        '<h3>Performance History</h3>' +
        '<div id="performance-chart" style="margin-top: 1rem; min-height: 200px;">' +
          '<canvas id="returns-chart"></canvas>' +
        '</div>' +
      '</div>' +
      
      '<div class="card" style="margin-top: 2rem;">' +
        '<h3>Risk Analysis</h3>' +
        '<div id="risk-analysis" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin-top: 1rem;">' +
          'Loading risk analysis...' +
        '</div>' +
      '</div>' +
    '</section>';
  
  container.innerHTML = html;
  
  loadPortfolio(api);
}

function loadPortfolio(api) {
  api.getPortfolio()
    .then(function(portfolio) {
      // Stats
      document.getElementById('portfolio-stats').innerHTML = 
        '<div class="card">' +
          '<h3>Portfolio Value</h3>' +
          '<h2 style="color: var(--primary-color); margin: 1rem 0;">$ ' + portfolio.currentValue.toLocaleString() + '</h2>' +
          '<p style="color: var(--secondary-color);">+' + portfolio.returnPercent.toFixed(1) + '% all time</p>' +
        '</div>' +
        '<div class="card">' +
          '<h3>Total Invested</h3>' +
          '<h2 style="color: var(--secondary-color); margin: 1rem 0;">$ ' + portfolio.totalInvested.toLocaleString() + '</h2>' +
          '<p style="color: var(--text-muted);">' + portfolio.activeInvestments + ' active projects</p>' +
        '</div>' +
        '<div class="card">' +
          '<h3>Total Return</h3>' +
          '<h2 style="color: var(--primary-color); margin: 1rem 0;">$ ' + portfolio.totalReturn.toLocaleString() + '</h2>' +
          '<p style="color: var(--text-muted);">Realized + Unrealized</p>' +
        '</div>';
        
      // Allocation
      var colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
      document.getElementById('allocation-chart').innerHTML = 
        '<div style="display: flex; flex-direction: column; gap: 1rem;">' +
          portfolio.allocation.map(function(item, index) {
            return createAllocationBar(item.category, item.percent, colors[index % colors.length]);
          }).join('') +
        '</div>';
        
      // Risk
      document.getElementById('risk-analysis').innerHTML = 
        '<div>' +
          '<p style="color: var(--text-muted);">Risk Level</p>' +
          '<h3>' + portfolio.riskLevel + '</h3>' +
        '</div>' +
        '<div>' +
          '<p style="color: var(--text-muted);">Diversification Score</p>' +
          '<h3>' + portfolio.diversificationScore + '/10</h3>' +
        '</div>' +
        '<div>' +
          '<p style="color: var(--text-muted);">Volatility</p>' +
          '<h3>Low</h3>' +
        '</div>';
        
      // Chart (Mock implementation for now as we need Chart.js or similar)
      // In a real app, we would init Chart.js here
      initPerformanceChart();
    })
    .catch(function(err) {
      console.error(err);
      document.getElementById('portfolio-stats').innerHTML = 'Error loading portfolio data.';
    });
}

function createAllocationBar(label, percent, color) {
  return '<div>' +
    '<div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">' +
      '<span>' + label + '</span>' +
      '<span>' + percent + '%</span>' +
    '</div>' +
    '<div style="height: 8px; background: var(--border-color); border-radius: 4px;">' +
      '<div style="height: 100%; width: ' + percent + '%; background: ' + color + '; border-radius: 4px;"></div>' +
    '</div>' +
  '</div>';
}

function initPerformanceChart() {
  var canvas = document.getElementById('returns-chart');
  if (!canvas) return;
  
  // Simple canvas-based chart without external library
  var ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.offsetWidth;
  canvas.height = 200;
  
  var data = [10000, 10500, 11200, 11000, 11800, 12100, 12500, 13100, 13500, 13200, 13600, 13875];
  var labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  var maxValue = Math.max.apply(null, data);
  var minValue = Math.min.apply(null, data);
  var range = maxValue - minValue;
  
  var padding = 40;
  var chartWidth = canvas.width - padding * 2;
  var chartHeight = canvas.height - padding * 2;
  
  // Draw axes
  ctx.beginPath();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();
  
  // Draw line
  ctx.beginPath();
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 2;
  
  var stepX = chartWidth / (data.length - 1);
  
  data.forEach(function(value, index) {
    var x = padding + index * stepX;
    var y = canvas.height - padding - ((value - minValue) / range) * chartHeight;
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  
  ctx.stroke();
}

export { renderPortfolio };
