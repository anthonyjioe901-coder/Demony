// Reconcile pending Paystack deposits and credit wallets
const fs = require('fs');
const path = require('path');
const https = require('https');
const { MongoClient, ObjectId } = require('mongodb');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  });
}

// Load backend env if present
loadEnvFile(path.join(__dirname, 'packages', 'backend', '.env'));

const uri = process.env.DATABASE_URL;
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

if (!uri) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}
if (!PAYSTACK_SECRET) {
  console.error('Missing PAYSTACK_SECRET_KEY');
  process.exit(1);
}

function toObjectId(value) {
  if (!value) return null;
  if (value instanceof ObjectId) return value;
  if (ObjectId.isValid(value)) return new ObjectId(value);
  return null;
}

function paystackVerify(reference) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/verify/' + reference,
      method: 'GET',
      headers: { Authorization: 'Bearer ' + PAYSTACK_SECRET }
    };
    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Invalid Paystack response'));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  try {
    await client.connect();
    const db = client.db('demony');

    const pending = await db.collection('transactions')
      .find({ type: 'deposit', status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    if (pending.length === 0) {
      console.log('No pending deposits found.');
      return;
    }

    let successCount = 0;
    let failedCount = 0;

    for (const tx of pending) {
      try {
        const paystackRes = await paystackVerify(tx.reference);
        if (!paystackRes.status || paystackRes.data.status !== 'success') {
          await db.collection('transactions').updateOne(
            { _id: tx._id, status: 'pending' },
            { $set: { status: 'failed', updatedAt: new Date() } }
          );
          failedCount++;
          continue;
        }

        const amount = paystackRes.data.amount / 100;
        if (amount < tx.amount) {
          await db.collection('transactions').updateOne(
            { _id: tx._id, status: 'pending' },
            { $set: { status: 'failed', updatedAt: new Date(), failureReason: 'amount_mismatch' } }
          );
          failedCount++;
          continue;
        }

        const updateResult = await db.collection('transactions').updateOne(
          { _id: tx._id, status: 'pending' },
          { $set: { status: 'success', verifiedAt: new Date(), updatedAt: new Date(), paidAmount: amount } }
        );

        if (updateResult.matchedCount === 0) {
          continue;
        }

        const userObjectId = toObjectId(tx.userId);
        if (userObjectId) {
          await db.collection('users').updateOne(
            { _id: userObjectId },
            { $inc: { walletBalance: amount }, $set: { updatedAt: new Date() } }
          );
        }

        successCount++;
      } catch (err) {
        console.error('Error verifying', tx.reference, err.message || err);
      }
    }

    console.log(`Reconciled deposits. Success: ${successCount}, Failed: ${failedCount}`);
  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    await client.close();
  }
}

run();
