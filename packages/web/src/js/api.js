// API Client for Demony Backend
function Api(baseUrl) {
  this.baseUrl = baseUrl || import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
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
  
  return fetch(self.baseUrl + endpoint, {
    method: options.method || 'GET',
    headers: headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  }).then(function(response) {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('demony_token');
      self.token = null;
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

Api.prototype.getProjects = function(params) {
  var query = params ? '?' + new URLSearchParams(params).toString() : '';
  return this.request('/projects' + query);
};

Api.prototype.getProject = function(id) {
  return this.request('/projects/' + id);
};

Api.prototype.invest = function(data) {
  return this.request('/investments', {
    method: 'POST',
    body: data
  });
};

Api.prototype.getMyInvestments = function() {
  return this.request('/investments/my');
};

Api.prototype.getPortfolio = function() {
  return this.request('/portfolio');
};

export { Api };
