const { Pool } = require('pg');

// Create a Postgres Connection 
const POOL = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'spycysite',
    password: 'admin',
});


module.exports = {
    pool: POOL
  };