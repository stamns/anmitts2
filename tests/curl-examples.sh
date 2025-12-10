#!/bin/bash

# NanoAITTS Worker - curl Test Examples
# 
# This script contains example curl commands for testing all API endpoints
# Make sure the worker is running (npm run dev) before executing

set -e

BASE_URL="${1:-http://localhost:8787}"
echo "📍 Testing against: $BASE_URL"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function for testing
test_endpoint() {
  local name="$1"
  local method="$2"
  local endpoint="$3"
  local data="$4"
  
  echo -e "${BLUE}Testing:${NC} $name"
  
  if [ -n "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$BASE_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      "$BASE_URL$endpoint")
  fi
  
  # Extract status code (last line) and body (all but last line)
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [[ "$http_code" == "200" ]] || [[ "$http_code" == "204" ]]; then
    echo -e "${GREEN}✅ Success${NC} (HTTP $http_code)"
    if [ -n "$body" ]; then
      echo "Response: $(echo "$body" | jq '.' 2>/dev/null || echo "$body")"
    fi
    ((TESTS_PASSED++))
  else
    echo -e "${RED}❌ Failed${NC} (HTTP $http_code)"
    if [ -n "$body" ]; then
      echo "Response: $(echo "$body" | jq '.' 2>/dev/null || echo "$body")"
    fi
    ((TESTS_FAILED++))
  fi
  echo ""
}

# Test 1: Health Check
test_endpoint \
  "Health Check" \
  "GET" \
  "/api/health"

# Test 2: Get Models
test_endpoint \
  "Get Available Models" \
  "GET" \
  "/v1/models"

# Test 3: Get Voices
test_endpoint \
  "Get Available Voices" \
  "GET" \
  "/v1/voices"

# Test 4: Speech Synthesis - Simple
test_endpoint \
  "Speech Synthesis (English)" \
  "POST" \
  "/v1/audio/speech" \
  '{"input":"Hello, world!","voice":"DeepSeek"}'

# Test 5: Speech Synthesis - Chinese
test_endpoint \
  "Speech Synthesis (Chinese)" \
  "POST" \
  "/v1/audio/speech" \
  '{"input":"你好世界","voice":"DeepSeek"}'

# Test 6: Speech Synthesis - With Speed
test_endpoint \
  "Speech Synthesis (Custom Speed)" \
  "POST" \
  "/v1/audio/speech" \
  '{"input":"Testing with custom speed","voice":"DeepSeek","speed":1.5}'

# Test 7: Speech Synthesis - With Pitch
test_endpoint \
  "Speech Synthesis (Custom Pitch)" \
  "POST" \
  "/v1/audio/speech" \
  '{"input":"Testing with custom pitch","voice":"DeepSeek","pitch":1.2}'

# Test 8: Long Text (Auto-chunking)
LONG_TEXT="$(python3 -c "print('这是一个长文本测试。' * 30)")"
test_endpoint \
  "Speech Synthesis (Long Text - Auto Chunking)" \
  "POST" \
  "/v1/audio/speech" \
  "{\"input\":\"$LONG_TEXT\",\"voice\":\"DeepSeek\"}"

# Test 9: Missing Input Validation
test_endpoint \
  "Validation: Missing Input" \
  "POST" \
  "/v1/audio/speech" \
  '{"voice":"DeepSeek"}'

# Test 10: Empty Input Validation
test_endpoint \
  "Validation: Empty Input" \
  "POST" \
  "/v1/audio/speech" \
  '{"input":"","voice":"DeepSeek"}'

# Test 11: Invalid Voice
test_endpoint \
  "Validation: Invalid Voice" \
  "POST" \
  "/v1/audio/speech" \
  '{"input":"Test text","voice":"NonExistentVoice"}'

# Test 12: Invalid Speed
test_endpoint \
  "Validation: Invalid Speed (Out of Range)" \
  "POST" \
  "/v1/audio/speech" \
  '{"input":"Test","voice":"DeepSeek","speed":5.0}'

# Test 13: CORS Preflight
echo -e "${BLUE}Testing:${NC} CORS Preflight Request"
http_code=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
  -H "Origin: https://example.com" \
  "$BASE_URL/v1/audio/speech")
if [[ "$http_code" == "204" ]]; then
  echo -e "${GREEN}✅ Success${NC} (HTTP $http_code)"
  ((TESTS_PASSED++))
else
  echo -e "${RED}❌ Failed${NC} (HTTP $http_code)"
  ((TESTS_FAILED++))
fi
echo ""

# Test 14: Not Found Error
test_endpoint \
  "Error: Not Found Endpoint" \
  "GET" \
  "/v1/nonexistent"

# Test 15: Refresh Voices (may require API key)
test_endpoint \
  "Refresh Voices Cache" \
  "POST" \
  "/v1/voices/refresh"

# Advanced: Save audio to file
echo -e "${BLUE}Advanced Test:${NC} Saving audio to file"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"input":"Audio test file","voice":"DeepSeek"}' \
  "$BASE_URL/v1/audio/speech" \
  --output "test_output.mp3"

if [ -f "test_output.mp3" ] && [ -s "test_output.mp3" ]; then
  FILE_SIZE=$(stat -f%z "test_output.mp3" 2>/dev/null || stat -c%s "test_output.mp3" 2>/dev/null)
  echo -e "${GREEN}✅ Audio saved${NC} to test_output.mp3 ($(printf '%.1f' $(echo "$FILE_SIZE / 1024" | bc)) KB)"
  ((TESTS_PASSED++))
else
  echo -e "${RED}❌ Failed to save audio file${NC}"
  ((TESTS_FAILED++))
fi
echo ""

# Summary
echo "================================"
echo -e "Test Results: ${GREEN}$TESTS_PASSED passed${NC}, ${RED}$TESTS_FAILED failed${NC}"
echo "================================"

if [ "$TESTS_FAILED" -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed${NC}"
  exit 1
fi
