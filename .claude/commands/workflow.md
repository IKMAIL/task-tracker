# Master SDLC Workflow — MERN + TypeScript

You are running the full software development lifecycle for a MERN + TypeScript project. This orchestrator provides a structured, sequential workflow across all seven phases, ensuring completeness and traceability from requirements through deployment.

## SDLC Overview

| Step | Phase | Orchestrator / Skills | Key Deliverables | Gate to Proceed |
|---|---|---|---|---|
| 1 | Requirements Gathering | `/requirements` | Business context, user stories, NFRs, technical constraints, scope | Signed requirements baseline |
| 2 | System Design & Architecture | `/design` | HLD, data model, API contracts, security architecture, folder structure, ADRs | Signed design baseline |
| 3 | UI/UX Design | *(coming soon)* | Wireframes, component library, design system, user flow diagrams | Design approved by stakeholders |
| 4 | Project Setup & DevOps | *(coming soon)* | Repository scaffold, CI/CD pipeline, Docker, environments, secrets | Dev environment running, CI green |
| 5 | Development (Sprints) | *(coming soon)* | Working software, sprint deliverables, code review | Sprint acceptance criteria met |
| 6 | QA & Testing | *(coming soon)* | Test reports, coverage metrics, bug triage | All Must Have stories pass |
| 7 | Deployment & Go-Live | *(coming soon)* | Production deployment, monitoring, runbooks, go-live sign-off | SLAs verified, rollback tested |

## Traceability Chain

Every deliverable in this workflow must be traceable back to its origin:

```
Business Problem (Step 1)
    └── User Stories + NFRs (Step 1)
            └── Architecture Decisions (Step 2)
                    └── API Contracts + Data Model (Step 2)
                            └── UI Designs (Step 3)
                                    └── Scaffold + Environments (Step 4)
                                            └── Sprint Features (Step 5)
                                                    └── Test Cases (Step 6)
                                                            └── Deployment (Step 7)
```

A requirement with no design decision is a gap. A design decision with no requirement is gold-plating. Both are tracked.

## Instructions

### Phase 0: Orientation

Before starting any phase:
1. Check which phases have already been completed (scan `docs/requirements/`, `docs/design/`, etc.)
2. Present the current state to the user:
   ```
   SDLC Status Check
   =================
   Step 1 — Requirements:  [Complete ✓ / In Progress / Not Started]
   Step 2 — Design:        [Complete ✓ / In Progress / Not Started]
   Step 3 — UI/UX:         [Coming soon]
   Step 4 — Setup:         [Coming soon]
   Step 5 — Development:   [Coming soon]
   Step 6 — QA:            [Coming soon]
   Step 7 — Deployment:    [Coming soon]
   ```
3. Ask the user: "Where would you like to start or resume?"

### Phase Execution

For each phase the user wants to run:

1. **Verify the phase gate from the previous phase is met** before starting
2. **Run the phase orchestrator** (or individual skills if resuming mid-phase)
3. **Confirm the phase gate is met** before marking complete
4. **Update the SDLC status** and present the next recommended step

### Phase 1 — Requirements Gathering

Run `/requirements` which orchestrates:
- `/req-check` → Pre-check
- `/req-phase1-business` → Business context, KPIs, glossary
- `/req-phase2-stakeholders` → Stakeholder register, RACI
- `/req-phase3-functional` → User stories, business rules, data dictionary
- `/req-phase4-nonfunctional` → NFR spec, security checklist
- `/req-phase5-technical` → Technical constraints, ADR stubs
- `/req-phase6-scope` → MVP definition, MoSCoW backlog with T-shirt sizing
- `/req-phase7-validation` → Sign-off checklist, gap analysis, approval

**Phase 1 Gate:** `docs/requirements/validation-signoff.md` exists with "Approved" status.

**Supplementary (run as needed):**
- `/req-ambiguity-log` — Manage open questions
- `/req-traceability` — Cross-phase traceability matrix
- `/req-change-management` — Post-sign-off scope changes

### Phase 2 — System Design & Architecture

