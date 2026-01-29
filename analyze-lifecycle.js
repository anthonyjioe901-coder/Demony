// Deep dive into the investment lifecycle
const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://demony:0249251305Aj@demony.pl3n87x.mongodb.net/?appName=Demony';
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });

async function run() {
  try {
    await client.connect();
    const db = client.db('demony');

    console.log('=== FULL INVESTMENT LIFECYCLE ANALYSIS ===\n');

    // 1. What investment statuses exist?
    console.log('1. ALL INVESTMENT STATUSES:');
    const statuses = await db.collection('investments').aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();
    console.log(statuses);

    // 2. Check if there are any "completed" or "ended" investments
    console.log('\n2. INVESTMENTS BEYOND "ACTIVE":');
    const nonActive = await db.collection('investments').find({ 
      status: { $nin: ['active', 'orphaned'] } 
    }).limit(10).toArray();
    console.log('Found:', nonActive.length);
    if (nonActive.length > 0) {
      console.log('Sample:', nonActive.slice(0, 3).map(i => ({ status: i.status, amount: i.amount })));
    }

    // 3. What happens to an investment when:
    //    - User deletes account? (should be orphaned or deleted)
    //    - User withdraws early? (should be cancelled/withdrawn)
    //    - Project ends? (should be completed)
    //    - Project is cancelled? (should be refunded)
    
    console.log('\n3. PROJECT STATUSES:');
    const projectStatuses = await db.collection('projects').aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();
    console.log(projectStatuses);

    // 4. Is there any withdrawal tracking for investments?
    console.log('\n4. WITHDRAWALS COLLECTION STRUCTURE:');
    const sampleWithdrawal = await db.collection('withdrawals').findOne();
    if (sampleWithdrawal) {
      console.log('Fields:', Object.keys(sampleWithdrawal));
      console.log('Sample:', { type: sampleWithdrawal.type, status: sampleWithdrawal.status, source: sampleWithdrawal.source });
    } else {
      console.log('No withdrawals found');
    }

    // 5. Check for "completed" investments pattern
    console.log('\n5. LOOKING FOR COMPLETED INVESTMENTS:');
    const completed = await db.collection('investments').find({ 
      $or: [
        { status: 'completed' },
        { status: 'ended' },
        { status: 'withdrawn' },
        { status: 'cancelled' }
      ]
    }).toArray();
    console.log('Completed/ended/withdrawn investments:', completed.length);

    // 6. User account deletion tracking?
    console.log('\n6. USER DELETION TRACKING:');
    const inactiveUsers = await db.collection('users').countDocuments({ isActive: false });
    console.log('Users with isActive=false:', inactiveUsers);
    
    const deletedUsers = await db.collection('users').countDocuments({ deleted: true });
    console.log('Users with deleted=true:', deletedUsers);

    // 7. Check if investments have endDate or completedAt
    console.log('\n7. INVESTMENT DATE FIELDS:');
    const invWithDates = await db.collection('investments').findOne({ status: 'active' });
    if (invWithDates) {
      console.log('Fields:', Object.keys(invWithDates));
      console.log('Has endDate:', 'endDate' in invWithDates);
      console.log('Has completedAt:', 'completedAt' in invWithDates);
      console.log('Has withdrawnAt:', 'withdrawnAt' in invWithDates);
    }

    // 8. Check the actual stored investorCount vs what should be shown
    console.log('\n8. MISMATCH ANALYSIS:');
    const fishFarm = await db.collection('projects').findOne({ name: /fish farming/i });
    if (fishFarm) {
      const activeInv = await db.collection('investments').countDocuments({ 
        projectId: fishFarm._id.toString(), 
        status: 'active' 
      });
      const orphanedInv = await db.collection('investments').countDocuments({ 
        projectId: fishFarm._id.toString(), 
        status: 'orphaned' 
      });
      console.log('Commercial Fish Farming:');
      console.log('  - Stored investorCount:', fishFarm.investorCount);
      console.log('  - ACTIVE investments:', activeInv);
      console.log('  - ORPHANED investments:', orphanedInv);
      console.log('  - TOTAL investments:', activeInv + orphanedInv);
      
      // Check those active investments have valid users
      const activeWithUsers = await db.collection('investments').aggregate([
        { $match: { projectId: fishFarm._id.toString(), status: 'active' } },
        { $lookup: {
            from: 'users',
            let: { invUserId: '$userId' },
            pipeline: [
              { $match: { $expr: { $eq: [ { $toString: '$_id' }, { $toString: '$$invUserId' } ] } } },
              { $match: { isActive: { $ne: false } } }
            ],
            as: 'user'
        }},
        { $match: { user: { $ne: [] } } },
        { $count: 'count' }
      ]).toArray();
      console.log('  - Active investments WITH active users:', activeWithUsers[0]?.count || 0);
    }

  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    await client.close();
  }
}

run();
