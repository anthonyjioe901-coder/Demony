// MongoDB Index Migration Script
// Run once on startup to ensure all required indexes exist.
// createIndex() is idempotent — safe to call repeatedly.

var db = require('./index');

async function createIndexes() {
  var database = await db.getDb();
  console.log('📇 Creating MongoDB indexes...');

  try {
    // ==================== USERS ====================
    var users = database.collection('users');
    
    // Drop the old phone index if it exists (may have failed with sparse+null dups)
    try { await users.dropIndex('idx_users_phone'); } catch (e) { /* doesn't exist, fine */ }
    
    await users.createIndex({ email: 1 }, { unique: true, name: 'idx_users_email' });
    // sparse: true means docs WITHOUT a phone field won't be indexed (avoids null dups)
    // But docs with phone: null WILL conflict. Use partialFilterExpression instead.
    await users.createIndex(
      { phone: 1 },
      { unique: true, partialFilterExpression: { phone: { $type: 'string' } }, name: 'idx_users_phone' }
    );
    await users.createIndex({ role: 1 }, { name: 'idx_users_role' });
    await users.createIndex({ isVerified: 1 }, { name: 'idx_users_verified' });
    await users.createIndex({ 'kyc.status': 1 }, { name: 'idx_users_kyc_status' });
    await users.createIndex({ createdAt: -1 }, { name: 'idx_users_created' });
    // Compound for admin search (name/email/phone are already covered by text or regex)
    await users.createIndex({ name: 1, email: 1 }, { name: 'idx_users_name_email' });

    // ==================== INVESTMENTS ====================
    var investments = database.collection('investments');
    await investments.createIndex({ userId: 1, status: 1 }, { name: 'idx_investments_user_status' });
    await investments.createIndex({ projectId: 1, status: 1 }, { name: 'idx_investments_project_status' });
    await investments.createIndex({ status: 1 }, { name: 'idx_investments_status' });
    await investments.createIndex({ paymentReference: 1 }, { sparse: true, name: 'idx_investments_payment_ref' });
    await investments.createIndex({ createdAt: -1 }, { name: 'idx_investments_created' });

    // ==================== TRANSACTIONS ====================
    var transactions = database.collection('transactions');
    await transactions.createIndex({ userId: 1, type: 1 }, { name: 'idx_transactions_user_type' });
    await transactions.createIndex({ reference: 1 }, { unique: true, sparse: true, name: 'idx_transactions_reference' });
    await transactions.createIndex({ createdAt: -1 }, { name: 'idx_transactions_created' });
    await transactions.createIndex({ status: 1 }, { name: 'idx_transactions_status' });

    // ==================== WITHDRAWALS ====================
    var withdrawals = database.collection('withdrawals');
    await withdrawals.createIndex({ userId: 1 }, { name: 'idx_withdrawals_user' });
    await withdrawals.createIndex({ status: 1, createdAt: -1 }, { name: 'idx_withdrawals_status_created' });
    await withdrawals.createIndex({ reference: 1 }, { sparse: true, name: 'idx_withdrawals_reference' });

    // ==================== PROJECTS ====================
    var projects = database.collection('projects');
    await projects.createIndex({ status: 1 }, { name: 'idx_projects_status' });
    await projects.createIndex({ category: 1, status: 1 }, { name: 'idx_projects_category_status' });
    await projects.createIndex({ featured: 1, priority: -1 }, { name: 'idx_projects_featured_priority' });

    // ==================== PROFIT DISTRIBUTIONS ====================
    var profitDist = database.collection('profit_distributions');
    await profitDist.createIndex({ userId: 1 }, { name: 'idx_profit_dist_user' });
    await profitDist.createIndex({ projectId: 1 }, { name: 'idx_profit_dist_project' });
    await profitDist.createIndex({ investmentId: 1 }, { name: 'idx_profit_dist_investment' });
    await profitDist.createIndex({ createdAt: -1 }, { name: 'idx_profit_dist_created' });

    // ==================== REFERRALS ====================
    var referrals = database.collection('referrals');
    await referrals.createIndex({ referrerId: 1 }, { name: 'idx_referrals_referrer' });
    await referrals.createIndex({ referredId: 1 }, { name: 'idx_referrals_referred' });
    await referrals.createIndex({ status: 1 }, { name: 'idx_referrals_status' });

    // ==================== REFERRAL CODES ====================
    var referralCodes = database.collection('referral_codes');
    // Drop old unique userId index if it exists (data has duplicates)
    try { await referralCodes.dropIndex('idx_referral_codes_user'); } catch (e) { /* doesn't exist */ }
    await referralCodes.createIndex({ code: 1 }, { unique: true, name: 'idx_referral_codes_code' });
    // userId not unique — some users may have generated multiple codes historically
    await referralCodes.createIndex({ userId: 1 }, { name: 'idx_referral_codes_user' });

    // ==================== EMAIL VERIFICATIONS ====================
    var emailVerifications = database.collection('email_verifications');
    await emailVerifications.createIndex({ token: 1 }, { name: 'idx_email_verify_token' });
    await emailVerifications.createIndex({ userId: 1 }, { name: 'idx_email_verify_user' });
    // Auto-expire old verification records after 48 hours
    await emailVerifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: 'idx_email_verify_ttl' });

    // ==================== PROJECT UPDATES ====================
    var projectUpdates = database.collection('project_updates');
    await projectUpdates.createIndex({ projectId: 1, createdAt: -1 }, { name: 'idx_project_updates_project' });

    // ==================== INVESTMENT TERMS ACCEPTANCE ====================
    var termsAcceptance = database.collection('investment_terms_acceptance');
    await termsAcceptance.createIndex({ userId: 1, investmentId: 1 }, { name: 'idx_terms_user_investment' });

    // ==================== SUPPORT TICKETS ====================
    var supportTickets = database.collection('support_tickets');
    await supportTickets.createIndex({ status: 1, createdAt: -1 }, { name: 'idx_support_status_created' });
    await supportTickets.createIndex({ ticketId: 1 }, { sparse: true, name: 'idx_support_ticket_id' });

    // ==================== AUDIT LOG ====================
    var auditLog = database.collection('audit_log');
    await auditLog.createIndex({ action: 1, createdAt: -1 }, { name: 'idx_audit_action_created' });
    await auditLog.createIndex({ createdAt: -1 }, { name: 'idx_audit_created' });

    console.log('✅ All MongoDB indexes created successfully');
  } catch (err) {
    // Index creation errors are non-fatal — the app still works, just slower
    console.error('⚠️ Index creation error (non-fatal):', err.message);
  }
}

module.exports = { createIndexes: createIndexes };
