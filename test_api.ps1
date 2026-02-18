# PowerShell test script for the Support Ticket System API

$API_URL = "http://localhost:8000/api"

Write-Host "Testing Support Ticket System API..." -ForegroundColor Green
Write-Host ""

# Test 1: Create a ticket
Write-Host "1. Creating a test ticket..." -ForegroundColor Yellow
$body = @{
    title = "Cannot login to my account"
    description = "I have been trying to login for the past hour but keep getting an error message saying invalid credentials. I am sure my password is correct."
    category = "account"
    priority = "high"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$API_URL/tickets/" -Method Post -Body $body -ContentType "application/json"
Write-Host ""

# Test 2: List all tickets
Write-Host "2. Listing all tickets..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$API_URL/tickets/" -Method Get
Write-Host ""

# Test 3: Get statistics
Write-Host "3. Getting statistics..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$API_URL/tickets/stats/" -Method Get
Write-Host ""

# Test 4: Classify a description
Write-Host "4. Testing LLM classification..." -ForegroundColor Yellow
$classifyBody = @{
    description = "My credit card was charged twice for the same subscription"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$API_URL/tickets/classify/" -Method Post -Body $classifyBody -ContentType "application/json"
Write-Host ""

# Test 5: Filter tickets
Write-Host "5. Filtering tickets by category..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$API_URL/tickets/?category=account" -Method Get
Write-Host ""

# Test 6: Search tickets
Write-Host "6. Searching tickets..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$API_URL/tickets/?search=login" -Method Get
Write-Host ""

Write-Host "Tests completed!" -ForegroundColor Green
