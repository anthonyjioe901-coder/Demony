// Database seed script
var db = require('./index.js');
var bcrypt = require('bcryptjs');
var dotenv = require('dotenv');

dotenv.config();

async function seed() {
  console.log('Connecting to database...');
  db.init();
  
  // Seed users
  console.log('Seeding users...');
  var hashedPassword = bcrypt.hashSync('password123', 10);
  try {
    await db.Users.create('Demo User', 'demo@demony.com', hashedPassword);
    console.log('Created demo user: demo@demony.com / password123');
  } catch (err) {
    console.log('Demo user already exists or error:', err.message);
  }
  
  // Seed projects
  console.log('Seeding projects...');
  var projects = [
    {
      name: 'GreenTech Solar',
      category: 'renewable-energy',
      description: 'Community solar farm project providing clean energy to 500+ households.',
      goal: 100000,
      returnRateMin: 12,
      returnRateMax: 15,
      endDate: '2026-03-01'
    },
    {
      name: 'Farm Fresh Co-op',
      category: 'agriculture',
      description: 'Local organic farm expanding operations to serve regional markets.',
      goal: 50000,
      returnRateMin: 8,
      returnRateMax: 10,
      endDate: '2026-04-15'
    },
    {
      name: 'TechHub Workspace',
      category: 'real-estate',
      description: 'Modern co-working space for startups and remote workers.',
      goal: 200000,
      returnRateMin: 10,
      returnRateMax: 12,
      endDate: '2026-01-20'
    },
    {
      name: 'Artisan Bakery',
      category: 'food-beverage',
      description: 'Expanding local bakery to second location with cafe.',
      goal: 75000,
      returnRateMin: 9,
      returnRateMax: 11,
      endDate: '2026-05-01'
    },
    {
      name: 'EcoPackage Solutions',
      category: 'technology',
      description: 'Sustainable packaging manufacturing for local businesses.',
      goal: 150000,
      returnRateMin: 14,
      returnRateMax: 18,
      endDate: '2026-02-28'
    },
    {
      name: 'Urban Gardens Network',
      category: 'agriculture',
      description: 'Network of vertical farms supplying fresh produce to city restaurants.',
      goal: 120000,
      returnRateMin: 11,
      returnRateMax: 13,
      endDate: '2026-03-15'
    }
  ];
  
  for (var i = 0; i < projects.length; i++) {
    try {
      await db.Projects.create(projects[i]);
      console.log('Created project:', projects[i].name);
    } catch (err) {
      console.log('Project error:', projects[i].name, err.message);
    }
  }
  
  console.log('Seed complete!');
  await db.close();
}

seed();
