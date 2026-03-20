# System Design & Architecture Phase — Skills Implementation Plan

## Context
Create Claude Code slash commands for the System Design & Architecture Phase (MERN + TypeScript), following patterns from the requirements gathering skills. Then create a master workflow command orchestrating requirements → design.

## Skills to Create (in `.claude/commands/`)

### Pre-check
- [ ] `design-check.md` — Scan for existing design/architecture docs

### Workstream Skills (from user spec)
- [ ] `design-hld.md` — WS1: High-Level Design (arch diagram, communication patterns, auth strategy, state mgmt, SSR/SPA)
- [ ] `design-data-model.md` — WS2: Data Modelling (MongoDB schemas, TypeScript interfaces, embed/ref, indexes)
- [ ] `design-api-contracts.md` — WS3: API Contract Design (OpenAPI spec, shared types, error codes, conventions)
- [ ] `design-folder-structure.md` — WS4: Folder Structure & Code Architecture (layers, separation of concerns)
- [ ] `design-adrs.md` — WS5: Architecture Decision Records (numbered ADR docs)

### Additional Skills (proposed gaps)
- [ ] `design-security.md` — Security Architecture (auth flow diagrams, CORS, CSP, rate limiting, secrets)
- [ ] `design-review.md` — Design Validation & Phase Gate (mirrors req-phase7)

### Orchestrators
- [ ] `design.md` — Master design orchestrator
- [ ] `workflow.md` — Master workflow: requirements → design

### Updates
- [ ] Update CLAUDE.md with new skill table
- [ ] Git: commit and push

## Questions / Gaps to Discuss with User
Resolved — user confirmed: add all three extra skills, full SDLC skeleton, strict sequential workstream order.

## Review

### Summary
Created 10 Claude Code slash commands for the System Design & Architecture phase, plus a master SDLC workflow:

**Pre-check:** `/design-check`

**Workstream skills (strict sequential):**
1. `/design-hld` — High-Level Design (10 architecture decisions, component catalogue, integration map)
2. `/design-data-model` — MongoDB schemas, TypeScript interfaces, ER diagram, index strategy
3. `/design-api-contracts` — REST conventions, OpenAPI spec, shared types, error codes
4. `/design-security` — Auth flows, RBAC, CORS, CSP, rate limiting, secrets (10 security domains)
5. `/design-folder-structure` — Annotated project layout for mono/micro/SSR patterns, naming conventions
6. `/design-adrs` — 8 mandatory ADRs + project-specific, filed in `docs/adr/`

**Validation:** `/design-review` — consistency checks, gap analysis, phase gate, sign-off

**Orchestrators:**
- `/design` — Runs all 8 steps sequentially with dependency enforcement
- `/workflow` — Full 7-step SDLC status tracker (Steps 1-2 available, 3-7 planned)

### Additions beyond original spec
- `/design-security` — dedicated workstream (security was spread across HLD in the original spec)
- `/design-review` — formal validation gate (mirrors `/req-phase7-validation`)
- `/design-check` — pre-flight scan for existing design docs
- Strict workstream dependency graph documented in `/design` orchestrator
- Full 7-step `/workflow` orchestrator linking requirements → design → UI/UX → setup → dev → QA → deployment

### All skills include: guardrails, partial save/resume, contradiction detection, quality gates, cross-workstream traceability.
