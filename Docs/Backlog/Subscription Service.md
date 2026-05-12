# Subscription Service Backlog

## Merchant & Buyer Subscription Management Service

Service Name:

```text id="sub9k2m"
subscription-service
```

Primary Responsibility:

* Subscription plan management
* Recurring billing and payments
* Feature-based access control
* Usage tracking and limits
* Free trials and promotions
* Revenue analytics and reporting
* Churn prediction and prevention
* Subscription lifecycle management

Recommended Stack:

* NestJS
* PostgreSQL
* Prisma ORM
* Stripe/Payment Gateway Integration
* Redis
* RabbitMQ
* Bull Queue for billing jobs

---

# Service Boundaries

## Owns

* Subscription Plans
* User Subscriptions
* Billing Records
* Feature Usage Tracking
* Revenue Analytics
* Subscription Events

## Publishes Events

* subscription.started
* subscription.cancelled
* subscription.upgraded
* subscription.downgraded
* billing.success
* billing.failed
* trial.started
* trial.ended
* feature.usage.limit_reached

## Consumes Events

* user.registered
* user.banned
* payment.completed
* payment.failed

---

# Core Business Rules

---

## Subscription Rules

* Only verified users can subscribe
* Free trials limited to one per user
* Subscription auto-renews by default
* Downgrades take effect next billing cycle
* Upgrades prorate immediately
* Usage limits enforced in real-time

---

## Billing Rules

* Billing occurs on subscription anniversary
* Failed payments trigger retry schedule
* Multiple failed payments suspend subscription
* Proration calculated for mid-cycle changes
* Refunds handled according to policy

---

## Feature Access Rules

* Feature access validated on each request
* Usage limits tracked in real-time
- Soft limits notify user
* Hard limits block access
* Admin overrides available

---

# Database Schema Overview

---

# subscription_plans

| Column         | Type          |
| -------------- | ------------- |
| id             | UUID          |
| name           | VARCHAR(100)  |
| description    | TEXT          |
| type           | ENUM          |
| price          | DECIMAL(12,2) |
| currency       | VARCHAR(3)    |
| billing_cycle  | ENUM          |
| trial_days     | INTEGER       |
| features       | JSONB         |
| is_active      | BOOLEAN       |
| sort_order     | INTEGER       |
| max_users      | INTEGER       |
| created_at     | TIMESTAMP     |
| updated_at     | TIMESTAMP     |

---

# subscriptions

| Column                | Type          |
| --------------------- | ------------- |
| id                    | UUID          |
| user_id               | UUID          |
| plan_id               | UUID          |
| status                | ENUM          |
| current_period_start  | DATE          |
| current_period_end    | DATE          |
| next_billing_date     | DATE          |
| auto_renew            | BOOLEAN       |
| cancelled_at          | TIMESTAMP     |
| cancelled_reason      | TEXT          |
| trial_ends_at         | DATE          |
| plan_price            | DECIMAL(12,2) |
| currency              | VARCHAR(3)    |
| created_at            | TIMESTAMP     |
| updated_at            | TIMESTAMP     |

---

# subscription_features

| Column           | Type          |
| ---------------- | ------------- |
| id               | UUID          |
| plan_id          | UUID          |
| feature_code     | VARCHAR(100)  |
| feature_name     | VARCHAR(255)  |
| feature_type     | ENUM          |
| is_included      | BOOLEAN       |
| usage_limit      | INTEGER       |
| reset_frequency  | ENUM          |
| created_at       | TIMESTAMP     |

---

# subscription_billing

| Column                | Type          |
| --------------------- | ------------- |
| id                    | UUID          |
| subscription_id       | UUID          |
| amount                | DECIMAL(12,2) |
| currency              | VARCHAR(3)    |
| billing_period_start  | DATE          |
| billing_period_end    | DATE          |
| status                | ENUM          |
| payment_method_id     | UUID          |
| transaction_id        | UUID          |
| invoice_number        | VARCHAR(100)  |
| due_date              | DATE          |
| paid_at               | TIMESTAMP     |
| failed_attempts       | INTEGER       |
| next_retry_at         | TIMESTAMP     |
| created_at            | TIMESTAMP     |
| updated_at            | TIMESTAMP     |

