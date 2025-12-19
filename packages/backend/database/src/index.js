// Demony Database Module
// Using PostgreSQL - works with any PostgreSQL provider (Neon, Supabase, Railway, Atlas, etc.)

var pg = require('pg');
var dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Database pool
var pool = null;

// Database schema (PostgreSQL syntax)
var SCHEMA = {
  users: 
    'CREATE TABLE IF NOT EXISTS users (' +
    'id SERIAL PRIMARY KEY,' +
    'name TEXT NOT NULL,' +
    'email TEXT UNIQUE NOT NULL,' +
    'password TEXT NOT NULL,' +
    'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,' +
    'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP' +
    ')',
  
  projects: 
    'CREATE TABLE IF NOT EXISTS projects (' +
    'id SERIAL PRIMARY KEY,' +
    'name TEXT NOT NULL,' +
    'category TEXT NOT NULL,' +
    'description TEXT,' +
    'goal DECIMAL NOT NULL,' +
    'raised DECIMAL DEFAULT 0,' +
    'return_rate_min DECIMAL,' +
    'return_rate_max DECIMAL,' +
    'start_date TIMESTAMP,' +
    'end_date TIMESTAMP,' +
    'status TEXT DEFAULT \'active\',' +
    'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,' +
    'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP' +
    ')',
  
  investments: 
    'CREATE TABLE IF NOT EXISTS investments (' +
    'id SERIAL PRIMARY KEY,' +
    'user_id INTEGER NOT NULL REFERENCES users(id),' +
    'project_id INTEGER NOT NULL REFERENCES projects(id),' +
    'amount DECIMAL NOT NULL,' +
    'status TEXT DEFAULT \'active\',' +
    'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP' +
    ')',
  
  returns: 
    'CREATE TABLE IF NOT EXISTS returns (' +
    'id SERIAL PRIMARY KEY,' +
    'investment_id INTEGER NOT NULL REFERENCES investments(id),' +
    'amount DECIMAL NOT NULL,' +
    'date TIMESTAMP NOT NULL,' +
    'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP' +
    ')'
};

// Initialize database connection
function init(connectionUrl) {
  connectionUrl = connectionUrl || process.env.DATABASE_URL;
  
  if (!connectionUrl) {
    console.error('DATABASE_URL not set. Please set it in .env file or pass it to init()');
    return null;
  }
  
  pool = new pg.Pool({
    connectionString: connectionUrl,
    ssl: connectionUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : false
  });
  
  pool.on('error', function(err) {
    console.error('Unexpected database error:', err);
  });
  
  console.log('Database pool initialized');
  return pool;
}

// Get pool instance
function getPool() {
  return pool;
}

// Run a query
function query(sql, params) {
  return pool.query(sql, params);
}

// Close database connection
function close() {
  if (pool) {
    return pool.end();
  }
  return Promise.resolve();
}

// Create all tables
function createTables() {
  var promises = Object.keys(SCHEMA).map(function(table) {
    return query(SCHEMA[table]);
  });
  return Promise.all(promises);
}

// User operations
var Users = {
  create: function(name, email, password) {
    return query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
      [name, email, password]
    ).then(function(result) {
      return result.rows[0].id;
    });
  },
  
  findByEmail: function(email) {
    return query('SELECT * FROM users WHERE email = $1', [email])
      .then(function(result) {
        return result.rows[0];
      });
  },
  
  findById: function(id) {
    return query('SELECT * FROM users WHERE id = $1', [id])
      .then(function(result) {
        return result.rows[0];
      });
  }
};

// Project operations
var Projects = {
  create: function(data) {
    return query(
      'INSERT INTO projects (name, category, description, goal, return_rate_min, return_rate_max, end_date) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [data.name, data.category, data.description, data.goal, data.returnRateMin, data.returnRateMax, data.endDate]
    ).then(function(result) {
      return result.rows[0].id;
    });
  },
  
  findAll: function(filters) {
    var sql = 'SELECT * FROM projects WHERE 1=1';
    var params = [];
    var paramIndex = 1;
    
    if (filters && filters.category) {
      sql += ' AND category = $' + paramIndex++;
      params.push(filters.category);
    }
    if (filters && filters.status) {
      sql += ' AND status = $' + paramIndex++;
      params.push(filters.status);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    return query(sql, params).then(function(result) {
      return result.rows;
    });
  },
  
  findById: function(id) {
    return query('SELECT * FROM projects WHERE id = $1', [id])
      .then(function(result) {
        return result.rows[0];
      });
  },
  
  updateRaised: function(id, amount) {
    return query('UPDATE projects SET raised = raised + $1 WHERE id = $2', [amount, id]);
  }
};

// Investment operations
var Investments = {
  create: function(userId, projectId, amount) {
    return query(
      'INSERT INTO investments (user_id, project_id, amount) VALUES ($1, $2, $3) RETURNING id',
      [userId, projectId, amount]
    ).then(function(result) {
      // Update project raised amount
      return Projects.updateRaised(projectId, amount).then(function() {
        return result.rows[0].id;
      });
    });
  },
  
  findByUser: function(userId) {
    return query(
      'SELECT i.*, p.name as project_name, p.category as project_category ' +
      'FROM investments i ' +
      'JOIN projects p ON i.project_id = p.id ' +
      'WHERE i.user_id = $1',
      [userId]
    ).then(function(result) {
      return result.rows;
    });
  },
  
  findById: function(id) {
    return query('SELECT * FROM investments WHERE id = $1', [id])
      .then(function(result) {
        return result.rows[0];
      });
  }
};

module.exports = {
  init: init,
  getPool: getPool,
  query: query,
  close: close,
  createTables: createTables,
  SCHEMA: SCHEMA,
  Users: Users,
  Projects: Projects,
  Investments: Investments
};
