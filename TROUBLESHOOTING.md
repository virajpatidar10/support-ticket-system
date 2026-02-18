# Troubleshooting Guide

## Common Issues and Solutions

### 1. Docker Issues

#### "Cannot connect to Docker daemon"
**Problem:** Docker Desktop is not running.

**Solution:**
- Start Docker Desktop
- Wait for it to fully start (whale icon in system tray)
- Try again

#### "Port already in use"
**Problem:** Another service is using ports 3000, 8000, or 5432.

**Solution:**
```bash
# Check what's using the ports (Windows)
netstat -ano | findstr :3000
netstat -ano | findstr :8000
netstat -ano | findstr :5432

# Kill the process or change ports in docker-compose.yml
ports:
  - "3001:3000"  # Change external port
```

#### "docker-compose: command not found"
**Problem:** Docker Compose not installed or not in PATH.

**Solution:**
- Use `docker compose` (without hyphen) for newer Docker versions
- Or install Docker Compose: https://docs.docker.com/compose/install/

### 2. Database Issues

#### "Database connection refused"
**Problem:** PostgreSQL container not ready yet.

**Solution:**
```bash
# Wait 10-15 seconds after starting
# Or check logs
docker-compose logs db

# Restart backend after DB is ready
docker-compose restart backend
```

#### "relation 'tickets' does not exist"
**Problem:** Migrations haven't run.

**Solution:**
```bash
# Run migrations manually
docker-compose exec backend python manage.py migrate

# Or restart to trigger auto-migration
docker-compose restart backend
```

