// API Client for Demony Backend
function Api(baseUrl) {
  this.baseUrl = baseUrl || import.meta.env.VITE_API_URL || 'https://demony-api.onrender.com/api';
  this.token = localStorage.getItem('demony_token') || null;
  this.user = JSON.parse(localStorage.getItem('demony_user') || 'null');
}

Api.prototype.request = function(endpoint, options) {
  var self = this;
  options = options || {};
  
  var headers = {
    'Content-Type': 'application/json'
  };
  
  if (self.token) {
    headers['Authorization'] = 'Bearer ' + self.token;
  }
  
  return fetch(self.baseUrl + endpoint, {
    method: options.method || 'GET',
    headers: headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  }).then(function(response) {
    // Handle auth errors - but not for login/signup endpoints
    if ((response.status === 401 || response.status === 403) && endpoint.indexOf('/auth/login') === -1 && endpoint.indexOf('/auth/signup') === -1) {
      localStorage.removeItem('demony_token');
      localStorage.removeItem('demony_user');
      self.token = null;
      self.user = null;
      throw new Error('Authentication required');
    }
    if (!response.ok) {
      return response.json().then(function(err) {
        // Preserve additional error properties like needsVerification
        var error = new Error(err.error || 'Request failed: ' + response.status);
        error.needsVerification = err.needsVerification;
        error.email = err.email;
        throw error;
      });
    }
    return response.json();
  });
};

Api.prototype.login = function(credentials) {
  var self = this;
  return this.request('/auth/login', {
    method: 'POST',
    body: credentials
  }).then(function(result) {
    self.token = result.token;
    self.user = result.user;
    localStorage.setItem('demony_token', result.token);
    localStorage.setItem('demony_user', JSON.stringify(result.user));
    return result;
  });
};

Api.prototype.signup = function(userData) {
  var self = this;
  return this.request('/auth/signup', {
    method: 'POST',
    body: userData
  }).then(function(result) {
    self.token = result.token;
    self.user = result.user;
    localStorage.setItem('demony_token', result.token);
    localStorage.setItem('demony_user', JSON.stringify(result.user));
    return result;
  });
};

Api.prototype.logout = function() {
  this.token = null;
  this.user = null;
  localStorage.removeItem('demony_token');
  localStorage.removeItem('demony_user');
};

// User profile
Api.prototype.getMe = function() {
  return this.request('/auth/me');
};

// Upload image
Api.prototype.uploadImage = function(imageBase64, filename) {
  return this.request('/upload/image', {
    method: 'POST',
    body: { image: imageBase64, filename: filename }
  });
};
Api.prototype.submitKyc = function(data) {
  return this.request('/auth/kyc/submit', {
    method: 'POST',
    body: data
  });
};

// Update phone number
Api.prototype.updatePhone = function(phone) {
  var self = this;
  return this.request('/auth/update-phone', {
    method: 'POST',
    body: { phone: phone }
  }).then(function(result) {
    // Update local user data
    if (self.user) {
      self.user.phone = result.phone;
      self.user.needsPhone = false;
      localStorage.setItem('demony_user', JSON.stringify(self.user));
    }
    return result;
  });
};

Api.prototype.getKYCStatus = function() {
  return this.getMe().then(function(user) {
    return { status: user.kycStatus };
  });
};

// Projects
Api.prototype.getProjects = function(params) {
  // Filter out empty values to avoid sending empty params
  var cleanParams = {};
  if (params) {
    Object.keys(params).forEach(function(key) {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        cleanParams[key] = params[key];
      }
    });
  }
  var query = Object.keys(cleanParams).length > 0 ? '?' + new URLSearchParams(cleanParams).toString() : '';
  return this.request('/projects' + query);
};

Api.prototype.getProject = function(id) {
  return this.request('/projects/' + id);
};

// Business owner - submit project
Api.prototype.submitProject = function(data) {
  return this.request('/projects/submit', {
    method: 'POST',
    body: data
  });
};

Api.prototype.getMyProjects = function() {
  return this.request('/projects/my/submissions');
};

Api.prototype.updateMyProject = function(id, data) {
  return this.request('/projects/my/' + id, {
    method: 'PUT',
    body: data
  });
};

// Investments
Api.prototype.invest = function(data) {
  return this.request('/investments', {
    method: 'POST',
    body: data
  });
};

