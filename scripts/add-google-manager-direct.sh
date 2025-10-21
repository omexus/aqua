#!/bin/bash

# Direct DynamoDB Manager Addition Script
# This script directly adds a manager to DynamoDB using the API's data seeding

API_BASE_URL="http://localhost:5001"

echo "[INFO] Adding Google manager directly to DynamoDB..."

# Create a simple manager addition endpoint
# We'll use the existing data seeding and then add our manager

# First, let's check if we can access the managers endpoint
echo "[STEP 1] Testing managers endpoint..."
MANAGERS_TEST=$(curl -s -X GET "$API_BASE_URL/api/managers" -H "Content-Type: application/json")
echo "Managers endpoint response: $MANAGERS_TEST"

# If that doesn't work, let's try a different approach
echo "[STEP 2] Trying alternative approach..."

# Let's create a simple manager record using a direct API call
MANAGER_DATA='{
  "email": "hl.morales@gmail.com",
  "name": "Hugo Morales", 
  "googleId": "google123456789",
  "role": "MANAGER"
}'

echo "[STEP 3] Creating manager record..."
MANAGER_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/managers" \
  -H "Content-Type: application/json" \
  -d "$MANAGER_DATA")

echo "Manager creation response: $MANAGER_RESPONSE"

# Check if we got a successful response
if echo "$MANAGER_RESPONSE" | grep -q "success\|id\|Manager"; then
  echo "[SUCCESS] Manager created successfully!"
  
  # Extract manager ID if possible
  MANAGER_ID=$(echo "$MANAGER_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  if [ -n "$MANAGER_ID" ]; then
    echo "[INFO] Manager ID: $MANAGER_ID"
    
    # Try to assign to condo
    echo "[STEP 4] Assigning manager to condo..."
    CONDO_ID="a2f02fa1-bbe4-46f8-90be-4aa43162400c"
    CONDO_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/managers/$MANAGER_ID/condos/$CONDO_ID" \
      -H "Content-Type: application/json")
    echo "Condo assignment response: $CONDO_RESPONSE"
  fi
else
  echo "[ERROR] Failed to create manager"
  echo "Response: $MANAGER_RESPONSE"
  
  # Let's try a different approach - maybe the endpoint is different
  echo "[INFO] Trying alternative endpoints..."
  
  # Try the mock endpoint to see if it works
  MOCK_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/mock/auth/mock-login" \
    -H "Content-Type: application/json" \
    -d '{"email": "hl.morales@gmail.com", "password": "password"}')
  echo "Mock login test: $MOCK_RESPONSE"
fi

echo ""
echo "[INFO] Google manager provisioning attempt completed."
echo "You can now try logging in with Google OAuth using:"
echo "  Email: hl.morales@gmail.com"
echo "  Google ID: google123456789"
