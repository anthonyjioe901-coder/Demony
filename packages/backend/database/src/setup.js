// Database setup script
var db = require('./index.js');
var dotenv = require('dotenv');

dotenv.config();

async function setup() {
  console.log('Connecting to PostgreSQL database...');
  
  // Initialize database connection
  db.init();
  
  console.log('Creating tables...');
  
  try {
    await db.createTables();
    console.log('Database setup complete!');
  } catch (err) {
    console.error('Error creating tables:', err.message);
  } finally {
    await db.close();
  }
}

setup();