Run `/design` which orchestrates:
- `/design-check` → Pre-check, requirements inputs inventory
- `/design-hld` → HLD: architecture pattern, communication, auth, frontend, caching
- `/design-data-model` → MongoDB schemas, TypeScript interfaces, indexes, ER diagram
- `/design-api-contracts` → OpenAPI spec, shared types, error codes
- `/design-security` → Auth implementation, RBAC, CSP, CORS, rate limiting, secrets
- `/design-folder-structure` → Project layout, layered architecture, naming conventions
- `/design-adrs` → Full ADR log (8 mandatory + project-specific)
- `/design-review` → Consistency checks, gap analysis, sign-off

**Phase 2 Gate:** `docs/design/design-signoff.md` exists with "Approved" status.

### Phase 3 — UI/UX Design *(coming soon)*

This phase will cover:
- Wireframing and prototyping (Figma, Sketch, or similar)
- Component library selection and design token definition
- User flow diagrams for all Must Have user stories
- Responsive design strategy and breakpoints
- Accessibility audit against WCAG level defined in Phase 4
- Design handoff format for developers

**Phase 3 Gate:** All Must Have user story screens are wireframed and approved by stakeholders.

To be implemented as `/uiux-kickoff`, `/uiux-components`, `/uiux-flows`, `/uiux-review`.

### Phase 4 — Project Setup & DevOps *(coming soon)*

This phase will cover:
- Repository scaffold from the agreed folder structure (WS5)
- Monorepo tooling configuration (npm/pnpm workspaces, Turborepo)
- TypeScript configuration (`tsconfig.base.json`, per-package configs, path aliases)
- Docker and Docker Compose setup (dev + prod variants)
- CI/CD pipeline (GitHub Actions / GitLab CI / Jenkins) — lint, test, build, deploy stages
- Environment strategy (dev, staging, prod) with secrets management
- Monitoring and logging infrastructure setup
- Database seeding for development environment

**Phase 4 Gate:** `npm run dev` starts all services locally; CI pipeline is green on main branch.

To be implemented as `/setup-scaffold`, `/setup-cicd`, `/setup-docker`, `/setup-monitoring`.

### Phase 5 — Development (Sprints) *(coming soon)*

This phase will cover:
- Sprint planning from the MoSCoW backlog (Phase 6 output)
- Feature branch workflow (from INSTRUCTIONS.md: `IKMAIL/` prefix, feature → development → release → main)
- Code review checklist aligned to the layered architecture (WS5)
- Definition of Done per user story
- Continuous integration checks (lint, type-check, test, coverage gate)

**Phase 5 Gate:** All Must Have user stories pass their acceptance criteria.

### Phase 6 — QA & Testing *(coming soon)*

This phase will cover:
- Test execution against the testing strategy (Phase 5 Q34-Q39)
- Bug triage and severity classification
- Regression test suite
- Performance testing against NFR targets (Phase 4)
- Security penetration testing (if required by Phase 4)
- UAT with stakeholders (from Phase 2 RACI — who signs off UAT)

**Phase 6 Gate:** All Must Have stories pass UAT; no open Critical/High severity bugs.

### Phase 7 — Deployment & Go-Live *(coming soon)*

This phase will cover:
- Production deployment runbook
- Database migration execution plan
- Feature flag strategy (if staged rollout)
- Rollback plan and tested rollback procedure
- Monitoring alert configuration and on-call setup
- Go-live checklist and stakeholder communication
- Post-launch support plan

**Phase 7 Gate:** System is live, SLAs are being met, rollback procedure is tested.

## Cross-Phase Rules

- **Never skip a phase gate** unless the user explicitly accepts the risk in writing (document in the relevant ambiguity log)
- **Traceability must be maintained** — every design decision traces to a requirement; every feature traces to a user story
- **Change management applies from Phase 1 sign-off** — use `/req-change-management` for any scope changes after requirements sign-off
- **ADRs are living documents** — if a decision changes in Phase 4 or 5, update or supersede the relevant ADR
- **Ambiguity logs carry forward** — unresolved items from Phase 1 must be resolved before Phase 2 sign-off; Phase 2 items before Phase 4 starts

## Current Status Command

At any point, the user can run `/workflow` to get a status report of where they are in the SDLC and what the next recommended step is.
