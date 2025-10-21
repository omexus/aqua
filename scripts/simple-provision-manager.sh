#!/bin/bash

# Simple Manager Provisioning Script for Aqua HOA Management System
# This script adds managers to the mock system for testing

set -e

# Configuration
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

# Show usage
show_usage() {
    echo "Simple Manager Provisioning Script for Aqua HOA Management System"
    echo ""
    echo "This script adds managers to the mock system for testing purposes."
    echo "The managers will be able to log in using the mock login system."
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
    echo "  $0 --email manager@example.com --name \"John Manager\" --google-id \"google123\""
    echo "  $0 --email admin@aqua.com --name \"Admin User\" --google-id \"google456\" --condo-id \"a2f02fa1-bbe4-46f8-90be-4aa43162400c\""
    echo ""
    echo "Available Condos:"
    echo "  a2f02fa1-bbe4-46f8-90be-4aa43162400c - Aqua Condominium"
    echo "  b3f13fa2-cce5-47f9-91cf-5bb54273511d - Marina Bay Condominium"
    echo "  c4f24fa3-ddf6-48fa-92df-6cc65384622e - Sunset Gardens"
}

# Add manager to mock system
add_manager_to_mock() {
    local email="$1"
    local name="$2"
    local google_id="$3"
    local condo_id="$4"
    
    log_info "Adding manager to mock system: $name ($email)"
    
    # Create the manager entry in the mock controller
    local mock_file="$PROJECT_ROOT/api/Controllers/MockController.cs"
    
    if [ ! -f "$mock_file" ]; then
        log_error "MockController.cs not found at $mock_file"
        exit 1
    fi
    
    # Check if manager already exists
    if grep -q "\"$email\"" "$mock_file"; then
        log_warning "Manager with email $email already exists in mock system"
        return 0
    fi
    
    # Add the manager to the UserTenantMapping
    local new_entry="            [\"$email\"] = \"$condo_id\","
    
    # Find the line before the closing brace of UserTenantMapping
    local temp_file=$(mktemp)
    local in_mapping=false
    local added=false
    
    while IFS= read -r line; do
        if [[ "$line" == *"UserTenantMapping"* ]]; then
            in_mapping=true
            echo "$line" >> "$temp_file"
            continue
        fi
        
        if [[ "$in_mapping" == true && "$line" == *"};"* ]]; then
            if [[ "$added" == false ]]; then
                echo "$new_entry" >> "$temp_file"
                added=true
            fi
            in_mapping=false
        fi
        
        echo "$line" >> "$temp_file"
    done < "$mock_file"
    
    # Replace the original file
    mv "$temp_file" "$mock_file"
    
    log_success "Manager added to mock system"
    log_info "Manager Details:"
    echo "  Name: $name"
    echo "  Email: $email"
    echo "  Google ID: $google_id"
    echo "  Condo ID: $condo_id"
    echo ""
    echo "The manager can now log in using:"
    echo "  Email: $email"
    echo "  Password: password (any password works for mock)"
    echo ""
    echo "Note: You need to restart the API for changes to take effect."
}

# Main script logic
main() {
    # Parse arguments
    EMAIL=""
    NAME=""
    GOOGLE_ID=""
    CONDO_ID="a2f02fa1-bbe4-46f8-90be-4aa43162400c" # Default to Aqua Condo
    
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
            --condo-id)
                CONDO_ID="$2"
                shift 2
                ;;
            --help)
                show_usage
                exit 0
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
        echo "Optional: --condo-id"
        exit 1
    fi
    
    add_manager_to_mock "$EMAIL" "$NAME" "$GOOGLE_ID" "$CONDO_ID"
}

# Run main function with all arguments
main "$@"
