// Entity interfaces for Request Service seed data
export enum RequestStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  BLOCKED = 'BLOCKED',
}

export interface RequestCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Request {
  id: string;
  buyerId: string;
  categoryId: string;
  title: string;
  description: string;
  locationId?: string;
  latitude?: number;
  longitude?: number;
  status: RequestStatus;
  expiresAt?: Date;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RequestImage {
  id: string;
  requestId: string;
  originalUrl: string;
  thumbnailUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  sortOrder: number;
  uploadedAt?: Date;
}

export interface RequestStatusHistory {
  id: string;
  requestId: string;
  fromStatus?: RequestStatus;
  toStatus: RequestStatus;
  reason?: string;
  changedBy?: string;
  changedAt?: Date;
}

export interface RequestView {
  id: string;
  requestId: string;
  viewerId?: string;
  viewerType: 'BUYER' | 'MERCHANT' | 'ADMIN' | 'ANONYMOUS';
  ipAddress?: string;
  userAgent?: string;
  viewedAt?: Date;
}

// Seed data for Request Service
export const requestSeedData = {
  categories: [
    {
      id: 'cat-electronics',
      name: 'Electronics',
      description: 'Electronic devices, gadgets, and accessories',
      icon: '📱',
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'cat-spare-parts',
      name: 'Spare Parts',
      description: 'Automotive and machinery spare parts',
      icon: '🔧',
      isActive: true,
      sortOrder: 2,
    },
    {
      id: 'cat-furniture',
      name: 'Furniture',
      description: 'Home and office furniture',
      icon: '🪑',
      isActive: true,
      sortOrder: 3,
    },
    {
      id: 'cat-custom',
      name: 'Custom',
      description: 'Custom manufacturing and specialized requests',
      icon: '🛠️',
      isActive: true,
      sortOrder: 4,
    },
    {
      id: 'cat-appliances',
      name: 'Appliances',
      description: 'Home appliances and kitchen equipment',
      icon: '🏠',
      isActive: false,
      sortOrder: 5,
    },
  ] as RequestCategory[],

  requests: [
    // Active Electronics Requests
    {
      id: 'req-001',
      buyerId: 'buyer-001',
      categoryId: 'cat-electronics',
      title: 'iPhone 14 Pro Max - 256GB',
      description: 'Looking for iPhone 14 Pro Max 256GB in Deep Purple. Must be brand new sealed box. Willing to pay premium for immediate delivery.',
      locationId: 'loc-muscat-al-khuwair',
      latitude: 23.5859,
      longitude: 58.4059,
      status: RequestStatus.ACTIVE,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: 'req-002',
      buyerId: 'buyer-002',
      categoryId: 'cat-electronics',
      title: 'Gaming Laptop RTX 4070',
      description: 'Need high-performance gaming laptop with RTX 4070, 32GB RAM, 1TB SSD. Preferred brands: ASUS ROG, MSI, or Alienware.',
      locationId: 'loc-muscat-ruwi',
      latitude: 23.5973,
      longitude: 58.3849,
      status: RequestStatus.ACTIVE,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    
    // Spare Parts Requests
    {
      id: 'req-003',
      buyerId: 'buyer-003',
      categoryId: 'cat-spare-parts',
      title: 'Toyota Hilux 2022 Brake Pads',
      description: 'Original Toyota brake pads for 2022 Hilux model. Need both front and rear sets. Must be genuine parts.',
      locationId: 'loc-sohar',
      latitude: 24.3487,
      longitude: 56.7267,
      status: RequestStatus.ACTIVE,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
    {
      id: 'req-004',
      buyerId: 'buyer-004',
      categoryId: 'cat-spare-parts',
      title: 'Honda Civic 2021 Battery',
      description: 'Need new battery for Honda Civic 2021. Looking for high-performance battery with minimum 2-year warranty.',
      locationId: 'loc-nizwa',
      latitude: 22.9347,
      longitude: 57.5294,
      status: RequestStatus.ACTIVE,
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },

    // Furniture Requests
    {
      id: 'req-005',
      buyerId: 'buyer-005',
      categoryId: 'cat-furniture',
      title: 'Office Desk and Chair Set',
      description: 'Modern office desk with executive chair. Desk should be 180cm x 80cm with built-in cable management. Chair must be ergonomic.',
      locationId: 'loc-salalah',
      latitude: 17.0225,
      longitude: 54.3313,
      status: RequestStatus.ACTIVE,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },

    // Custom Requests
    {
      id: 'req-006',
      buyerId: 'buyer-001',
      categoryId: 'cat-custom',
      title: 'Custom Steel Fabrication - Storage Racks',
      description: 'Need custom steel storage racks for warehouse. Dimensions: 2m x 3m x 0.6m. Load capacity: 500kg per shelf. 4 shelves needed.',
      locationId: 'loc-muscat-industrial',
      latitude: 23.6143,
      longitude: 58.2115,
      status: RequestStatus.ACTIVE,
      expiresAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },

    // In Progress Request (has accepted bid)
    {
      id: 'req-007',
      buyerId: 'buyer-002',
      categoryId: 'cat-electronics',
      title: 'Samsung 65" QLED TV',
      description: 'Samsung 65" QLED 4K Smart TV. Model 2023 or newer. Must include warranty and installation.',
      locationId: 'loc-muscat-al-hail',
      latitude: 23.6667,
      longitude: 58.1833,
      status: RequestStatus.IN_PROGRESS,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },

    // Completed Request
    {
      id: 'req-008',
      buyerId: 'buyer-003',
      categoryId: 'cat-spare-parts',
      title: 'Nissan Patrol 2020 Oil Filter',
      description: 'Genuine Nissan oil filter for 2020 Patrol. Need 5 pieces.',
      locationId: 'loc-muscat-seeb',
      latitude: 23.7333,
      longitude: 58.2667,
      status: RequestStatus.COMPLETED,
      publishedAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    },

    // Expired Request
    {
      id: 'req-009',
      buyerId: 'buyer-004',
      categoryId: 'cat-furniture',
      title: 'King Size Bed Frame',
      description: 'Wooden king size bed frame with storage. Modern design preferred.',
      locationId: 'loc-muscat-al-qurum',
      latitude: 23.6150,
      longitude: 58.5708,
      status: RequestStatus.EXPIRED,
      publishedAt: new Date(Date.now() - 168 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },

    // Draft Request
    {
      id: 'req-010',
      buyerId: 'buyer-005',
      categoryId: 'cat-electronics',
      title: 'AirPods Pro 2nd Gen',
      description: 'Apple AirPods Pro 2nd generation with USB-C charging case. Must be authentic.',
      locationId: 'loc-muscat-al-khuwair',
      latitude: 23.5859,
      longitude: 58.4059,
      status: RequestStatus.DRAFT,
    },
  ] as Request[],

  requestImages: [
    // Images for req-001 (iPhone)
    {
      id: 'img-001',
      requestId: 'req-001',
      originalUrl: 'https://example.com/images/iphone14-pro-max.jpg',
      thumbnailUrl: 'https://example.com/thumbnails/iphone14-pro-max-thumb.jpg',
      fileName: 'iphone14-pro-max.jpg',
      fileSize: 245760,
      mimeType: 'image/jpeg',
      sortOrder: 1,
      uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    
    // Images for req-002 (Gaming Laptop)
    {
      id: 'img-002',
      requestId: 'req-002',
      originalUrl: 'https://example.com/images/gaming-laptop-rtx4070.jpg',
      thumbnailUrl: 'https://example.com/thumbnails/gaming-laptop-rtx4070-thumb.jpg',
      fileName: 'gaming-laptop-rtx4070.jpg',
      fileSize: 524288,
      mimeType: 'image/jpeg',
      sortOrder: 1,
      uploadedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: 'img-003',
      requestId: 'req-002',
      originalUrl: 'https://example.com/images/laptop-specs.jpg',
      thumbnailUrl: 'https://example.com/thumbnails/laptop-specs-thumb.jpg',
      fileName: 'laptop-specs.jpg',
      fileSize: 184320,
      mimeType: 'image/jpeg',
      sortOrder: 2,
      uploadedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },

    // Images for req-003 (Brake Pads)
    {
      id: 'img-004',
      requestId: 'req-003',
      originalUrl: 'https://example.com/images/toyota-brake-pads.jpg',
      thumbnailUrl: 'https://example.com/thumbnails/toyota-brake-pads-thumb.jpg',
      fileName: 'toyota-brake-pads.jpg',
      fileSize: 131072,
      mimeType: 'image/jpeg',
      sortOrder: 1,
      uploadedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },

    // Images for req-005 (Office Furniture)
    {
      id: 'img-005',
      requestId: 'req-005',
      originalUrl: 'https://example.com/images/office-desk-design.jpg',
      thumbnailUrl: 'https://example.com/thumbnails/office-desk-design-thumb.jpg',
      fileName: 'office-desk-design.jpg',
      fileSize: 262144,
      mimeType: 'image/jpeg',
      sortOrder: 1,
      uploadedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },
    {
      id: 'img-006',
      requestId: 'req-005',
      originalUrl: 'https://example.com/images/executive-chair.jpg',
      thumbnailUrl: 'https://example.com/thumbnails/executive-chair-thumb.jpg',
      fileName: 'executive-chair.jpg',
      fileSize: 196608,
      mimeType: 'image/jpeg',
      sortOrder: 2,
      uploadedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },

    // Images for req-006 (Custom Fabrication)
    {
      id: 'img-007',
      requestId: 'req-006',
      originalUrl: 'https://example.com/images/storage-rack-design.jpg',
      thumbnailUrl: 'https://example.com/thumbnails/storage-rack-design-thumb.jpg',
      fileName: 'storage-rack-design.jpg',
      fileSize: 327680,
      mimeType: 'image/jpeg',
      sortOrder: 1,
      uploadedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
    {
      id: 'img-008',
      requestId: 'req-006',
      originalUrl: 'https://example.com/images/warehouse-layout.jpg',
      thumbnailUrl: 'https://example.com/thumbnails/warehouse-layout-thumb.jpg',
      fileName: 'warehouse-layout.jpg',
      fileSize: 409600,
      mimeType: 'image/jpeg',
      sortOrder: 2,
      uploadedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
  ] as RequestImage[],

  statusHistory: [
    // Status changes for req-007 (In Progress)
    {
      id: 'hist-001',
      requestId: 'req-007',
      fromStatus: RequestStatus.DRAFT,
      toStatus: RequestStatus.ACTIVE,
      reason: 'Request published by buyer',
      changedBy: 'buyer-002',
      changedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: 'hist-002',
      requestId: 'req-007',
      fromStatus: RequestStatus.ACTIVE,
      toStatus: RequestStatus.IN_PROGRESS,
      reason: 'Bid accepted by buyer',
      changedBy: 'buyer-002',
      changedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },

    // Status changes for req-008 (Completed)
    {
      id: 'hist-003',
      requestId: 'req-008',
      fromStatus: RequestStatus.DRAFT,
      toStatus: RequestStatus.ACTIVE,
      reason: 'Request published by buyer',
      changedBy: 'buyer-003',
      changedAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    },
    {
      id: 'hist-004',
      requestId: 'req-008',
      fromStatus: RequestStatus.ACTIVE,
      toStatus: RequestStatus.IN_PROGRESS,
      reason: 'Bid accepted by buyer',
      changedBy: 'buyer-003',
      changedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
    {
      id: 'hist-005',
      requestId: 'req-008',
      fromStatus: RequestStatus.IN_PROGRESS,
      toStatus: RequestStatus.COMPLETED,
      reason: 'Deal completed successfully',
      changedBy: 'buyer-003',
      changedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },

    // Status changes for req-009 (Expired)
    {
      id: 'hist-006',
      requestId: 'req-009',
      fromStatus: RequestStatus.DRAFT,
      toStatus: RequestStatus.ACTIVE,
      reason: 'Request published by buyer',
      changedBy: 'buyer-004',
      changedAt: new Date(Date.now() - 168 * 60 * 60 * 1000),
    },
    {
      id: 'hist-007',
      requestId: 'req-009',
      fromStatus: RequestStatus.ACTIVE,
      toStatus: RequestStatus.EXPIRED,
      reason: 'Request expired automatically',
      changedBy: 'system',
      changedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ] as RequestStatusHistory[],

  requestViews: [
    // Views for req-001
    {
      id: 'view-001',
      requestId: 'req-001',
      viewerId: 'merchant-001',
      viewerType: 'MERCHANT',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
      viewedAt: new Date(Date.now() - 90 * 60 * 1000),
    },
    {
      id: 'view-002',
      requestId: 'req-001',
      viewerId: 'merchant-005',
      viewerType: 'MERCHANT',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Android 13; Mobile; rv:109.0)',
      viewedAt: new Date(Date.now() - 60 * 60 * 1000),
    },
    {
      id: 'view-003',
      requestId: 'req-001',
      viewerType: 'ANONYMOUS',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      viewedAt: new Date(Date.now() - 30 * 60 * 1000),
    },

    // Views for req-002
    {
      id: 'view-004',
      requestId: 'req-002',
      viewerId: 'merchant-001',
      viewerType: 'MERCHANT',
      ipAddress: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
      viewedAt: new Date(Date.now() - 120 * 60 * 1000),
    },
    {
      id: 'view-005',
      requestId: 'req-002',
      viewerId: 'merchant-005',
      viewerType: 'MERCHANT',
      ipAddress: '192.168.1.104',
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)',
      viewedAt: new Date(Date.now() - 90 * 60 * 1000),
    },
  ] as RequestView[],
};

// Helper functions
export const getActiveRequests = () => requestSeedData.requests.filter(r => r.status === RequestStatus.ACTIVE);
export const getRequestsByCategory = (categoryId: string) => requestSeedData.requests.filter(r => r.categoryId === categoryId);
export const getActiveCategories = () => requestSeedData.categories.filter(c => c.isActive);