---

# subscription_usage

| Column          | Type          |
| --------------- | ------------- |
| id              | UUID          |
| subscription_id | UUID          |
| feature_code    | VARCHAR(100)  |
| usage_amount    | INTEGER       |
| usage_period    | DATE          |
| recorded_at     | TIMESTAMP     |

---

# subscription_analytics

| Column          | Type          |
| --------------- | ------------- |
| id              | UUID          |
| subscription_id | UUID          |
| plan_id         | UUID          |
| user_id         | UUID          |
| event_type      | ENUM          |
| amount          | DECIMAL(12,2) |
| currency        | VARCHAR(3)    |
| metadata        | JSONB         |
| created_at      | TIMESTAMP     |

---

# ENUM Types

```sql id="sub_enums"
-- plan_type
CREATE TYPE plan_type AS ENUM ('STANDARD', 'PREMIUM', 'ENTERPRISE', 'CUSTOM');

-- billing_cycle_type
CREATE TYPE billing_cycle_type AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- subscription_status
CREATE TYPE subscription_status AS ENUM ('TRIAL', 'ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED', 'SUSPENDED');

-- billing_status
CREATE TYPE billing_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'PARTIALLY_PAID', 'CANCELLED');

-- feature_type
CREATE TYPE feature_type AS ENUM ('BOOLEAN', 'COUNTED', 'METERED');

-- reset_frequency_type
CREATE TYPE reset_frequency_type AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'NEVER');

-- analytics_event_type
CREATE TYPE analytics_event_type AS ENUM (
    'SUBSCRIPTION_STARTED', 'SUBSCRIPTION_CANCELLED', 'PLAN_UPGRADED', 'PLAN_DOWNGRADED',
    'BILLING_SUCCESS', 'BILLING_FAILED', 'TRIAL_STARTED', 'TRIAL_CONVERTED',
    'FEATURE_USED', 'RENEWAL_SUCCESS', 'RENEWAL_FAILED'
);
```

---

# EPIC SUB-0 — Service Foundation

---

# FEATURE SUB-0.1 — Service Initialization

---

## SUB-001 — Initialize Subscription Service

### Priority

Critical

### Description

Create NestJS microservice for subscription management.

### Acceptance Criteria

* NestJS initialized
* Healthcheck endpoint exists
* ConfigModule setup
* Environment validation setup

### Technical Notes

Use:

* NestJS
* TypeScript
* Prisma ORM

### Deliverables

```text id="sub_folder"
/services/subscription-service
```

---

## SUB-002 — Setup PostgreSQL Connection

### Acceptance Criteria

* DB connection operational
* Retry logic enabled
* Connection pooling enabled

---

## SUB-003 — Setup Redis Connection

### Acceptance Criteria

* Redis operational
* Cache manager configured
* Retry support enabled

---

## SUB-004 — Setup RabbitMQ Integration

### Acceptance Criteria

* Producer configured
* Consumer configured
* Reconnect strategy implemented

---

## SUB-005 — Configure Structured Logging

### Acceptance Criteria

* Request IDs generated
* Correlation IDs supported
* JSON logs enabled

---

# FEATURE SUB-0.2 — Database Setup

---

## SUB-010 — Create Subscription Plans Migration

### Description

Create subscription_plans table and indexes.

### Acceptance Criteria

* UUID primary key
* Plan type enum exists
* Billing cycle enum exists
* Features JSONB column
* Active status tracking

---

## SUB-011 — Create Subscriptions Table

---

## SUB-012 — Create Subscription Features Table

---

## SUB-013 — Create Subscription Billing Table

