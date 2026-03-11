# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

```bash
# Start all services locally (MongoDB in Docker + all services hot-reload)
npm run dev

# Full stack in Docker
npm run docker:up
npm run docker:down
npm run docker:logs

# Seed sample data
npm run seed
```

### Per-service (run from service directory)

```bash
npm run dev       # nodemon + ts-node (hot reload)
npm run build     # tsc → dist/
npm run test      # jest --testPathPattern=tests/
```

### Single test file

```bash
cd services/identity-service
npx jest tests/auth.test.ts
```

## Architecture

**Monorepo** using npm workspaces with this layout:

```
services/          # Express + TypeScript microservices
  identity-service/  :3001  Auth, users, teams
  task-service/      :3002  Task CRUD
  progress-service/  :3003  Progress updates
  alert-service/     :3004  Deadline/deviation alerts (cron-driven)
  api-gateway/       :3000  JWT proxy (single entry point)
apps/
  web-frontend/      :3005  React 18 SPA
shared/
  utils/             @task-tracker/utils — logger, httpClient, constants
```

### Request flow

```
Browser → api-gateway:3000 → [proxy] → individual service
                                       ↓
                               JWT verified locally in each service
                               (no identity-service network hop)
```

### Service pattern (all backends)

```
Route → Controller → Service → Repository → MongoDB
```

Each service has its own MongoDB database (identity, tasks, progress, alerts).

### Inter-service communication

- **Frontend → services:** Bearer JWT via api-gateway
- **Service → service:** `X-Service-Token` header (shared `SERVICE_TOKEN` env var)
- **progress-service → task-service:** Fire-and-forget HTTP (errors logged, not propagated)
- **alert-service:** Pull-based cron (daily 06:00 UTC) — queries task-service and progress-service

### Auth flows

1. **Email/password:** bcrypt verify → JWT returned → stored in localStorage
2. **Microsoft SSO:** `@azure/msal-browser` loginRedirect → Azure returns idToken → POST `/api/auth/microsoft-login` → identity-service creates or detects existing account (`mergeRequired`) → optional password-merge step via `/api/auth/microsoft-merge`

### Alert detection (alert-service)

Four alert types, upserted (one active per task per type):
- `past_due` — dueDate passed, task incomplete → HIGH
- `update_overdue` — nextUpdateDate passed → MEDIUM
- `behind_schedule` — completionPct 15%+ below linear expectation → MEDIUM/HIGH
- `stalled` — in_progress + no update 7+ days → LOW

### Frontend

React Router v6 SPA. API calls go through `apps/web-frontend/src/api/client.ts` (injects Bearer token, auto-redirects to `/login` on 401). Auth state lives in `AuthContext.tsx`.

## Environment

Copy `.env.example` to `.env` in the root and in each service directory. Key vars:

| Var | Where |
|-----|-------|
| `JWT_SECRET` | All services + gateway |
| `SERVICE_TOKEN` | Services that call each other |
| `MONGO_URI` | Each service (separate DB per service) |
| `MICROSOFT_CLIENT_ID/SECRET/TENANT_ID` | identity-service only |

## TypeScript

All services share `tsconfig.base.json` (ES2020, strict, commonjs). Run `npm run build` in a service to catch type errors.

## Testing

Jest + Supertest for backends. Test files live in `services/<name>/tests/`. Currently minimal coverage — new features should add tests.