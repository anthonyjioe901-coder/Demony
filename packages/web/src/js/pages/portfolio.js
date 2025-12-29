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
      
      // Referral Widget - Prominent placement
      '<div id="referral-widget" class="card" style="margin-bottom: 1.5rem; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; position: relative; overflow: hidden;">' +
        '<div style="position: absolute; top: -20px; right: -20px; font-size: 6rem; opacity: 0.1;">🎁</div>' +
        '<div style="position: relative; z-index: 1;">' +
          '<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">' +
            '<span style="font-size: 1.5rem;">🎁</span>' +
            '<h3 style="margin: 0; font-size: 1.1rem; font-weight: 700;">Give GH₵50, Get GH₵50</h3>' +
          '</div>' +
          '<p style="font-size: 0.85rem; opacity: 0.9; margin-bottom: 1rem;">Share your referral code and earn GH₵50 when friends invest!</p>' +
          '<div id="referral-code-section" style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 0.75rem; margin-bottom: 1rem;">' +
            '<div style="text-align: center; color: rgba(255,255,255,0.7);">Loading your code...</div>' +
          '</div>' +
          '<div id="referral-stats" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; text-align: center; font-size: 0.8rem;">' +
          '</div>' +
        '</div>' +
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
  loadReferralWidget(api);
}

function loadReferralWidget(api) {
  api.getReferralCode()
    .then(function(data) {
      var codeSection = document.getElementById('referral-code-section');
      var statsSection = document.getElementById('referral-stats');
      
      if (!codeSection) return;
      
      codeSection.innerHTML = 
        '<div style="display: flex; align-items: center; gap: 0.5rem;">' +
          '<div style="flex: 1;">' +
            '<div style="font-size: 0.7rem; opacity: 0.8; margin-bottom: 0.25rem;">Your referral code</div>' +
            '<div id="referral-code-display" style="font-family: monospace; font-size: 1.25rem; font-weight: 800; letter-spacing: 2px;">' + data.code + '</div>' +
          '</div>' +
          '<button id="copy-referral-btn" style="background: white; color: #6366f1; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 0.25rem;">' +
            '<span>📋</span> Copy' +
          '</button>' +
        '</div>' +
        '<div style="margin-top: 0.75rem; display: flex; gap: 0.5rem; justify-content: center;">' +
          '<button id="share-whatsapp" style="background: #25D366; color: white; border: none; padding: 0.5rem 0.75rem; border-radius: 8px; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 0.25rem;">' +
            '<span>💬</span> WhatsApp' +
          '</button>' +
          '<button id="share-twitter" style="background: #1DA1F2; color: white; border: none; padding: 0.5rem 0.75rem; border-radius: 8px; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 0.25rem;">' +
            '<span>🐦</span> Twitter' +
          '</button>' +
          '<button id="share-facebook" style="background: #1877F2; color: white; border: none; padding: 0.5rem 0.75rem; border-radius: 8px; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 0.25rem;">' +
            '<span>📘</span> Facebook' +
          '</button>' +
        '</div>';
      
      // Stats
      if (statsSection && data.stats) {
        statsSection.innerHTML = 
          '<div style="background: rgba(255,255,255,0.1); padding: 0.5rem; border-radius: 8px;">' +
            '<div style="font-size: 1.25rem; font-weight: 800;">' + data.stats.totalReferrals + '</div>' +
            '<div style="opacity: 0.8;">Referred</div>' +
          '</div>' +
          '<div style="background: rgba(255,255,255,0.1); padding: 0.5rem; border-radius: 8px;">' +
            '<div style="font-size: 1.25rem; font-weight: 800;">' + data.stats.completedReferrals + '</div>' +
            '<div style="opacity: 0.8;">Invested</div>' +
          '</div>' +
          '<div style="background: rgba(255,255,255,0.1); padding: 0.5rem; border-radius: 8px;">' +
            '<div style="font-size: 1.25rem; font-weight: 800;">GH₵' + data.stats.totalEarned + '</div>' +
            '<div style="opacity: 0.8;">Earned</div>' +
          '</div>';
      }
      
      // Copy button
      var copyBtn = document.getElementById('copy-referral-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', function() {
          navigator.clipboard.writeText(data.shareUrl).then(function() {
            copyBtn.innerHTML = '<span>✓</span> Copied!';
            setTimeout(function() {
              copyBtn.innerHTML = '<span>📋</span> Copy';
            }, 2000);
          });
        });
      }
      
      // Social share buttons
      var shareMessage = 'Join me on Demony and get GH₵50 bonus on your first investment! Use my code: ' + data.code + ' 🚀';
      var shareUrl = data.shareUrl;
      
      var whatsappBtn = document.getElementById('share-whatsapp');
      if (whatsappBtn) {
        whatsappBtn.addEventListener('click', function() {
          if (window.DemonyAnalytics) window.DemonyAnalytics.trackReferralShare('whatsapp');
          window.open('https://wa.me/?text=' + encodeURIComponent(shareMessage + ' ' + shareUrl), '_blank');
        });
      }
      
      var twitterBtn = document.getElementById('share-twitter');
      if (twitterBtn) {
        twitterBtn.addEventListener('click', function() {
          if (window.DemonyAnalytics) window.DemonyAnalytics.trackReferralShare('twitter');
          window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareMessage) + '&url=' + encodeURIComponent(shareUrl), '_blank');
        });
      }
      
      var facebookBtn = document.getElementById('share-facebook');
      if (facebookBtn) {
        facebookBtn.addEventListener('click', function() {
          if (window.DemonyAnalytics) window.DemonyAnalytics.trackReferralShare('facebook');
          window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareUrl) + '&quote=' + encodeURIComponent(shareMessage), '_blank');
        });
      }
    })
    .catch(function(err) {
      console.error('Error loading referral widget:', err);
      var codeSection = document.getElementById('referral-code-section');
      if (codeSection) {
        codeSection.innerHTML = '<div style="text-align: center; opacity: 0.7;">Unable to load referral code</div>';
      }
    });
}

