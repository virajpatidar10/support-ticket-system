# API Documentation

## Base URL

```
http://localhost:8000/api
```

## Authentication

Currently, the API does not require authentication. For production, consider adding:
- Token authentication
- Session authentication
- OAuth2

## Endpoints

### 1. Create Ticket

Create a new support ticket.

**Endpoint:** `POST /tickets/`

**Request Body:**
```json
{
  "title": "Cannot login to my account",
  "description": "I have been trying to login for the past hour but keep getting an error message",
  "category": "account",
  "priority": "high"
}
```

**Required Fields:**
- `title` (string, max 200 characters)
- `description` (string)
- `category` (string: "billing", "technical", "account", "general")
- `priority` (string: "low", "medium", "high", "critical")

**Response:** `201 Created`
```json
{
  "id": 1,
  "title": "Cannot login to my account",
  "description": "I have been trying to login for the past hour but keep getting an error message",
  "category": "account",
  "priority": "high",
  "status": "open",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/tickets/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cannot login",
    "description": "Getting error when trying to login",
    "category": "account",
    "priority": "high"
  }'
```

---

### 2. List Tickets

Retrieve all tickets with optional filtering and search.

**Endpoint:** `GET /tickets/`

**Query Parameters:**
- `category` (optional): Filter by category
- `priority` (optional): Filter by priority
- `status` (optional): Filter by status
- `search` (optional): Search in title and description

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Cannot login to my account",
    "description": "I have been trying to login...",
    "category": "account",
    "priority": "high",
    "status": "open",
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "title": "Payment failed",
    "description": "My credit card was declined...",
    "category": "billing",
    "priority": "medium",
    "status": "in_progress",
    "created_at": "2024-01-15T09:15:00Z"
  }
]
```

**Examples:**

List all tickets:
```bash
curl http://localhost:8000/api/tickets/
```

Filter by category:
```bash
curl http://localhost:8000/api/tickets/?category=billing
```

Filter by priority:
```bash
curl http://localhost:8000/api/tickets/?priority=high
```

Filter by status:
```bash
curl http://localhost:8000/api/tickets/?status=open
```

Search tickets:
```bash
curl http://localhost:8000/api/tickets/?search=login
```

Combine filters:
```bash
curl "http://localhost:8000/api/tickets/?category=technical&priority=critical&status=open"
```

---

### 3. Get Single Ticket

Retrieve a specific ticket by ID.

**Endpoint:** `GET /tickets/{id}/`

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Cannot login to my account",
  "description": "I have been trying to login for the past hour...",
  "category": "account",
  "priority": "high",
  "status": "open",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Example:**
```bash
curl http://localhost:8000/api/tickets/1/
```

---

### 4. Update Ticket

Update an existing ticket (partial update).

**Endpoint:** `PATCH /tickets/{id}/`

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Updatable Fields:**
- `title`
- `description`
- `category`
- `priority`
- `status`

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Cannot login to my account",
  "description": "I have been trying to login...",
  "category": "account",
  "priority": "high",
  "status": "in_progress",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Examples:**

Update status:
```bash
curl -X PATCH http://localhost:8000/api/tickets/1/ \
  -H "Content-Type: application/json" \
  -d '{"status": "resolved"}'
```

Update priority:
```bash
curl -X PATCH http://localhost:8000/api/tickets/1/ \
  -H "Content-Type: application/json" \
  -d '{"priority": "critical"}'
```

Update multiple fields:
```bash
curl -X PATCH http://localhost:8000/api/tickets/1/ \
  -H "Content-Type: application/json" \
  -d '{"status": "closed", "priority": "low"}'
