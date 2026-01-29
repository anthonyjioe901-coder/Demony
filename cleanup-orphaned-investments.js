// Cleanup orphaned investments from deleted users
const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://demony:0249251305Aj@demony.pl3n87x.mongodb.net/?appName=Demony';
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });

async function run() {
  try {
    await client.connect();
    const db = client.db('demony');

    // Find investments where user no longer exists
    const orphanedInvestments = await db.collection('investments').aggregate([
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'users',
          let: { invUserId: '$userId' },
          pipeline: [
            { $match: { $expr: { $eq: [{ $toString: '$_id' }, { $toString: '$$invUserId' }] } } },
            { $project: { _id: 1 } }
          ],
          as: 'user'
        }
      },
      { $match: { user: { $size: 0 } } },
      { $project: { _id: 1, userId: 1, projectId: 1, amount: 1 } }
    ]).toArray();

    console.log('Found', orphanedInvestments.length, 'orphaned investments');

    if (orphanedInvestments.length === 0) {
      console.log('No orphaned investments to clean up.');
      return;
    }

    // Mark them as orphaned
    const ids = orphanedInvestments.map(inv => inv._id);
    const result = await db.collection('investments').updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          status: 'orphaned',
          orphanedAt: new Date(),
          orphanedReason: 'User account deleted',
          updatedAt: new Date()
        }
      }
    );

    console.log('Marked', result.modifiedCount, 'investments as orphaned');

    // Recalculate project stats for affected projects
    const projectIds = [...new Set(orphanedInvestments.map(inv => inv.projectId))];
    console.log('Recalculating stats for', projectIds.length, 'projects...');

    for (const projectId of projectIds) {
      const stats = await db.collection('investments').aggregate([
        { $match: { projectId: projectId, status: 'active' } },
        { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]).toArray();

      await db.collection('projects').updateOne(
        { _id: new ObjectId(projectId) },
        {
          $set: {
            currentFunding: stats[0] ? stats[0].totalAmount : 0,
            investorCount: stats[0] ? stats[0].count : 0,
            updatedAt: new Date()
          }
        }
      );
      console.log('  - Updated project', projectId, ':', stats[0] ? stats[0].count : 0, 'investors, GH₵', stats[0] ? stats[0].totalAmount : 0);
    }

    console.log('Done!');
  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    await client.close();
  }
}

run();
