#!/bin/bash

# Provision Google Manager in Real DynamoDB
# This script creates a real manager record for Google OAuth authentication

# Default values
DEFAULT_CONDO_ID="a2f02fa1-bbe4-46f8-90be-4aa43162400c" # Aqua Condominium
API_BASE_URL="http://localhost:5001"

# Function to display help message
show_help() {
  echo "Provision Google Manager in Real DynamoDB"
  echo ""
  echo "This script creates a real manager record for Google OAuth authentication."
  echo ""
  echo "Usage: $0 [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  --email      Manager's email address (required)"
  echo "  --name       Manager's full name (required)"
  echo "  --google-id  Google User ID (required)"
  echo "  --condo-id   Condo ID to assign (optional, defaults to Aqua Condo)"
  echo "  --help       Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0 --email hl.morales@gmail.com --name \"Hugo Morales\" --google-id \"google123456789\""
  echo "  $0 --email admin@aqua.com --name \"Admin User\" --google-id \"google987654321\" --condo-id \"a2f02fa1-bbe4-46f8-90be-4aa43162400c\""
  echo ""
  echo "Available Condos:"
  echo "  a2f02fa1-bbe4-46f8-90be-4aa43162400c - Aqua Condominium"
  echo "  b3f13fa2-cce5-47f9-91cf-5bb54273511d - Marina Bay Condominium"
  echo "  c4f24fa3-ddf6-48fa-92df-6cc65384622e - Sunset Gardens"
}

# Parse arguments
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --email) EMAIL="$2"; shift ;;
    --name) NAME="$2"; shift ;;
    --google-id) GOOGLE_ID="$2"; shift ;;
    --condo-id) CONDO_ID="$2"; shift ;;
    --help) show_help; exit 0 ;;
    *) echo "Unknown parameter passed: $1"; show_help; exit 1 ;;
  esac
  shift
done

# Validate required arguments
if [ -z "$EMAIL" ] || [ -z "$NAME" ] || [ -z "$GOOGLE_ID" ]; then
  echo "[ERROR] Missing required arguments. Email, Name, and Google ID are required."
  show_help
  exit 1
fi

# Use default condo ID if not provided
CONDO_ID=${CONDO_ID:-$DEFAULT_CONDO_ID}

echo "[INFO] Provisioning Google manager in real DynamoDB: $NAME ($EMAIL)"

# Step 1: Create Manager record
echo "[STEP 1] Creating Manager record..."
MANAGER_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/managers" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"name\": \"$NAME\",
    \"googleId\": \"$GOOGLE_ID\",
    \"role\": \"MANAGER\"
  }")

echo "Manager creation response: $MANAGER_RESPONSE"

# Extract manager ID from response (assuming the API returns the created manager with ID)
MANAGER_ID=$(echo "$MANAGER_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$MANAGER_ID" ]; then
  echo "[ERROR] Failed to extract manager ID from response"
  echo "Response: $MANAGER_RESPONSE"
  exit 1
fi

echo "[SUCCESS] Manager created with ID: $MANAGER_ID"

# Step 2: Assign Manager to Condo
echo "[STEP 2] Assigning manager to condo..."
CONDO_ASSIGNMENT_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/managers/$MANAGER_ID/condos/$CONDO_ID" \
  -H "Content-Type: application/json")

echo "Condo assignment response: $CONDO_ASSIGNMENT_RESPONSE"

# Check if assignment was successful
if echo "$CONDO_ASSIGNMENT_RESPONSE" | grep -q '"success":true'; then
  echo "[SUCCESS] Manager assigned to condo successfully"
else
  echo "[WARNING] Condo assignment may have failed, but manager was created"
fi

echo ""
echo "[SUCCESS] Google manager provisioned successfully!"
echo "[INFO] Manager Details:"
echo "  Name: $NAME"
echo "  Email: $EMAIL"
echo "  Google ID: $GOOGLE_ID"
echo "  Manager ID: $MANAGER_ID"
echo "  Condo ID: $CONDO_ID"
echo ""
echo "The manager can now log in using Google OAuth!"
echo ""
echo "Note: Make sure the API is running and DynamoDB is accessible."
