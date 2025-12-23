// Email Service using Resend (https://resend.com)
var Resend = require('resend').default || require('resend');

// Initialize client
var resendClient = null;
var emailDisabled = false;

function initTransporter() {
  if (emailDisabled) return null;
  if (resendClient) return resendClient;

  var apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY not set');
    console.warn('   Set RESEND_API_KEY in your environment to enable sending via Resend.');
    console.warn('   Emails will be logged but not sent.');
    return null;
  }

  try {
    resendClient = new Resend(apiKey);
    console.log('✅ Resend client initialized');
    return resendClient;
  } catch (err) {
    console.error('❌ Failed to initialize Resend client:', err && err.message);
    return null;
  }
}

// Get sender info
function getSender() {
  return {
    name: 'Demony',
    email: process.env.MAIL_FROM || 'no-reply@demony.com'
  };
}

// ==================== EMAIL TEMPLATES ====================

var templates = {
  // Welcome email for new users
  welcome: function(data) {
    return {
      subject: '🎉 Welcome to Demony - Your Investment Journey Begins!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; }
            .content { padding: 30px; }
            .welcome-box { background: linear-gradient(135deg, #dbeafe, #e0e7ff); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; }
            .welcome-box h2 { color: #4f46e5; margin: 0 0 10px; }
            .steps { margin: 25px 0; }
            .step { display: flex; align-items: flex-start; margin: 15px 0; padding: 15px; background: #f8fafc; border-radius: 8px; }
            .step-num { background: #6366f1; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
            .step-content h4 { margin: 0 0 5px; color: #1e293b; }
            .step-content p { margin: 0; color: #64748b; font-size: 14px; }
            .cta-btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
            .footer { background: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 13px; }
            .footer a { color: #6366f1; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💎 Demony</h1>
              <p>Smart Investments, Real Returns</p>
            </div>
            <div class="content">
              <div class="welcome-box">
                <h2>Welcome, ${data.name}!</h2>
                <p>Your account has been created successfully. You're one step closer to growing your wealth.</p>
              </div>
              
              <h3>🚀 Get Started in 3 Easy Steps</h3>
              <div class="steps">
                <div class="step">
                  <div class="step-num">1</div>
                  <div class="step-content">
                    <h4>Complete Your Profile</h4>
                    <p>Add your details and verify your identity for secure transactions.</p>
                  </div>
                </div>
                <div class="step">
                  <div class="step-num">2</div>
                  <div class="step-content">
                    <h4>Fund Your Wallet</h4>
                    <p>Add funds to your wallet to start investing in projects.</p>
                  </div>
                </div>
                <div class="step">
                  <div class="step-num">3</div>
                  <div class="step-content">
                    <h4>Invest & Earn</h4>
                    <p>Browse projects and start earning returns on your investments.</p>
                  </div>
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="${data.appUrl || 'https://demony.com'}/#projects" class="cta-btn">Browse Projects →</a>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Demony. All rights reserved.</p>
              <p>If you didn't create this account, please <a href="mailto:support@demony.com">contact support</a>.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Welcome to Demony, ${data.name}!\n\nYour account has been created successfully. Get started by completing your profile, funding your wallet, and investing in projects.\n\nVisit ${data.appUrl || 'https://demony.com'} to begin your investment journey.`
    };
  },

  // Email verification
  verifyEmail: function(data) {
    return {
      subject: 'Please verify your email for Demony',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #111827; margin: 0; padding: 0; background: #f3f4f6; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 28px; text-align: center; color: white; }
            .content { padding: 28px; }
            .cta { display: inline-block; background: #4f46e5; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; }
            .code-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 18px; margin-top: 18px; font-family: 'SFMono-Regular', Consolas, monospace; font-weight: 600; }
            .footer { background: #111827; color: #9ca3af; padding: 20px; text-align: center; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify your email</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.85);">Hi ${data.userName}, please confirm it's really you.</p>
            </div>
            <div class="content">
              <p>Tap the button below to verify your email and secure your Demony account. The link expires in 48 hours.</p>
              <p style="text-align: center; margin: 28px 0;">
                <a class="cta" href="${data.verifyUrl}">Verify Email</a>
              </p>
              <p style="color: #6b7280; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
              <div class="code-box">${data.verifyUrl}</div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Demony. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${data.userName},\n\nVerify your Demony account: ${data.verifyUrl}\nThis link expires in 48 hours. If you didn't sign up, you can ignore this email.`
    };
  },

  // Investment confirmation
  investmentConfirmation: function(data) {
    return {
      subject: '✅ Investment Confirmed - GH₵' + data.amount.toLocaleString() + ' in ' + data.projectName,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .success-box { background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-radius: 12px; padding: 25px; margin: 20px 0; text-align: center; }
            .success-box h2 { color: #047857; margin: 0 0 5px; font-size: 32px; }
            .success-box p { color: #065f46; margin: 0; font-size: 16px; }
            .details { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { color: #64748b; }
            .detail-value { font-weight: 600; color: #1e293b; }
            .warning-box { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0; }
            .warning-box h4 { color: #92400e; margin: 0 0 8px; }
            .warning-box p { color: #78350f; margin: 0; font-size: 14px; }
            .footer { background: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Investment Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.investorName},</p>
              
              <div class="success-box">
                <h2>GH₵${data.amount.toLocaleString()}</h2>
                <p>Successfully invested in <strong>${data.projectName}</strong></p>
              </div>
              
              <div class="details">
                <h4 style="margin: 0 0 15px; color: #1e293b;">📋 Investment Details</h4>
                <div class="detail-row">
                  <span class="detail-label">Project</span>
                  <span class="detail-value">${data.projectName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Amount Invested</span>
                  <span class="detail-value">GH₵${data.amount.toLocaleString()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Your Ownership</span>
                  <span class="detail-value">${data.ownershipPercent || '0'}%</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Profit Share</span>
                  <span class="detail-value">${data.profitShare || 80}%</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Lock-in Period</span>
                  <span class="detail-value">${data.lockInMonths || 12} months</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date</span>
                  <span class="detail-value">${new Date().toLocaleDateString()}</span>
                </div>
              </div>
              
              <div class="warning-box">
                <h4>⚠️ Important Reminder</h4>
                <p>Your principal is locked for ${data.lockInMonths || 12} months. However, profits can be withdrawn anytime once distributed. Returns are not guaranteed and depend on actual project performance.</p>
              </div>
              
              <p style="text-align: center; margin-top: 25px;">
                <a href="${data.appUrl || 'https://demony.com'}/#investments" style="background: #6366f1; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">View My Investments →</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Demony. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Investment Confirmed!\n\nHi ${data.investorName},\n\nYou've successfully invested GH₵${data.amount.toLocaleString()} in ${data.projectName}.\n\nYour ownership: ${data.ownershipPercent || '0'}%\nProfit share: ${data.profitShare || 80}%\nLock-in period: ${data.lockInMonths || 12} months\n\nRemember: Your principal is locked until project completion, but profits can be withdrawn anytime.`
    };
  },

  // Profit distribution notification
  profitDistribution: function(data) {
    return {
      subject: '💰 Profit Received - GH₵' + data.amount.toFixed(2) + ' from ' + data.projectName,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .profit-box { background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 12px; padding: 25px; margin: 20px 0; text-align: center; }
            .profit-box h2 { color: #92400e; margin: 0 0 5px; font-size: 36px; }
            .profit-box p { color: #78350f; margin: 0; }
            .details { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
            .detail-row:last-child { border-bottom: none; }
            .wallet-cta { background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; color: white; }
            .wallet-cta h3 { margin: 0 0 10px; }
            .wallet-cta p { margin: 0 0 15px; opacity: 0.9; }
            .footer { background: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 Profit Distribution!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.investorName},</p>
              <p>Great news! You've received a profit distribution from your investment.</p>
              
              <div class="profit-box">
                <h2>+GH₵${data.amount.toFixed(2)}</h2>
                <p>Added to your wallet</p>
              </div>
              
              <div class="details">
                <h4 style="margin: 0 0 15px; color: #1e293b;">📊 Distribution Details</h4>
                <div class="detail-row">
                  <span>Project</span>
                  <strong>${data.projectName}</strong>
                </div>
                <div class="detail-row">
                  <span>Your Share</span>
                  <strong>${(data.sharePercent * 100).toFixed(2)}%</strong>
                </div>
                <div class="detail-row">
                  <span>Amount</span>
                  <strong style="color: #059669;">+GH₵${data.amount.toFixed(2)}</strong>
                </div>
                <div class="detail-row">
                  <span>Date</span>
                  <strong>${new Date().toLocaleDateString()}</strong>
                </div>
              </div>
              
              <div class="wallet-cta">
                <h3>💳 Funds Available Now</h3>
                <p>Your profit has been credited to your wallet and is ready to withdraw.</p>
                <a href="${data.appUrl || 'https://demony.com'}/#wallet" style="display: inline-block; background: white; color: #059669; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">Go to Wallet →</a>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Demony. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Profit Distribution!\n\nHi ${data.investorName},\n\nYou've received GH₵${data.amount.toFixed(2)} from ${data.projectName}.\n\nYour share: ${(data.sharePercent * 100).toFixed(2)}%\n\nThe funds have been added to your wallet and are available for withdrawal.`
    };
  },

  // Withdrawal request submitted
  withdrawalRequested: function(data) {
    return {
      subject: '📤 Withdrawal Request Submitted - GH₵' + data.amount.toLocaleString(),
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; }
            .content { padding: 30px; }
            .status-box { background: #eff6ff; border: 2px solid #3b82f6; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; }
            .status-box h2 { color: #1d4ed8; margin: 0; }
            .details { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
            .detail-row:last-child { border-bottom: none; }
            .info-box { background: #f0f9ff; border-radius: 8px; padding: 15px; margin: 20px 0; }
            .footer { background: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📤 Withdrawal Request</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              
              <div class="status-box">
                <p style="margin: 0 0 10px; color: #64748b;">Amount Requested</p>
                <h2>GH₵${data.amount.toLocaleString()}</h2>
                <p style="margin: 10px 0 0; color: #3b82f6;">⏳ Processing</p>
              </div>
              
              <div class="details">
                <h4 style="margin: 0 0 15px;">📋 Request Details</h4>
                <div class="detail-row">
                  <span>Method</span>
                  <strong>${data.method || 'Mobile Money'}</strong>
                </div>
                <div class="detail-row">
                  <span>Account</span>
                  <strong>${data.accountDetails || 'N/A'}</strong>
                </div>
                <div class="detail-row">
                  <span>Request ID</span>
                  <strong>${data.withdrawalId || 'N/A'}</strong>
                </div>
                <div class="detail-row">
                  <span>Date</span>
                  <strong>${new Date().toLocaleDateString()}</strong>
                </div>
              </div>
              
              <div class="info-box">
                <p style="margin: 0;"><strong>ℹ️ What happens next?</strong><br>
                Our team will review your request and process it within 1-3 business days. You'll receive an email once the transfer is complete.</p>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Demony. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Withdrawal Request Submitted\n\nHi ${data.userName},\n\nYour withdrawal request for GH₵${data.amount.toLocaleString()} has been submitted.\n\nMethod: ${data.method || 'Mobile Money'}\nAccount: ${data.accountDetails || 'N/A'}\n\nWe'll process this within 1-3 business days.`
    };
  },

  // Withdrawal approved/completed
  withdrawalCompleted: function(data) {
    return {
      subject: '✅ Withdrawal Completed - GH₵' + data.amount.toLocaleString() + ' Sent!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; }
            .content { padding: 30px; }
            .success-box { background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-radius: 12px; padding: 25px; margin: 20px 0; text-align: center; }
            .success-box h2 { color: #047857; margin: 0; font-size: 32px; }
            .details { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
            .detail-row:last-child { border-bottom: none; }
            .footer { background: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Withdrawal Complete!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>Great news! Your withdrawal has been processed successfully.</p>
              
              <div class="success-box">
                <p style="margin: 0 0 10px; color: #065f46;">Amount Sent</p>
                <h2>GH₵${data.amount.toLocaleString()}</h2>
              </div>
              
              <div class="details">
                <div class="detail-row">
                  <span>Sent To</span>
                  <strong>${data.accountDetails || 'Your account'}</strong>
                </div>
                <div class="detail-row">
                  <span>Reference</span>
                  <strong>${data.reference || data.withdrawalId || 'N/A'}</strong>
                </div>
                <div class="detail-row">
                  <span>Date Completed</span>
                  <strong>${new Date().toLocaleDateString()}</strong>
                </div>
              </div>
              
              <p style="text-align: center; color: #64748b; font-size: 14px;">
                The funds should appear in your account shortly. If you don't see them within 24 hours, please contact support.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Demony. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Withdrawal Complete!\n\nHi ${data.userName},\n\nYour withdrawal of GH₵${data.amount.toLocaleString()} has been sent to ${data.accountDetails || 'your account'}.\n\nReference: ${data.reference || data.withdrawalId || 'N/A'}`
    };
  },

  // Withdrawal rejected
  withdrawalRejected: function(data) {
    return {
      subject: '❌ Withdrawal Request Declined',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; }
            .content { padding: 30px; }
            .reject-box { background: #fef2f2; border: 2px solid #ef4444; border-radius: 12px; padding: 20px; margin: 20px 0; }
            .reject-box h3 { color: #dc2626; margin: 0 0 10px; }
            .info-box { background: #f0f9ff; border-radius: 8px; padding: 15px; margin: 20px 0; }
            .footer { background: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Withdrawal Declined</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>Unfortunately, your withdrawal request for <strong>GH₵${data.amount.toLocaleString()}</strong> could not be processed.</p>
              
              <div class="reject-box">
                <h3>Reason</h3>
                <p style="margin: 0;">${data.reason || 'Please contact support for more information.'}</p>
              </div>
              
              <div class="info-box">
                <p style="margin: 0;"><strong>💡 What to do next?</strong><br>
                The funds remain in your wallet. Please verify your withdrawal details and try again, or contact our support team for assistance.</p>
              </div>
              
              <p style="text-align: center;">
                <a href="mailto:support@demony.com" style="background: #6366f1; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">Contact Support</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Demony. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Withdrawal Declined\n\nHi ${data.userName},\n\nYour withdrawal request for GH₵${data.amount.toLocaleString()} was declined.\n\nReason: ${data.reason || 'Please contact support for more information.'}\n\nThe funds remain in your wallet.`
    };
  },

  // KYC Approved
  kycApproved: function(data) {
    return {
      subject: '✅ KYC Verification Approved - You\'re All Set!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; }
            .content { padding: 30px; }
            .success-box { background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-radius: 12px; padding: 25px; margin: 20px 0; text-align: center; }
            .success-box h2 { color: #047857; margin: 0; }
            .benefits { margin: 25px 0; }
            .benefit { display: flex; align-items: center; padding: 12px; background: #f8fafc; border-radius: 8px; margin: 10px 0; }
            .benefit span { margin-right: 12px; font-size: 20px; }
            .footer { background: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Identity Verified!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              
              <div class="success-box">
                <h2>🎉 KYC Approved</h2>
                <p style="color: #065f46; margin: 10px 0 0;">Your identity has been successfully verified.</p>
              </div>
              
              <h3>What you can do now:</h3>
              <div class="benefits">
                <div class="benefit">
                  <span>💰</span>
                  <div>Invest in all available projects</div>
                </div>
                <div class="benefit">
                  <span>📤</span>
                  <div>Request withdrawals with higher limits</div>
                </div>
                <div class="benefit">
                  <span>🛡️</span>
                  <div>Enhanced account security</div>
                </div>
              </div>
              
              <p style="text-align: center;">
                <a href="${data.appUrl || 'https://demony.com'}/#projects" style="background: #10b981; color: white; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: 600;">Start Investing →</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Demony. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `KYC Approved!\n\nHi ${data.userName},\n\nYour identity has been successfully verified. You can now invest in all projects and request withdrawals.`
    };
  },

  // KYC Rejected
  kycRejected: function(data) {
    return {
      subject: '⚠️ KYC Verification - Action Required',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; }
            .content { padding: 30px; }
            .warning-box { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 20px 0; }
            .warning-box h3 { color: #92400e; margin: 0 0 10px; }
            .tips { background: #f0f9ff; border-radius: 8px; padding: 15px; margin: 20px 0; }
            .tips h4 { margin: 0 0 10px; color: #1e40af; }
            .tips ul { margin: 0; padding-left: 20px; }
            .tips li { margin: 8px 0; }
            .footer { background: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ KYC Needs Attention</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>We were unable to verify your identity with the documents provided.</p>
              
              <div class="warning-box">
                <h3>Reason</h3>
                <p style="margin: 0;">${data.reason || 'The submitted documents did not meet our verification requirements.'}</p>
              </div>
              
              <div class="tips">
                <h4>📝 Tips for resubmission:</h4>
                <ul>
                  <li>Ensure all documents are clear and readable</li>
                  <li>Use original documents (no photocopies)</li>
                  <li>Make sure your name matches across all documents</li>
                  <li>ID cards should not be expired</li>
                </ul>
              </div>
              
              <p style="text-align: center;">
                <a href="${data.appUrl || 'https://demony.com'}/#profile" style="background: #6366f1; color: white; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: 600;">Resubmit Documents →</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Demony. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `KYC Verification Needs Attention\n\nHi ${data.userName},\n\nWe couldn't verify your identity.\n\nReason: ${data.reason || 'Documents did not meet requirements.'}\n\nPlease resubmit your documents.`
    };
  },

  // Project Update notification
  projectUpdate: function(data) {
    var typeColors = {
      'info': { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', icon: 'ℹ️' },
      'profit': { bg: '#d1fae5', border: '#10b981', text: '#047857', icon: '💰' },
      'milestone': { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', icon: '🎯' },
      'warning': { bg: '#fef2f2', border: '#ef4444', text: '#dc2626', icon: '⚠️' }
    };
    var typeStyle = typeColors[data.updateType] || typeColors.info;
    
    return {
      subject: typeStyle.icon + ' ' + data.projectName + ': ' + data.title,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 22px; }
            .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0; }
            .content { padding: 30px; }
            .update-box { background: ${typeStyle.bg}; border: 2px solid ${typeStyle.border}; border-radius: 12px; padding: 20px; margin: 20px 0; }
            .update-box h3 { color: ${typeStyle.text}; margin: 0 0 12px; }
            .update-box p { color: #374151; margin: 0; }
            .footer { background: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📢 Project Update</h1>
              <p>${data.projectName}</p>
            </div>
            <div class="content">
              <p>Hi ${data.investorName},</p>
              <p>There's an update on a project you've invested in:</p>
              
              <div class="update-box">
                <h3>${typeStyle.icon} ${data.title}</h3>
                <p>${data.message}</p>
              </div>
              
              <p style="text-align: center; margin-top: 25px;">
                <a href="${data.appUrl || 'https://demony.com'}/#investments" style="background: #6366f1; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Investment Details →</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Demony. All rights reserved.</p>
              <p style="font-size: 12px;">You're receiving this because you invested in ${data.projectName}.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Project Update: ${data.projectName}\n\nHi ${data.investorName},\n\n${data.title}\n\n${data.message}\n\nView your investment at ${data.appUrl || 'https://demony.com'}/#investments`
    };
  },

  // Deposit confirmation
  depositConfirmed: function(data) {
    return {
      subject: '✅ Deposit Confirmed - GH₵' + data.amount.toLocaleString() + ' Added to Wallet',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; }
            .content { padding: 30px; }
            .deposit-box { background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-radius: 12px; padding: 25px; margin: 20px 0; text-align: center; }
            .deposit-box h2 { color: #047857; margin: 0; font-size: 32px; }
            .wallet-info { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; }
            .footer { background: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Deposit Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              
              <div class="deposit-box">
                <p style="margin: 0 0 10px; color: #065f46;">Amount Deposited</p>
                <h2>+GH₵${data.amount.toLocaleString()}</h2>
              </div>
              
              <div class="wallet-info">
                <p style="margin: 0 0 5px; color: #64748b;">New Wallet Balance</p>
                <h3 style="margin: 0; color: #1e293b;">GH₵${(data.newBalance || data.amount).toLocaleString()}</h3>
              </div>
              
              <p style="text-align: center;">
                <a href="${data.appUrl || 'https://demony.com'}/#projects" style="background: #6366f1; color: white; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: 600;">Invest Now →</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Demony. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Deposit Confirmed!\n\nHi ${data.userName},\n\nGH₵${data.amount.toLocaleString()} has been added to your wallet.\n\nNew balance: GH₵${(data.newBalance || data.amount).toLocaleString()}`
    };
  },

  // Support ticket confirmation (sent to user)
  supportTicketConfirmation: function(data) {
    return {
      subject: '🎫 Support Ticket Received - ' + data.ticketId,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .ticket-box { background: linear-gradient(135deg, #dbeafe, #e0e7ff); border-radius: 12px; padding: 25px; margin: 20px 0; text-align: center; }
            .ticket-id { font-size: 28px; font-weight: bold; color: #4f46e5; font-family: 'SFMono-Regular', Consolas, monospace; }
            .details { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; }
            .details-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
            .details-row:last-child { border-bottom: none; }
            .label { color: #64748b; }
            .value { font-weight: 600; color: #1e293b; }
            .message-box { background: #fefce8; border-left: 4px solid #eab308; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
            .footer { background: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎫 Support Ticket Received</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>Thank you for contacting Demony Support. We've received your request and will get back to you within 24-48 hours.</p>
              
              <div class="ticket-box">
                <p style="margin: 0 0 10px; color: #64748b;">Your Ticket ID</p>
                <div class="ticket-id">${data.ticketId}</div>
                <p style="margin: 10px 0 0; font-size: 12px; color: #64748b;">Save this ID to track your request</p>
              </div>
              
              <div class="details">
                <div class="details-row">
                  <span class="label">Category</span>
                  <span class="value">${data.category}</span>
                </div>
                <div class="details-row">
                  <span class="label">Subject</span>
                  <span class="value">${data.subject}</span>
                </div>
                <div class="details-row">
                  <span class="label">Priority</span>
                  <span class="value">${data.priority || 'Normal'}</span>
                </div>
              </div>
              
              <div class="message-box">
                <strong>Your Message:</strong>
                <p style="margin: 10px 0 0;">${data.message}</p>
              </div>
              
              <p style="text-align: center;">
                <a href="${data.appUrl || 'https://demony.com'}/#support" style="background: #6366f1; color: white; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: 600;">Track Your Ticket →</a>
              </p>
              
              <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 25px;">
                Need urgent help? Call us at <strong>+233 24 925 1305</strong> or<br>
                WhatsApp <strong>+233 24 925 1305</strong>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Demony. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Support Ticket Received\n\nHi ${data.userName},\n\nThank you for contacting Demony Support. Your ticket ID is: ${data.ticketId}\n\nCategory: ${data.category}\nSubject: ${data.subject}\n\nYour Message:\n${data.message}\n\nWe'll respond within 24-48 hours.\n\nNeed urgent help? Call +233 24 925 1305`
    };
  },

  // Support ticket notification (sent to support team)
  supportTicketNotification: function(data) {
    return {
      subject: '🆕 New Support Ticket: ' + data.ticketId + ' - ' + data.category,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #dc2626, #ef4444); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .ticket-id { font-size: 24px; font-weight: bold; color: #dc2626; font-family: monospace; background: #fef2f2; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .details { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; }
            .details-row { padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
            .details-row:last-child { border-bottom: none; }
            .label { color: #64748b; font-size: 12px; text-transform: uppercase; }
            .value { font-weight: 600; color: #1e293b; margin-top: 5px; }
            .message-box { background: #fffbeb; border: 1px solid #fcd34d; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .footer { background: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🆕 New Support Ticket</h1>
            </div>
            <div class="content">
              <div class="ticket-id">${data.ticketId}</div>
              
              <div class="details">
                <div class="details-row">
                  <div class="label">Customer</div>
                  <div class="value">${data.userName} (${data.userEmail})</div>
                </div>
                <div class="details-row">
                  <div class="label">Category</div>
                  <div class="value">${data.category}</div>
                </div>
                <div class="details-row">
                  <div class="label">Subject</div>
                  <div class="value">${data.subject}</div>
                </div>
                <div class="details-row">
                  <div class="label">Priority</div>
                  <div class="value">${data.priority || 'Normal'}</div>
                </div>
                <div class="details-row">
                  <div class="label">Submitted</div>
                  <div class="value">${new Date().toLocaleString()}</div>
                </div>
              </div>
              
              <div class="message-box">
                <strong>Customer Message:</strong>
                <p style="margin: 10px 0 0; white-space: pre-wrap;">${data.message}</p>
              </div>
            </div>
            <div class="footer">
              <p>Demony Support System</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `New Support Ticket: ${data.ticketId}\n\nCustomer: ${data.userName} (${data.userEmail})\nCategory: ${data.category}\nSubject: ${data.subject}\nPriority: ${data.priority || 'Normal'}\n\nMessage:\n${data.message}`
    };
  }
};

// ==================== EMAIL SENDING FUNCTIONS ====================

/**
 * Send an email using a template
 * @param {string} templateName - Name of the template (welcome, investmentConfirmation, etc.)
 * @param {string} recipientEmail - Email address of the recipient
 * @param {object} data - Data to populate the template
 * @returns {Promise}
 */
async function sendEmail(templateName, recipientEmail, data) {
  var transport = initTransporter();
  
  if (!templates[templateName]) {
    console.error('Email template not found:', templateName);
    return { success: false, error: 'Template not found' };
  }
  
  var emailContent = templates[templateName](data);
  var sender = getSender();
  
  // Log email in development or if transport not available
  if (!transport) {
    console.log('📧 Email would be sent (no transport):');
    console.log('  To:', recipientEmail);
    console.log('  Subject:', emailContent.subject);
    console.log('  Template:', templateName);
    return { success: true, simulated: true };
  }

  try {
    var from = '"' + sender.name + '" <' + sender.email + '>';
    var result = await transport.emails.send({
      from: from,
      to: recipientEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    });

    console.log('✅ Email sent to', recipientEmail, '- Template:', templateName);
    return { success: true, messageId: result && (result.id || result.messageId) };
  } catch (err) {
    console.error('❌ Failed to send email via Resend:', err && err.message);

    // If API key is invalid or unauthorized, disable sending to avoid repeated failures
    if (err && err.message && (err.message.toLowerCase().includes('unauthorized') || err.message.toLowerCase().includes('invalid'))) {
      console.error('🚫 Email disabled due to Resend auth failure.');
      console.error('   Check RESEND_API_KEY in your environment.');
      emailDisabled = true;
      resendClient = null;
    }

    return { success: false, error: err && err.message };
  }
}

/**
 * Send email to multiple recipients (for bulk notifications)
 * @param {string} templateName - Name of the template
 * @param {Array} recipients - Array of { email, data } objects
 * @returns {Promise}
 */
async function sendBulkEmail(templateName, recipients) {
  var results = [];
  
  for (var i = 0; i < recipients.length; i++) {
    var recipient = recipients[i];
    try {
      var result = await sendEmail(templateName, recipient.email, recipient.data);
      results.push({ email: recipient.email, ...result });
    } catch (err) {
      results.push({ email: recipient.email, success: false, error: err.message });
    }
    
    // Small delay between emails to avoid rate limiting
    if (i < recipients.length - 1) {
      await new Promise(function(resolve) { setTimeout(resolve, 100); });
    }
  }
  
  return results;
}

// ==================== CONVENIENCE FUNCTIONS ====================

// Send welcome email to new user
async function sendWelcomeEmail(user) {
  return sendEmail('welcome', user.email, {
    name: user.name || user.email.split('@')[0],
    appUrl: process.env.APP_URL
  });
}

async function sendVerificationEmail(user, verifyUrl) {
  return sendEmail('verifyEmail', user.email, {
    userName: user.name || user.email.split('@')[0],
    verifyUrl: verifyUrl,
    appUrl: process.env.APP_URL
  });
}

// Send investment confirmation
async function sendInvestmentEmail(user, investment, project) {
  return sendEmail('investmentConfirmation', user.email, {
    investorName: user.name || user.email.split('@')[0],
    amount: investment.amount,
    projectName: project.name,
    ownershipPercent: investment.ownershipPercent,
    profitShare: 80,
    lockInMonths: project.lockInPeriodMonths || 12,
    appUrl: process.env.APP_URL
  });
}

// Send profit distribution notification
async function sendProfitEmail(user, distribution, project) {
  return sendEmail('profitDistribution', user.email, {
    investorName: user.name || user.email.split('@')[0],
    amount: distribution.amount,
    sharePercent: distribution.sharePercent,
    projectName: project.name,
    appUrl: process.env.APP_URL
  });
}

// Send withdrawal emails
async function sendWithdrawalRequestedEmail(user, withdrawal) {
  return sendEmail('withdrawalRequested', user.email, {
    userName: user.name || user.email.split('@')[0],
    amount: withdrawal.amount,
    method: withdrawal.method,
    accountDetails: withdrawal.accountNumber || withdrawal.phoneNumber,
    withdrawalId: withdrawal._id ? withdrawal._id.toString() : withdrawal.id,
    appUrl: process.env.APP_URL
  });
}

async function sendWithdrawalCompletedEmail(user, withdrawal) {
  return sendEmail('withdrawalCompleted', user.email, {
    userName: user.name || user.email.split('@')[0],
    amount: withdrawal.amount,
    accountDetails: withdrawal.accountNumber || withdrawal.phoneNumber,
    reference: withdrawal.reference,
    withdrawalId: withdrawal._id ? withdrawal._id.toString() : withdrawal.id,
    appUrl: process.env.APP_URL
  });
}

async function sendWithdrawalRejectedEmail(user, withdrawal, reason) {
  return sendEmail('withdrawalRejected', user.email, {
    userName: user.name || user.email.split('@')[0],
    amount: withdrawal.amount,
    reason: reason,
    appUrl: process.env.APP_URL
  });
}

// Send KYC emails
async function sendKycApprovedEmail(user) {
  return sendEmail('kycApproved', user.email, {
    userName: user.name || user.email.split('@')[0],
    appUrl: process.env.APP_URL
  });
}

async function sendKycRejectedEmail(user, reason) {
  return sendEmail('kycRejected', user.email, {
    userName: user.name || user.email.split('@')[0],
    reason: reason,
    appUrl: process.env.APP_URL
  });
}

// Send project update to investors
async function sendProjectUpdateEmail(user, project, update) {
  return sendEmail('projectUpdate', user.email, {
    investorName: user.name || user.email.split('@')[0],
    projectName: project.name,
    title: update.title,
    message: update.message,
    updateType: update.type || 'info',
    appUrl: process.env.APP_URL
  });
}

// Send deposit confirmation
async function sendDepositEmail(user, amount, newBalance) {
  return sendEmail('depositConfirmed', user.email, {
    userName: user.name || user.email.split('@')[0],
    amount: amount,
    newBalance: newBalance,
    appUrl: process.env.APP_URL
  });
}

// Send support ticket confirmation to user
async function sendSupportTicketConfirmationEmail(user, ticket) {
  return sendEmail('supportTicketConfirmation', user.email, {
    userName: user.name || user.email.split('@')[0],
    ticketId: ticket.ticketId,
    category: ticket.category,
    subject: ticket.subject,
    message: ticket.message,
    priority: ticket.priority,
    appUrl: process.env.APP_URL
  });
}

// Send support ticket notification to support team
async function sendSupportTicketNotificationEmail(user, ticket) {
  var supportEmail = process.env.SUPPORT_EMAIL || 'support@demony.com';
  return sendEmail('supportTicketNotification', supportEmail, {
    userName: user.name || user.email.split('@')[0],
    userEmail: user.email,
    ticketId: ticket.ticketId,
    category: ticket.category,
    subject: ticket.subject,
    message: ticket.message,
    priority: ticket.priority
  });
}

module.exports = {
  initTransporter: initTransporter,
  sendEmail: sendEmail,
  sendBulkEmail: sendBulkEmail,
  
  // Convenience functions
  sendWelcomeEmail: sendWelcomeEmail,
  sendVerificationEmail: sendVerificationEmail,
  sendInvestmentEmail: sendInvestmentEmail,
  sendProfitEmail: sendProfitEmail,
  sendWithdrawalRequestedEmail: sendWithdrawalRequestedEmail,
  sendWithdrawalCompletedEmail: sendWithdrawalCompletedEmail,
  sendWithdrawalRejectedEmail: sendWithdrawalRejectedEmail,
  sendKycApprovedEmail: sendKycApprovedEmail,
  sendKycRejectedEmail: sendKycRejectedEmail,
  sendProjectUpdateEmail: sendProjectUpdateEmail,
  sendDepositEmail: sendDepositEmail,
  sendSupportTicketConfirmationEmail: sendSupportTicketConfirmationEmail,
  sendSupportTicketNotificationEmail: sendSupportTicketNotificationEmail,
  
  // Export templates for testing
  templates: templates
};
