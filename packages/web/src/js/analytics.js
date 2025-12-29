// Analytics Helper Module for Demony
// Tracks key conversion events for marketing optimization

var Analytics = {
  // Track page views
  trackPageView: function(pageName) {
    // Google Analytics
    if (typeof gtag === 'function') {
      gtag('event', 'page_view', {
        page_title: pageName,
        page_location: window.location.href
      });
    }
    // Facebook Pixel
    if (typeof fbq === 'function') {
      fbq('track', 'PageView');
    }
  },
  
  // Track signup completion
  trackSignup: function(userData) {
    // Google Analytics
    if (typeof window.trackEvent === 'function') {
      window.trackEvent('sign_up', {
        method: 'email',
        user_role: userData.role || 'investor'
      });
    }
    // Facebook Pixel
    if (typeof window.trackFBEvent === 'function') {
      window.trackFBEvent('CompleteRegistration', {
        content_name: 'User Registration',
        status: 'success'
      });
    }
    console.log('📊 Analytics: Signup tracked');
  },
  
  // Track login
  trackLogin: function() {
    if (typeof window.trackEvent === 'function') {
      window.trackEvent('login', {
        method: 'email'
      });
    }
    console.log('📊 Analytics: Login tracked');
  },
  
  // Track investment (purchase event)
  trackInvestment: function(projectId, projectName, amount, category) {
    // Google Analytics - Purchase event
    if (typeof window.trackEvent === 'function') {
      window.trackEvent('purchase', {
        transaction_id: 'INV_' + Date.now(),
        value: amount,
        currency: 'GHS',
        items: [{
          item_id: projectId,
          item_name: projectName,
          item_category: category || 'Investment',
          price: amount,
          quantity: 1
        }]
      });
    }
    // Facebook Pixel - Purchase event
    if (typeof window.trackFBEvent === 'function') {
      window.trackFBEvent('Purchase', {
        value: amount,
        currency: 'GHS',
        content_name: projectName,
        content_category: category || 'Investment',
        content_ids: [projectId],
        content_type: 'product'
      });
    }
    console.log('📊 Analytics: Investment tracked - GH₵' + amount);
  },
  
  // Track wallet deposit
  trackDeposit: function(amount) {
    if (typeof window.trackEvent === 'function') {
      window.trackEvent('add_payment_info', {
        value: amount,
        currency: 'GHS'
      });
    }
    if (typeof window.trackFBEvent === 'function') {
      window.trackFBEvent('AddPaymentInfo', {
        value: amount,
        currency: 'GHS'
      });
    }
    console.log('📊 Analytics: Deposit tracked - GH₵' + amount);
  },
  
  // Track referral share
  trackReferralShare: function(platform) {
    if (typeof window.trackEvent === 'function') {
      window.trackEvent('share', {
        method: platform,
        content_type: 'referral'
      });
    }
    console.log('📊 Analytics: Referral share tracked - ' + platform);
  },
  
  // Track project view
  trackProjectView: function(projectId, projectName, category) {
    if (typeof window.trackEvent === 'function') {
      window.trackEvent('view_item', {
        items: [{
          item_id: projectId,
          item_name: projectName,
          item_category: category || 'Project'
        }]
      });
    }
    if (typeof window.trackFBEvent === 'function') {
      window.trackFBEvent('ViewContent', {
        content_ids: [projectId],
        content_name: projectName,
        content_category: category || 'Project',
        content_type: 'product'
      });
    }
  },
  
  // Track add to cart (start investment flow)
  trackStartInvestment: function(projectId, projectName, amount) {
    if (typeof window.trackEvent === 'function') {
      window.trackEvent('begin_checkout', {
        value: amount,
        currency: 'GHS',
        items: [{
          item_id: projectId,
          item_name: projectName,
          price: amount
        }]
      });
    }
    if (typeof window.trackFBEvent === 'function') {
      window.trackFBEvent('InitiateCheckout', {
        value: amount,
        currency: 'GHS',
        content_ids: [projectId],
        content_name: projectName
      });
    }
    console.log('📊 Analytics: Start investment tracked');
  },
  
  // Track KYC submission
  trackKYCSubmit: function() {
    if (typeof window.trackEvent === 'function') {
      window.trackEvent('submit_application', {
        form_name: 'KYC Verification'
      });
    }
    console.log('📊 Analytics: KYC submission tracked');
  }
};

export { Analytics };
