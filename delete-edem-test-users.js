// Delete first 200 Edem test users (dry-run by default)
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.DATABASE_URL || 'mongodb+srv://demony:0249251305Aj@demony.pl3n87x.mongodb.net/?appName=Demony';
const client = new MongoClient(uri);

const DRY_RUN = process.env.DRY_RUN !== 'false';
const LIMIT = parseInt(process.env.DELETE_LIMIT || '200', 10);

async function run() {
  try {
    await client.connect();
    const db = client.db('demony');

    const candidates = await db.collection('users')
      .find({ name: { $regex: /^Edem/i } })
      .sort({ createdAt: 1 })
      .limit(LIMIT)
      .project({ _id: 1, name: 1, email: 1, createdAt: 1 })
      .toArray();

    console.log(`Found ${candidates.length} Edem users to delete (limit=${LIMIT}).`);

    if (candidates.length === 0) return;

    if (DRY_RUN) {
      console.log('DRY_RUN is enabled. No users were deleted.');
      candidates.slice(0, 5).forEach(u => console.log(`- ${u.name} (${u.email})`));
      console.log('Set DRY_RUN=false to perform deletion.');
      return;
    }

    const ids = candidates.map(u => u._id);
    const result = await db.collection('users').deleteMany({ _id: { $in: ids } });

    console.log(`Deleted ${result.deletedCount} users.`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

run();
