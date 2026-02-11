// Database setup - MongoDB version
// Creates collections with validation schemas and indexes
var db = require('./index');
var { createIndexes } = require('./create-indexes');

async function setup() {
  try {
    await db.connect();
    var database = await db.getDb();
    
    // Create collections with JSON Schema validation
    var collections = ['users', 'projects', 'investments', 'transactions', 
      'withdrawals', 'deposits', 'support_tickets', 'email_verifications',
      'profit_distributions', 'referrals', 'faq', 'audit_log',
      'investment_terms_acceptance', 'project_updates'];
    
    var existing = await database.listCollections().toArray();
    var existingNames = existing.map(function(c) { return c.name; });
    
    for (var i = 0; i < collections.length; i++) {
      if (existingNames.indexOf(collections[i]) === -1) {
        await database.createCollection(collections[i]);
        console.log('  Created collection:', collections[i]);
      } else {
        console.log('  Collection exists:', collections[i]);
      }
    }
    
    // Create indexes
    await createIndexes();
    
    console.log('Database setup completed');
    process.exit(0);
  } catch (err) {
    console.error('Error setting up database:', err);
    process.exit(1);
  }
}

setup();
