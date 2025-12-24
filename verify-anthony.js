// Script to verify only Anthony's account
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://demony:0249251305Aj@demony.pl3n87x.mongodb.net/?appName=Demony';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('demony');
    
    // First, set everyone back to unverified
    await db.collection('users').updateMany(
      {},
      { $set: { isVerified: false } }
    );
    console.log('✅ Set all users to unverified');
    
    // Then verify only Anthony
    const result = await db.collection('users').updateOne(
      { email: 'anthonyjioe901@gmail.com' },
      { $set: { isVerified: true } }
    );
    
    console.log('✅ Updated Anthony:', result.modifiedCount, 'user(s) verified');
    
    // Check Anthony's status
    const anthony = await db.collection('users').findOne(
      { email: 'anthonyjioe901@gmail.com' },
      { projection: { email: 1, isVerified: 1 } }
    );
    console.log('Anthony status:', anthony);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

run();