```

---

### 5. Delete Ticket

Delete a ticket.

**Endpoint:** `DELETE /tickets/{id}/`

**Response:** `204 No Content`

**Example:**
```bash
curl -X DELETE http://localhost:8000/api/tickets/1/
```

---

### 6. Get Statistics

Retrieve aggregated statistics about all tickets.

**Endpoint:** `GET /tickets/stats/`

**Response:** `200 OK`
```json
{
  "total_tickets": 124,
  "open_tickets": 67,
  "avg_tickets_per_day": 8.3,
  "priority_breakdown": {
    "low": 30,
    "medium": 52,
    "high": 31,
    "critical": 11
  },
  "category_breakdown": {
    "billing": 28,
    "technical": 55,
    "account": 22,
    "general": 19
  }
}
```

**Fields:**
- `total_tickets`: Total number of tickets in the system
- `open_tickets`: Number of tickets with status "open"
- `avg_tickets_per_day`: Average tickets created per day
- `priority_breakdown`: Count of tickets by priority level
- `category_breakdown`: Count of tickets by category

**Example:**
```bash
curl http://localhost:8000/api/tickets/stats/
```

---

### 7. Classify Ticket Description

Use LLM to classify a ticket description and get suggested category and priority.

**Endpoint:** `POST /tickets/classify/`

**Request Body:**
```json
{
  "description": "My credit card was charged twice for the same subscription"
}
```

**Required Fields:**
- `description` (string): The ticket description to classify

**Response:** `200 OK`
```json
{
  "suggested_category": "billing",
  "suggested_priority": "medium"
}
```

**Fields:**
- `suggested_category`: One of: billing, technical, account, general
- `suggested_priority`: One of: low, medium, high, critical

**Example:**
```bash
curl -X POST http://localhost:8000/api/tickets/classify/ \
  -H "Content-Type: application/json" \
  -d '{"description": "The application crashes when I upload files"}'
```

**Response:**
```json
{
  "suggested_category": "technical",
  "suggested_priority": "high"
}
```

**Error Handling:**
- If LLM API is unavailable, returns default values (general/medium)
- If API key is missing, returns default values
- If description is empty, returns 400 Bad Request

---

## Data Models

### Ticket

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | Primary Key, Auto-increment | Unique ticket identifier |
| title | String | Max 200 chars, Required | Ticket title |
| description | Text | Required | Full ticket description |
| category | String | Choices, Required | billing, technical, account, general |
| priority | String | Choices, Required | low, medium, high, critical |
| status | String | Choices, Default: open | open, in_progress, resolved, closed |
| created_at | DateTime | Auto-set | Timestamp of creation |

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Resource deleted successfully |
| 400 | Bad Request - Invalid input data |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## Error Responses

**400 Bad Request:**
```json
{
  "title": ["This field is required."],
  "category": ["\"invalid\" is not a valid choice."]
}
```

**404 Not Found:**
```json
{
  "detail": "Not found."
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. For production, consider:
- Rate limiting per IP
- Rate limiting per user
- Throttling for expensive operations (LLM classification)

---

## Pagination

Currently, all tickets are returned in a single response. For production with large datasets, implement pagination:

```json
{
  "count": 1000,
  "next": "http://localhost:8000/api/tickets/?page=2",
  "previous": null,
  "results": [...]
}
```

---

## CORS

CORS is configured to allow all origins in development. For production, update `settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    'https://yourdomain.com',
]
```

---

## Testing the API

### Using curl

See examples above for each endpoint.

### Using Postman

1. Import the following collection:
   - Base URL: `http://localhost:8000/api`
   - Create requests for each endpoint
   - Set Content-Type: application/json

### Using Python

```python
import requests

# Create ticket
response = requests.post(
    'http://localhost:8000/api/tickets/',
    json={
        'title': 'Test ticket',
        'description': 'Test description',
        'category': 'general',
        'priority': 'low'
    }
)
print(response.json())

# List tickets
response = requests.get('http://localhost:8000/api/tickets/')
print(response.json())

# Get stats
response = requests.get('http://localhost:8000/api/tickets/stats/')
print(response.json())
```

### Using JavaScript

```javascript
// Create ticket
fetch('http://localhost:8000/api/tickets/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Test ticket',
    description: 'Test description',
    category: 'general',
    priority: 'low'
  })
})
.then(response => response.json())
.then(data => console.log(data));

// List tickets
fetch('http://localhost:8000/api/tickets/')
  .then(response => response.json())
  .then(data => console.log(data));
```

---

## WebSocket Support

Currently not implemented. For real-time updates, consider adding:
- Django Channels
- WebSocket connections
- Real-time ticket updates
- Live statistics

---

## Future Enhancements

Potential API improvements:
- Authentication and authorization
- User management
- Ticket assignment to agents
- Comments/notes on tickets
- File attachments
- Email notifications
- Webhooks
- API versioning
- GraphQL endpoint
- Bulk operations
- Export functionality (CSV, PDF)
