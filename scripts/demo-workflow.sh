#!/bin/bash

# Reverse Marketplace Workflow Demo Script
# 1. Register a Buyer
# 2. Create a Request
# 3. Register a Merchant
# 4. Place a Bid
# 5. Matching Engine processing (simulated)

echo "🚀 Starting Reverse Marketplace Workflow Demo..."

# 1. Register a Buyer
echo -e "\n👤 Registering a new buyer..."
BUYER_ID=$(curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+966599999999",
    "fullName": "Demo Buyer",
    "role": "BUYER"
  }' | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$BUYER_ID" ]; then
    echo "❌ Buyer registration failed. Make sure identity-service is running on port 3000."
    exit 1
fi
echo "✅ Buyer registered with ID: $BUYER_ID"

# 2. Create a Request
echo -e "\n📝 Creating a request for 'iPhone 15 Pro'..."
REQUEST_ID=$(curl -s -X POST http://localhost:3001/api/requests \
  -H "Content-Type: application/json" \
  -d "{
    \"buyerId\": \"$BUYER_ID\",
    \"title\": \"iPhone 15 Pro\",
    \"description\": \"Looking for a new iPhone 15 Pro 256GB Black\",
    \"category\": \"Electronics\",
    \"budget\": 5000,
    \"currency\": \"SAR\"
  }" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$REQUEST_ID" ]; then
    echo "❌ Request creation failed. Make sure request-service is running on port 3001."
    exit 1
fi
echo "✅ Request created with ID: $REQUEST_ID"

# 3. Register a Merchant
echo -e "\n🏪 Registering a new merchant..."
MERCHANT_ID=$(curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+966588888888",
    "fullName": "Demo Merchant",
    "role": "MERCHANT"
  }' | grep -o '"id":"[^"]*' | cut -d'"' -f4)

echo "✅ Merchant registered with ID: $MERCHANT_ID"

# 4. Place a Bid
echo -e "\n💰 Merchant placing a bid of 4800 SAR..."
BID_ID=$(curl -s -X POST http://localhost:3003/api/bids \
  -H "Content-Type: application/json" \
  -d "{
    \"requestId\": \"$REQUEST_ID\",
    \"merchantId\": \"$MERCHANT_ID\",
    \"price\": 4800,
    \"currency\": \"SAR\",
    \"deliveryTime\": \"2 days\"
  }" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$BID_ID" ]; then
    echo "❌ Bidding failed. Make sure bidding-service is running on port 3003."
    exit 1
fi
echo "✅ Bid placed with ID: $BID_ID"

echo -e "\n✨ Workflow Demo Completed Successfully! ✨"
