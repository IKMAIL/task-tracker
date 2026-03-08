# MERN Monorepo — Technical Backlog Tracker: Architecture Plan

## Context

Scaffold a greenfield MERN monorepo from an empty repository (`/home/user/task-tracker`) to track technical backlog items and execution progress for 7 engineering teams. The system surfaces deviations from plan (deadline misses, stalled work, behind-schedule tasks) via an alert service.

Branch: `claude/mern-backlog-monorepo-WB8My`

---

## Monorepo Layout

```
task-tracker/
  .planning/                    # This document
  services/
    identity-service/           # Users, teams, auth (port 3001)
    task-service/               # Backlog CRUD (port 3002)
    progress-service/           # Progress updates and history (port 3003)
    alert-service/              # Deadline + deviation monitoring (port 3004)
    api-gateway/                # Single entry point (port 3000)
  apps/
    web-frontend/               # React SPA (port 3005)
  shared/
    utils/                      # logger, errorHandler, httpClient, constants
  docker/
    docker-compose.yml
  scripts/
    start-dev.sh
    seed.js
  package.json                  # npm workspaces root
  .env.example
```

Each service is independently runnable. All services share the same MongoDB instance but use **separate databases**.

---

## Architecture Pattern: Repository Pattern

```
Route → Controller → Service → Repository → MongoDB
```

- **Routes** — define HTTP endpoints, apply middleware
- **Controllers** — parse HTTP request, call service, return HTTP response
- **Services** — business logic, orchestrate repositories
- **Repositories** — all MongoDB access; no DB calls outside this layer
- **Models** — Mongoose schemas

---

## MongoDB Schemas

### User (identity-service database: `identity`)
```
name, email, passwordHash, role: enum['admin','member'], teamId, timestamps
```

### Team (identity-service database: `identity`)
```
name, description, memberIds: [ObjectId], leadId: ObjectId, timestamps
```

### Task (task-service database: `tasks`)
```
title, description
category: enum[
  'Automation Testing Coverage', 'DR Dry Run', 'Active-Active Setup',
  'LEAP Framework Adherence', 'Claude Code Adoption %',
  'Open Operational Items', 'Security Risk Items'
]
assignedTeamId, assignedPersonId
status: enum['not_started','in_progress','blocked','completed','cancelled']
completionPct: Number(0-100)
plannedStartDate, dueDate, nextUpdateDate, lastUpdatedAt
createdBy, timestamps
Indexes: { assignedTeamId, status }, { dueDate, status }, { nextUpdateDate }
```

### TaskUpdate (progress-service database: `progress`)
```
taskId, authorId, completionPct, status, comment, recordedAt, timestamps
Index: { taskId, recordedAt: -1 }
```

### Alert (alert-service database: `alerts`)
```
taskId, teamId
type: enum['past_due','update_overdue','behind_schedule','stalled']
severity: enum['low','medium','high']
message, metadata, resolvedAt, isActive, timestamps
Indexes: { taskId, type, isActive }, { teamId, isActive }
```

---

## Services

### 1. Identity Service (port 3001)

Handles users, teams, JWT authentication.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | none | Create user |
| POST | /auth/login | none | Return JWT |
| GET | /users | admin | List users |
| GET | /users/:id | JWT | Get user |
| PUT | /users/:id | JWT+self | Update profile |
| GET | /teams | JWT | List teams |
| GET | /teams/:id | JWT | Get team |
| POST | /teams | admin | Create team |
| POST | /teams/:id/members | admin | Add member |
| DELETE | /teams/:id/members/:userId | admin | Remove member |
| GET | /health | none | Health check |

JWT payload: `{ sub, email, role, teamId }`

Dependencies: express, mongoose, bcryptjs, jsonwebtoken, joi, dotenv, cors

### 2. Task Service (port 3002)

Handles backlog task CRUD and summary stats.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /tasks | JWT | List (filters: teamId, status, category, page, limit) |
| POST | /tasks | JWT | Create task |
| GET | /tasks/summary | JWT | Counts by status and category |
| GET | /tasks/team/:teamId | JWT | All tasks for a team |
| GET | /tasks/:id | JWT | Get task |
| PUT | /tasks/:id | JWT | Update task |
| DELETE | /tasks/:id | admin | Soft-delete (cancel) |
| PUT | /tasks/:id/progress-sync | SERVICE_TOKEN | Internal sync from progress-service |
| GET | /health | none | Health check |

Dependencies: express, mongoose, jsonwebtoken, joi, dotenv, cors

### 3. Progress Service (port 3003)

