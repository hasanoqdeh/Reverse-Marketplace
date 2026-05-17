'use strict';

require('dotenv').config();

const { Client }  = require('pg');
const { v4: uuidv4 } = require('uuid');
const mongoose    = require('mongoose');

// ─── MongoDB models ───────────────────────────────────────────────────────────
const ActivityLog     = require('../src/models/ActivityLog');
const RequestAnalytic = require('../src/models/RequestAnalytic');
const RequestView     = require('../src/models/RequestView');
const ChatMessage     = require('../src/models/ChatMessage');

// ─── Connection strings ───────────────────────────────────────────────────────
const DATABASE_URL =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'password'}` +
  `@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}` +
  `/${process.env.DB_NAME || 'reverse_marketplace'}`;

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/reverse_marketplace';

// ─── Static IDs ───────────────────────────────────────────────────────────────
// Fixed UUIDs so re-seeding is idempotent (ON CONFLICT DO UPDATE / upsert)

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

  // Bids
  bid1:  '40000000-0000-0000-0000-000000000001',
  bid2:  '40000000-0000-0000-0000-000000000002',
  bid3:  '40000000-0000-0000-0000-000000000003',
  bid4:  '40000000-0000-0000-0000-000000000004',
  bid5:  '40000000-0000-0000-0000-000000000005',
  bid6:  '40000000-0000-0000-0000-000000000006',
  bid7:  '40000000-0000-0000-0000-000000000007',
  bid8:  '40000000-0000-0000-0000-000000000008',
  bid9:  '40000000-0000-0000-0000-000000000009',
  bid10: '40000000-0000-0000-0000-000000000010',

  // Chat rooms
  room1: '50000000-0000-0000-0000-000000000001',
  room2: '50000000-0000-0000-0000-000000000002',
  room3: '50000000-0000-0000-0000-000000000003',
  room4: '50000000-0000-0000-0000-000000000004',
};

// ─────────────────────────────────────────────────────────────────────────────
// PostgreSQL seed
// ─────────────────────────────────────────────────────────────────────────────

async function seedPostgres(client) {
  const now       = new Date();
  const past1Day  = new Date(now - 1 * 86400000);
  const past3Days = new Date(now - 3 * 86400000);
  const past7Days = new Date(now - 7 * 86400000);
  const in3Days   = new Date(now.getTime() + 3 * 86400000);
  const in7Days   = new Date(now.getTime() + 7 * 86400000);
  const in14Days  = new Date(now.getTime() + 14 * 86400000);

  // ── Users ──────────────────────────────────────────────────────────────────

  const users = [
    { id: IDS.superAdmin, phone: '+962780000001', role: 'ADMIN',    status: 'ACTIVE', verified: true,  subRole: 'SUPER_ADMIN' },
    { id: IDS.admin1,     phone: '+962780000002', role: 'ADMIN',    status: 'ACTIVE', verified: true,  subRole: 'ADMIN' },
    { id: IDS.admin2,     phone: '+962780000003', role: 'ADMIN',    status: 'ACTIVE', verified: true,  subRole: 'SUPPORT' },
    { id: IDS.buyer1,     phone: '+962780000004', role: 'BUYER',    status: 'ACTIVE', verified: true,  subRole: null },
    { id: IDS.buyer2,     phone: '+962780000005', role: 'BUYER',    status: 'ACTIVE', verified: true,  subRole: null },
    { id: IDS.merchant1,  phone: '+962780000006', role: 'MERCHANT', status: 'ACTIVE', verified: true,  subRole: null },
    { id: IDS.merchant2,  phone: '+962780000007', role: 'MERCHANT', status: 'ACTIVE', verified: false, subRole: null },
  ];

  for (const u of users) {
    await client.query(`
      INSERT INTO users (id, phone, role, status, phone_verified, admin_sub_role, last_login_at)
      VALUES ($1,$2,$3,$4,$5,$6,NOW())
      ON CONFLICT (id) DO UPDATE SET
        phone = EXCLUDED.phone, role = EXCLUDED.role, status = EXCLUDED.status,
        phone_verified = EXCLUDED.phone_verified, admin_sub_role = EXCLUDED.admin_sub_role
    `, [u.id, u.phone, u.role, u.status, u.verified, u.subRole]);
  }
  console.log(`  ✅ Users (${users.length})`);

  // ── User Profiles ──────────────────────────────────────────────────────────

  const profiles = [
    { userId: IDS.superAdmin, first: 'Super',  last: 'Admin',    city: 'Amman',  country: 'JO' },
    { userId: IDS.admin1,     first: 'Ahmad',  last: 'Al-Farsi', city: 'Jarash', country: 'JO' },
    { userId: IDS.admin2,     first: 'Sara',   last: 'Support',  city: 'Amman',  country: 'JO' },
    { userId: IDS.buyer1,     first: 'Khalid', last: 'Hassan',   city: 'Jarash', country: 'JO' },
    { userId: IDS.buyer2,     first: 'Layla',  last: 'Omar',     city: 'Amman',  country: 'JO' },
    { userId: IDS.merchant1,  first: 'Tariq',  last: 'Merchant', city: 'Irbid',  country: 'JO' },
    { userId: IDS.merchant2,  first: 'Nour',   last: 'Seller',   city: 'Amman',  country: 'JO' },
  ];

  for (const p of profiles) {
    await client.query(`
      INSERT INTO user_profiles (id, user_id, first_name, last_name, city, country)
      VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (user_id) DO UPDATE SET
        first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name,
        city = EXCLUDED.city, country = EXCLUDED.country
    `, [uuidv4(), p.userId, p.first, p.last, p.city, p.country]);
  }
  console.log(`  ✅ User profiles (${profiles.length})`);

  // ── Categories ─────────────────────────────────────────────────────────────

  const categories = [
    { id: IDS.catElectronics,  name: 'Electronics',       slug: 'electronics',     desc: 'Phones, laptops, gadgets and accessories' },
    { id: IDS.catHomeServices, name: 'Home Services',     slug: 'home-services',   desc: 'Cleaning, maintenance, repairs, and installations' },
    { id: IDS.catFood,         name: 'Food & Beverages',  slug: 'food-beverages',  desc: 'Catering, groceries, and food delivery' },
    { id: IDS.catTransport,    name: 'Transportation',    slug: 'transportation',  desc: 'Moving, delivery, and ride services' },
    { id: IDS.catHealth,       name: 'Health & Wellness', slug: 'health-wellness', desc: 'Medical, fitness, and wellness services' },
    { id: IDS.catEducation,    name: 'Education',         slug: 'education',       desc: 'Tutoring, courses, and training' },
    { id: IDS.catRepairs,      name: 'Repairs & Fix',     slug: 'repairs-fix',     desc: 'Car repairs, appliance fix, and technical support' },
    { id: IDS.catBeauty,       name: 'Beauty & Fashion',  slug: 'beauty-fashion',  desc: 'Hair, makeup, styling, and clothing' },
  ];

  for (const c of categories) {
    await client.query(`
      INSERT INTO request_categories (id, name, slug, description, is_active, sort_order)
      VALUES ($1,$2,$3,$4,true,$5)
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
    `, [c.id, c.name, c.slug, c.desc, categories.indexOf(c)]);
  }
  console.log(`  ✅ Categories (${categories.length})`);

  // ── Requests ───────────────────────────────────────────────────────────────

  const requests = [
    {
      id: IDS.req1, buyerId: IDS.buyer1, catId: IDS.catElectronics,
      title: 'Looking for iPhone 15 Pro Max 256GB',
      desc: 'I need a brand new or like-new iPhone 15 Pro Max in black. Must come with original box and all accessories. Willing to pay fair market price.',
      budMin: 800, budMax: 1200, city: 'Jarash', country: 'JO',
      status: 'HAS_BIDS', bids: 2, views: 47, score: 20,
      publishedAt: past3Days, expiresAt: in3Days,
    },
    {
      id: IDS.req2, buyerId: IDS.buyer1, catId: IDS.catHomeServices,
      title: 'Need a professional house cleaning service',
      desc: '4-bedroom villa needs deep cleaning. 2 bathrooms, large kitchen. Looking for a team that can finish within one day. Prefer eco-friendly products.',
      budMin: 100, budMax: 300, city: 'Jarash', country: 'JO',
      status: 'HAS_BIDS', bids: 2, views: 62, score: 15,
      publishedAt: past3Days, expiresAt: in7Days,
    },
    {
      id: IDS.req3, buyerId: IDS.buyer2, catId: IDS.catTransport,
      title: 'Moving furniture from one apartment to another',
      desc: 'I have a 2-bedroom apartment worth of furniture to move. Need a truck and 2 helpers. Flexible on date within the next 2 weeks.',
      budMin: 200, budMax: 500, city: 'Amman', country: 'JO',
      status: 'ACTIVE', bids: 0, views: 28, score: 10,
      publishedAt: past3Days, expiresAt: in7Days,
    },
    {
      id: IDS.req4, buyerId: IDS.buyer2, catId: IDS.catEducation,
      title: 'Looking for a math tutor for high school student',
      desc: 'My daughter is in grade 11 and needs help with calculus and algebra. Prefer online sessions 3 times per week. English or Arabic is fine.',
      budMin: 20, budMax: 50, city: 'Amman', country: 'JO',
      status: 'HAS_BIDS', bids: 2, views: 95, score: 25,
      publishedAt: past7Days, expiresAt: in14Days,
    },
    {
      id: IDS.req5, buyerId: IDS.buyer1, catId: IDS.catRepairs,
      title: 'MacBook Pro screen replacement needed',
      desc: 'My MacBook Pro 14" (2023) has a cracked screen. Need a certified technician for replacement. Only original Apple parts.',
      budMin: 300, budMax: 600, city: 'Jarash', country: 'JO',
      status: 'COMPLETED', bids: 2, views: 38, score: 0,
      publishedAt: past7Days, expiresAt: past3Days,
    },
    {
      id: IDS.req6, buyerId: IDS.buyer2, catId: IDS.catFood,
      title: 'Catering for 50-person corporate event',
      desc: 'Need full catering service for a corporate lunch event. Arabic and international cuisine. Includes setup and cleanup.',
      budMin: 1500, budMax: 3000, city: 'Amman', country: 'JO',
      status: 'CANCELLED', bids: 1, views: 15, score: 0,
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
        view_count = EXCLUDED.view_count, priority_score = EXCLUDED.priority_score
    `, [r.id, r.buyerId, r.catId, r.title, r.desc, r.budMin, r.budMax,
        r.city, r.country, r.status, r.score, r.bids, r.views, r.publishedAt, r.expiresAt]);
  }
  console.log(`  ✅ Requests (${requests.length})`);

  // ── Request Images ─────────────────────────────────────────────────────────

  const images = [
    { requestId: IDS.req1, url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', thumb: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200', filename: 'iphone-15-pro.jpg',    size: 245000, isPrimary: true,  sort: 0 },
    { requestId: IDS.req1, url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800', thumb: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200', filename: 'iphone-box.jpg',       size: 198000, isPrimary: false, sort: 1 },
    { requestId: IDS.req2, url: 'https://images.unsplash.com/photo-1527515637462-cff94edd56f3?w=800', thumb: 'https://images.unsplash.com/photo-1527515637462-cff94edd56f3?w=200', filename: 'villa-living.jpg',     size: 312000, isPrimary: true,  sort: 0 },
    { requestId: IDS.req5, url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', thumb: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200', filename: 'macbook-cracked.jpg',  size: 278000, isPrimary: true,  sort: 0 },
  ];

  for (const img of images) {
    await client.query(`
      INSERT INTO request_images
        (id, request_id, image_url, thumbnail_url, original_filename, file_size, mime_type, is_primary, sort_order)
      VALUES ($1,$2,$3,$4,$5,$6,'image/jpeg',$7,$8)
      ON CONFLICT (id) DO NOTHING
    `, [uuidv4(), img.requestId, img.url, img.thumb, img.filename, img.size, img.isPrimary, img.sort]);
  }
  console.log(`  ✅ Request images (${images.length})`);

  // ── Request Drafts ─────────────────────────────────────────────────────────

  await client.query(`
    INSERT INTO request_drafts (id, buyer_id, category_id, title, description, budget_min, budget_max, auto_save_data, expires_at)
    VALUES
      ($1,$2,$3,'Looking for physiotherapy sessions','Need physiotherapy for lower back pain. Prefer home visits.',30,80,$4,$5),
      ($6,$7,$8,'Bridal makeup artist for wedding',NULL,NULL,NULL,$9,$10)
    ON CONFLICT (id) DO NOTHING
  `, [
    IDS.draft1, IDS.buyer1, IDS.catHealth, JSON.stringify({step:2,completedSteps:[1,2]}), in7Days,
    IDS.draft2, IDS.buyer2, IDS.catBeauty, JSON.stringify({step:1,completedSteps:[1]}), in14Days,
  ]);
  console.log('  ✅ Request drafts (2)');

  // ── Request Extensions ─────────────────────────────────────────────────────

  await client.query(`
    INSERT INTO request_extensions (id, request_id, original_expires_at, new_expires_at, extension_reason, extended_by)
    VALUES ($1,$2,$3,$4,$5,$6)
    ON CONFLICT (id) DO NOTHING
  `, [uuidv4(), IDS.req4, in7Days, in14Days, 'Still evaluating bids, need more time to choose the right tutor', IDS.buyer2]);
  console.log('  ✅ Request extensions (1)');

  // ── Saved Searches ─────────────────────────────────────────────────────────

  const savedSearches = [
    { userId: IDS.merchant1, name: 'Electronics in Jarash', criteria: {category: IDS.catElectronics, country: 'JO', city: 'Jarash', budgetMin: 500} },
    { userId: IDS.merchant1, name: 'Home Services',         criteria: {category: IDS.catHomeServices, country: 'JO', budgetMin: 100} },
    { userId: IDS.merchant2, name: 'Education requests',    criteria: {category: IDS.catEducation, budgetMin: 15, budgetMax: 100} },
    { userId: IDS.buyer1,    name: 'Repair services',       criteria: {category: IDS.catRepairs, country: 'JO'} },
  ];

  for (const s of savedSearches) {
    await client.query(`
      INSERT INTO saved_searches (id, user_id, name, search_criteria, is_active)
      VALUES ($1,$2,$3,$4,true)
      ON CONFLICT (id) DO NOTHING
    `, [uuidv4(), s.userId, s.name, JSON.stringify(s.criteria)]);
  }
  console.log(`  ✅ Saved searches (${savedSearches.length})`);

  // ── Request Search Index ───────────────────────────────────────────────────

  const searchEntries = [
    { reqId: IDS.req1, vec: 'iphone 15 pro max 256gb black electronics apple',     cat: 'electronics',   loc: 'Jarash Jordan',  bud: '800-1200' },
    { reqId: IDS.req2, vec: 'house cleaning villa deep bathroom kitchen eco',       cat: 'home-services', loc: 'Jarash Jordan',  bud: '100-300' },
    { reqId: IDS.req3, vec: 'moving furniture truck helpers apartment transport',   cat: 'transportation',loc: 'Amman Jordan',   bud: '200-500' },
    { reqId: IDS.req4, vec: 'math tutor grade 11 calculus algebra online sessions', cat: 'education',    loc: 'Amman Jordan',   bud: '20-50' },
    { reqId: IDS.req5, vec: 'macbook pro screen replacement cracked repair apple',  cat: 'repairs-fix',  loc: 'Jarash Jordan',  bud: '300-600' },
    { reqId: IDS.req6, vec: 'catering corporate event arabic international cuisine',cat: 'food-beverages',loc: 'Amman Jordan',  bud: '1500-3000' },
  ];

  for (const s of searchEntries) {
    await client.query(`
      INSERT INTO request_search_index (id, request_id, search_vector, category_path, location_text, budget_range)
      VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (request_id) DO UPDATE SET
        search_vector = EXCLUDED.search_vector, category_path = EXCLUDED.category_path,
        location_text = EXCLUDED.location_text, budget_range = EXCLUDED.budget_range
    `, [uuidv4(), s.reqId, s.vec, s.cat, s.loc, s.bud]);
  }
  console.log(`  ✅ Request search index (${searchEntries.length})`);

  // ── Bids ───────────────────────────────────────────────────────────────────

  const bidsData = [
    // req1 — iPhone (HAS_BIDS): 2 pending bids
    { id: IDS.bid1,  reqId: IDS.req1, mId: IDS.merchant1, amount: 950.00,  days: 5,  notes: 'Brand new sealed box, warranty included.',           terms: null,                           status: 'PENDING',   score: 90, expiresAt: in7Days, acceptedAt: null, rejectedAt: null, withdrawnAt: null },
    { id: IDS.bid2,  reqId: IDS.req1, mId: IDS.merchant2, amount: 1050.00, days: 7,  notes: 'Like-new, purchased 2 weeks ago, full accessories.',  terms: '7-day return policy',          status: 'PENDING',   score: 83, expiresAt: in7Days, acceptedAt: null, rejectedAt: null, withdrawnAt: null },
    // req2 — Cleaning (HAS_BIDS): 1 accepted, 1 rejected
    { id: IDS.bid3,  reqId: IDS.req2, mId: IDS.merchant1, amount: 180.00,  days: 1,  notes: 'Professional team of 4, eco-friendly products.',      terms: null,                           status: 'REJECTED',  score: 82, expiresAt: in7Days, acceptedAt: null, rejectedAt: past1Day, withdrawnAt: null },
    { id: IDS.bid4,  reqId: IDS.req2, mId: IDS.merchant2, amount: 250.00,  days: 1,  notes: 'Specialized deep cleaning with steam equipment.',     terms: 'Includes all cleaning supplies', status: 'ACCEPTED', score: 75, expiresAt: in7Days, acceptedAt: past1Day, rejectedAt: null, withdrawnAt: null },
    // req4 — Tutor (HAS_BIDS): 2 pending bids
    { id: IDS.bid5,  reqId: IDS.req4, mId: IDS.merchant1, amount: 35.00,   days: 30, notes: '5 years tutoring experience, flexible schedule.',     terms: null,                           status: 'PENDING',   score: 65, expiresAt: in14Days, acceptedAt: null, rejectedAt: null, withdrawnAt: null },
    { id: IDS.bid6,  reqId: IDS.req4, mId: IDS.merchant2, amount: 42.00,   days: 30, notes: 'Certified math teacher, online sessions via Zoom.',   terms: 'First session free',           status: 'PENDING',   score: 58, expiresAt: in14Days, acceptedAt: null, rejectedAt: null, withdrawnAt: null },
    // req5 — MacBook (COMPLETED): 1 accepted, 1 rejected
    { id: IDS.bid7,  reqId: IDS.req5, mId: IDS.merchant1, amount: 450.00,  days: 3,  notes: 'Apple Authorized Service Provider, original parts.',  terms: '90-day warranty on repair',    status: 'ACCEPTED',  score: 76, expiresAt: past1Day, acceptedAt: past3Days, rejectedAt: null, withdrawnAt: null },
    { id: IDS.bid8,  reqId: IDS.req5, mId: IDS.merchant2, amount: 520.00,  days: 5,  notes: 'Certified technician, 3-year experience.',            terms: null,                           status: 'REJECTED',  score: 69, expiresAt: past1Day, acceptedAt: null, rejectedAt: past3Days, withdrawnAt: null },
    // req6 — Catering (CANCELLED): 1 rejected
    { id: IDS.bid9,  reqId: IDS.req6, mId: IDS.merchant1, amount: 2200.00, days: 1,  notes: 'Full catering team, 50 person setup & cleanup.',      terms: '50% deposit required',         status: 'REJECTED',  score: 60, expiresAt: past1Day, acceptedAt: null, rejectedAt: past7Days, withdrawnAt: null },
    // req3 — Moving (ACTIVE): withdrawn bid
    { id: IDS.bid10, reqId: IDS.req3, mId: IDS.merchant2, amount: 380.00,  days: 2,  notes: 'Large truck + 2 experienced movers.',                 terms: null,                           status: 'WITHDRAWN', score: 62, expiresAt: in7Days, acceptedAt: null, rejectedAt: null, withdrawnAt: past1Day },
  ];

  for (const b of bidsData) {
    await client.query(`
      INSERT INTO bids
        (id, request_id, merchant_id, amount, delivery_days, delivery_notes, special_terms,
         status, priority_score, expires_at, accepted_at, rejected_at, withdrawn_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status, priority_score = EXCLUDED.priority_score,
        accepted_at = EXCLUDED.accepted_at, rejected_at = EXCLUDED.rejected_at,
        withdrawn_at = EXCLUDED.withdrawn_at
    `, [b.id, b.reqId, b.mId, b.amount, b.days, b.notes, b.terms,
        b.status, b.score, b.expiresAt, b.acceptedAt, b.rejectedAt, b.withdrawnAt]);
  }
  console.log(`  ✅ Bids (${bidsData.length})`);

  // ── Bid Templates ──────────────────────────────────────────────────────────

  const templates = [
    { id: uuidv4(), mId: IDS.merchant1, name: 'Standard Electronics Offer', desc: 'My default bid for electronics requests', amtType: 'FIXED', fixedAmt: null, days: 5, notes: 'Original packaging, tested and verified. Includes warranty.', terms: null },
    { id: uuidv4(), mId: IDS.merchant1, name: 'Premium Service Bid',        desc: 'Premium package with extended warranty',  amtType: 'FIXED', fixedAmt: null, days: 3, notes: 'Priority service with same-day response.',                     terms: '30-day satisfaction guarantee' },
    { id: uuidv4(), mId: IDS.merchant2, name: 'Budget-Friendly Offer',      desc: 'Competitive pricing for all categories', amtType: 'FIXED', fixedAmt: null, days: 7, notes: 'Quality service at an affordable price.',                      terms: null },
  ];

  for (const t of templates) {
    await client.query(`
      INSERT INTO bid_templates
        (id, merchant_id, name, description, amount_type, fixed_amount, delivery_days, delivery_notes, special_terms, is_active, usage_count)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,0)
      ON CONFLICT (id) DO NOTHING
    `, [t.id, t.mId, t.name, t.desc, t.amtType, t.fixedAmt, t.days, t.notes, t.terms]);
  }
  console.log(`  ✅ Bid templates (${templates.length})`);

  // ── Chat Rooms ─────────────────────────────────────────────────────────────

  const rooms = [
    { id: IDS.room1, name: 'iPhone 15 — Buyer & Tariq',    desc: 'Discussion about iPhone request',     type: 'REQUEST', reqId: IDS.req1, bidId: null,     createdBy: IDS.buyer1,    lastMsgAt: past1Day },
    { id: IDS.room2, name: 'Tutor Bid Negotiation',         desc: 'Bid discussion for math tutor req',   type: 'BID',     reqId: IDS.req4, bidId: IDS.bid5, createdBy: IDS.buyer2,    lastMsgAt: past1Day },
    { id: IDS.room3, name: 'MacBook Repair — Support Chat', desc: 'Post-repair support follow-up',       type: 'DIRECT',  reqId: null,     bidId: null,     createdBy: IDS.buyer1,    lastMsgAt: past3Days },
    { id: IDS.room4, name: 'Support — Khalid Hassan',       desc: 'Customer support conversation',       type: 'SUPPORT', reqId: null,     bidId: null,     createdBy: IDS.admin1,    lastMsgAt: past3Days },
  ];

  for (const r of rooms) {
    await client.query(`
      INSERT INTO chat_rooms
        (id, name, description, type, related_request_id, related_bid_id, created_by, is_active, last_message_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,true,$8)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name, last_message_at = EXCLUDED.last_message_at
    `, [r.id, r.name, r.desc, r.type, r.reqId, r.bidId, r.createdBy, r.lastMsgAt]);
  }
  console.log(`  ✅ Chat rooms (${rooms.length})`);

  // ── Chat Participants ──────────────────────────────────────────────────────

  const participants = [
    // room1 — iPhone request chat
    { roomId: IDS.room1, userId: IDS.buyer1,   role: 'OWNER',  lastReadAt: past1Day },
    { roomId: IDS.room1, userId: IDS.merchant1, role: 'MEMBER', lastReadAt: past1Day },
    // room2 — Tutor bid chat
    { roomId: IDS.room2, userId: IDS.buyer2,   role: 'OWNER',  lastReadAt: past1Day },
    { roomId: IDS.room2, userId: IDS.merchant1, role: 'MEMBER', lastReadAt: past1Day },
    // room3 — MacBook direct chat
    { roomId: IDS.room3, userId: IDS.buyer1,   role: 'OWNER',  lastReadAt: past3Days },
    { roomId: IDS.room3, userId: IDS.merchant1, role: 'MEMBER', lastReadAt: past3Days },
    // room4 — Support
    { roomId: IDS.room4, userId: IDS.admin1,   role: 'OWNER',  lastReadAt: past3Days },
    { roomId: IDS.room4, userId: IDS.buyer1,   role: 'MEMBER', lastReadAt: past3Days },
  ];

  for (const p of participants) {
    await client.query(`
      INSERT INTO chat_participants (id, room_id, user_id, role, last_read_at)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (room_id, user_id) DO UPDATE SET role = EXCLUDED.role, last_read_at = EXCLUDED.last_read_at
    `, [uuidv4(), p.roomId, p.userId, p.role, p.lastReadAt]);
  }
  console.log(`  ✅ Chat participants (${participants.length})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// MongoDB seed
// ─────────────────────────────────────────────────────────────────────────────

async function seedMongo() {
  const now       = new Date();
  const past1h    = new Date(now - 1 * 3600000);
  const past2h    = new Date(now - 2 * 3600000);
  const past3h    = new Date(now - 3 * 3600000);
  const past4h    = new Date(now - 4 * 3600000);
  const past6h    = new Date(now - 6 * 3600000);
  const past12h   = new Date(now - 12 * 3600000);
  const past1Day  = new Date(now - 1 * 86400000);
  const past2Days = new Date(now - 2 * 86400000);
  const past3Days = new Date(now - 3 * 86400000);
  const past5Days = new Date(now - 5 * 86400000);
  const past7Days = new Date(now - 7 * 86400000);

  // ── Chat Messages (MongoDB) ────────────────────────────────────────────────
  // Delete existing seed messages for these rooms, then reinsert

  await ChatMessage.deleteMany({ roomId: { $in: [IDS.room1, IDS.room2, IDS.room3, IDS.room4] } });

  const chatMessages = [
    // ── room1: iPhone request chat (buyer1 ↔ merchant1) ──
    { roomId: IDS.room1, senderId: IDS.buyer1,    type: 'TEXT', content: 'Hi Tariq! I saw your bid on my iPhone request. Is the phone still available?', createdAt: new Date(past1Day.getTime() + 1000), readBy: [{userId: IDS.merchant1, readAt: past12h}] },
    { roomId: IDS.room1, senderId: IDS.merchant1, type: 'TEXT', content: 'Hello Khalid! Yes, it is 100% available. Sealed box, never opened.', createdAt: new Date(past1Day.getTime() + 120000), readBy: [{userId: IDS.buyer1, readAt: past12h}] },
    { roomId: IDS.room1, senderId: IDS.buyer1,    type: 'TEXT', content: 'Great! Does it come with a receipt? I want to verify the purchase date.', createdAt: new Date(past1Day.getTime() + 240000), readBy: [{userId: IDS.merchant1, readAt: past12h}] },
    { roomId: IDS.room1, senderId: IDS.merchant1, type: 'TEXT', content: 'Yes, original receipt included. Purchased 3 weeks ago from the Apple Store in Amman.', createdAt: new Date(past12h.getTime() + 1000), readBy: [{userId: IDS.buyer1, readAt: past6h}] },
    { roomId: IDS.room1, senderId: IDS.merchant1, type: 'TEXT', content: 'I can also provide the IMEI check result if you need it.', createdAt: new Date(past12h.getTime() + 60000), readBy: [{userId: IDS.buyer1, readAt: past6h}], reactions: [{userId: IDS.buyer1, reactionType: '👍', createdAt: past6h}] },
    { roomId: IDS.room1, senderId: IDS.buyer1,    type: 'TEXT', content: 'That would be perfect! Can we meet in Jarash this Saturday?', createdAt: new Date(past6h.getTime() + 1000), readBy: [{userId: IDS.merchant1, readAt: past4h}] },
    { roomId: IDS.room1, senderId: IDS.merchant1, type: 'TEXT', content: 'Saturday works for me! How about 11 AM at the city centre?', createdAt: new Date(past4h.getTime() + 1000), readBy: [{userId: IDS.buyer1, readAt: past3h}] },
    { roomId: IDS.room1, senderId: IDS.buyer1,    type: 'TEXT', content: 'Perfect. See you then! 🤝', createdAt: new Date(past3h.getTime() + 1000), readBy: [{userId: IDS.merchant1, readAt: past2h}] },

    // ── room2: Tutor bid negotiation (buyer2 ↔ merchant1) ──
    { roomId: IDS.room2, senderId: IDS.buyer2,    type: 'TEXT', content: 'Hi! I am interested in your bid for the math tutoring. My daughter is in grade 11.', createdAt: new Date(past2Days.getTime() + 1000), readBy: [{userId: IDS.merchant1, readAt: past2Days}] },
    { roomId: IDS.room2, senderId: IDS.merchant1, type: 'TEXT', content: 'Hello Layla! I have 5 years of experience tutoring calculus and algebra. I can share my method.', createdAt: new Date(past2Days.getTime() + 180000), readBy: [{userId: IDS.buyer2, readAt: past2Days}] },
    { roomId: IDS.room2, senderId: IDS.buyer2,    type: 'TEXT', content: 'She is struggling mainly with integration and limits. Would you be able to help with those topics?', createdAt: new Date(past2Days.getTime() + 360000), readBy: [{userId: IDS.merchant1, readAt: past2Days}] },
    { roomId: IDS.room2, senderId: IDS.merchant1, type: 'TEXT', content: 'Absolutely. Those are core topics in Grade 11. We can cover them in the first 3 sessions.', createdAt: new Date(past1Day.getTime() + 1000), readBy: [{userId: IDS.buyer2, readAt: past1Day}] },
    { roomId: IDS.room2, senderId: IDS.buyer2,    type: 'TEXT', content: 'That sounds great. Is $35 per session your final price?', createdAt: new Date(past1Day.getTime() + 120000), readBy: [{userId: IDS.merchant1, readAt: past12h}] },
    { roomId: IDS.room2, senderId: IDS.merchant1, type: 'TEXT', content: 'Yes, and the first session is a free trial so she can see if it works for her.', createdAt: new Date(past12h.getTime() + 1000), readBy: [{userId: IDS.buyer2, readAt: past6h}], reactions: [{userId: IDS.buyer2, reactionType: '❤️', createdAt: past6h}] },
    { roomId: IDS.room2, senderId: IDS.buyer2,    type: 'TEXT', content: 'That is very kind! We will accept your bid. When can we start?', createdAt: new Date(past6h.getTime() + 1000), readBy: [{userId: IDS.merchant1, readAt: past3h}] },
    { roomId: IDS.room2, senderId: IDS.merchant1, type: 'TEXT', content: 'I can start this Sunday. I will send a Zoom link before the session. 📚', createdAt: new Date(past3h.getTime() + 1000), readBy: [{userId: IDS.buyer2, readAt: past2h}] },

    // ── room3: MacBook post-repair chat (buyer1 ↔ merchant1) ──
    { roomId: IDS.room3, senderId: IDS.buyer1,    type: 'TEXT', content: 'Hey Tariq, wanted to check if the screen replacement is still under your 90-day warranty?', createdAt: new Date(past3Days.getTime() + 1000), readBy: [{userId: IDS.merchant1, readAt: past3Days}] },
    { roomId: IDS.room3, senderId: IDS.merchant1, type: 'TEXT', content: 'Of course! The warranty covers any defect in the replaced screen for 90 days. How can I help?', createdAt: new Date(past3Days.getTime() + 300000), readBy: [{userId: IDS.buyer1, readAt: past3Days}] },
    { roomId: IDS.room3, senderId: IDS.buyer1,    type: 'TEXT', content: 'There is a small backlight bleed on the bottom left corner. Is that normal?', createdAt: new Date(past3Days.getTime() + 600000), readBy: [{userId: IDS.merchant1, readAt: past3Days}] },
    { roomId: IDS.room3, senderId: IDS.merchant1, type: 'TEXT', content: 'Minor backlight bleed is within Apple spec for that display. But bring it in and I will check it for free.', createdAt: new Date(past3Days.getTime() + 900000), readBy: [{userId: IDS.buyer1, readAt: past3Days}] },
    { roomId: IDS.room3, senderId: IDS.buyer1,    type: 'TEXT', content: 'Thank you! I appreciate the quick response. Will come tomorrow.', createdAt: new Date(past3Days.getTime() + 1200000), readBy: [{userId: IDS.merchant1, readAt: past3Days}] },
    { roomId: IDS.room3, senderId: IDS.merchant1, type: 'TEXT', content: 'No problem at all. See you tomorrow! 🔧', createdAt: new Date(past3Days.getTime() + 1500000), readBy: [{userId: IDS.buyer1, readAt: past3Days}] },

    // ── room4: Support chat (admin1 ↔ buyer1) ──
    { roomId: IDS.room4, senderId: IDS.buyer1,    type: 'TEXT', content: 'Hello support team, I have a question about the bidding process.', createdAt: new Date(past5Days.getTime() + 1000), readBy: [{userId: IDS.admin1, readAt: past5Days}] },
    { roomId: IDS.room4, senderId: IDS.admin1,    type: 'TEXT', content: 'Hello Khalid! Of course, I am happy to help. What is your question?', createdAt: new Date(past5Days.getTime() + 180000), readBy: [{userId: IDS.buyer1, readAt: past5Days}] },
    { roomId: IDS.room4, senderId: IDS.buyer1,    type: 'TEXT', content: 'Can I accept a bid after the request expires?', createdAt: new Date(past5Days.getTime() + 360000), readBy: [{userId: IDS.admin1, readAt: past5Days}] },
    { roomId: IDS.room4, senderId: IDS.admin1,    type: 'TEXT', content: 'No, once a request expires you cannot accept bids. You would need to extend the request first, then accept.', createdAt: new Date(past5Days.getTime() + 540000), readBy: [{userId: IDS.buyer1, readAt: past5Days}] },
    { roomId: IDS.room4, senderId: IDS.buyer1,    type: 'TEXT', content: 'Got it, thank you! And is there a fee for extending?', createdAt: new Date(past5Days.getTime() + 720000), readBy: [{userId: IDS.admin1, readAt: past5Days}] },
    { roomId: IDS.room4, senderId: IDS.admin1,    type: 'SYSTEM', content: 'Extensions are currently free. You can extend up to 3 times per request for 7 days each time.', createdAt: new Date(past5Days.getTime() + 900000), readBy: [{userId: IDS.buyer1, readAt: past5Days}], reactions: [{userId: IDS.buyer1, reactionType: '🙏', createdAt: past5Days}] },
    { roomId: IDS.room4, senderId: IDS.buyer1,    type: 'TEXT', content: 'That is very helpful. Thank you so much!', createdAt: new Date(past5Days.getTime() + 1080000), readBy: [{userId: IDS.admin1, readAt: past5Days}] },
  ];

  await ChatMessage.insertMany(chatMessages);
  console.log(`  ✅ Chat messages (${chatMessages.length}) [MongoDB]`);

  // ── Activity Logs (MongoDB) ────────────────────────────────────────────────

  await ActivityLog.deleteMany({ 'metadata.seeded': true });

  const activityLogs = [
    // Registrations
    { actorId: IDS.buyer1,    actorRole: 'BUYER',    eventType: 'user.registered',  category: 'identity', action: 'User registered',           targetType: 'user', targetId: IDS.buyer1,    metadata: { userId: IDS.buyer1,    phone: '+962780000004', role: 'BUYER',    seeded: true }, createdAt: past7Days },
    { actorId: IDS.buyer2,    actorRole: 'BUYER',    eventType: 'user.registered',  category: 'identity', action: 'User registered',           targetType: 'user', targetId: IDS.buyer2,    metadata: { userId: IDS.buyer2,    phone: '+962780000005', role: 'BUYER',    seeded: true }, createdAt: past7Days },
    { actorId: IDS.merchant1, actorRole: 'MERCHANT', eventType: 'user.registered',  category: 'identity', action: 'User registered',           targetType: 'user', targetId: IDS.merchant1, metadata: { userId: IDS.merchant1, phone: '+962780000006', role: 'MERCHANT', seeded: true }, createdAt: past7Days },
    { actorId: IDS.merchant2, actorRole: 'MERCHANT', eventType: 'user.registered',  category: 'identity', action: 'User registered',           targetType: 'user', targetId: IDS.merchant2, metadata: { userId: IDS.merchant2, phone: '+962780000007', role: 'MERCHANT', seeded: true }, createdAt: past7Days },
    // Logins
    { actorId: IDS.buyer1,    actorRole: 'BUYER',    eventType: 'user.logined',     category: 'identity', action: 'User logged in',             targetType: 'user', targetId: IDS.buyer1,    metadata: { userId: IDS.buyer1,    seeded: true }, createdAt: past3Days },
    { actorId: IDS.buyer2,    actorRole: 'BUYER',    eventType: 'user.logined',     category: 'identity', action: 'User logged in',             targetType: 'user', targetId: IDS.buyer2,    metadata: { userId: IDS.buyer2,    seeded: true }, createdAt: past3Days },
    { actorId: IDS.merchant1, actorRole: 'MERCHANT', eventType: 'user.logined',     category: 'identity', action: 'User logged in',             targetType: 'user', targetId: IDS.merchant1, metadata: { userId: IDS.merchant1, seeded: true }, createdAt: past1Day },
    { actorId: IDS.superAdmin,actorRole: 'ADMIN',    eventType: 'user.logined',     category: 'identity', action: 'User logged in',             targetType: 'user', targetId: IDS.superAdmin,metadata: { userId: IDS.superAdmin,seeded: true }, createdAt: past1Day },
    // Request created
    { actorId: IDS.buyer1,    actorRole: 'BUYER',    eventType: 'request.created',  category: 'requests', action: 'Request created',            targetType: 'request', targetId: IDS.req1, metadata: { requestId: IDS.req1, title: 'iPhone 15 Pro Max', seeded: true }, createdAt: past3Days },
    { actorId: IDS.buyer1,    actorRole: 'BUYER',    eventType: 'request.created',  category: 'requests', action: 'Request created',            targetType: 'request', targetId: IDS.req2, metadata: { requestId: IDS.req2, title: 'House Cleaning',     seeded: true }, createdAt: past3Days },
    { actorId: IDS.buyer2,    actorRole: 'BUYER',    eventType: 'request.created',  category: 'requests', action: 'Request created',            targetType: 'request', targetId: IDS.req4, metadata: { requestId: IDS.req4, title: 'Math Tutor',         seeded: true }, createdAt: past7Days },
    // Bid submitted
    { actorId: IDS.merchant1, actorRole: 'MERCHANT', eventType: 'bid.submitted',    category: 'requests', action: 'Bid submitted',              targetType: 'request', targetId: IDS.req1, metadata: { bidId: IDS.bid1, requestId: IDS.req1, amount: 950,  seeded: true }, createdAt: past3Days },
    { actorId: IDS.merchant2, actorRole: 'MERCHANT', eventType: 'bid.submitted',    category: 'requests', action: 'Bid submitted',              targetType: 'request', targetId: IDS.req1, metadata: { bidId: IDS.bid2, requestId: IDS.req1, amount: 1050, seeded: true }, createdAt: past3Days },
    { actorId: IDS.merchant2, actorRole: 'MERCHANT', eventType: 'bid.accepted',     category: 'requests', action: 'Bid accepted',               targetType: 'request', targetId: IDS.req2, metadata: { bidId: IDS.bid4, requestId: IDS.req2, amount: 250,  seeded: true }, createdAt: past1Day },
    { actorId: IDS.merchant1, actorRole: 'MERCHANT', eventType: 'bid.accepted',     category: 'requests', action: 'Bid accepted',               targetType: 'request', targetId: IDS.req5, metadata: { bidId: IDS.bid7, requestId: IDS.req5, amount: 450,  seeded: true }, createdAt: past3Days },
    // Admin actions
    { actorId: IDS.superAdmin, actorRole: 'ADMIN',   eventType: 'admin.action',     category: 'admin',    action: 'USER_VIEW',                  targetType: 'user', targetId: IDS.buyer1,    metadata: { adminId: IDS.superAdmin, seeded: true }, createdAt: past3Days },
    { actorId: IDS.admin1,     actorRole: 'ADMIN',   eventType: 'admin.action',     category: 'admin',    action: 'USER_VIEW',                  targetType: 'user', targetId: IDS.merchant1, metadata: { adminId: IDS.admin1,     seeded: true }, createdAt: past1Day },
    { actorId: IDS.superAdmin, actorRole: 'ADMIN',   eventType: 'request.updated',  category: 'requests', action: 'Request updated',            targetType: 'request', targetId: IDS.req6, metadata: { requestId: IDS.req6, action: 'cancel', seeded: true }, createdAt: past7Days },
  ];

  await ActivityLog.insertMany(activityLogs);
  console.log(`  ✅ Activity logs (${activityLogs.length}) [MongoDB]`);

  // ── Request Analytics (MongoDB) ────────────────────────────────────────────

  await RequestAnalytic.deleteMany({ 'metadata.seeded': true });

  const reqAnalytics = [
    { requestId: IDS.req1, eventType: 'STATUS_CHANGE', userId: IDS.buyer1,    metadata: { status: 'ACTIVE',    seeded: true }, createdAt: past3Days },
    { requestId: IDS.req1, eventType: 'STATUS_CHANGE', userId: IDS.buyer1,    metadata: { status: 'HAS_BIDS',  seeded: true }, createdAt: past3Days },
    { requestId: IDS.req2, eventType: 'STATUS_CHANGE', userId: IDS.buyer1,    metadata: { status: 'ACTIVE',    seeded: true }, createdAt: past3Days },
    { requestId: IDS.req2, eventType: 'STATUS_CHANGE', userId: IDS.buyer1,    metadata: { status: 'HAS_BIDS',  seeded: true }, createdAt: past1Day },
    { requestId: IDS.req3, eventType: 'STATUS_CHANGE', userId: IDS.buyer2,    metadata: { status: 'ACTIVE',    seeded: true }, createdAt: past3Days },
    { requestId: IDS.req4, eventType: 'STATUS_CHANGE', userId: IDS.buyer2,    metadata: { status: 'ACTIVE',    seeded: true }, createdAt: past7Days },
    { requestId: IDS.req4, eventType: 'STATUS_CHANGE', userId: IDS.buyer2,    metadata: { status: 'HAS_BIDS',  seeded: true }, createdAt: past7Days },
    { requestId: IDS.req4, eventType: 'EXTENSION_REQUESTED', userId: IDS.buyer2, metadata: { seeded: true },                  createdAt: past3Days },
    { requestId: IDS.req5, eventType: 'STATUS_CHANGE', userId: IDS.buyer1,    metadata: { status: 'ACTIVE',    seeded: true }, createdAt: past7Days },
    { requestId: IDS.req5, eventType: 'COMPLETED',     userId: IDS.buyer1,    metadata: { acceptedBidId: IDS.bid7, seeded: true }, createdAt: past3Days },
    { requestId: IDS.req6, eventType: 'STATUS_CHANGE', userId: IDS.buyer2,    metadata: { status: 'ACTIVE',    seeded: true }, createdAt: past7Days },
    { requestId: IDS.req6, eventType: 'CANCELLED',     userId: IDS.buyer2,    metadata: { reason: 'Changed plans', seeded: true }, createdAt: past7Days },
  ];

  await RequestAnalytic.insertMany(reqAnalytics);
  console.log(`  ✅ Request analytics (${reqAnalytics.length}) [MongoDB]`);

  // ── Request Views (MongoDB) ────────────────────────────────────────────────

  await RequestView.deleteMany({ 'metadata.seeded': true });

  const views = [
    { requestId: IDS.req1, userId: IDS.merchant1, ipAddress: '192.168.1.10', viewedAt: past3Days },
    { requestId: IDS.req1, userId: IDS.merchant2, ipAddress: '192.168.1.11', viewedAt: past3Days },
    { requestId: IDS.req1, userId: null,           ipAddress: '10.0.0.1',     viewedAt: past1Day  },
    { requestId: IDS.req2, userId: IDS.merchant1, ipAddress: '192.168.1.10', viewedAt: past3Days },
    { requestId: IDS.req2, userId: IDS.merchant2, ipAddress: '192.168.1.11', viewedAt: past1Day  },
    { requestId: IDS.req3, userId: IDS.merchant1, ipAddress: '192.168.1.10', viewedAt: past1Day  },
    { requestId: IDS.req4, userId: IDS.merchant1, ipAddress: '192.168.1.10', viewedAt: past7Days },
    { requestId: IDS.req4, userId: IDS.merchant2, ipAddress: '192.168.1.11', viewedAt: past7Days },
    { requestId: IDS.req4, userId: null,           ipAddress: '10.0.0.2',     viewedAt: past3Days },
    { requestId: IDS.req5, userId: IDS.merchant1, ipAddress: '192.168.1.10', viewedAt: past7Days },
    { requestId: IDS.req5, userId: IDS.merchant2, ipAddress: '192.168.1.11', viewedAt: past7Days },
  ];

  // RequestView schema might not have metadata — use a plain createdAt flag
  const viewDocs = views.map(v => ({ ...v }));
  await RequestView.insertMany(viewDocs);
  console.log(`  ✅ Request views (${views.length}) [MongoDB]`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification seed (PostgreSQL)
// ─────────────────────────────────────────────────────────────────────────────

async function seedNotifications(client) {
  const past7Days = new Date(Date.now() - 7 * 86400000);
  const past3Days = new Date(Date.now() - 3 * 86400000);
  const past1Day  = new Date(Date.now() - 86400000);
  const past1Hour = new Date(Date.now() - 3600000);

  // Templates
  const templateId1 = '60000000-0000-0000-0000-000000000001';
  const templateId2 = '60000000-0000-0000-0000-000000000002';
  const templateId3 = '60000000-0000-0000-0000-000000000003';

  const templates = [
    { id: templateId1, name: 'bid_received',    type: 'BID',     channel: 'IN_APP', subject: null,                    content: 'You received a new bid of {{amount}} on your request "{{requestTitle}}".',    by: IDS.superAdmin },
    { id: templateId2, name: 'bid_accepted',    type: 'BID',     channel: 'IN_APP', subject: null,                    content: 'Your bid on "{{requestTitle}}" has been accepted! Contact the buyer to proceed.', by: IDS.superAdmin },
    { id: templateId3, name: 'request_created', type: 'REQUEST', channel: 'IN_APP', subject: 'New Request Available', content: 'A new request "{{requestTitle}}" matching your profile is available.',           by: IDS.superAdmin },
  ];

  for (const t of templates) {
    await client.query(`
      INSERT INTO notification_templates (id, name, type, channel, subject_template, content_template, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, content_template = EXCLUDED.content_template
    `, [t.id, t.name, t.type, t.channel, t.subject, t.content, t.by]);
  }
  console.log('  ✅ Notification templates (3)');

  // Notifications
  const notifId1  = '61000000-0000-0000-0000-000000000001';
  const notifId2  = '61000000-0000-0000-0000-000000000002';
  const notifId3  = '61000000-0000-0000-0000-000000000003';
  const notifId4  = '61000000-0000-0000-0000-000000000004';
  const notifId5  = '61000000-0000-0000-0000-000000000005';
  const notifId6  = '61000000-0000-0000-0000-000000000006';
  const notifId7  = '61000000-0000-0000-0000-000000000007';
  const notifId8  = '61000000-0000-0000-0000-000000000008';
  const notifId9  = '61000000-0000-0000-0000-000000000009';
  const notifId10 = '61000000-0000-0000-0000-000000000010';

  const notifications = [
    // Buyer1: received bids on their requests
    { id: notifId1,  userId: IDS.buyer1,    type: 'BID',     title: 'New bid received',          content: 'You received a new bid of $950 on "iPhone 15 Pro Max".',           channel: 'IN_APP', priority: 'HIGH',   status: 'READ',      readAt: past3Days, sentAt: past3Days, createdAt: past3Days },
    { id: notifId2,  userId: IDS.buyer1,    type: 'BID',     title: 'New bid received',          content: 'You received a new bid of $1050 on "iPhone 15 Pro Max".',          channel: 'IN_APP', priority: 'HIGH',   status: 'READ',      readAt: past3Days, sentAt: past3Days, createdAt: past3Days },
    { id: notifId3,  userId: IDS.buyer1,    type: 'REQUEST', title: 'Request expiring soon',     content: 'Your request "House Cleaning Service" expires in 24 hours.',        channel: 'IN_APP', priority: 'URGENT', status: 'DELIVERED', readAt: null,      sentAt: past1Day,  createdAt: past1Day  },
    { id: notifId4,  userId: IDS.buyer1,    type: 'SYSTEM',  title: 'Welcome to Marketplace!',   content: 'Start posting requests to receive competitive bids from merchants.', channel: 'IN_APP', priority: 'LOW',    status: 'READ',      readAt: past7Days, sentAt: past7Days, createdAt: past7Days },
    // Buyer2: notifications
    { id: notifId5,  userId: IDS.buyer2,    type: 'BID',     title: 'Bid accepted',              content: 'Your bid acceptance was processed for "Math Tutor".',              channel: 'IN_APP', priority: 'HIGH',   status: 'READ',      readAt: past1Day,  sentAt: past1Day,  createdAt: past1Day  },
    { id: notifId6,  userId: IDS.buyer2,    type: 'CHAT',    title: 'New message',               content: 'You have a new message in "Math Tutoring Session".',               channel: 'IN_APP', priority: 'NORMAL', status: 'DELIVERED', readAt: null,      sentAt: past1Hour, createdAt: past1Hour },
    // Merchant1: bid notifications
    { id: notifId7,  userId: IDS.merchant1, type: 'BID',     title: 'Bid accepted!',             content: 'Congratulations! Your bid on "Photography Session" was accepted.', channel: 'IN_APP', priority: 'URGENT', status: 'READ',      readAt: past3Days, sentAt: past3Days, createdAt: past3Days },
    { id: notifId8,  userId: IDS.merchant1, type: 'REQUEST', title: 'New request available',     content: 'A new request "House Cleaning" matching your profile is live.',     channel: 'IN_APP', priority: 'NORMAL', status: 'DELIVERED', readAt: null,      sentAt: past1Day,  createdAt: past1Day  },
    // Merchant2
    { id: notifId9,  userId: IDS.merchant2, type: 'BID',     title: 'Bid rejected',              content: 'Your bid on "iPhone 15 Pro Max" was not selected this time.',      channel: 'IN_APP', priority: 'NORMAL', status: 'READ',      readAt: past1Day,  sentAt: past1Day,  createdAt: past1Day  },
    { id: notifId10, userId: IDS.merchant2, type: 'SYSTEM',  title: 'Profile verification',      content: 'Complete your profile to receive more visibility on requests.',     channel: 'IN_APP', priority: 'LOW',    status: 'DELIVERED', readAt: null,      sentAt: past7Days, createdAt: past7Days },
  ];

  for (const n of notifications) {
    await client.query(`
      INSERT INTO notifications (id, user_id, type, title, content, channel, priority, status, read_at, sent_at, delivered_at, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$10,$11,$11)
      ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status, read_at = EXCLUDED.read_at
    `, [n.id, n.userId, n.type, n.title, n.content, n.channel, n.priority, n.status, n.readAt, n.sentAt, n.createdAt]);
  }
  console.log(`  ✅ Notifications (${notifications.length})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry point
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  // ── PostgreSQL ─────────────────────────────────────────────────────────────
  const pg = new Client({ connectionString: DATABASE_URL });
  await pg.connect();
  console.log('\n🌱 Seeding PostgreSQL...\n');
  try {
    await seedPostgres(pg);
    await seedNotifications(pg);
  } catch (err) {
    console.error('\n❌ PostgreSQL seed failed:', err.message);
    throw err;
  } finally {
    await pg.end();
  }

  // ── MongoDB ────────────────────────────────────────────────────────────────
  console.log('\n🌱 Seeding MongoDB...\n');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  try {
    await seedMongo();
  } catch (err) {
    console.error('\n❌ MongoDB seed failed:', err.message);
    throw err;
  } finally {
    await mongoose.disconnect();
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n🎉 Seed complete!\n');
  console.log('  PostgreSQL tables seeded:');
  console.log('  • users (7) • user_profiles (7) • request_categories (8)');
  console.log('  • requests (6) • request_images (4) • request_drafts (2)');
  console.log('  • request_extensions (1) • saved_searches (4) • request_search_index (6)');
  console.log('  • bids (10) • bid_templates (3)');
  console.log('  • chat_rooms (4) • chat_participants (8)');
  console.log('  • notification_templates (3) • notifications (10)');
  console.log('\n  MongoDB collections seeded:');
  console.log('  • chat_messages (26) • activity_logs (18) • request_analytics (12) • request_views (11)');
  console.log('\n  Test accounts (use any OTP — dev mode):');
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
  console.log();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
