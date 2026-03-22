# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## **_Important_** as a responsibler and professional developer, you must refer to each of the bisted files for every and each task, never skip any of the files or instructions in that file :

- .claude\WORKFLOW.md to understand the worflow to follow to start any development task
- .claude\INSTRUCTIONS.md for guidelines and restrictions
- .claude\LEARNING.md for instructions on how to deal with errors and mistakes, and how to use that for future development

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
  identity-service/  :3001  Auth, users
  task-service/      :3002  Task CRUD
  progress-service/  :3003  Progress updates
  alert-service/     :3004  Deadline/deviation alerts (cron-driven)
  team-service/      :3006  Team CRUD
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

Each service has its own MongoDB database (identity, tasks, progress, alerts, teams).

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

| Var                                    | Where                                  |
| -------------------------------------- | -------------------------------------- |
| `JWT_SECRET`                           | All services + gateway                 |
| `SERVICE_TOKEN`                        | Services that call each other          |
| `MONGO_URI`                            | Each service (separate DB per service) |
| `MICROSOFT_CLIENT_ID/SECRET/TENANT_ID` | identity-service only                  |

## TypeScript

All services share `tsconfig.base.json` (ES2020, strict, commonjs). Run `npm run build` in a service to catch type errors.

## Testing

Jest + Supertest for backends. Test files live in `services/<name>/tests/`. Currently minimal coverage — new features should add tests.

## Requirements Gathering Skills

Slash commands for structured requirements gathering. Run `/requirements` for the full process or individual phases as needed.

| Command | Phase | Deliverable |
|---|---|---|
| `/requirements` | Full orchestrator | Runs all phases sequentially |
| `/req-check` | Pre-check | Scans for existing requirements docs |
| `/req-phase1-business` | 1 — Business Context | Problem statement, KPIs, personas |
| `/req-phase2-stakeholders` | 2 — Stakeholders | Stakeholder register, RACI matrix |
| `/req-phase3-functional` | 3 — Functional Reqs | User stories, business rules, data dictionary |
| `/req-phase4-nonfunctional` | 4 — Non-Functional Reqs | NFR spec, security checklist |
| `/req-phase5-technical` | 5 — Technical (MERN) | Constraints, ADRs, dependencies |
| `/req-phase6-scope` | 6 — Scope & Priority | MVP definition, MoSCoW backlog |
| `/req-phase7-validation` | 7 — Validation | Sign-off checklist, gap analysis |
| `/req-ambiguity-log` | Supplementary | Open questions tracker |
| `/req-traceability` | Supplementary | Cross-phase requirement linking |
| `/req-change-management` | Supplementary | Post-sign-off change requests |

All outputs are saved to `docs/requirements/`.

## System Design & Architecture Skills

Slash commands for structured system design. Run `/design` after requirements sign-off, or run individual workstreams as needed.

| Command | Workstream | Deliverable |
|---|---|---|
| `/design` | Full orchestrator | Runs all workstreams sequentially |
| `/design-check` | Pre-check | Scans for existing design docs, inventories requirements inputs |
| `/design-hld` | WS1 — High-Level Design | Architecture diagram, decision register, component catalogue |
| `/design-data-model` | WS2 — Data Modelling | TypeScript interfaces, Mongoose schemas, ER diagram, index plan |
| `/design-api-contracts` | WS3 — API Contracts | OpenAPI spec, shared types, error codes, API conventions |
| `/design-security` | WS4 — Security Architecture | Auth flows, RBAC, CORS, CSP, rate limiting, secrets management |
| `/design-folder-structure` | WS5 — Folder Structure | Annotated project layout, naming conventions, scaffold plan |
| `/design-adrs` | WS6 — ADRs | Full ADR log (8 mandatory + project-specific), ADR index |
| `/design-review` | Validation & Phase Gate | Consistency checks, gap analysis, sign-off |

**Workstream dependency order** (strict sequential):
WS1 → WS2 → WS3 → WS4 + WS5 → WS6 → Review

Design outputs are saved to `docs/design/`. ADRs are saved to `docs/adr/`.

## UI/UX Design Skills

Slash commands for structured UI/UX design. Run `/uiux` for the full process or individual stages as needed.

| Command | Stage | Deliverable |
|---|---|---|
| `/uiux` | Full orchestrator | Runs all stages sequentially |
| `/uiux-check` | Pre-check | Scans for existing UI/UX artifacts |
| `/uiux-stage1-ia-flows` | 1 — IA & User Flows | Sitemap, user flow diagrams, route mapping |
| `/uiux-stage2-wireframes` | 2 — Wireframes | Low-fidelity screen specifications |
| `/uiux-stage3-design-system` | 3 — Design System | Tokens, typography, component inventory |
| `/uiux-stage4-hifi` | 4 — Hi-Fi Specifications | Full-fidelity screen specs with all states |
| `/uiux-stage5-handoff` | 5 — Review & Handoff | Stakeholder sign-off, developer handoff package |
| `/uiux-review` | Phase Gate | Consistency checks, accessibility audit, sign-off |

All outputs are saved to `docs/design/uiux/`.

## Project Setup & DevOps Skills

Slash commands for structured project setup and infrastructure. Run `/setup` for the full process or individual workstreams as needed.

| Command | Workstream | Deliverable |
|---|---|---|
| `/setup` | Full orchestrator | Runs all workstreams sequentially |
| `/setup-check` | Pre-check | Scans for existing setup & infrastructure artifacts |
| `/setup-repo` | WS1 — Repository Structure | Branching strategy, monorepo tooling, branch protection |
| `/setup-local-dev` | WS2 — Local Dev Environment | Docker Compose, dev scripts, seed data, onboarding guide |
| `/setup-typescript` | WS3 — TypeScript & Build | tsconfig files, build pipeline, path aliases, shared packages |
| `/setup-quality` | WS4 — Code Quality Gates | ESLint, Prettier, git hooks, commit convention, test config |
| `/setup-ci` | WS5 — CI/CD Pipeline | CI/CD workflows, Docker builds, deployment strategy |
| `/setup-k8s` | WS6 — Container Orchestration | K8s config, networking, observability, high availability |
| `/setup-secrets` | WS7 — Secrets Management | Secrets platform, env config, certificates, rotation policy |
| `/setup-review` | Validation & Phase Gate | Cross-workstream consistency, compliance audit, sign-off |

**Workstream dependency order** (strict sequential):
WS1 → WS2 + WS3 (parallel) → WS4 → WS5 → WS6 → WS7 → Review

All outputs are saved to `docs/setup/`.

## Master SDLC Workflow

Run `/workflow` at any time to see the full 7-step SDLC status and get guided to the next phase.

| Step | Phase | Orchestrator | Status |
|---|---|---|---|
| 1 | Requirements Gathering | `/requirements` | Available |
| 2 | System Design & Architecture | `/design` | Available |
| 3 | UI/UX Design | `/uiux` | Available |
| 4 | Project Setup & DevOps | `/setup` | Available |
| 5 | Development (Sprints) | *(coming soon)* | Planned |
| 6 | QA & Testing | *(coming soon)* | Planned |
| 7 | Deployment & Go-Live | *(coming soon)* | Planned |
