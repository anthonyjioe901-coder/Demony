// Demony Database Module - MongoDB
var MongoClient = require('mongodb').MongoClient;
var dotenv = require('dotenv');

dotenv.config();

var client = null;
var db = null;
var connectPromise = null;

// MongoDB connection options for production reliability
var connectionOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
};

async function connect() {
  if (connectPromise) {
    return connectPromise;
  }

  if (client && db) {
    try {
      await db.command({ ping: 1 });
      return db;
    } catch (err) {
      console.log('MongoDB connection lost, reconnecting...');
      client = null;
      db = null;
    }
  }
  
  var uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new Error('DATABASE_URL environment variable not set');
  }
  
  connectPromise = (async function() {
    try {
      client = new MongoClient(uri, connectionOptions);
      await client.connect();
      db = client.db('demony');
      
      client.on('close', function() {
        console.log('MongoDB connection closed');
        db = null;
      });
      
      client.on('error', function(err) {
        console.error('MongoDB connection error:', err.message);
        db = null;
      });
      
      console.log('Connected to MongoDB');
      return db;
    } catch (err) {
      console.error('Failed to connect to MongoDB:', err.message);
      client = null;
      db = null;
      throw err;
    } finally {
      connectPromise = null;
    }
  })();
  
  return connectPromise;
}

async function getDb() {
  return await connect();
}

async function query(collection, operation, params) {
  var database = await getDb();
  var coll = database.collection(collection);
  
  try {
    if (operation === 'find') {
      return { rows: await coll.find(params.filter || {}).toArray() };
    }
    if (operation === 'findOne') {
      var doc = await coll.findOne(params.filter);
      return { rows: doc ? [doc] : [] };
    }
    if (operation === 'insertOne') {
      var result = await coll.insertOne(params.doc);
      return { rows: [{ ...params.doc, id: result.insertedId }], insertedId: result.insertedId };
    }
    if (operation === 'updateOne') {
      await coll.updateOne(params.filter, params.update);
      return { modifiedCount: 1 };
    }
    if (operation === 'aggregate') {
      return { rows: await coll.aggregate(params.pipeline).toArray() };
    }
    return { rows: [] };
  } catch (err) {
    if (err.name === 'MongoTopologyClosedError' || err.message.includes('Topology is closed')) {
      console.log('Topology closed, resetting connection...');
      client = null;
      db = null;
      database = await getDb();
      coll = database.collection(collection);
      if (operation === 'find') return { rows: await coll.find(params.filter || {}).toArray() };
      if (operation === 'findOne') { var doc2 = await coll.findOne(params.filter); return { rows: doc2 ? [doc2] : [] }; }
      if (operation === 'insertOne') { var r2 = await coll.insertOne(params.doc); return { rows: [{ ...params.doc, id: r2.insertedId }], insertedId: r2.insertedId }; }
      if (operation === 'updateOne') { await coll.updateOne(params.filter, params.update); return { modifiedCount: 1 }; }
      if (operation === 'aggregate') return { rows: await coll.aggregate(params.pipeline).toArray() };
    }
    throw err;
  }
}

async function close() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed gracefully');
  }
}

module.exports = {
  connect: connect,
  getDb: getDb,
  query: query,
  close: close,
  getClient: function() { return client; }
};

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
