import { DataSource } from 'typeorm';
import { MerchantInterest } from '../common/entities/merchant-interest.entity';
import { MerchantCoverageArea } from '../common/entities/merchant-coverage-area.entity';
import { MerchantStatusCache } from '../common/entities/merchant-status-cache.entity';
import { MatchLog } from '../common/entities/match-log.entity';

export const seedMatchingData = async (dataSource: DataSource) => {
  console.log('🌱 Starting Matching Engine seed data...');

  const interestRepository = dataSource.getRepository(MerchantInterest);
  const coverageRepository = dataSource.getRepository(MerchantCoverageArea);
  const statusRepository = dataSource.getRepository(MerchantStatusCache);
  const logRepository = dataSource.getRepository(MatchLog);

  // Clean existing data
  await logRepository.clear();
  await statusRepository.clear();
  await coverageRepository.clear();
  await interestRepository.clear();

  // Create Merchant Interests (categories)
  const merchantInterests = [
    // Ali Electronics - Electronics, Mobile Phones, Computers
    {
      id: 'interest-001',
      merchantId: 'merchant-001',
      categoryId: 'cat-001',
      isActive: true,
      priority: 1,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    
    // Riyadh Auto Parts - Spare Parts, Car Accessories
    {
      id: 'interest-002',
      merchantId: 'merchant-002',
      categoryId: 'cat-002',
      isActive: true,
      priority: 1,
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    },
    
    // Premium Furniture Store - Furniture, Home Decor
    {
      id: 'interest-003',
      merchantId: 'merchant-003',
      categoryId: 'cat-003',
      isActive: true,
      priority: 1,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    },
    
    // Tech Solutions - Electronics, Computers
    {
      id: 'interest-004',
      merchantId: 'merchant-004',
      categoryId: 'cat-001',
      isActive: true,
      priority: 1,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    },
    
    // Custom Crafts Workshop - Custom, Handmade
    {
      id: 'interest-005',
      merchantId: 'merchant-005',
      categoryId: 'cat-004',
      isActive: true,
      priority: 1,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const interestData of merchantInterests) {
    await interestRepository.save(interestData);
    console.log(`✅ Created merchant interest: ${interestData.merchantId} - ${interestData.categoryId}`);
  }

  // Create Merchant Coverage Areas
  const coverageAreas = [
    // Ali Electronics - Riyadh, Jeddah, Dammam
    {
      id: 'coverage-001',
      merchantId: 'merchant-001',
      locationId: 'riyadh',
      latitude: 24.7136,
      longitude: 46.6753,
      radiusKm: 50,
      isActive: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'coverage-002',
      merchantId: 'merchant-001',
      locationId: 'jeddah',
      latitude: 21.3891,
      longitude: 39.8579,
      radiusKm: 50,
      isActive: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'coverage-003',
      merchantId: 'merchant-001',
      locationId: 'dammam',
      latitude: 26.4268,
      longitude: 50.0888,
      radiusKm: 50,
      isActive: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    
    // Riyadh Auto Parts - Riyadh, Qassim
    {
      id: 'coverage-004',
      merchantId: 'merchant-002',
      locationId: 'riyadh',
      latitude: 24.7136,
      longitude: 46.6753,
      radiusKm: 100,
      isActive: true,
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'coverage-005',
      merchantId: 'merchant-002',
      locationId: 'buraidah',
      latitude: 26.3628,
      longitude: 43.9750,
      radiusKm: 100,
      isActive: true,
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    },
    
    // Premium Furniture Store - Riyadh, Mecca, Medina
    {
      id: 'coverage-006',
      merchantId: 'merchant-003',
      locationId: 'riyadh',
      latitude: 24.7136,
      longitude: 46.6753,
      radiusKm: 75,
      isActive: true,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'coverage-007',
      merchantId: 'merchant-003',
      locationId: 'mecca',
      latitude: 21.4225,
      longitude: 39.8262,
      radiusKm: 75,
      isActive: true,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'coverage-008',
      merchantId: 'merchant-003',
      locationId: 'medina',
      latitude: 24.4672,
      longitude: 39.6107,
      radiusKm: 75,
      isActive: true,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    },
    
    // Tech Solutions - Riyadh, Eastern Province
    {
      id: 'coverage-009',
      merchantId: 'merchant-004',
      locationId: 'riyadh',
      latitude: 24.7136,
      longitude: 46.6753,
      radiusKm: 80,
      isActive: true,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'coverage-010',
      merchantId: 'merchant-004',
      locationId: 'dammam',
      latitude: 26.4268,
      longitude: 50.0888,
      radiusKm: 80,
      isActive: true,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    },
    
    // Custom Crafts Workshop - Riyadh only
    {
      id: 'coverage-011',
      merchantId: 'merchant-005',
      locationId: 'riyadh',
      latitude: 24.7136,
      longitude: 46.6753,
      radiusKm: 30,
      isActive: true,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const coverageData of coverageAreas) {
    await coverageRepository.save(coverageData);
    console.log(`✅ Created coverage area: ${coverageData.merchantId} - ${coverageData.locationId}`);
  }

  // Create Merchant Status Cache
  const merchantStatuses = [
    {
      id: 'status-001',
      merchantId: 'merchant-001',
      isOnline: true,
      isVerified: true,
      isBanned: false,
      trustScore: 94.5,
      lastActiveAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      responseSpeed: 85, // Response speed score
      activeBidsCount: 2,
      completedDealsCount: 47,
      rating: 4.8,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 10 * 60 * 1000),
    },
    {
      id: 'status-002',
      merchantId: 'merchant-002',
      isOnline: true,
      isVerified: true,
      isBanned: false,
      trustScore: 89.8,
      lastActiveAt: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
      responseSpeed: 78,
      activeBidsCount: 1,
      completedDealsCount: 32,
      rating: 4.6,
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 25 * 60 * 1000),
    },
    {
      id: 'status-003',
      merchantId: 'merchant-003',
      isOnline: false,
      isVerified: true,
      isBanned: false,
      trustScore: 96.2,
      lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      responseSpeed: 92,
      activeBidsCount: 1,
      completedDealsCount: 78,
      rating: 4.9,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: 'status-004',
      merchantId: 'merchant-004',
      isOnline: true,
      isVerified: true,
      isBanned: false,
      trustScore: 87.3,
      lastActiveAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      responseSpeed: 88,
      activeBidsCount: 2,
      completedDealsCount: 41,
      rating: 4.7,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      id: 'status-005',
      merchantId: 'merchant-005',
      isOnline: true,
      isVerified: false, // Pending verification
      isBanned: false,
      trustScore: 91.7,
      lastActiveAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      responseSpeed: 95,
      activeBidsCount: 1,
      completedDealsCount: 15,
      rating: 4.8,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 15 * 60 * 1000),
    },
  ];

  for (const statusData of merchantStatuses) {
    await statusRepository.save(statusData);
    console.log(`✅ Created merchant status: ${statusData.merchantId} - Online: ${statusData.isOnline}`);
  }

  // Create Match Logs (for analytics)
  const matchLogs = [
    {
      id: 'log-001',
      requestId: 'req-001',
      merchantId: 'merchant-001',
      matchScore: 0.95,
      matchFactors: {
        categoryMatch: 1.0,
        locationMatch: 1.0,
        availabilityMatch: 1.0,
        trustScoreBonus: 0.15,
        responseSpeedBonus: 0.1,
      },
      matchedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
      responseTime: 1800, // 30 minutes in seconds
      bidSubmitted: true,
      createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    },
    {
      id: 'log-002',
      requestId: 'req-001',
      merchantId: 'merchant-004',
      matchScore: 0.92,
      matchFactors: {
        categoryMatch: 1.0,
        locationMatch: 1.0,
        availabilityMatch: 1.0,
        trustScoreBonus: 0.08,
        responseSpeedBonus: 0.12,
      },
      matchedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
      responseTime: 2700, // 45 minutes in seconds
      bidSubmitted: true,
      createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    },
    {
      id: 'log-003',
      requestId: 'req-002',
      merchantId: 'merchant-002',
      matchScore: 0.98,
      matchFactors: {
        categoryMatch: 1.0,
        locationMatch: 1.0,
        availabilityMatch: 1.0,
        trustScoreBonus: 0.12,
        responseSpeedBonus: 0.08,
      },
      matchedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      responseTime: 3600, // 1 hour in seconds
      bidSubmitted: true,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
      id: 'log-004',
      requestId: 'req-002',
      merchantId: 'merchant-001',
      matchScore: 0.88,
      matchFactors: {
        categoryMatch: 0.7, // Not primary category
        locationMatch: 1.0,
        availabilityMatch: 1.0,
        trustScoreBonus: 0.15,
        responseSpeedBonus: 0.1,
      },
      matchedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      responseTime: 5400, // 1.5 hours in seconds
      bidSubmitted: true,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
      id: 'log-005',
      requestId: 'req-005',
      merchantId: 'merchant-004',
      matchScore: 0.94,
      matchFactors: {
        categoryMatch: 1.0,
        locationMatch: 1.0,
        availabilityMatch: 1.0,
        trustScoreBonus: 0.08,
        responseSpeedBonus: 0.12,
      },
      matchedAt: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
      responseTime: 900, // 15 minutes in seconds
      bidSubmitted: true,
      bidAccepted: true,
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
    },
  ];

  for (const logData of matchLogs) {
    await logRepository.save(logData);
    console.log(`✅ Created match log: Request ${logData.requestId} -> Merchant ${logData.merchantId}`);
  }

  console.log(`✅ Matching Engine seed data completed!`);
  console.log(`   - ${merchantInterests.length} merchant interests`);
  console.log(`   - ${coverageAreas.length} coverage areas`);
  console.log(`   - ${merchantStatuses.length} merchant statuses`);
  console.log(`   - ${matchLogs.length} match logs`);
};
