#!/bin/bash
# Smoke Test Script for Blue-Green Deployment

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Error: Version not specified"
    exit 1
fi

echo "Running smoke tests for version: $VERSION"

# Test 1: Health check
echo "Test 1: Health check..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health || echo "000")
if [ "$HEALTH_RESPONSE" != "200" ]; then
    echo "❌ Health check failed (HTTP $HEALTH_RESPONSE)"
    exit 1
fi
echo "✓ Health check passed"

# Test 2: API availability
echo "Test 2: API availability..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/graphql || echo "000")
if [ "$API_RESPONSE" != "200" ] && [ "$API_RESPONSE" != "400" ]; then
    echo "❌ API check failed (HTTP $API_RESPONSE)"
    exit 1
fi
echo "✓ API available"

# Test 3: Cache service
echo "Test 3: Cache service..."
REDIS_PING=$(redis-cli -h localhost -p 6379 ping 2>/dev/null || echo "FAIL")
if [ "$REDIS_PING" != "PONG" ]; then
    echo "⚠️ Redis not responding (non-critical)"
else
    echo "✓ Cache service responding"
fi

# Test 4: Basic functionality
echo "Test 4: Basic functionality..."
CONTENT_LENGTH=$(curl -s http://localhost:3000 | wc -c)
if [ "$CONTENT_LENGTH" -lt 100 ]; then
    echo "❌ Content too short, possible error page"
    exit 1
fi
echo "✓ Content delivered successfully"

echo ""
echo "✅ All smoke tests passed for version $VERSION"
exit 0
