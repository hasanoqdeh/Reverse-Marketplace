'use strict';

require('dotenv').config();

const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DATABASE_URL =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'password'}` +
  `@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}` +
  `/${process.env.DB_NAME || 'reverse_marketplace'}`;

// ─── Seed IDs (static so re-seeding is idempotent) ────────────────────────

const IDS = {
  superAdmin:  '00000000-0000-0000-0000-000000000001',
  admin1:      '00000000-0000-0000-0000-000000000002',
  admin2:      '00000000-0000-0000-0000-000000000003',
  buyer1:      '00000000-0000-0000-0000-000000000004',
  buyer2:      '00000000-0000-0000-0000-000000000005',
  merchant1:   '00000000-0000-0000-0000-000000000006',
  merchant2:   '00000000-0000-0000-0000-000000000007',

  catElectronics:   '10000000-0000-0000-0000-000000000001',
  catHomeServices:  '10000000-0000-0000-0000-000000000002',
  catFood:          '10000000-0000-0000-0000-000000000003',
  catTransport:     '10000000-0000-0000-0000-000000000004',
  catHealth:        '10000000-0000-0000-0000-000000000005',
  catEducation:     '10000000-0000-0000-0000-000000000006',
  catRepairs:       '10000000-0000-0000-0000-000000000007',
  catBeauty:        '10000000-0000-0000-0000-000000000008',
};

async function seed() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log('\n🌱 Seeding database...\n');

  try {
    // ── Users ─────────────────────────────────────────────────────

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

    // ── User Profiles ─────────────────────────────────────────────

    const profiles = [
      { userId: IDS.superAdmin, first: 'Super',   last: 'Admin',    city: 'Riyadh',  country: 'SA' },
      { userId: IDS.admin1,     first: 'Ahmad',   last: 'Al-Farsi', city: 'Dubai',   country: 'AE' },
      { userId: IDS.admin2,     first: 'Sara',    last: 'Support',  city: 'Amman',   country: 'JO' },
      { userId: IDS.buyer1,     first: 'Khalid',  last: 'Hassan',   city: 'Riyadh',  country: 'SA' },
      { userId: IDS.buyer2,     first: 'Layla',   last: 'Omar',     city: 'Cairo',   country: 'EG' },
      { userId: IDS.merchant1,  first: 'Tariq',   last: 'Merchant', city: 'Dubai',   country: 'AE' },
      { userId: IDS.merchant2,  first: 'Nour',    last: 'Seller',   city: 'Beirut',  country: 'LB' },
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

    // ── Categories ────────────────────────────────────────────────

    const categories = [
      { id: IDS.catElectronics,  name: 'Electronics',     slug: 'electronics',     desc: 'Phones, laptops, gadgets and accessories' },
      { id: IDS.catHomeServices, name: 'Home Services',   slug: 'home-services',   desc: 'Cleaning, maintenance, repairs, and installations' },
      { id: IDS.catFood,         name: 'Food & Beverages',slug: 'food-beverages',  desc: 'Catering, groceries, and food delivery' },
      { id: IDS.catTransport,    name: 'Transportation',  slug: 'transportation',  desc: 'Moving, delivery, and ride services' },
      { id: IDS.catHealth,       name: 'Health & Wellness',slug: 'health-wellness',desc: 'Medical, fitness, and wellness services' },
      { id: IDS.catEducation,    name: 'Education',       slug: 'education',       desc: 'Tutoring, courses, and training' },
      { id: IDS.catRepairs,      name: 'Repairs & Fix',   slug: 'repairs-fix',     desc: 'Car repairs, appliance fix, and technical support' },
      { id: IDS.catBeauty,       name: 'Beauty & Fashion',slug: 'beauty-fashion',  desc: 'Hair, makeup, styling, and clothing' },
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

    // ── Sample Requests ───────────────────────────────────────────

    const now = new Date();
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const requests = [
      {
        id: uuidv4(), buyerId: IDS.buyer1, categoryId: IDS.catElectronics,
        title: 'Looking for iPhone 15 Pro Max 256GB',
        description: 'I need a brand new or like-new iPhone 15 Pro Max in black. Must come with original box and accessories. Willing to pay fair market price.',
        budgetMin: 800, budgetMax: 1200,
        city: 'Riyadh', country: 'SA',
        status: 'ACTIVE', expiresAt: in3Days,
      },
      {
        id: uuidv4(), buyerId: IDS.buyer1, categoryId: IDS.catHomeServices,
        title: 'Need a professional house cleaning service',
        description: '4-bedroom villa needs deep cleaning. 2 bathrooms, large kitchen. Looking for a team that can finish within one day.',
        budgetMin: 100, budgetMax: 300,
        city: 'Riyadh', country: 'SA',
        status: 'ACTIVE', expiresAt: in7Days,
      },
      {
        id: uuidv4(), buyerId: IDS.buyer2, categoryId: IDS.catTransport,
        title: 'Moving furniture from Cairo to Alexandria',
        description: 'I have a 2-bedroom apartment worth of furniture to move. Need a truck and 2 helpers. Flexible on date within the next 2 weeks.',
        budgetMin: 200, budgetMax: 500,
        city: 'Cairo', country: 'EG',
        status: 'ACTIVE', expiresAt: in7Days,
      },
      {
        id: uuidv4(), buyerId: IDS.buyer2, categoryId: IDS.catEducation,
        title: 'Looking for a math tutor for high school student',
        description: 'My daughter is in grade 11 and needs help with calculus and algebra. Prefer online sessions 3 times per week. English or Arabic is fine.',
        budgetMin: 20, budgetMax: 50,
        city: 'Cairo', country: 'EG',
        status: 'HAS_BIDS', expiresAt: in7Days,
      },
    ];

    for (const r of requests) {
      await client.query(`
        INSERT INTO requests
          (id, buyer_id, category_id, title, description, budget_min, budget_max,
           location_city, location_country, status, priority_score, published_at, expires_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),$12)
        ON CONFLICT (id) DO NOTHING
      `, [r.id, r.buyerId, r.categoryId, r.title, r.description,
          r.budgetMin, r.budgetMax, r.city, r.country, r.status, 15, r.expiresAt]);
    }
    console.log(`  ✅ Sample requests (${requests.length})`);

    console.log('\n🎉 Seed complete!\n');
    console.log('  Test accounts:');
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
    console.log('\n  OTPs are printed to console (SMS_PROVIDER=console)\n');

  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    throw err;
  } finally {
    await client.end();
  }
}

seed().catch(() => process.exit(1));
