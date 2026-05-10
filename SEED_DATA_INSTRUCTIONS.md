# Seed Data Instructions

## ✅ Current Status

**Successfully Running:**
- Docker infrastructure (all databases)
- PostgreSQL database (ready for connections)
- Admin dashboard (running on localhost:3000)

**Completed:**
- Database seed data creation
- Admin dashboard build fixes

## 📋 Database Seed Data Usage

### PostgreSQL Seed Data
I've created a comprehensive SQL seed file (`DATABASE_SEED.sql`) with:

**Identity Service Data:**
- 10 Users (2 admins, 5 buyers, 3 merchants)
- 5 Merchant Profiles with verification status
- 8 Merchant Documents (commercial registration, ID documents, tax certificates)
- 10 Notification Preferences for all users

### How to Run Seed Data

#### Option 1: Direct SQL Execution
```bash
# Connect to PostgreSQL database
docker exec -it reverse-marketplace-postgres psql -U postgres -d reverse_marketplace

# Execute seed data
\i /path/to/DATABASE_SEED.sql
```

#### Option 2: Copy and Paste
```bash
# Copy seed file to container
docker cp DATABASE_SEED.sql reverse-marketplace-postgres:/tmp/

# Execute inside container
docker exec -it reverse-marketplace-postgres psql -U postgres -d reverse_marketplace -f /tmp/DATABASE_SEED.sql
```

#### Option 3: Using Admin Dashboard API
Once microservices are running, you can use the admin dashboard to:
1. Navigate to **Users** section
2. Create test users manually
3. Verify data appears correctly

### 🔍 Verification Commands
```sql
-- Verify users were created
SELECT COUNT(*) FROM users;
SELECT role, COUNT(*) FROM users GROUP BY role;

-- Verify merchant profiles
SELECT COUNT(*) FROM merchant_profiles;
SELECT verification_status, COUNT(*) FROM merchant_profiles GROUP BY verification_status;

-- Verify documents
SELECT COUNT(*) FROM merchant_documents;
SELECT document_type, COUNT(*) FROM merchant_documents GROUP BY document_type;
```

## 🚀 Next Steps

1. **Start Microservices**: Fix dependency issues and start remaining services
2. **Run Service-Specific Seeds**: Use individual service seed runners
3. **Test Integration**: Verify all services can communicate
4. **Access Admin Dashboard**: Use http://localhost:3000 for management

## 📊 Data Summary

The seed data provides:
- **10 Users** with realistic phone numbers and profiles
- **5 Merchant Profiles** with business information
- **8 Documents** for verification purposes
- **10 Notification Preferences** for communication settings

This creates a complete testing environment for the Reverse Marketplace platform with realistic user data, merchant verification, and proper relationships between entities.

## ⚠️ Known Issues

- **Admin Dashboard**: Running but has external connectivity issues
- **Microservices**: Need dependency fixes before they can start
- **Network**: Some services have port conflicts

## 🛠️ Troubleshooting

If admin dashboard is not accessible externally:
1. Check if port 3000 is available: `netstat -tlnp | grep :3000`
2. Verify Next.js is binding correctly: Check logs for binding messages
3. Try accessing via: `curl http://localhost:3000`

The database seed data is ready and can be used immediately with PostgreSQL connection.
