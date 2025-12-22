// Support Page - Help Center, FAQ, Contact Form

// FAQ data organized by category
var faqData = [
  {
    category: 'Getting Started',
    icon: 'rocket',
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click "Sign Up" on the homepage, enter your details (name, email, password), select whether you want to invest or submit a business, and verify your email. You can start browsing projects immediately, but you\'ll need to complete KYC verification before making investments.'
      },
      {
        q: 'What is KYC verification and why is it required?',
        a: 'KYC (Know Your Customer) is a legal requirement to verify your identity. It helps us prevent fraud, money laundering, and ensures the safety of all users. You\'ll need to submit a government-issued ID and a selfie. Verification typically takes 24-48 hours.'
      },
      {
        q: 'What documents do I need for verification?',
        a: 'You\'ll need a valid government-issued ID (passport, national ID, or driver\'s license) and a recent selfie. For business owners, additional documents like business registration certificates may be required.'
      }
    ]
  },
  {
    category: 'Deposits & Wallet',
    icon: 'wallet',
    questions: [
      {
        q: 'How do I deposit money into my wallet?',
        a: 'Go to the Wallet page and click "Deposit". Enter the amount you want to deposit (minimum GH₵100) and you\'ll be redirected to Paystack to complete the payment using your preferred method (card, mobile money, or bank transfer).'
      },
      {
        q: 'How long do deposits take to reflect?',
        a: 'Card and mobile money deposits are typically instant. Bank transfers may take 1-3 business days depending on your bank. If your deposit doesn\'t reflect within 24 hours for instant methods, please contact support with your payment reference.'
      },
      {
        q: 'Is there a minimum deposit amount?',
        a: 'Yes, the minimum deposit is GH₵100. There is no maximum limit, but large deposits may require additional verification for security purposes.'
      },
      {
        q: 'Are my funds safe?',
        a: 'Yes. Your wallet funds are held securely and are separate from invested funds. We use bank-grade encryption and partner with licensed payment providers. However, note that invested funds carry investment risk.'
      }
    ]
  },
  {
    category: 'Investments',
    icon: 'chart',
    questions: [
      {
        q: 'How do I invest in a project?',
        a: 'Browse projects, select one you\'re interested in, click "Invest", enter the amount (minimum varies by project), acknowledge the risk disclosures, and confirm. The investment will be deducted from your wallet balance.'
      },
      {
        q: 'What is the lock-in period?',
        a: 'Each project has a lock-in period (typically 6-24 months) during which your principal investment cannot be withdrawn. This allows projects time to generate returns. Profits distributed during this period can be withdrawn anytime.'
      },
      {
        q: 'Can I cancel an investment?',
        a: 'Investments cannot be cancelled once confirmed due to the lock-in period. This is why we require you to acknowledge multiple risk disclosures before investing. Only invest what you can afford to lose.'
      },
      {
        q: 'How are profits calculated and distributed?',
        a: 'Profits are distributed based on your ownership percentage in the project. The frequency (monthly, quarterly, etc.) depends on the project. You receive 80% of profits proportional to your investment; 20% goes to platform operations.'
      },
      {
        q: 'What happens if a project fails?',
        a: 'If a project underperforms or fails, you may lose part or all of your investment. This is why we emphasize that all investments carry risk. We conduct due diligence on projects, but cannot guarantee success.'
      }
    ]
  },
  {
    category: 'Withdrawals',
    icon: 'bank',
    questions: [
      {
        q: 'How do I withdraw money?',
        a: 'Go to Wallet, click "Withdraw", select Bank or Mobile Money, enter the amount (minimum GH₵100) and your account details. Withdrawals are reviewed within 24 hours and processed within 1-3 business days.'
      },
      {
        q: 'Why is my withdrawal pending?',
        a: 'All withdrawals go through a security review to protect your account. Large withdrawals may require additional verification. If your withdrawal has been pending for more than 3 business days, please contact support.'
      },
      {
        q: 'What are the withdrawal limits?',
        a: 'The minimum withdrawal is GH₵100. For withdrawals above GH₵50,000, you must have completed KYC verification. Daily and monthly limits may apply based on your verification level.'
      },
      {
        q: 'Can I withdraw my invested principal?',
        a: 'Your principal is locked for the project\'s lock-in period. Only profits credited to your wallet can be withdrawn before the lock-in ends. After the lock-in period, you can withdraw your principal.'
      }
    ]
  },
  {
    category: 'Account & Security',
    icon: 'shield',
    questions: [
      {
        q: 'How do I reset my password?',
        a: 'Click "Login", then "Forgot Password", enter your email, and follow the link sent to your inbox. If you don\'t receive the email within 5 minutes, check your spam folder or contact support.'
      },
      {
        q: 'How do I update my profile information?',
        a: 'Go to Profile page where you can update your name, phone number, and other details. Note that email changes require verification, and some fields cannot be changed after KYC verification.'
      },
      {
        q: 'What should I do if I suspect unauthorized access?',
        a: 'Immediately change your password, check your recent transactions, and contact our support team. We can temporarily freeze your account while investigating any suspicious activity.'
      }
    ]
  },
  {
    category: 'Business Owners',
    icon: 'building',
    questions: [
      {
        q: 'How do I submit my business for funding?',
        a: 'Sign up as a Business Owner, complete your profile with business registration details, then submit a project proposal through the Business Dashboard. Our team will review and may request additional information.'
      },
      {
        q: 'How long does project approval take?',
        a: 'Initial review takes 5-10 business days. We may request additional documentation or clarification. Once approved, your project will be listed for investors. Complex projects may require longer review.'
      },
      {
        q: 'What fees do business owners pay?',
        a: '20% of distributed profits go to platform operations. There are no upfront listing fees. We only earn when your project generates profits for investors.'
      }
    ]
  }
];

