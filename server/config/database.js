const { Pool } = require('pg');
require('dotenv').config();

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set in environment variables!');
  console.error('Please check your .env file and ensure DATABASE_URL is configured.');
  process.exit(1);
}

// Parse DATABASE_URL to check if SSL is required
const getSSLConfig = () => {
  const dbUrl = process.env.DATABASE_URL || '';
  // Neon requires SSL, check if sslmode is in the URL
  if (dbUrl.includes('sslmode=require') || dbUrl.includes('sslmode=prefer')) {
    return { rejectUnauthorized: false };
  }
  // For production or if explicitly set
  if (process.env.NODE_ENV === 'production') {
    return { rejectUnauthorized: false };
  }
  return false;
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: getSSLConfig(),
  // Connection pool settings - increased timeouts for Neon
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000, // Increased to 30 seconds for Neon
  query_timeout: 30000,
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database schema
const initializeDatabase = async () => {
  let client;
  try {
    // Test connection first with timeout
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (hidden)' : 'NOT SET');
    
    const connectionPromise = pool.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout after 30 seconds')), 30000)
    );
    
    client = await Promise.race([connectionPromise, timeoutPromise]);
    
    console.log('Connection acquired, testing query...');
    await client.query('SELECT NOW()');
    console.log('Database connection successful');
    client.release();

    // Create table
    console.log('Creating database schema...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS links (
        id SERIAL PRIMARY KEY,
        code VARCHAR(8) UNIQUE NOT NULL,
        target_url TEXT NOT NULL,
        total_clicks INTEGER DEFAULT 0,
        last_clicked TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_links_code ON links(code)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at)
    `);

    // Fix any existing NULL total_clicks values
    await pool.query(`
      UPDATE links 
      SET total_clicks = 0 
      WHERE total_clicks IS NULL
    `);

    console.log('Database schema initialized successfully');
  } catch (error) {
    if (client) {
      client.release();
    }
    console.error('Error initializing database:', error.message);
    console.error('Full error:', error);
    throw error;
  }
};

module.exports = {
  pool,
  initializeDatabase
};

