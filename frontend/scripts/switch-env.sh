#!/bin/bash

# Script to switch between development and mock environments

ENV_TYPE=${1:-development}

case $ENV_TYPE in
  "development"|"dev"|"live")
    echo "🟢 Switching to DEVELOPMENT environment (LIVE API)"
    cp .env.development .env.local
    echo "✅ Environment set to DEVELOPMENT"
    echo "   - API: Live endpoints"
    echo "   - Google OAuth: Enabled"
    echo "   - Mock Login: Available for testing"
    ;;
  "mock"|"test")
    echo "🟡 Switching to MOCK environment (MOCK API)"
    cp .env.mock .env.local
    echo "✅ Environment set to MOCK"
    echo "   - API: Mock endpoints"
    echo "   - Google OAuth: Disabled"
    echo "   - Mock Login: Available for testing"
    ;;
  *)
    echo "❌ Invalid environment type: $ENV_TYPE"
    echo "Usage: ./scripts/switch-env.sh [development|mock]"
    echo ""
    echo "Available environments:"
    echo "  development (or dev, live) - Use live API endpoints"
    echo "  mock (or test)             - Use mock API endpoints"
    exit 1
    ;;
esac

echo ""
echo "🔄 Restart your development server to apply changes:"
echo "   npm run dev"
