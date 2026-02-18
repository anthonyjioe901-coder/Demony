// My Investments Page
import { escapeHtml } from '../utils.js';

function renderInvestments(container, api) {
  if (!api.token) {
    container.innerHTML = '<div style="text-align: center; padding: 4rem;"><h2>Please login to view your investments</h2></div>';
    return;
  }

  var html = 
    '<section>' +
      '<h2>My Investments</h2>' +
      '<p style="color: var(--text-muted); margin-bottom: 2rem;">Track your active investments and returns</p>' +
      
      // Important Notice
      '<div style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); border: 1px solid #3b82f6; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">' +
        '<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">' +
          '<span style="font-size: 1.25rem;">ℹ️</span>' +
          '<strong style="color: #1e40af;">How Profits Work</strong>' +
        '</div>' +
        '<p style="font-size: 0.85rem; color: #1e3a8a; margin: 0;">Profits are distributed when the project owner reports earnings. Your share is calculated as: <strong>(Your Investment ÷ Total Investment) × Total Profit</strong>. Profits can be withdrawn anytime, but your principal is locked until the project ends.</p>' +
      '</div>' +
      
      '<div id="portfolio-summary">Loading summary...</div>' +
      '<h3 style="margin: 2rem 0 1rem 0;">Active Investments</h3>' +
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
      // Compact 2x2 grid for mobile - use stats-grid class
      summaryContainer.innerHTML = 
        '<div class="stats-grid investment-stats">' +
          '<div class="card stat-card">' +
            '<div class="value" style="color: var(--primary-color) !important;">GH₵' + portfolio.totalInvested.toLocaleString() + '</div>' +
            '<div class="label">Total Invested</div>' +
            '<div class="stat-badge locked">🔒 Locked</div>' +
          '</div>' +
          '<div class="card stat-card">' +
            '<div class="value" style="color: var(--secondary-color) !important;">GH₵' + portfolio.totalReturn.toLocaleString() + '</div>' +
            '<div class="label">Total Earnings</div>' +
            '<div class="stat-badge withdrawable">✓ Withdrawable</div>' +
          '</div>' +
          '<div class="card stat-card">' +
            '<div class="value">GH₵' + portfolio.currentValue.toLocaleString() + '</div>' +
            '<div class="label">Portfolio Value</div>' +
            '<div class="stat-badge growth">+' + portfolio.returnPercent.toFixed(1) + '%</div>' +
          '</div>' +
          '<div class="card stat-card">' +
            '<div class="value">' + portfolio.activeInvestments + '</div>' +
            '<div class="label">Investments</div>' +
            '<div class="stat-badge">Active</div>' +
          '</div>' +
        '</div>';
    })
    .catch(function(err) {
      summaryContainer.innerHTML = '<div style="color: #ef4444;">Error loading summary</div>';
    });
  
  api.getMyInvestments()
    .then(function(investments) {
      if (investments.length === 0) {
        investmentsList.innerHTML = 
          '<div class="card" style="text-align: center; padding: 2rem;">' +
            '<p style="margin-bottom: 1rem;">No active investments found.</p>' +
            '<a href="#/projects" class="btn btn-primary">Browse Projects</a>' +
          '</div>';
        return;
      }
      
      investmentsList.innerHTML = investments.map(function(inv) {
        var amount = parseFloat(inv.amount) || 0;
        var earnings = parseFloat(inv.earnings) || 0;
        var currentValue = amount + earnings;
        var returnPercent = amount > 0 ? ((earnings / amount) * 100).toFixed(1) : 0;
        
        // Lock-in status
        var lockInEndDate = inv.lockInEndDate ? new Date(inv.lockInEndDate) : null;
        var now = new Date();
        var isLocked = lockInEndDate ? now < lockInEndDate : true;
        var daysRemaining = lockInEndDate ? Math.ceil((lockInEndDate - now) / (1000 * 60 * 60 * 24)) : 'N/A';
        var lockInPeriod = inv.lockInPeriodMonths || 12;
        
        return '<div class="card investment-item" style="margin-bottom: 1rem;">' +
          '<div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">' +
            '<div>' +
              '<h3 style="margin-bottom: 0.25rem;">' + escapeHtml(inv.projectName || inv.project_name || 'Project #' + inv.projectId) + '</h3>' +
              '<span class="badge">' + escapeHtml(inv.category || 'General') + '</span>' +
            '</div>' +
            '<div style="text-align: right;">' +
              '<span class="badge" style="background: ' + (isLocked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)') + '; color: ' + (isLocked ? '#ef4444' : '#10b981') + ';">' +
                (isLocked ? '🔒 Locked' : '✓ Unlocked') +
              '</span>' +
            '</div>' +
          '</div>' +
          
          // Investment Stats Grid
          '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; margin-bottom: 1rem;">' +
            '<div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; text-align: center;">' +
              '<div style="font-size: 0.75rem; color: var(--text-muted);">Principal</div>' +
              '<div style="font-size: 1.1rem; font-weight: 600;">GH₵' + amount.toLocaleString() + '</div>' +
              '<div style="font-size: 0.7rem; color: #ef4444;">🔒 Locked</div>' +
            '</div>' +
            '<div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; text-align: center;">' +
              '<div style="font-size: 0.75rem; color: var(--text-muted);">Earnings</div>' +
              '<div style="font-size: 1.1rem; font-weight: 600; color: var(--secondary-color);">GH₵' + earnings.toLocaleString() + '</div>' +
              '<div style="font-size: 0.7rem; color: #10b981;">✓ Withdrawable</div>' +
            '</div>' +
            '<div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; text-align: center;">' +
              '<div style="font-size: 0.75rem; color: var(--text-muted);">Total Value</div>' +
              '<div style="font-size: 1.1rem; font-weight: 600; color: var(--primary-color);">GH₵' + currentValue.toLocaleString() + '</div>' +
              '<div style="font-size: 0.7rem; color: var(--secondary-color);">+' + returnPercent + '%</div>' +
            '</div>' +
            '<div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; text-align: center;">' +
              '<div style="font-size: 0.75rem; color: var(--text-muted);">Lock-in Ends</div>' +
              '<div style="font-size: 1.1rem; font-weight: 600;">' + (lockInEndDate ? lockInEndDate.toLocaleDateString() : 'TBD') + '</div>' +
              '<div style="font-size: 0.7rem; color: var(--text-muted);">' + (isLocked && daysRemaining !== 'N/A' ? daysRemaining + ' days left' : '') + '</div>' +
            '</div>' +
          '</div>' +
          
          // Actions
          '<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">' +
            '<button class="btn btn-outline btn-sm view-details-btn" data-id="' + inv._id + '" style="font-size: 0.85rem; display: flex; align-items: center; gap: 4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> Details</button>' +
            '<button class="btn btn-outline btn-sm view-history-btn" data-id="' + inv._id + '" style="font-size: 0.85rem; display: flex; align-items: center; gap: 4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> History</button>' +
            (earnings > 0 ? '<a href="#/wallet" class="btn btn-primary btn-sm" style="font-size: 0.85rem; display: flex; align-items: center; gap: 4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Withdraw</a>' : '') +
          '</div>' +
        '</div>';
      }).join('');
      
      // Attach project details handlers
      document.querySelectorAll('.view-details-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var investmentId = this.getAttribute('data-id');
          showProjectDetailsModal(investmentId, api);
        });
      });
      
      // Attach profit history handlers
      document.querySelectorAll('.view-history-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var investmentId = this.getAttribute('data-id');
          showProfitHistoryModal(investmentId, api);
        });
      });
    })
    .catch(function(err) {
      investmentsList.innerHTML = '<div style="color: #ef4444;">Error loading investments: ' + escapeHtml(err.message) + '</div>';
    });
}