// Support contact info (populated from config)
var supportInfo = {
  email: 'support@demony.com',
  phone: '+233 24 925 1305',
  whatsapp: '+233249251305',
  hours: 'Monday - Friday, 9:00 AM - 6:00 PM GMT'
};

// SVG Icons for modern look
var icons = {
  email: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M22 7l-10 7L2 7"></path></svg>',
  phone: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
  whatsapp: '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style="color: #25D366;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
  clock: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
  search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>',
  support: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>',
  form: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
  status: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
  rocket: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>',
  wallet: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>',
  chart: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>',
  bank: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
  shield: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
  building: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>'
};

function renderSupport(container, api) {
  var html = 
    '<section class="support-page">' +
      '<div class="page-header" style="text-align: center; margin-bottom: 2rem;">' +
        '<div style="margin-bottom: 0.5rem; color: var(--primary-color);">' + icons.support + '</div>' +
        '<h1 style="margin: 0;">Help & Support</h1>' +
        '<p style="color: var(--text-muted); max-width: 600px; margin: 0.5rem auto 0;">Find answers to common questions or get in touch with our support team</p>' +
      '</div>' +
      
      // Quick contact cards
      '<div class="support-contact-cards" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">' +
        '<div class="card" style="text-align: center; padding: 1.25rem;">' +
          '<div style="margin-bottom: 0.5rem; color: var(--primary-color);">' + icons.email + '</div>' +
          '<div style="font-weight: 600; margin-bottom: 0.25rem;">Email Us</div>' +
          '<a href="mailto:' + supportInfo.email + '" style="color: var(--primary-color); font-size: 0.9rem;">' + supportInfo.email + '</a>' +
        '</div>' +
        '<div class="card" style="text-align: center; padding: 1.25rem;">' +
          '<div style="margin-bottom: 0.5rem; color: #ef4444;">' + icons.phone + '</div>' +
          '<div style="font-weight: 600; margin-bottom: 0.25rem;">Call Us</div>' +
          '<a href="tel:' + supportInfo.phone.replace(/\s/g, '') + '" style="color: var(--primary-color); font-size: 0.9rem;">' + supportInfo.phone + '</a>' +
        '</div>' +
        '<div class="card" style="text-align: center; padding: 1.25rem;">' +
          '<div style="margin-bottom: 0.5rem;">' + icons.whatsapp + '</div>' +
          '<div style="font-weight: 600; margin-bottom: 0.25rem;">WhatsApp</div>' +
          '<a href="https://wa.me/' + supportInfo.whatsapp + '" target="_blank" style="color: #25D366; font-size: 0.9rem;">' + supportInfo.phone + '</a>' +
        '</div>' +
        '<div class="card" style="text-align: center; padding: 1.25rem;">' +
          '<div style="margin-bottom: 0.5rem; color: var(--secondary-color);">' + icons.clock + '</div>' +
          '<div style="font-weight: 600; margin-bottom: 0.25rem;">Support Hours</div>' +
          '<span style="color: var(--text-muted); font-size: 0.85rem;">' + supportInfo.hours + '</span>' +
        '</div>' +
      '</div>' +
      
      // Search FAQ
      '<div class="card" style="margin-bottom: 2rem;">' +
        '<div class="form-group" style="margin: 0;">' +
          '<div style="position: relative;">' +
            '<input type="text" id="faq-search" placeholder="Search for answers..." style="width: 100%; padding: 0.75rem 1rem 0.75rem 2.75rem; font-size: 1rem;">' +
            '<span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);">' + icons.search + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      
      // FAQ Accordion
      '<div id="faq-container">' +
        renderFaqSections(faqData) +
      '</div>' +
      
      // Contact Form Section
      '<div class="card" style="margin-top: 2rem;">' +
        '<h2 style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;"><span style="color: var(--primary-color);">' + icons.form + '</span> Submit a Support Request</h2>' +
        '<p style="color: var(--text-muted); margin-bottom: 1.5rem;">Can\'t find what you\'re looking for? Send us a message and we\'ll get back to you within 24 hours.</p>' +
        '<form id="support-form">' +
          '<div class="form-group">' +
            '<label for="support-category">Category *</label>' +
            '<select id="support-category" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background: var(--surface-color); color: var(--text-color);">' +
              '<option value="">Select a category</option>' +
              '<option value="account">Account & Verification</option>' +
              '<option value="deposit">Deposits & Wallet</option>' +
              '<option value="withdrawal">Withdrawals</option>' +
              '<option value="investment">Investments & Returns</option>' +
              '<option value="technical">Technical Issue</option>' +
              '<option value="business">Business/Project Submission</option>' +
              '<option value="other">Other</option>' +
            '</select>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="support-priority">Priority *</label>' +
            '<select id="support-priority" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background: var(--surface-color); color: var(--text-color);">' +
              '<option value="low">Low - General inquiry</option>' +
              '<option value="medium" selected>Medium - Need help soon</option>' +
              '<option value="high">High - Urgent issue affecting my funds</option>' +
            '</select>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="support-subject">Subject *</label>' +
            '<input type="text" id="support-subject" required placeholder="Brief description of your issue" maxlength="100">' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="support-message">Message *</label>' +
            '<textarea id="support-message" required rows="5" placeholder="Please describe your issue in detail. Include any relevant transaction IDs, dates, or error messages." style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem; resize: vertical; font-family: inherit; background: var(--surface-color); color: var(--text-color);"></textarea>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="support-email">Your Email *</label>' +
            '<input type="email" id="support-email" required placeholder="your@email.com">' +
            '<small style="color: var(--text-muted);">We\'ll send ticket updates to this email</small>' +
          '</div>' +
          '<button type="submit" class="btn btn-primary" style="width: 100%;">Submit Support Request</button>' +
        '</form>' +
      '</div>' +
      
      // Status page link
      '<div style="text-align: center; margin-top: 2rem; padding: 1rem; background: var(--surface-color); border-radius: 0.5rem;">' +
        '<p style="margin: 0; color: var(--text-muted); display: flex; align-items: center; justify-content: center; gap: 0.5rem;">' +
          '<span style="color: #22c55e;">' + icons.status + '</span> System Status: <a href="#" id="status-link" style="color: var(--secondary-color); font-weight: 600;">All Systems Operational</a>' +
        '</p>' +
      '</div>' +
    '</section>';
  
  container.innerHTML = html;
  
  // Pre-fill email if logged in
  if (api.user && api.user.email) {
    var emailInput = document.getElementById('support-email');
    if (emailInput) emailInput.value = api.user.email;
  }
  
  // FAQ search functionality
  var searchInput = document.getElementById('faq-search');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      var query = this.value.toLowerCase().trim();
      filterFaq(query);
    });
  }
  
  // FAQ accordion toggle
  container.addEventListener('click', function(e) {
    var questionEl = e.target.closest('.faq-question');
    if (questionEl) {
      var item = questionEl.closest('.faq-item');
      if (item) {
        item.classList.toggle('open');
      }
    }
  });
  
  // Support form submission
  var supportForm = document.getElementById('support-form');
  if (supportForm) {
    supportForm.addEventListener('submit', function(e) {
      e.preventDefault();
      submitSupportRequest(api);
    });
  }
}

