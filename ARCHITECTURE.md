# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│                     http://localhost:3000                    │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ HTTP/REST
                             │
┌────────────────────────────▼────────────────────────────────┐
│                      React Frontend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ TicketForm   │  │  TicketList  │  │    Stats     │     │
│  │              │  │              │  │              │     │
│  │ - Submit     │  │ - Display    │  │ - Dashboard  │     │
│  │ - LLM Call   │  │ - Filter     │  │ - Metrics    │     │
│  │ - Validation │  │ - Search     │  │ - Charts     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│              API Client (fetch)                              │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ HTTP/JSON
                             │
┌────────────────────────────▼────────────────────────────────┐
│                   Django REST Framework                      │
│                   http://localhost:8000                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    API Endpoints                      │  │
│  │                                                       │  │
│  │  POST   /api/tickets/          Create ticket        │  │
│  │  GET    /api/tickets/          List tickets         │  │
│  │  GET    /api/tickets/{id}/     Get ticket           │  │
│  │  PATCH  /api/tickets/{id}/     Update ticket        │  │
│  │  DELETE /api/tickets/{id}/     Delete ticket        │  │
│  │  GET    /api/tickets/stats/    Get statistics       │  │
│  │  POST   /api/tickets/classify/ Classify with LLM    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Business Logic                      │  │
│  │                                                       │  │
│  │  TicketViewSet                                       │  │
│  │  ├─ list()          → Query & filter tickets        │  │
│  │  ├─ create()        → Validate & save ticket        │  │
│  │  ├─ update()        → Update ticket fields          │  │
│  │  ├─ stats()         → Aggregate statistics          │  │
│  │  └─ classify()      → Call LLM service              │  │
│  │                                                       │  │
│  │  LLM Service                                         │  │
│  │  ├─ classify_ticket()                                │  │
│  │  ├─ _classify_openai()                               │  │
│  │  └─ _classify_anthropic()                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Data Layer                         │  │
│  │                                                       │  │
│  │  Ticket Model                                        │  │
│  │  ├─ title (CharField)                                │  │
│  │  ├─ description (TextField)                          │  │
│  │  ├─ category (CharField with choices)               │  │
│  │  ├─ priority (CharField with choices)               │  │
│  │  ├─ status (CharField with choices)                 │  │
│  │  └─ created_at (DateTimeField)                      │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ SQL
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    PostgreSQL Database                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   tickets table                       │  │
│  │                                                       │  │
│  │  id              SERIAL PRIMARY KEY                  │  │
│  │  title           VARCHAR(200) NOT NULL               │  │
│  │  description     TEXT NOT NULL                       │  │
│  │  category        VARCHAR(20) NOT NULL                │  │
│  │  priority        VARCHAR(20) NOT NULL                │  │
│  │  status          VARCHAR(20) DEFAULT 'open'          │  │
│  │  created_at      TIMESTAMP DEFAULT NOW()             │  │
│  │                                                       │  │
│  │  Indexes:                                            │  │
│  │  - PRIMARY KEY (id)                                  │  │
│  │  - INDEX (created_at DESC)                           │  │
│  │  - INDEX (category)                                  │  │
│  │  - INDEX (priority)                                  │  │
│  │  - INDEX (status)                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    External LLM APIs                         │
│                                                              │
│  ┌──────────────────┐              ┌──────────────────┐    │
│  │   OpenAI API     │              │  Anthropic API   │    │
│  │                  │              │                  │    │
│  │  gpt-3.5-turbo   │              │  claude-3-haiku  │    │
│  │                  │              │                  │    │
│  │  Classification  │              │  Classification  │    │
│  │  & Suggestions   │              │  & Suggestions   │    │
│  └──────────────────┘              └──────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Component Interaction Flow

### 1. Create Ticket Flow

