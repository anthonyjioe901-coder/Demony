// Referrals Page - Dedicated page for referral management
import { escapeHtml } from '../utils.js';

function renderReferrals(container, api) {
  var user = api.user;
  
  if (!user) {
    container.innerHTML = 
      '<section>' +
        '<div class="page-header">' +
          '<h1>Referrals</h1>' +
          '<p>Earn rewards by referring friends</p>' +
        '</div>' +
        '<div class="card" style="text-align: center; padding: 2rem;">' +
          '<p style="margin-bottom: 1rem;">Please login to access referrals</p>' +
          '<button class="btn btn-primary" onclick="document.getElementById(\'login-btn\').click()">Login</button>' +
        '</div>' +
      '</section>';
    return;
  }
  
  container.innerHTML = 
    '<section>' +
      '<div class="page-header">' +
        '<h1 style="display: flex; align-items: center; gap: 0.5rem;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/><polyline points="12 2 12 12"/><polyline points="12 2 16 6"/><polyline points="12 2 8 6"/></svg> My Referrals</h1>' +
        '<p>Invite friends and earn rewards together</p>' +
      '</div>' +
      
      // Referral Overview Card
      '<div class="card" style="margin-bottom: 1.5rem; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%);">' +
        '<div style="text-align: center; padding: 1rem;">' +
          '<h2 style="font-size: 1.75rem; margin-bottom: 0.5rem;">Give GH₵20, Get GH₵20</h2>' +
          '<p style="color: var(--text-muted); margin-bottom: 1.5rem;">Share your unique code and both you and your friend get GH₵20 when they make their first investment!</p>' +
          
          // Referral Code Display
          '<div id="referral-code-display" style="margin-bottom: 1rem;">' +
            '<div style="text-align: center; padding: 1rem;">Loading your referral code...</div>' +
          '</div>' +
          
          // Share Buttons
          '<div id="share-buttons" style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; margin-top: 1rem;">' +
            '<button class="btn btn-outline" id="copy-link-btn" style="flex: 1; min-width: 120px; display: flex; align-items: center; justify-content: center; gap: 6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Link</button>' +
            '<button class="btn btn-outline" id="share-whatsapp" style="flex: 1; min-width: 120px; display: flex; align-items: center; justify-content: center; gap: 6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg> WhatsApp</button>' +
            '<button class="btn btn-outline" id="share-twitter" style="flex: 1; min-width: 120px; display: flex; align-items: center; justify-content: center; gap: 6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg> Twitter</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      
      // Referral Stats
      '<div class="stats-grid" style="margin-bottom: 1.5rem;" id="referral-stats-grid">' +
        '<div class="card stat-card">' +
          '<div class="value" id="total-referrals">--</div>' +
          '<div class="label">Total Referrals</div>' +
        '</div>' +
        '<div class="card stat-card">' +
          '<div class="value" style="color: var(--secondary-color);" id="pending-rewards">--</div>' +
          '<div class="label">Pending Rewards</div>' +
        '</div>' +
        '<div class="card stat-card">' +
          '<div class="value" style="color: var(--primary-color);" id="earned-rewards">--</div>' +
          '<div class="label">Total Earned</div>' +
        '</div>' +
      '</div>' +
      
      // How It Works
      '<div class="card" style="margin-bottom: 1.5rem;">' +
        '<h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> How It Works</h3>' +
        '<div style="display: grid; gap: 1rem;">' +
          '<div style="display: flex; align-items: flex-start; gap: 1rem;">' +
            '<div style="min-width: 32px; width: 32px; height: 32px; border-radius: 50%; background: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700;">1</div>' +
            '<div>' +
              '<h4 style="margin-bottom: 0.25rem;">Share Your Code</h4>' +
              '<p style="color: var(--text-muted); font-size: 0.9rem;">Send your unique referral code to friends via WhatsApp, Twitter, or any other platform.</p>' +
            '</div>' +
          '</div>' +
          '<div style="display: flex; align-items: flex-start; gap: 1rem;">' +
            '<div style="min-width: 32px; width: 32px; height: 32px; border-radius: 50%; background: var(--secondary-color); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700;">2</div>' +
            '<div>' +
              '<h4 style="margin-bottom: 0.25rem;">Friend Signs Up</h4>' +
              '<p style="color: var(--text-muted); font-size: 0.9rem;">Your friend creates an account using your referral code.</p>' +
            '</div>' +
          '</div>' +
          '<div style="display: flex; align-items: flex-start; gap: 1rem;">' +
            '<div style="min-width: 32px; width: 32px; height: 32px; border-radius: 50%; background: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700;">3</div>' +
            '<div>' +
              '<h4 style="margin-bottom: 0.25rem;">First Investment</h4>' +
              '<p style="color: var(--text-muted); font-size: 0.9rem;">When they make their first investment of GH₵100 or more, you both get GH₵20!</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      
      // Referral History
      '<div class="card">' +
        '<h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Referral History</h3>' +
        '<div id="referral-history-list">' +
          '<div style="text-align: center; padding: 2rem; color: var(--text-muted);">Loading referral history...</div>' +
        '</div>' +
      '</div>' +
      
      // Leaderboard Section
      '<div class="card" style="margin-top: 1.5rem;">' +
        '<h3 style="margin-bottom: 1rem;">🏆 Top Referrers</h3>' +
        '<div id="referral-leaderboard">' +
          '<div style="text-align: center; padding: 2rem; color: var(--text-muted);">Loading leaderboard...</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  
  // Load referral code
  loadReferralCode(api);
  
  // Load referral history
  loadReferralHistory(api);
  
  // Load leaderboard
  loadLeaderboard(api);
}

