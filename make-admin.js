// Script to make Janet an admin user
const db = require('./packages/database/src/index');

async function makeUserAdmin() {
  try {
    console.log('Connecting to database...');
    const database = await db.getDb();
    console.log('✓ Connected');
    
    const usersCollection = database.collection('users');
    
    console.log('\nUpdating Janet to admin role...');
    const result = await usersCollection.updateOne(
      { email: 'janet@demony.com' },
      { $set: { role: 'admin' } }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✓ Janet is now an admin!');
    } else {
      console.log('ℹ User may already be an admin or not found');
    }
    
    // Verify
    const user = await usersCollection.findOne({ email: 'janet@demony.com' });
    if (user) {
      console.log(`\nUser details:`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
    } else {
      console.log('\nℹ User not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

makeUserAdmin();
