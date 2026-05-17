'use strict';

require('dotenv').config();

const { Client }      = require('pg');
const { v4: uuidv4 } = require('uuid');
const mongoose        = require('mongoose');
const { createClient } = require('redis');

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

// ─── Fixed IDs (idempotent re-seed) ──────────────────────────────────────────

const IDS = {
  // Users
  superAdmin: '00000000-0000-0000-0000-000000000001',
  admin1:     '00000000-0000-0000-0000-000000000002',
  buyer1:     '00000000-0000-0000-0000-000000000004',   // Khalid — posts iPhone, cleaning, MacBook
  buyer2:     '00000000-0000-0000-0000-000000000005',   // Layla  — posts tutor, moving
  merchant1:  '00000000-0000-0000-0000-000000000006',   // Tariq  — bids on iPhone, cleaning, MacBook, tutor
  merchant2:  '00000000-0000-0000-0000-000000000007',   // Nour   — bids on iPhone, cleaning, tutor

  // Categories
  catElectronics:  '10000000-0000-0000-0000-000000000001',
  catHomeServices: '10000000-0000-0000-0000-000000000002',
  catFood:         '10000000-0000-0000-0000-000000000003',
  catTransport:    '10000000-0000-0000-0000-000000000004',
  catEducation:    '10000000-0000-0000-0000-000000000006',
  catRepairs:      '10000000-0000-0000-0000-000000000007',

  // Requests  (chronological: req5 oldest → req1 newest)
  req1: '20000000-0000-0000-0000-000000000001',  // iPhone 15     — buyer1 — HAS_BIDS
  req2: '20000000-0000-0000-0000-000000000002',  // House cleaning — buyer1 — HAS_BIDS (bid accepted)
  req3: '20000000-0000-0000-0000-000000000003',  // Moving         — buyer2 — ACTIVE
  req4: '20000000-0000-0000-0000-000000000004',  // Math tutor     — buyer2 — HAS_BIDS
  req5: '20000000-0000-0000-0000-000000000005',  // MacBook repair — buyer1 — COMPLETED (bid accepted)

  // Bids
  bid1: '40000000-0000-0000-0000-000000000001',  // req1 ← merchant1 $950   PENDING
  bid2: '40000000-0000-0000-0000-000000000002',  // req1 ← merchant2 $1050  PENDING
  bid3: '40000000-0000-0000-0000-000000000003',  // req2 ← merchant1 $180   REJECTED
  bid4: '40000000-0000-0000-0000-000000000004',  // req2 ← merchant2 $250   ACCEPTED ✓
  bid5: '40000000-0000-0000-0000-000000000005',  // req4 ← merchant1 $35    PENDING
  bid6: '40000000-0000-0000-0000-000000000006',  // req4 ← merchant2 $42    PENDING
  bid7: '40000000-0000-0000-0000-000000000007',  // req5 ← merchant1 $450   ACCEPTED ✓
  bid8: '40000000-0000-0000-0000-000000000008',  // req5 ← merchant2 $520   REJECTED

  // Chat rooms
  room1: '50000000-0000-0000-0000-000000000001',  // buyer1 ↔ merchant1 about iPhone (req1)
  room2: '50000000-0000-0000-0000-000000000002',  // buyer2 ↔ merchant1 about Tutor bid (bid5)
  room3: '50000000-0000-0000-0000-000000000003',  // buyer1 ↔ merchant1 MacBook post-repair follow-up
  room4: '50000000-0000-0000-0000-000000000004',  // buyer1 ↔ admin1 support

  // Notifications
  notif1:  '61000000-0000-0000-0000-000000000001',
  notif2:  '61000000-0000-0000-0000-000000000002',
  notif3:  '61000000-0000-0000-0000-000000000003',
  notif4:  '61000000-0000-0000-0000-000000000004',
  notif5:  '61000000-0000-0000-0000-000000000005',
  notif6:  '61000000-0000-0000-0000-000000000006',
  notif7:  '61000000-0000-0000-0000-000000000007',
  notif8:  '61000000-0000-0000-0000-000000000008',
  notif9:  '61000000-0000-0000-0000-000000000009',
  notif10: '61000000-0000-0000-0000-000000000010',
  notif11: '61000000-0000-0000-0000-000000000011',
  notif12: '61000000-0000-0000-0000-000000000012',
  notif13: '61000000-0000-0000-0000-000000000013',
};

// ─────────────────────────────────────────────────────────────────────────────
// Timeline helpers
// ─────────────────────────────────────────────────────────────────────────────

function daysAgo(n)   { return new Date(Date.now() - n * 86400000); }
function daysAhead(n) { return new Date(Date.now() + n * 86400000); }
function hoursAgo(n)  { return new Date(Date.now() - n * 3600000);  }
function minsAfter(base, m) { return new Date(base.getTime() + m * 60000); }

// ─────────────────────────────────────────────────────────────────────────────
// PostgreSQL seed
// ─────────────────────────────────────────────────────────────────────────────

