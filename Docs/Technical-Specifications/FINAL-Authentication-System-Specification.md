# Authentication System Technical Specification - FINAL VERSION

## Executive Summary

This document provides the complete and final technical specification for the unified phone-based authentication system supporting three distinct user roles (BUYER, MERCHANT, ADMIN) with consistent security and user experience across all platforms.

---

## 1. System Architecture

### 1.1 Core Design Principles

✅ **Unified Phone Authentication**
- All users authenticate via phone number + OTP
- No email/password authentication required
- Simplified user experience across all platforms
- Reduced security surface area

✅ **Role-Based Access Control**
- JWT tokens with embedded role information
- Permission-based feature access
- Admin users verified through phone whitelist
- Merchant verification workflow for business users

✅ **Security-First Approach**
- OTP-based authentication eliminates password risks
- Comprehensive rate limiting and anomaly detection
- Device fingerprinting and session management
- Complete audit logging and monitoring

---

## 2. Database Schema Specification

### 2.1 Core User Tables

#### `users` Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'BUYER',
    status user_status NOT NULL DEFAULT 'PENDING',
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE NULL,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE NULL
);

CREATE TYPE user_role AS ENUM ('BUYER', 'MERCHANT', 'ADMIN');
CREATE TYPE user_status AS ENUM ('PENDING', 'ACTIVE', 'BANNED', 'SUSPENDED');

-- Performance indexes
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_phone_status ON users(phone, status);
```

#### `user_profiles` Table
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profile_image_url VARCHAR(500) NULL,
    location_lat DECIMAL(10, 8) NULL,
    location_lng DECIMAL(11, 8) NULL,
    address TEXT NULL,
    city VARCHAR(100) NULL,
    country VARCHAR(100) NULL,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_location ON user_profiles(location_lat, location_lng);
```

### 2.2 Authentication Tables

#### `otp_codes` Table
```sql
CREATE TABLE otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    purpose otp_purpose NOT NULL,
    attempts INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE otp_purpose AS ENUM ('LOGIN', 'PHONE_VERIFICATION');

-- Indexes for cleanup and performance
CREATE INDEX idx_otp_codes_expires_at ON otp_codes(expires_at);
CREATE INDEX idx_otp_codes_phone ON otp_codes(phone);
CREATE INDEX idx_otp_codes_user_id ON otp_codes(user_id);
```

#### `auth_tokens` Table
```sql
CREATE TABLE auth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_type token_type NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    device_fingerprint VARCHAR(255) NULL,
    ip_address INET NULL,
    user_agent TEXT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE TYPE token_type AS ENUM ('ACCESS', 'REFRESH');

-- Indexes
CREATE INDEX idx_auth_tokens_expires_at ON auth_tokens(expires_at);
CREATE INDEX idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX idx_auth_tokens_hash ON auth_tokens(token_hash);
```

#### `user_sessions` Table
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_fingerprint VARCHAR(255) NULL,
    ip_address INET NULL,
    user_agent TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
```
---

## 3. Event Publishing

### 3.1 Authentication Events

The Identity Service publishes the following events to RabbitMQ:

| Event                  | Trigger                               | Data                    | Consumers |
|------------------------|---------------------------------------|-------------------------|-----------|
| `user.registered`      | New user created via OTP verification | UserRegisteredEvent     | Notification, Analytics, Request |
| `user.logined`         | user Login via OTP verification       | UserLoginEvent          | Notification, Analytics, Request |
| `user.verified`        | Phone number verified                 | UserVerifiedEvent       | Notification, Request, Bidding |
| `merchant.verified`    | Business verification completed       | MerchantVerifiedEvent   | Notification, Bidding, Analytics |
| `user.update`          | User account suspended/banned         | UserBannedEvent         | Notification, Bidding, Chat |
| `user.profile.updated` | User profile changes                  | UserProfileUpdatedEvent | Analytics, Notification |

### 3.2 Event Schemas

```typescript
// Base Event Structure
interface BaseEvent {
  eventId: string;
  eventType: string;
  timestamp: string;
  version: string;
  source: 'identity-service';
  data: any;
  metadata?: {
    correlationId?: string;
    userId?: string;
  };
}

