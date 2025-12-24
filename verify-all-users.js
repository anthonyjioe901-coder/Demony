// Quick script to verify all existing users
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://demony:0249251305Aj@demony.pl3n87x.mongodb.net/?appName=Demony';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('demony');
    
    const result = await db.collection('users').updateMany(
      {},
      { $set: { isVerified: true } }
    );
    
    console.log('✅ Updated', result.modifiedCount, 'users to verified');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

run();