function renderFaqSections(data) {
  return data.map(function(section) {
    var iconSvg = icons[section.icon] || section.icon;
    return '<div class="faq-section" data-category="' + section.category.toLowerCase() + '">' +
      '<h3 style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">' +
        '<span style="color: var(--primary-color);">' + iconSvg + '</span>' +
        '<span>' + section.category + '</span>' +
      '</h3>' +
      '<div class="faq-list">' +
        section.questions.map(function(faq, idx) {
          return '<div class="faq-item card" style="margin-bottom: 0.5rem;" data-q="' + faq.q.toLowerCase() + '" data-a="' + faq.a.toLowerCase() + '">' +
            '<div class="faq-question" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 1rem;">' +
              '<span style="font-weight: 600;">' + faq.q + '</span>' +
              '<span class="faq-toggle" style="transition: transform 0.2s;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg></span>' +
            '</div>' +
            '<div class="faq-answer" style="display: none; padding: 0 1rem 1rem; color: var(--text-muted); line-height: 1.6;">' +
              faq.a +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>';
  }).join('');
}

function filterFaq(query) {
  var items = document.querySelectorAll('.faq-item');
  var sections = document.querySelectorAll('.faq-section');
  
  if (!query) {
    items.forEach(function(item) { item.style.display = ''; });
    sections.forEach(function(section) { section.style.display = ''; });
    return;
  }
  
  sections.forEach(function(section) {
    var hasVisibleItems = false;
    var sectionItems = section.querySelectorAll('.faq-item');
    
    sectionItems.forEach(function(item) {
      var q = item.getAttribute('data-q') || '';
      var a = item.getAttribute('data-a') || '';
      var matches = q.indexOf(query) !== -1 || a.indexOf(query) !== -1;
      item.style.display = matches ? '' : 'none';
      if (matches) hasVisibleItems = true;
    });
    
    section.style.display = hasVisibleItems ? '' : 'none';
  });
}

function submitSupportRequest(api) {
  var category = document.getElementById('support-category').value;
  var priority = document.getElementById('support-priority').value;
  var subject = document.getElementById('support-subject').value;
  var message = document.getElementById('support-message').value;
  var email = document.getElementById('support-email').value;
  var submitBtn = document.querySelector('#support-form button[type="submit"]');
  
  if (!category || !subject || !message || !email) {
    alert('Please fill in all required fields.');
    return;
  }
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';
  
  api.submitSupportTicket({
    category: category,
    priority: priority,
    subject: subject,
    message: message,
    email: email
  })
    .then(function(result) {
      // Show success message
      var form = document.getElementById('support-form');
      form.innerHTML = 
        '<div style="text-align: center; padding: 2rem;">' +
          '<div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>' +
          '<h3 style="color: var(--secondary-color); margin-bottom: 0.5rem;">Request Submitted!</h3>' +
          '<p style="color: var(--text-muted); margin-bottom: 1rem;">Your ticket ID: <strong>' + result.ticketId + '</strong></p>' +
          '<p style="color: var(--text-muted); margin-bottom: 1.5rem;">We\'ll respond to <strong>' + email + '</strong> within 24 hours.</p>' +
          '<button class="btn btn-outline" onclick="location.reload()">Submit Another Request</button>' +
        '</div>';
    })
    .catch(function(err) {
      alert('Failed to submit request: ' + err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Support Request';
    });
}

// Add CSS for FAQ toggle animation
var style = document.createElement('style');
style.textContent = 
  '.faq-item.open .faq-answer { display: block !important; }' +
  '.faq-item.open .faq-toggle { transform: rotate(180deg); }' +
  '.faq-question:hover { background: var(--surface-color); border-radius: 0.5rem; }' +
  '.support-page { max-width: 900px; margin: 0 auto; padding: 1rem; }';
if (document.head) document.head.appendChild(style);

export { renderSupport };
