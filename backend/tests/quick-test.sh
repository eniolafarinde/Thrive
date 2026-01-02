#!/bin/bash

# Quick API Test Script
# Make sure the server is running before executing this script

BASE_URL="http://localhost:5000"

echo "🚀 Testing Thrive API"
echo "===================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "1. Testing Health Check..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Health check failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
    exit 1
fi

echo ""
echo "2. Testing User Registration..."
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@example.com"

REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"testpass123\",
    \"name\": \"Test User\",
    \"alias\": \"Tester\"
  }")

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n1)
BODY=$(echo "$REGISTER_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✅ Registration successful${NC}"
    TOKEN=$(echo "$BODY" | jq -r '.data.token' 2>/dev/null)
    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        echo -e "${GREEN}   Token received: ${TOKEN:0:20}...${NC}"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    else
        echo -e "${YELLOW}⚠️  Warning: No token in response${NC}"
    fi
else
    echo -e "${RED}❌ Registration failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
    exit 1
fi

echo ""
echo "3. Testing Login..."
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"testpass123\"
  }")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Login successful${NC}"
    TOKEN=$(echo "$BODY" | jq -r '.data.token' 2>/dev/null)
    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        echo -e "${GREEN}   Token received: ${TOKEN:0:20}...${NC}"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    fi
else
    echo -e "${RED}❌ Login failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
    exit 1
fi

# Test 4: Get Current User (if we have a token)
if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo ""
    echo "4. Testing Get Current User (Protected Route)..."
    ME_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/auth/me" \
      -H "Authorization: Bearer $TOKEN")
    
    HTTP_CODE=$(echo "$ME_RESPONSE" | tail -n1)
    BODY=$(echo "$ME_RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✅ Get current user successful${NC}"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    else
        echo -e "${RED}❌ Get current user failed (HTTP $HTTP_CODE)${NC}"
        echo "$BODY"
    fi
fi

echo ""
echo "===================="
echo -e "${GREEN}✨ Tests completed!${NC}"

