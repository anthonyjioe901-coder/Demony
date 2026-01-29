// Fix Samuel's wallet to correct balance (20)
const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://demony:0249251305Aj@demony.pl3n87x.mongodb.net/?appName=Demony';
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });

async function run() {
  try {
    await client.connect();
    const db = client.db('demony');

    // Set wallet to correct balance of 20
    const userResult = await db.collection('users').updateOne(
      { _id: new ObjectId('6951b152350e2ac498d0f160') },
      {
        $set: { walletBalance: 20, updatedAt: new Date() }
      }
    );
    console.log('User wallet fixed:', userResult.modifiedCount);

    // Verify
    const user = await db.collection('users').findOne(
      { _id: new ObjectId('6951b152350e2ac498d0f160') },
      { projection: { name: 1, email: 1, walletBalance: 1 } }
    );
    console.log('Correct balance:', user);

    // Also mark transaction as success if not already
    const txResult = await db.collection('transactions').updateOne(
      { reference: 'DEP_6951b152350e2ac498d0f160_1769029340043' },
      {
        $set: {
          status: 'success',
          verifiedAt: new Date(),
          updatedAt: new Date(),
          paidAmount: 20,
          manuallyVerified: true,
          verifiedBy: 'admin'
        }
      }
    );
    console.log('Transaction marked success:', txResult.modifiedCount);
  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    await client.close();
  }
}

run();
