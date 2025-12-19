var pg = require('pg');
var dotenv = require('dotenv');

dotenv.config();

var pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = {
  query: function(text, params) {
    return pool.query(text, params);
  },
  pool: pool
};
