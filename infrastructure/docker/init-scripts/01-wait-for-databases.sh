#!/bin/bash
# Database readiness detection script
# This script waits for all databases to be ready before allowing services to start

set -e

echo "🔍 Checking database readiness..."

# Function to wait for PostgreSQL
wait_for_postgres() {
    echo "⏳ Waiting for PostgreSQL..."
    until pg_isready -h postgres -p 5432 -U postgres; do
        echo "PostgreSQL is unavailable - sleeping"
        sleep 2
    done
    echo "✅ PostgreSQL is ready"
}

# Function to wait for MongoDB
wait_for_mongodb() {
    echo "⏳ Waiting for MongoDB..."
    until mongosh --host mongodb:27017 --eval "db.adminCommand('ping')" >/dev/null 2>&1; do
        echo "MongoDB is unavailable - sleeping"
        sleep 2
    done
    echo "✅ MongoDB is ready"
}

# Function to wait for Cassandra
wait_for_cassandra() {
    echo "⏳ Waiting for Cassandra..."
    until cqlsh cassandra -e "DESCRIBE KEYSPACES;" >/dev/null 2>&1; do
        echo "Cassandra is unavailable - sleeping"
        sleep 2
    done
    echo "✅ Cassandra is ready"
}

# Function to wait for Redis
wait_for_redis() {
    echo "⏳ Waiting for Redis..."
    until redis-cli -h redis -p 6379 ping >/dev/null 2>&1; do
        echo "Redis is unavailable - sleeping"
        sleep 1
    done
    echo "✅ Redis is ready"
}

# Function to wait for RabbitMQ
wait_for_rabbitmq() {
    echo "⏳ Waiting for RabbitMQ..."
    until rabbitmq-diagnostics -q check_running --node rabbit@reverse-marketplace-rabbitmq >/dev/null 2>&1; do
        echo "RabbitMQ is unavailable - sleeping"
        sleep 2
    done
    echo "✅ RabbitMQ is ready"
}

# Wait for all databases based on what's needed
case "$1" in
    "postgres")
        wait_for_postgres
        ;;
    "mongodb")
        wait_for_mongodb
        ;;
    "cassandra")
        wait_for_cassandra
        ;;
    "redis")
        wait_for_redis
        ;;
    "rabbitmq")
        wait_for_rabbitmq
        ;;
    "all")
        wait_for_postgres
        wait_for_mongodb
        wait_for_cassandra
        wait_for_redis
        wait_for_rabbitmq
        ;;
    *)
        echo "Usage: $0 {postgres|mongodb|cassandra|redis|rabbitmq|all}"
        exit 1
        ;;
esac

echo "🎉 All requested databases are ready!"
