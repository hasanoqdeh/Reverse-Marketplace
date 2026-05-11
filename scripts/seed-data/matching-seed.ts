// Entity interfaces for Matching Engine seed data
export interface MerchantInterest {
  id: string;
  merchantId: string;
  categoryId: string;
  isInterested: boolean;
  priority: number; // 1-10, higher = more priority
  minPriceRange?: number;
  maxPriceRange?: number;
  serviceRadius?: number; // in kilometers
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MerchantCoverageArea {
  id: string;
  merchantId: string;
  locationId: string;
  cityName: string;
  stateName: string;
  countryName: string;
  latitude: number;
  longitude: number;
  serviceRadius: number; // in kilometers
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MerchantStatusCache {
  id: string;
  merchantId: string;
  isOnline: boolean;
  isVerified: boolean;
  isBanned: boolean;
  trustScore: number;
  currentLoad: number; // 0-100 percentage
  maxCapacity: number;
  responseTime: number; // in minutes
  acceptanceRate: number; // 0-100 percentage
  lastActiveAt?: Date;
  updatedAt?: Date;
}

export interface MatchLog {
  id: string;
  requestId: string;
  matchedMerchants: string[];
  totalMerchants: number;
  matchAlgorithm: string;
  matchScore: number;
  processingTime: number; // in milliseconds
  success: boolean;
  failureReason?: string;
  createdAt?: Date;
}

// Seed data for Matching Engine
export const matchingSeedData = {
  merchantInterests: [
    // Oman Electronics Store interests
    {
      id: 'interest-001',
      merchantId: 'merchant-001',
      categoryId: 'cat-electronics',
      isInterested: true,
      priority: 10,
      minPriceRange: 50,
      maxPriceRange: 5000,
      serviceRadius: 50,
    },
    {
      id: 'interest-002',
      merchantId: 'merchant-001',
      categoryId: 'cat-appliances',
      isInterested: true,
      priority: 8,
      minPriceRange: 100,
      maxPriceRange: 3000,
      serviceRadius: 50,
    },

    // Muscat Auto Parts interests
    {
      id: 'interest-003',
      merchantId: 'merchant-002',
      categoryId: 'cat-spare-parts',
      isInterested: true,
      priority: 10,
      minPriceRange: 10,
      maxPriceRange: 2000,
      serviceRadius: 100,
    },
    {
      id: 'interest-004',
      merchantId: 'merchant-002',
      categoryId: 'cat-custom',
      isInterested: true,
      priority: 6,
      minPriceRange: 500,
      maxPriceRange: 5000,
      serviceRadius: 80,
    },

    // Salalah Furniture Hub interests
    {
      id: 'interest-005',
      merchantId: 'merchant-003',
      categoryId: 'cat-furniture',
      isInterested: true,
      priority: 10,
      minPriceRange: 100,
      maxPriceRange: 10000,
      serviceRadius: 200,
    },
    {
      id: 'interest-006',
      merchantId: 'merchant-003',
      categoryId: 'cat-custom',
      isInterested: true,
      priority: 7,
      minPriceRange: 1000,
      maxPriceRange: 15000,
      serviceRadius: 150,
    },

    // Sohar Custom Solutions interests
    {
      id: 'interest-007',
      merchantId: 'merchant-004',
      categoryId: 'cat-custom',
      isInterested: true,
      priority: 10,
      minPriceRange: 200,
      maxPriceRange: 20000,
      serviceRadius: 300,
    },
    {
      id: 'interest-008',
      merchantId: 'merchant-004',
      categoryId: 'cat-spare-parts',
      isInterested: true,
      priority: 5,
      minPriceRange: 50,
      maxPriceRange: 1500,
      serviceRadius: 250,
    },

    // Nizwa Electronics interests
    {
      id: 'interest-009',
      merchantId: 'merchant-005',
      categoryId: 'cat-electronics',
      isInterested: true,
      priority: 10,
      minPriceRange: 30,
      maxPriceRange: 3000,
      serviceRadius: 120,
    },
    {
      id: 'interest-010',
      merchantId: 'merchant-005',
      categoryId: 'cat-appliances',
      isInterested: true,
      priority: 7,
      minPriceRange: 80,
      maxPriceRange: 2000,
      serviceRadius: 100,
    },
  ] as MerchantInterest[],

  merchantCoverageAreas: [
    // Oman Electronics Store coverage
    {
      id: 'coverage-001',
      merchantId: 'merchant-001',
      locationId: 'loc-muscat-al-khuwair',
      cityName: 'Muscat',
      stateName: 'Muscat',
      countryName: 'Oman',
      latitude: 23.5859,
      longitude: 58.4059,
      serviceRadius: 50,
      isActive: true,
    },
    {
      id: 'coverage-002',
      merchantId: 'merchant-001',
      locationId: 'loc-muscat-ruwi',
      cityName: 'Muscat',
      stateName: 'Muscat',
      countryName: 'Oman',
      latitude: 23.5973,
      longitude: 58.3849,
      serviceRadius: 50,
      isActive: true,
    },
    {
      id: 'coverage-003',
      merchantId: 'merchant-001',
      locationId: 'loc-muscat-al-qurum',
      cityName: 'Muscat',
      stateName: 'Muscat',
      countryName: 'Oman',
      latitude: 23.6150,
      longitude: 58.5708,
      serviceRadius: 50,
      isActive: true,
    },

    // Muscat Auto Parts coverage
    {
      id: 'coverage-004',
      merchantId: 'merchant-002',
      locationId: 'loc-muscat-ruwi',
      cityName: 'Muscat',
      stateName: 'Muscat',
      countryName: 'Oman',
      latitude: 23.5973,
      longitude: 58.3849,
      serviceRadius: 100,
      isActive: true,
    },
    {
      id: 'coverage-005',
      merchantId: 'merchant-002',
      locationId: 'loc-muscat-seeb',
      cityName: 'Muscat',
      stateName: 'Muscat',
      countryName: 'Oman',
      latitude: 23.7333,
      longitude: 58.2667,
      serviceRadius: 100,
      isActive: true,
    },
    {
      id: 'coverage-006',
      merchantId: 'merchant-002',
      locationId: 'loc-sohar',
      cityName: 'Sohar',
      stateName: 'Al-Batinah North',
      countryName: 'Oman',
      latitude: 24.3487,
      longitude: 56.7267,
      serviceRadius: 80,
      isActive: true,
    },

    // Salalah Furniture Hub coverage
    {
      id: 'coverage-007',
      merchantId: 'merchant-003',
      locationId: 'loc-salalah',
      cityName: 'Salalah',
      stateName: 'Dhofar',
      countryName: 'Oman',
      latitude: 17.0225,
      longitude: 54.3313,
      serviceRadius: 200,
      isActive: true,
    },
    {
      id: 'coverage-008',
      merchantId: 'merchant-003',
      locationId: 'loc-muscat-al-khuwair',
      cityName: 'Muscat',
      stateName: 'Muscat',
      countryName: 'Oman',
      latitude: 23.5859,
      longitude: 58.4059,
      serviceRadius: 150,
      isActive: false, // Not actively serving Muscat
    },

    // Sohar Custom Solutions coverage
    {
      id: 'coverage-009',
      merchantId: 'merchant-004',
      locationId: 'loc-sohar',
      cityName: 'Sohar',
      stateName: 'Al-Batinah North',
      countryName: 'Oman',
      latitude: 24.3487,
      longitude: 56.7267,
      serviceRadius: 300,
      isActive: true,
    },
    {
      id: 'coverage-010',
      merchantId: 'merchant-004',
      locationId: 'loc-muscat-industrial',
      cityName: 'Muscat',
      stateName: 'Muscat',
      countryName: 'Oman',
      latitude: 23.6143,
      longitude: 58.2115,
      serviceRadius: 250,
      isActive: true,
    },

    // Nizwa Electronics coverage
    {
      id: 'coverage-011',
      merchantId: 'merchant-005',
      locationId: 'loc-nizwa',
      cityName: 'Nizwa',
      stateName: 'Al-Dakhiliyah',
      countryName: 'Oman',
      latitude: 22.9347,
      longitude: 57.5294,
      serviceRadius: 120,
      isActive: true,
    },
    {
      id: 'coverage-012',
      merchantId: 'merchant-005',
      locationId: 'loc-muscat-al-hail',
      cityName: 'Muscat',
      stateName: 'Muscat',
      countryName: 'Oman',
      latitude: 23.6667,
      longitude: 58.1833,
      serviceRadius: 100,
      isActive: true,
    },
  ] as MerchantCoverageArea[],

  merchantStatusCache: [
    {
      id: 'status-001',
      merchantId: 'merchant-001',
      isOnline: true,
      isVerified: true,
      isBanned: false,
      trustScore: 95,
      currentLoad: 65,
      maxCapacity: 50,
      responseTime: 15,
      acceptanceRate: 85,
      lastActiveAt: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      id: 'status-002',
      merchantId: 'merchant-002',
      isOnline: true,
      isVerified: true,
      isBanned: false,
      trustScore: 88,
      currentLoad: 40,
      maxCapacity: 30,
      responseTime: 20,
      acceptanceRate: 78,
      lastActiveAt: new Date(Date.now() - 2 * 60 * 1000),
    },
    {
      id: 'status-003',
      merchantId: 'merchant-003',
      isOnline: false,
      isVerified: true,
      isBanned: false,
      trustScore: 92,
      currentLoad: 75,
      maxCapacity: 25,
      responseTime: 25,
      acceptanceRate: 92,
      lastActiveAt: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: 'status-004',
      merchantId: 'merchant-004',
      isOnline: true,
      isVerified: false,
      isBanned: false,
      trustScore: 70,
      currentLoad: 20,
      maxCapacity: 15,
      responseTime: 45,
      acceptanceRate: 65,
      lastActiveAt: new Date(Date.now() - 10 * 60 * 1000),
    },
    {
      id: 'status-005',
      merchantId: 'merchant-005',
      isOnline: true,
      isVerified: true,
      isBanned: false,
      trustScore: 85,
      currentLoad: 55,
      maxCapacity: 20,
      responseTime: 30,
      acceptanceRate: 80,
      lastActiveAt: new Date(Date.now() - 15 * 60 * 1000),
    },
  ] as MerchantStatusCache[],

  matchLogs: [
    // Successful match for req-001 (iPhone)
    {
      id: 'match-log-001',
      requestId: 'req-001',
      matchedMerchants: ['merchant-001', 'merchant-005'],
      totalMerchants: 2,
      matchAlgorithm: 'geo_category_score_v2',
      matchScore: 92,
      processingTime: 145,
      success: true,
    },

    // Successful match for req-002 (Gaming Laptop)
    {
      id: 'match-log-002',
      requestId: 'req-002',
      matchedMerchants: ['merchant-001'],
      totalMerchants: 1,
      matchAlgorithm: 'geo_category_score_v2',
      matchScore: 88,
      processingTime: 98,
      success: true,
    },

    // Successful match for req-003 (Brake Pads)
    {
      id: 'match-log-003',
      requestId: 'req-003',
      matchedMerchants: ['merchant-002'],
      totalMerchants: 1,
      matchAlgorithm: 'geo_category_score_v2',
      matchScore: 95,
      processingTime: 112,
      success: true,
    },

    // Failed match for req-004 (Honda Battery)
    {
      id: 'match-log-004',
      requestId: 'req-004',
      matchedMerchants: [],
      totalMerchants: 0,
      matchAlgorithm: 'geo_category_score_v2',
      matchScore: 0,
      processingTime: 67,
      success: false,
      failureReason: 'No merchants available in location',
    },

    // Successful match for req-005 (Office Furniture)
    {
      id: 'match-log-005',
      requestId: 'req-005',
      matchedMerchants: ['merchant-003'],
      totalMerchants: 1,
      matchAlgorithm: 'geo_category_score_v2',
      matchScore: 85,
      processingTime: 189,
      success: true,
    },

    // Successful match for req-006 (Custom Fabrication)
    {
      id: 'match-log-006',
      requestId: 'req-006',
      matchedMerchants: ['merchant-004'],
      totalMerchants: 1,
      matchAlgorithm: 'geo_category_score_v2',
      matchScore: 78,
      processingTime: 156,
      success: true,
    },

    // Partial match for req-007 (Samsung TV)
    {
      id: 'match-log-007',
      requestId: 'req-007',
      matchedMerchants: ['merchant-001'],
      totalMerchants: 1,
      matchAlgorithm: 'geo_category_score_v2',
      matchScore: 82,
      processingTime: 134,
      success: true,
    },
  ] as MatchLog[],
};

// Helper functions
export const getMerchantInterests = (merchantId: string) => 
  matchingSeedData.merchantInterests.filter(mi => mi.merchantId === merchantId && mi.isInterested);

export const getMerchantCoverageAreas = (merchantId: string) => 
  matchingSeedData.merchantCoverageAreas.filter(mca => mca.merchantId === merchantId && mca.isActive);

export const getOnlineMerchants = () => 
  matchingSeedData.merchantStatusCache.filter(msc => msc.isOnline && msc.isVerified && !msc.isBanned);

export const getMerchantsByCategory = (categoryId: string) => {
  const interestMerchants = matchingSeedData.merchantInterests
    .filter(mi => mi.categoryId === categoryId && mi.isInterested)
    .map(mi => mi.merchantId);
  
  return matchingSeedData.merchantStatusCache
    .filter(msc => interestMerchants.includes(msc.merchantId) && msc.isOnline && msc.isVerified && !msc.isBanned);
};
