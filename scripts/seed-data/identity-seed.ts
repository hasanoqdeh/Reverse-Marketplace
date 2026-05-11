// Entity interfaces for seed data
export enum UserRole {
  BUYER = 'BUYER',
  MERCHANT = 'MERCHANT',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  role: UserRole;
  isVerified: boolean;
  isBanned: boolean;
  trustScore: number;
  avatarUrl: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MerchantProfile {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  description: string;
  licenseNumber: string;
  website: string | null;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isVerified: boolean;
  verificationDocuments: string[];
  rating: number;
  totalTransactions: number;
  responseTime: number;
  acceptanceRate: number;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  orderUpdates: boolean;
  bidUpdates: boolean;
  chatMessages: boolean;
  systemAlerts: boolean;
}

// Seed data for Identity Service
export const identitySeedData = {
  users: [
    // Admin Users
    {
      id: 'admin-001',
      phoneNumber: '+96895000001',
      fullName: 'System Administrator',
      role: UserRole.ADMIN,
      isVerified: true,
      isBanned: false,
      trustScore: 100,
      avatarUrl: 'https://example.com/avatars/admin.jpg',
    },
    {
      id: 'admin-002', 
      phoneNumber: '+96895000002',
      fullName: 'Support Manager',
      role: UserRole.ADMIN,
      isVerified: true,
      isBanned: false,
      trustScore: 95,
      avatarUrl: 'https://example.com/avatars/support.jpg',
    },

    // Buyer Users
    {
      id: 'buyer-001',
      phoneNumber: '+96892100001',
      fullName: 'Ahmed Al-Mansoori',
      role: UserRole.BUYER,
      isVerified: true,
      isBanned: false,
      trustScore: 85,
      avatarUrl: 'https://example.com/avatars/buyer1.jpg',
    },
    {
      id: 'buyer-002',
      phoneNumber: '+96892100002', 
      fullName: 'Fatima Al-Harthy',
      role: UserRole.BUYER,
      isVerified: true,
      isBanned: false,
      trustScore: 92,
      avatarUrl: 'https://example.com/avatars/buyer2.jpg',
    },
    {
      id: 'buyer-003',
      phoneNumber: '+96892100003',
      fullName: 'Mohammed Al-Balushi',
      role: UserRole.BUYER,
      isVerified: false,
      isBanned: false,
      trustScore: 75,
      avatarUrl: null,
    },
    {
      id: 'buyer-004',
      phoneNumber: '+96892100004',
      fullName: 'Aisha Al-Rashdi',
      role: UserRole.BUYER,
      isVerified: true,
      isBanned: false,
      trustScore: 88,
      avatarUrl: 'https://example.com/avatars/buyer4.jpg',
    },
    {
      id: 'buyer-005',
      phoneNumber: '+96892100005',
      fullName: 'Khalid Al-Maawali',
      role: UserRole.BUYER,
      isVerified: true,
      isBanned: false,
      trustScore: 90,
      avatarUrl: 'https://example.com/avatars/buyer5.jpg',
    },

    // Merchant Users
    {
      id: 'merchant-001',
      phoneNumber: '+96892300001',
      fullName: 'Oman Electronics Store',
      role: UserRole.MERCHANT,
      isVerified: true,
      isBanned: false,
      trustScore: 95,
      avatarUrl: 'https://example.com/avatars/merchant1.jpg',
    },
    {
      id: 'merchant-002',
      phoneNumber: '+96892300002',
      fullName: 'Muscat Auto Parts',
      role: UserRole.MERCHANT,
      isVerified: true,
      isBanned: false,
      trustScore: 88,
      avatarUrl: 'https://example.com/avatars/merchant2.jpg',
    },
    {
      id: 'merchant-003',
      phoneNumber: '+96892300003',
      fullName: 'Salalah Furniture Hub',
      role: UserRole.MERCHANT,
      isVerified: true,
      isBanned: false,
      trustScore: 92,
      avatarUrl: 'https://example.com/avatars/merchant3.jpg',
    },
    {
      id: 'merchant-004',
      phoneNumber: '+96892300004',
      fullName: 'Sohar Custom Solutions',
      role: UserRole.MERCHANT,
      isVerified: false,
      isBanned: false,
      trustScore: 70,
      avatarUrl: null,
    },
    {
      id: 'merchant-005',
      phoneNumber: '+96892300005',
      fullName: 'Nizwa Electronics',
      role: UserRole.MERCHANT,
      isVerified: true,
      isBanned: false,
      trustScore: 85,
      avatarUrl: 'https://example.com/avatars/merchant5.jpg',
    },
  ] as User[],

  merchantProfiles: [
    {
      id: 'merchant-profile-001',
      userId: 'merchant-001',
      businessName: 'Oman Electronics Store',
      businessType: 'ELECTRONICS',
      description: 'Leading electronics retailer in Muscat with 10+ years experience',
      licenseNumber: 'LIC-2023-001',
      website: 'https://omanelectronics.om',
      address: 'Muscat, Al-Khuwair, Commercial Street',
      city: 'Muscat',
      state: 'Muscat',
      country: 'Oman',
      postalCode: '133',
      isVerified: true,
      verificationDocuments: ['license.pdf', 'commercial_register.pdf'],
      rating: 4.8,
      totalTransactions: 1250,
      responseTime: 15, // minutes
      acceptanceRate: 85,
    },
    {
      id: 'merchant-profile-002',
      userId: 'merchant-002',
      businessName: 'Muscat Auto Parts',
      businessType: 'AUTO_PARTS',
      description: 'Specialized in auto parts for all major brands',
      licenseNumber: 'LIC-2023-002',
      website: 'https://muscatautoparts.om',
      address: 'Muscat, Ruwi, Industrial Area',
      city: 'Muscat',
      state: 'Muscat',
      country: 'Oman',
      postalCode: '112',
      isVerified: true,
      verificationDocuments: ['license.pdf', 'trade_license.pdf'],
      rating: 4.6,
      totalTransactions: 890,
      responseTime: 20,
      acceptanceRate: 78,
    },
    {
      id: 'merchant-profile-003',
      userId: 'merchant-003',
      businessName: 'Salalah Furniture Hub',
      businessType: 'FURNITURE',
      description: 'Modern and traditional furniture solutions',
      licenseNumber: 'LIC-2023-003',
      website: 'https://salalahfurniture.om',
      address: 'Salalah, Al-Saada, Furniture District',
      city: 'Salalah',
      state: 'Dhofar',
      country: 'Oman',
      postalCode: '211',
      isVerified: true,
      verificationDocuments: ['license.pdf', 'commercial_permit.pdf'],
      rating: 4.9,
      totalTransactions: 650,
      responseTime: 25,
      acceptanceRate: 92,
    },
    {
      id: 'merchant-profile-004',
      userId: 'merchant-004',
      businessName: 'Sohar Custom Solutions',
      businessType: 'CUSTOM',
      description: 'Custom manufacturing and fabrication services',
      licenseNumber: 'LIC-2023-004',
      website: null,
      address: 'Sohar, Al-Hafah, Industrial Zone',
      city: 'Sohar',
      state: 'Al-Batinah North',
      country: 'Oman',
      postalCode: '322',
      isVerified: false,
      verificationDocuments: ['application.pdf'],
      rating: 4.2,
      totalTransactions: 120,
      responseTime: 45,
      acceptanceRate: 65,
    },
    {
      id: 'merchant-profile-005',
      userId: 'merchant-005',
      businessName: 'Nizwa Electronics',
      businessType: 'ELECTRONICS',
      description: 'Electronics and computer accessories',
      licenseNumber: 'LIC-2023-005',
      website: 'https://nizwaelectronics.om',
      address: 'Nizwa, Al-Dakhiliyah, Market Area',
      city: 'Nizwa',
      state: 'Al-Dakhiliyah',
      country: 'Oman',
      postalCode: '411',
      isVerified: true,
      verificationDocuments: ['license.pdf', 'commercial_register.pdf'],
      rating: 4.5,
      totalTransactions: 420,
      responseTime: 30,
      acceptanceRate: 80,
    },
  ] as MerchantProfile[],

  notificationPreferences: [
    // Admin preferences
    {
      id: 'notif-pref-admin-001',
      userId: 'admin-001',
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      orderUpdates: true,
      bidUpdates: true,
      chatMessages: true,
      systemAlerts: true,
    },
    // Buyer preferences
    {
      id: 'notif-pref-buyer-001',
      userId: 'buyer-001',
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      marketingEmails: true,
      orderUpdates: true,
      bidUpdates: true,
      chatMessages: true,
      systemAlerts: false,
    },
    {
      id: 'notif-pref-buyer-002',
      userId: 'buyer-002',
      emailNotifications: false,
      smsNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      orderUpdates: true,
      bidUpdates: true,
      chatMessages: true,
      systemAlerts: false,
    },
    // Merchant preferences
    {
      id: 'notif-pref-merchant-001',
      userId: 'merchant-001',
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      orderUpdates: true,
      bidUpdates: true,
      chatMessages: true,
      systemAlerts: true,
    },
  ] as NotificationPreferences[],
};

// Helper functions
export const getBuyerUsers = () => identitySeedData.users.filter(u => u.role === UserRole.BUYER);
export const getMerchantUsers = () => identitySeedData.users.filter(u => u.role === UserRole.MERCHANT);
export const getAdminUsers = () => identitySeedData.users.filter(u => u.role === UserRole.ADMIN);
export const getVerifiedMerchants = () => getMerchantUsers().filter(m => m.isVerified);