Records progress updates. After each POST, syncs `completionPct`/`status`/`lastUpdatedAt` back to task-service (fire-and-forget).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /progress | JWT | Log a progress update |
| GET | /progress/task/:taskId | JWT | Full history for a task |
| GET | /progress/latest/:taskId | JWT | Most recent update |
| GET | /progress/team/:teamId | JWT | All updates for a team's tasks |
| GET | /health | none | Health check |

Dependencies: express, mongoose, jsonwebtoken, joi, node-fetch, dotenv, cors

### 4. Alert Service (port 3004)

Monitors tasks for 4 alert types. Runs detection daily at 06:00 UTC via node-cron. Alerts are upserted (one active alert per task per type) and auto-resolved when the condition clears.

**Detection rules:**
- `past_due` → `dueDate < now` and status not completed/cancelled → HIGH
- `update_overdue` → `nextUpdateDate < now` → MEDIUM
- `behind_schedule` → `expectedPct - actualPct >= 15` (linear time) → MEDIUM (≥15) / HIGH (≥30)
- `stalled` → in_progress + no update for 7+ days → LOW

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /alerts | JWT | List active alerts |
| GET | /alerts/team/:teamId | JWT | Alerts for a team |
| GET | /alerts/:id | JWT | Single alert |
| PUT | /alerts/:id/resolve | JWT | Resolve alert |
| POST | /alerts/run-detection | admin | Trigger detection |
| GET | /health | none | Health check |

Dependencies: express, mongoose, jsonwebtoken, joi, node-cron, node-fetch, dotenv, cors

### 5. API Gateway (port 3000)

Thin proxy. Verifies JWT, then forwards. No business logic.

| Gateway Path | Forwards To |
|---|---|
| /api/auth/** | identity-service:3001/auth/** (no JWT) |
| /api/users/** | identity-service:3001/users/** (JWT) |
| /api/teams/** | identity-service:3001/teams/** (JWT) |
| /api/tasks/** | task-service:3002/tasks/** (JWT) |
| /api/progress/** | progress-service:3003/progress/** (JWT) |
| /api/alerts/** | alert-service:3004/alerts/** (JWT) |

Dependencies: express, http-proxy-middleware, jsonwebtoken, express-rate-limit, dotenv, cors

---

## Frontend Pages

React 18 + react-router-dom v6. Plain CSS only. No UI frameworks. Fetch API for HTTP.

| Page | Path | Description |
|------|------|-------------|
| LoginPage | /login | Login form, stores JWT in localStorage |
| DashboardPage | / | Stats cards, alert count, per-team completion % |
| TeamProgressPage | /teams | Team selector, task summary table, progress bars |
| TaskListPage | /tasks | Filterable table (status, category, team) |
| TaskDetailPage | /tasks/:id | Full task info, progress timeline, log update link |
| AlertsPage | /alerts | Alerts by severity, resolve action |
| UpdateProgressPage | /progress/update/:taskId | Form to log completionPct, status, comment, nextUpdateDate |

---

## Inter-Service Communication

- **JWT** verified locally in every service (shared `JWT_SECRET` env var — no network hop)
- **Service-to-service** calls use `X-Service-Token` header (shared `SERVICE_TOKEN` env var)
- **Progress → Task sync** is fire-and-forget (errors logged, not propagated to client)
- **Alert detector** pulls from task-service on cron schedule (pull-based, no message broker)

---

## Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| One MongoDB database per service | Each service owns its data; cross-service IDs are plain ObjectIds |
| JWT verified locally everywhere | No network hop to identity-service per request |
| Pull-based alert detection | Avoids Kafka/RabbitMQ at this scale (7 teams, bounded tasks) |
| CommonJS throughout | No TypeScript, no build step — simpler dev experience |
| http-proxy-middleware at gateway | Thin forwarding, no re-implementation of service logic |

---

## Critical Files

| File | Why Critical |
|------|-------------|
| `services/task-service/src/models/Task.js` | Central schema; all services reference task IDs |
| `services/alert-service/src/services/alertDetector.js` | Core detection logic for all 4 alert types |
| `services/api-gateway/index.js` | All route wiring and JWT enforcement |
| `shared/utils/src/httpClient.js` | Used by progress and alert services for inter-service calls |
| `apps/web-frontend/src/api/client.js` | Base fetch wrapper all frontend API modules depend on |

---

## Running Locally

```bash
# Option 1 — Docker (recommended)
cp .env.example .env          # Fill in JWT_SECRET and SERVICE_TOKEN
docker compose -f docker/docker-compose.yml up --build

# Option 2 — Local dev
cp .env.example .env
docker compose -f docker/docker-compose.yml up mongo -d   # MongoDB only
npm run dev                   # Starts all services with concurrently + nodemon

# Seed sample data
node scripts/seed.js
```

Services available at:
- API Gateway: http://localhost:3000
- Frontend: http://localhost:3005
