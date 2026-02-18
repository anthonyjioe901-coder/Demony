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
