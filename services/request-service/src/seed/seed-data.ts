import { DataSource } from 'typeorm';
import { Request } from '../common/entities/request.entity';
import { RequestCategory } from '../common/entities/request-category.entity';
import { RequestImage } from '../common/entities/request-image.entity';
import { RequestStatusHistory } from '../common/entities/request-status-history.entity';
import { RequestView } from '../common/entities/request-view.entity';
import { RequestStatus } from '../common/entities/request.entity';

export const seedRequestData = async (dataSource: DataSource) => {
  console.log('🌱 Starting Request Service seed data...');

  const requestRepository = dataSource.getRepository(Request);
  const categoryRepository = dataSource.getRepository(RequestCategory);
  const imageRepository = dataSource.getRepository(RequestImage);
  const historyRepository = dataSource.getRepository(RequestStatusHistory);
  const viewRepository = dataSource.getRepository(RequestView);

  // Clean existing data
  await viewRepository.clear();
  await historyRepository.clear();
  await imageRepository.clear();
  await requestRepository.clear();
  await categoryRepository.clear();

  // Create Request Categories
  const categories = [
    {
      id: 'cat-001',
      name: 'Electronics',
      nameAr: 'إلكترونيات',
      description: 'Mobile phones, computers, laptops, and other electronic devices',
      descriptionAr: 'هواتف محمولة، أجهزة كمبيوتر، لابتوبات وأجهزة إلكترونية أخرى',
      isActive: true,
      icon: 'electronics',
      sortOrder: 1,
    },
    {
      id: 'cat-002',
      name: 'Spare Parts',
      nameAr: 'قطع غيار',
      description: 'Car parts, machine parts, and replacement components',
      descriptionAr: 'قطع سيارات، أجزاء آلات ومكونات بديلة',
      isActive: true,
      icon: 'spare-parts',
      sortOrder: 2,
    },
    {
      id: 'cat-003',
      name: 'Furniture',
      nameAr: 'أثاث',
      description: 'Home furniture, office furniture, and decorative items',
      descriptionAr: 'أثاث منزلي، أثاث مكتبي وعناصر زخرفية',
      isActive: true,
      icon: 'furniture',
      sortOrder: 3,
    },
    {
      id: 'cat-004',
      name: 'Custom',
      nameAr: 'مخصص',
      description: 'Custom-made items, specialized products, and unique requests',
      descriptionAr: 'عناصر مصنوعة حسب الطلب، منتجات متخصصة وطلبات فريدة',
      isActive: true,
      icon: 'custom',
      sortOrder: 4,
    },
  ];

  for (const categoryData of categories) {
    await categoryRepository.save(categoryData);
    console.log(`✅ Created category: ${categoryData.name}`);
  }

  // Create Sample Requests
  const requests = [
    {
      id: 'req-001',
      buyerId: 'buyer-001',
      categoryId: 'cat-001',
      title: 'iPhone 14 Pro Max - 256GB',
      description: 'Looking for a brand new iPhone 14 Pro Max 256GB in Deep Purple color. Must be sealed and with warranty.',
      locationId: 'riyadh',
      latitude: 24.7136,
      longitude: 46.6753,
      status: RequestStatus.ACTIVE,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: 'req-002',
      buyerId: 'buyer-002',
      categoryId: 'cat-002',
      title: 'Toyota Camry 2020 Brake Pads',
      description: 'Need front brake pads for Toyota Camry 2020 model. Original parts preferred.',
      locationId: 'riyadh',
      latitude: 24.7136,
      longitude: 46.6753,
      status: RequestStatus.ACTIVE,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
    {
      id: 'req-003',
      buyerId: 'buyer-003',
      categoryId: 'cat-003',
      title: 'Modern Office Chair Set',
      description: 'Looking for 5 modern office chairs for my startup office. Ergonomic design preferred. Budget around 500 SAR per chair.',
      locationId: 'riyadh',
      latitude: 24.7136,
      longitude: 46.6753,
      status: RequestStatus.ACTIVE,
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
    {
      id: 'req-004',
      buyerId: 'buyer-004',
      categoryId: 'cat-004',
      title: 'Custom Arabic Calligraphy Artwork',
      description: 'Need a custom Arabic calligraphy artwork for my living room. Size: 100cm x 60cm. Looking for modern style with traditional elements.',
      locationId: 'jeddah',
      latitude: 21.3891,
      longitude: 39.8579,
      status: RequestStatus.ACTIVE,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
    {
      id: 'req-005',
      buyerId: 'buyer-005',
      categoryId: 'cat-001',
      title: 'MacBook Pro 16" M2 Pro',
      description: 'Looking for MacBook Pro 16" with M2 Pro chip, 32GB RAM, 1TB SSD. Space gray preferred.',
      locationId: 'dammam',
      latitude: 26.4268,
      longitude: 50.0888,
      status: RequestStatus.IN_PROGRESS,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
  ];

  for (const requestData of requests) {
    await requestRepository.save(requestData);
    console.log(`✅ Created request: ${requestData.title}`);
  }

  // Create Request Images
  const requestImages = [
    {
      id: 'img-001',
      requestId: 'req-001',
      imageUrl: 'https://s3.amazonaws.com/reverse-marketplace/requests/iphone-14-pro-max-1.jpg',
      thumbnailUrl: 'https://s3.amazonaws.com/reverse-marketplace/requests/thumbnails/iphone-14-pro-max-1-thumb.jpg',
      sortOrder: 1,
      uploadedAt: new Date(),
    },
    {
      id: 'img-002',
      requestId: 'req-001',
      imageUrl: 'https://s3.amazonaws.com/reverse-marketplace/requests/iphone-14-pro-max-2.jpg',
      thumbnailUrl: 'https://s3.amazonaws.com/reverse-marketplace/requests/thumbnails/iphone-14-pro-max-2-thumb.jpg',
      sortOrder: 2,
      uploadedAt: new Date(),
    },
    {
      id: 'img-003',
      requestId: 'req-002',
      imageUrl: 'https://s3.amazonaws.com/reverse-marketplace/requests/camry-brake-pads.jpg',
      thumbnailUrl: 'https://s3.amazonaws.com/reverse-marketplace/requests/thumbnails/camry-brake-pads-thumb.jpg',
      sortOrder: 1,
      uploadedAt: new Date(),
    },
    {
      id: 'img-004',
      requestId: 'req-003',
      imageUrl: 'https://s3.amazonaws.com/reverse-marketplace/requests/office-chair-sample.jpg',
      thumbnailUrl: 'https://s3.amazonaws.com/reverse-marketplace/requests/thumbnails/office-chair-sample-thumb.jpg',
      sortOrder: 1,
      uploadedAt: new Date(),
    },
    {
      id: 'img-005',
      requestId: 'req-004',
      imageUrl: 'https://s3.amazonaws.com/reverse-marketplace/requests/calligraphy-sample.jpg',
      thumbnailUrl: 'https://s3.amazonaws.com/reverse-marketplace/requests/thumbnails/calligraphy-sample-thumb.jpg',
      sortOrder: 1,
      uploadedAt: new Date(),
    },
  ];

  for (const imageData of requestImages) {
    await imageRepository.save(imageData);
    console.log(`✅ Created image for request: ${imageData.requestId}`);
  }

  // Create Request Status History
  const statusHistories = [
    // Request 1 - iPhone
    {
      id: 'hist-001',
      requestId: 'req-001',
      status: RequestStatus.DRAFT,
      changedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      changedBy: 'buyer-001',
      notes: 'Request created as draft',
    },
    {
      id: 'hist-002',
      requestId: 'req-001',
      status: RequestStatus.ACTIVE,
      changedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      changedBy: 'buyer-001',
      notes: 'Request published',
    },
    // Request 2 - Brake Pads
    {
      id: 'hist-003',
      requestId: 'req-002',
      status: RequestStatus.DRAFT,
      changedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      changedBy: 'buyer-002',
      notes: 'Request created as draft',
    },
    {
      id: 'hist-004',
      requestId: 'req-002',
      status: RequestStatus.ACTIVE,
      changedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      changedBy: 'buyer-002',
      notes: 'Request published',
    },
    // Request 5 - MacBook (In Progress)
    {
      id: 'hist-005',
      requestId: 'req-005',
      status: RequestStatus.DRAFT,
      changedAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
      changedBy: 'buyer-005',
      notes: 'Request created as draft',
    },
    {
      id: 'hist-006',
      requestId: 'req-005',
      status: RequestStatus.ACTIVE,
      changedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      changedBy: 'buyer-005',
      notes: 'Request published',
    },
    {
      id: 'hist-007',
      requestId: 'req-005',
      status: RequestStatus.IN_PROGRESS,
      changedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      changedBy: 'buyer-005',
      notes: 'Bid accepted, deal in progress',
    },
  ];

  for (const historyData of statusHistories) {
    await historyRepository.save(historyData);
    console.log(`✅ Created status history for request: ${historyData.requestId}`);
  }

  // Create Request Views (analytics)
  const requestViews = [
    // iPhone request views
    { requestId: 'req-001', viewerId: 'merchant-001', viewedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000) },
    { requestId: 'req-001', viewerId: 'merchant-004', viewedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
    { requestId: 'req-001', viewerId: 'merchant-002', viewedAt: new Date(Date.now() - 0.5 * 60 * 60 * 1000) },
    
    // Brake pads request views
    { requestId: 'req-002', viewerId: 'merchant-002', viewedAt: new Date(Date.now() - 3 * 60 * 60 * 1000) },
    { requestId: 'req-002', viewerId: 'merchant-001', viewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    
    // Office chair request views
    { requestId: 'req-003', viewerId: 'merchant-003', viewedAt: new Date(Date.now() - 5 * 60 * 60 * 1000) },
    { requestId: 'req-003', viewerId: 'merchant-001', viewedAt: new Date(Date.now() - 4 * 60 * 60 * 1000) },
    
    // Calligraphy request views
    { requestId: 'req-004', viewerId: 'merchant-005', viewedAt: new Date(Date.now() - 0.8 * 60 * 60 * 1000) },
    
    // MacBook request views
    { requestId: 'req-005', viewerId: 'merchant-004', viewedAt: new Date(Date.now() - 23 * 60 * 60 * 1000) },
    { requestId: 'req-005', viewerId: 'merchant-001', viewedAt: new Date(Date.now() - 22 * 60 * 60 * 1000) },
  ];

  for (const viewData of requestViews) {
    await viewRepository.save(viewData);
  }

  console.log(`✅ Created ${requestViews.length} request views`);

  console.log('✅ Request Service seed data completed successfully!');
};
