// Profile Page
function renderProfile(container, api) {
  var user = api.user;
  
  if (!user) {
    container.innerHTML = 
      '<section>' +
        '<div class="page-header">' +
          '<h1>Profile</h1>' +
          '<p>Manage your account</p>' +
        '</div>' +
        '<div class="card" style="text-align: center; padding: 2rem;">' +
          '<p style="margin-bottom: 1rem;">Please login to view your profile</p>' +
          '<button class="btn btn-primary" onclick="document.getElementById(\'login-btn\').click()">Login</button>' +
        '</div>' +
      '</section>';
    return;
  }
  
  var initials = user.name ? user.name.split(' ').map(function(n) { return n[0]; }).join('').toUpperCase() : '?';
  
  var html = 
    '<section>' +
      '<div class="page-header">' +
        '<h1>Profile</h1>' +
        '<p>Manage your account</p>' +
      '</div>' +
      
      // Profile Card
      '<div class="card" style="text-align: center; padding: 1.5rem; margin-bottom: 1rem;">' +
        '<div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 2rem; color: white; font-weight: 700;">' +
          initials +
        '</div>' +
        '<h2 style="margin-bottom: 0.25rem; font-size: 1.25rem;">' + user.name + '</h2>' +
        '<p style="color: var(--text-muted); font-size: 0.9rem;">' + user.email + '</p>' +
        '<span class="badge" style="margin-top: 0.75rem; display: inline-block;">' + 
          (user.role === 'investor' ? '💎 Investor' : user.role === 'business_owner' ? '🏢 Business Owner' : '👑 Admin') + 
        '</span>' +
      '</div>' +
      
      // Account Stats
      '<div class="stats-grid" style="margin-bottom: 1rem;">' +
        '<div class="card stat-card" id="profile-balance">' +
          '<div class="value" style="color: var(--secondary-color);">--</div>' +
          '<div class="label">Wallet Balance</div>' +
        '</div>' +
        '<div class="card stat-card" id="profile-invested">' +
          '<div class="value" style="color: var(--primary-color);">--</div>' +
          '<div class="label">Total Invested</div>' +
        '</div>' +
      '</div>' +
      
      // Menu Items
      '<div class="card">' +
        '<div class="profile-menu">' +
          '<a href="#wallet" class="profile-menu-item" data-page="wallet">' +
            '<span class="menu-icon">💳</span>' +
            '<span class="menu-text">Wallet</span>' +
            '<span class="menu-arrow">›</span>' +
          '</a>' +
          '<a href="#investments" class="profile-menu-item" data-page="investments">' +
            '<span class="menu-icon">📈</span>' +
            '<span class="menu-text">My Investments</span>' +
            '<span class="menu-arrow">›</span>' +
          '</a>' +
          '<a href="#portfolio" class="profile-menu-item" data-page="portfolio">' +
            '<span class="menu-icon">💼</span>' +
            '<span class="menu-text">Portfolio</span>' +
            '<span class="menu-arrow">›</span>' +
          '</a>' +
          '<div class="profile-menu-item" id="kyc-status-item">' +
            '<span class="menu-icon">🔐</span>' +
            '<span class="menu-text">KYC Status</span>' +
            '<span class="menu-status" id="kyc-badge">Checking...</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      
      // Logout Button
      '<button class="btn btn-outline" id="profile-logout" style="width: 100%; margin-top: 1rem; color: #ef4444; border-color: #ef4444;">' +
        '🚪 Logout' +
      '</button>' +
      
      // App Info
      '<div style="text-align: center; margin-top: 2rem; color: var(--text-muted); font-size: 0.75rem;">' +
        '<p>Demony v1.0.0</p>' +
        '<p>© 2025 Demony Investment Platform</p>' +
      '</div>' +
    '</section>';
  
  container.innerHTML = html;
  
  // Load balance
  api.getWalletBalance()
    .then(function(data) {
      document.getElementById('profile-balance').innerHTML = 
        '<div class="value" style="color: var(--secondary-color);">GH₵' + data.balance.toLocaleString() + '</div>' +
        '<div class="label">Wallet Balance</div>';
      document.getElementById('profile-invested').innerHTML = 
        '<div class="value" style="color: var(--primary-color);">GH₵' + data.totalInvested.toLocaleString() + '</div>' +
        '<div class="label">Total Invested</div>';
    })
    .catch(function() {
      document.getElementById('profile-balance').innerHTML = 
        '<div class="value" style="color: var(--secondary-color);">GH₵0</div>' +
        '<div class="label">Wallet Balance</div>';
      document.getElementById('profile-invested').innerHTML = 
        '<div class="value" style="color: var(--primary-color);">GH₵0</div>' +
        '<div class="label">Total Invested</div>';
    });
  
  // Check KYC status
  api.getKYCStatus()
    .then(function(data) {
      var badge = document.getElementById('kyc-badge');
      if (data.status === 'verified') {
        badge.textContent = '✓ Verified';
        badge.style.color = 'var(--secondary-color)';
      } else if (data.status === 'pending') {
        badge.textContent = '⏳ Pending';
        badge.style.color = '#f59e0b';
      } else {
        badge.textContent = 'Not Verified';
        badge.style.color = '#ef4444';
        // Add click to start KYC
        document.getElementById('kyc-status-item').style.cursor = 'pointer';
        document.getElementById('kyc-status-item').addEventListener('click', function() {
          showKYCModal(api);
        });
      }
    })
    .catch(function() {
      var badge = document.getElementById('kyc-badge');
      badge.textContent = 'Start KYC';
      badge.style.color = 'var(--primary-color)';
      document.getElementById('kyc-status-item').style.cursor = 'pointer';
      document.getElementById('kyc-status-item').addEventListener('click', function() {
        showKYCModal(api);
      });
    });
  
  // Menu item clicks
  var menuItems = container.querySelectorAll('.profile-menu-item[data-page]');
  menuItems.forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      var page = this.getAttribute('data-page');
      if (page && window.DemonyApp && window.DemonyApp.router) {
        window.DemonyApp.router.navigate(page);
      }
    });
  });
  
  // Logout
  document.getElementById('profile-logout').addEventListener('click', function() {
    api.logout();
    window.location.hash = '#home';
    window.location.reload();
  });
}

