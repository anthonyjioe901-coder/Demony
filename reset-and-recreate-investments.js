// Script to reset and recreate demo users with smarter investment distribution
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = 'mongodb+srv://demony:0249251305Aj@demony.pl3n87x.mongodb.net/?appName=Demony';
const client = new MongoClient(uri);

// Generate random amount between min and max
function randomAmount(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Shuffle array randomly
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function resetAndRecreateInvestments() {
  try {
    console.log('🔄 Resetting and recreating demo users and investments...\n');
    console.log('Connecting to database...');
    await client.connect();
    const database = client.db('demony');
    console.log('✓ Connected to database\n');

    // Step 1: Delete all existing demo users and their investments
    console.log('🗑️  Cleaning up existing demo data...');
    
    // Find all demo user IDs
    const demoUsers = await database.collection('users').find({ 
      email: /^edem\d+@demony\.com$/ 
    }).toArray();
    
    const demoUserIds = demoUsers.map(u => u._id.toString());
    
    if (demoUserIds.length > 0) {
      // Delete investments made by demo users
      const investmentsDeleted = await database.collection('investments').deleteMany({
        userId: { $in: demoUserIds }
      });
      console.log(`   ✓ Deleted ${investmentsDeleted.deletedCount} existing investments`);
      
      // Delete demo users
      const usersDeleted = await database.collection('users').deleteMany({
        email: /^edem\d+@demony\.com$/
      });
      console.log(`   ✓ Deleted ${usersDeleted.deletedCount} demo users`);
      
      // Reset project raised amounts and investor counts
      await database.collection('projects').updateMany(
        { status: 'active' },
        { 
          $set: { 
            raisedAmount: 0,
            investorCount: 0,
            updatedAt: new Date() 
          } 
        }
      );
      console.log('   ✓ Reset project raised amounts and investor counts\n');
    } else {
      console.log('   ℹ️  No existing demo data found\n');
    }

    // Step 2: Get all active projects
    console.log('📋 Fetching active projects...');
    const activeProjects = await database.collection('projects').find({ 
      status: 'active' 
    }).toArray();
    
    if (activeProjects.length === 0) {
      console.log('⚠️  No active projects found. Please create active projects first.');
      await client.close();
      process.exit(0);
    }
    
    console.log(`✓ Found ${activeProjects.length} active projects\n`);

    // Step 3: Create 500 demo users
    console.log('👥 Creating 500 demo users...');
    const demoPassword = await bcrypt.hash('demo123', 10);
    const users = [];
    const batchSize = 100;
    
    for (let i = 1; i <= 500; i++) {
      const user = {
        name: `Edem${i}`,
        email: `edem${i}@demony.com`,
        password: demoPassword,
        role: 'investor',
        phone: `024${String(i).padStart(7, '0')}`,
        
        kyc: {
          status: 'verified',
          idDocument: 'demo-verified',
          selfie: 'demo-verified',
          submittedAt: new Date(),
          verifiedAt: new Date(),
          rejectionReason: null
        },
        
        isVerified: true,
        isActive: true,
        
        walletBalance: 0,
        totalInvested: 0,
        totalEarnings: 0,
        
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      users.push(user);
      
      if (users.length === batchSize || i === 500) {
        await database.collection('users').insertMany(users);
        console.log(`   ✓ Created users ${i - users.length + 1} to ${i}`);
        users.length = 0;
      }
    }
    
    console.log('✓ All 500 demo users created\n');

    // Step 4: Get all demo users
    console.log('💰 Creating smart investments (5 projects per user, 5-50 cedis)...');
    const allDemoUsers = await database.collection('users').find({ 
      email: /^edem\d+@demony\.com$/ 
    }).toArray();
    
    console.log(`✓ Retrieved ${allDemoUsers.length} demo users\n`);

    // Track project totals and investor counts
    const projectStats = {};
    activeProjects.forEach(p => {
      projectStats[p._id.toString()] = {
        name: p.name,
        goalAmount: p.goalAmount || 100000,
        maxAllowed: (p.goalAmount || 100000) * 0.6, // 60% of goal
        currentTotal: 0,
        investorCount: 0,
        investments: []
      };
    });

    let totalInvestmentsCreated = 0;
    let skippedInvestments = 0;

    // Process each user
    for (let i = 0; i < allDemoUsers.length; i++) {
      const user = allDemoUsers[i];
      
      // Randomly select 5 projects for this user
      const shuffledProjects = shuffleArray(activeProjects);
      const selectedProjects = shuffledProjects.slice(0, 5);
      
      let userTotalInvested = 0;
      const userInvestments = [];

      for (const project of selectedProjects) {
        const projectId = project._id.toString();
        const stats = projectStats[projectId];
        
        // Generate random investment amount (5-50 cedis)
        const amount = randomAmount(5, 50);
        
        // Check if this investment would exceed 60% of project goal
        if (stats.currentTotal + amount > stats.maxAllowed) {
          skippedInvestments++;
          continue; // Skip this investment
        }
        
        userTotalInvested += amount;
        
        // Calculate ownership percentage
        const ownershipPercent = (amount / stats.goalAmount) * 100;
        
        // Get lock-in period
        const lockInPeriodMonths = project.lockInPeriodMonths || project.duration || 12;
        const lockInEndDate = new Date();
        lockInEndDate.setMonth(lockInEndDate.getMonth() + lockInPeriodMonths);

        const investment = {
          userId: user._id.toString(),
          projectId: projectId,
          projectName: project.name,
          category: project.category,
          amount: amount,
          ownershipPercent: ownershipPercent,
          status: 'active',
          earnings: 0,
          
          lockInPeriodMonths: lockInPeriodMonths,
          lockInEndDate: lockInEndDate,
          isLocked: true,
          
          termsAccepted: true,
          riskAcknowledged: true,
          lossAcknowledged: true,
          lockInAcknowledged: true,
          
          createdAt: new Date(),
          updatedAt: new Date()
        };

        userInvestments.push(investment);
        
        // Update project stats
        stats.currentTotal += amount;
        stats.investments.push(amount);
        
        // Only count unique investors
        if (!stats.investorCount || stats.investments.length === 1) {
          stats.investorCount++;
        } else {
          // Check if this is a new investor for this project
          const existingInvestment = await database.collection('investments').findOne({
            userId: user._id.toString(),
            projectId: projectId
          });
          if (!existingInvestment) {
            stats.investorCount++;
          }
        }
      }

      // Insert this user's investments
      if (userInvestments.length > 0) {
        await database.collection('investments').insertMany(userInvestments);
        totalInvestmentsCreated += userInvestments.length;
        
        // Update user's total invested
        await database.collection('users').updateOne(
          { _id: user._id },
          { 
            $set: { 
              totalInvested: userTotalInvested,
              updatedAt: new Date()
            } 
          }
        );
      }

      // Progress update every 50 users
      if ((i + 1) % 50 === 0 || i === allDemoUsers.length - 1) {
        console.log(`   ✓ Processed ${i + 1}/${allDemoUsers.length} users (${totalInvestmentsCreated} investments created)`);
      }
    }

    // Step 5: Update project raised amounts and investor counts
    console.log('\n📊 Updating project statistics...');
    for (const projectId in projectStats) {
      const stats = projectStats[projectId];
      
      // Count unique investors for this project
      const uniqueInvestors = await database.collection('investments').distinct('userId', {
        projectId: projectId
      });
      
      await database.collection('projects').updateOne(
        { _id: new ObjectId(projectId) },
        { 
          $set: { 
            raisedAmount: stats.currentTotal,
            investorCount: uniqueInvestors.length,
            updatedAt: new Date()
          }
        }
      );
      
      const percentOfGoal = (stats.currentTotal / stats.goalAmount * 100).toFixed(1);
      console.log(`   ✓ ${stats.name}:`);
      console.log(`     Raised: GH₵${stats.currentTotal} (${percentOfGoal}% of GH₵${stats.goalAmount}) | Investors: ${uniqueInvestors.length}`);
    }

    // Final Summary
    console.log('\n' + '='.repeat(70));
    console.log('✅ SMART DEMO DATA CREATION COMPLETE!');
    console.log('='.repeat(70));
    console.log(`👥 Users created: 500 (Edem1 to Edem500)`);
    console.log(`📁 Projects available: ${activeProjects.length}`);
    console.log(`🎯 Projects per user: 5 (randomly selected)`);
    console.log(`💰 Total investments created: ${totalInvestmentsCreated}`);
    console.log(`⚠️  Investments skipped (would exceed 60% limit): ${skippedInvestments}`);
    console.log(`💵 Investment range: GH₵5 - GH₵50 per investment`);
    console.log(`📧 Email pattern: edem1@demony.com to edem500@demony.com`);
    console.log(`🔑 Password for all demo users: demo123`);
    console.log('\nKey Metrics:');
    console.log(`   • Average investments per user: ${(totalInvestmentsCreated / 500).toFixed(1)}`);
    console.log(`   • Average investment amount: GH₵${(Object.values(projectStats).reduce((sum, p) => sum + p.currentTotal, 0) / totalInvestmentsCreated).toFixed(2)}`);
    console.log(`   • Total capital deployed: GH₵${Object.values(projectStats).reduce((sum, p) => sum + p.currentTotal, 0)}`);
    console.log('='.repeat(70));

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    await client.close();
    process.exit(1);
  }
}

resetAndRecreateInvestments();
