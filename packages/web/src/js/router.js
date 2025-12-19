// Simple client-side router
function Router(containerId) {
  this.container = document.getElementById(containerId);
  this.routes = {};
  this.currentRoute = null;
  this.isNavigating = false;
}

Router.prototype.addRoute = function(name, renderFn) {
  this.routes[name] = renderFn;
};

Router.prototype.navigate = function(routeName, params, replaceState) {
  var route = this.routes[routeName];
  if (!route) {
    console.error('Route not found:', routeName);
    return;
  }
  
  // Prevent duplicate navigation
  if (this.currentRoute === routeName && !params) {
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
  
  // Update URL without reload - use replaceState for initial load and popstate
  if (replaceState) {
    history.replaceState({ route: routeName, params: params }, '', '#' + routeName);
  } else {
    history.pushState({ route: routeName, params: params }, '', '#' + routeName);
  }
};

// Initialize from current hash
Router.prototype.init = function(defaultRoute) {
  var hash = window.location.hash.slice(1);
  var route = hash && this.routes[hash] ? hash : defaultRoute;
  this.navigate(route, null, true);
};

// Handle browser back/forward
window.addEventListener('popstate', function(e) {
  if (e.state && e.state.route && window.DemonyApp && window.DemonyApp.router) {
    window.DemonyApp.router.navigate(e.state.route, e.state.params, true);
  }
});

export { Router };
