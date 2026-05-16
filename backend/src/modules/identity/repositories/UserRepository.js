'use strict';

const prisma = require('../../../prisma/client');

// Flatten Prisma's nested profile into the flat shape the service layer expects.
function flattenUser(user) {
  if (!user) return null;
  const { profile, phoneVerified, createdAt, updatedAt, lastLoginAt,
          failedLoginAttempts, lockedUntil, adminSubRole, ...rest } = user;
  return {
    ...rest,
    phone_verified: phoneVerified,
    created_at: createdAt,
    updated_at: updatedAt,
    last_login_at: lastLoginAt,
    failed_login_attempts: failedLoginAttempts,
    locked_until: lockedUntil,
    admin_sub_role: adminSubRole,
    first_name: profile?.firstName ?? '',
    last_name: profile?.lastName ?? '',
    profile_image_url: profile?.profileImageUrl ?? null,
    city: profile?.city ?? null,
    country: profile?.country ?? null,
    address: profile?.address ?? null,
    location_lat: profile?.locationLat ?? null,
    location_lng: profile?.locationLng ?? null,
    preferences: profile?.preferences ?? {},
  };
}

const WITH_PROFILE = { profile: true };

const UserRepository = {
  // ─── Find ──────────────────────────────────────────────────────

  async findById(id) {
    const user = await prisma.user.findUnique({ where: { id }, include: WITH_PROFILE });
    return flattenUser(user);
  },

  async findByPhone(phone) {
    const user = await prisma.user.findUnique({ where: { phone }, include: WITH_PROFILE });
    return flattenUser(user);
  },

  async findByPhoneAndRole(phone, role) {
    const user = await prisma.user.findFirst({ where: { phone, role }, include: WITH_PROFILE });
    return flattenUser(user);
  },

  // ─── Create / Update ───────────────────────────────────────────

  async create({ phone, role = 'BUYER', status = 'PENDING' }) {
    const user = await prisma.user.create({ data: { phone, role, status } });
    return flattenUser(user);
  },

  async createProfile({ userId, firstName = '', lastName = '' }) {
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      create: { userId, firstName, lastName },
      update: {},
    });
    return profile;
  },

  async updateStatus(userId, status) {
    const user = await prisma.user.update({ where: { id: userId }, data: { status } });
    return flattenUser(user);
  },

  async markPhoneVerified(userId) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { phoneVerified: true, status: 'ACTIVE' },
    });
    return flattenUser(user);
  },

  async updateLastLogin(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date(), failedLoginAttempts: 0, lockedUntil: null },
    });
  },

  async incrementFailedAttempts(userId) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: { increment: 1 } },
      select: { failedLoginAttempts: true },
    });
    return user.failedLoginAttempts;
  },

  async lockAccount(userId, lockoutMinutes) {
    const lockedUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);
    await prisma.user.update({ where: { id: userId }, data: { lockedUntil } });
  },

  async unlockAccount(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { lockedUntil: null, failedLoginAttempts: 0 },
    });
  },

  async updateRole(userId, role) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      include: WITH_PROFILE,
    });
    return flattenUser(user);
  },

  async updateProfile(userId, fields) {
    const fieldMap = {
      first_name: 'firstName', last_name: 'lastName',
      profile_image_url: 'profileImageUrl', city: 'city',
      country: 'country', address: 'address',
      location_lat: 'locationLat', location_lng: 'locationLng',
      preferences: 'preferences',
    };
    const data = {};
    for (const [snake, camel] of Object.entries(fieldMap)) {
      if (fields[snake] !== undefined) data[camel] = fields[snake];
    }
    if (Object.keys(data).length === 0) return null;
    return prisma.userProfile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  },

  // ─── Admin user management ─────────────────────────────────────

  async listUsers({
    page = 1, limit = 20, search, role, status,
    sortBy = 'createdAt', sortOrder = 'desc',
    registrationDateFrom, registrationDateTo,
    lastLoginFrom, lastLoginTo,
  } = {}) {
    const where = {};

    if (search) {
      where.OR = [
        { phone: { contains: search, mode: 'insensitive' } },
        { profile: { firstName: { contains: search, mode: 'insensitive' } } },
        { profile: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (role && role !== 'ALL') where.role = role;
    if (status && status !== 'ALL') where.status = status;

    if (registrationDateFrom || registrationDateTo) {
      where.createdAt = {};
      if (registrationDateFrom) where.createdAt.gte = new Date(registrationDateFrom);
      if (registrationDateTo) where.createdAt.lte = new Date(registrationDateTo);
    }
    if (lastLoginFrom || lastLoginTo) {
      where.lastLoginAt = {};
      if (lastLoginFrom) where.lastLoginAt.gte = new Date(lastLoginFrom);
      if (lastLoginTo) where.lastLoginAt.lte = new Date(lastLoginTo);
    }

    const sortableColumns = {
      createdAt: 'createdAt', lastLoginAt: 'lastLoginAt',
      phone: 'phone', name: 'firstName',
    };
    const orderField = sortableColumns[sortBy] || 'createdAt';

    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: WITH_PROFILE,
        orderBy: { [orderField]: sortOrder === 'asc' ? 'asc' : 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { users: users.map(flattenUser), total, page, limit };
  },

  async getDashboardMetrics() {
    const now = new Date();
    const dayAgo = new Date(now - 86400000);
    const weekAgo = new Date(now - 7 * 86400000);

    const [total, active, newToday, newThisWeek, buyers, merchants, admins, pending, banned, suspended] =
      await prisma.$transaction([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'ACTIVE' } }),
        prisma.user.count({ where: { createdAt: { gte: dayAgo } } }),
        prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
        prisma.user.count({ where: { role: 'BUYER' } }),
        prisma.user.count({ where: { role: 'MERCHANT' } }),
        prisma.user.count({ where: { role: 'ADMIN' } }),
        prisma.user.count({ where: { status: 'PENDING' } }),
        prisma.user.count({ where: { status: 'BANNED' } }),
        prisma.user.count({ where: { status: 'SUSPENDED' } }),
      ]);

    return {
      total, active,
      new_today: newToday,
      new_this_week: newThisWeek,
      buyers, merchants, admins, pending, banned, suspended,
    };
  },
};

module.exports = UserRepository;
