# Phase 5 — Technical Clarifications (MERN + TypeScript Specific)

You are conducting Phase 5 of the requirements gathering process. The goal is to surface **technical constraints and decisions early** before architecture is locked.

## Pre-Requisite

Check that earlier phase documents exist in `docs/requirements/`. Reference functional requirements and NFRs to inform technical decisions. If missing, inform the user but allow them to proceed.

## Instructions

Ask questions **by technology layer**, presenting all questions within a layer as a numbered group. The user can answer all at once or flag specific ones for discussion. Before starting, tell the user: "This phase covers 6 technology layers. I'll present them one layer at a time."

**Important:** This phase requires technical knowledge. If the user is not a technical lead, recommend they involve one for this phase or offer to generate a questionnaire that can be sent to the technical team asynchronously.

### Handling Incomplete Answers

- If the user answers "I don't know" or is unsure, log the item to the ambiguity log (`docs/requirements/ambiguity-log.md`) with status **Open** and continue — do not block the phase.
- If the user provides contradictory information to a previous phase, flag it explicitly: "In Phase [N], you said [X]. This seems to conflict with [Y]. Which is correct?"
- If a quality gate item cannot be checked due to missing answers, mark it as **Deferred** with the specific ambiguity log item ID.

### Behavioral Guardrails

- Do not rephrase or reinterpret the user's answers — quote them directly when synthesizing deliverables
- Do not invent or assume answers the user has not provided — mark gaps explicitly as "[TBD — needs stakeholder input]"

### Adaptive Rules

- If the user confirmed a SPA architecture (Q3), skip Q5 (PWA/offline) unless they raise it
- If the user says "no integrations" to Q10, skip follow-ups about API contracts and documentation
- If answers from previous phases already cover a question, confirm the existing answer rather than re-asking: "Phase 4 specified JWT with MFA — carrying that forward. Correct?"

### Questions to Ask

**Layer 1 of 6: Frontend (React + TypeScript)**

1. Is there a design system or component library to use? (MUI, Ant Design, Tailwind, Chakra, custom)
2. Are there existing brand guidelines, style guides, or Figma/Sketch designs?
3. Is SSR required (Next.js, Remix) or is a SPA (Vite) sufficient?
4. Browser support requirements? (Modern only, or legacy IE11/Edge?)
5. Should the app be a PWA or support offline mode?
6. State management preference? (Context API, Redux, Zustand, Jotai, TanStack Query for server state)
7. Form handling requirements? (React Hook Form, Formik, native)
8. Are there complex data visualisation needs? (Charts, graphs, maps — which library?)

**Layer 2 of 6: Backend (Node.js + Express + TypeScript)**

9. REST only, or is GraphQL, tRPC, or WebSocket support needed?
10. Are there existing APIs to integrate with? What are their contracts? (OpenAPI specs?)
11. File upload/storage requirements? (S3, Azure Blob, local filesystem, size limits)
12. Background jobs or scheduled tasks needed? (Bull/BullMQ, node-cron, agenda)
13. Rate limiting, throttling, or API gateway requirements?
14. Email/SMS sending requirements? (SendGrid, SES, Twilio)
15. Is a monolith or microservices architecture preferred?

**If Microservices Architecture (follow-ups to Q15):**

15a. What are the service boundaries? Which domain entities does each service own?
    - Map entities to services. An entity must have exactly one owning service.
15b. How will services communicate? (Synchronous HTTP, async message queue, event bus)
    - For each inter-service call: what happens if the target is unavailable? (Retry, circuit breaker, fire-and-forget)
15c. Is eventual consistency acceptable for cross-service data? Which operations require strong consistency?
15d. Will services share any libraries or types? How are shared contracts versioned?
15e. Is an API gateway in use? What does it handle? (Auth, routing, rate limiting, response aggregation)
15f. How are distributed failures handled? (Saga pattern, compensating transactions, or avoided entirely)

**Layer 3 of 6: Database (MongoDB)**

16. Estimated data volume and growth rate?
17. Is MongoDB Atlas the deployment target, or self-hosted?
18. Are there relational data patterns that need careful schema design? (Many-to-many, deep nesting, embedded vs referenced documents)
19. Full-text search requirements? (MongoDB Atlas Search, Elasticsearch, Algolia)
20. Caching requirements? (Redis, in-memory)
21. Are there any data migration requirements from an existing system?

