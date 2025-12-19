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
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('demony_token');
      localStorage.removeItem('demony_user');
      self.token = null;
      self.user = null;
      throw new Error('Authentication required');
    }
    if (!response.ok) {
      return response.json().then(function(err) {
        throw new Error(err.error || 'Request failed: ' + response.status);
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

Api.prototype.submitKyc = function(data) {
  return this.request('/auth/kyc/submit', {
    method: 'POST',
    body: data
  });
};

// Projects
Api.prototype.getProjects = function(params) {
  var query = params ? '?' + new URLSearchParams(params).toString() : '';
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

Api.prototype.getMyInvestments = function() {
  return this.request('/investments/my');
};

// Portfolio
Api.prototype.getPortfolio = function() {
  return this.request('/portfolio');
};

// Withdrawals
Api.prototype.requestWithdrawal = function(data) {
  return this.request('/withdrawals', {
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
      var query = params ? '?' + new URLSearchParams(params).toString() : '';
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
      var query = params ? '?' + new URLSearchParams(params).toString() : '';
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
    
    // Reports
    getFinancialReport: function(startDate, endDate) {
      var params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      var query = '?' + new URLSearchParams(params).toString();
      return self.request('/admin/reports/financial' + query);
    }
  };
};

export { Api };
