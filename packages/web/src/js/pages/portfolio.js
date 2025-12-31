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
      '<div id="referral-widget" class="referral-card-future">' +
        '<div class="referral-card-content">' +
          '<div class="referral-header">' +
            '<div class="referral-icon-wrapper">' +
              '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M20 12V22H4V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
                '<path d="M22 7H2V12H22V7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
                '<path d="M12 22V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
                '<path d="M12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C11 2 12 7 12 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
                '<path d="M12 7H16.5C17.163 7 17.7989 6.73661 18.2678 6.26777C18.7366 5.79893 19 5.16304 19 4.5C19 3.83696 18.7366 3.20107 18.2678 2.73223C17.7989 2.26339 17.163 2 16.5 2C13 2 12 7 12 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
              '</svg>' +
            '</div>' +
            '<div class="referral-title">' +
              '<h3>Give GH₵20, Get GH₵20</h3>' +
              '<p>Invite friends to the future of investing</p>' +
            '</div>' +
          '</div>' +
          
          '<div id="referral-code-section" class="referral-code-section">' +
            '<div style="text-align: center; color: rgba(255,255,255,0.5);">Loading your code...</div>' +
          '</div>' +
          
          '<div id="referral-progress" class="referral-progress-section"></div>' +
          
          '<div id="referral-stats" class="referral-stats-grid">' +
          '</div>' +
        '</div>' +
        '<div class="referral-glow"></div>' +
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
        '<div class="referral-code-container">' +
          '<div class="referral-code-label">Your referral code</div>' +
          '<div class="referral-code-wrapper">' +
            '<div id="referral-code-display" class="referral-code-text">' + data.code + '</div>' +
            '<button id="copy-referral-btn" class="referral-copy-btn">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>' +
              '<span>Copy</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div class="referral-share-actions">' +
          '<button id="share-whatsapp" class="share-btn share-whatsapp">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>' +
            '<span>WhatsApp</span>' +
          '</button>' +
          '<button id="share-twitter" class="share-btn share-twitter">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>' +
            '<span>Twitter</span>' +
          '</button>' +
          '<button id="share-facebook" class="share-btn share-facebook">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' +
            '<span>Facebook</span>' +
          '</button>' +
        '</div>';
      
      // Stats
      if (statsSection && data.stats) {
        var progressSection = document.getElementById('referral-progress');
        
        // Show qualification progress
        if (progressSection && !data.stats.isQualified) {
          var progressPercent = data.stats.progress || 0;
          progressSection.innerHTML = 
            '<div class="referral-progress-header">' +
              '<span class="referral-progress-label"><strong>' + data.stats.qualifiedReferrals + '/' + data.stats.qualifyingNeeded + '</strong> Qualified Referrals</span>' +
              '<span class="referral-progress-percent">' + progressPercent + '%</span>' +
            '</div>' +
            '<div class="referral-progress-bar-bg">' +
              '<div class="referral-progress-bar-fill" style="width: ' + progressPercent + '%;"></div>' +
            '</div>' +
            '<p class="referral-lock-msg">' +
              '<span>🔒</span> Earnings locked until ' + data.stats.qualifyingNeeded + ' qualified referrals (GH₵100+ investment each)' +
            '</p>';
        } else if (progressSection && data.stats.isQualified) {
          progressSection.innerHTML = 
            '<div class="referral-unlocked-msg">' +
              '<span>✅</span> <strong>Qualified!</strong> All earnings unlocked' +
            '</div>';
        }
        
        statsSection.innerHTML = 
          '<div class="referral-stat-item">' +
            '<div class="referral-stat-value">' + data.stats.totalReferrals + '</div>' +
            '<div class="referral-stat-label">Referred</div>' +
          '</div>' +
          '<div class="referral-stat-item">' +
            '<div class="referral-stat-value">' + data.stats.qualifiedReferrals + '/' + data.stats.qualifyingNeeded + '</div>' +
            '<div class="referral-stat-label">Qualified</div>' +
          '</div>' +
          '<div class="referral-stat-item">' +
            '<div class="referral-stat-value">GH₵' + (data.stats.isQualified ? data.stats.availableEarnings : data.stats.lockedEarnings) + '</div>' +
            '<div class="referral-stat-label">' + (data.stats.isQualified ? 'Available' : 'Locked') + '</div>' +
          '</div>';
      }
      
      // Copy button
      var copyBtn = document.getElementById('copy-referral-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', function() {
          navigator.clipboard.writeText(data.shareUrl).then(function() {
            var originalHtml = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span>✓</span> <span>Copied!</span>';
            copyBtn.classList.add('copied');
            setTimeout(function() {
              copyBtn.innerHTML = originalHtml;
              copyBtn.classList.remove('copied');
            }, 2000);
          });
        });
      }
      
      // Social share buttons
      var shareMessage = 'Join me on Demony and get GH₵20 bonus on your first investment! Use my code: ' + data.code + ' 🚀';
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
