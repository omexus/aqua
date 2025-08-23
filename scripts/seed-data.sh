#!/bin/bash

echo "🌱 Seeding Aqua database with initial data..."

# Check if API is running
if ! curl -s http://localhost:5001 > /dev/null; then
    echo "❌ API is not running. Please start the API first with: npm run dev:api"
    exit 1
fi

# Seed the data
echo "📊 Seeding data..."
curl -X POST http://localhost:5001/api/data/seed \
  -H "Content-Type: application/json" \
  -d '{}'

echo ""
echo "✅ Data seeding completed!"
echo ""
echo "📋 Seeded data includes:"
echo "  • 1 Condo (Aqua Condominium)"
echo "  • 4 Units (101, 102, 201, 202)"
echo "  • 3 Periods (Jan, Feb, Mar 2024)"
echo ""
echo "🌐 You can now access your frontend at: http://localhost:5173"
