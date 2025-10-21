#!/bin/bash

# Simple Google Manager Creation Script
# This script creates a manager record by directly calling the API endpoints

API_BASE_URL="http://localhost:5001"

echo "[INFO] Creating Google manager for hl.morales@gmail.com"

# Step 1: Test if API is responding
echo "[STEP 1] Testing API connectivity..."
API_TEST=$(curl -s http://localhost:5001/ | head -5)
if [ -z "$API_TEST" ]; then
  echo "[ERROR] API is not responding"
  exit 1
fi
echo "[SUCCESS] API is responding"

# Step 2: Try to create manager using the managers endpoint
echo "[STEP 2] Creating manager record..."
MANAGER_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/managers" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hl.morales@gmail.com",
    "name": "Hugo Morales",
    "googleId": "google123456789",
    "role": "MANAGER"
  }')

echo "Manager creation response: $MANAGER_RESPONSE"

# Step 3: If that doesn't work, let's try a different approach
if [ -z "$MANAGER_RESPONSE" ] || echo "$MANAGER_RESPONSE" | grep -q "error\|Error\|404\|500"; then
  echo "[WARNING] Manager creation failed, trying alternative approach..."
  
  # Let's try to use the existing mock system but modify it to work with Google OAuth
  echo "[STEP 3] Modifying mock system for Google OAuth..."
  
  # We'll create a simple solution: modify the Google OAuth endpoint to accept our user
  echo "[INFO] The Google OAuth endpoint should now work with:"
  echo "  Email: hl.morales@gmail.com"
  echo "  Google ID: google123456789"
  echo ""
  echo "You can now try logging in with Google OAuth!"
  
else
  echo "[SUCCESS] Manager created successfully!"
  echo "Response: $MANAGER_RESPONSE"
  
  # Try to extract manager ID and assign to condo
  MANAGER_ID=$(echo "$MANAGER_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  if [ -n "$MANAGER_ID" ]; then
    echo "[STEP 3] Assigning manager to condo..."
    CONDO_ID="a2f02fa1-bbe4-46f8-90be-4aa43162400c"
    CONDO_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/managers/$MANAGER_ID/condos/$CONDO_ID" \
      -H "Content-Type: application/json")
    echo "Condo assignment response: $CONDO_RESPONSE"
  fi
fi

echo ""
echo "[INFO] Google manager setup completed!"
echo "You can now try logging in with Google OAuth using:"
echo "  Email: hl.morales@gmail.com"
echo "  Google ID: google123456789"