---

## SUB-014 — Create Subscription Usage Table

---

## SUB-015 — Create Subscription Analytics Table

---

## SUB-016 — Setup Prisma Models

### Acceptance Criteria

* All models mapped
* Relations configured
* Migration generation operational

---

# EPIC SUB-1 — Subscription Management

---

# FEATURE SUB-1.1 — Plan Management

---

## SUB-100 — Get Available Plans

### Endpoint

```http id="sub_plans_get"
GET /subscription/plans
```

### Acceptance Criteria

* Return active plans only
* Include feature details
* Support filtering by type
* Sort by price and features

---

## SUB-101 — Create Subscription Plan (Admin)

### Endpoint

```http id="sub_plan_create"
POST /admin/subscription/plans
```

### Acceptance Criteria

* Admin-only access
* Plan validation
* Feature configuration
* Price validation

---

## SUB-102 — Update Subscription Plan (Admin)

---

## SUB-103 — Deactivate Subscription Plan (Admin)

---

# FEATURE SUB-1.2 — User Subscriptions

---

## SUB-110 — Subscribe to Plan

### Endpoint

```http id="sub_subscribe"
POST /subscription/subscribe
```

### Acceptance Criteria

* Validate user eligibility
* Process payment method
* Create subscription record
* Start trial if applicable
* Publish subscription.started event

---

## SUB-111 — Get Current Subscription

### Endpoint

```http id="sub_current"
GET /subscription/current
```

### Acceptance Criteria

* Return active subscription
* Include plan details
* Show usage statistics
* Display billing information

---

## SUB-112 — Upgrade Subscription

### Endpoint

```http id="sub_upgrade"
PUT /subscription/upgrade
```

### Acceptance Criteria

* Validate upgrade eligibility
* Calculate proration
* Process payment difference
* Update subscription immediately
* Publish subscription.upgraded event

---

## SUB-113 — Downgrade Subscription

### Endpoint

```http id="sub_downgrade"
PUT /subscription/downgrade
```

### Acceptance Criteria

* Schedule downgrade for next cycle
* No immediate payment required
* Update future billing date
* Publish subscription.downgraded event

---

## SUB-114 — Cancel Subscription

### Endpoint

```http id="sub_cancel"
DELETE /subscription/cancel
```

### Acceptance Criteria

* Immediate cancellation option
* End-of-period cancellation option
* Cancel auto-renewal
* Publish subscription.cancelled event
* Handle refunds according to policy

---

## SUB-115 — Pause Subscription

### Acceptance Criteria

* Validate pause eligibility
* Suspend billing
* Maintain access to paid features
* Update subscription status

---

## SUB-116 — Resume Subscription

### Acceptance Criteria

* Reactivate billing
* Restore full access
* Calculate proration for pause period
* Update subscription status

---

# EPIC SUB-2 — Billing & Payments

---

# FEATURE SUB-2.1 — Recurring Billing

---

## SUB-200 — Process Billing Cycle

### Description

Automated job to process recurring billing.

### Acceptance Criteria

* Daily job execution
* Process due subscriptions
* Handle payment failures
* Update billing records
* Send notifications

### Queue

```text id="sub_billing_queue"
billing_queue
```

---

## SUB-201 — Handle Payment Failure

### Acceptance Criteria

* Increment failure count
* Schedule retry attempts
* Suspend after max failures
* Notify user of issues
* Publish billing.failed event

---

## SUB-202 — Process Refunds

### Endpoint

```http id="sub_refund"
POST /admin/subscription/refunds
```

### Acceptance Criteria

* Admin-only access
* Refund amount validation
* Proration calculation
* Update billing records
* Process payment refund

---

## SUB-203 — Get Billing History

### Endpoint

```http id="sub_billing_history"
GET /subscription/billing
```

### Acceptance Criteria

* Paginated results
* Filter by date range
* Include payment status
* Show invoice details

