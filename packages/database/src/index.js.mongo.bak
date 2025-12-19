var MongoClient = require('mongodb').MongoClient;
var dotenv = require('dotenv');

dotenv.config();

var client = null;
var db = null;

async function connect() {
  if (db) return db;
  
  var uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new Error('DATABASE_URL environment variable not set');
  }
  
  client = new MongoClient(uri);
  await client.connect();
  db = client.db('demony');
  console.log('Connected to MongoDB');
  return db;
}

async function getDb() {
  if (!db) await connect();
  return db;
}

// Helper to mimic PostgreSQL query style for easier migration
async function query(collection, operation, params) {
  var database = await getDb();
  var coll = database.collection(collection);
  
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
}

module.exports = {
  connect: connect,
  getDb: getDb,
  query: query,
  getClient: function() { return client; }
};
