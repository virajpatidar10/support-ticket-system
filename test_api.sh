#!/bin/bash

# Test script for the Support Ticket System API

API_URL="http://localhost:8000/api"

echo "Testing Support Ticket System API..."
echo ""

# Test 1: Create a ticket
echo "1. Creating a test ticket..."
curl -X POST "${API_URL}/tickets/" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cannot login to my account",
    "description": "I have been trying to login for the past hour but keep getting an error message saying invalid credentials. I am sure my password is correct.",
    "category": "account",
    "priority": "high"
  }'
echo -e "\n"

# Test 2: List all tickets
echo "2. Listing all tickets..."
curl -X GET "${API_URL}/tickets/"
echo -e "\n"

# Test 3: Get statistics
echo "3. Getting statistics..."
curl -X GET "${API_URL}/tickets/stats/"
echo -e "\n"

# Test 4: Classify a description
echo "4. Testing LLM classification..."
curl -X POST "${API_URL}/tickets/classify/" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "My credit card was charged twice for the same subscription"
  }'
echo -e "\n"

# Test 5: Filter tickets
echo "5. Filtering tickets by category..."
curl -X GET "${API_URL}/tickets/?category=account"
echo -e "\n"

# Test 6: Search tickets
echo "6. Searching tickets..."
curl -X GET "${API_URL}/tickets/?search=login"
echo -e "\n"

echo "Tests completed!"
