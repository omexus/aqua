#!/bin/bash

# Manager Provisioning Script for Aqua HOA Management System
# This script allows you to provision new managers and assign them to condos

set -e

# Configuration
API_BASE_URL="http://localhost:5001"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if API is running
check_api() {
    log_info "Checking if API is running..."
    if ! curl -s "$API_BASE_URL" > /dev/null 2>&1; then
        log_error "API is not running at $API_BASE_URL"
        log_info "Please start the API with: cd $PROJECT_ROOT && npm run dev:api"
        exit 1
    fi
    log_success "API is running"
}

# Provision a new manager
provision_manager() {
    local email="$1"
    local name="$2"
    local google_user_id="$3"
    local condo_ids="$4"
    
    log_info "Provisioning manager: $name ($email)"
    
    # Create manager
    local manager_data=$(cat <<EOF
{
    "email": "$email",
    "name": "$name",
    "googleUserId": "$google_user_id",
    "role": "Manager"
}
EOF
)
    
    log_info "Creating manager record..."
    local manager_response=$(curl -s -X POST "$API_BASE_URL/api/managers" \
        -H "Content-Type: application/json" \
        -d "$manager_data")
    
    if echo "$manager_response" | grep -q '"success":true'; then
        log_success "Manager created successfully"
        
        # Extract manager ID from response
        local manager_id=$(echo "$manager_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        log_info "Manager ID: $manager_id"
        
        # Assign to condos if provided
        if [ -n "$condo_ids" ]; then
            IFS=',' read -ra CONDO_ARRAY <<< "$condo_ids"
            for condo_id in "${CONDO_ARRAY[@]}"; do
                log_info "Assigning manager to condo: $condo_id"
                local assignment_data=$(cat <<EOF
{
    "managerId": "$manager_id",
    "condoId": "$condo_id"
}
EOF
)
                curl -s -X POST "$API_BASE_URL/api/managers/$manager_id/condos" \
                    -H "Content-Type: application/json" \
                    -d "$assignment_data" > /dev/null
                log_success "Assigned to condo: $condo_id"
            done
        fi
        
        log_success "Manager provisioning completed!"
        echo ""
        echo "Manager Details:"
        echo "  Name: $name"
        echo "  Email: $email"
        echo "  Google User ID: $google_user_id"
        echo "  Manager ID: $manager_id"
        if [ -n "$condo_ids" ]; then
            echo "  Assigned Condos: $condo_ids"
        fi
        echo ""
        echo "The manager can now log in using Google OAuth with the email: $email"
        
    else
        log_error "Failed to create manager: $manager_response"
        exit 1
    fi
}

# List existing managers
list_managers() {
    log_info "Fetching existing managers..."
    curl -s "$API_BASE_URL/api/managers" | jq '.' 2>/dev/null || {
        log_warning "Could not parse JSON response. Raw response:"
        curl -s "$API_BASE_URL/api/managers"
    }
}

# List available condos
list_condos() {
    log_info "Fetching available condos..."
    curl -s "$API_BASE_URL/api/condos" | jq '.' 2>/dev/null || {
        log_warning "Could not parse JSON response. Raw response:"
        curl -s "$API_BASE_URL/api/condos"
    }
}

# Show usage
show_usage() {
    echo "Manager Provisioning Script for Aqua HOA Management System"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  provision    Provision a new manager"
    echo "  list         List existing managers"
    echo "  condos       List available condos"
    echo "  help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 provision --email manager@example.com --name \"John Manager\" --google-id \"google123\" --condos \"a2f02fa1-bbe4-46f8-90be-4aa43162400c\""
    echo "  $0 list"
    echo "  $0 condos"
    echo ""
    echo "Options for provision:"
    echo "  --email      Manager's email address (required)"
    echo "  --name       Manager's full name (required)"
    echo "  --google-id  Google User ID (required)"
    echo "  --condos     Comma-separated list of condo IDs (optional)"
}

# Main script logic
main() {
    case "${1:-help}" in
        "provision")
            check_api
            
            # Parse arguments
            EMAIL=""
            NAME=""
            GOOGLE_ID=""
            CONDOS=""
            
            shift
            while [[ $# -gt 0 ]]; do
                case $1 in
                    --email)
                        EMAIL="$2"
                        shift 2
                        ;;
                    --name)
                        NAME="$2"
                        shift 2
                        ;;
                    --google-id)
                        GOOGLE_ID="$2"
                        shift 2
                        ;;
                    --condos)
                        CONDOS="$2"
                        shift 2
                        ;;
                    *)
                        log_error "Unknown option: $1"
                        show_usage
                        exit 1
                        ;;
                esac
            done
            
            # Validate required parameters
            if [ -z "$EMAIL" ] || [ -z "$NAME" ] || [ -z "$GOOGLE_ID" ]; then
                log_error "Missing required parameters"
                echo "Required: --email, --name, --google-id"
                echo "Optional: --condos"
                exit 1
            fi
            
            provision_manager "$EMAIL" "$NAME" "$GOOGLE_ID" "$CONDOS"
            ;;
        "list")
            check_api
            list_managers
            ;;
        "condos")
            check_api
            list_condos
            ;;
        "help"|*)
            show_usage
            ;;
    esac
}

# Run main function with all arguments
main "$@"
