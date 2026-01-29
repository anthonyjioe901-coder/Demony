// Credit Samuel ofosu's wallet with GH₵20
const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://demony:0249251305Aj@demony.pl3n87x.mongodb.net/?appName=Demony';
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });

async function run() {
  try {
    await client.connect();
    const db = client.db('demony');

    // Mark transaction as success
    const txResult = await db.collection('transactions').updateOne(
      { reference: 'DEP_6951b152350e2ac498d0f160_1769029340043', status: 'pending' },
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
    console.log('Transaction update:', txResult.modifiedCount);

    // Credit user wallet
    const userResult = await db.collection('users').updateOne(
      { _id: new ObjectId('6951b152350e2ac498d0f160') },
      {
        $inc: { walletBalance: 20 },
        $set: { updatedAt: new Date() }
      }
    );
    console.log('User wallet credited:', userResult.modifiedCount);

    // Verify new balance
    const user = await db.collection('users').findOne(
      { _id: new ObjectId('6951b152350e2ac498d0f160') },
      { projection: { name: 1, email: 1, walletBalance: 1 } }
    );
    console.log('New balance:', user);
  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    await client.close();
  }
}

run();