```
User fills form
      │
      ▼
User enters description
      │
      ▼
onBlur event triggers
      │
      ▼
Frontend calls /api/tickets/classify/
      │
      ▼
Backend receives description
      │
      ▼
LLM Service called
      │
      ├─────────────────┐
      ▼                 ▼
  OpenAI API      Anthropic API
      │                 │
      └────────┬────────┘
               ▼
      JSON response parsed
               │
               ▼
      Category & Priority extracted
               │
               ▼
      Response sent to frontend
               │
               ▼
      Form fields auto-filled
               │
               ▼
      User reviews/overrides
               │
               ▼
      User clicks Submit
               │
               ▼
      POST /api/tickets/
               │
               ▼
      Django validates data
               │
               ▼
      Ticket saved to database
               │
               ▼
      201 Created response
               │
               ▼
      Frontend updates UI
               │
               ▼
      Stats refreshed
               │
               ▼
      Ticket list refreshed
```

### 2. Filter Tickets Flow

```
User selects filter
      │
      ▼
State updated in React
      │
      ▼
useEffect triggered
      │
      ▼
GET /api/tickets/?category=X&priority=Y&status=Z&search=Q
      │
      ▼
Django receives request
      │
      ▼
Query parameters parsed
      │
      ▼
Queryset filtered
      │
      ├─ Filter by category
      ├─ Filter by priority
      ├─ Filter by status
      └─ Search in title & description
      │
      ▼
Results ordered by created_at DESC
      │
      ▼
Serialized to JSON
      │
      ▼
Response sent to frontend
      │
      ▼
Ticket list updated
```

### 3. Statistics Flow

```
Component mounts / Ticket created
      │
      ▼
GET /api/tickets/stats/
      │
      ▼
Django stats() method called
      │
      ├─ Count total tickets
      ├─ Count open tickets
      ├─ Calculate avg per day
      ├─ Aggregate priority breakdown
      └─ Aggregate category breakdown
      │
      ▼
Database-level aggregation
      │
      ├─ SELECT COUNT(*) FROM tickets
      ├─ SELECT COUNT(*) WHERE status='open'
      ├─ SELECT category, COUNT(*) GROUP BY category
      └─ SELECT priority, COUNT(*) GROUP BY priority
      │
      ▼
Results compiled
      │
      ▼
JSON response sent
      │
      ▼
Stats component updated
```

## Docker Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Compose                           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Frontend Container                     │    │
│  │                                                     │    │
│  │  Node.js 18                                        │    │
│  │  React Development Server                          │    │
│  │  Port: 3000                                        │    │
│  │                                                     │    │
│  │  Volumes:                                          │    │
│  │  - ./frontend:/app                                 │    │
│  │  - /app/node_modules                               │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Backend Container                      │    │
│  │                                                     │    │
│  │  Python 3.11                                       │    │
│  │  Django + DRF                                      │    │
│  │  Port: 8000                                        │    │
│  │                                                     │    │
│  │  Volumes:                                          │    │
│  │  - ./backend:/app                                  │    │
│  │                                                     │    │
│  │  Environment:                                      │    │
│  │  - DATABASE_URL                                    │    │
│  │  - LLM_API_KEY                                     │    │
│  │  - LLM_PROVIDER                                    │    │
│  │                                                     │    │
│  │  Depends on: db                                    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Database Container                     │    │
│  │                                                     │    │
│  │  PostgreSQL 15                                     │    │
│  │  Port: 5432                                        │    │
│  │                                                     │    │
│  │  Volumes:                                          │    │
│  │  - postgres_data:/var/lib/postgresql/data         │    │
│  │                                                     │    │
│  │  Environment:                                      │    │
│  │  - POSTGRES_DB=ticketdb                           │    │
│  │  - POSTGRES_USER=ticketuser                       │    │
│  │  - POSTGRES_PASSWORD=ticketpass                   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Networks:                                                   │
│  - default (bridge)                                          │
│                                                              │
│  Volumes:                                                    │
│  - postgres_data (persistent)                                │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Enters ticket description
     ▼
┌──────────────┐
│ TicketForm   │
└────┬─────────┘
     │
     │ 2. Calls classify API
     ▼
┌──────────────┐
│   Backend    │
└────┬─────────┘
     │
     │ 3. Sends to LLM
     ▼
