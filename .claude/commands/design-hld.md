# Workstream 1 — High-Level Design (HLD)

You are conducting Workstream 1 of the System Design & Architecture phase. The HLD answers the question: **"What are we building and how do the pieces fit together?"**

## Pre-Requisite

Check that these requirements documents exist and read them:
- `docs/requirements/functional-requirements.md` — user stories, data dictionary, business rules
- `docs/requirements/nonfunctional-requirements.md` — performance, security, scalability targets
- `docs/requirements/technical-constraints.md` — technology choices, infrastructure decisions
- `docs/requirements/scope-definition.md` — MVP scope
- `docs/requirements/business-context.md` — glossary

If any are missing, inform the user which ones and recommend completing requirements first. Allow them to proceed if they choose, but log missing inputs to `docs/design/design-ambiguity-log.md`.

## Instructions

Walk through each architectural decision **one at a time**. For each decision, present the options, trade-offs, and a recommendation based on the requirements. Wait for user confirmation before moving on.

### Partial Save & Resume

- After every 3 decisions, auto-save progress to `docs/design/high-level-design.draft.md`
- If the user says "pause", "stop", or "save and continue later": save immediately and note the next decision to resume from
- On resume: read the draft, summarise decisions made so far, continue from the next undecided item

### Behavioral Guardrails

- Do not make architecture decisions without user confirmation — present options and recommend, but the user decides
- Do not introduce technologies not discussed in Phase 5 (technical constraints) without flagging them as new additions
- Reference specific NFR targets when justifying decisions (e.g., "Given the P95 < 200ms requirement from Phase 4...")
- Use the glossary from Phase 1 consistently

### Contradiction Detection

- If a proposed decision contradicts an NFR, flag it: "This approach may conflict with [NFR target]. Here's why..."
- If a decision contradicts a Phase 5 technology choice, flag it explicitly before proceeding

### Decisions to Make

**Decision 1: Application Architecture Pattern**

- Monolith vs Microservices vs Modular Monolith?
- If microservices was chosen in Phase 5: confirm service boundaries and domain ownership
- If monolith: will it be structured for future decomposition?
- Reference: Phase 5, Q15 (architecture preference) and Q15a-15f (microservice details)

**Decision 2: Communication Patterns**

- REST only, or REST + WebSockets for real-time features?
- Is GraphQL needed for flexible querying? (adds complexity — justify from requirements)
- If microservices: sync HTTP vs async message queue vs event bus between services?
- For each pattern chosen: what happens when the target is unavailable?
- Reference: Phase 3 Q10 (real-time requirements), Phase 5 Q9 (API style)

**Decision 3: Authentication & Authorization Strategy**

- JWT with refresh token rotation (standard for MERN)
- Token storage: httpOnly cookies (more secure, CSRF needed) vs localStorage (simpler, XSS risk)
- If SSO/OAuth required (from Phase 4): design the full auth flow (redirect, callback, token exchange)
- Refresh token strategy: silent refresh, sliding window, or explicit rotation?
- Role-based access control (RBAC) implementation: middleware, per-route, or policy engine?
- Reference: Phase 4 Q8/Q12d (auth method, JWT strategy), Phase 3 role-permission matrix

**Decision 4: Frontend Architecture**

- SSR (Next.js/Remix) vs SPA (Vite + React)?
  - If SEO matters or first-load performance is critical → SSR
  - If internal tool/dashboard → SPA is simpler
- State management: React Context + useReducer (simple CRUD), Zustand (moderate complexity), Redux Toolkit (complex shared state), TanStack Query (server state caching)?
- Routing strategy: React Router v6 (SPA) vs file-based routing (Next.js)?
- Reference: Phase 5 Q3 (SSR requirement), Q6 (state management), Phase 4 performance targets

**Decision 5: Data Flow Architecture**

- How does data flow from user action → API → database → response?
- Backend layered pattern: Route → Controller → Service → Repository → MongoDB
- Error propagation strategy: where are errors caught, transformed, and logged?
- If microservices: how does cross-service data flow work? (API gateway aggregation, BFF pattern, direct calls)
- Reference: Phase 3 user journeys, Phase 5 Q15b (inter-service communication)

