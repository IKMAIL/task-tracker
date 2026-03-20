# Workstream 5 — Folder Structure & Code Architecture

You are conducting Workstream 5 of the System Design & Architecture phase. The goal is to **agree on the project structure and layered architecture** before the first PR is opened. Changing folder structure mid-project causes merge conflicts across the entire team.

## Pre-Requisite

Check that these documents exist and read them before starting:
- `docs/design/high-level-design.md` — architecture pattern (monolith/microservices/modular monolith), SSR/SPA decision, state management choice (from WS1)
- `docs/design/api-contracts.md` — resource groups and shared types location (from WS3)
- `docs/design/security-architecture.md` — middleware and validation patterns (from WS4)
- `docs/requirements/technical-constraints.md` — monorepo tooling, framework choices

The HLD architecture decision (mono vs micro, SPA vs SSR) fundamentally shapes the folder structure — WS1 must be complete.

## Instructions

Walk through each structural decision with the user. Present the recommended structure based on the HLD decisions, then confirm or adjust per the user's context.

### Behavioral Guardrails

- Do not propose a folder structure inconsistent with the HLD architecture decision
- Flag any deviations from the recommended structure and document their rationale
- The structure agreed here must be committed to the repo as a skeleton (empty folders with `.gitkeep`, or scaffold files) — document this as an action item

### Structure by Architecture Pattern

Present the appropriate structure based on the WS1 decision:

---

#### Option A: Monorepo (Monolith or Modular Monolith)

```
/project-root
├── /client                          ← React app
│   ├── /src
│   │   ├── /components
│   │   │   ├── /ui                  ← Atoms: Button, Input, Modal, Badge
│   │   │   └── /features            ← Feature components: TaskCard, UserMenu
│   │   ├── /pages                   ← Route-level page components
│   │   ├── /hooks                   ← Custom React hooks (useAuth, useTasks)
│   │   ├── /services                ← Axios API call functions (tasks.api.ts)
│   │   ├── /store                   ← State management (Zustand slices / Redux)
│   │   ├── /types                   ← Frontend-specific TS types
│   │   └── /utils                   ← Helpers, formatters, constants
│   ├── /public
│   ├── index.html
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── /server                          ← Express app
│   ├── /src
│   │   ├── /routes                  ← Route definitions only (no logic)
│   │   ├── /controllers             ← Request/response handling, calls service
│   │   ├── /services                ← Business logic (no Express objects here)
│   │   ├── /repositories            ← DB queries (Mongoose calls isolated here)
│   │   ├── /models                  ← Mongoose schemas + TypeScript interfaces
│   │   ├── /middleware              ← auth, validate, rateLimiter, errorHandler
│   │   ├── /config                  ← DB connection, env validation, logger
│   │   └── /utils                   ← Helpers, constants, error classes
│   └── tsconfig.json
│
├── /shared                          ← Types shared by client + server
│   └── /types
│       ├── api.ts                   ← ApiResponse, request/response types
│       ├── entities.ts              ← Shared entity types (subset of DB types)
│       └── index.ts                 ← Re-exports
│
├── /docs
│   ├── /requirements                ← Phase 1-7 outputs
│   ├── /design                      ← WS1-WS6 outputs
│   └── /adr                         ← Architecture Decision Records
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── package.json                     ← Workspace root
└── tsconfig.base.json               ← Shared TS config
```

---

#### Option B: Microservices Monorepo

```
/project-root
├── /services
│   ├── /[service-name]              ← One directory per service
│   │   ├── /src
│   │   │   ├── /routes
│   │   │   ├── /controllers
│   │   │   ├── /services
│   │   │   ├── /repositories
│   │   │   ├── /models
│   │   │   ├── /middleware
│   │   │   └── /config
│   │   ├── /tests
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── /api-gateway                 ← JWT proxy, routing, rate limiting
│
├── /apps
│   └── /web-frontend                ← React app (same structure as Option A /client)
│
├── /shared
│   └── /utils                       ← @project/utils — logger, httpClient, constants
│
├── /shared-types                    ← @project/types — API contracts, entity types
│
├── /docs
├── docker-compose.yml
├── package.json                     ← npm/pnpm workspaces root
└── tsconfig.base.json
```

---

#### Option C: Next.js (SSR)

```
/project-root
├── /app                             ← App Router (Next.js 13+)
│   ├── /(auth)                      ← Auth route group
│   │   ├── /login/page.tsx
│   │   └── /register/page.tsx
│   ├── /(dashboard)                 ← Protected route group
│   │   ├── layout.tsx               ← Dashboard shell
│   │   └── /[feature]/page.tsx
│   ├── /api                         ← API Routes (if backend is colocated)
│   │   └── /[...route]/route.ts
│   └── layout.tsx                   ← Root layout
│
├── /components
│   ├── /ui                          ← Atoms
│   └── /features                    ← Feature components
│
├── /lib                             ← Server utilities, DB connections
├── /hooks                           ← Client hooks
├── /types                           ← TypeScript types
├── /services                        ← External API calls
└── next.config.ts
```