function loadReferralCode(api) {
  api.getReferralCode()
    .then(function(data) {
      var codeDisplay = document.getElementById('referral-code-display');
      if (!codeDisplay) return;
      
      var referralLink = window.location.origin + '?ref=' + data.code;
      
      codeDisplay.innerHTML = 
        '<div style="display: inline-block; background: var(--surface-color); padding: 1rem 2rem; border-radius: 0.75rem; border: 2px dashed var(--primary-color);">' +
          '<div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.25rem;">Your Referral Code</div>' +
          '<div style="font-size: 1.75rem; font-weight: 800; letter-spacing: 2px; color: var(--primary-color);">' + escapeHtml(data.code) + '</div>' +
        '</div>';
      
      // Update stats
      document.getElementById('total-referrals').textContent = data.totalReferrals || 0;
      document.getElementById('pending-rewards').textContent = 'GH₵' + ((data.pendingRewards || 0).toFixed(2));
      document.getElementById('earned-rewards').textContent = 'GH₵' + ((data.totalEarned || 0).toFixed(2));
      
      // Setup share buttons
      document.getElementById('copy-link-btn').addEventListener('click', function() {
        navigator.clipboard.writeText(referralLink).then(function() {
          showNotification('Referral link copied to clipboard!', 'success');
        });
      });
      
      document.getElementById('share-whatsapp').addEventListener('click', function() {
        var message = 'Join me on Demony and start investing in local businesses! Use my code ' + data.code + ' and we both get GH₵20! ' + referralLink;
        window.open('https://wa.me/?text=' + encodeURIComponent(message), '_blank');
        if (window.DemonyAnalytics) window.DemonyAnalytics.trackReferralShare('whatsapp');
      });
      
      document.getElementById('share-twitter').addEventListener('click', function() {
        var message = 'Start investing with @DemonyApp and earn GH₵20! Use my code ' + data.code + ' ' + referralLink;
        window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(message), '_blank');
        if (window.DemonyAnalytics) window.DemonyAnalytics.trackReferralShare('twitter');
      });
    })
    .catch(function(err) {
      var codeDisplay = document.getElementById('referral-code-display');
      if (codeDisplay) {
        codeDisplay.innerHTML = '<div style="color: var(--danger-color);">Failed to load referral code</div>';
      }
    });
}

