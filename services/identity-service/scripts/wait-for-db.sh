#!/bin/sh
set -e

# Universal Database wait script for Microservices
SERVICE_NAME=$(basename $(pwd))
echo "🚀 $SERVICE_NAME - Database initialization"

# Wait for database
DB_HOST=$1
case "$DB_HOST" in
    "postgres") DB_PORT=5432 ;;
    "mongodb") DB_PORT=27017 ;;
    "redis") DB_PORT=6379 ;;
    "rabbitmq") DB_PORT=5672 ;;
    "cassandra") DB_PORT=9042 ;;
    *) DB_PORT=5432 ;;
esac

echo "⏳ Waiting for $DB_HOST on port $DB_PORT..."

# Use node to check connectivity (portable across all our service containers)
until node -e "
const net = require('net');
const client = net.createConnection({ port: $DB_PORT, host: '$DB_HOST' }, () => {
    process.exit(0);
});
client.on('error', () => {
    process.exit(1);
});
setTimeout(() => {
    process.exit(1);
}, 1000);
" >/dev/null 2>&1; do
    echo "$DB_HOST unavailable - sleeping"
    sleep 2
done

echo "✅ Database $DB_HOST is ready"

# Check if migrations should run
if [ "$DB_MIGRATE" = "true" ]; then
    echo "🔄 Running database migrations..."
    if npm run migration:run >/dev/null 2>&1; then
        npm run migration:run
    else
        echo "⚠️ Migration command not found or failed, skipping"
    fi
fi

# Check if seeding should run
if [ "$DB_SEED" = "true" ]; then
    echo "🌱 Running seed data..."
    if npm run seed:run >/dev/null 2>&1; then
        npm run seed:run
    else
        echo "⚠️ Seed command not found or failed, skipping"
    fi
fi

echo "🎉 $SERVICE_NAME ready to start!"