// User Events
interface UserRegisteredEvent extends BaseEvent {
  eventType: 'user.registered';
  data: {
    userId: string;
    phone: string;
    role: 'BUYER' | 'MERCHANT' | 'ADMIN';
    registeredAt: string;
  };
}

interface UserLoggedInEvent extends BaseEvent {
  eventType: 'user.logined';
  data: {
    userId: string;
    phone: string;
    role: 'BUYER' | 'MERCHANT' | 'ADMIN';
    loginAt: string;
  };
}

interface UserVerifiedEvent extends BaseEvent {
  eventType: 'user.verified';
  data: {
    userId: string;
    phone: string;
    role: 'BUYER' | 'MERCHANT' | 'ADMIN';
    verifiedAt: string;
  };
}

interface MerchantVerifiedEvent extends BaseEvent {
  eventType: 'merchant.verified';
  data: {
    userId: string;
    phone: string;
    businessName: string;
    verifiedAt: string;
    verifiedBy: string;
  };
}

interface UserBannedEvent extends BaseEvent {
  eventType: 'user.banned';
  data: {
    userId: string;
    phone: string;
    role: 'BUYER' | 'MERCHANT' | 'ADMIN';
    bannedAt: string;
    bannedBy: string;
    reason: string;
  };
}

interface UserProfileUpdatedEvent extends BaseEvent {
  eventType: 'user.profile.updated';
  data: {
    userId: string;
    phone: string;
    role: 'BUYER' | 'MERCHANT' | 'ADMIN';
    updatedFields: string[];
    updatedAt: string;
  };
}
```

---

## 4. API Specifications

### 3.1 Authentication Endpoints

#### POST `/auth/phone-login`
```typescript
interface PhoneLoginRequest {
  phone: string;
  countryCode: string;
}

interface PhoneLoginResponse {
  success: boolean;
  message: string;
  otpSent: boolean;
  expiresAt?: string; // ISO 8601 timestamp
  rateLimitExceeded?: boolean;
  nextAttemptAt?: string;
}
```

#### POST `/auth/verify-otp`
```typescript
interface OTPVerificationRequest {
  phone: string;
  otpCode: string;
  deviceFingerprint?: string;
}

interface OTPVerificationResponse {
  success: boolean;
  user: {
    id: string;
    phone: string;
    role: 'BUYER' | 'MERCHANT' | 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT';
    status: string;
    profile?: UserProfile;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  sessionTimeout: number;
}
```

#### POST `/auth/resend-otp`
```typescript
interface ResendOTPRequest {
  phone: string;
}

interface ResendOTPResponse {
  success: boolean;
  message: string;
  cooldownRemaining?: number; // seconds
}
```

#### POST `/auth/refresh-token`
```typescript
interface RefreshTokenRequest {
  refreshToken: string;
}

interface RefreshTokenResponse {
  success: boolean;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}
```

#### POST `/auth/logout`
```typescript
interface LogoutRequest {
  refreshToken?: string;
  allDevices?: boolean;
}

interface LogoutResponse {
  success: boolean;
  message: string;
}
```

---

## 4. Security Configuration

### 4.1 OTP Settings
```yaml
otp_configuration:
  length: 6
  expiry_minutes: 10
  max_attempts: 3
  resend_cooldown_seconds: 60
  rate_limit_per_phone: 3 per 5 minutes
  rate_limit_global: 100 per minute
  characters: "0123456789" # Numeric only
  case_sensitive: false
```

### 4.2 Session Management
```yaml
session_configuration:
  access_token_expiry: 15 minutes
  refresh_token_expiry: 30 days
  max_concurrent_sessions: 5
  device_fingerprint_required: true
  session_cleanup_interval: 1 hour
  inactive_session_cleanup: 24 hours
```

### 4.3 Rate Limiting
```yaml
rate_limits:
  phone_login: 5 per minute per IP
  otp_verification: 10 per minute per phone
  otp_resend: 3 per 5 minutes per phone
  token_refresh: 20 per hour per user
  admin_access: 10 per minute per admin
  global_auth_requests: 1000 per minute
```

### 4.4 Security Policies
```yaml
security_policies:
  account_lockout:
    max_failed_attempts: 5
    lockout_duration: 30 minutes
    progressive_lockout: true # 30min, 1hr, 4hr, 24hr
  