function loadReferralHistory(api) {
  api.getReferralHistory()
    .then(function(data) {
      var historyList = document.getElementById('referral-history-list');
      if (!historyList) return;
      
      if (!data.referrals || data.referrals.length === 0) {
        historyList.innerHTML = 
          '<div style="text-align: center; padding: 2rem;">' +
            '<div style="font-size: 3rem; margin-bottom: 0.5rem;">🎯</div>' +
            '<p style="color: var(--text-muted);">No referrals yet. Start sharing your code!</p>' +
          '</div>';
        return;
      }
      
      var html = '<div style="display: grid; gap: 0.75rem;">';
      data.referrals.forEach(function(referral) {
        var statusBadge = referral.status === 'completed' 
          ? '<span style="padding: 0.25rem 0.75rem; background: var(--secondary-color); color: white; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">✓ Earned</span>'
          : referral.status === 'pending'
          ? '<span style="padding: 0.25rem 0.75rem; background: var(--warning-color); color: white; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">⏳ Pending</span>'
          : '<span style="padding: 0.25rem 0.75rem; background: var(--text-muted); color: white; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">Signed Up</span>';
        
        var date = new Date(referral.createdAt).toLocaleDateString();
        
        html += 
          '<div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--bg-secondary); border-radius: 0.5rem;">' +
            '<div>' +
              '<div style="font-weight: 600; margin-bottom: 0.25rem;">' + escapeHtml(referral.refereeName || 'New User') + '</div>' +
              '<div style="font-size: 0.85rem; color: var(--text-muted);">' + date + '</div>' +
            '</div>' +
            '<div style="text-align: right;">' +
              statusBadge +
              (referral.reward ? '<div style="font-size: 0.85rem; color: var(--secondary-color); margin-top: 0.25rem; font-weight: 600;">+GH₵' + referral.reward.toFixed(2) + '</div>' : '') +
            '</div>' +
          '</div>';
      });
      html += '</div>';
      
      historyList.innerHTML = html;
    })
    .catch(function() {
      var historyList = document.getElementById('referral-history-list');
      if (historyList) {
        historyList.innerHTML = '<div style="color: var(--danger-color); text-align: center;">Failed to load history</div>';
      }
    });
}

function loadLeaderboard(api) {
  api.getReferralLeaderboard()
    .then(function(data) {
      var leaderboard = document.getElementById('referral-leaderboard');
      if (!leaderboard) return;
      
      if (!data.leaders || data.leaders.length === 0) {
        leaderboard.innerHTML = '<div style="text-align: center; padding: 1rem; color: var(--text-muted);">No leaderboard data yet</div>';
        return;
      }
      
      var html = '<div style="display: grid; gap: 0.5rem;">';
      data.leaders.forEach(function(leader, index) {
        var medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1);
        var isCurrentUser = leader.userId === api.user.id;
        
        html += 
          '<div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: ' + 
          (isCurrentUser ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-secondary)') + 
          '; border-radius: 0.5rem; border-left: 3px solid ' + 
          (index < 3 ? 'var(--secondary-color)' : 'transparent') + ';">' +
            '<div style="display: flex; align-items: center; gap: 1rem;">' +
              '<div style="font-size: 1.25rem; font-weight: 700; min-width: 32px;">' + medal + '</div>' +
              '<div>' +
                '<div style="font-weight: 600;">' + escapeHtml(leader.name) + (isCurrentUser ? ' (You)' : '') + '</div>' +
              '</div>' +
            '</div>' +
            '<div style="text-align: right;">' +
              '<div style="font-weight: 700; color: var(--secondary-color);">' + leader.totalReferrals + ' referrals</div>' +
              '<div style="font-size: 0.85rem; color: var(--text-muted);">GH₵' + (leader.totalEarned || 0).toFixed(2) + ' earned</div>' +
            '</div>' +
          '</div>';
      });
      html += '</div>';
      
      leaderboard.innerHTML = html;
    })
    .catch(function() {
      var leaderboard = document.getElementById('referral-leaderboard');
      if (leaderboard) {
        leaderboard.innerHTML = '<div style="color: var(--danger-color); text-align: center;">Failed to load leaderboard</div>';
      }
    });
}

// Notification helper
function showNotification(message, type) {
  var notification = document.createElement('div');
  notification.className = 'notification notification-' + type;
  notification.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 1rem 1.5rem; background: var(--surface-color); border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 10000; border-left: 4px solid ' + 
    (type === 'success' ? 'var(--secondary-color)' : type === 'error' ? 'var(--danger-color)' : 'var(--primary-color)') + ';';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(function() {
    notification.remove();
  }, 3000);
}

export { renderReferrals };
