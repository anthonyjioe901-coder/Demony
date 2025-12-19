// Legal Pages - Terms of Service, Privacy Policy, Risk Disclosure

export function renderTerms(container) {
  container.innerHTML = `
    <section class="legal-page">
      <div class="legal-header">
        <h1>Terms of Service</h1>
        <p class="legal-updated">Last Updated: December 19, 2025</p>
      </div>
      
      <div class="legal-content">
        <div class="legal-important">
          <strong>⚠️ IMPORTANT NOTICE:</strong> By accessing or using the Demony platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, do not use this platform.
        </div>

        <h2>1. ACCEPTANCE OF TERMS</h2>
        <p>1.1. These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "Investor," or "you") and Demony Investment Platform ("Demony," "Company," "we," "us," or "our").</p>
        <p>1.2. By creating an account, accessing, or using our services, you confirm that:</p>
        <ul>
          <li>You are at least 18 years of age or the age of legal majority in your jurisdiction</li>
          <li>You have the legal capacity to enter into binding contracts</li>
          <li>You are not prohibited from using our services under applicable laws</li>
          <li>All information you provide is accurate, current, and complete</li>
        </ul>

        <h2>2. NATURE OF SERVICES</h2>
        <p>2.1. Demony provides a technology platform that facilitates connections between investors and investment opportunities. <strong>WE ARE NOT:</strong></p>
        <ul>
          <li>A registered broker-dealer, investment adviser, or securities exchange</li>
          <li>Providing personalized investment advice or recommendations</li>
          <li>Guaranteeing any returns on investments</li>
          <li>Acting as a fiduciary on your behalf</li>
        </ul>
        <p>2.2. All investment decisions are made solely by you. We provide information and tools, but the ultimate responsibility for investment choices rests entirely with you.</p>

        <h2>3. INVESTMENT RISKS - CRITICAL DISCLOSURE</h2>
        <div class="legal-warning">
          <h3>⚠️ HIGH-RISK INVESTMENT WARNING</h3>
          <p><strong>INVESTING INVOLVES SUBSTANTIAL RISK OF LOSS, INCLUDING THE POTENTIAL LOSS OF YOUR ENTIRE INVESTMENT. PAST PERFORMANCE IS NOT INDICATIVE OF FUTURE RESULTS.</strong></p>
        </div>
        <p>3.1. By using this platform, you acknowledge and accept that:</p>
        <ul>
          <li><strong>Capital at Risk:</strong> You may lose some or all of the money you invest</li>
          <li><strong>No Guaranteed Returns:</strong> There is no guarantee of any return on your investment</li>
          <li><strong>Illiquidity:</strong> Investments may be illiquid and you may not be able to sell or withdraw funds when desired</li>
          <li><strong>Market Volatility:</strong> Investment values can fluctuate significantly</li>
          <li><strong>Business Risk:</strong> Projects may fail, resulting in total loss of investment</li>
          <li><strong>Regulatory Risk:</strong> Changes in laws or regulations may adversely affect investments</li>
          <li><strong>Platform Risk:</strong> Technical failures or security breaches may occur</li>
        </ul>

        <h2>4. ELIGIBILITY AND ACCOUNT REQUIREMENTS</h2>
        <p>4.1. <strong>Investor Eligibility:</strong> You represent and warrant that:</p>
        <ul>
          <li>You meet the minimum age requirement (18 years or legal majority)</li>
          <li>You are investing for your own account or an account you are legally authorized to manage</li>
          <li>You have sufficient knowledge and experience to evaluate investment risks</li>
          <li>You can afford to lose the entire amount of your investment without affecting your lifestyle</li>
          <li>You are not using funds from illegal sources</li>
        </ul>
        <p>4.2. <strong>KYC/AML Compliance:</strong> We are required to verify your identity and may request documentation including but not limited to government-issued ID, proof of address, and source of funds verification.</p>

        <h2>5. USER RESPONSIBILITIES AND CONDUCT</h2>
        <p>5.1. You agree to:</p>
        <ul>
          <li>Provide accurate, truthful, and complete information</li>
          <li>Maintain the security and confidentiality of your account credentials</li>
          <li>Notify us immediately of any unauthorized access to your account</li>
          <li>Not use the platform for any illegal or fraudulent purposes</li>
          <li>Not manipulate or attempt to manipulate the platform or other users</li>
          <li>Not upload malicious code, viruses, or harmful content</li>
          <li>Comply with all applicable laws and regulations</li>
        </ul>

        <h2>6. FEES AND PAYMENTS</h2>
        <p>6.1. <strong>Platform Fees:</strong> We may charge fees for our services, which will be clearly disclosed before any transaction.</p>
        <p>6.2. <strong>Third-Party Fees:</strong> You are responsible for any bank fees, transfer fees, or other charges imposed by third parties.</p>
        <p>6.3. <strong>Tax Obligations:</strong> You are solely responsible for determining and paying any taxes arising from your investments. We do not provide tax advice.</p>

        <h2>7. LIMITATION OF LIABILITY</h2>
        <div class="legal-warning">
          <p><strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong></p>
        </div>
        <p>7.1. Demony, its officers, directors, employees, agents, and affiliates shall NOT be liable for:</p>
        <ul>
          <li>Any investment losses, regardless of cause</li>
          <li>Lost profits, revenue, data, or business opportunities</li>
          <li>Indirect, incidental, special, consequential, or punitive damages</li>
          <li>Actions or omissions of third parties, including project owners</li>
          <li>Technical failures, system outages, or security breaches beyond our reasonable control</li>
          <li>Errors or inaccuracies in information provided by third parties</li>
        </ul>
        <p>7.2. <strong>Maximum Liability:</strong> In no event shall our total liability exceed the amount of fees you have paid to us in the twelve (12) months preceding the claim.</p>

        <h2>8. INDEMNIFICATION</h2>
        <p>8.1. You agree to indemnify, defend, and hold harmless Demony and its officers, directors, employees, agents, and affiliates from any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising from:</p>
        <ul>
          <li>Your use of the platform</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any applicable laws</li>
          <li>Your investment decisions</li>
          <li>Any dispute between you and a third party</li>
        </ul>

        <h2>9. DISCLAIMERS</h2>
        <p>9.1. THE PLATFORM AND ALL SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.</p>
        <p>9.2. We disclaim all warranties including but not limited to:</p>
        <ul>
          <li>Merchantability and fitness for a particular purpose</li>
          <li>Accuracy, completeness, or reliability of any information</li>
          <li>Uninterrupted or error-free operation</li>
          <li>Security from unauthorized access</li>
        </ul>

        <h2>10. DISPUTE RESOLUTION AND ARBITRATION</h2>
        <p>10.1. <strong>Mandatory Arbitration:</strong> Any dispute arising from these Terms or your use of the platform shall be resolved through binding arbitration, not in court.</p>
        <p>10.2. <strong>Class Action Waiver:</strong> YOU WAIVE ANY RIGHT TO PARTICIPATE IN CLASS ACTIONS OR CLASS-WIDE ARBITRATION.</p>
        <p>10.3. <strong>Governing Law:</strong> These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.</p>
        <p>10.4. <strong>Time Limitation:</strong> Any claim must be filed within one (1) year after the cause of action arises.</p>

        <h2>11. INTELLECTUAL PROPERTY</h2>
        <p>11.1. All content, trademarks, logos, and intellectual property on the platform are owned by Demony or its licensors. You may not use, copy, or distribute any content without express written permission.</p>

        <h2>12. TERMINATION</h2>
        <p>12.1. We reserve the right to suspend or terminate your account at any time, with or without cause, with or without notice.</p>
        <p>12.2. Upon termination, you remain bound by these Terms with respect to your prior use of the platform and any ongoing investments.</p>

        <h2>13. MODIFICATIONS</h2>
        <p>13.1. We may modify these Terms at any time. Continued use of the platform after modifications constitutes acceptance of the updated Terms.</p>
        <p>13.2. Material changes will be communicated via email or platform notification.</p>

        <h2>14. SEVERABILITY</h2>
        <p>14.1. If any provision of these Terms is found unenforceable, the remaining provisions shall continue in full force and effect.</p>

        <h2>15. ENTIRE AGREEMENT</h2>
        <p>15.1. These Terms, together with the Privacy Policy and Risk Disclosure, constitute the entire agreement between you and Demony.</p>

        <div class="legal-signature">
          <p><strong>By creating an account or using the Demony platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</strong></p>
        </div>
      </div>
    </section>
  `;
}