  device_tracking:
    max_devices_per_user: 10
    new_device_notification: true
    suspicious_device_detection: true
  
  ip_security:
    max_concurrent_ips: 10 per user
    geo_anomaly_detection: true
```

---

## 5. Authentication Flows

### 5.1 Standard User Authentication
```mermaid
sequenceDiagram
    participant User as User App
    participant API as API Gateway
    participant Auth as Auth Service
    participant Database as Database
    participant SMS as SMS Service
    participant Redis as Redis Cache

    User->>API: POST /auth/phone-login
    API->>Auth: Forward request
    Auth->>Redis: Check rate limit
    Redis-->>Auth: Rate limit status
    
    Auth->>Database: Find/create user
    Database-->>Auth: User data
    
    Auth->>Auth: Generate OTP
    Auth->>Database: Store OTP with expiry
    Auth->>SMS: Send OTP
    SMS-->>Auth: Delivery confirmation
    
    Auth->>Database: Log OTP sent
    Auth-->>API: OTP sent response
    API-->>User: OTP sent confirmation
    
    User->>API: POST /auth/verify-otp
    API->>Auth: Forward OTP verification
    Auth->>Database: Verify OTP
    Database-->>Auth: Validation result
    
    Auth->>Auth: Generate JWT tokens
    Auth->>Database: Store session
    Auth->>Redis: Cache user session
    
    Auth->>Database: Log successful login
    Auth-->>API: Auth response
    API-->>User: JWT tokens + user data
```

### 5.2 Admin Authentication
```mermaid
sequenceDiagram
    participant Admin as Admin Panel
    participant API as API Gateway
    participant Auth as Auth Service
    participant Database as Database
    participant SMS as SMS Service
    participant Redis as Redis Cache

    Admin->>API: POST /auth/phone-login
    API->>Auth: Forward request
    Auth->>Redis: Check rate limit
    Redis-->>Auth: Rate limit status
    
    Auth->>Database: Find user by phone
    Database-->>Auth: User data
    
    Auth->>Auth: Generate OTP
    Auth->>Database: Store OTP
    Auth->>SMS: Send OTP
    SMS-->>Auth: Send confirmation
    
    Auth-->>API: OTP sent response
    API-->>Admin: OTP sent confirmation
    
    Admin->>API: POST /auth/verify-otp
    API->>Auth: Forward OTP verification
    Auth->>Database: Verify OTP
    Database-->>Auth: Validation result
    
    Auth->>Auth: Generate JWT tokens with admin role
    Auth->>Database: Store admin session
    Auth->>Redis: Cache admin permissions
    
