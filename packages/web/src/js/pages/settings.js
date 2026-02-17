// Settings Page
import { escapeAttr } from '../utils.js';

function renderSettings(container, api) {
  var user = api.user;
  
  if (!user) {
    container.innerHTML = 
      '<section>' +
        '<div class="page-header">' +
          '<h1>Settings</h1>' +
          '<p>Manage your account settings</p>' +
        '</div>' +
        '<div class="card" style="text-align: center; padding: 2rem;">' +
          '<p style="margin-bottom: 1rem;">Please login to access settings</p>' +
          '<button class="btn btn-primary" onclick="document.getElementById(\'login-btn\').click()">Login</button>' +
        '</div>' +
      '</section>';
    return;
  }
  
  container.innerHTML = 
    '<section>' +
      '<div class="page-header">' +
        '<h1 style="display: flex; align-items: center; gap: 0.5rem;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> Settings</h1>' +
        '<p>Manage your account preferences</p>' +
      '</div>' +
      
      // Account Security Section
      '<div class="card" style="margin-bottom: 1rem;">' +
        '<h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Security' +
        '</h3>' +
        '<form id="change-password-form">' +
          '<div class="form-group">' +
            '<label for="current-password">Current Password</label>' +
            '<input type="password" id="current-password" required placeholder="Enter current password">' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="new-password">New Password</label>' +
            '<input type="password" id="new-password" required minlength="8" placeholder="Enter new password (min 8 characters)">' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="confirm-password">Confirm New Password</label>' +
            '<input type="password" id="confirm-password" required minlength="8" placeholder="Confirm new password">' +
          '</div>' +
          '<button type="submit" class="btn btn-primary">Change Password</button>' +
        '</form>' +
      '</div>' +
      
      // Profile Settings Section
      '<div class="card" style="margin-bottom: 1rem;">' +
        '<h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Profile Information' +
        '</h3>' +
        '<form id="update-profile-form">' +
          '<div class="form-group">' +
            '<label for="user-name">Full Name</label>' +
            '<input type="text" id="user-name" required placeholder="Your name" value="' + escapeAttr(user.name) + '">' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="user-email">Email Address</label>' +
            '<input type="email" id="user-email" required placeholder="your@email.com" value="' + escapeAttr(user.email) + '" disabled style="background: var(--bg-secondary); cursor: not-allowed;">' +
            '<small style="color: var(--text-muted); font-size: 0.85rem;">Email cannot be changed</small>' +
          '</div>' +
          (user.role === 'business_owner' ? 
            '<div class="form-group">' +
              '<label for="user-phone">Phone Number</label>' +
              '<input type="tel" id="user-phone" placeholder="+1234567890" value="' + escapeAttr(user.phone || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="business-name">Business Name</label>' +
              '<input type="text" id="business-name" placeholder="Your business name" value="' + escapeAttr(user.businessName || '') + '">' +
            '</div>'
          : '') +
          '<button type="submit" class="btn btn-primary">Update Profile</button>' +
        '</form>' +
      '</div>' +
      
      // Notification Preferences
      '<div class="card" style="margin-bottom: 1rem;">' +
        '<h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> Notification Preferences' +
        '</h3>' +
        '<form id="notification-settings-form">' +
          '<div style="display: flex; flex-direction: column; gap: 1rem;">' +
            '<label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;">' +
              '<span style="display: flex; align-items: center; gap: 0.5rem;">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>' +
                '<span>Email Notifications</span>' +
              '</span>' +
              '<input type="checkbox" id="email-notifications" class="toggle-switch" checked>' +
            '</label>' +
            '<label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;">' +
              '<span style="display: flex; align-items: center; gap: 0.5rem;">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' +
                '<span>Investment Updates</span>' +
              '</span>' +
              '<input type="checkbox" id="investment-updates" class="toggle-switch" checked>' +
            '</label>' +
            '<label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;">' +
              '<span style="display: flex; align-items: center; gap: 0.5rem;">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/><polyline points="12 2 12 12"/><polyline points="12 2 16 6"/><polyline points="12 2 8 6"/></svg>' +
                '<span>Referral Rewards</span>' +
              '</span>' +
              '<input type="checkbox" id="referral-notifications" class="toggle-switch" checked>' +
            '</label>' +
            '<label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;">' +
              '<span style="display: flex; align-items: center; gap: 0.5rem;">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
                '<span>Marketing & Promotions</span>' +
              '</span>' +
              '<input type="checkbox" id="marketing-notifications" class="toggle-switch">' +
            '</label>' +
          '</div>' +
          '<button type="submit" class="btn btn-primary" style="margin-top: 1rem;">Save Preferences</button>' +
        '</form>' +
      '</div>' +
      
      // Account Management
      '<div class="card" style="margin-bottom: 1rem;">' +
        '<h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; color: var(--danger-color);">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Danger Zone' +
        '</h3>' +
        '<div style="padding: 1rem; background: rgba(239, 68, 68, 0.1); border-radius: 0.5rem; border: 1px solid rgba(239, 68, 68, 0.2);">' +
          '<p style="margin-bottom: 1rem; color: var(--text-muted);">Once you delete your account, there is no going back. Please be certain.</p>' +
          '<button class="btn" id="delete-account-btn" style="background: var(--danger-color); color: white;">Delete Account</button>' +
        '</div>' +
      '</div>' +
    '</section>';
  
  // Change Password Form Handler
  document.getElementById('change-password-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var currentPassword = document.getElementById('current-password').value;
    var newPassword = document.getElementById('new-password').value;
    var confirmPassword = document.getElementById('confirm-password').value;
    
    if (newPassword !== confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }
    
    if (newPassword.length < 8) {
      showNotification('Password must be at least 8 characters', 'error');
      return;
    }
    
    // Call API to change password
    api.request('/auth/change-password', {
      method: 'POST',
      body: {
        currentPassword: currentPassword,
        newPassword: newPassword
      }
    })
    .then(function() {
      showNotification('Password changed successfully', 'success');
      document.getElementById('change-password-form').reset();
    })
    .catch(function(err) {
      showNotification(err.message || 'Failed to change password', 'error');
    });
  });
  
  // Update Profile Form Handler
  document.getElementById('update-profile-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var name = document.getElementById('user-name').value;
    var phone = user.role === 'business_owner' ? document.getElementById('user-phone').value : null;
    var businessName = user.role === 'business_owner' ? document.getElementById('business-name').value : null;
    
    var updateData = { name: name };
    if (phone) updateData.phone = phone;
    if (businessName) updateData.businessName = businessName;
    
    api.request('/auth/update-profile', {
      method: 'PUT',
      body: updateData
    })
    .then(function(result) {
      // Update stored user data
      api.user = result.user;
      localStorage.setItem('demony_user', JSON.stringify(result.user));
      showNotification('Profile updated successfully', 'success');
      
      // Update user name in navbar
      var userNameEl = document.getElementById('user-name-display');
      if (userNameEl) userNameEl.textContent = result.user.name;
    })
    .catch(function(err) {
      showNotification(err.message || 'Failed to update profile', 'error');
    });
  });
  
  // Notification Settings Form Handler
  document.getElementById('notification-settings-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var preferences = {
      emailNotifications: document.getElementById('email-notifications').checked,
      investmentUpdates: document.getElementById('investment-updates').checked,
      referralNotifications: document.getElementById('referral-notifications').checked,
      marketingNotifications: document.getElementById('marketing-notifications').checked
    };
    
    api.request('/auth/notification-preferences', {
      method: 'PUT',
      body: preferences
    })
    .then(function() {
      showNotification('Notification preferences saved', 'success');
    })
    .catch(function(err) {
      showNotification(err.message || 'Failed to save preferences', 'error');
    });
  });
  
  // Delete Account Handler
  document.getElementById('delete-account-btn').addEventListener('click', function() {
    if (confirm('Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted.')) {
      if (confirm('Last chance! Type DELETE in the confirmation to proceed.')) {
        // Show input modal for final confirmation
        var confirmText = prompt('Type DELETE to confirm account deletion:');
        if (confirmText === 'DELETE') {
          api.request('/auth/delete-account', {
            method: 'DELETE'
          })
          .then(function() {
            showNotification('Account deleted successfully', 'success');
            api.logout();
            window.DemonyApp.router.navigate('home');
          })
          .catch(function(err) {
            showNotification(err.message || 'Failed to delete account', 'error');
          });
        } else {
          showNotification('Account deletion cancelled', 'info');
        }
      }
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

export { renderSettings };