export function renderPrivacy(container) {
  container.innerHTML = `
    <section class="legal-page">
      <div class="legal-header">
        <h1>Privacy Policy</h1>
        <p class="legal-updated">Last Updated: December 19, 2025</p>
      </div>
      
      <div class="legal-content">
        <div class="legal-important">
          This Privacy Policy describes how Demony Investment Platform ("Demony," "we," "us," or "our") collects, uses, stores, and protects your personal information.
        </div>

        <h2>1. INFORMATION WE COLLECT</h2>
        <h3>1.1. Information You Provide</h3>
        <ul>
          <li><strong>Account Information:</strong> Name, email address, phone number, date of birth</li>
          <li><strong>Identity Verification:</strong> Government-issued ID, proof of address, photographs</li>
          <li><strong>Financial Information:</strong> Bank account details, payment information, source of funds</li>
          <li><strong>Investment Information:</strong> Investment history, preferences, risk tolerance</li>
          <li><strong>Communications:</strong> Messages, support requests, feedback</li>
        </ul>

        <h3>1.2. Information Collected Automatically</h3>
        <ul>
          <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
          <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
          <li><strong>Location Data:</strong> Approximate location based on IP address</li>
          <li><strong>Cookies and Tracking:</strong> Cookies, web beacons, and similar technologies</li>
        </ul>

        <h2>2. HOW WE USE YOUR INFORMATION</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Verify your identity and prevent fraud (KYC/AML compliance)</li>
          <li>Process transactions and investments</li>
          <li>Communicate with you about your account and investments</li>
          <li>Send marketing communications (with your consent)</li>
          <li>Comply with legal and regulatory requirements</li>
          <li>Protect our rights and the security of our platform</li>
          <li>Analyze usage patterns and improve user experience</li>
        </ul>

        <h2>3. INFORMATION SHARING</h2>
        <p>We may share your information with:</p>
        <ul>
          <li><strong>Service Providers:</strong> Third parties who assist in operating our platform (payment processors, identity verification services, cloud providers)</li>
          <li><strong>Project Owners:</strong> Limited information necessary for investment processing</li>
          <li><strong>Legal Authorities:</strong> When required by law, court order, or government request</li>
          <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
          <li><strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
        </ul>
        <p><strong>We do not sell your personal information to third parties for marketing purposes.</strong></p>

        <h2>4. DATA SECURITY</h2>
        <p>We implement industry-standard security measures including:</p>
        <ul>
          <li>Encryption of data in transit and at rest</li>
          <li>Secure authentication protocols</li>
          <li>Regular security audits and monitoring</li>
          <li>Access controls and employee training</li>
          <li>Incident response procedures</li>
        </ul>
        <p>However, no system is 100% secure. We cannot guarantee absolute security of your data.</p>

        <h2>5. DATA RETENTION</h2>
        <p>We retain your information for as long as:</p>
        <ul>
          <li>Your account is active</li>
          <li>Necessary to provide our services</li>
          <li>Required by law (typically 5-7 years for financial records)</li>
          <li>Needed to resolve disputes or enforce agreements</li>
        </ul>

        <h2>6. YOUR RIGHTS</h2>
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Correction:</strong> Request correction of inaccurate data</li>
          <li><strong>Deletion:</strong> Request deletion of your data (subject to legal retention requirements)</li>
          <li><strong>Portability:</strong> Request transfer of your data</li>
          <li><strong>Opt-out:</strong> Opt out of marketing communications</li>
          <li><strong>Restriction:</strong> Request restriction of processing</li>
        </ul>
        <p>To exercise these rights, contact us at privacy@demony.com</p>

        <h2>7. COOKIES AND TRACKING</h2>
        <p>We use cookies and similar technologies to:</p>
        <ul>
          <li>Maintain your session and preferences</li>
          <li>Analyze platform usage</li>
          <li>Improve security</li>
          <li>Deliver relevant content</li>
        </ul>
        <p>You can manage cookie preferences through your browser settings.</p>

        <h2>8. INTERNATIONAL TRANSFERS</h2>
        <p>Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.</p>

        <h2>9. CHILDREN'S PRIVACY</h2>
        <p>Our platform is not intended for individuals under 18 years of age. We do not knowingly collect information from children.</p>

        <h2>10. CHANGES TO THIS POLICY</h2>
        <p>We may update this Privacy Policy periodically. We will notify you of material changes via email or platform notification.</p>

        <h2>11. CONTACT US</h2>
        <p>For privacy-related inquiries:</p>
        <ul>
          <li>Email: privacy@demony.com</li>
          <li>Address: [Company Address]</li>
        </ul>

        <div class="legal-signature">
          <p><strong>By using the Demony platform, you acknowledge that you have read and understood this Privacy Policy.</strong></p>
        </div>
      </div>
    </section>
  `;
}