    Auth->>Database: Log admin login
    Auth-->>API: Auth response with admin data
    API-->>Admin: JWT tokens + admin permissions
```

---

## 6. Implementation Phases

### 6.1 Phase 1: Core Authentication Backend (Week 1-2)
- [ ] Set up database tables and indexes
- [ ] Implement OTP generation and validation
- [ ] Create basic authentication APIs
- [ ] Set up rate limiting and security middleware
- [ ] Implement basic audit logging

### 6.3 Phase 3: Mobile Authentication Implementation (Week 3-4)
- [ ] Implement phone number validation and formatting
- [ ] Create mobile authentication UI components
- [ ] Build OTP verification screens
- [ ] Implement session management
- [ ] Add device fingerprinting

### 6.4 Phase 4: Admin Panel Authentication (Week 4-5)
- [ ] Create admin login interface
- [ ] Implement admin dashboard authentication
- [ ] Build admin session management

### 6.5 Phase 5: Advanced Security Features (Week 5-6)
- [ ] Implement anomaly detection
- [ ] Add advanced rate limiting

---

## 9. Deployment Considerations

### 9.1 Environment Configuration
- Development: Test OTP providers, relaxed rate limits
- Staging: Production-like OTP providers, production rate limits
- Production: Full security measures, comprehensive monitoring

### 9.2 Database Optimization
- Proper indexing for all lookup queries
- Connection pooling for high traffic
- Read replicas for authentication queries
- Regular cleanup of expired tokens and OTPs

### 9.3 Security Hardening
- HTTPS everywhere with proper certificates
- IP whitelisting for admin access
- Comprehensive logging and monitoring
- Regular security audits and penetration testing

---

## 10. User Experience (UX) Specifications

### 10.1 Admin Panel Authentication UX

#### Login Flow
**Visual Design:**
- Clean, professional login screen with company branding
- Phone input field with Jordan country code pre-filled (+962)
- Large, accessible OTP input fields (6 digits, separate boxes)
- Progress indicator showing authentication steps
- Real-time validation feedback with visual cues

**Interaction Design:**
- Auto-format phone number as user types (XXX XXXXX format)
- Auto-focus next OTP field after digit entry
- Countdown timer showing OTP expiry (5 minutes)
- Resend OTP button with cooldown timer (30 seconds)
- Remember device option for trusted admin workstations

**Accessibility Features:**
- Screen reader compatible with ARIA labels
- Keyboard navigation support (Tab, Enter, Arrow keys)
- High contrast mode support
- Voice control compatibility
- Large touch targets for accessibility

**Error Handling:**
- Clear error messages with actionable guidance
- Rate limiting feedback with next attempt time
- Account lockout warnings with unlock instructions
- Failed login attempt counter display

### 10.2 Buyer App and Merchant App Authentication UX

#### Onboarding Flow
**Visual Design:**
- Welcome screen with app benefits showcase
- Step-by-step authentication guide with illustrations
- Phone verification screen with country selection
- OTP input with animated number entry feedback
- Success celebration animation on first login

**Interaction Design:**
- Phone number auto-detection from device
- OTP auto-fill from SMS messages
- Biometric authentication option after initial login
- Quick re-authentication for sensitive actions
- Social login alternatives (if enabled)

**Personalization:**
- Welcome message with user's name
- Personalized dashboard based on user history
- Quick access to recent requests and bids
- Onboarding checklist for new users

**Trust & Security:**
- Security badges and certifications display
- Privacy policy and terms highlights
- Data protection information
- Account security tips and best practices

#### Profile Management
**Visual Design:**
- Profile picture upload with crop tool
- Personal information form with validation
- Notification preferences with toggle switches
- Security settings with visual indicators

**User-Friendly Features:**
- Auto-save draft functionality
- Field validation with real-time feedback
- Progress indicators for profile completion
- Quick edit mode for frequent updates

#### Design System
**Visual Consistency:**
- Unified color palette across all platforms
- Consistent typography and spacing
- Standardized button styles and interactions
- Cohesive iconography and imagery

**Interaction Patterns:**
- Consistent gesture support (swipe, tap, long press)
- Unified loading states and progress indicators
- Standardized error and success message displays
- Common navigation patterns and layouts

#### Responsive Design
**Mobile Optimization:**
- Touch-optimized interface elements
- Thumb-friendly button sizes (minimum 44px)
- Gesture-based navigation and interactions
- Adaptive layouts for different screen sizes

**Desktop Experience:**
- Keyboard shortcuts for power users
- Mouse hover states and tooltips
- Window resizing and multi-window support
- High DPI display optimization

### 10.5 Performance & Accessibility

#### Performance Optimization
**Loading Performance:**
- Instant app launch with cached authentication
- Progressive loading of authentication components
- Optimized image and asset delivery
- Background sync for offline functionality

**Network Optimization:**
- Offline authentication with cached credentials
- Data compression for reduced bandwidth usage
- Intelligent retry mechanisms for failed requests
- Graceful degradation on poor connections

#### Accessibility Standards
**WCAG 2.1 AA Compliance:**
- Semantic HTML structure for screen readers
- Color contrast ratios meeting WCAG standards
- Keyboard accessibility for all features
- Focus management and visible focus indicators

**Inclusive Design:**
- Multi-language support with RTL compatibility
- Font size adjustment without layout breakage
- Voice control and dictation support
- Cognitive accessibility with clear language

### 10.6 User Feedback & Analytics

#### User Experience Metrics
**Key Performance Indicators:**
- Authentication completion rate
- Average time to successful login
- OTP entry accuracy rate
- Support ticket reduction rate

**User Satisfaction:**
- Post-authentication satisfaction surveys
- User experience rating system
- Feature usage analytics
- Drop-off point analysis

#### Continuous Improvement
**A/B Testing:**
- Authentication flow variations
- UI element placement optimization
- Copy and messaging effectiveness
- Visual design improvements

**User Feedback Integration:**
- In-app feedback collection tools
- User interview and testing programs
- Community feedback integration
- Rapid iteration based on user insights


---


## 12. Admin Panel Technical Specification

### 12.1 Admin Panel Architecture Overview

The admin panel serves as the central management interface for the reverse marketplace, providing comprehensive user management, and administrative controls. the admin panel leverages role-based access control and secure session management.

#### 12.1.1 Core Design Principles

✅ **Role-Based Administration**
- Three-tier admin hierarchy (SUPER_ADMIN, ADMIN, SUPPORT)
- Granular permission system for feature access
- Secure device and session management

✅ **Comprehensive User Management**
- Real-time user monitoring 
- Advanced filtering and search capabilities
- Bulk operations for efficient administration

✅ **System Monitoring & Analytics**
- Real-time dashboard with key metrics
- Performance monitoring and alerting
- Security incident tracking and response
- Business intelligence and reporting

### 12.2 Admin Panel Database Schema Extensions

#### 12.2.1 Admin Activity Logs Table
```sql
CREATE TABLE admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type admin_action_type NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NULL,
    target_phone VARCHAR(20) NULL,
    action_details JSONB DEFAULT '{}',
    ip_address INET NULL,
    user_agent TEXT NULL,
    success BOOLEAN NOT NULL,
    failure_reason TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE admin_action_type AS ENUM (
    'USER_VIEW', 'USER_EDIT', 'USER_SUSPEND', 'USER_BAN', 'USER_DELETE',
    'USER_BULK_ACTION', 'ADMIN_ADD', 'ADMIN_EDIT', 'ADMIN_REMOVE',
    'SYSTEM_CONFIG_CHANGE', 'EXPORT_DATA', 'IMPORT_DATA', 'SECURITY_ALERT',
    'SESSION_TERMINATE', 'PASSWORD_RESET', 'VERIFICATION_OVERRIDE'
);

-- Indexes
CREATE INDEX idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_logs_action_type ON admin_activity_logs(action_type);
CREATE INDEX idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);
CREATE INDEX idx_admin_activity_logs_target ON admin_activity_logs(target_type, target_id);
```
### 12.3 Admin Panel API Specifications

#### 12.3.1 User Management Endpoints

##### GET `/admin/users`
```typescript
interface GetUsersRequest {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'BUYER' | 'MERCHANT' | 'ADMIN' | 'ALL';
  status?: 'PENDING' | 'ACTIVE' | 'BANNED' | 'SUSPENDED' | 'ALL';
  registrationDateFrom?: string;
  registrationDateTo?: string;
  lastLoginFrom?: string;
  lastLoginTo?: string;
  sortBy?: 'createdAt' | 'lastLoginAt' | 'phone' | 'name';
  sortOrder?: 'asc' | 'desc';
}

