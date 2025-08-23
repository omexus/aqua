#!/bin/bash

echo "🌱 Seeding DynamoDB directly with AWS CLI..."

# Check if DynamoDB Local is running
if ! curl -s http://localhost:8000 > /dev/null; then
    echo "❌ DynamoDB Local is not running. Please start it first with: npm run docker:up"
    exit 1
fi

# Set AWS CLI to use local DynamoDB
export AWS_ACCESS_KEY_ID=local
export AWS_SECRET_ACCESS_KEY=local
export AWS_DEFAULT_REGION=us-west-2

# Create the Statements table if it doesn't exist
echo "📋 Creating Statements table..."
aws dynamodb create-table \
    --table-name Statements \
    --attribute-definitions \
        AttributeName=Id,AttributeType=S \
        AttributeName=Attribute,AttributeType=S \
    --key-schema \
        AttributeName=Id,KeyType=HASH \
        AttributeName=Attribute,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --endpoint-url http://localhost:8000 \
    --region us-west-2 2>/dev/null || echo "Table already exists or error occurred"

# Wait for table to be active
echo "⏳ Waiting for table to be active..."
aws dynamodb wait table-exists \
    --table-name Statements \
    --endpoint-url http://localhost:8000 \
    --region us-west-2

# Seed Condo data
echo "🏢 Seeding Condo data..."
aws dynamodb put-item \
    --table-name Statements \
    --item '{
        "Id": {"S": "a2f02fa1-bbe4-46f8-90be-4aa43162400c"},
        "Attribute": {"S": "CONDO"},
        "Name": {"S": "Aqua Condominium"},
        "Prefix": {"S": "AQUA"}
    }' \
    --endpoint-url http://localhost:8000 \
    --region us-west-2

# Seed Units data
echo "🏠 Seeding Units data..."
units=(
    '{"Id": {"S": "unit-101"}, "Attribute": {"S": "UNIT#a2f02fa1-bbe4-46f8-90be-4aa43162400c"}, "UserId": {"S": "user1"}, "Prefix": {"S": "AQUA"}, "Name": {"S": "John Doe"}, "Email": {"S": "john.doe@example.com"}, "Unit": {"S": "101"}, "Role": {"S": "Owner"}}'
    '{"Id": {"S": "unit-102"}, "Attribute": {"S": "UNIT#a2f02fa1-bbe4-46f8-90be-4aa43162400c"}, "UserId": {"S": "user2"}, "Prefix": {"S": "AQUA"}, "Name": {"S": "Jane Smith"}, "Email": {"S": "jane.smith@example.com"}, "Unit": {"S": "102"}, "Role": {"S": "Tenant"}}'
    '{"Id": {"S": "unit-201"}, "Attribute": {"S": "UNIT#a2f02fa1-bbe4-46f8-90be-4aa43162400c"}, "UserId": {"S": "user3"}, "Prefix": {"S": "AQUA"}, "Name": {"S": "Bob Johnson"}, "Email": {"S": "bob.johnson@example.com"}, "Unit": {"S": "201"}, "Role": {"S": "Owner"}}'
    '{"Id": {"S": "unit-202"}, "Attribute": {"S": "UNIT#a2f02fa1-bbe4-46f8-90be-4aa43162400c"}, "UserId": {"S": "user4"}, "Prefix": {"S": "AQUA"}, "Name": {"S": "Alice Brown"}, "Email": {"S": "alice.brown@example.com"}, "Unit": {"S": "202"}, "Role": {"S": "Tenant"}}'
)

for unit in "${units[@]}"; do
    aws dynamodb put-item \
        --table-name Statements \
        --item "$unit" \
        --endpoint-url http://localhost:8000 \
        --region us-west-2
done

# Seed Periods data
echo "📅 Seeding Periods data..."
periods=(
    '{"Id": {"S": "period-jan"}, "Attribute": {"S": "PERIOD#a2f02fa1-bbe4-46f8-90be-4aa43162400c"}, "From": {"S": "2024-01-01"}, "To": {"S": "2024-01-31"}, "Prefix": {"S": "AQUA"}, "Generated": {"N": "0"}, "Amount": {"N": "1500.00"}}'
    '{"Id": {"S": "period-feb"}, "Attribute": {"S": "PERIOD#a2f02fa1-bbe4-46f8-90be-4aa43162400c"}, "From": {"S": "2024-02-01"}, "To": {"S": "2024-02-29"}, "Prefix": {"S": "AQUA"}, "Generated": {"N": "0"}, "Amount": {"N": "1500.00"}}'
    '{"Id": {"S": "period-mar"}, "Attribute": {"S": "PERIOD#a2f02fa1-bbe4-46f8-90be-4aa43162400c"}, "From": {"S": "2024-03-01"}, "To": {"S": "2024-03-31"}, "Prefix": {"S": "AQUA"}, "Generated": {"N": "0"}, "Amount": {"N": "1500.00"}}'
)

for period in "${periods[@]}"; do
    aws dynamodb put-item \
        --table-name Statements \
        --item "$period" \
        --endpoint-url http://localhost:8000 \
        --region us-west-2
done

echo ""
echo "✅ Data seeding completed!"
echo ""
echo "📋 Seeded data includes:"
echo "  • 1 Condo (Aqua Condominium)"
echo "  • 4 Units (101, 102, 201, 202)"
echo "  • 3 Periods (Jan, Feb, Mar 2024)"
echo ""
echo "🌐 You can now access your frontend at: http://localhost:5173"
