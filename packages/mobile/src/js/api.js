// API Client for Demony Mobile
function Api(baseUrl) {
  // Use local IP for Android emulator (10.0.2.2) or localhost for web
  // In production, this should be the real API URL
  this.baseUrl = baseUrl || import.meta.env.VITE_API_URL || 'https://demony-api.onrender.com/api';
  this.token = localStorage.getItem('demony_token') || null;
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
  
  // Handle different localhost for Android vs Web
  var url = self.baseUrl + endpoint;
  if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
    // Native app context
  }
  
  return fetch(url, {
    method: options.method || 'GET',
    headers: headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  }).then(function(response) {
    if (response.status === 401 || response.status === 403) {
      // Token expired or invalid
      localStorage.removeItem('demony_token');
      self.token = null;
      // Don't reload in mobile app, just throw
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

// Auth
Api.prototype.login = function(credentials) {
  var self = this;
  return this.request('/auth/login', {
    method: 'POST',
    body: credentials
  }).then(function(result) {
    self.token = result.token;
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
    localStorage.setItem('demony_token', result.token);
    localStorage.setItem('demony_user', JSON.stringify(result.user));
    return result;
  });
};

Api.prototype.logout = function() {
  this.token = null;
  localStorage.removeItem('demony_token');
  localStorage.removeItem('demony_user');
};

// Projects
Api.prototype.getProjects = function(params) {
  var query = params ? '?' + new URLSearchParams(params).toString() : '';
  return this.request('/projects' + query);
};

Api.prototype.getProject = function(id) {
  return this.request('/projects/' + id);
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

Api.prototype.getMyInvestments = function() {
  return this.request('/investments/my');
};

// Portfolio
Api.prototype.getPortfolio = function() {
  return this.request('/portfolio');
};

// Wallet
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

Api.prototype.getBanks = function() {
  return this.request('/wallet/banks');
};

Api.prototype.requestWithdrawal = function(data) {
  return this.request('/wallet/withdraw', {
    method: 'POST',
    body: data
  });
};

// Support
Api.prototype.submitSupportTicket = function(data) {
  return this.request('/support/tickets', {
    method: 'POST',
    body: data
  });
};

Api.prototype.getTicketStatus = function(ticketId) {
  return this.request('/support/tickets/' + ticketId);
};

export { Api };