interface GetUsersResponse {
  success: boolean;
  users: Array<{
    id: string;
    phone: string;
    role: string;
    status: string;
    phoneVerified: boolean;
    createdAt: string;
    lastLoginAt: string | null;
    failedLoginAttempts: number;
    lockedUntil: string | null;
    profile?: {
      firstName: string;
      lastName: string;
      email?: string;
      city?: string;
      country?: string;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    appliedFilters: Record<string, any>;
    availableFilters: Array<{
      key: string;
      label: string;
      type: 'select' | 'date' | 'text';
      options?: Array<{ value: string; label: string }>;
    }>;
  };
}
```

##### POST `/admin/users/{userId}/suspend`
```typescript
interface SuspendUserRequest {
  reason: string;
  duration?: number; // in hours, null for indefinite
  notifyUser?: boolean;
  internalNote?: string;
}

interface SuspendUserResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    status: string;
    suspendedUntil: string | null;
  };
}
```

##### POST `/admin/users/{userId}/ban`
```typescript
interface BanUserRequest {
  reason: string;
  permanent: boolean;
  notifyUser?: boolean;
  internalNote?: string;
  deleteData?: boolean; // option to delete user data
}

interface BanUserResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    status: string;
    bannedAt: string;
  };
}
```

##### POST `/admin/users/bulk-action`
```typescript
interface BulkActionRequest {
  userIds: string[];
  action: 'SUSPEND' | 'BAN' | 'DELETE' | 'VERIFY' | 'SEND_NOTIFICATION';
  actionData: {
    reason?: string;
    duration?: number;
    notifyUsers?: boolean;
    internalNote?: string;
    message?: string;
  };
}

