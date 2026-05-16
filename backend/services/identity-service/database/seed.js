'use strict';

require('dotenv').config();

const prisma = require('../prisma/client');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function hoursAgo(n) {
  return new Date(Date.now() - n * 60 * 60 * 1000);
}

// ─── Static IDs (shared with request-service and all future services) ─────────
//
// These UUIDs are fixed across all service seeds so cross-service references
// (e.g. buyer_id in requests table) always resolve to real users.

const ADMIN_IDS = {
  superAdmin: 'a0000000-0000-0000-0000-000000000001',
  admin:      'a0000000-0000-0000-0000-000000000002',
  support1:   'a0000000-0000-0000-0000-000000000003',
  support2:   'a0000000-0000-0000-0000-000000000004',
};

const BUYER_IDS = {
  mohammed: 'b1000000-0000-0000-0000-000000000001',
  layla:    'b1000000-0000-0000-0000-000000000002',
  khaled:   'b1000000-0000-0000-0000-000000000003',
  rania:    'b1000000-0000-0000-0000-000000000004',
  tariq:    'b1000000-0000-0000-0000-000000000005',
  hana:     'b1000000-0000-0000-0000-000000000006',
  ziad:     'b1000000-0000-0000-0000-000000000007',
  nour:     'b1000000-0000-0000-0000-000000000008',
  faris:    'b1000000-0000-0000-0000-000000000009',
  maha:     'b1000000-0000-0000-0000-000000000010',
  bilal:    'b1000000-0000-0000-0000-000000000011',
  dina:     'b1000000-0000-0000-0000-000000000012',
  wael:     'b1000000-0000-0000-0000-000000000013',
  rana:     'b1000000-0000-0000-0000-000000000014',
  sami:     'b1000000-0000-0000-0000-000000000015',
};

const MERCHANT_IDS = {
  hassan:  'c2000000-0000-0000-0000-000000000001',
  fatima:  'c2000000-0000-0000-0000-000000000002',
  majed:   'c2000000-0000-0000-0000-000000000003',
  suha:    'c2000000-0000-0000-0000-000000000004',
  adnan:   'c2000000-0000-0000-0000-000000000005',
  lina:    'c2000000-0000-0000-0000-000000000006',
  rami:    'c2000000-0000-0000-0000-000000000007',
  yasmin:  'c2000000-0000-0000-0000-000000000008',
  imad:    'c2000000-0000-0000-0000-000000000009',
  ghada:   'c2000000-0000-0000-0000-000000000010',
  nidal:   'c2000000-0000-0000-0000-000000000011',
  manal:   'c2000000-0000-0000-0000-000000000012',
};

// ─── Upsert helper (idempotent — safe to re-run) ──────────────────────────────

