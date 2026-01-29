// Investigate investment and project state
const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://demony:0249251305Aj@demony.pl3n87x.mongodb.net/?appName=Demony';
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });

async function run() {
  try {
    await client.connect();
    const db = client.db('demony');

    // 1. Investment status breakdown
    console.log('=== INVESTMENT STATUS BREAKDOWN ===');
    const investmentStats = await db.collection('investments').aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
    ]).toArray();
    console.log(investmentStats);

    // 2. Check a specific project (e.g., Commercial Fish Farming)
    console.log('\n=== SAMPLE PROJECT: Commercial Fish Farming ===');
    const fishProject = await db.collection('projects').findOne({ name: /fish farming/i });
    if (fishProject) {
      console.log('Project ID:', fishProject._id.toString());
      console.log('Stored investorCount:', fishProject.investorCount);
      console.log('Stored currentFunding:', fishProject.currentFunding);
      
      // Count ACTIVE investments for this project
      const activeInv = await db.collection('investments').countDocuments({ 
        projectId: fishProject._id.toString(), 
        status: 'active' 
      });
      console.log('Actual ACTIVE investments:', activeInv);
      
      // Count ALL investments for this project
      const allInv = await db.collection('investments').countDocuments({ 
        projectId: fishProject._id.toString()
      });
      console.log('ALL investments (any status):', allInv);
      
      // Count ORPHANED investments for this project
      const orphanedInv = await db.collection('investments').countDocuments({ 
        projectId: fishProject._id.toString(), 
        status: 'orphaned' 
      });
      console.log('ORPHANED investments:', orphanedInv);
    }

    // 3. Check if there are still active investments with missing users
    console.log('\n=== ACTIVE INVESTMENTS WITH MISSING USERS ===');
    const badInvestments = await db.collection('investments').aggregate([
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'users',
          let: { invUserId: '$userId' },
          pipeline: [
            { $match: { $expr: { $eq: [{ $toString: '$_id' }, { $toString: '$$invUserId' }] } } },
            { $project: { _id: 1, name: 1, email: 1 } }
          ],
          as: 'user'
        }
      },
      { $match: { user: { $size: 0 } } },
      { $limit: 10 },
      { $project: { _id: 1, userId: 1, projectId: 1, amount: 1, status: 1 } }
    ]).toArray();
    console.log('Active investments with NO user:', badInvestments.length);
    if (badInvestments.length > 0) {
      console.log('Sample:', badInvestments.slice(0, 3));
    }

    // 4. Check how projects.js fetches data (what field is used)
    console.log('\n=== SAMPLE PROJECT RAW DATA ===');
    const sampleProject = await db.collection('projects').findOne({ status: 'active' });
    if (sampleProject) {
      console.log('Fields:', Object.keys(sampleProject));
      console.log('investorCount:', sampleProject.investorCount);
      console.log('currentFunding:', sampleProject.currentFunding);
      console.log('raisedAmount:', sampleProject.raisedAmount);
    }

    // 5. Check if projectId is stored as string or ObjectId
    console.log('\n=== INVESTMENT projectId TYPE ===');
    const sampleInv = await db.collection('investments').findOne({ status: 'active' });
    if (sampleInv) {
      console.log('projectId:', sampleInv.projectId, '- Type:', typeof sampleInv.projectId);
    }

  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    await client.close();
  }
}

run();