async function seedPostgres(pg) {

  // ── Users ──────────────────────────────────────────────────────────────────

  const users = [
    { id: IDS.superAdmin, phone: '+962780000001', role: 'ADMIN',    status: 'ACTIVE', verified: true,  subRole: 'SUPER_ADMIN' },
    { id: IDS.admin1,     phone: '+962780000002', role: 'ADMIN',    status: 'ACTIVE', verified: true,  subRole: 'ADMIN' },
    { id: IDS.buyer1,     phone: '+962780000004', role: 'BUYER',    status: 'ACTIVE', verified: true,  subRole: null },
    { id: IDS.buyer2,     phone: '+962780000005', role: 'BUYER',    status: 'ACTIVE', verified: true,  subRole: null },
    { id: IDS.merchant1,  phone: '+962780000006', role: 'MERCHANT', status: 'ACTIVE', verified: true,  subRole: null },
    { id: IDS.merchant2,  phone: '+962780000007', role: 'MERCHANT', status: 'ACTIVE', verified: true,  subRole: null },
  ];

  for (const u of users) {
    await pg.query(`
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
    { userId: IDS.superAdmin, first: 'Super',  last: 'Admin',   city: 'Amman',  country: 'JO' },
    { userId: IDS.admin1,     first: 'Ahmad',  last: 'Farsi',   city: 'Jarash', country: 'JO' },
    { userId: IDS.buyer1,     first: 'Khalid', last: 'Hassan',  city: 'Jarash', country: 'JO' },
    { userId: IDS.buyer2,     first: 'Layla',  last: 'Omar',    city: 'Amman',  country: 'JO' },
    { userId: IDS.merchant1,  first: 'Tariq',  last: 'Saleh',   city: 'Irbid',  country: 'JO' },
    { userId: IDS.merchant2,  first: 'Nour',   last: 'Khaleel', city: 'Amman',  country: 'JO' },
  ];

  for (const p of profiles) {
    await pg.query(`
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
    { id: IDS.catElectronics,  name: 'Electronics',       slug: 'electronics',     desc: 'Phones, laptops, gadgets and accessories',        sort: 0 },
    { id: IDS.catHomeServices, name: 'Home Services',     slug: 'home-services',   desc: 'Cleaning, maintenance, repairs, and installations', sort: 1 },
    { id: IDS.catFood,         name: 'Food & Beverages',  slug: 'food-beverages',  desc: 'Catering, groceries, and food delivery',           sort: 2 },
    { id: IDS.catTransport,    name: 'Transportation',    slug: 'transportation',  desc: 'Moving, delivery, and ride services',              sort: 3 },
    { id: IDS.catEducation,    name: 'Education',         slug: 'education',       desc: 'Tutoring, courses, and training',                  sort: 4 },
    { id: IDS.catRepairs,      name: 'Repairs & Fix',     slug: 'repairs-fix',     desc: 'Car repairs, appliance fix, and technical support', sort: 5 },
  ];

  for (const c of categories) {
    await pg.query(`
      INSERT INTO request_categories (id, name, slug, description, is_active, sort_order)
      VALUES ($1,$2,$3,$4,true,$5)
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
    `, [c.id, c.name, c.slug, c.desc, c.sort]);
  }
  console.log(`  ✅ Categories (${categories.length})`);

  // ── Requests ───────────────────────────────────────────────────────────────
  //
  // Sequence:
  //   Day -14: Khalid posts MacBook repair (req5) — oldest
  //   Day -10: Tariq bids $450 on req5 (bid7) → accepted → req5 = COMPLETED
  //            Nour  bids $520 on req5 (bid8) → rejected
  //   Day  -7: Layla posts math tutor (req4)
  //            Tariq bids $35 on req4 (bid5)
  //            Nour  bids $42 on req4 (bid6)
  //   Day  -5: Khalid posts house cleaning (req2)
  //            Tariq bids $180 on req2 (bid3) → rejected
  //            Nour  bids $250 on req2 (bid4) → accepted
  //   Day  -3: Khalid posts iPhone 15 (req1) — newest active
  //            Tariq bids $950  on req1 (bid1)
  //            Nour  bids $1050 on req1 (bid2)
  //   Day  -2: Layla posts moving furniture (req3) — no bids yet

  const requests = [
    {
      id: IDS.req5, buyerId: IDS.buyer1, catId: IDS.catRepairs,
      title: 'MacBook Pro screen replacement needed',
      desc:  'My MacBook Pro 14" (2023) has a cracked screen. Need a certified technician. Only original Apple parts.',
      budMin: 300, budMax: 600, city: 'Jarash', country: 'JO',
      status: 'COMPLETED', bids: 2, views: 52, score: 30,
      publishedAt: daysAgo(14), expiresAt: daysAgo(7),
    },
    {
      id: IDS.req4, buyerId: IDS.buyer2, catId: IDS.catEducation,
      title: 'Looking for a math tutor for high school student',
      desc:  'My daughter is in grade 11 and needs help with calculus and algebra. Prefer online sessions 3x/week.',
      budMin: 20, budMax: 50, city: 'Amman', country: 'JO',
      status: 'HAS_BIDS', bids: 2, views: 95, score: 25,
      publishedAt: daysAgo(7), expiresAt: daysAhead(7),
    },
    {
      id: IDS.req2, buyerId: IDS.buyer1, catId: IDS.catHomeServices,
      title: 'Need a professional house cleaning service',
      desc:  '4-bedroom villa needs deep cleaning. 2 bathrooms, large kitchen. Prefer eco-friendly products.',
      budMin: 100, budMax: 300, city: 'Jarash', country: 'JO',
      status: 'HAS_BIDS', bids: 2, views: 62, score: 15,
      publishedAt: daysAgo(5), expiresAt: daysAhead(9),
    },
    {
      id: IDS.req1, buyerId: IDS.buyer1, catId: IDS.catElectronics,
      title: 'Looking for iPhone 15 Pro Max 256GB',
      desc:  'Need a brand new or like-new iPhone 15 Pro Max in black. Original box and all accessories.',
      budMin: 800, budMax: 1200, city: 'Jarash', country: 'JO',
      status: 'HAS_BIDS', bids: 2, views: 47, score: 20,
      publishedAt: daysAgo(3), expiresAt: daysAhead(4),
    },
    {
      id: IDS.req3, buyerId: IDS.buyer2, catId: IDS.catTransport,
      title: 'Moving furniture from one apartment to another',
      desc:  '2-bedroom apartment furniture to move. Need a truck and 2 helpers. Flexible within 2 weeks.',
      budMin: 200, budMax: 500, city: 'Amman', country: 'JO',
      status: 'ACTIVE', bids: 0, views: 18, score: 5,
      publishedAt: daysAgo(2), expiresAt: daysAhead(12),
    },
  ];

  for (const r of requests) {
    await pg.query(`
      INSERT INTO requests
        (id, buyer_id, category_id, title, description, budget_min, budget_max,
         location_city, location_country, status, priority_score, bid_count, view_count,
         published_at, expires_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title, status = EXCLUDED.status,
        bid_count = EXCLUDED.bid_count, view_count = EXCLUDED.view_count
    `, [r.id, r.buyerId, r.catId, r.title, r.desc, r.budMin, r.budMax,
        r.city, r.country, r.status, r.score, r.bids, r.views,
        r.publishedAt, r.expiresAt]);
  }
  console.log(`  ✅ Requests (${requests.length})`);

  // ── Request Images ─────────────────────────────────────────────────────────

  const images = [
    { reqId: IDS.req1, url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', thumb: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200', file: 'iphone-15-pro.jpg',   size: 245000, primary: true,  sort: 0 },
    { reqId: IDS.req1, url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800', thumb: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200', file: 'iphone-box.jpg',      size: 198000, primary: false, sort: 1 },
    { reqId: IDS.req2, url: 'https://images.unsplash.com/photo-1527515637462-cff94edd56f3?w=800', thumb: 'https://images.unsplash.com/photo-1527515637462-cff94edd56f3?w=200', file: 'villa-living.jpg',    size: 312000, primary: true,  sort: 0 },
    { reqId: IDS.req5, url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', thumb: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200', file: 'macbook-crack.jpg',   size: 278000, primary: true,  sort: 0 },
  ];

  for (const img of images) {
    await pg.query(`
      INSERT INTO request_images
        (id, request_id, image_url, thumbnail_url, original_filename, file_size, mime_type, is_primary, sort_order)
      VALUES ($1,$2,$3,$4,$5,$6,'image/jpeg',$7,$8)
      ON CONFLICT (id) DO NOTHING
    `, [uuidv4(), img.reqId, img.url, img.thumb, img.file, img.size, img.primary, img.sort]);
  }
  console.log(`  ✅ Request images (${images.length})`);

  // ── Saved Searches ─────────────────────────────────────────────────────────

  const savedSearches = [
    { userId: IDS.merchant1, name: 'Electronics in Jarash', criteria: { category: IDS.catElectronics, city: 'Jarash', budgetMin: 500 } },
    { userId: IDS.merchant1, name: 'Home Services',         criteria: { category: IDS.catHomeServices, budgetMin: 100 } },
    { userId: IDS.merchant2, name: 'Education requests',    criteria: { category: IDS.catEducation, budgetMin: 15, budgetMax: 100 } },
  ];

  for (const s of savedSearches) {
    await pg.query(`
      INSERT INTO saved_searches (id, user_id, name, search_criteria, is_active)
      VALUES ($1,$2,$3,$4,true)
      ON CONFLICT (id) DO NOTHING
    `, [uuidv4(), s.userId, s.name, JSON.stringify(s.criteria)]);
  }
  console.log(`  ✅ Saved searches (${savedSearches.length})`);

  // ── Bids ───────────────────────────────────────────────────────────────────
  //
  // req5 (MacBook, day -14): bid7 merchant1 $450 ACCEPTED day-10, bid8 merchant2 $520 REJECTED day-10
  // req4 (Tutor,  day  -7): bid5 merchant1 $35  PENDING,          bid6 merchant2 $42  PENDING
  // req2 (Clean,  day  -5): bid3 merchant1 $180 REJECTED day-4,   bid4 merchant2 $250 ACCEPTED day-4
  // req1 (iPhone, day  -3): bid1 merchant1 $950 PENDING,          bid2 merchant2 $1050 PENDING

  const bids = [
    // req5 — MacBook (COMPLETED)
    { id: IDS.bid7, reqId: IDS.req5, mId: IDS.merchant1, amount: 450.00, days: 3,
      notes: 'Apple Authorized Service Provider, original parts.', terms: '90-day warranty on repair',
      status: 'ACCEPTED', score: 76, expiresAt: daysAgo(7),
      acceptedAt: daysAgo(10), rejectedAt: null, withdrawnAt: null, createdAt: daysAgo(11) },
    { id: IDS.bid8, reqId: IDS.req5, mId: IDS.merchant2, amount: 520.00, days: 5,
      notes: 'Certified technician, 3 years experience.', terms: null,
      status: 'REJECTED', score: 69, expiresAt: daysAgo(7),
      acceptedAt: null, rejectedAt: daysAgo(10), withdrawnAt: null, createdAt: daysAgo(11) },
    // req4 — Math tutor (HAS_BIDS)
    { id: IDS.bid5, reqId: IDS.req4, mId: IDS.merchant1, amount: 35.00, days: 30,
      notes: '5 years tutoring experience, flexible schedule.', terms: null,
      status: 'PENDING', score: 65, expiresAt: daysAhead(7),
      acceptedAt: null, rejectedAt: null, withdrawnAt: null, createdAt: daysAgo(7) },
    { id: IDS.bid6, reqId: IDS.req4, mId: IDS.merchant2, amount: 42.00, days: 30,
      notes: 'Certified math teacher, online sessions via Zoom.', terms: 'First session free',
      status: 'PENDING', score: 58, expiresAt: daysAhead(7),
      acceptedAt: null, rejectedAt: null, withdrawnAt: null, createdAt: daysAgo(7) },
    // req2 — House cleaning (HAS_BIDS, bid4 accepted)
    { id: IDS.bid3, reqId: IDS.req2, mId: IDS.merchant1, amount: 180.00, days: 1,
      notes: 'Professional team of 4, eco-friendly products.', terms: null,
      status: 'REJECTED', score: 82, expiresAt: daysAhead(9),
      acceptedAt: null, rejectedAt: daysAgo(4), withdrawnAt: null, createdAt: daysAgo(5) },
    { id: IDS.bid4, reqId: IDS.req2, mId: IDS.merchant2, amount: 250.00, days: 1,
      notes: 'Specialized deep cleaning with steam equipment.', terms: 'Includes all cleaning supplies',
      status: 'ACCEPTED', score: 75, expiresAt: daysAhead(9),
      acceptedAt: daysAgo(4), rejectedAt: null, withdrawnAt: null, createdAt: daysAgo(5) },
    // req1 — iPhone (HAS_BIDS, pending)
    { id: IDS.bid1, reqId: IDS.req1, mId: IDS.merchant1, amount: 950.00, days: 5,
      notes: 'Brand new sealed box, warranty included.', terms: null,
      status: 'PENDING', score: 90, expiresAt: daysAhead(4),
      acceptedAt: null, rejectedAt: null, withdrawnAt: null, createdAt: daysAgo(3) },
    { id: IDS.bid2, reqId: IDS.req1, mId: IDS.merchant2, amount: 1050.00, days: 7,
      notes: 'Like-new, purchased 2 weeks ago, full accessories.', terms: '7-day return policy',
      status: 'PENDING', score: 83, expiresAt: daysAhead(4),
      acceptedAt: null, rejectedAt: null, withdrawnAt: null, createdAt: daysAgo(3) },
  ];

  for (const b of bids) {
    await pg.query(`
      INSERT INTO bids
        (id, request_id, merchant_id, amount, delivery_days, delivery_notes, special_terms,
         status, priority_score, expires_at, accepted_at, rejected_at, withdrawn_at, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status, priority_score = EXCLUDED.priority_score,
        accepted_at = EXCLUDED.accepted_at, rejected_at = EXCLUDED.rejected_at
    `, [b.id, b.reqId, b.mId, b.amount, b.days, b.notes, b.terms,
        b.status, b.score, b.expiresAt, b.acceptedAt, b.rejectedAt, b.withdrawnAt, b.createdAt]);
  }
  console.log(`  ✅ Bids (${bids.length})`);

  // ── Chat Rooms ─────────────────────────────────────────────────────────────
  //
  // room1: buyer1 ↔ merchant1 about iPhone (req1) — both pending
  // room2: buyer2 ↔ merchant1 about Tutor bid (bid5) — pending
  // room3: buyer1 ↔ merchant1 MacBook post-repair follow-up — after bid7 accepted
  // room4: buyer1 ↔ admin1 support chat

  const rooms = [
    { id: IDS.room1, name: 'iPhone 15 — Khalid & Tariq',   desc: 'Negotiation about the iPhone request',   type: 'BID',     reqId: IDS.req1, bidId: IDS.bid1, createdBy: IDS.buyer1,   lastMsgAt: hoursAgo(3)  },
    { id: IDS.room2, name: 'Math Tutor — Layla & Tariq',   desc: 'Discussion about the tutor bid',         type: 'BID',     reqId: IDS.req4, bidId: IDS.bid5, createdBy: IDS.buyer2,   lastMsgAt: hoursAgo(1)  },
    { id: IDS.room3, name: 'MacBook Repair — Follow-up',   desc: 'Post-repair warranty support',           type: 'DIRECT',  reqId: null,     bidId: null,     createdBy: IDS.buyer1,   lastMsgAt: daysAgo(5)   },
    { id: IDS.room4, name: 'Support — Khalid Hassan',      desc: 'Customer support conversation',          type: 'SUPPORT', reqId: null,     bidId: null,     createdBy: IDS.admin1,   lastMsgAt: daysAgo(10)  },
  ];

  for (const r of rooms) {
    await pg.query(`
      INSERT INTO chat_rooms
        (id, name, description, type, related_request_id, related_bid_id, created_by, is_active, last_message_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,true,$8)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name, last_message_at = EXCLUDED.last_message_at
    `, [r.id, r.name, r.desc, r.type, r.reqId, r.bidId, r.createdBy, r.lastMsgAt]);
  }
  console.log(`  ✅ Chat rooms (${rooms.length})`);

  // ── Chat room participants ─────────────────────────────────────────────────
  const roomParticipants = [
    { roomId: IDS.room1, userId: IDS.buyer1,   role: 'OWNER'  },
    { roomId: IDS.room1, userId: IDS.merchant1, role: 'MEMBER' },
    { roomId: IDS.room2, userId: IDS.buyer2,   role: 'OWNER'  },
    { roomId: IDS.room2, userId: IDS.merchant1, role: 'MEMBER' },
    { roomId: IDS.room3, userId: IDS.buyer1,   role: 'OWNER'  },
    { roomId: IDS.room3, userId: IDS.merchant1, role: 'MEMBER' },
    { roomId: IDS.room4, userId: IDS.admin1,   role: 'OWNER'  },
    { roomId: IDS.room4, userId: IDS.buyer1,   role: 'MEMBER' },
  ];

  for (const p of roomParticipants) {
    await pg.query(`
      INSERT INTO chat_room_participants (room_id, user_id, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (room_id, user_id) DO NOTHING
    `, [p.roomId, p.userId, p.role]);
  }
  console.log(`  ✅ Chat room participants (${roomParticipants.length})`);

  // ── Notifications ──────────────────────────────────────────────────────────
  //
  // Sequence (driven by the bids/messages timeline):
  //
  //   Day -11: merchant1 bids on req5 → buyer1 gets BID_PLACED (bid7)      [READ]
  //            merchant2 bids on req5 → buyer1 gets BID_PLACED (bid8)      [READ]
  //   Day -10: bid7 accepted → merchant1 gets BID_ACCEPTED                  [READ]
  //   Day  -7: merchant1 bids on req4 → buyer2 gets BID_PLACED (bid5)      [READ]
  //            merchant2 bids on req4 → buyer2 gets BID_PLACED (bid6)      [READ]
  //   Day  -5: merchant1 bids on req2 → buyer1 gets BID_PLACED (bid3)      [READ]
  //            merchant2 bids on req2 → buyer1 gets BID_PLACED (bid4)      [READ]
  //   Day  -4: bid4 accepted → merchant2 gets BID_ACCEPTED                  [READ]
  //   Day  -3: merchant1 bids on req1 → buyer1 gets BID_PLACED (bid1)      [READ]
  //            merchant2 bids on req1 → buyer1 gets BID_PLACED (bid2)      [READ]
  //   3 h ago: merchant1 sent msg in room1 → buyer1 gets NEW_MESSAGE        [UNREAD]
  //   1 h ago: buyer2 sent msg in room2   → merchant1 gets NEW_MESSAGE      [UNREAD]
  //   1 h ago: merchant1 sent msg in room2 → buyer2 gets NEW_MESSAGE        [UNREAD]

  const notifications = [
    // ── buyer1 (Khalid) ──────────────────────────────────────────────────────
    {
      id: IDS.notif1, userId: IDS.buyer1, type: 'BID_PLACED',
      title: 'New bid on your request',
      body:  'Tariq bid $450 on "MacBook Pro screen replacement needed".',
      data:  { bidId: IDS.bid7, requestId: IDS.req5, requestTitle: 'MacBook Pro screen replacement needed' },
      isRead: true, createdAt: daysAgo(11),
    },
    {
      id: IDS.notif2, userId: IDS.buyer1, type: 'BID_PLACED',
      title: 'New bid on your request',
      body:  'Nour bid $520 on "MacBook Pro screen replacement needed".',
      data:  { bidId: IDS.bid8, requestId: IDS.req5, requestTitle: 'MacBook Pro screen replacement needed' },
      isRead: true, createdAt: daysAgo(11),
    },
    {
      id: IDS.notif3, userId: IDS.buyer1, type: 'BID_PLACED',
      title: 'New bid on your request',
      body:  'Tariq bid $180 on "Need a professional house cleaning service".',
      data:  { bidId: IDS.bid3, requestId: IDS.req2, requestTitle: 'Need a professional house cleaning service' },
      isRead: true, createdAt: daysAgo(5),
    },
    {
      id: IDS.notif4, userId: IDS.buyer1, type: 'BID_PLACED',
      title: 'New bid on your request',
      body:  'Nour bid $250 on "Need a professional house cleaning service".',
      data:  { bidId: IDS.bid4, requestId: IDS.req2, requestTitle: 'Need a professional house cleaning service' },
      isRead: true, createdAt: daysAgo(5),
    },
    {
      id: IDS.notif5, userId: IDS.buyer1, type: 'BID_PLACED',
      title: 'New bid on your request',
      body:  'Tariq bid $950 on "Looking for iPhone 15 Pro Max 256GB".',
      data:  { bidId: IDS.bid1, requestId: IDS.req1, requestTitle: 'Looking for iPhone 15 Pro Max 256GB' },
      isRead: true, createdAt: daysAgo(3),
    },
    {
      id: IDS.notif6, userId: IDS.buyer1, type: 'BID_PLACED',
      title: 'New bid on your request',
      body:  'Nour bid $1050 on "Looking for iPhone 15 Pro Max 256GB".',
      data:  { bidId: IDS.bid2, requestId: IDS.req1, requestTitle: 'Looking for iPhone 15 Pro Max 256GB' },
      isRead: true, createdAt: daysAgo(3),
    },
    {
      id: IDS.notif7, userId: IDS.buyer1, type: 'NEW_MESSAGE',
      title: 'New message',
      body:  'Tariq sent you a message about "iPhone 15 — Khalid & Tariq".',
      data:  { chatRoomId: IDS.room1, roomName: 'iPhone 15 — Khalid & Tariq' },
      isRead: false, createdAt: hoursAgo(3),
    },

    // ── buyer2 (Layla) ───────────────────────────────────────────────────────
    {
      id: IDS.notif8, userId: IDS.buyer2, type: 'BID_PLACED',
      title: 'New bid on your request',
      body:  'Tariq bid $35 on "Looking for a math tutor for high school student".',
      data:  { bidId: IDS.bid5, requestId: IDS.req4, requestTitle: 'Looking for a math tutor for high school student' },
      isRead: true, createdAt: daysAgo(7),
    },
    {
      id: IDS.notif9, userId: IDS.buyer2, type: 'BID_PLACED',
      title: 'New bid on your request',
      body:  'Nour bid $42 on "Looking for a math tutor for high school student".',
      data:  { bidId: IDS.bid6, requestId: IDS.req4, requestTitle: 'Looking for a math tutor for high school student' },
      isRead: true, createdAt: daysAgo(7),
    },
    {
      id: IDS.notif10, userId: IDS.buyer2, type: 'NEW_MESSAGE',
      title: 'New message',
      body:  'Tariq sent you a message about "Math Tutor — Layla & Tariq".',
      data:  { chatRoomId: IDS.room2, roomName: 'Math Tutor — Layla & Tariq' },
      isRead: false, createdAt: hoursAgo(1),
    },

    // ── merchant1 (Tariq) ────────────────────────────────────────────────────
    {
      id: IDS.notif11, userId: IDS.merchant1, type: 'BID_ACCEPTED',
      title: 'Your bid was accepted!',
      body:  'Your bid of $450 on "MacBook Pro screen replacement needed" was accepted.',
      data:  { bidId: IDS.bid7, requestId: IDS.req5 },
      isRead: true, createdAt: daysAgo(10),
    },
    {
      id: IDS.notif12, userId: IDS.merchant1, type: 'NEW_MESSAGE',
      title: 'New message',
      body:  'Layla sent you a message about "Math Tutor — Layla & Tariq".',
      data:  { chatRoomId: IDS.room2, roomName: 'Math Tutor — Layla & Tariq' },
      isRead: false, createdAt: hoursAgo(1),
    },

    // ── merchant2 (Nour) ─────────────────────────────────────────────────────
    {
      id: IDS.notif13, userId: IDS.merchant2, type: 'BID_ACCEPTED',
      title: 'Your bid was accepted!',
      body:  'Your bid of $250 on "Need a professional house cleaning service" was accepted.',
      data:  { bidId: IDS.bid4, requestId: IDS.req2 },
      isRead: true, createdAt: daysAgo(4),
    },
  ];

  for (const n of notifications) {
    await pg.query(`
      INSERT INTO notifications (id, user_id, type, title, body, data, is_read, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title, body = EXCLUDED.body,
        is_read = EXCLUDED.is_read
    `, [n.id, n.userId, n.type, n.title, n.body,
        JSON.stringify(n.data), n.isRead, n.createdAt]);
  }
  console.log(`  ✅ Notifications (${notifications.length})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// MongoDB seed
// ─────────────────────────────────────────────────────────────────────────────

async function seedMongo() {

  // ── Chat Messages ──────────────────────────────────────────────────────────
  //
  // room1 (buyer1 ↔ merchant1, iPhone):    8 messages, last 3h ago
  // room2 (buyer2 ↔ merchant1, Tutor):     8 messages, last 1h ago
  // room3 (buyer1 ↔ merchant1, MacBook):   6 messages, 5 days ago
  // room4 (buyer1 ↔ admin1, Support):      7 messages, 10 days ago

  await ChatMessage.deleteMany({
    roomId: { $in: [IDS.room1, IDS.room2, IDS.room3, IDS.room4] },
  });

  const t1base = daysAgo(3);   // room1 starts 3 days ago
  const t2base = daysAgo(7);   // room2 starts 7 days ago
  const t3base = daysAgo(14);  // room3 starts 14 days ago (after MacBook repair accepted)
  const t4base = daysAgo(12);  // room4 — support chat

  const chatMessages = [
    // ── room1: iPhone negotiation (buyer1 Khalid ↔ merchant1 Tariq) ──────────
    { roomId: IDS.room1, senderId: IDS.buyer1,    type: 'TEXT', content: 'Hi Tariq! I saw your bid on my iPhone request. Is the phone still available?',            createdAt: minsAfter(t1base, 0),   readBy: [{ userId: IDS.merchant1, readAt: minsAfter(t1base, 5)   }] },
    { roomId: IDS.room1, senderId: IDS.merchant1, type: 'TEXT', content: 'Hello Khalid! Yes, 100% available. Sealed box, never opened.',                             createdAt: minsAfter(t1base, 8),   readBy: [{ userId: IDS.buyer1,    readAt: minsAfter(t1base, 10)  }] },
    { roomId: IDS.room1, senderId: IDS.buyer1,    type: 'TEXT', content: 'Great! Does it come with a receipt so I can verify the purchase date?',                    createdAt: minsAfter(t1base, 15),  readBy: [{ userId: IDS.merchant1, readAt: minsAfter(t1base, 20)  }] },
    { roomId: IDS.room1, senderId: IDS.merchant1, type: 'TEXT', content: 'Yes, original receipt. Purchased 3 weeks ago from the Apple Store in Amman.',               createdAt: minsAfter(t1base, 25),  readBy: [{ userId: IDS.buyer1,    readAt: minsAfter(t1base, 30)  }] },
    { roomId: IDS.room1, senderId: IDS.merchant1, type: 'TEXT', content: 'I can also send you the IMEI check result if needed.',                                      createdAt: minsAfter(t1base, 27),  readBy: [{ userId: IDS.buyer1,    readAt: minsAfter(t1base, 30)  }], reactions: [{ userId: IDS.buyer1, reactionType: '👍', createdAt: minsAfter(t1base, 31) }] },
    { roomId: IDS.room1, senderId: IDS.buyer1,    type: 'TEXT', content: 'Perfect! Can we meet in Jarash this Saturday at 11 AM?',                                    createdAt: hoursAgo(6),            readBy: [{ userId: IDS.merchant1, readAt: hoursAgo(5)            }] },
    { roomId: IDS.room1, senderId: IDS.merchant1, type: 'TEXT', content: 'Saturday works. City centre at 11 AM sounds good!',                                         createdAt: hoursAgo(4),            readBy: [{ userId: IDS.buyer1,    readAt: hoursAgo(3.5)          }] },
    { roomId: IDS.room1, senderId: IDS.merchant1, type: 'TEXT', content: 'See you then! 🤝',                                                                          createdAt: hoursAgo(3),            readBy: [] },

    // ── room2: Math tutor bid (buyer2 Layla ↔ merchant1 Tariq) ───────────────
    { roomId: IDS.room2, senderId: IDS.buyer2,    type: 'TEXT', content: 'Hi! I am interested in your bid for math tutoring. My daughter is in grade 11.',            createdAt: minsAfter(t2base, 0),   readBy: [{ userId: IDS.merchant1, readAt: minsAfter(t2base, 10)  }] },
    { roomId: IDS.room2, senderId: IDS.merchant1, type: 'TEXT', content: 'Hello Layla! I have 5 years of experience with calculus and algebra. Happy to share my approach.', createdAt: minsAfter(t2base, 15), readBy: [{ userId: IDS.buyer2, readAt: minsAfter(t2base, 20) }] },
    { roomId: IDS.room2, senderId: IDS.buyer2,    type: 'TEXT', content: 'She struggles mainly with integration and limits. Can you cover those?',                    createdAt: minsAfter(t2base, 25),  readBy: [{ userId: IDS.merchant1, readAt: minsAfter(t2base, 30)  }] },
    { roomId: IDS.room2, senderId: IDS.merchant1, type: 'TEXT', content: 'Absolutely. Those are core Grade 11 topics. We can cover them in the first 3 sessions.',   createdAt: minsAfter(t2base, 35),  readBy: [{ userId: IDS.buyer2,    readAt: minsAfter(t2base, 40)  }] },
    { roomId: IDS.room2, senderId: IDS.buyer2,    type: 'TEXT', content: 'That sounds great. Is $35 per session your final price?',                                   createdAt: daysAgo(3),             readBy: [{ userId: IDS.merchant1, readAt: daysAgo(2)             }] },
    { roomId: IDS.room2, senderId: IDS.merchant1, type: 'TEXT', content: 'Yes. And the first session is a free trial so she can decide if it works for her.',         createdAt: daysAgo(2),             readBy: [{ userId: IDS.buyer2,    readAt: daysAgo(1)             }], reactions: [{ userId: IDS.buyer2, reactionType: '❤️', createdAt: daysAgo(1) }] },
    { roomId: IDS.room2, senderId: IDS.buyer2,    type: 'TEXT', content: 'That is very kind! When can we start?',                                                     createdAt: hoursAgo(2),            readBy: [{ userId: IDS.merchant1, readAt: hoursAgo(1.5)          }] },
    { roomId: IDS.room2, senderId: IDS.merchant1, type: 'TEXT', content: 'I can start this Sunday. I will send a Zoom link before the session. 📚',                   createdAt: hoursAgo(1),            readBy: [] },

    // ── room3: MacBook post-repair (buyer1 Khalid ↔ merchant1 Tariq) ─────────
    { roomId: IDS.room3, senderId: IDS.buyer1,    type: 'TEXT', content: 'Hey Tariq, quick question — is the screen still under your 90-day warranty?',              createdAt: minsAfter(t3base, 0),   readBy: [{ userId: IDS.merchant1, readAt: minsAfter(t3base, 15)  }] },
    { roomId: IDS.room3, senderId: IDS.merchant1, type: 'TEXT', content: 'Of course! Any defect in the replaced screen is covered for 90 days. What happened?',      createdAt: minsAfter(t3base, 20),  readBy: [{ userId: IDS.buyer1,    readAt: minsAfter(t3base, 25)  }] },
    { roomId: IDS.room3, senderId: IDS.buyer1,    type: 'TEXT', content: 'There is a small backlight bleed on the bottom left corner.',                              createdAt: minsAfter(t3base, 30),  readBy: [{ userId: IDS.merchant1, readAt: minsAfter(t3base, 35)  }] },
    { roomId: IDS.room3, senderId: IDS.merchant1, type: 'TEXT', content: 'Minor backlight bleed is within Apple spec. But bring it in and I will check it for free.', createdAt: minsAfter(t3base, 40), readBy: [{ userId: IDS.buyer1,   readAt: minsAfter(t3base, 45)  }] },
    { roomId: IDS.room3, senderId: IDS.buyer1,    type: 'TEXT', content: 'Thank you! Really appreciate the quick response. Will come tomorrow.',                      createdAt: minsAfter(t3base, 50),  readBy: [{ userId: IDS.merchant1, readAt: minsAfter(t3base, 55)  }] },
    { roomId: IDS.room3, senderId: IDS.merchant1, type: 'TEXT', content: 'No problem at all. See you tomorrow! 🔧',                                                   createdAt: minsAfter(t3base, 60),  readBy: [{ userId: IDS.buyer1,    readAt: minsAfter(t3base, 65)  }] },

    // ── room4: Support chat (buyer1 Khalid ↔ admin1 Ahmad) ───────────────────
    { roomId: IDS.room4, senderId: IDS.buyer1,    type: 'TEXT',   content: 'Hello support team, I have a question about the bidding process.',                       createdAt: minsAfter(t4base, 0),   readBy: [{ userId: IDS.admin1,  readAt: minsAfter(t4base, 5)   }] },
    { roomId: IDS.room4, senderId: IDS.admin1,    type: 'TEXT',   content: 'Hello Khalid! Happy to help. What is your question?',                                    createdAt: minsAfter(t4base, 10),  readBy: [{ userId: IDS.buyer1,  readAt: minsAfter(t4base, 15)  }] },
    { roomId: IDS.room4, senderId: IDS.buyer1,    type: 'TEXT',   content: 'Can I accept a bid after my request expires?',                                            createdAt: minsAfter(t4base, 20),  readBy: [{ userId: IDS.admin1,  readAt: minsAfter(t4base, 25)  }] },
    { roomId: IDS.room4, senderId: IDS.admin1,    type: 'TEXT',   content: 'No — you need to extend the request first, then accept. Extensions are free, up to 3 times.', createdAt: minsAfter(t4base, 30), readBy: [{ userId: IDS.buyer1, readAt: minsAfter(t4base, 35) }] },
    { roomId: IDS.room4, senderId: IDS.buyer1,    type: 'TEXT',   content: 'Got it. Is there a fee for extending?',                                                   createdAt: minsAfter(t4base, 40),  readBy: [{ userId: IDS.admin1,  readAt: minsAfter(t4base, 45)  }] },
    { roomId: IDS.room4, senderId: IDS.admin1,    type: 'SYSTEM', content: 'Extensions are free. You can extend up to 3 times, 7 days each.',                        createdAt: minsAfter(t4base, 50),  readBy: [{ userId: IDS.buyer1,  readAt: minsAfter(t4base, 55)  }], reactions: [{ userId: IDS.buyer1, reactionType: '🙏', createdAt: minsAfter(t4base, 56) }] },
    { roomId: IDS.room4, senderId: IDS.buyer1,    type: 'TEXT',   content: 'That is very helpful, thank you!',                                                        createdAt: minsAfter(t4base, 60),  readBy: [{ userId: IDS.admin1,  readAt: minsAfter(t4base, 65)  }] },
  ];

  await ChatMessage.insertMany(chatMessages);
  console.log(`  ✅ Chat messages (${chatMessages.length}) [MongoDB]`);

  // ── Activity Logs ──────────────────────────────────────────────────────────

  await ActivityLog.deleteMany({ 'metadata.seeded': true });

  const activityLogs = [
    // Registrations
    { actorId: IDS.buyer1,    actorRole: 'BUYER',    eventType: 'user.registered', category: 'identity', action: 'User registered', targetType: 'user',    targetId: IDS.buyer1,    metadata: { seeded: true }, createdAt: daysAgo(30) },
    { actorId: IDS.buyer2,    actorRole: 'BUYER',    eventType: 'user.registered', category: 'identity', action: 'User registered', targetType: 'user',    targetId: IDS.buyer2,    metadata: { seeded: true }, createdAt: daysAgo(28) },
    { actorId: IDS.merchant1, actorRole: 'MERCHANT', eventType: 'user.registered', category: 'identity', action: 'User registered', targetType: 'user',    targetId: IDS.merchant1, metadata: { seeded: true }, createdAt: daysAgo(30) },
    { actorId: IDS.merchant2, actorRole: 'MERCHANT', eventType: 'user.registered', category: 'identity', action: 'User registered', targetType: 'user',    targetId: IDS.merchant2, metadata: { seeded: true }, createdAt: daysAgo(25) },
    // Logins
    { actorId: IDS.buyer1,    actorRole: 'BUYER',    eventType: 'user.logined',    category: 'identity', action: 'User logged in',  targetType: 'user',    targetId: IDS.buyer1,    metadata: { seeded: true }, createdAt: daysAgo(1)  },
    { actorId: IDS.buyer2,    actorRole: 'BUYER',    eventType: 'user.logined',    category: 'identity', action: 'User logged in',  targetType: 'user',    targetId: IDS.buyer2,    metadata: { seeded: true }, createdAt: daysAgo(2)  },
    { actorId: IDS.merchant1, actorRole: 'MERCHANT', eventType: 'user.logined',    category: 'identity', action: 'User logged in',  targetType: 'user',    targetId: IDS.merchant1, metadata: { seeded: true }, createdAt: daysAgo(1)  },
    { actorId: IDS.superAdmin,actorRole: 'ADMIN',    eventType: 'user.logined',    category: 'identity', action: 'User logged in',  targetType: 'user',    targetId: IDS.superAdmin, metadata: { seeded: true }, createdAt: daysAgo(1) },
    // Requests
    { actorId: IDS.buyer1,    actorRole: 'BUYER',    eventType: 'request.created', category: 'requests', action: 'Request created', targetType: 'request', targetId: IDS.req5, metadata: { requestId: IDS.req5, title: 'MacBook repair',  seeded: true }, createdAt: daysAgo(14) },
    { actorId: IDS.buyer2,    actorRole: 'BUYER',    eventType: 'request.created', category: 'requests', action: 'Request created', targetType: 'request', targetId: IDS.req4, metadata: { requestId: IDS.req4, title: 'Math tutor',       seeded: true }, createdAt: daysAgo(7)  },
    { actorId: IDS.buyer1,    actorRole: 'BUYER',    eventType: 'request.created', category: 'requests', action: 'Request created', targetType: 'request', targetId: IDS.req2, metadata: { requestId: IDS.req2, title: 'House cleaning',    seeded: true }, createdAt: daysAgo(5)  },
    { actorId: IDS.buyer1,    actorRole: 'BUYER',    eventType: 'request.created', category: 'requests', action: 'Request created', targetType: 'request', targetId: IDS.req1, metadata: { requestId: IDS.req1, title: 'iPhone 15 Pro Max', seeded: true }, createdAt: daysAgo(3)  },
    { actorId: IDS.buyer2,    actorRole: 'BUYER',    eventType: 'request.created', category: 'requests', action: 'Request created', targetType: 'request', targetId: IDS.req3, metadata: { requestId: IDS.req3, title: 'Moving furniture',  seeded: true }, createdAt: daysAgo(2)  },
    // Bids
    { actorId: IDS.merchant1, actorRole: 'MERCHANT', eventType: 'bid.submitted',   category: 'requests', action: 'Bid submitted',   targetType: 'request', targetId: IDS.req5, metadata: { bidId: IDS.bid7, amount: 450,  seeded: true }, createdAt: daysAgo(11) },
    { actorId: IDS.merchant2, actorRole: 'MERCHANT', eventType: 'bid.submitted',   category: 'requests', action: 'Bid submitted',   targetType: 'request', targetId: IDS.req5, metadata: { bidId: IDS.bid8, amount: 520,  seeded: true }, createdAt: daysAgo(11) },
    { actorId: IDS.merchant1, actorRole: 'MERCHANT', eventType: 'bid.accepted',    category: 'requests', action: 'Bid accepted',    targetType: 'request', targetId: IDS.req5, metadata: { bidId: IDS.bid7, amount: 450,  seeded: true }, createdAt: daysAgo(10) },
    { actorId: IDS.merchant2, actorRole: 'MERCHANT', eventType: 'bid.submitted',   category: 'requests', action: 'Bid submitted',   targetType: 'request', targetId: IDS.req4, metadata: { bidId: IDS.bid5, amount: 35,   seeded: true }, createdAt: daysAgo(7)  },
    { actorId: IDS.merchant1, actorRole: 'MERCHANT', eventType: 'bid.submitted',   category: 'requests', action: 'Bid submitted',   targetType: 'request', targetId: IDS.req2, metadata: { bidId: IDS.bid3, amount: 180,  seeded: true }, createdAt: daysAgo(5)  },
    { actorId: IDS.merchant2, actorRole: 'MERCHANT', eventType: 'bid.submitted',   category: 'requests', action: 'Bid submitted',   targetType: 'request', targetId: IDS.req2, metadata: { bidId: IDS.bid4, amount: 250,  seeded: true }, createdAt: daysAgo(5)  },
    { actorId: IDS.merchant2, actorRole: 'MERCHANT', eventType: 'bid.accepted',    category: 'requests', action: 'Bid accepted',    targetType: 'request', targetId: IDS.req2, metadata: { bidId: IDS.bid4, amount: 250,  seeded: true }, createdAt: daysAgo(4)  },
    { actorId: IDS.merchant1, actorRole: 'MERCHANT', eventType: 'bid.submitted',   category: 'requests', action: 'Bid submitted',   targetType: 'request', targetId: IDS.req1, metadata: { bidId: IDS.bid1, amount: 950,  seeded: true }, createdAt: daysAgo(3)  },
    { actorId: IDS.merchant2, actorRole: 'MERCHANT', eventType: 'bid.submitted',   category: 'requests', action: 'Bid submitted',   targetType: 'request', targetId: IDS.req1, metadata: { bidId: IDS.bid2, amount: 1050, seeded: true }, createdAt: daysAgo(3)  },
  ];

  await ActivityLog.insertMany(activityLogs);
  console.log(`  ✅ Activity logs (${activityLogs.length}) [MongoDB]`);

  // ── Request Analytics ──────────────────────────────────────────────────────

  await RequestAnalytic.deleteMany({ 'metadata.seeded': true });

  const reqAnalytics = [
    { requestId: IDS.req5, eventType: 'STATUS_CHANGE', userId: IDS.buyer1, metadata: { status: 'ACTIVE',    seeded: true }, createdAt: daysAgo(14) },
    { requestId: IDS.req5, eventType: 'STATUS_CHANGE', userId: IDS.buyer1, metadata: { status: 'HAS_BIDS',  seeded: true }, createdAt: daysAgo(11) },
    { requestId: IDS.req5, eventType: 'COMPLETED',     userId: IDS.buyer1, metadata: { acceptedBidId: IDS.bid7, seeded: true }, createdAt: daysAgo(10) },
    { requestId: IDS.req4, eventType: 'STATUS_CHANGE', userId: IDS.buyer2, metadata: { status: 'ACTIVE',    seeded: true }, createdAt: daysAgo(7)  },
    { requestId: IDS.req4, eventType: 'STATUS_CHANGE', userId: IDS.buyer2, metadata: { status: 'HAS_BIDS',  seeded: true }, createdAt: daysAgo(7)  },
    { requestId: IDS.req2, eventType: 'STATUS_CHANGE', userId: IDS.buyer1, metadata: { status: 'ACTIVE',    seeded: true }, createdAt: daysAgo(5)  },
    { requestId: IDS.req2, eventType: 'STATUS_CHANGE', userId: IDS.buyer1, metadata: { status: 'HAS_BIDS',  seeded: true }, createdAt: daysAgo(5)  },
    { requestId: IDS.req1, eventType: 'STATUS_CHANGE', userId: IDS.buyer1, metadata: { status: 'ACTIVE',    seeded: true }, createdAt: daysAgo(3)  },
    { requestId: IDS.req1, eventType: 'STATUS_CHANGE', userId: IDS.buyer1, metadata: { status: 'HAS_BIDS',  seeded: true }, createdAt: daysAgo(3)  },
    { requestId: IDS.req3, eventType: 'STATUS_CHANGE', userId: IDS.buyer2, metadata: { status: 'ACTIVE',    seeded: true }, createdAt: daysAgo(2)  },
  ];

  await RequestAnalytic.insertMany(reqAnalytics);
  console.log(`  ✅ Request analytics (${reqAnalytics.length}) [MongoDB]`);

  // ── Request Views ──────────────────────────────────────────────────────────

  await RequestView.deleteMany({ requestId: { $in: Object.values(IDS).filter(id => id.startsWith('200')) } });

  const views = [
    { requestId: IDS.req5, userId: IDS.merchant1, ipAddress: '192.168.1.10', viewedAt: daysAgo(13) },
    { requestId: IDS.req5, userId: IDS.merchant2, ipAddress: '192.168.1.11', viewedAt: daysAgo(13) },
    { requestId: IDS.req4, userId: IDS.merchant1, ipAddress: '192.168.1.10', viewedAt: daysAgo(7)  },
    { requestId: IDS.req4, userId: IDS.merchant2, ipAddress: '192.168.1.11', viewedAt: daysAgo(7)  },
    { requestId: IDS.req4, userId: null,           ipAddress: '10.0.0.1',     viewedAt: daysAgo(5)  },
    { requestId: IDS.req2, userId: IDS.merchant1, ipAddress: '192.168.1.10', viewedAt: daysAgo(5)  },
    { requestId: IDS.req2, userId: IDS.merchant2, ipAddress: '192.168.1.11', viewedAt: daysAgo(4)  },
    { requestId: IDS.req1, userId: IDS.merchant1, ipAddress: '192.168.1.10', viewedAt: daysAgo(3)  },
    { requestId: IDS.req1, userId: IDS.merchant2, ipAddress: '192.168.1.11', viewedAt: daysAgo(3)  },
    { requestId: IDS.req1, userId: null,           ipAddress: '10.0.0.2',     viewedAt: daysAgo(2)  },
    { requestId: IDS.req3, userId: IDS.merchant1, ipAddress: '192.168.1.10', viewedAt: daysAgo(1)  },
  ];

  await RequestView.insertMany(views);
  console.log(`  ✅ Request views (${views.length}) [MongoDB]`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry point
// ─────────────────────────────────────────────────────────────────────────────

async function flushRedis() {
  const url = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;
  const redis = createClient({ url });
  try {
    await redis.connect();
    await redis.flushAll();
    console.log('  ✅ Redis cache flushed\n');
  } catch (err) {
    console.warn('  ⚠️  Redis flush skipped:', err.message, '\n');
  } finally {
    await redis.quit().catch(() => {});
  }
}

async function seed() {
  console.log('\n🗑️  Flushing Redis cache...\n');
  await flushRedis();

  const pg = new Client({ connectionString: DATABASE_URL });
  await pg.connect();

  console.log('\n🌱 Seeding PostgreSQL...\n');
  try {
    await seedPostgres(pg);
  } catch (err) {
    console.error('\n❌ PostgreSQL seed failed:', err.message);
    throw err;
  } finally {
    await pg.end();
  }

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

  console.log('\n🎉 Seed complete!\n');
  console.log('  Story:');
  console.log('    Day-14  Khalid posts MacBook repair → Tariq bids $450 (accepted), Nour bids $520 (rejected)');
  console.log('    Day -7  Layla posts Math tutor      → Tariq bids $35, Nour bids $42 (both pending)');
  console.log('    Day -5  Khalid posts House cleaning → Tariq bids $180 (rejected), Nour bids $250 (accepted)');
  console.log('    Day -3  Khalid posts iPhone 15      → Tariq bids $950, Nour bids $1050 (both pending)');
  console.log('    Day -2  Layla posts Moving          → no bids yet');
  console.log('    Now     3 active chat rooms with full conversation histories');
  console.log();
  console.log('  Test accounts (any OTP — dev mode):');
  console.log('  ┌─────────────────────┬────────────┬─────────────────────────────┐');
  console.log('  │ Phone               │ Role       │ Name                        │');
  console.log('  ├─────────────────────┼────────────┼─────────────────────────────┤');
  console.log('  │ +962780000001       │ ADMIN      │ Super Admin                 │');
  console.log('  │ +962780000002       │ ADMIN      │ Ahmad Farsi                 │');
  console.log('  │ +962780000004       │ BUYER      │ Khalid Hassan (3 requests)  │');
  console.log('  │ +962780000005       │ BUYER      │ Layla Omar   (2 requests)   │');
  console.log('  │ +962780000006       │ MERCHANT   │ Tariq Saleh  (bids on all)  │');
  console.log('  │ +962780000007       │ MERCHANT   │ Nour Khaleel (bids on all)  │');
  console.log('  └─────────────────────┴────────────┴─────────────────────────────┘');
  console.log();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
