// Script to create Kaboat Enterprise business projects
const https = require('https');
const http = require('http');

const API_URL = 'https://demony-api.onrender.com/api';
const ADMIN_EMAIL = 'Janet@demony.com';
const ADMIN_PASSWORD = 'password123';

// Helper function to make HTTP requests
function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = protocol.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${response.error || body}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Login as admin
async function loginAdmin() {
  console.log('Logging in as admin...');
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  
  try {
    const response = await makeRequest(`${API_URL}/auth/login`, {
      method: 'POST'
    }, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    console.log('✓ Admin login successful');
    return response.token;
  } catch (error) {
    console.log('\n⚠ Login failed. Attempting to signup first...');
    
    // Try to signup the admin user
    const signupResponse = await makeRequest(`${API_URL}/auth/signup`, {
      method: 'POST'
    }, {
      name: 'Janet',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'investor' // Will be changed to admin manually
    });
    
    console.log('✓ User created, but needs admin privileges');
    console.log('Please make this user an admin in the database and rerun the script.');
    throw new Error('Admin user needs to be created/updated in database');
  }
}

// Create a project
async function createProject(token, projectData) {
  console.log(`Creating project: ${projectData.name}...`);
  const response = await makeRequest(`${API_URL}/admin/projects`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }, projectData);
  
  console.log(`✓ Created: ${projectData.name}`);
  return response;
}