**Decision 6: Caching Strategy**

- What data needs caching? (Session data, frequent reads, computed results)
- Caching layer: Redis, in-memory (node-cache), CDN for static assets?
- Cache invalidation strategy: TTL, event-driven, or manual?
- Reference: Phase 4 performance targets, Phase 5 Q20 (caching requirements)

**Decision 7: File Storage & Media**

- Where are uploaded files stored? (S3, Azure Blob, local filesystem)
- File size limits, allowed types, virus scanning?
- CDN for serving static assets and uploaded media?
- Reference: Phase 5 Q11 (file upload requirements)

**Decision 8: Background Processing**

- Are background jobs needed? (Email sending, report generation, data sync)
- Job queue technology: BullMQ (Redis-backed), Agenda (MongoDB-backed), node-cron (simple scheduling)?
- Retry strategy, dead letter queue, job monitoring?
- Reference: Phase 5 Q12 (background jobs), Phase 3 Q6 (notifications)

**Decision 9: Monitoring & Observability**

- Structured logging: JSON format, correlation IDs for distributed tracing?
- APM/monitoring: Datadog, New Relic, Prometheus + Grafana?
- Error tracking: Sentry, Bugsnag?
- Health check endpoints: liveness, readiness, dependency checks?
- Reference: Phase 5 Q31-Q32 (monitoring), Q33b (health checks), Q33f (structured logging)

**Decision 10: Deployment Architecture**

- Container orchestration: Docker Compose (dev), Kubernetes/ECS (prod)?
- Environment strategy: dev → staging → prod? Feature branches?
- Blue-green vs rolling vs canary deployment?
- Reference: Phase 5 Q26-Q29 (infrastructure)

### After All Decisions Are Made

Generate the **HLD Document** with these sections:

#### 1. Architecture Overview Diagram

Describe the architecture diagram in detail (using text/ASCII or Mermaid syntax):
- All system components and their connections
- External integrations and their direction
- Data flow arrows
- Network boundaries (public, private, database tier)

#### 2. Decision Register

| # | Decision | Choice | Rationale | Alternatives Considered | NFR Reference |
|---|---|---|---|---|---|
| 1 | Architecture pattern | [choice] | [why] | [what else] | [which NFR] |
| ... | ... | ... | ... | ... | ... |

#### 3. Component Catalogue

| Component | Technology | Purpose | Communicates With | Port |
|---|---|---|---|---|
| API Gateway | Express/Nginx | Request routing, auth | All services | 3000 |
| ... | ... | ... | ... | ... |

#### 4. Integration Map

| External System | Direction | Protocol | Auth Method | Data Format | Owner |
|---|---|---|---|---|---|
| [system] | Inbound/Outbound | REST/WebSocket | API Key/OAuth | JSON | [team] |

#### 5. Key Assumptions

| ID | Assumption | Impact if Wrong | Mitigation |
|---|---|---|---|
| HLD-A001 | [assumption] | [impact] | [what we'd do] |

**Present the full HLD** to the user for review before saving.

**Save** to `docs/design/high-level-design.md`

**Recommend** the user proceed to `/design-data-model`

## Quality Gate

Before marking this workstream complete, confirm:
- [ ] Architecture pattern is chosen with rationale documented
- [ ] All communication patterns are specified (REST, WebSocket, message queue)
- [ ] Authentication flow is fully designed (token lifecycle, storage, refresh, revocation)
- [ ] Frontend architecture decision is made (SSR/SPA, state management, routing)
- [ ] Data flow is documented end-to-end (user action → API → DB → response)
- [ ] Caching strategy is defined (what, where, invalidation)
- [ ] Background processing approach is decided (if applicable)
- [ ] Monitoring and observability stack is chosen
- [ ] Deployment architecture is specified
- [ ] Architecture diagram exists showing all components and connections
- [ ] Every decision references the NFR or requirement that drove it
