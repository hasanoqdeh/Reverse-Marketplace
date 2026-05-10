#!/bin/bash

# Reverse Marketplace Gateway Startup Script
# This script starts all services behind Kong API Gateway on port 8000

echo "🚀 Starting Reverse Marketplace Gateway Setup..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Navigate to infrastructure directory
cd "$(dirname "$0")/infrastructure/docker"

echo "📦 Building and starting all services..."

# Start all services with Docker Compose
docker compose -f docker-compose.dev.yml up --build -d

echo "⏳ Waiting for services to be ready..."
sleep 30

echo "🔍 Checking service health..."

# Check Kong Gateway
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Kong Gateway is running on port 8000"
else
    echo "⚠️  Kong Gateway might still be starting..."
fi

# Check individual services
echo ""
echo "📊 Service Status:"
echo "🌐 Landing Page:     http://localhost:8000/"
echo "🎛️  Admin Dashboard:  http://localhost:8000/admin"
echo "🔐 Identity Service:  http://localhost:8000/api/identity"
echo "📝 Request Service:   http://localhost:8000/api/request"
echo "🎯 Matching Engine:   http://localhost:8000/api/matching"
echo "💰 Bidding Service:   http://localhost:8000/api/bidding"
echo "🔔 Notification:      http://localhost:8000/api/notification"
echo "💬 Chat Service:       http://localhost:8000/api/chat"
echo "💳 Payment Service:    http://localhost:8000/api/payment"

echo ""
echo "🔧 Admin Tools:"
echo "📊 Kong Admin API:    http://localhost:8001"
echo "🐰 RabbitMQ UI:       http://localhost:15672 (admin/password)"

echo ""
echo "📝 Logs:"
echo "To view logs: docker compose -f infrastructure/docker/docker-compose.dev.yml logs -f [service-name]"
echo "To stop all: docker compose -f infrastructure/docker/docker-compose.dev.yml down"

echo ""
echo "✅ Gateway setup complete! All services are accessible through port 8000"
