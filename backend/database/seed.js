'use strict';

require('dotenv').config();

const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

const DATABASE_URL =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'password'}` +
  `@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}` +
  `/${process.env.DB_NAME || 'reverse_marketplace'}`;

// ─── Static IDs (re-seeding is idempotent) ────────────────────────────────────

const IDS = {
  // Users
  superAdmin: '00000000-0000-0000-0000-000000000001',
  admin1:     '00000000-0000-0000-0000-000000000002',
  admin2:     '00000000-0000-0000-0000-000000000003',
  buyer1:     '00000000-0000-0000-0000-000000000004',
  buyer2:     '00000000-0000-0000-0000-000000000005',
  merchant1:  '00000000-0000-0000-0000-000000000006',
  merchant2:  '00000000-0000-0000-0000-000000000007',

  // Categories
  catElectronics:  '10000000-0000-0000-0000-000000000001',
  catHomeServices: '10000000-0000-0000-0000-000000000002',
  catFood:         '10000000-0000-0000-0000-000000000003',
  catTransport:    '10000000-0000-0000-0000-000000000004',
  catHealth:       '10000000-0000-0000-0000-000000000005',
  catEducation:    '10000000-0000-0000-0000-000000000006',
  catRepairs:      '10000000-0000-0000-0000-000000000007',
  catBeauty:       '10000000-0000-0000-0000-000000000008',

  // Requests
  req1: '20000000-0000-0000-0000-000000000001',
  req2: '20000000-0000-0000-0000-000000000002',
  req3: '20000000-0000-0000-0000-000000000003',
  req4: '20000000-0000-0000-0000-000000000004',
  req5: '20000000-0000-0000-0000-000000000005',
  req6: '20000000-0000-0000-0000-000000000006',

  // Drafts
  draft1: '30000000-0000-0000-0000-000000000001',
  draft2: '30000000-0000-0000-0000-000000000002',
};

async function seed() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log('\n🌱 Seeding database...\n');

  try {
    // ── Users ──────────────────────────────────────────────────────────────────

    const users = [
      { id: IDS.superAdmin, phone: '+962780000001', role: 'ADMIN',    status: 'ACTIVE', phone_verified: true,  admin_sub_role: 'SUPER_ADMIN' },
      { id: IDS.admin1,     phone: '+962780000002', role: 'ADMIN',    status: 'ACTIVE', phone_verified: true,  admin_sub_role: 'ADMIN' },
      { id: IDS.admin2,     phone: '+962780000003', role: 'ADMIN',    status: 'ACTIVE', phone_verified: true,  admin_sub_role: 'SUPPORT' },
      { id: IDS.buyer1,     phone: '+962780000004', role: 'BUYER',    status: 'ACTIVE', phone_verified: true,  admin_sub_role: null },
      { id: IDS.buyer2,     phone: '+962780000005', role: 'BUYER',    status: 'ACTIVE', phone_verified: true,  admin_sub_role: null },
      { id: IDS.merchant1,  phone: '+962780000006', role: 'MERCHANT', status: 'ACTIVE', phone_verified: true,  admin_sub_role: null },
      { id: IDS.merchant2,  phone: '+962780000007', role: 'MERCHANT', status: 'ACTIVE', phone_verified: false, admin_sub_role: null },
    ];

    for (const u of users) {
      await client.query(`
        INSERT INTO users (id, phone, role, status, phone_verified, admin_sub_role, last_login_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (id) DO UPDATE SET
          phone = EXCLUDED.phone, role = EXCLUDED.role, status = EXCLUDED.status,
          phone_verified = EXCLUDED.phone_verified, admin_sub_role = EXCLUDED.admin_sub_role
      `, [u.id, u.phone, u.role, u.status, u.phone_verified, u.admin_sub_role]);
    }
    console.log(`  ✅ Users (${users.length})`);

    // ── User Profiles ──────────────────────────────────────────────────────────

    const profiles = [
      { userId: IDS.superAdmin, first: 'Super',  last: 'Admin',    city: 'Amman', country: 'JO' },
      { userId: IDS.admin1,     first: 'Ahmad',  last: 'Al-Farsi', city: 'Jarash',  country: 'JO' },
      { userId: IDS.admin2,     first: 'Sara',   last: 'Support',  city: 'Amman',  country: 'JO' },
      { userId: IDS.buyer1,     first: 'Khalid', last: 'Hassan',   city: 'Jarash', country: 'JO' },
      { userId: IDS.buyer2,     first: 'Layla',  last: 'Omar',     city: 'Amman',  country: 'JO' },
      { userId: IDS.merchant1,  first: 'Tariq',  last: 'Merchant', city: 'Irbid',  country: 'JO' },
      { userId: IDS.merchant2,  first: 'Nour',   last: 'Seller',   city: 'Amman', country: 'JO' },
    ];

    for (const p of profiles) {
      await client.query(`
        INSERT INTO user_profiles (id, user_id, first_name, last_name, city, country)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id) DO UPDATE SET
          first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name,
          city = EXCLUDED.city, country = EXCLUDED.country
      `, [uuidv4(), p.userId, p.first, p.last, p.city, p.country]);
    }
    console.log(`  ✅ User profiles (${profiles.length})`);

    // ── Categories ─────────────────────────────────────────────────────────────

    const categories = [
      { id: IDS.catElectronics,  name: 'Electronics',      slug: 'electronics',     desc: 'Phones, laptops, gadgets and accessories' },
      { id: IDS.catHomeServices, name: 'Home Services',    slug: 'home-services',   desc: 'Cleaning, maintenance, repairs, and installations' },
      { id: IDS.catFood,         name: 'Food & Beverages', slug: 'food-beverages',  desc: 'Catering, groceries, and food delivery' },
      { id: IDS.catTransport,    name: 'Transportation',   slug: 'transportation',  desc: 'Moving, delivery, and ride services' },
      { id: IDS.catHealth,       name: 'Health & Wellness',slug: 'health-wellness', desc: 'Medical, fitness, and wellness services' },
      { id: IDS.catEducation,    name: 'Education',        slug: 'education',       desc: 'Tutoring, courses, and training' },
      { id: IDS.catRepairs,      name: 'Repairs & Fix',    slug: 'repairs-fix',     desc: 'Car repairs, appliance fix, and technical support' },
      { id: IDS.catBeauty,       name: 'Beauty & Fashion', slug: 'beauty-fashion',  desc: 'Hair, makeup, styling, and clothing' },
    ];

    for (const c of categories) {
      await client.query(`
        INSERT INTO request_categories (id, name, slug, description, is_active, sort_order)
        VALUES ($1, $2, $3, $4, true, $5)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name, slug = EXCLUDED.slug,
          description = EXCLUDED.description, is_active = true
      `, [c.id, c.name, c.slug, c.desc, categories.indexOf(c)]);
    }
    console.log(`  ✅ Categories (${categories.length})`);

    // ── Requests ───────────────────────────────────────────────────────────────

    const now = new Date();
    const past3Days  = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const past7Days  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const in3Days    = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const in7Days    = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in14Days   = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const requests = [
      {
        id: IDS.req1, buyerId: IDS.buyer1, categoryId: IDS.catElectronics,
        title: 'Looking for iPhone 15 Pro Max 256GB',
        description: 'I need a brand new or like-new iPhone 15 Pro Max in black. Must come with original box and all accessories. Willing to pay fair market price.',
        budgetMin: 800, budgetMax: 1200, city: 'Jarash', country: 'JO',
        status: 'ACTIVE', bidCount: 3, viewCount: 47, priorityScore: 20,
        publishedAt: past3Days, expiresAt: in3Days,
      },
      {
        id: IDS.req2, buyerId: IDS.buyer1, categoryId: IDS.catHomeServices,
        title: 'Need a professional house cleaning service',
        description: '4-bedroom villa needs deep cleaning. 2 bathrooms, large kitchen. Looking for a team that can finish within one day. Prefer eco-friendly products.',
        budgetMin: 100, budgetMax: 300, city: 'Jarash', country: 'JO',
        status: 'ACTIVE', bidCount: 5, viewCount: 62, priorityScore: 15,
        publishedAt: past3Days, expiresAt: in7Days,
      },
      {
        id: IDS.req3, buyerId: IDS.buyer2, categoryId: IDS.catTransport,
        title: 'Moving furniture from Cairo to Alexandria',
        description: 'I have a 2-bedroom apartment worth of furniture to move. Need a truck and 2 helpers. Flexible on date within the next 2 weeks.',
        budgetMin: 200, budgetMax: 500, city: 'Jarash', country: 'JO',
        status: 'ACTIVE', bidCount: 2, viewCount: 28, priorityScore: 10,
        publishedAt: past3Days, expiresAt: in7Days,
      },
      {
        id: IDS.req4, buyerId: IDS.buyer2, categoryId: IDS.catEducation,
        title: 'Looking for a math tutor for high school student',
        description: 'My daughter is in grade 11 and needs help with calculus and algebra. Prefer online sessions 3 times per week. English or Arabic is fine.',
        budgetMin: 20, budgetMax: 50, city: 'Jarash', country: 'JO',
        status: 'HAS_BIDS', bidCount: 7, viewCount: 95, priorityScore: 25,
        publishedAt: past7Days, expiresAt: in14Days,
      },
      {
        id: IDS.req5, buyerId: IDS.buyer1, categoryId: IDS.catRepairs,
        title: 'MacBook Pro screen replacement needed',
        description: 'My MacBook Pro 14" (2023) has a cracked screen. Need a certified technician for replacement. Only original Apple parts.',
        budgetMin: 300, budgetMax: 600, city: 'Riyadh', country: 'JO',
        status: 'COMPLETED', bidCount: 4, viewCount: 38, priorityScore: 0,
        publishedAt: past7Days, expiresAt: past3Days,
      },
      {
        id: IDS.req6, buyerId: IDS.buyer2, categoryId: IDS.catFood,
        title: 'Catering for 50-person corporate event',
        description: 'Need full catering service for a corporate lunch event. Arabic and international cuisine. Includes setup and cleanup.',
        budgetMin: 1500, budgetMax: 3000, city: 'Jarash', country: 'JO',
        status: 'CANCELLED', bidCount: 1, viewCount: 15, priorityScore: 0,
        publishedAt: past7Days, expiresAt: past3Days,
      },
    ];

    for (const r of requests) {
      await client.query(`
        INSERT INTO requests
          (id, buyer_id, category_id, title, description, budget_min, budget_max,
           location_city, location_country, status, priority_score, bid_count, view_count,
           published_at, expires_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title, description = EXCLUDED.description,
          status = EXCLUDED.status, bid_count = EXCLUDED.bid_count,
          view_count = EXCLUDED.view_count
      `, [r.id, r.buyerId, r.categoryId, r.title, r.description,
          r.budgetMin, r.budgetMax, r.city, r.country, r.status,
          r.priorityScore, r.bidCount, r.viewCount, r.publishedAt, r.expiresAt]);
    }
    console.log(`  ✅ Requests (${requests.length})`);

    // ── Request Images ─────────────────────────────────────────────────────────

    const images = [
      // req1 — iPhone
      { id: uuidv4(), requestId: IDS.req1, url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', thumb: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200', filename: 'iphone-15-pro.jpg', mime: 'image/jpeg', size: 245000, isPrimary: true,  sort: 0 },
      { id: uuidv4(), requestId: IDS.req1, url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800', thumb: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200', filename: 'iphone-box.jpg',    mime: 'image/jpeg', size: 198000, isPrimary: false, sort: 1 },
      // req2 — House cleaning
      { id: uuidv4(), requestId: IDS.req2, url: 'https://images.unsplash.com/photo-1527515637462-cff94edd56f3?w=800', thumb: 'https://images.unsplash.com/photo-1527515637462-cff94edd56f3?w=200', filename: 'villa-living.jpg', mime: 'image/jpeg', size: 312000, isPrimary: true,  sort: 0 },
      // req5 — MacBook repair
      { id: uuidv4(), requestId: IDS.req5, url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', thumb: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200', filename: 'macbook-cracked.jpg', mime: 'image/jpeg', size: 278000, isPrimary: true,  sort: 0 },
    ];

    for (const img of images) {
      await client.query(`
        INSERT INTO request_images
          (id, request_id, image_url, thumbnail_url, original_filename, file_size, mime_type, is_primary, sort_order)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (id) DO NOTHING
      `, [img.id, img.requestId, img.url, img.thumb, img.filename, img.size, img.mime, img.isPrimary, img.sort]);
    }
    console.log(`  ✅ Request images (${images.length})`);

    // ── Request Drafts ─────────────────────────────────────────────────────────

    const drafts = [
      {
        id: IDS.draft1, buyerId: IDS.buyer1, categoryId: IDS.catHealth,
        title: 'Looking for physiotherapy sessions',
        description: 'Need physiotherapy for lower back pain. Prefer home visits.',
        budgetMin: 30, budgetMax: 80,
        autoSaveData: JSON.stringify({ step: 2, completedSteps: [1, 2] }),
        expiresAt: in7Days,
      },
      {
        id: IDS.draft2, buyerId: IDS.buyer2, categoryId: IDS.catBeauty,
        title: 'Bridal makeup artist for wedding',
        description: null,
        budgetMin: null, budgetMax: null,
        autoSaveData: JSON.stringify({ step: 1, completedSteps: [1] }),
        expiresAt: in14Days,
      },
    ];

    for (const d of drafts) {
      await client.query(`
        INSERT INTO request_drafts
          (id, buyer_id, category_id, title, description, budget_min, budget_max, auto_save_data, expires_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title, description = EXCLUDED.description,
          budget_min = EXCLUDED.budget_min, budget_max = EXCLUDED.budget_max,
          auto_save_data = EXCLUDED.auto_save_data
      `, [d.id, d.buyerId, d.categoryId, d.title, d.description,
          d.budgetMin, d.budgetMax, d.autoSaveData, d.expiresAt]);
    }
    console.log(`  ✅ Request drafts (${drafts.length})`);

    // ── Request Extensions ─────────────────────────────────────────────────────

    const extensions = [
      {
        id: uuidv4(), requestId: IDS.req4,
        originalExpiresAt: in7Days,
        newExpiresAt: in14Days,
        reason: 'Still evaluating bids, need more time to choose the right tutor',
        extendedBy: IDS.buyer2,
      },
    ];

    for (const e of extensions) {
      await client.query(`
        INSERT INTO request_extensions
          (id, request_id, original_expires_at, new_expires_at, extension_reason, extended_by)
        VALUES ($1,$2,$3,$4,$5,$6)
        ON CONFLICT (id) DO NOTHING
      `, [e.id, e.requestId, e.originalExpiresAt, e.newExpiresAt, e.reason, e.extendedBy]);
    }
    console.log(`  ✅ Request extensions (${extensions.length})`);

    // ── Saved Searches ─────────────────────────────────────────────────────────

    const savedSearches = [
      {
        id: uuidv4(), userId: IDS.merchant1, name: 'Electronics in Riyadh',
        criteria: JSON.stringify({ category: IDS.catElectronics, country: 'SA', city: 'Riyadh', budgetMin: 500 }),
      },
      {
        id: uuidv4(), userId: IDS.merchant1, name: 'Home Services UAE',
        criteria: JSON.stringify({ category: IDS.catHomeServices, country: 'AE', budgetMin: 100 }),
      },
      {
        id: uuidv4(), userId: IDS.merchant2, name: 'Education requests',
        criteria: JSON.stringify({ category: IDS.catEducation, budgetMin: 15, budgetMax: 100 }),
      },
      {
        id: uuidv4(), userId: IDS.buyer1, name: 'Repair services Riyadh',
        criteria: JSON.stringify({ category: IDS.catRepairs, country: 'SA', city: 'Riyadh' }),
      },
    ];

    for (const s of savedSearches) {
      await client.query(`
        INSERT INTO saved_searches (id, user_id, name, search_criteria, is_active)
        VALUES ($1,$2,$3,$4,true)
        ON CONFLICT (id) DO NOTHING
      `, [s.id, s.userId, s.name, s.criteria]);
    }
    console.log(`  ✅ Saved searches (${savedSearches.length})`);

    // ── Request Search Index ───────────────────────────────────────────────────

    const searchEntries = [
      {
        requestId: IDS.req1,
        searchVector: 'iphone 15 pro max 256gb black electronics apple smartphone',
        categoryPath: 'electronics',
        locationText: 'Riyadh Saudi Arabia SA',
        budgetRange: '800-1200',
      },
      {
        requestId: IDS.req2,
        searchVector: 'house cleaning villa deep clean bathroom kitchen professional',
        categoryPath: 'home-services',
        locationText: 'Riyadh Saudi Arabia SA',
        budgetRange: '100-300',
      },
      {
        requestId: IDS.req3,
        searchVector: 'moving furniture truck helpers apartment cairo alexandria transport',
        categoryPath: 'transportation',
        locationText: 'Cairo Egypt EG',
        budgetRange: '200-500',
      },
      {
        requestId: IDS.req4,
        searchVector: 'math tutor grade 11 calculus algebra online sessions high school',
        categoryPath: 'education',
        locationText: 'Cairo Egypt EG',
        budgetRange: '20-50',
      },
      {
        requestId: IDS.req5,
        searchVector: 'macbook pro screen replacement cracked repair certified technician',
        categoryPath: 'repairs-fix',
        locationText: 'Riyadh Saudi Arabia SA',
        budgetRange: '300-600',
      },
      {
        requestId: IDS.req6,
        searchVector: 'catering corporate event arabic international cuisine lunch 50 people',
        categoryPath: 'food-beverages',
        locationText: 'Cairo Egypt EG',
        budgetRange: '1500-3000',
      },
    ];

    for (const s of searchEntries) {
      await client.query(`
        INSERT INTO request_search_index
          (id, request_id, search_vector, category_path, location_text, budget_range)
        VALUES ($1,$2,$3,$4,$5,$6)
        ON CONFLICT (request_id) DO UPDATE SET
          search_vector = EXCLUDED.search_vector,
          category_path = EXCLUDED.category_path,
          location_text = EXCLUDED.location_text,
          budget_range  = EXCLUDED.budget_range
      `, [uuidv4(), s.requestId, s.searchVector, s.categoryPath, s.locationText, s.budgetRange]);
    }
    console.log(`  ✅ Request search index (${searchEntries.length})`);

    // ── Summary ────────────────────────────────────────────────────────────────

    console.log('\n🎉 Seed complete!\n');
    console.log('  Test accounts (OTP printed to console):');
    console.log('  ┌─────────────────────┬────────────┬──────────────┐');
    console.log('  │ Phone               │ Role       │ Sub-role     │');
    console.log('  ├─────────────────────┼────────────┼──────────────┤');
    console.log('  │ +962780000001       │ ADMIN      │ SUPER_ADMIN  │');
    console.log('  │ +962780000002       │ ADMIN      │ ADMIN        │');
    console.log('  │ +962780000003       │ ADMIN      │ SUPPORT      │');
    console.log('  │ +962780000004       │ BUYER      │ —            │');
    console.log('  │ +962780000005       │ BUYER      │ —            │');
    console.log('  │ +962780000006       │ MERCHANT   │ —            │');
    console.log('  │ +962780000007       │ MERCHANT   │ —            │');
    console.log('  └─────────────────────┴────────────┴──────────────┘');
    console.log('\n  Requests seeded:');
    console.log('  req1 — iPhone 15 Pro Max (ACTIVE, 3 bids)');
    console.log('  req2 — House Cleaning (ACTIVE, 5 bids)');
    console.log('  req3 — Moving Furniture (ACTIVE, 2 bids)');
    console.log('  req4 — Math Tutor (HAS_BIDS, 7 bids)');
    console.log('  req5 — MacBook Repair (COMPLETED)');
    console.log('  req6 — Corporate Catering (CANCELLED)');
    console.log();

  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    throw err;
  } finally {
    await client.end();
  }
}

seed().catch(() => process.exit(1));