---

# FEATURE SUB-2.2 — Payment Integration

---

## SUB-210 — Setup Payment Gateway

### Acceptance Criteria

* Stripe integration
* Webhook handling
* Customer management
* Payment method storage

---

## SUB-211 — Process Payment

### Acceptance Criteria

* Charge customer
* Handle 3D Secure
* Store transaction
* Update billing record

---

## SUB-212 — Handle Webhooks

### Acceptance Criteria

* Verify webhook signature
* Process payment events
* Update subscription status
* Handle failures gracefully

---

# EPIC SUB-3 — Feature Access Control

---

# FEATURE SUB-3.1 — Feature Validation

---

## SUB-300 — Check Feature Access

### Endpoint

```http id="sub_feature_check"
POST /subscription/features/check
```

### Acceptance Criteria

* Validate subscription status
* Check feature inclusion
* Enforce usage limits
* Return access decision
* Provide upgrade suggestions

---

## SUB-301 — Record Feature Usage

### Endpoint

```http id="sub_feature_usage"
POST /subscription/features/usage
```

### Acceptance Criteria

* Validate usage permissions
* Update usage counters
* Check limit thresholds
* Trigger limit notifications
* Log usage analytics

---

## SUB-302 — Reset Usage Counters

### Description

Scheduled job to reset usage counters.

### Acceptance Criteria

* Daily reset for daily limits
* Weekly reset for weekly limits
* Monthly reset for monthly limits
* Maintain historical usage

---

## SUB-303 — Get Usage Statistics

### Endpoint

```http id="sub_usage_stats"
GET /subscription/usage
```

### Acceptance Criteria

* Current usage per feature
* Remaining usage limits
* Usage history
* Reset schedule information

---

# FEATURE SUB-3.2 — Limit Enforcement

---

## SUB-310 — Enforce Hard Limits

### Acceptance Criteria

* Block feature access when limit reached
* Return appropriate error messages
* Log limit violations
* Trigger upgrade prompts

---

## SUB-311 — Notify Soft Limits

### Acceptance Criteria

* Notify users approaching limits
* Send email notifications
* Display in-app warnings
* Suggest plan upgrades

---

## SUB-312 — Admin Override

### Endpoint

```http id="sub_admin_override"
POST /admin/subscription/override
```

### Acceptance Criteria

* Admin-only access
* Temporary limit increase
* Override reason logging
* Audit trail maintenance

---

# EPIC SUB-4 — Analytics & Reporting

---

# FEATURE SUB-4.1 — Revenue Analytics

---

## SUB-400 — Calculate Revenue Metrics

### Description

Daily job to calculate revenue metrics.

### Acceptance Criteria

* MRR (Monthly Recurring Revenue)
* ARR (Annual Recurring Revenue)
* Churn rate calculation
* LTV (Lifetime Value)
* Revenue by plan

---

## SUB-401 — Get Revenue Dashboard

### Endpoint

```http id="sub_revenue_dash"
GET /admin/subscription/revenue
```

### Acceptance Criteria

* Revenue trends
* Subscriber growth
* Churn analysis
* Plan performance
* Geographic breakdown

---

## SUB-402 — Generate Financial Reports

### Endpoint

```http id="sub_financial_report"
GET /admin/subscription/reports
```

### Acceptance Criteria

* Monthly revenue reports
* Subscriber reports
* Churn analysis reports
* Plan performance reports
* Export to CSV/PDF

---

# FEATURE SUB-4.2 — Usage Analytics

---

## SUB-410 — Analyze Feature Usage

### Acceptance Criteria

* Most used features
* Usage by plan tier
* Usage patterns
* Peak usage times
* Feature adoption rates

---

## SUB-411 — Predict Churn

### Description

ML model to predict subscription churn.

### Acceptance Criteria

* Risk scoring algorithm
* Early warning system
* Intervention recommendations
* Retention strategies

---

