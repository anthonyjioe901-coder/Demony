// Script to create 500 demo users with random investments in all active projects
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = 'mongodb+srv://demony:0249251305Aj@demony.pl3n87x.mongodb.net/?appName=Demony';
const client = new MongoClient(uri);

// Generate random amount between min and max
function randomAmount(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function createDemoUsersAndInvestments() {
  try {
    console.log('🚀 Starting demo users and investments creation...\n');
    console.log('Connecting to database...');
    await client.connect();
    const database = client.db('demony');
    console.log('✓ Connected to database\n');

    // Hash password for all demo users
    const demoPassword = await bcrypt.hash('demo123', 10);
    
    // Step 1: Get all active projects
    console.log('📋 Fetching active projects...');
    const activeProjects = await database.collection('projects').find({ 
      status: 'active' 
    }).toArray();
    
    if (activeProjects.length === 0) {
      console.log('⚠️  No active projects found. Please create active projects first.');
      process.exit(0);
    }
    
    console.log(`✓ Found ${activeProjects.length} active projects:`);
    activeProjects.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} (${p.category})`);
    });
    console.log('');

    // Step 2: Create 500 demo users
    console.log('👥 Creating 500 demo users...');
    const users = [];
    const batchSize = 100;
    
    for (let i = 1; i <= 500; i++) {
      const user = {
        name: `Edem${i}`,
        email: `edem${i}@demony.com`,
        password: demoPassword,
        role: 'investor',
        phone: `024${String(i).padStart(7, '0')}`,
        
        // KYC fields - mark as verified
        kyc: {
          status: 'verified',
          idDocument: 'demo-verified',
          selfie: 'demo-verified',
          submittedAt: new Date(),
          verifiedAt: new Date(),
          rejectionReason: null
        },
        
        // Account status
        isVerified: true,
        isActive: true,
        
        // Financial - will be updated after investments
        walletBalance: 0,
        totalInvested: 0,
        totalEarnings: 0,
        
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      users.push(user);
      
      // Insert in batches
      if (users.length === batchSize || i === 500) {
        await database.collection('users').insertMany(users);
        console.log(`   ✓ Created users ${i - users.length + 1} to ${i}`);
        users.length = 0; // Clear array
      }
    }
    
    console.log('✓ All 500 demo users created\n');

    // Step 3: Get all demo users we just created
    console.log('💰 Creating investments for each user in each project...');
    const demoUsers = await database.collection('users').find({ 
      email: /^edem\d+@demony\.com$/ 
    }).toArray();
    
    console.log(`✓ Retrieved ${demoUsers.length} demo users\n`);

    // Step 4: Create investments for each user in each project
    let totalInvestmentsCreated = 0;
    let projectUpdates = {};
    
    // Initialize project tracking
    activeProjects.forEach(p => {
      projectUpdates[p._id.toString()] = {
        name: p.name,
        totalAmount: 0,
        count: 0
      };
    });

    // Process users in batches
    const userBatchSize = 50;
    for (let batchStart = 0; batchStart < demoUsers.length; batchStart += userBatchSize) {
      const userBatch = demoUsers.slice(batchStart, Math.min(batchStart + userBatchSize, demoUsers.length));
      const investments = [];
      const userUpdates = [];

      for (const user of userBatch) {
        let userTotalInvested = 0;

        for (const project of activeProjects) {
          const amount = randomAmount(20, 100);
          userTotalInvested += amount;

          // Calculate ownership percentage
          const goalAmount = project.goalAmount || 100000;
          const ownershipPercent = (amount / goalAmount) * 100;

          // Get lock-in period
          const lockInPeriodMonths = project.lockInPeriodMonths || project.duration || 12;
          const lockInEndDate = new Date();
          lockInEndDate.setMonth(lockInEndDate.getMonth() + lockInPeriodMonths);

          const investment = {
            userId: user._id.toString(),
            projectId: project._id.toString(),
            projectName: project.name,
            category: project.category,
            amount: amount,
            ownershipPercent: ownershipPercent,
            status: 'active',
            earnings: 0,
            
            // Lock-in tracking
            lockInPeriodMonths: lockInPeriodMonths,
            lockInEndDate: lockInEndDate,
            isLocked: true,
            
            // Risk acknowledgments
            termsAccepted: true,
            riskAcknowledged: true,
            lossAcknowledged: true,
            lockInAcknowledged: true,
            
            createdAt: new Date(),
            updatedAt: new Date()
          };

          investments.push(investment);
          
          // Track for project updates
          projectUpdates[project._id.toString()].totalAmount += amount;
          projectUpdates[project._id.toString()].count++;
        }

        // Prepare user update
        userUpdates.push({
          updateOne: {
            filter: { _id: user._id },
            update: { 
              $set: { 
                totalInvested: userTotalInvested,
                updatedAt: new Date()
              } 
            }
          }
        });
      }

      // Bulk insert investments
      if (investments.length > 0) {
        await database.collection('investments').insertMany(investments);
        totalInvestmentsCreated += investments.length;
      }

      // Bulk update users
      if (userUpdates.length > 0) {
        await database.collection('users').bulkWrite(userUpdates);
      }

      console.log(`   ✓ Processed users ${batchStart + 1} to ${batchStart + userBatch.length} (${totalInvestmentsCreated} investments created)`);
    }

    // Step 5: Update project raised amounts
    console.log('\n📊 Updating project raised amounts...');
    for (const projectId in projectUpdates) {
      const update = projectUpdates[projectId];
      await database.collection('projects').updateOne(
        { _id: new ObjectId(projectId) },
        { 
          $inc: { raisedAmount: update.totalAmount },
          $set: { updatedAt: new Date() }
        }
      );
      console.log(`   ✓ ${update.name}: +GH₵${update.totalAmount.toFixed(2)} from ${update.count} investments`);
    }

    // Final Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ DEMO DATA CREATION COMPLETE!');
    console.log('='.repeat(60));
    console.log(`👥 Users created: 500 (Edem1 to Edem500)`);
    console.log(`📁 Projects with investments: ${activeProjects.length}`);
    console.log(`💰 Total investments created: ${totalInvestmentsCreated}`);
    console.log(`📧 Email pattern: edem1@demony.com to edem500@demony.com`);
    console.log(`🔑 Password for all demo users: demo123`);
    console.log('\nProject Investment Summary:');
    for (const projectId in projectUpdates) {
      const update = projectUpdates[projectId];
      const avgInvestment = update.totalAmount / update.count;
      console.log(`   • ${update.name}:`);
      console.log(`     Total: GH₵${update.totalAmount.toFixed(2)} | Investments: ${update.count} | Avg: GH₵${avgInvestment.toFixed(2)}`);
    }
    console.log('='.repeat(60));

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    await client.close();
    process.exit(1);
  }
}

createDemoUsersAndInvestments();