function showKYCModal(api) {
  var modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = 
    '<div class="modal-content">' +
      '<h2>🔐 KYC Verification</h2>' +
      '<p style="color: var(--text-muted); margin-bottom: 1.5rem;">Complete identity verification to unlock full platform features including withdrawals.</p>' +
      '<form id="kyc-form">' +
        '<div class="form-group">' +
          '<label for="id-type">ID Type</label>' +
          '<select id="id-type" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background: var(--surface-color); color: var(--text-color);">' +
            '<option value="">Select ID type</option>' +
            '<option value="national_id">National ID (Ghana Card)</option>' +
            '<option value="passport">Passport</option>' +
            '<option value="drivers_license">Driver\'s License</option>' +
          '</select>' +
        '</div>' +
        '<div class="form-group">' +
          '<label for="id-number">ID Number</label>' +
          '<input type="text" id="id-number" required placeholder="Enter your ID number">' +
        '</div>' +
        '<div class="form-actions">' +
          '<button type="button" class="btn btn-outline close-modal">Cancel</button>' +
          '<button type="submit" class="btn btn-primary">Submit for Review</button>' +
        '</div>' +
      '</form>' +
    '</div>';
  
  document.body.appendChild(modal);
  
  modal.querySelector('.close-modal').addEventListener('click', function() {
    modal.remove();
  });
  
  modal.addEventListener('click', function(e) {
    if (e.target === modal) modal.remove();
  });
  
  modal.querySelector('#kyc-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var idType = document.getElementById('id-type').value;
    var idNumber = document.getElementById('id-number').value;
    var submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    api.submitKYC({ idType: idType, idNumber: idNumber })
      .then(function() {
        modal.remove();
        window.DemonyApp.showToast('KYC submitted! Verification typically takes 1-2 business days.', 'success');
        // Refresh page
        window.DemonyApp.router.navigate('profile');
      })
      .catch(function(err) {
        alert('Error: ' + err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit for Review';
      });
  });
}

export { renderProfile };