┌──────────────┐
│   LLM API    │
└────┬─────────┘
     │
     │ 4. Returns suggestions
     ▼
┌──────────────┐
│   Backend    │
└────┬─────────┘
     │
     │ 5. Returns to frontend
     ▼
┌──────────────┐
│ TicketForm   │
└────┬─────────┘
     │
     │ 6. Auto-fills fields
     ▼
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 7. Reviews & submits
     ▼
┌──────────────┐
│ TicketForm   │
└────┬─────────┘
     │
     │ 8. POST ticket
     ▼
┌──────────────┐
│   Backend    │
└────┬─────────┘
     │
     │ 9. Saves to DB
     ▼
┌──────────────┐
│  PostgreSQL  │
└────┬─────────┘
     │
     │ 10. Returns saved ticket
     ▼
┌──────────────┐
│   Backend    │
└────┬─────────┘
     │
     │ 11. Returns to frontend
     ▼
┌──────────────┐
│ TicketForm   │
└────┬─────────┘
     │
     │ 12. Updates UI
     ▼
┌──────────┐
│  User    │
└──────────┘
```

## Technology Stack

### Frontend Layer
- **Framework**: React 18
- **Language**: JavaScript (ES6+)
- **Styling**: CSS3
- **HTTP Client**: Fetch API
- **State Management**: React Hooks (useState, useEffect)

### Backend Layer
- **Framework**: Django 4.2
- **API Framework**: Django REST Framework 3.14
- **Language**: Python 3.11
- **ORM**: Django ORM
- **CORS**: django-cors-headers

### Database Layer
- **Database**: PostgreSQL 15
- **Driver**: psycopg2-binary

### LLM Integration
- **OpenAI**: openai 1.3.7 (gpt-3.5-turbo)
- **Anthropic**: anthropic 0.7.7 (claude-3-haiku)

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Web Server**: Django development server (production: gunicorn)

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Security Layers                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  1. Network Security                                │    │
│  │     - CORS configuration                            │    │
│  │     - Allowed hosts                                 │    │
│  │     - HTTPS (production)                            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  2. Application Security                            │    │
│  │     - Input validation (DRF serializers)            │    │
│  │     - SQL injection prevention (ORM)                │    │
│  │     - XSS protection (Django templates)             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  3. Data Security                                   │    │
│  │     - Database constraints                          │    │
│  │     - Field validation                              │    │
│  │     - Type checking                                 │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  4. API Security                                    │    │
│  │     - Environment variables for secrets             │    │
│  │     - No hardcoded credentials                      │    │
│  │     - Graceful error handling                       │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Scalability Considerations

### Horizontal Scaling
- Multiple backend instances behind load balancer
- Stateless API design
- Database connection pooling

### Vertical Scaling
- Increase container resources
- Optimize database queries
- Add database indexes

### Caching Strategy
- Cache LLM classifications
- Cache statistics
- Redis for session storage

### Database Optimization
- Indexes on frequently queried fields
- Database-level aggregation
- Query optimization with select_related/prefetch_related

## Monitoring Points

```
Frontend
├─ Page load time
├─ API response time
├─ Error rate
└─ User interactions

Backend
├─ Request rate
├─ Response time
├─ Error rate
├─ Database query time
└─ LLM API latency

Database
├─ Connection count
├─ Query performance
├─ Disk usage
└─ Index efficiency

LLM API
├─ Request count
├─ Response time
├─ Error rate
└─ Cost tracking
```

## Deployment Architecture (Production)

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      Load Balancer                           │
│                      (nginx/ALB)                             │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
             ▼                            ▼
┌──────────────────────┐      ┌──────────────────────┐
│  Frontend (Static)   │      │  Backend (API)       │
│  - S3 + CloudFront   │      │  - ECS/Kubernetes    │
│  - Netlify/Vercel    │      │  - Multiple replicas │
└──────────────────────┘      └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │  Database (RDS)      │
                              │  - PostgreSQL        │
                              │  - Read replicas     │
                              └──────────────────────┘
```

This architecture provides a solid foundation for a scalable, maintainable support ticket system with AI-powered classification.
