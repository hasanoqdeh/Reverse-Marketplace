#!/bin/bash
set -e

echo "🚀 Initializing PostgreSQL database..."

# Check if this is first run
FIRST_RUN=$(psql -h postgres -U postgres -d reverse_marketplace -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'schema_version')")

if [ "$FIRST_RUN" = "f" ]; then
    echo "📋 First run detected - creating schema and seed data"
    
    # Create schema version tracking table
    psql -h postgres -U postgres -d reverse_marketplace <<-EOSQL
        CREATE TABLE IF NOT EXISTS schema_version (
            version VARCHAR(50) PRIMARY KEY,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            description TEXT
        );
        
        CREATE TABLE IF NOT EXISTS seed_data_version (
            version VARCHAR(50) PRIMARY KEY,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            description TEXT
        );
EOSQL

    # Apply initial schema (if schema.sql exists)
    if [ -f "/docker-entrypoint-initdb.d/schema.sql" ]; then
        echo "📝 Applying initial schema..."
        psql -h postgres -U postgres -d reverse_marketplace < /docker-entrypoint-initdb.d/schema.sql
    fi
    
    # Apply seed data
    if [ -f "/docker-entrypoint-initdb.d/DATABASE_SEED.sql" ]; then
        echo "🌱 Applying seed data..."
        psql -h postgres -U postgres -d reverse_marketplace < /docker-entrypoint-initdb.d/DATABASE_SEED.sql
    fi
    
    # Mark as initialized
    psql -h postgres -U postgres -d reverse_marketplace <<-EOSQL
        INSERT INTO schema_version (version, description) VALUES ('1.0.0', 'Initial schema');
        INSERT INTO seed_data_version (version, description) VALUES ('1.0.0', 'Initial seed data');
EOSQL
    
    echo "✅ Database initialized successfully"
else
    echo "🔄 Database already initialized - ready for migrations"
fi