// Project Details Modal (for investors only)
function showProjectDetailsModal(investmentId, api) {
  var modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = 
    '<div class="modal-content" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">' +
      '<h2>📋 Project Details</h2>' +
      '<div id="project-details-content" style="min-height: 200px;">' +
        '<div style="text-align: center; padding: 2rem; color: var(--text-muted);">Loading...</div>' +
      '</div>' +
      '<button class="btn btn-outline" id="close-details-modal" style="width: 100%; margin-top: 1rem;">Close</button>' +
    '</div>';
  
  document.body.appendChild(modal);
  
  document.getElementById('close-details-modal').addEventListener('click', function() {
    modal.remove();
  });
  
  api.getProjectUpdates(investmentId)
    .then(function(data) {
      var content = document.getElementById('project-details-content');
      var p = data.projectDetails;
      var inv = data.yourInvestment;
      var stats = data.projectStats;
      
      // Format profit sharing
      var profitSharing = p.profitSharingRatio || { investor: 80, platform: 20 };
      
      // Risk level color
      var riskColor = { 'low': '#10b981', 'medium': '#f59e0b', 'high': '#ef4444' }[p.riskLevel] || '#f59e0b';
      
      content.innerHTML = 
        // Project Info Card
        '<div style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">' +
          '<h3 style="margin: 0 0 0.5rem 0; color: #1e40af;">' + escapeHtml(p.name) + '</h3>' +
          '<span class="badge" style="background: rgba(30, 64, 175, 0.2); color: #1e40af;">' + escapeHtml(p.category) + '</span>' +
          '<span class="badge" style="background: rgba(30, 64, 175, 0.2); color: #1e40af; margin-left: 0.5rem;">' + escapeHtml(p.status) + '</span>' +
        '</div>' +
        
        // Your Investment Summary
        '<div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">' +
          '<h4 style="margin: 0 0 0.75rem 0; font-size: 0.9rem;">💼 Your Investment</h4>' +
          '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.85rem;">' +
            '<div>Principal: <strong>GH₵' + inv.amount.toLocaleString() + '</strong></div>' +
            '<div>Ownership: <strong>' + (inv.ownershipPercent || stats.yourSharePercent).toFixed(2) + '%</strong></div>' +
            '<div>Invested: <strong>' + new Date(inv.investedAt).toLocaleDateString() + '</strong></div>' +
            '<div>Lock-in Ends: <strong>' + (inv.lockInEndDate ? new Date(inv.lockInEndDate).toLocaleDateString() : 'TBD') + '</strong></div>' +
          '</div>' +
        '</div>' +
        
        // Investment Terms
        '<div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">' +
          '<h4 style="margin: 0 0 0.75rem 0; font-size: 0.9rem;">📜 Investment Terms</h4>' +
          '<div style="display: grid; gap: 0.5rem; font-size: 0.85rem;">' +
            '<div style="display: flex; justify-content: space-between;"><span>Target Return:</span><strong>' + escapeHtml(p.targetReturn || '10-15%') + '</strong></div>' +
            '<div style="display: flex; justify-content: space-between;"><span>Risk Level:</span><strong style="color: ' + riskColor + ';">' + escapeHtml((p.riskLevel || 'medium').toUpperCase()) + '</strong></div>' +
            '<div style="display: flex; justify-content: space-between;"><span>Your Profit Share:</span><strong>' + profitSharing.investor + '%</strong></div>' +
            '<div style="display: flex; justify-content: space-between;"><span>Platform Fee:</span><strong>' + profitSharing.platform + '%</strong></div>' +
            '<div style="display: flex; justify-content: space-between;"><span>Lock-in Period:</span><strong>' + p.lockInPeriodMonths + ' months</strong></div>' +
            '<div style="display: flex; justify-content: space-between;"><span>Profit Distribution:</span><strong>' + formatFrequency(p.profitDistributionFrequency) + '</strong></div>' +
          '</div>' +
        '</div>' +
        
        // Project Stats
        '<div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">' +
          '<h4 style="margin: 0 0 0.75rem 0; font-size: 0.9rem;">📊 Project Stats</h4>' +
          '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.85rem;">' +
            '<div>Total Funding: <strong>GH₵' + p.totalFunding.toLocaleString() + '</strong></div>' +
            '<div>Investors: <strong>' + p.investorCount + '</strong></div>' +
            '<div>Total Profit Distributed: <strong style="color: var(--secondary-color);">GH₵' + stats.totalProfitDistributed.toLocaleString() + '</strong></div>' +
            '<div>Distributions: <strong>' + stats.distributionCount + '</strong></div>' +
          '</div>' +
          (p.lastDistributionAt ? '<div style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-muted);">Last distribution: ' + new Date(p.lastDistributionAt).toLocaleDateString() + '</div>' : '') +
        '</div>' +
        
        // Admin Updates Section
        '<div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem;">' +
          '<h4 style="margin: 0 0 0.75rem 0; font-size: 0.9rem;">📢 Project Updates</h4>' +
          (data.updates.length === 0 
            ? '<p style="color: var(--text-muted); font-size: 0.85rem; margin: 0;">No updates posted yet.</p>'
            : '<div style="max-height: 200px; overflow-y: auto;">' +
                data.updates.map(function(u) {
                  var typeIcon = { 'info': 'ℹ️', 'profit': '💰', 'milestone': '🎯', 'warning': '⚠️' }[u.type] || 'ℹ️';
                  var typeBg = { 'info': '#dbeafe', 'profit': '#d1fae5', 'milestone': '#fef3c7', 'warning': '#fef2f2' }[u.type] || '#dbeafe';
                  return '<div style="background: ' + typeBg + '; border-radius: 6px; padding: 0.75rem; margin-bottom: 0.5rem;">' +
                    '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">' +
                      '<strong style="font-size: 0.85rem;">' + typeIcon + ' ' + escapeHtml(u.title) + '</strong>' +
                      '<span style="font-size: 0.75rem; color: var(--text-muted);">' + new Date(u.createdAt).toLocaleDateString() + '</span>' +
                    '</div>' +
                    '<p style="margin: 0; font-size: 0.8rem;">' + escapeHtml(u.message) + '</p>' +
                  '</div>';
                }).join('') +
              '</div>'
          ) +
        '</div>' +
        
        // Important Notice
        '<div style="background: #fef3c7; border-radius: 8px; padding: 0.75rem; margin-top: 1rem; font-size: 0.8rem;">' +
          '<strong>💡 How profits work:</strong> When the admin distributes project profits, your share is automatically calculated based on your ownership percentage and credited to your wallet.' +
        '</div>';
    })
    .catch(function(err) {
      document.getElementById('project-details-content').innerHTML = 
        '<div style="text-align: center; padding: 2rem; color: #ef4444;">Error loading project details: ' + escapeHtml(err.message) + '</div>';
    });
}