// Project definitions based on Kaboat Enterprise images
const projects = [
  {
    name: 'Pure Water Selling Business',
    category: 'Retail',
    description: 'Start a pure water selling business at bus stops, events, or roadside kiosks. Buy sachet water in bulk and sell at bus stops, events, or roadside kiosks. This is one of the most accessible businesses in Ghana with high daily demand.\n\n📋 Business Plan: Focus on location and hygiene. Cold water sells better. Learn basic sales talk to attract customers. Operate near bus stops or markets for quick traction.\n\n💰 Use of Funds: Buy sachet water in bulk, transportation to selling location, cooler/ice for cold water.\n\n👥 Team: Solo entrepreneur or small team of 1-2 people\n\n🎯 Milestones: Week 1: Purchase inventory and secure location. Week 2-4: Establish customer base and optimize sales strategy.',
    goalAmount: 100,
    minInvestment: 10,
    targetReturn: '25% in 30 days',
    duration: '30 days',
    riskLevel: 'low',
    imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800',
    featured: true
  },
  {
    name: 'Mobile Money Agent Business',
    category: 'Financial Services',
    description: 'Become a Mobile Money (MoMo) agent and earn commissions on every transaction. Set up a table with umbrella, banner, and float to serve customers in busy areas. High daily demand especially in busy areas.\n\n📋 Business Plan: Start with GHS 300-1000 depending on vendor. What you need: Table/umbrella, banner, float. Operate near bus stops or markets for quick traction.\n\n💰 Use of Funds: Initial float capital, table and umbrella setup, branded banner, registration fees.\n\n👥 Team: Solo entrepreneur\n\n🎯 Milestones: Day 1: Complete vendor registration. Week 1: Establish location and build customer trust. Month 1: Achieve consistent daily transaction volume.',
    goalAmount: 1000,
    minInvestment: 100,
    targetReturn: '20% in 30 days',
    duration: '30 days',
    riskLevel: 'low',
    imageUrl: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=800',
    featured: true
  },
  {
    name: 'Detergent & Liquid Soap Production',
    category: 'Manufacturing',
    description: 'Use GHS 100 to buy materials to make liquid soap in small quantities. Start with 20-30 bottles and sell to your area residents and shops. Everyone uses soap—homes, restaurants, schools.\n\n📋 Business Plan: Learn the right mixing ratios and packaging tricks. Branding even with a handwritten label builds trust. Start with 20-30 bottles and sell to area residents and local shops.\n\n💰 Use of Funds: Raw materials (caustic soda, STPP, SLS, fragrance), containers, branding materials.\n\n👥 Team: Solo entrepreneur or 2-person production team\n\n🎯 Milestones: Week 1: Source materials and perfect formula. Week 2-4: Begin production and sales. Month 2: Establish repeat customer base.',
    goalAmount: 600,
    minInvestment: 50,
    targetReturn: '30% in 60 days',
    duration: '60 days',
    riskLevel: 'low',
    imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800',
    featured: true
  },
  {
    name: 'Second-Hand Clothes (Fose) Business',
    category: 'Retail',
    description: 'Small-scale thrift clothing business. Buy quality pieces from Kantamanto or local markets and resell. Demand is high, and margins are strong when you select well.\n\n📋 Business Plan: Buy a bale selection, clean presentation, phone for WhatsApp selling. Wash, iron, and package nicely. Post good pictures on WhatsApp, Instagram, and Facebook Marketplace. Focus on shirts, ladies\' tops, or children\'s items.\n\n💰 Use of Funds: Purchase quality bale selection, cleaning and presentation supplies, marketing materials.\n\n👥 Team: Solo entrepreneur\n\n🎯 Milestones: Week 1: Source quality pieces. Week 2-6: Build online presence and customer base. Month 2: Achieve steady sales flow.',
    goalAmount: 1000,
    minInvestment: 100,
    targetReturn: '35% in 45 days',
    duration: '45 days',
    riskLevel: 'medium',
    imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800',
    featured: false
  },
  {
    name: 'Airtime & Data Reseller Business',
    category: 'Telecommunications',
    description: 'Use mobile platforms like Hubtel or Epaygh to sell airtime and data. Offer bonuses or bundles and use WhatsApp broadcast to push daily deals to customers.\n\n📋 Business Plan: Use mobile platforms (Hubtel, Epaygh) to sell airtime and data. Offer bonuses or bundles. Use WhatsApp broadcast to push daily deals.\n\n💰 Use of Funds: Initial platform registration, working capital for inventory, marketing budget.\n\n👥 Team: Solo entrepreneur\n\n🎯 Milestones: Week 1: Set up platform account. Week 2-4: Build customer database and establish daily sales routine.',
    goalAmount: 500,
    minInvestment: 50,
    targetReturn: '18% in 30 days',
    duration: '30 days',
    riskLevel: 'low',
    imageUrl: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800',
    featured: false
  },
  {
    name: 'Fried Groundnut & Snack Business',
    category: 'Food & Beverage',
    description: 'Buy raw groundnuts, roast and sell in traffic or to students. Cleanliness and packaging matter. Small sachets (₵1/₵2) move faster and generate quick daily cash.\n\n📋 Business Plan: Buy raw groundnuts, roast and sell in traffic or to students. Cleanliness and packaging matter. Small sachets (₵1/₵2) move faster.\n\n💰 Use of Funds: Purchase raw groundnuts, roasting equipment/fuel, packaging materials (small sachets).\n\n👥 Team: Solo entrepreneur\n\n🎯 Milestones: Week 1: Perfect roasting technique and packaging. Week 2-4: Establish selling locations and customer base.',
    goalAmount: 300,
    minInvestment: 30,
    targetReturn: '28% in 30 days',
    duration: '30 days',
    riskLevel: 'low',
    imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800',
    featured: false
  },
  {
    name: 'Digital Services for Small Business',
    category: 'Technology',
    description: 'No skills? Start simple digital services like social media posting for small shops, WhatsApp status marketing, CV writing, or logo/flyer design using Canva free version. Demand for online presence is strong.\n\n📋 Business Plan: Startup: GHS 0-300. What you need: Phone/laptop and data. Examples: Social media posting for small shops, WhatsApp status marketing, CV writing, Logo/text flyer design (using Canva free version).\n\n💰 Use of Funds: Internet data packages, basic laptop/phone upgrades, marketing materials, skill development resources.\n\n👥 Team: Solo freelancer\n\n🎯 Milestones: Week 1: Build portfolio with free/sample work. Week 2-6: Acquire first 5 paying clients. Month 2: Establish reputation and referral network.',
    goalAmount: 300,
    minInvestment: 30,
    targetReturn: '40% in 45 days',
    duration: '45 days',
    riskLevel: 'low',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    featured: true
  },
  {
    name: 'Mobile Snacks & Breakfast Table',
    category: 'Food & Beverage',
    description: 'Setup mobile breakfast table selling bread, eggs, tea, sausage around traffic areas, schools, or bus stops. Breakfast sells every day—workers and students love it. Startup requires minimal capital.\n\n📋 Business Plan: Startup: GHS 300-1,000. What you need: Bread, eggs, tea, sausage, table, charcoal or heater. Sell around traffic areas, schools, bus stops. Breakfast sells every day—workers and students love it.\n\n💰 Use of Funds: Daily ingredients (bread, eggs, tea, sausage), portable table setup, charcoal/heater, basic utensils.\n\n👥 Team: Solo entrepreneur or 2-person team\n\n🎯 Milestones: Week 1: Set up location and test menu. Week 2-4: Build loyal morning customer base.',
    goalAmount: 800,
    minInvestment: 80,
    targetReturn: '32% in 30 days',
    duration: '30 days',
    riskLevel: 'low',
    imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800',
    featured: false
  },
  {
    name: 'Local Food Selling Business',
    category: 'Food & Beverage',
    description: 'Buy ingredients and cook in small quantities. Sell from your home or a friend\'s shop front. Keep the food neat, hot, and consistent. Your first customers are your marketers—treat them well.\n\n📋 Business Plan: Buy ingredients and cook in small quantities. Sell from your home or a friend\'s shop front. Keep the food neat, hot, and consistent. Your first customers are your marketers—treat them well.\n\n💰 Use of Funds: Daily ingredients, cooking utensils, serving materials, location setup.\n\n👥 Team: Solo entrepreneur or small cooking team\n\n🎯 Milestones: Week 1: Test menu and gather feedback. Week 2-4: Establish daily cooking routine and regular customers.',
    goalAmount: 500,
    minInvestment: 50,
    targetReturn: '30% in 30 days',
    duration: '30 days',
    riskLevel: 'low',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
    featured: false
  },
  {
    name: 'Phone Accessories Table Business',
    category: 'Retail',
    description: 'Setup small table with umbrella selling phone chargers, earpieces, screen protectors. Quick turnover and high daily cash flow. Operate near busy areas for maximum visibility.\n\n📋 Business Plan: Startup: GHS 500-1,000. What you need: Small table, umbrella, chargers, earpieces, screen protectors. Quick turnover and high daily cash flow.\n\n💰 Use of Funds: Initial inventory (chargers, earpieces, screen protectors), small table and umbrella, display materials.\n\n👥 Team: Solo entrepreneur\n\n🎯 Milestones: Week 1: Set up location and stock inventory. Week 2-6: Build customer base and optimize inventory based on demand.',
    goalAmount: 800,
    minInvestment: 80,
    targetReturn: '25% in 45 days',
    duration: '45 days',
    riskLevel: 'low',
    imageUrl: 'https://images.unsplash.com/photo-1625738815307-c4245fdbd062?w=800',
    featured: false
  }
];

// Main execution
async function main() {
  try {
    console.log('=== Kaboat Enterprise Projects Creation ===\n');
    
    // Login
    const token = await loginAdmin();
    console.log('');
    
    // Create all projects
    console.log('Creating projects...\n');
    let successCount = 0;
    
    for (const project of projects) {
      try {
        await createProject(token, project);
        successCount++;
      } catch (error) {
        console.error(`✗ Failed to create ${project.name}: ${error.message}`);
      }
    }
    
    console.log(`\n=== Summary ===`);
    console.log(`✓ Successfully created ${successCount}/${projects.length} projects`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
