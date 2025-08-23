#!/bin/bash

echo "🚀 Setting up Aqua Workspace for development..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Start local services
echo "🐳 Starting local services..."
npm run docker:up

# Wait for DynamoDB to be ready
echo "⏳ Waiting for DynamoDB Local to be ready..."
sleep 5

# Check if DynamoDB is running
if curl -s http://localhost:8000 > /dev/null; then
    echo "✅ DynamoDB Local is running on http://localhost:8000"
else
    echo "❌ DynamoDB Local failed to start"
    exit 1
fi

echo ""
echo "🎉 Setup complete! You can now:"
echo "  • Start the API: npm run dev:api"
echo "  • Start the frontend: npm run dev:frontend"
echo "  • Start both: npm run dev"
echo ""
echo "📱 Access your applications:"
echo "  • Frontend: http://localhost:5173"
echo "  • API: http://localhost:5000"
echo "  • DynamoDB Local: http://localhost:8000"
