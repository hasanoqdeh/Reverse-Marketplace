'use strict';

const path = require('path');
const fs = require('fs');
const { Client } = require('pg');

// Load env — service .env files are fallbacks if shell vars not already set
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '../services/identity-service/.env') });

const DATABASE_URL =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'password'}` +
  `@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}` +
  `/${process.env.DB_NAME || 'reverse_marketplace'}`;

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function migrate() {
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();
    const safeUrl = DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
    console.log(`\n🗄️  Connected to: ${safeUrl}\n`);

    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Fetch already-run migrations
    const { rows } = await client.query('SELECT name FROM migrations ORDER BY id ASC');
    const completed = new Set(rows.map(r => r.name));

    if (completed.size > 0) {
      console.log('Already applied:');
      rows.forEach(r => console.log(`  ✅ ${r.name}`));
      console.log();
    }

    // Read and sort migration files
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('No migration files found in', MIGRATIONS_DIR);
      return;
    }

    let ran = 0;
    let skipped = 0;

    for (const file of files) {
      if (completed.has(file)) {
        console.log(`  ⏭  Skipping (already applied): ${file}`);
        skipped++;
        continue;
      }

      console.log(`  ⚡ Applying: ${file} ...`);
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`  ✅ Done:     ${file}`);
        ran++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  ❌ Failed:   ${file}`);
        console.error(`     ${err.message}`);
        throw err;
      }
    }

    console.log(`\n📋 Summary: ${ran} applied, ${skipped} skipped.\n`);
  } finally {
    await client.end();
  }
}

migrate().catch(err => {
  console.error('\n❌ Migration failed:', err.message);
  process.exit(1);
});
