// Script to fix profit sharing ratio from 60/40 to 80/20
// Run this once to update all existing projects in the database

var db = require('./packages/database/src/index');

async function fixProfitSharing() {
  console.log('🔧 Fixing profit sharing ratios...\n');
  
  try {
    var database = await db.getDb();
    
    // Update all projects to use 80/20 split
    console.log('📊 Updating projects...');
    var projectResult = await database.collection('projects').updateMany(
      {
        $or: [
          { profitSharingRatio: { investor: 60, platform: 40 } },
          { profitSharingRatio: { $exists: false } }
        ]
      },
      {
        $set: { profitSharingRatio: { investor: 80, platform: 20 } }
      }
    );
    
    console.log('✅ Updated ' + projectResult.modifiedCount + ' projects to 80/20 split');
    
    // Get all profit distributions that were made with old 60/40 split
    console.log('\n📈 Checking profit distributions...');
    var distributions = await database.collection('profit_distributions')
      .find({ 
        $or: [
          { investorSharePercent: { $exists: false } },
          { investorSharePercent: 60 }
        ]
      })
      .toArray();
    
    if (distributions.length > 0) {
      console.log('⚠️  Found ' + distributions.length + ' distributions made with old or unknown split');
      console.log('💡 These distributions have already been paid out and cannot be automatically corrected.');
      console.log('   The platform fee shortfall should be noted in accounting records.');
      
      // Calculate the shortfall
      var totalPaidToInvestors = distributions.reduce(function(sum, d) {
        return sum + d.amount;
      }, 0);
      
      // If these were 60/40 splits, the correct 80/20 split would have meant:
      // Gross profit = totalPaidToInvestors / 0.6
      // Should have paid = grossProfit * 0.8
      // Platform should have gotten = grossProfit * 0.2
      
      var estimatedGrossProfit = totalPaidToInvestors / 0.6;
      var shouldHavePaidInvestors = estimatedGrossProfit * 0.8;
      var platformShouldHaveGotten = estimatedGrossProfit * 0.2;
      var platformActuallyGot = estimatedGrossProfit - totalPaidToInvestors;
      var platformShortfall = platformShouldHaveGotten - platformActuallyGot;
      
      console.log('\n📊 Financial Summary (assuming 60/40 was used):');
      console.log('   Total paid to investors: GH₵' + totalPaidToInvestors.toFixed(2));
      console.log('   Estimated gross profit: GH₵' + estimatedGrossProfit.toFixed(2));
      console.log('   Should have paid investors (80%): GH₵' + shouldHavePaidInvestors.toFixed(2));
      console.log('   Platform should have received (20%): GH₵' + platformShouldHaveGotten.toFixed(2));
      console.log('   Platform actually received (40%): GH₵' + platformActuallyGot.toFixed(2));
      console.log('   ⚠️  EXCESS platform fee collected: GH₵' + Math.abs(platformShortfall).toFixed(2));
      console.log('\n   NOTE: Platform collected MORE than it should have (good for platform, bad for investors)');
      console.log('   Consider: Redistributing excess to investors as goodwill gesture\n');
    } else {
      console.log('✅ No old distributions found - all new distributions will use 80/20 split');
    }
    
    console.log('\n✅ Database migration complete!');
    console.log('💡 All future profit distributions will use 80/20 split automatically.\n');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

// Run the fix
fixProfitSharing();
