const { MongoClient } = require('mongodb');

async function updateUser() {
  const client = new MongoClient('mongodb+srv://demony:0249251305Aj@demony.pl3n87x.mongodb.net/?appName=Demony');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('demony');
    
    // Update existing user to add missing fields
    const result = await db.collection('users').updateOne(
      { email: 'anthonyjioe901@gmail.com' },
      { 
        $set: { 
          isActive: true, 
          role: 'investor', 
          walletBalance: 0, 
          kyc: { status: 'pending' } 
        } 
      }
    );
    
    console.log('Update result:', result);
    
    // Verify the update
    const user = await db.collection('users').findOne({ email: 'anthonyjioe901@gmail.com' });
    console.log('Updated user:', JSON.stringify(user, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

updateUser();