Api.prototype.investWithPaystack = function(data) {
  return this.request('/investments/pay', {
    method: 'POST',
    body: data
  });
};

Api.prototype.verifyInvestment = function(reference) {
  return this.request('/investments/verify/' + reference);
};

Api.prototype.getMyInvestments = function() {
  return this.request('/investments/my');
};

// Get profit history for an investment
Api.prototype.getProfitHistory = function(investmentId) {
  return this.request('/investments/' + investmentId + '/profit-history');
};

// Get project updates and details (for investors only)
Api.prototype.getProjectUpdates = function(investmentId) {
  return this.request('/investments/' + investmentId + '/project-updates');
};

// Calculate projected returns (informational only)
Api.prototype.calculateReturns = function(projectId, amount, durationMonths) {
  return this.request('/projects/' + projectId + '/calculate-returns', {
    method: 'POST',
    body: { amount: amount, durationMonths: durationMonths }
  });
};

// Portfolio
Api.prototype.getPortfolio = function() {
  return this.request('/portfolio');
};

// ==================== WALLET ====================

Api.prototype.getWalletBalance = function() {
  return this.request('/wallet/balance');
};

Api.prototype.getTransactions = function(params) {
  var query = params ? '?' + new URLSearchParams(params).toString() : '';
  return this.request('/wallet/transactions' + query);
};

Api.prototype.initializeDeposit = function(amount) {
  return this.request('/wallet/deposit/initialize', {
    method: 'POST',
    body: { amount: amount }
  });
};

Api.prototype.verifyDeposit = function(reference) {
  return this.request('/wallet/deposit/verify/' + reference);
};

Api.prototype.getBanks = function() {
  return this.request('/wallet/banks');
};

Api.prototype.verifyBankAccount = function(accountNumber, bankCode) {
  return this.request('/wallet/verify-account?account_number=' + accountNumber + '&bank_code=' + bankCode);
};

Api.prototype.requestWithdrawal = function(data) {
  return this.request('/wallet/withdraw', {
    method: 'POST',
    body: data
  });
};

Api.prototype.getMyWithdrawals = function() {
  return this.request('/withdrawals/my');
};

Api.prototype.cancelWithdrawal = function(id) {
  return this.request('/withdrawals/' + id, {
    method: 'DELETE'
  });
};

// ==================== SUPPORT ====================

Api.prototype.submitSupportTicket = function(data) {
  return this.request('/support/tickets', {
    method: 'POST',
    body: data
  });
};

Api.prototype.getTicketStatus = function(ticketId) {
  return this.request('/support/tickets/' + ticketId);
};

Api.prototype.getSystemStatus = function() {
  return this.request('/support/status');
};

