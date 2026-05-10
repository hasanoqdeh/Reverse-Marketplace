-- =====================================
-- Reverse Marketplace Database Seed Data
-- =====================================
-- This file contains seed data for PostgreSQL database
-- Run this file against the reverse_marketplace database

-- =====================================
-- Identity Service Seed Data
-- =====================================

-- Clear existing data
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE merchant_profiles CASCADE;
TRUNCATE TABLE merchant_documents CASCADE;
TRUNCATE TABLE notification_preferences CASCADE;
TRUNCATE TABLE refresh_tokens CASCADE;

-- Insert Users
INSERT INTO users (id, phone_number, full_name, role, is_verified, is_banned, trust_score, avatar_url, created_at, updated_at) VALUES
-- Admin Users
('admin-001', '+966500000001', 'System Administrator', 'ADMIN', true, false, 100.0, 'https://example.com/avatars/admin.jpg', NOW(), NOW()),
('admin-002', '+966500000002', 'Super Admin', 'ADMIN', true, false, 100.0, 'https://example.com/avatars/admin2.jpg', NOW(), NOW()),

-- Buyer Users
('buyer-001', '+966511111111', 'Ahmed Mohammed', 'BUYER', true, false, 85.5, 'https://example.com/avatars/buyer1.jpg', NOW(), NOW()),
('buyer-002', '+966522222222', 'Sarah Abdullah', 'BUYER', true, false, 92.0, 'https://example.com/avatars/buyer2.jpg', NOW(), NOW()),
('buyer-003', '+966533333333', 'Mohammed Ali', 'BUYER', true, false, 78.5, 'https://example.com/avatars/buyer3.jpg', NOW(), NOW()),
('buyer-004', '+966544444444', 'Fatima Hassan', 'BUYER', true, false, 88.0, 'https://example.com/avatars/buyer4.jpg', NOW(), NOW()),
('buyer-005', '+966555555555', 'Khalid Omar', 'BUYER', true, false, 95.0, 'https://example.com/avatars/buyer5.jpg', NOW(), NOW()),

-- Merchant Users
('merchant-001', '+966511111111', 'Ali Electronics', 'MERCHANT', true, false, 92.5, 'https://example.com/avatars/merchant1.jpg', NOW(), NOW()),
('merchant-002', '+966522222222', 'Tech Solutions', 'MERCHANT', true, false, 88.0, 'https://example.com/avatars/merchant2.jpg', NOW(), NOW()),
('merchant-003', '+966533333333', 'Smart Phones Store', 'MERCHANT', true, false, 95.0, 'https://example.com/avatars/merchant3.jpg', NOW(), NOW()),
('merchant-004', '+966544444444', 'Computer Parts Hub', 'MERCHANT', true, false, 87.5, 'https://example.com/avatars/merchant4.jpg', NOW(), NOW()),
('merchant-005', '+966555555555', 'Mobile Accessories', 'MERCHANT', true, false, 82.0, 'https://example.com/avatars/merchant5.jpg', NOW(), NOW());

-- Insert Merchant Profiles
INSERT INTO merchant_profiles (id, user_id, business_name, commercial_registration, verification_status, coverage_areas, categories, created_at, updated_at) VALUES
('mp-001', 'merchant-001', 'Ali Electronics', 'CR-123456', 'APPROVED', '{"cities": ["Riyadh", "Jeddah", "Dammam"], "countries": ["Saudi Arabia"]}', '["Electronics", "Mobile Phones", "Accessories"]', NOW(), NOW()),
('mp-002', 'merchant-002', 'Tech Solutions', 'CR-789012', 'APPROVED', '{"cities": ["Riyadh", "Dammam"], "countries": ["Saudi Arabia"]}', '["Electronics", "Computers", "IT Services"]', NOW(), NOW()),
('mp-003', 'merchant-003', 'Smart Phones Store', 'CR-456789', 'APPROVED', '{"cities": ["Riyadh", "Jeddah"], "countries": ["Saudi Arabia"]}', '["Mobile Phones", "Accessories", "Smart Devices"]', NOW(), NOW()),
('mp-004', 'merchant-004', 'Computer Parts Hub', 'CR-321654', 'PENDING', '{"cities": ["Riyadh"], "countries": ["Saudi Arabia"]}', '["Computer Parts", "Electronics"]', NOW(), NOW()),
('mp-005', 'merchant-005', 'Mobile Accessories', 'CR-987654', 'PENDING', '{"cities": ["Jeddah"], "countries": ["Saudi Arabia"]}', '["Accessories", "Mobile Phone Accessories"]', NOW(), NOW());

-- Insert Merchant Documents
INSERT INTO merchant_documents (id, merchant_id, document_type, document_url, uploaded_at) VALUES
('doc-001', 'mp-001', 'COMMERCIAL_REGISTRATION', 'https://example.com/documents/cr-001.pdf', NOW()),
('doc-002', 'mp-001', 'IDENTITY_DOCUMENT', 'https://example.com/documents/id-001.pdf', NOW()),
('doc-003', 'mp-001', 'TAX_CERTIFICATE', 'https://example.com/documents/tax-001.pdf', NOW()),

