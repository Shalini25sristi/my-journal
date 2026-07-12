const fs = require('fs');
const path = require('path');
const db = require('../db');

async function ensureMigrationsTable() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            filename VARCHAR(255) UNIQUE NOT NULL,
            run_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);
}

async function getRunMigrations() {
    const result = await db.query('SELECT filename FROM migrations');
    return new Set(result.rows.map(r => r.filename));
}

async function runMigrations() {
    await ensureMigrationsTable();
    const runMigrations = await getRunMigrations();

    const migrationsDir = __dirname;
    const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

    for (const file of files) {
        if (runMigrations.has(file)) {
            console.log(`Skipping already-run migration: ${file}`);
            continue;
        }

        const filepath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filepath, 'utf-8');
        console.log(`Running migration: ${file}`);

        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(sql);
            await client.query('INSERT INTO migrations (filename) VALUES ($1)', [file]);
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    console.log('All migrations completed successfully.');
    process.exit(0);
}

runMigrations().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
