var db = require('./index');

async function setup() {
  try {
    // Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Projects table
    await db.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50),
        goal_amount DECIMAL(12, 2) NOT NULL,
        raised_amount DECIMAL(12, 2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Investments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS investments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        project_id INTEGER REFERENCES projects(id),
        amount DECIMAL(12, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database setup completed');
    process.exit(0);
  } catch (err) {
    console.error('Error setting up database:', err);
    process.exit(1);
  }
}

setup();
