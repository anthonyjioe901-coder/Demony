// Database seed - MongoDB version
var db = require('./index');
var bcrypt = require('bcryptjs');

async function seed() {
  try {
    await db.connect();
    var database = await db.getDb();
    
    console.log('Seeding database...');
    
    // Clear existing seed data (only demo data, not real user data)
    await database.collection('projects').deleteMany({ _seeded: true });
    
    // Seed a demo user
    var existingDemo = await database.collection('users').findOne({ email: 'demo@demony.com' });
    var demoUserId;
    
    if (!existingDemo) {
      var hashedPassword = await bcrypt.hash('password123', 10);
      var userResult = await database.collection('users').insertOne({
        name: 'Demo User',
        email: 'demo@demony.com',
        password: hashedPassword,
        role: 'investor',
        phone: '+233241234567',
        kyc: { status: 'verified', submittedAt: new Date(), verifiedAt: new Date() },
        isVerified: true,
        isActive: true,
        walletBalance: 5000,
        totalInvested: 0,
        totalEarnings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        _seeded: true
      });
      demoUserId = userResult.insertedId;
      console.log('  Created demo user: demo@demony.com / password123');
    } else {
      demoUserId = existingDemo._id;
      console.log('  Demo user already exists');
    }
    
    // Seed Projects
    var projects = [
      {
        name: 'GreenTech Solar',
        description: 'Renewable energy for local communities in the Greater Accra region. Installing solar panels for 500 households.',
        category: 'Renewable Energy',
        goalAmount: 100000,
        currentFunding: 0,
        investorCount: 0,
        minInvestment: 50,
        roiPercent: 15,
        duration: 12,
        lockInPeriodMonths: 12,
        status: 'active',
        location: 'Accra, Ghana',
        createdAt: new Date(),
        updatedAt: new Date(),
        _seeded: true
      },
      {
        name: 'Farm Fresh Co-op',
        description: 'Organic farming cooperative supporting local farmers in the Ashanti region.',
        category: 'Agriculture',
        goalAmount: 50000,
        currentFunding: 0,
        investorCount: 0,
        minInvestment: 20,
        roiPercent: 12,
        duration: 6,
        lockInPeriodMonths: 6,
        status: 'active',
        location: 'Kumasi, Ghana',
        createdAt: new Date(),
        updatedAt: new Date(),
        _seeded: true
      },
      {
        name: 'TechHub Workspace',
        description: 'Co-working space for tech startups in East Legon. Modern facilities with mentorship programmes.',
        category: 'Real Estate',
        goalAmount: 200000,
        currentFunding: 0,
        investorCount: 0,
        minInvestment: 100,
        roiPercent: 18,
        duration: 18,
        lockInPeriodMonths: 18,
        status: 'active',
        location: 'Accra, Ghana',
        createdAt: new Date(),
        updatedAt: new Date(),
        _seeded: true
      },
      {
        name: 'Artisan Bakery',
        description: 'Handcrafted breads and pastries using locally sourced ingredients.',
        category: 'Food & Beverage',
        goalAmount: 75000,
        currentFunding: 0,
        investorCount: 0,
        minInvestment: 20,
        roiPercent: 10,
        duration: 8,
        lockInPeriodMonths: 8,
        status: 'active',
        location: 'Tema, Ghana',
        createdAt: new Date(),
        updatedAt: new Date(),
        _seeded: true
      },
      {
        name: 'EcoPackage Solutions',
        description: 'Sustainable packaging materials for businesses. Reducing plastic waste across West Africa.',
        category: 'Technology',
        goalAmount: 150000,
        currentFunding: 0,
        investorCount: 0,
        minInvestment: 50,
        roiPercent: 14,
        duration: 12,
        lockInPeriodMonths: 12,
        status: 'active',
        location: 'Accra, Ghana',
        createdAt: new Date(),
        updatedAt: new Date(),
        _seeded: true
      }
    ];

    var result = await database.collection('projects').insertMany(projects);
    console.log('  Inserted', result.insertedCount, 'projects');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seed();
