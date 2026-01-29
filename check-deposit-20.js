// Inspect GH₵20 deposits and user wallet status
const { MongoClient } = require('mongodb');

const uri = process.env.DATABASE_URL || 'mongodb+srv://demony:0249251305Aj@demony.pl3n87x.mongodb.net/?appName=Demony';
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });

async function run() {
  try {
    await client.connect();
    const db = client.db('demony');

    const results = await db.collection('transactions').aggregate([
      { $match: { type: 'deposit', amount: 20 } },
      { $sort: { createdAt: -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: 'users',
          let: { uid: '$userId' },
          pipeline: [
            { $match: { $expr: { $eq: [{ $toString: '$_id' }, { $toString: '$$uid' }] } } },
            { $project: { email: 1, name: 1, walletBalance: 1, isActive: 1 } }
          ],
          as: 'user'
        }
      },
      {
        $project: {
          reference: 1,
          status: 1,
          amount: 1,
          paidAmount: 1,
          createdAt: 1,
          userId: 1,
          user: { $arrayElemAt: ['$user', 0] }
        }
      }
    ]).toArray();

    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    await client.close();
  }
}

run();
