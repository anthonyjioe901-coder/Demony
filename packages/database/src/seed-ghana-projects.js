// Seed Ghana Business Projects to MongoDB Database
var db = require('./index');
var fs = require('fs');
var path = require('path');

async function seedGhanaProjects() {
  try {
    console.log('Starting to seed Ghana business projects...');
    
    // Read the JSON file
    var projectsPath = path.join(__dirname, '../../backend/ghana-business-projects.json');
    var projectsData = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
    
    console.log(`Found ${projectsData.length} projects to seed`);
    
    // Get database connection
    var database = await db.getDb();
    var projectsCollection = database.collection('projects');
    
    // Check current project count
    var currentCount = await projectsCollection.countDocuments();
    console.log(`Current projects in database: ${currentCount}`);
    
    var inserted = 0;
    var skipped = 0;
    var errors = 0;
    
    // Insert each project
    for (var i = 0; i < projectsData.length; i++) {
      var project = projectsData[i];
      
      try {
        // Check if project already exists by name
        var existingProject = await projectsCollection.findOne({ name: project.name });
        
        if (existingProject) {
          console.log(`Skipping "${project.name}" - already exists`);
          skipped++;
          continue;
        }
        
        // Calculate end date based on duration (in days)
        var endDate = new Date();
        endDate.setDate(endDate.getDate() + project.duration);
        
        // Convert JSON structure to MongoDB document structure
        var mongoProject = {
          name: project.name,
          category: project.category,
          description: project.description,
          imageUrl: project.image_url,
          goalAmount: project.goal_amount,
          raisedAmount: project.raised_amount || 0,
          minInvestment: project.min_investment,
          targetReturn: project.target_return,
          duration: project.duration,
          riskLevel: project.risk_level,
          endDate: endDate,
          status: project.status,
          featured: project.featured || false,
          priority: project.priority || 0,
          tags: typeof project.tags === 'string' ? project.tags.split(',').map(t => t.trim()) : [],
          investorCount: 0,
          totalProfitDistributed: 0,
          
          // Investment Terms
          profitDistributionFrequency: project.profit_distribution_frequency || 'as_realized',
          lockInPeriodMonths: project.lock_in_period_months || 12,
          profitSharingRatio: { investor: 80, platform: 20 },
          
          // Project Progress Status
          progressStatus: 'not_started',
          
          // Risk Information
          riskFactors: ['Market conditions may affect returns', 'Principal is locked for project duration'],
          
          // Timestamps
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Insert project into MongoDB
        await projectsCollection.insertOne(mongoProject);
        
        inserted++;
        if ((inserted % 10) === 0) {
          console.log(`Inserted ${inserted}/${projectsData.length} projects...`);
        }
      } catch (err) {
        console.error(`Error inserting "${project.name}":`, err.message);
        errors++;
      }
    }
    
    console.log('\n=== Seeding Complete ===');
    console.log(`Inserted: ${inserted}`);
    console.log(`Skipped (already exist): ${skipped}`);
    console.log(`Errors: ${errors}`);
    console.log(`Total in database: ${currentCount + inserted}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Fatal error seeding projects:', err);
    process.exit(1);
  }
}

// Run the seed
seedGhanaProjects();