export function renderRiskDisclosure(container) {
  container.innerHTML = `
    <section class="legal-page">
      <div class="legal-header">
        <h1>Risk Disclosure Statement</h1>
        <p class="legal-updated">Last Updated: December 19, 2025</p>
      </div>
      
      <div class="legal-content">
        <div class="legal-warning" style="margin-bottom: 2rem;">
          <h3>⚠️ IMPORTANT RISK WARNING</h3>
          <p><strong>INVESTING IN PROJECTS THROUGH DEMONY INVOLVES A HIGH DEGREE OF RISK. YOU SHOULD NOT INVEST ANY FUNDS THAT YOU CANNOT AFFORD TO LOSE ENTIRELY.</strong></p>
        </div>

        <div class="legal-important">
          <strong>READ THIS ENTIRE DOCUMENT CAREFULLY BEFORE MAKING ANY INVESTMENT DECISIONS.</strong> This Risk Disclosure Statement is intended to help you understand the risks associated with investing through the Demony platform.
        </div>

        <h2>1. GENERAL INVESTMENT RISKS</h2>
        
        <h3>1.1. Loss of Capital</h3>
        <p><strong>You may lose some or all of the money you invest.</strong> There is no guarantee that any investment will achieve its objectives, generate returns, or avoid losses. You should only invest money that you can afford to lose completely without affecting your financial security or lifestyle.</p>

        <h3>1.2. No Guaranteed Returns</h3>
        <p>Past performance is not indicative of future results. Any projected returns, estimates, or forecasts are speculative and may not be achieved. Historical performance of similar investments does not guarantee future success.</p>

        <h3>1.3. Illiquidity Risk</h3>
        <p>Investments made through the platform may be <strong>highly illiquid</strong>. You may not be able to sell, transfer, or withdraw your investment when you want to, or at all. There is no established secondary market for these investments.</p>

        <h2>2. PROJECT-SPECIFIC RISKS</h2>

        <h3>2.1. Business Failure Risk</h3>
        <p>Projects and businesses may fail due to:</p>
        <ul>
          <li>Poor management or execution</li>
          <li>Lack of market demand</li>
          <li>Competition</li>
          <li>Economic downturns</li>
          <li>Operational challenges</li>
          <li>Insufficient funding</li>
          <li>Legal or regulatory issues</li>
        </ul>

        <h3>2.2. Information Asymmetry</h3>
        <p>Project owners have more information about their business than investors. While we require disclosure, we cannot guarantee the accuracy, completeness, or timeliness of information provided. You must conduct your own due diligence.</p>

        <h3>2.3. Fraud Risk</h3>
        <p>Despite our verification efforts, there is a risk that project owners may provide false or misleading information, or may engage in fraudulent activities.</p>

        <h3>2.4. Dilution Risk</h3>
        <p>Future funding rounds may dilute your investment stake. Project owners may issue additional equity that reduces your ownership percentage and potential returns.</p>

        <h2>3. MARKET AND ECONOMIC RISKS</h2>

        <h3>3.1. Market Volatility</h3>
        <p>Investment values can fluctuate significantly due to market conditions, economic factors, and investor sentiment. External events may adversely affect investment performance.</p>

        <h3>3.2. Economic Conditions</h3>
        <p>Recessions, inflation, interest rate changes, currency fluctuations, and other economic factors can negatively impact investments.</p>

        <h3>3.3. Industry Risk</h3>
        <p>Investments may be concentrated in specific industries that face unique challenges, disruption, or regulatory changes.</p>

        <h2>4. REGULATORY AND LEGAL RISKS</h2>

        <h3>4.1. Regulatory Changes</h3>
        <p>Laws and regulations governing investments, crowdfunding, and financial services may change. Such changes could adversely affect your investment or limit your ability to invest.</p>

        <h3>4.2. Tax Implications</h3>
        <p>Investment returns may be subject to taxation. Tax laws are complex and may change. You are responsible for understanding and complying with your tax obligations. We do not provide tax advice.</p>

        <h3>4.3. Legal Disputes</h3>
        <p>Investments may become subject to legal disputes, litigation, or regulatory enforcement actions that could result in losses.</p>

        <h2>5. PLATFORM AND OPERATIONAL RISKS</h2>

        <h3>5.1. Platform Risk</h3>
        <p>The Demony platform may experience:</p>
        <ul>
          <li>Technical failures or outages</li>
          <li>Security breaches or cyberattacks</li>
          <li>Data loss or corruption</li>
          <li>Service interruptions</li>
        </ul>

        <h3>5.2. Business Continuity Risk</h3>
        <p>If Demony ceases operations, your ability to manage investments or access funds may be affected.</p>

        <h3>5.3. Third-Party Risk</h3>
        <p>We rely on third-party service providers. Their failures, breaches, or discontinuation of services may impact our platform and your investments.</p>

        <h2>6. DIVERSIFICATION WARNING</h2>
        <p><strong>Do not concentrate your investment portfolio in any single investment or type of investment.</strong> Diversification across different assets, industries, and risk levels is a fundamental principle of prudent investing.</p>

        <h2>7. INVESTMENT SUITABILITY</h2>
        <div class="legal-warning">
          <p><strong>You should only invest if:</strong></p>
          <ul>
            <li>You have adequate financial reserves and can afford to lose the invested amount</li>
            <li>You have sufficient knowledge to evaluate the investment risks</li>
            <li>You have read and understood all available information about the investment</li>
            <li>You have considered seeking independent professional advice</li>
          </ul>
        </div>

        <h2>8. PROFESSIONAL ADVICE</h2>
        <p><strong>We strongly recommend that you seek independent professional advice</strong> from a qualified financial advisor, accountant, and/or attorney before making any investment decisions. Demony does not provide investment, legal, or tax advice.</p>

        <h2>9. YOUR ACKNOWLEDGMENT</h2>
        <p>By investing through the Demony platform, you acknowledge and confirm that:</p>
        <ul>
          <li>You have read and understood this Risk Disclosure Statement in its entirety</li>
          <li>You understand that you may lose some or all of your investment</li>
          <li>You are making investment decisions based on your own judgment</li>
          <li>You have not relied on any advice, recommendation, or representation from Demony</li>
          <li>You accept full responsibility for your investment decisions</li>
          <li>You have the financial ability to bear the loss of your entire investment</li>
          <li>You understand the illiquid nature of the investments</li>
        </ul>

        <div class="legal-signature" style="background: rgba(239, 68, 68, 0.1); border-color: #ef4444;">
          <p><strong>⚠️ FINAL WARNING: INVESTMENT CARRIES SIGNIFICANT RISK OF LOSS. ONLY INVEST WHAT YOU CAN AFFORD TO LOSE. BY PROCEEDING, YOU ACCEPT ALL RISKS DESCRIBED IN THIS DOCUMENT.</strong></p>
        </div>
      </div>
    </section>
  `;
}

