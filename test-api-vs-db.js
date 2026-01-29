// Test API output vs DB
const { MongoClient, ObjectId } = require('mongodb');
const https = require('https');

const uri = 'mongodb+srv://demony:0249251305Aj@demony.pl3n87x.mongodb.net/?appName=Demony';
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });

async function testAPI() {
  return new Promise((resolve, reject) => {
    https.get('https://demony-backend.onrender.com/api/projects', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.projects || []);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  try {
    await client.connect();
    const db = client.db('demony');

    console.log('=== COMPARING DB vs API OUTPUT ===\n');
    
    // Get projects from DB
    const dbProjects = await db.collection('projects').find({ status: 'active' })
      .sort({ priority: -1, featured: -1, createdAt: -1 })
      .limit(6)
      .toArray();
    
    console.log('DB Stored Values (first 6 active projects):');
    for (const p of dbProjects) {
      console.log(`- ${p.name.substring(0, 30)}: investorCount=${p.investorCount}, currentFunding=${p.currentFunding}`);
    }
    
    console.log('\n--- Now fetching from LIVE API ---\n');
    
    try {
      const apiProjects = await testAPI();
      console.log('API Response (first 6):');
      for (const p of apiProjects.slice(0, 6)) {
        console.log(`- ${p.name.substring(0, 30)}: investor_count=${p.investor_count}, raised_amount=${p.raised_amount}`);
      }
    } catch (e) {
      console.log('Could not fetch from API:', e.message);
    }
    
    // The real question: does the API recalculate or use stored values?
    console.log('\n=== KEY ISSUE ===');
    console.log('The code DOES recalculate stats on every request...');
    console.log('But if orphaned investments were marked AFTER the cleanup script,');
    console.log('the deployed server might have cached data or the deployment is stale.\n');
    
    // Check what the CORRECT values should be
    console.log('=== WHAT THE VALUES SHOULD BE (calculated now) ===');
    const projectIds = dbProjects.map(p => p._id.toString());
    const investmentStats = await db.collection('investments').aggregate([
      { $match: { projectId: { $in: projectIds }, status: 'active' } },
      { $lookup: {
          from: 'users',
          let: { invUserId: '$userId' },
          pipeline: [
            { $match: { $expr: { $eq: [ { $toString: '$_id' }, { $toString: '$$invUserId' } ] } } },
            { $match: { isActive: { $ne: false } } },
            { $project: { _id: 1 } }
          ],
          as: 'user'
      }},
      { $match: { user: { $ne: [] } } },
      { $group: { _id: '$projectId', totalAmount: { $sum: '$amount' }, investorCount: { $sum: 1 } } }
    ]).toArray();
    
    const statsByProject = {};
    investmentStats.forEach(s => statsByProject[s._id] = s);
    
    for (const p of dbProjects) {
      const stat = statsByProject[p._id.toString()];
      const correct = stat ? { investors: stat.investorCount, funding: stat.totalAmount } : { investors: 0, funding: 0 };
      console.log(`- ${p.name.substring(0, 30)}: SHOULD BE investors=${correct.investors}, funding=${correct.funding}`);
    }

  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    await client.close();
  }
}

run();
