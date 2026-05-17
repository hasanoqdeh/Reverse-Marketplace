'use strict';

require('dotenv').config();

const { Client } = require('pg');

const DATABASE_URL =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'password'}` +
  `@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}` +
  `/${process.env.DB_NAME || 'reverse_marketplace'}`;

async function truncate() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log('\n🗑️  Truncating all tables...\n');

  try {
    await client.query(`
      TRUNCATE TABLE
        request_search_index,
        request_images,
        request_extensions,
        request_drafts,
        saved_searches,
        auth_tokens,
        requests,
        user_profiles,
        request_categories,
        users
      RESTART IDENTITY CASCADE
    `);
    console.log('  ✅ All tables cleared\n');
  } catch (err) {
    console.error('\n❌ Truncate failed:', err.message);
    throw err;
  } finally {
    await client.end();
  }
}

truncate().catch(() => process.exit(1));
