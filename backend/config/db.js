// This file creates ONE shared connection pool to our Supabase Postgres database.
// Every route file will import "db" from here and use db.query(...) to talk to the database.

const { Pool } = require('pg');
require('dotenv').config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase requires SSL connections
});

// Quick check when the server starts, so we know right away if the DB connection works
db.connect()
  .then((client) => {
    console.log('✅ Connected to Supabase PostgreSQL database');
    client.release();
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = db;