// Render user agreement acceptance modal
export function renderAgreementModal(onAccept, onDecline) {
  var modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'agreement-modal';
  modal.style.zIndex = '2000';
  
  modal.innerHTML = `
    <div class="modal-content agreement-modal-content">
      <div class="agreement-header">
        <span class="agreement-icon">📜</span>
        <h2>User Agreement</h2>
        <p>Please read and accept our terms before continuing</p>
      </div>
      
      <div class="agreement-scroll-container">
        <div class="agreement-section">
          <h3>📋 Terms of Service</h3>
          <div class="agreement-summary">
            <p>By using Demony, you agree to:</p>
            <ul>
              <li>✓ You are at least 18 years old and can legally enter contracts</li>
              <li>✓ You will provide accurate and truthful information</li>
              <li>✓ You understand Demony is a platform, not an investment advisor</li>
              <li>✓ All investment decisions are your sole responsibility</li>
              <li>✓ You will not use the platform for illegal activities</li>
              <li>✓ Disputes will be resolved through binding arbitration</li>
            </ul>
          </div>
        </div>
        
        <div class="agreement-section">
          <h3>⚠️ Risk Disclosure</h3>
          <div class="agreement-summary warning">
            <p><strong>IMPORTANT:</strong> You acknowledge that:</p>
            <ul>
              <li>⚠️ <strong>You may lose all money you invest</strong></li>
              <li>⚠️ <strong>There are no guaranteed returns</strong></li>
              <li>⚠️ Investments may be illiquid - you may not be able to withdraw</li>
              <li>⚠️ Past performance does not predict future results</li>
              <li>⚠️ Projects may fail completely</li>
              <li>⚠️ Only invest what you can afford to lose entirely</li>
            </ul>
          </div>
        </div>
        
        <div class="agreement-section">
          <h3>🔒 Privacy Policy</h3>
          <div class="agreement-summary">
            <p>Regarding your personal data:</p>
            <ul>
              <li>✓ We collect information to verify identity and process investments</li>
              <li>✓ We use encryption and security measures to protect data</li>
              <li>✓ We may share data with service providers and as required by law</li>
              <li>✓ We do not sell your personal information</li>
              <li>✓ You have rights to access, correct, and delete your data</li>
            </ul>
          </div>
        </div>
        
        <div class="agreement-section">
          <h3>💼 Investor Representation</h3>
          <div class="agreement-summary">
            <p>By proceeding, you represent and warrant that:</p>
            <ul>
              <li>✓ You have read and understood the full Terms of Service</li>
              <li>✓ You have read and understood the Risk Disclosure Statement</li>
              <li>✓ You have read and understood the Privacy Policy</li>
              <li>✓ You have sufficient income/assets to bear investment losses</li>
              <li>✓ You are investing for your own account</li>
              <li>✓ Your funds are from legal sources</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="agreement-checkboxes">
        <label class="agreement-checkbox">
          <input type="checkbox" id="agree-terms" required>
          <span class="checkmark"></span>
          <span>I have read and agree to the <a href="#terms" target="_blank">Terms of Service</a></span>
        </label>
        <label class="agreement-checkbox">
          <input type="checkbox" id="agree-risk" required>
          <span class="checkmark"></span>
          <span>I have read and understand the <a href="#risk" target="_blank">Risk Disclosure Statement</a></span>
        </label>
        <label class="agreement-checkbox">
          <input type="checkbox" id="agree-privacy" required>
          <span class="checkmark"></span>
          <span>I have read and agree to the <a href="#privacy" target="_blank">Privacy Policy</a></span>
        </label>
        <label class="agreement-checkbox">
          <input type="checkbox" id="agree-investor" required>
          <span class="checkmark"></span>
          <span>I confirm I can afford to lose my entire investment</span>
        </label>
      </div>
      
      <div class="agreement-actions">
        <button type="button" class="btn btn-outline" id="decline-agreement">Decline</button>
        <button type="button" class="btn btn-primary" id="accept-agreement" disabled>Accept & Continue</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Handle checkbox changes
  var checkboxes = modal.querySelectorAll('input[type="checkbox"]');
  var acceptBtn = modal.querySelector('#accept-agreement');
  
  function updateAcceptButton() {
    var allChecked = Array.from(checkboxes).every(function(cb) { return cb.checked; });
    acceptBtn.disabled = !allChecked;
  }
  
  checkboxes.forEach(function(cb) {
    cb.addEventListener('change', updateAcceptButton);
  });
  
  // Handle accept
  acceptBtn.addEventListener('click', function() {
    if (!acceptBtn.disabled) {
      modal.remove();
      if (onAccept) onAccept();
    }
  });
  
  // Handle decline
  modal.querySelector('#decline-agreement').addEventListener('click', function() {
    modal.remove();
    if (onDecline) onDecline();
  });
  
  // Prevent closing by clicking outside
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      // Don't close - they must make a choice
      modal.querySelector('.agreement-modal-content').style.animation = 'shake 0.3s ease';
      setTimeout(function() {
        modal.querySelector('.agreement-modal-content').style.animation = '';
      }, 300);
    }
  });
  
  return modal;
}