function loadPortfolio(api) {
  api.getPortfolio()
    .then(function(portfolio) {
      // Portfolio Value Card
      document.getElementById('portfolio-value').innerHTML = 
        '<div style="text-align: center; padding: 0.5rem;">' +
          '<h3 style="color: var(--text-muted); font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem;">Portfolio Value</h3>' +
          '<div style="font-size: 2rem; font-weight: 800; color: var(--primary-color);">GH₵' + portfolio.currentValue.toLocaleString() + '</div>' +
          '<div style="color: var(--secondary-color); font-size: 0.9rem; margin-top: 0.25rem;">+GH₵' + portfolio.totalReturn.toLocaleString() + ' (' + portfolio.returnPercent.toFixed(1) + '%) all time</div>' +
        '</div>';
      
      // Stats Grid
      document.getElementById('portfolio-stats').innerHTML = 
        '<div class="card stat-card">' +
          '<div class="value" style="color: var(--secondary-color);">GH₵' + portfolio.totalInvested.toLocaleString() + '</div>' +
          '<div class="label">Total Invested</div>' +
        '</div>' +
        '<div class="card stat-card">' +
          '<div class="value">' + portfolio.activeInvestments + '</div>' +
          '<div class="label">Active Investments</div>' +
        '</div>';
      
      // Enable drilldown to investment list
      attachInvestmentDrilldown(api);
        
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

function attachInvestmentDrilldown(api) {
  var cards = document.querySelectorAll('#portfolio-stats .stat-card');
  if (!cards || cards.length === 0) return;
  cards.forEach(function(card) {
    card.style.cursor = 'pointer';
    card.setAttribute('title', 'Click to view detailed investments page');
    card.addEventListener('click', function() {
      // Navigate to investments page instead of showing modal
      if (window.DemonyApp && window.DemonyApp.router) {
        window.DemonyApp.router.navigate('investments');
      } else {
        window.location.hash = '#/investments';
      }
    });
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