interface BulkActionResponse {
  success: boolean;
  processed: number;
  successful: Array<{
    userId: string;
    success: boolean;
    message?: string;
  }>;
  failed: Array<{
    userId: string;
    error: string;
  }>;
  summary: {
    totalProcessed: number;
    successCount: number;
    failureCount: number;
  };
}
```

#### 12.3.3 System Monitoring Endpoints

##### GET `/admin/dashboard/metrics`
```typescript
interface DashboardMetricsResponse {
  success: boolean;
  metrics: {
    users: {
      total: number;
      active: number;
      newToday: number;
      newThisWeek: number;
      byRole: Record<string, number>;
      byStatus: Record<string, number>;
    };
    authentication: {
      loginAttemptsToday: number;
      successfulLoginsToday: number;
      failedLoginsToday: number;
      otpSentToday: number;
      averageLoginTime: number;
    };
  };
  trends: {
    userRegistrations: Array<{
      date: string;
      count: number;
    }>;
    loginActivity: Array<{
      date: string;
      successful: number;
      failed: number;
    }>;
    securityEvents: Array<{
      date: string;
      events: number;
    }>;
  };
}
```

### 12.4 Admin Panel User Interface Specifications

#### 12.4.1 Dashboard Layout

**Main Dashboard Components:**
- **Header**: Admin profile, session status, quick actions, notifications
- **Sidebar Navigation**: Main menu with role-based visibility
- **Metrics Overview**: Key performance indicators with real-time updates
- **Activity Feed**: Recent system events and admin actions
- **Quick Actions**: Common tasks with one-click access

**Navigation Structure:**
```
Dashboard
├── Overview
├── Users
├── System
│   ├── Monitoring
├── Analytics
│   ├── User Analytics
│   ├── Business Metrics
│   ├── Performance Reports
│   └── Custom Reports
```

#### 12.4.2 User Management Interface

**User List View:**
- Advanced filtering system with saved filter presets
- Sortable columns with custom sorting options
- Bulk selection with action toolbar
- Real-time search with highlighting
- Export functionality (CSV, Excel, PDF)

**User Detail View:**
- **Profile Section**: Basic user information with edit capabilities
- **Authentication History**: Login attempts, devices, sessions
- **Activity Timeline**: User actions with chronological display
- **Quick Actions**: Suspend, ban, verify, reset, notify

**User Actions Panel:**
```typescript
interface UserActions {
  account: {
    suspend: { duration: number; reason: string };
    ban: { permanent: boolean; reason: string };
    delete: { confirm: boolean; dataDeletion: boolean };
  };
  verification: {
    verifyPhone: { method: 'AUTO' | 'MANUAL' };
    verifyMerchant: { documents: string[]; notes: string };
    overrideSuspension: { reason: string };
  };
  communication: {
    sendNotification: { message: string; channels: string[] };
    addNote: { content: string; type: string; visibility: string };
  };
  security: {
    terminateSessions: { allDevices: boolean };
    requireReauth: { reason: string };
  };
}
```