**Layer 4 of 6: TypeScript & Monorepo (Cross-Cutting)**

22. TypeScript strictness level? (`strict: true` recommended — any exceptions?)
23. Monorepo tooling? (npm workspaces, pnpm, Turborepo, Nx) — how are builds orchestrated?
24. How are types shared across services? (Shared workspace package, OpenAPI codegen, manual duplication)
25. Validation library? (Zod for TypeScript type inference, Joi for runtime-only, Yup)

**Layer 5 of 6: Infrastructure & DevOps**

26. Target cloud provider? (AWS, Azure, GCP, on-premises)
27. Containerisation expected? (Docker, Kubernetes, ECS, App Service)
28. CI/CD pipeline — does one exist, or built from scratch? (GitHub Actions, GitLab CI, Jenkins)
29. Environment strategy? (dev, staging, prod, hotfix — how many?)
30. Secrets management approach? (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault, .env)
31. Monitoring and observability? (Datadog, New Relic, Prometheus/Grafana, CloudWatch)
32. Logging aggregation? (ELK stack, CloudWatch Logs, Loki)
33. Domain and DNS management? Who controls it?

**DevOps Depth (follow-ups):**

33a. Docker build strategy? (Multi-stage builds for smaller production images? Base image policy — Alpine, Distroless?)
33b. Health check endpoint specification? (Uptime only, or include DB connectivity and downstream service checks?)
33c. Graceful shutdown handling? (SIGTERM, connection draining, in-flight request completion)
33d. Database schema evolution strategy? (Migration scripts, backward-compatible changes only, MongoDB schema validation)
33e. Environment variable validation on startup? (Fail-fast on missing config — Zod, envalid, Joi)
33f. Structured logging format? (JSON for log aggregation? Correlation IDs across microservices for distributed tracing?)

**Layer 6 of 6: Testing Strategy**

34. What testing frameworks are required? (Jest, Vitest for unit; Supertest for API; Cypress, Playwright for E2E)
35. What are the minimum code coverage thresholds? (Per-service or global? Lines, branches, functions?)
36. Frontend testing approach? (React Testing Library, Cypress component testing, or deferred for MVP?)
37. For microservices: is contract testing needed between services? (Pact, schema validation)
38. What is the test data strategy? (In-memory MongoDB via mongodb-memory-server, dedicated test instance, factories/fixtures)
39. Is CI test gating required? (Block merges if tests fail or coverage drops)

### Partial Progress Saving

If the user needs to pause mid-phase, or if the conversation is getting long:
1. Save answers collected so far to `docs/requirements/technical-constraints.draft.md` with a `## Status: In Progress — Layers 1-N answered` header
2. List which layers remain unanswered
3. When the user resumes (or runs this skill again), check for the `.draft.md` file and offer to continue from where they left off

### After All Questions Are Answered

Generate **three deliverables**:

#### 1. Technical Constraints Document

For each technology layer, document:
- **Chosen technology** and version
- **Rationale** for the choice
- **Constraints** it imposes on the architecture
- **Risks** and mitigation strategies

#### 2. Architecture Decision Records (ADR Stubs)

For each significant decision, create a stub:
```
### ADR-[NNN]: [Decision Title]
**Status:** Proposed
**Context:** [Why this decision is needed]
**Decision:** [What was decided]
**Consequences:** [What this means for the project]
**Alternatives Considered:** [What else was evaluated]
```

#### 3. Third-Party Dependency List

| Dependency | Purpose | License | Version | Risk Level | Alternative |
|---|---|---|---|---|---|

**Present all deliverables** to the user for review before saving.

**Save** to `docs/requirements/technical-constraints.md`

**Recommend** the user proceed to `/req-phase6-scope`

## Quality Gate

Before marking this phase complete, confirm:
- [ ] Every technology choice has a documented rationale
- [ ] All third-party dependencies are listed with license type
- [ ] Infrastructure decisions are documented (cloud, CI/CD, environments)
- [ ] ADR stubs exist for every non-trivial architecture decision
- [ ] Integration contracts are documented (API specs, data formats)
- [ ] If microservices: service boundaries, communication patterns, and failure handling documented
- [ ] Testing strategy is defined with coverage thresholds and tooling decisions
- [ ] DevOps decisions cover health checks, graceful shutdown, and schema evolution