---

### Backend Layered Architecture (All Options)

The key architectural principle — **separation of concerns across three layers**:

```
Request → Route → Controller → Service → Repository → MongoDB
                     ↑              ↑            ↑
                  HTTP only    Business     DB queries
                               logic        only
```

**Rules to enforce:**
- Routes: define endpoints, apply middleware, call controller. No logic.
- Controllers: extract from `req`, call service, format `res`. No DB calls.
- Services: business logic, orchestration, domain rules. No Express (`req`/`res`). Testable in isolation.
- Repositories: all Mongoose calls. No business logic. Swap-able.
- Middleware: pure functions (`req, res, next`). Isolated concerns.

```typescript
// Pattern example: routes layer
router.post('/', authenticate, authorize(['admin']), validateBody(schema), controller.create);

// Pattern example: controller layer
async create(req: Request, res: Response): Promise<void> {
  const result = await productService.create(req.body, req.user!);
  res.status(201).json({ success: true, data: result });
}

// Pattern example: service layer (no Express types)
async create(data: CreateProductRequest, actor: IUser): Promise<IProduct> {
  await this.validateBusinessRules(data);
  return this.productRepo.create({ ...data, createdBy: actor._id });
}
```

### Frontend Architecture Decisions

Walk through these with the user and confirm:

**Component organisation strategy:**
- Atomic Design (atoms → molecules → organisms) or Feature-first (`/features/[name]/components`)?
- Co-location: keep component + test + styles together, or separate `/tests` and `/styles` directories?

**API service layer:**
- One file per resource (`tasks.api.ts`, `users.api.ts`) or one central `apiClient.ts`?
- Axios instance with interceptors for auth headers and 401 handling — where does it live?

**State management file structure:**
- Zustand: one store per domain (`useTaskStore`, `useAuthStore`) or one root store with slices?
- Redux Toolkit: one slice per resource under `/store/slices/`?
- Server state (TanStack Query): where do query keys live? (constants file or co-located?)

**Environment configuration:**
- `.env.development`, `.env.staging`, `.env.production` (Vite/Next.js convention)
- Prefix with `VITE_` (Vite) or `NEXT_PUBLIC_` (Next.js) for client-exposed vars
- Validate on startup

### Naming Conventions

Agree upfront — document in `docs/design/folder-structure.md`:

| Artefact | Convention | Example |
|---|---|---|
| React components | PascalCase | `TaskCard.tsx` |
| Hooks | camelCase, `use` prefix | `useTaskFilters.ts` |
| Services | camelCase | `taskService.ts` |
| Routes | kebab-case URL | `/api/v1/task-items` |
| DB collections | plural camelCase | `taskItems` |
| Env vars | SCREAMING_SNAKE_CASE | `JWT_SECRET` |
| Types/Interfaces | PascalCase, `I` prefix for Mongoose | `ITask`, `CreateTaskRequest` |

### Testing File Structure

Where do tests live?

```
/server/src/services/taskService.ts
/server/src/services/__tests__/taskService.test.ts   ← co-located (recommended)
  OR
/server/tests/services/taskService.test.ts            ← separate tests directory
```

Document the decision and the reasoning.

### After All Decisions Are Confirmed

Generate **two deliverables**:

#### 1. Folder Structure Document

Complete annotated tree of the agreed structure with:
- One-line purpose comment for every directory
- Naming convention table
- Layered architecture rules (what belongs in each layer)
- Testing structure decision
- Component organisation strategy

#### 2. Scaffold Action Plan

List of concrete actions to execute in Step 4 (Project Setup):
- [ ] Initialise monorepo with [npm workspaces / pnpm]
- [ ] Create all top-level directories with `.gitkeep`
- [ ] Configure `tsconfig.base.json` and per-package `tsconfig.json`
- [ ] Set up path aliases (`@/components`, `@task-tracker/utils`)
- [ ] Create the Axios instance in `/services/apiClient.ts`
- [ ] Create the Express app skeleton with middleware stack
- [ ] Create the shared types package

**Present both deliverables** to the user for review before saving.

**Save** to `docs/design/folder-structure.md`

**Recommend** the user proceed to `/design-adrs`

## Quality Gate

Before marking this workstream complete, confirm:
- [ ] Folder structure is consistent with the HLD architecture decision (mono vs micro, SPA vs SSR)
- [ ] Backend layered architecture is defined (Route → Controller → Service → Repository)
- [ ] Rules for each layer are documented (what belongs, what doesn't)
- [ ] Frontend component organisation strategy is decided
- [ ] API service layer structure is defined
- [ ] State management file layout is agreed
- [ ] Naming conventions are documented for all artefact types
- [ ] Testing file structure is decided and documented
- [ ] Scaffold action plan is ready for Step 4 (Project Setup)
- [ ] Path aliases are defined for both client and server