('doc-004', 'mp-002', 'COMMERCIAL_REGISTRATION', 'https://example.com/documents/cr-002.pdf', NOW()),
('doc-005', 'mp-002', 'IDENTITY_DOCUMENT', 'https://example.com/documents/id-002.pdf', NOW()),
('doc-006', 'mp-002', 'TAX_CERTIFICATE', 'https://example.com/documents/tax-002.pdf', NOW()),

('doc-007', 'mp-003', 'COMMERCIAL_REGISTRATION', 'https://example.com/documents/cr-003.pdf', NOW()),
('doc-008', 'mp-003', 'IDENTITY_DOCUMENT', 'https://example.com/documents/id-003.pdf', NOW()),

-- Insert Notification Preferences
INSERT INTO notification_preferences (id, user_id, push_enabled, sms_enabled, marketing_enabled, created_at, updated_at) VALUES
('np-001', 'admin-001', true, true, false, NOW(), NOW()),
('np-002', 'admin-002', true, true, false, NOW(), NOW()),
('np-003', 'buyer-001', true, true, false, NOW(), NOW()),
('np-004', 'buyer-002', true, true, false, NOW(), NOW()),
('np-005', 'buyer-003', true, true, false, NOW(), NOW()),
('np-006', 'buyer-004', true, true, false, NOW(), NOW()),
('np-007', 'buyer-005', true, true, false, NOW(), NOW()),
('np-008', 'merchant-001', true, true, false, NOW(), NOW()),
('np-009', 'merchant-002', true, true, false, NOW(), NOW()),
('np-010', 'merchant-003', true, true, false, NOW(), NOW()),
('np-011', 'merchant-004', true, true, false, NOW(), NOW()),
('np-012', 'merchant-005', true, true, false, NOW(), NOW());

-- =====================================
-- Request Service Seed Data (if tables exist)
-- =====================================

-- Note: Request service uses TypeORM, so this data would need to be inserted
-- through the service's seed runner or direct API calls

-- Sample Request Categories (if table exists)
/*
INSERT INTO request_categories (id, name, description, icon, created_at, updated_at) VALUES
('cat-001', 'Electronics', 'Electronic devices and accessories', 'electronics', NOW(), NOW()),
('cat-002', 'Spare Parts', 'Replacement parts and components', 'tools', NOW(), NOW()),
('cat-003', 'Furniture', 'Home and office furniture', 'home', NOW(), NOW()),
('cat-004', 'Custom', 'Custom requests and specialized services', 'star', NOW(), NOW());
*/

-- =====================================
-- Payment Service Seed Data (if tables exist)
-- =====================================

-- Note: Payment service uses TypeORM, so this data would need to be inserted
-- through the service's seed runner or direct API calls

-- Sample Subscription Plans (if table exists)
/*
INSERT INTO subscription_plans (id, name, description, price, currency, billing_cycle, features, created_at, updated_at) VALUES
('plan-basic', 'Basic Plan', 'Essential features for small merchants', 99.00, 'SAR', 'monthly', '{"bidsPerMonth": 10, "featuredRequests": false, "analyticsAccess": false, "prioritySupport": false, "commissionRate": 0.05}', NOW(), NOW()),
('plan-pro', 'Professional Plan', 'Enhanced features for growing businesses', 299.00, 'SAR', 'monthly', '{"bidsPerMonth": 50, "featuredRequests": true, "analyticsAccess": true, "prioritySupport": true, "commissionRate": 0.03}', NOW(), NOW()),
('plan-enterprise', 'Enterprise Plan', 'Complete solution for large operations', 999.00, 'SAR', 'monthly', '{"bidsPerMonth": 200, "featuredRequests": true, "analyticsAccess": true, "prioritySupport": true, "commissionRate": 0.02}', NOW(), NOW());
*/

-- =====================================
-- Usage Instructions
-- =====================================

-- To run this seed data:
-- 1. Connect to PostgreSQL database
-- docker exec -it reverse-marketplace-postgres psql -U postgres -d reverse_marketplace
-- 
-- 2. Execute this SQL file
-- \i /path/to/DATABASE_SEED.sql
-- 
-- 3. Verify data insertion
-- SELECT COUNT(*) FROM users;
-- SELECT COUNT(*) FROM merchant_profiles;
-- 
-- 4. For other services, use their respective seed runners or API endpoints

-- =====================================
-- Sample Data Summary
-- =====================================
-- Users: 10 total (2 admins, 5 buyers, 3 merchants)
-- Merchant Profiles: 5 total
-- Merchant Documents: 8 total
-- Notification Preferences: 10 total
-- 
-- This provides a solid foundation for testing the Reverse Marketplace platform.