// ==================== ADMIN API ====================
// Initialize admin namespace with proper binding
Api.prototype.getAdmin = function() {
  var self = this;
  return {
    // Stats
    getStats: function() {
      return self.request('/admin/stats');
    },
    
    // Users
    getUsers: function(params) {
      // Filter out empty values
      var cleanParams = {};
      if (params) {
        Object.keys(params).forEach(function(key) {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            cleanParams[key] = params[key];
          }
        });
      }
      var query = Object.keys(cleanParams).length > 0 ? '?' + new URLSearchParams(cleanParams).toString() : '';
      return self.request('/admin/users' + query);
    },
    
    getUser: function(id) {
      return self.request('/admin/users/' + id);
    },
    
    verifyKyc: function(id, action, reason) {
      return self.request('/admin/users/' + id + '/kyc', {
        method: 'POST',
        body: { action: action, reason: reason }
      });
    },
    
    setUserStatus: function(id, isActive, reason) {
      return self.request('/admin/users/' + id + '/status', {
        method: 'POST',
        body: { isActive: isActive, reason: reason }
      });
    },
    
    // Projects
    createProject: function(data) {
      return self.request('/admin/projects', {
        method: 'POST',
        body: data
      });
    },
    
    getProjects: function(params) {
      // Filter out empty values to avoid sending empty params
      var cleanParams = {};
      if (params) {
        Object.keys(params).forEach(function(key) {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            cleanParams[key] = params[key];
          }
        });
      }
      var query = Object.keys(cleanParams).length > 0 ? '?' + new URLSearchParams(cleanParams).toString() : '';
      return self.request('/admin/projects' + query);
    },
    
    reviewProject: function(id, action, feedback, changes) {
      return self.request('/admin/projects/' + id + '/review', {
        method: 'POST',
        body: { action: action, feedback: feedback, changes: changes }
      });
    },
    
    updateProject: function(id, data) {
      return self.request('/admin/projects/' + id, {
        method: 'PUT',
        body: data
      });
    },

    removeProject: function(id) {
      return self.request('/admin/projects/' + id, {
        method: 'DELETE'
      });
    },
    
    // Withdrawals
    getWithdrawals: function(params) {
      var query = params ? '?' + new URLSearchParams(params).toString() : '';
      return self.request('/admin/withdrawals' + query);
    },
    
    processWithdrawal: function(id, action, reason, transactionRef) {
      return self.request('/admin/withdrawals/' + id + '/process', {
        method: 'POST',
        body: { action: action, reason: reason, transactionRef: transactionRef }
      });
    },
    
    // Profits
    distributeProfits: function(projectId, profitAmount, description) {
      return self.request('/admin/projects/' + projectId + '/distribute-profits', {
        method: 'POST',
        body: { profitAmount: profitAmount, description: description }
      });
    },

    // Investments
    getInvestments: function(params) {
      var query = params ? '?' + new URLSearchParams(params).toString() : '';
      return self.request('/admin/investments' + query);
    },
    
    // Investment Lifecycle Management
    completeProject: function(projectId, returnPrincipal, note) {
      return self.request('/admin/projects/' + projectId + '/complete', {
        method: 'POST',
        body: { returnPrincipal: returnPrincipal, note: note }
      });
    },
    
    cancelProject: function(projectId, reason) {
      return self.request('/admin/projects/' + projectId + '/cancel', {
        method: 'POST',
        body: { reason: reason }
      });
    },
    
    cleanupOrphanedInvestments: function() {
      return self.request('/admin/investments/cleanup-orphaned', {
        method: 'POST'
      });
    },
    
    getInvestmentsSummary: function() {
      return self.request('/admin/investments/summary');
    },
    
    // End a specific investment (user-requested withdrawal)
    withdrawInvestment: function(investmentId, options) {
      return self.request('/admin/investments/' + investmentId + '/withdraw', {
        method: 'POST',
        body: {
          reason: options.reason,
          applyPenalty: options.applyPenalty || false,
          penaltyPercent: options.penaltyPercent || 10
        }
      });
    },
    
    // Get single investment details
    getInvestment: function(investmentId) {
      return self.request('/admin/investments/' + investmentId);
    },
    
    // Delete user (with investment handling)
    deleteUser: function(userId) {
      return self.request('/admin/users/' + userId, {
        method: 'DELETE'
      });
    },
    
    // Bulk delete users
    bulkDeleteUsers: function(userIds) {
      return self.request('/admin/users/bulk-delete', {
        method: 'POST',
        body: { userIds: userIds }
      });
    },
    
    // Project Updates (for investors)
    postProjectUpdate: function(projectId, title, message, type) {
      return self.request('/admin/projects/' + projectId + '/updates', {
        method: 'POST',
        body: { title: title, message: message, type: type || 'info' }
      });
    },
    
    getProjectUpdates: function(projectId) {
      return self.request('/admin/projects/' + projectId + '/updates');
    },
    
    deleteProjectUpdate: function(projectId, updateId) {
      return self.request('/admin/projects/' + projectId + '/updates/' + updateId, {
        method: 'DELETE'
      });
    },
    
    // Reports
    getFinancialReport: function(startDate, endDate) {
      var params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      var query = '?' + new URLSearchParams(params).toString();
      return self.request('/admin/reports/financial' + query);
    },
    
    // Get single project
    getProject: function(projectId) {
      return self.request('/admin/projects/' + projectId);
    },
    
    // KYC Management
    reviewKyc: function(userId, action, reason) {
      return self.request('/admin/users/' + userId + '/kyc', {
        method: 'POST',
        body: { action: action, reason: reason }
      });
    },
    
    // Verify user email (admin action)
    verifyUserEmail: function(userId) {
      return self.request('/admin/users/' + userId + '/verify-email', {
        method: 'POST'
      });
    },
    
    // Credit user wallet (manual deposit)
    creditUserWallet: function(options) {
      return self.request('/admin/wallet/credit', {
        method: 'POST',
        body: {
          userId: options.userId,
          email: options.email,
          amount: options.amount,
          reason: options.reason
        }
      });
    },
    
    // Send broadcast email
    sendBroadcastEmail: function(options) {
      return self.request('/admin/email/broadcast', {
        method: 'POST',
        body: {
          target: options.target,
          subject: options.subject,
          message: options.message
        }
      });
    },
    
    // Support Tickets
    getSupportTickets: function(params) {
      var cleanParams = {};
      if (params) {
        Object.keys(params).forEach(function(key) {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            cleanParams[key] = params[key];
          }
        });
      }
      var query = Object.keys(cleanParams).length > 0 ? '?' + new URLSearchParams(cleanParams).toString() : '';
      return self.request('/admin/support/tickets' + query);
    },
    
    getTicketDetail: function(ticketId) {
      return self.request('/admin/support/tickets/' + ticketId);
    },
    
    resolveTicket: function(ticketId, resolution) {
      return self.request('/admin/support/tickets/' + ticketId + '/resolve', {
        method: 'POST',
        body: { resolution: resolution }
      });
    },
    
    replyToTicket: function(ticketId, message) {
      return self.request('/admin/support/tickets/' + ticketId + '/reply', {
        method: 'POST',
        body: { message: message }
      });
    },
    
    // Referrals Management
    getReferrals: function(params) {
      var query = params ? '?' + new URLSearchParams(params).toString() : '';
      return self.request('/admin/referrals' + query);
    },
    
    // Transactions
    getTransactions: function(params) {
      var query = params ? '?' + new URLSearchParams(params).toString() : '';
      return self.request('/admin/transactions' + query);
    },
    
    // Audit Log
    getAuditLog: function(params) {
      var query = params ? '?' + new URLSearchParams(params).toString() : '';
      return self.request('/admin/audit-log' + query);
    }
  };
};