async function upsertUser({ id, phone, role, status, adminSubRole, firstName, lastName, city, country, createdAt, lastLoginAt }) {
  // Check by static ID first (fast path on re-runs)
  const byId = await prisma.user.findUnique({ where: { id } });
  if (byId) return byId;

  // Check by phone (handles the case of a prior run without static IDs)
  const byPhone = await prisma.user.findUnique({ where: { phone } });
  if (byPhone) return byPhone;

  return prisma.user.create({
    data: {
      id,
      phone,
      role,
      status: status || 'ACTIVE',
      phoneVerified: true,
      adminSubRole: adminSubRole || null,
      createdAt: createdAt || new Date(),
      lastLoginAt: lastLoginAt || null,
      profile: {
        create: {
          firstName,
          lastName,
          city: city || null,
          country: country || null,
        },
      },
    },
  });
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const admins = [
  { id: ADMIN_IDS.superAdmin, phone: '+962790000000', role: 'ADMIN', adminSubRole: 'SUPER_ADMIN', firstName: 'Super',  lastName: 'Admin',  createdAt: daysAgo(120), lastLoginAt: hoursAgo(1) },
  { id: ADMIN_IDS.admin,      phone: '+962791000001', role: 'ADMIN', adminSubRole: 'ADMIN',       firstName: 'Ahmad',  lastName: 'Khalil', city: 'Amman', country: 'JO', createdAt: daysAgo(90), lastLoginAt: daysAgo(1) },
  { id: ADMIN_IDS.support1,   phone: '+962792000002', role: 'ADMIN', adminSubRole: 'SUPPORT',     firstName: 'Sara',   lastName: 'Nasser', city: 'Zarqa', country: 'JO', createdAt: daysAgo(60), lastLoginAt: daysAgo(2) },
  { id: ADMIN_IDS.support2,   phone: '+962793000003', role: 'ADMIN', adminSubRole: 'SUPPORT',     firstName: 'Omar',   lastName: 'Haddad', city: 'Irbid', country: 'JO', createdAt: daysAgo(45), lastLoginAt: daysAgo(3) },
];

const buyers = [
  { id: BUYER_IDS.mohammed, phone: '+962770100001', firstName: 'Mohammed', lastName: 'Al-Rashid', city: 'Amman',  country: 'JO', createdAt: daysAgo(80), lastLoginAt: daysAgo(1) },
  { id: BUYER_IDS.layla,    phone: '+962770100002', firstName: 'Layla',    lastName: 'Mansour',   city: 'Aqaba',  country: 'JO', createdAt: daysAgo(75), lastLoginAt: daysAgo(2) },
  { id: BUYER_IDS.khaled,   phone: '+962770100003', firstName: 'Khaled',   lastName: 'Ibrahim',   city: 'Zarqa',  country: 'JO', createdAt: daysAgo(70), lastLoginAt: daysAgo(5) },
  { id: BUYER_IDS.rania,    phone: '+962770100004', firstName: 'Rania',    lastName: 'Yousef',    city: 'Amman',  country: 'JO', createdAt: daysAgo(65), lastLoginAt: daysAgo(1) },
  { id: BUYER_IDS.tariq,    phone: '+962770100005', firstName: 'Tariq',    lastName: 'Salem',     city: 'Irbid',  country: 'JO', createdAt: daysAgo(60), lastLoginAt: daysAgo(7) },
  { id: BUYER_IDS.hana,     phone: '+962770100006', firstName: 'Hana',     lastName: 'Qasim',     city: 'Madaba', country: 'JO', createdAt: daysAgo(50), lastLoginAt: daysAgo(3) },
  { id: BUYER_IDS.ziad,     phone: '+962770100007', firstName: 'Ziad',     lastName: 'Barakat',   city: 'Amman',  country: 'JO', createdAt: daysAgo(40), lastLoginAt: daysAgo(1) },
  { id: BUYER_IDS.nour,     phone: '+962770100008', firstName: 'Nour',     lastName: 'Hamdan',    city: 'Aqaba',  country: 'JO', createdAt: daysAgo(30), lastLoginAt: daysAgo(4) },
  { id: BUYER_IDS.faris,    phone: '+962770100009', firstName: 'Faris',    lastName: 'Odeh',      city: 'Amman',  country: 'JO', createdAt: daysAgo(20), lastLoginAt: daysAgo(2) },
  { id: BUYER_IDS.maha,     phone: '+962770100010', firstName: 'Maha',     lastName: 'Aziz',      city: 'Jerash', country: 'JO', createdAt: daysAgo(10), lastLoginAt: daysAgo(1) },
  { id: BUYER_IDS.bilal,    phone: '+962770100011', firstName: 'Bilal',    lastName: 'Tawfiq',    city: 'Amman',  country: 'JO', createdAt: daysAgo(8),  lastLoginAt: null,       status: 'PENDING' },
  { id: BUYER_IDS.dina,     phone: '+962770100012', firstName: 'Dina',     lastName: 'Suleiman',  city: 'Zarqa',  country: 'JO', createdAt: daysAgo(6),  lastLoginAt: null,       status: 'SUSPENDED' },
  { id: BUYER_IDS.wael,     phone: '+962770100013', firstName: 'Wael',     lastName: 'Khalaf',    city: 'Amman',  country: 'JO', createdAt: daysAgo(4),  lastLoginAt: daysAgo(1) },
  { id: BUYER_IDS.rana,     phone: '+962770100014', firstName: 'Rana',     lastName: 'Jabri',     city: 'Salt',   country: 'JO', createdAt: daysAgo(3),  lastLoginAt: daysAgo(1) },
  { id: BUYER_IDS.sami,     phone: '+962770100015', firstName: 'Sami',     lastName: 'Nasir',     city: 'Amman',  country: 'JO', createdAt: daysAgo(1),  lastLoginAt: daysAgo(1), status: 'BANNED' },
];

const merchants = [
  { id: MERCHANT_IDS.hassan,  phone: '+962780200001', firstName: 'Hassan',  lastName: 'Al-Turki',  city: 'Amman',  country: 'JO', createdAt: daysAgo(90), lastLoginAt: daysAgo(1) },
  { id: MERCHANT_IDS.fatima,  phone: '+962780200002', firstName: 'Fatima',  lastName: 'Darwish',   city: 'Amman',  country: 'JO', createdAt: daysAgo(85), lastLoginAt: daysAgo(2) },
  { id: MERCHANT_IDS.majed,   phone: '+962780200003', firstName: 'Majed',   lastName: 'Al-Omari',  city: 'Irbid',  country: 'JO', createdAt: daysAgo(80), lastLoginAt: daysAgo(1) },
  { id: MERCHANT_IDS.suha,    phone: '+962780200004', firstName: 'Suha',    lastName: 'Khalil',    city: 'Aqaba',  country: 'JO', createdAt: daysAgo(75), lastLoginAt: daysAgo(3) },
  { id: MERCHANT_IDS.adnan,   phone: '+962780200005', firstName: 'Adnan',   lastName: 'Mustafa',   city: 'Zarqa',  country: 'JO', createdAt: daysAgo(70), lastLoginAt: daysAgo(4) },
  { id: MERCHANT_IDS.lina,    phone: '+962780200006', firstName: 'Lina',    lastName: 'Shahin',    city: 'Amman',  country: 'JO', createdAt: daysAgo(60), lastLoginAt: daysAgo(1) },
  { id: MERCHANT_IDS.rami,    phone: '+962780200007', firstName: 'Rami',    lastName: 'Badawi',    city: 'Madaba', country: 'JO', createdAt: daysAgo(50), lastLoginAt: daysAgo(2) },
  { id: MERCHANT_IDS.yasmin,  phone: '+962780200008', firstName: 'Yasmin',  lastName: 'Hasan',     city: 'Amman',  country: 'JO', createdAt: daysAgo(40), lastLoginAt: daysAgo(5) },
  { id: MERCHANT_IDS.imad,    phone: '+962780200009', firstName: 'Imad',    lastName: 'Farhat',    city: 'Jerash', country: 'JO', createdAt: daysAgo(25), lastLoginAt: daysAgo(1) },
  { id: MERCHANT_IDS.ghada,   phone: '+962780200010', firstName: 'Ghada',   lastName: 'Zreiqat',   city: 'Amman',  country: 'JO', createdAt: daysAgo(15), lastLoginAt: daysAgo(2) },
  { id: MERCHANT_IDS.nidal,   phone: '+962780200011', firstName: 'Nidal',   lastName: 'Hamouri',   city: 'Irbid',  country: 'JO', createdAt: daysAgo(10), lastLoginAt: daysAgo(3), status: 'SUSPENDED' },
  { id: MERCHANT_IDS.manal,   phone: '+962780200012', firstName: 'Manal',   lastName: 'Bisharat',  city: 'Amman',  country: 'JO', createdAt: daysAgo(5),  lastLoginAt: daysAgo(1) },
];

// ─── Activity logs ────────────────────────────────────────────────────────────

function buildLogs(superAdminId, adminId, supportId, allUsers) {
  const buyerList    = allUsers.filter(u => u.role === 'BUYER');
  const merchantList = allUsers.filter(u => u.role === 'MERCHANT');
  const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const logs = [];

  for (let i = 0; i < 10; i++) {
    const target = sample([...buyerList, ...merchantList]);
    logs.push({
      adminId: superAdminId,
      actionType: ['USER_VIEW', 'USER_EDIT', 'USER_SUSPEND'][i % 3],
      targetType: 'USER',
      targetId: target.id,
      targetPhone: target.phone,
      actionDetails: { reason: 'Routine admin action' },
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Admin Dashboard)',
      success: true,
      createdAt: new Date(Date.now() - (i * 6 * 60 * 60 * 1000)),
    });
  }

  for (let i = 0; i < 8; i++) {
    const target = sample(buyerList);
    logs.push({
      adminId: adminId,
      actionType: i % 4 === 0 ? 'USER_BAN' : 'USER_VIEW',
      targetType: 'USER',
      targetId: target.id,
      targetPhone: target.phone,
      actionDetails: { note: 'User review' },
      ipAddress: '192.168.1.2',
      userAgent: 'Mozilla/5.0 (Admin Dashboard)',
      success: true,
      createdAt: new Date(Date.now() - (i * 12 * 60 * 60 * 1000)),
    });
  }

  for (let i = 0; i < 6; i++) {
    const target = sample([...buyerList, ...merchantList]);
    logs.push({
      adminId: supportId,
      actionType: 'USER_VIEW',
      targetType: 'USER',
      targetId: target.id,
      targetPhone: target.phone,
      actionDetails: { ticket: `TKT-${1000 + i}` },
      ipAddress: '192.168.1.3',
      userAgent: 'Mozilla/5.0 (Admin Dashboard)',
      success: true,
      createdAt: new Date(Date.now() - (i * 8 * 60 * 60 * 1000)),
    });
  }

  logs.push({
    adminId: superAdminId,
    actionType: 'USER_DELETE',
    targetType: 'USER',
    targetId: sample(buyerList).id,
    targetPhone: sample(buyerList).phone,
    actionDetails: { attemptedBy: 'Super Admin' },
    ipAddress: '10.0.0.1',
    userAgent: 'Mozilla/5.0',
    success: false,
    failureReason: 'User has active sessions — deletion blocked',
    createdAt: daysAgo(1),
  });

  logs.push({
    adminId: superAdminId,
    actionType: 'EXPORT_DATA',
    targetType: 'SYSTEM',
    targetId: null,
    targetPhone: null,
    actionDetails: { exportType: 'users_csv', rowCount: buyerList.length + merchantList.length },
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Admin Dashboard)',
    success: true,
    createdAt: daysAgo(3),
  });

  return logs;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('[SEED] Starting identity-service seed...\n');

  // 1. Admins
  console.log('[SEED] Creating admins...');
  const adminUsers = [];
  for (const a of admins) {
    const user = await upsertUser(a);
    adminUsers.push(user);
    console.log(`  ✅ ${a.adminSubRole} ${a.firstName} ${a.lastName} — ${a.id}`);
  }

  // 2. Buyers
  console.log('\n[SEED] Creating buyers...');
  const buyerUsers = [];
  for (const b of buyers) {
    const user = await upsertUser({ ...b, role: 'BUYER' });
    buyerUsers.push(user);
    console.log(`  ✅ Buyer ${b.firstName} ${b.lastName} — ${b.id} (${b.status || 'ACTIVE'})`);
  }

  // 3. Merchants
  console.log('\n[SEED] Creating merchants...');
  const merchantUsers = [];
  for (const m of merchants) {
    const user = await upsertUser({ ...m, role: 'MERCHANT' });
    merchantUsers.push(user);
    console.log(`  ✅ Merchant ${m.firstName} ${m.lastName} — ${m.id} (${m.status || 'ACTIVE'})`);
  }

  // 4. Activity logs
  console.log('\n[SEED] Creating admin activity logs...');
  const logs = buildLogs(adminUsers[0].id, adminUsers[1].id, adminUsers[2].id, [
    ...buyerUsers.map(u => ({ ...u, role: 'BUYER' })),
    ...merchantUsers.map(u => ({ ...u, role: 'MERCHANT' })),
  ]);
  for (const log of logs) {
    await prisma.adminActivityLog.create({ data: log });
  }
  console.log(`  ✅ ${logs.length} activity log entries created`);

  // 5. Summary
  const [adminCount, buyerCount, merchantCount, logCount] = await prisma.$transaction([
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { role: 'BUYER' } }),
    prisma.user.count({ where: { role: 'MERCHANT' } }),
    prisma.adminActivityLog.count(),
  ]);

  console.log('\n[SEED] ✅ Done!');
  console.log(`  Admins:    ${adminCount}`);
  console.log(`  Buyers:    ${buyerCount}`);
  console.log(`  Merchants: ${merchantCount}`);
  console.log(`  Logs:      ${logCount}`);
  console.log('\n[SEED] Static IDs written — request-service seed will use these same IDs.');
}

seed()
  .catch(err => {
    console.error('[SEED] ❌ Fatal:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