## SUB-412 — Subscriber Insights

### Endpoint

```http id="sub_insights"
GET /admin/subscription/insights
```

### Acceptance Criteria

* Subscriber demographics
* Behavior patterns
* Upgrade/downgrade trends
* Trial conversion rates
* Retention metrics

---

# EPIC SUB-5 — Trials & Promotions

---

# FEATURE SUB-5.1 — Trial Management

---

## SUB-500 — Start Free Trial

### Acceptance Criteria

* Validate trial eligibility
* Create trial subscription
* Set trial expiration
* Send trial notifications
* Schedule conversion check

---

## SUB-501 — Convert Trial to Paid

### Description

Automated job to convert trials.

### Acceptance Criteria

* Check trial expiration
* Process payment method
* Convert to paid subscription
* Handle conversion failure
* Send conversion notifications

---

## SUB-502 — Extend Trial

### Endpoint

```http id="sub_extend_trial"
POST /admin/subscription/trials/extend
```

### Acceptance Criteria

* Admin-only access
* Extension reason validation
* Update trial end date
* Notify user of extension

---

# FEATURE SUB-5.2 — Promotional Codes

---

## SUB-510 — Create Promo Code

### Endpoint

```http id="sub_promo_create"
POST /admin/subscription/promo-codes
```

### Acceptance Criteria

* Code generation
* Discount configuration
* Usage limits
* Expiration dates
* Target restrictions

---

## SUB-511 — Apply Promo Code

### Endpoint

```http id="sub_promo_apply"
POST /subscription/promo-codes/apply
```

### Acceptance Criteria

* Code validation
* Discount calculation
* Usage tracking
* Apply to subscription

---

## SUB-512 — Validate Promo Code

### Endpoint

```http id="sub_promo_validate"
GET /subscription/promo-codes/{code}/validate
```

### Acceptance Criteria

* Code existence check
* Expiration validation
* Usage limit check
* Return discount details

---

# EPIC SUB-6 — Admin Management

---

# FEATURE SUB-6.1 — Subscriber Management

---

## SUB-600 — Get All Subscriptions

### Endpoint

```http id="sub_admin_list"
GET /admin/subscription/subscriptions
```

### Acceptance Criteria

* Paginated results
* Advanced filtering
* Search functionality
* Export capabilities

---

## SUB-601 — Get Subscriber Details

### Endpoint

```http id="sub_admin_details"
GET /admin/subscription/subscribers/{id}
```

### Acceptance Criteria

* Complete subscriber profile
* Subscription history
* Usage statistics
* Payment history
* Support notes

---

## SUB-602 — Manual Subscription Adjustment

### Endpoint

```http id="sub_admin_adjust"
POST /admin/subscription/subscriptions/{id}/adjust
```

### Acceptance Criteria

* Admin-only access
* Adjustment reason required
* Billing proration
* Audit logging
* User notification

---

## SUB-603 — Bulk Operations

### Endpoint

```http id="sub_admin_bulk"
POST /admin/subscription/bulk
```

### Acceptance Criteria

* Bulk subscription updates
* Bulk billing adjustments
* Bulk plan changes
* Progress tracking

---

# EPIC SUB-7 — Security & Compliance

---

# FEATURE SUB-7.1 — Security

---

## SUB-700 — Subscription Access Control

### Acceptance Criteria

* User can only access own subscriptions
* Admin role-based access
* API rate limiting
* Request validation

---

## SUB-701 — Data Encryption

### Acceptance Criteria

* Payment data encryption
* Personal data protection
* Secure key management
* Compliance with regulations

---

## SUB-702 — Audit Logging

### Acceptance Criteria

* All subscription changes logged
* Admin actions tracked
* Payment events recorded
* Security events monitored

---

# FEATURE SUB-7.2 — Compliance

---

## SUB-710 — GDPR Compliance

### Acceptance Criteria

* Data portability
* Right to erasure
* Consent management
* Data processing records

