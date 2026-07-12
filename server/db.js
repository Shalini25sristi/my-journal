const { Pool, types } = require('pg');
const config = require('./config');

// Return DATE columns as strings (YYYY-MM-DD) to avoid timezone shifts
types.setTypeParser(1082, val => val);

if (!config.databaseUrl) {
    console.error('ERROR: DATABASE_URL is not set. Please check your .env file.');
    process.exit(1);
}

const pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL error:', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