// Helper to format frequency
function formatFrequency(freq) {
  var map = {
    'monthly': 'Monthly',
    'quarterly': 'Quarterly', 
    'annually': 'Annually',
    'as_realized': 'As Profits Realized'
  };
  return map[freq] || 'As Profits Realized';
}

// Profit History Modal
function showProfitHistoryModal(investmentId, api) {
  var modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = 
    '<div class="modal-content" style="max-width: 500px;">' +
      '<h2>📊 Profit History</h2>' +
      '<div id="profit-history-content" style="min-height: 200px;">' +
        '<div style="text-align: center; padding: 2rem; color: var(--text-muted);">Loading...</div>' +
      '</div>' +
      '<button class="btn btn-outline" id="close-history-modal" style="width: 100%; margin-top: 1rem;">Close</button>' +
    '</div>';
  
  document.body.appendChild(modal);
  
  document.getElementById('close-history-modal').addEventListener('click', function() {
    modal.remove();
  });
  
  api.getProfitHistory(investmentId)
    .then(function(data) {
      var content = document.getElementById('profit-history-content');
      
      if (data.distributions.length === 0) {
        content.innerHTML = 
          '<div style="text-align: center; padding: 2rem;">' +
            '<div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>' +
            '<h3>No Profits Yet</h3>' +
            '<p style="color: var(--text-muted);">Profits will appear here once the project owner distributes earnings.</p>' +
            '<p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 1rem;">Your share will be calculated as:<br><strong>(Your Investment ÷ Total Investment) × Total Profit</strong></p>' +
          '</div>';
        return;
      }
      
      content.innerHTML = 
        // Summary
        '<div style="background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; text-align: center;">' +
          '<div style="font-size: 0.85rem; color: #065f46;">Total Earnings from ' + escapeHtml(data.projectName) + '</div>' +
          '<div style="font-size: 1.75rem; font-weight: 700; color: #047857;">GH₵' + data.totalEarned.toLocaleString() + '</div>' +
          '<div style="font-size: 0.8rem; color: #065f46;">' + data.distributionCount + ' distribution(s)</div>' +
        '</div>' +
        
        // Distribution List
        '<div style="max-height: 300px; overflow-y: auto;">' +
          data.distributions.map(function(d) {
            return '<div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-bottom: 1px solid var(--border-color);">' +
              '<div>' +
                '<div style="font-weight: 500;">GH₵' + d.amount.toFixed(2) + '</div>' +
                '<div style="font-size: 0.75rem; color: var(--text-muted);">' + escapeHtml(d.description || 'Profit distribution') + '</div>' +
              '</div>' +
              '<div style="text-align: right;">' +
                '<div style="font-size: 0.85rem; color: var(--secondary-color);">' + (d.sharePercent * 100).toFixed(2) + '% share</div>' +
                '<div style="font-size: 0.75rem; color: var(--text-muted);">' + new Date(d.createdAt).toLocaleDateString() + '</div>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>';
    })
    .catch(function(err) {
      document.getElementById('profit-history-content').innerHTML = 
        '<div style="text-align: center; padding: 2rem; color: #ef4444;">Error loading profit history: ' + escapeHtml(err.message) + '</div>';
    });
}

export { renderInvestments };
