// Simple client-side router
function Router(containerId) {
  this.container = document.getElementById(containerId);
  this.routes = {};
  this.currentRoute = null;
}

Router.prototype.addRoute = function(name, renderFn) {
  this.routes[name] = renderFn;
};

Router.prototype.navigate = function(routeName, params) {
  var route = this.routes[routeName];
  if (!route) {
    console.error('Route not found:', routeName);
    return;
  }
  
  this.currentRoute = routeName;
  
  // Update active link
  document.querySelectorAll('[data-page]').forEach(function(link) {
    link.classList.remove('active');
    if (link.getAttribute('data-page') === routeName) {
      link.classList.add('active');
    }
  });
  
  // Scroll to top
  window.scrollTo(0, 0);
  
  this.container.innerHTML = '';
  route(this.container, params);
  
  // Update URL without reload
  history.pushState({ route: routeName, params: params }, '', '#' + routeName);
};

// Handle browser back/forward
window.addEventListener('popstate', function(e) {
  if (e.state && e.state.route && window.DemonyApp) {
    window.DemonyApp.router.navigate(e.state.route, e.state.params);
  }
});

export { Router };
