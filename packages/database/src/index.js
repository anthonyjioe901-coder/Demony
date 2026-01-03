var MongoClient = require('mongodb').MongoClient;
var dotenv = require('dotenv');

dotenv.config();

var client = null;
var db = null;
var isConnecting = false;

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
  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    // Wait for existing connection attempt
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (db) return db;
  }

  // If we have a client, check if it's still connected
  if (client && db) {
    try {
      // Quick ping to check connection health
      await db.command({ ping: 1 });
      return db;
    } catch (err) {
      console.log('MongoDB connection lost, reconnecting...');
      // Connection is dead, reset and reconnect
      client = null;
      db = null;
    }
  }
  
  var uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new Error('DATABASE_URL environment variable not set');
  }
  
  isConnecting = true;
  
  try {
    client = new MongoClient(uri, connectionOptions);
    await client.connect();
    db = client.db('demony');
    
    // Monitor connection events
    client.on('close', function() {
      console.log('MongoDB connection closed');
      db = null;
    });
    
    client.on('error', function(err) {
      console.error('MongoDB connection error:', err.message);
      db = null;
    });
    
    client.on('reconnect', function() {
      console.log('MongoDB reconnected');
    });
    
    console.log('Connected to MongoDB');
    return db;
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    client = null;
    db = null;
    throw err;
  } finally {
    isConnecting = false;
  }
}

async function getDb() {
  return await connect();
}

// Helper to mimic PostgreSQL query style for easier migration
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
    // If topology closed error, reset connection and retry once
    if (err.name === 'MongoTopologyClosedError' || err.message.includes('Topology is closed')) {
      console.log('Topology closed, resetting connection...');
      client = null;
      db = null;
      // Retry the operation once
      database = await getDb();
      coll = database.collection(collection);
      
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
    }
    throw err;
  }
}

// Graceful shutdown
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
