const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb+srv://Juuwave:Creative2468@juuwave.8g4mhz7.mongodb.net/Juuwave?retryWrites=true&w=majority';

async function main() {
  console.log('Starting MongoDB connection test...');
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const admin = client.db().admin();
    const ping = await admin.ping();
    console.log('Ping result:', ping);
    console.log('Connection successful');
  } catch (err) {
    console.error('Connection failed:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
    console.log('Client closed');
  }
}

main();