#### "Database is locked"
**Problem:** Multiple processes accessing SQLite (shouldn't happen with PostgreSQL).

**Solution:**
```bash
# Stop all containers
docker-compose down

# Remove volumes
docker-compose down -v

# Start fresh
docker-compose up --build
```

### 3. Backend Issues

#### "ModuleNotFoundError: No module named 'X'"
**Problem:** Python dependencies not installed.

**Solution:**
```bash
# Rebuild backend container
docker-compose build backend

# Or install manually
docker-compose exec backend pip install -r requirements.txt
```

#### "CORS error in browser console"
**Problem:** CORS not configured properly.

**Solution:**
- Check `CORS_ALLOW_ALL_ORIGINS = True` in settings.py
- Verify frontend is accessing http://localhost:8000 (not 127.0.0.1)
- Clear browser cache

#### "LLM classification returns defaults"
**Problem:** API key not set or invalid.

**Solution:**
```bash
# Check environment variable
docker-compose exec backend env | grep LLM

# Set in docker-compose.yml
environment:
  LLM_API_KEY: your-actual-key-here
  LLM_PROVIDER: openai

# Or export before running
export LLM_API_KEY=your-key
docker-compose up
```

#### "Invalid API key error"
**Problem:** Wrong API key or provider mismatch.

**Solution:**
- Verify API key is correct
- Check LLM_PROVIDER matches your key (openai vs anthropic)
- Test key directly with provider's API

### 4. Frontend Issues

#### "Cannot connect to backend"
**Problem:** Backend not running or wrong URL.

**Solution:**
```bash
# Check backend is running
docker-compose ps

# Check backend logs
docker-compose logs backend

# Verify API_URL in frontend
# Should be http://localhost:8000
```

#### "npm install fails"
**Problem:** Network issues or corrupted cache.

**Solution:**
```bash
# Clear npm cache
docker-compose exec frontend npm cache clean --force

# Rebuild
docker-compose build frontend --no-cache
```

#### "Page is blank"
**Problem:** JavaScript error or build issue.

**Solution:**
- Open browser DevTools (F12)
- Check Console for errors
- Check Network tab for failed requests
- Rebuild frontend: `docker-compose build frontend`

#### "Filters not working"
**Problem:** State management issue.

**Solution:**
- Refresh the page
- Check browser console for errors
- Verify backend returns filtered results: `curl "http://localhost:8000/api/tickets/?category=billing"`

### 5. LLM Integration Issues

#### "Classification not triggering"
**Problem:** Description too short or event not firing.

**Solution:**
- Enter at least 10 characters in description
- Click outside the description field (blur event)
- Check browser console for errors
- Check backend logs: `docker-compose logs backend`

#### "Classification takes too long"
**Problem:** LLM API slow or timeout.

**Solution:**
- Wait up to 10 seconds
- Check internet connection
- Verify API key has quota remaining
- System will timeout and use defaults

#### "Wrong category/priority suggested"
**Problem:** LLM interpretation differs from expectation.

**Solution:**
- This is normal - LLM suggestions are just suggestions
- User can override any suggestion
- Adjust prompt in `backend/tickets/llm_service.py` if needed

### 6. Performance Issues

#### "Slow response times"
**Problem:** Container resource constraints.

**Solution:**
- Increase Docker Desktop memory allocation (Settings > Resources)
- Close other applications
- Check CPU usage: `docker stats`

#### "Database queries slow"
**Problem:** No indexes or large dataset.

**Solution:**
- Add indexes in Django model (Meta class)
- Use `select_related()` and `prefetch_related()`
- Check query performance: `docker-compose exec backend python manage.py shell`

### 7. Build Issues

#### "Build fails with 'no space left on device'"
**Problem:** Docker disk space full.

**Solution:**
```bash
# Clean up Docker
docker system prune -a

# Remove unused volumes
docker volume prune
```

#### "Requirements installation fails"
**Problem:** Package conflict or network issue.

**Solution:**
```bash
# Try building with no cache
docker-compose build --no-cache

# Or update requirements.txt versions
```

### 8. Data Issues

#### "Stats showing wrong numbers"
**Problem:** Calculation error or stale data.

**Solution:**
- Refresh the page
- Check backend calculation in views.py
- Verify database data: `docker-compose exec backend python manage.py shell`

#### "Tickets not appearing"
**Problem:** Filter applied or database empty.

**Solution:**
- Clear all filters
- Check search box is empty
- Create a test ticket
- Verify in database: `docker-compose exec db psql -U ticketuser -d ticketdb -c "SELECT * FROM tickets;"`

### 9. Development Issues

#### "Changes not reflecting"
**Problem:** Volume mount not working or cache.

**Solution:**
```bash
# For backend changes
docker-compose restart backend

# For frontend changes (should auto-reload)
docker-compose restart frontend

# Or rebuild
docker-compose up --build
```

#### "Can't access Django admin"
**Problem:** No superuser created.

**Solution:**
```bash
# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Follow prompts
# Then access http://localhost:8000/admin/
```

## Debugging Commands

### Check all services status
```bash
docker-compose ps
```

### View logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Follow logs
docker-compose logs -f backend
```

### Access container shell
```bash
# Backend
docker-compose exec backend bash

# Frontend
docker-compose exec frontend sh

# Database
docker-compose exec db psql -U ticketuser -d ticketdb
```

### Test API manually
```bash
# Create ticket
curl -X POST http://localhost:8000/api/tickets/ \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test desc","category":"general","priority":"low"}'

# List tickets
curl http://localhost:8000/api/tickets/

# Get stats
curl http://localhost:8000/api/tickets/stats/
```

### Check environment variables
```bash
docker-compose exec backend env | grep LLM
```

### Run Django commands
```bash
# Migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Django shell
docker-compose exec backend python manage.py shell
```

## Still Having Issues?

1. Check all logs: `docker-compose logs`
2. Verify all services are running: `docker-compose ps`
3. Try clean restart:
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```
4. Check documentation:
   - README.md
   - SETUP.md
   - QUICKSTART.md

## Getting Help

If you're still stuck:

1. Check the error message carefully
2. Search the error in the logs
3. Verify all prerequisites are installed
4. Try the clean restart procedure above
5. Check Docker Desktop is running properly
6. Verify network connectivity for LLM API calls