---

## SUB-711 — Financial Compliance

### Acceptance Criteria

* PCI DSS compliance
* Financial data protection
* Audit trail maintenance
* Regulatory reporting

---

# EPIC SUB-8 — Monitoring & Observability

---

# FEATURE SUB-8.1 — Metrics

---

## SUB-800 — Prometheus Metrics

### Metrics

* Subscription count by status
* Revenue metrics
* Billing success rate
* Feature usage metrics
* Churn rate

---

## SUB-801 — Healthcheck Endpoint

### Endpoint

```http id="sub_health"
GET /health
```

### Acceptance Criteria

* Database connectivity
* Redis connectivity
* RabbitMQ connectivity
* Payment gateway status

---

## SUB-802 — Distributed Tracing

### Acceptance Criteria

* Request tracing
* Database query tracing
* External service tracing
* Error tracking

---

## SUB-803 — Business Metrics Dashboard

### Acceptance Criteria

* Real-time subscriber count
* Revenue tracking
* Churn monitoring
* Feature adoption metrics

---

# EPIC SUB-9 — Testing & QA

---

# FEATURE SUB-9.1 — Unit Testing

---

## SUB-900 — Subscription Service Tests

## SUB-901 — Billing Service Tests

## SUB-902 — Feature Access Tests

---

# FEATURE SUB-9.2 — Integration Testing

---

## SUB-910 — Payment Gateway Tests

## SUB-911 — Database Integration Tests

## SUB-912 — Event Publishing Tests

---

# FEATURE SUB-9.3 — E2E Testing

---

## SUB-920 — Full Subscription Lifecycle Test

### Scenario

* User subscribes to plan
* Trial period management
* Billing cycle processing
* Feature access validation
* Subscription cancellation

---

## SUB-921 — Billing Failure Test

---

## SUB-922 — Feature Limit Test

---

# Recommended Folder Structure

```text id="sub_structure"
/services/subscription-service
├── src/
│   ├── modules/
│   │   ├── plans/
│   │   ├── subscriptions/
│   │   ├── billing/
│   │   ├── features/
│   │   ├── analytics/
│   │   ├── admin/
│   │   └── trials/
│   │
│   ├── common/
│   │   ├── guards/
│   │   ├── decorators/
│   │   ├── interceptors/
│   │   ├── filters/
│   │   └── utils/
│   │
│   ├── infrastructure/
│   │   ├── prisma/
│   │   ├── redis/
│   │   ├── rabbitmq/
│   │   ├── stripe/
│   │   └── logger/
│   │
│   ├── config/
│   └── main.ts
│
├── prisma/
├── test/
└── Dockerfile
```

---

# Recommended Sprint Breakdown

| Sprint   | Scope                      |
| -------- | -------------------------- |
| Sprint 1 | Service foundation + DB    |
| Sprint 2 | Plan management           |
| Sprint 3 | Subscription lifecycle     |
| Sprint 4 | Billing & payments         |
| Sprint 5 | Feature access control     |
| Sprint 6 | Analytics & reporting      |
| Sprint 7 | Trials & promotions        |
| Sprint 8 | Admin tools + security     |
| Sprint 9 | QA + hardening             |

---

# Definition of Done (DoD)

A task is considered DONE only if:

* Code reviewed
* Tests written
* Swagger documented
* Metrics added
* Logs added
* RBAC applied
* Error handling complete
* Events documented
* Monitoring enabled
* CI pipeline passing
* Security review completed

---

# Integration Points

## External Services

* **Payment Gateway**: Stripe/PayPal integration
* **Email Service**: Trial/billing notifications
* **Analytics Service**: Usage and revenue data
* **Identity Service**: User validation

## Internal Services

* **Identity Service**: User authentication and roles
* **Notification Service**: Subscription notifications
* **Payment Service**: Payment processing
* **Admin Service**: Admin panel integration
