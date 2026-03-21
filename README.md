- Development
# Task Tracker — Engineering Backlog Monitor

A MERN stack monorepo for tracking technical backlog items and execution progress across 7 engineering teams, with automated deviation detection.

## Architecture

```
task-tracker/
  services/
    identity-service/   # Users, teams, JWT auth          (port 3001)
    task-service/       # Backlog task CRUD                (port 3002)
    progress-service/   # Progress updates & history       (port 3003)
    alert-service/      # Deadline & deviation monitoring  (port 3004)
    api-gateway/        # Single entry point for frontend  (port 3000)
  apps/
    web-frontend/       # React SPA                        (port 3005)
  shared/
    utils/              # Shared logger, httpClient, constants
  docker/
    docker-compose.yml
  scripts/
    start-dev.sh        # Local dev runner
    seed.js             # Sample data seeder
  .planning/
    architecture.md     # Detailed architecture document
```

**Pattern:** Route → Controller → Service → Repository → MongoDB

Each service uses its own MongoDB database on a shared Mongo instance.

## Quick Start — Docker

```bash
# 1. Copy and fill in secrets
cp .env.example .env
# Edit .env: set JWT_SECRET and SERVICE_TOKEN to random strings

# 2. Start everything
docker compose -f docker/docker-compose.yml up --build

# 3. Seed sample data (after services are healthy)
node scripts/seed.js

# 4. Open the app
open http://localhost:3005
```

## Quick Start — Local Development

```bash
# Requires: Node.js 20+, Docker (for MongoDB)

# 1. Install all dependencies
npm install

# 2. Copy env files and fill in secrets
cp .env.example .env
for dir in services/*/; do cp "$dir/.env.example" "$dir/.env"; done
cp apps/web-frontend/.env.example apps/web-frontend/.env

# 3. Start MongoDB + all services
npm run dev

# 4. Seed sample data
node scripts/seed.js
```

## Services & Endpoints

### API Gateway — http://localhost:3000/api

| Path | Forwards To |
|------|-------------|
| /api/auth/** | identity-service |
| /api/users/** | identity-service |
| /api/teams/** | identity-service |
| /api/tasks/** | task-service |
| /api/progress/** | progress-service |
| /api/alerts/** | alert-service |

All routes except `/api/auth/*` require a `Bearer <JWT>` header.

### Key Endpoints

```
POST /api/auth/register         Create account
POST /api/auth/login            Get JWT

GET  /api/tasks                 List tasks (filters: teamId, status, category)
POST /api/tasks                 Create task
GET  /api/tasks/summary         Task counts by status/category

POST /api/progress              Log a progress update
GET  /api/progress/task/:id     Progress history for a task

GET  /api/alerts                Active alerts
POST /api/alerts/run-detection  Trigger alert detection (admin)
PUT  /api/alerts/:id/resolve    Resolve an alert
```

## Alert Detection

The alert service scans tasks daily at 06:00 UTC and generates alerts for:

| Type | Condition | Severity |
|------|-----------|----------|
| `past_due` | dueDate passed, task not complete | HIGH |
| `update_overdue` | nextUpdateDate passed, no update | MEDIUM |
| `behind_schedule` | completionPct 15%+ below linear expectation | MEDIUM/HIGH |
| `stalled` | in_progress, no update for 7+ days | LOW |

Trigger manually: `POST /api/alerts/run-detection` (admin token required)

## Environment Variables

Copy `.env.example` to `.env` and set:

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Secret for signing JWTs (long random string) |
| `SERVICE_TOKEN` | Secret for service-to-service calls |
| `MONGO_ROOT_USERNAME` | MongoDB root user (default: root) |
| `MONGO_ROOT_PASSWORD` | MongoDB root password |