// ==================== REFERRALS ====================

Api.prototype.getReferralCode = function() {
  return this.request('/referrals/my-code');
};

Api.prototype.getReferralHistory = function() {
  return this.request('/referrals/history');
};

Api.prototype.validateReferralCode = function(code) {
  return this.request('/referrals/validate/' + code);
};

Api.prototype.trackReferral = function(code, refereeId, refereeEmail) {
  return this.request('/referrals/track', {
    method: 'POST',
    body: { code: code, refereeId: refereeId, refereeEmail: refereeEmail }
  });
};

Api.prototype.getReferralLeaderboard = function() {
  return this.request('/referrals/leaderboard');
};

// ==================== NOTIFICATIONS ====================
Api.prototype.getNotifications = function(options) {
  var query = '';
  if (options) {
    var params = [];
    if (options.limit) params.push('limit=' + options.limit);
    if (options.skip) params.push('skip=' + options.skip);
    if (options.unread) params.push('unread=true');
    if (params.length) query = '?' + params.join('&');
  }
  return this.request('/notifications' + query);
};

Api.prototype.markNotificationRead = function(id) {
  return this.request('/notifications/' + id + '/read', { method: 'PUT' });
};

Api.prototype.getUnreadCount = function() {
  return this.request('/notifications/unread-count');
};

Api.prototype.connectNotificationStream = function(onNotification) {
  var self = this;
  if (this._eventSource) {
    this._eventSource.close();
  }
  
  if (!this.token) return null;
  
  // SSE doesn't support Authorization headers natively, pass token as query param
  var url = this.baseUrl + '/notifications/stream?token=' + encodeURIComponent(this.token);
  
  var es = new EventSource(url);
  
  es.onmessage = function(event) {
    try {
      var data = JSON.parse(event.data);
      if (onNotification) {
        onNotification(data);
      }
    } catch (err) {
      // ignore parse errors
    }
  };
  
  es.onerror = function() {
    // Auto-reconnect is built into EventSource
    // But if we're logged out, close it
    if (!self.token) {
      es.close();
      self._eventSource = null;
    }
  };
  
  this._eventSource = es;
  return es;
};

Api.prototype.disconnectNotificationStream = function() {
  if (this._eventSource) {
    this._eventSource.close();
    this._eventSource = null;
  }
};

export { Api };
