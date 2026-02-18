# Quick Start Guide

## Prerequisites

- Docker Desktop installed and running
- Ports 3000, 8000, 5432 available

## Get Running in 2 Minutes

### Step 1: Set API Key (Optional)

**Windows:**
```powershell
$env:LLM_API_KEY="your-api-key-here"
$env:LLM_PROVIDER="openai"
```

**Linux/Mac:**
```bash
export LLM_API_KEY=your-api-key-here
export LLM_PROVIDER=openai
```

> The system works without an API key - it will use defaults for classification.

### Step 2: Start Everything

```bash
docker-compose up --build
```

Wait for: `Watching for file changes with StatReloader`

### Step 3: Open Browser

```
http://localhost:3000
```

## Test It

### Create a Ticket
1. Enter title: "Cannot process payment"
2. Enter description: "My credit card keeps getting declined"
3. Tab out of description → Watch category/priority auto-fill
4. Click Submit

### Filter Tickets
- Use dropdowns to filter by category, priority, status
- Try the search box
- Combine multiple filters

### Update Status
- Click status dropdown on any ticket
- Change from "open" to "in_progress"
- Watch it update instantly

### View Stats
- Check statistics cards
- See priority and category breakdowns
- Create new ticket and watch stats update

## Test API

**Windows:**
```powershell
.\test_api.ps1
```

**Linux/Mac:**
```bash
chmod +x test_api.sh
./test_api.sh
```

## Troubleshooting

**Port in use:**
```bash
netstat -ano | findstr :3000  # Windows
lsof -ti:3000 | xargs kill -9  # Linux/Mac
```

**Database connection failed:**
```bash
docker-compose restart backend
```

**Clean restart:**
```bash
docker-compose down -v
docker-compose up --build
```

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more help.
