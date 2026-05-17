'use strict';

require('dotenv').config();

const { Client } = require('pg');
const mongoose   = require('mongoose');

const DATABASE_URL =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'password'}` +
  `@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}` +
  `/${process.env.DB_NAME || 'reverse_marketplace'}`;

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URL ||
  'mongodb://localhost:27017/reverse_marketplace';

async function truncatePostgres() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log('\n🗑️  Truncating PostgreSQL tables...\n');

  try {
    await client.query(`
      TRUNCATE TABLE
        notification_analytics,
        notification_reads,
        notification_deliveries,
        notification_preferences,
        notification_channels,
        notifications,
        notification_templates,
        chat_participants,
        chat_rooms,
        bid_templates,
        bids,
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
    console.log('  ✅ All PostgreSQL tables cleared\n');
  } catch (err) {
    console.error('\n❌ PostgreSQL truncate failed:', err.message);
    throw err;
  } finally {
    await client.end();
  }
}

async function truncateMongo() {
  console.log('🗑️  Clearing MongoDB collections...\n');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });

  try {
    const db = mongoose.connection.db;
    const collections = ['chat_messages', 'activity_logs', 'request_analytics', 'request_views'];

    for (const name of collections) {
      const col = db.collection(name);
      const { deletedCount } = await col.deleteMany({});
      console.log(`  ✅ ${name}: ${deletedCount} documents removed`);
    }
    console.log();
  } catch (err) {
    console.error('\n❌ MongoDB truncate failed:', err.message);
    throw err;
  } finally {
    await mongoose.disconnect();
  }
}

async function truncate() {
  await truncatePostgres();
  await truncateMongo();
  console.log('✅ All data cleared\n');
}

truncate().catch(() => process.exit(1));
