'use strict';

/**
 * Database migration runner.
 * Reads all SQL files from /migrations in order and executes them.
 * Tracks applied migrations in a `schema_migrations` table.
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool(
  config.database.url
    ? { connectionString: config.database.url }
    : {
        host: config.database.host,
        port: config.database.port,
        database: config.database.name,
        user: config.database.user,
        password: config.database.password,
      }
);

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         SERIAL PRIMARY KEY,
      filename   VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations(client) {
  const result = await client.query('SELECT filename FROM schema_migrations ORDER BY id');
  return new Set(result.rows.map((r) => r.filename));
}

async function runMigrations() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await ensureMigrationsTable(client);
    const applied = await getAppliedMigrations(client);

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    let migrationsRun = 0;

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`  [SKIP] ${file} — already applied`);
        continue;
      }

      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`  [RUN]  ${file}`);
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      migrationsRun++;
    }

    await client.query('COMMIT');
    console.log(`\n✅ Migrations complete. ${migrationsRun} migration(s) applied.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
