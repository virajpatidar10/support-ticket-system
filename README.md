# Support Ticket System

A full-stack support ticket system with AI-powered auto-classification.

## Quick Start

**Prerequisites**: Docker Desktop must be installed and running.

```bash
# Optional: Set your LLM API key
export LLM_API_KEY=your-api-key-here
export LLM_PROVIDER=openai

# Start everything
docker-compose up --build
```

Open: **http://localhost:3000**

## Features

- Submit support tickets with title and description
- AI automatically suggests category and priority based on description
- Browse and filter tickets by category, priority, status
- Search tickets by title and description
- View aggregated statistics
- Update ticket status
- Fully containerized with Docker

## Tech Stack

- **Backend**: Django 4.2 + Django REST Framework + PostgreSQL 15
- **Frontend**: React 18
- **AI/LLM**: OpenAI (gpt-3.5-turbo) or Anthropic (claude-3-haiku)
- **Infrastructure**: Docker + Docker Compose

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tickets/` | Create a new ticket (returns 201) |
| GET | `/api/tickets/` | List all tickets with optional filters |
| PATCH | `/api/tickets/<id>/` | Update a ticket |
| GET | `/api/tickets/stats/` | Get aggregated statistics |
| POST | `/api/tickets/classify/` | Classify description with LLM |

### Filtering & Search
- `?category=` - Filter by category (billing, technical, account, general)
- `?priority=` - Filter by priority (low, medium, high, critical)
- `?status=` - Filter by status (open, in_progress, resolved, closed)
- `?search=` - Search in title and description
- All filters can be combined

## Database Schema

**Ticket Model:**
- `title` - CharField (max 200, required)
- `description` - TextField (required)
- `category` - CharField with choices (billing, technical, account, general)
- `priority` - CharField with choices (low, medium, high, critical)
- `status` - CharField with choices (open, in_progress, resolved, closed), default='open'
- `created_at` - DateTimeField (auto-set)

All constraints enforced at database level.

## LLM Integration

The `/api/tickets/classify/` endpoint uses LLM to analyze ticket descriptions and suggest category and priority.

**Prompt Design**: The system sends a structured prompt with clear guidelines for each category and priority level. See `backend/tickets/llm_service.py` for implementation.

**Error Handling**: If LLM is unavailable or API key is missing, the system returns default values (general/medium) and allows manual selection.

**Supported Providers**:
- OpenAI (gpt-3.5-turbo)
- Anthropic (claude-3-haiku)

Configure via environment variables:
```bash
LLM_API_KEY=your-api-key-here
LLM_PROVIDER=openai  # or anthropic
```

## Docker Setup

The application is fully containerized. A reviewer can run the entire application with:

```bash
docker-compose up --build
```

**Services:**
- `db` - PostgreSQL 15 database
- `backend` - Django application (runs migrations automatically on startup)
- `frontend` - React application

**Features:**
- Automatic database migrations on backend startup
- Proper service dependencies (backend depends on db, frontend depends on backend)
- LLM API key passed as environment variable
- Volume persistence for database
- Hot reload for development

The app is fully functional after `docker-compose up` (LLM feature requires valid API key).

## Testing

**API Tests:**
```bash
# Windows
.\test_api.ps1

# Linux/Mac
chmod +x test_api.sh
./test_api.sh
```

**Unit Tests:**
```bash
docker-compose exec backend python manage.py test
```

## Documentation

- **[README.md](README.md)** - Project overview (this file)
- **[QUICKSTART.md](QUICKSTART.md)** - Quick setup guide
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions

## Project Structure

```
.
├── docker-compose.yml          # Docker orchestration
├── README.md                   # This file
├── QUICKSTART.md              # Quick start guide
├── API_DOCUMENTATION.md       # API reference
├── ARCHITECTURE.md            # System architecture
├── TROUBLESHOOTING.md         # Troubleshooting guide
├── test_api.sh / .ps1         # Test scripts
│
├── backend/                   # Django backend
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   ├── config/               # Django configuration
│   └── tickets/              # Tickets app
│       ├── models.py         # Data model
│       ├── views.py          # API views
│       ├── serializers.py    # DRF serializers
│       ├── llm_service.py    # LLM integration
│       └── migrations/       # Database migrations
│
└── frontend/                 # React frontend
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── App.js            # Main component
        └── components/       # React components
            ├── TicketForm.js
            ├── TicketList.js
            └── Stats.js
```

## Requirements Met

✅ **Backend**: Django + DRF + PostgreSQL with all required endpoints  
✅ **Frontend**: React with ticket form, list, filters, and stats  
✅ **LLM**: Multi-provider support with graceful error handling  
✅ **Docker**: Single-command deployment with automatic migrations  
✅ **Stats**: Database-level aggregation using Django ORM  
✅ **Filtering**: All filters (category, priority, status, search) can be combined  

## Stop the Application

```bash
docker-compose down
```
