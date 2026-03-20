# Workstream 6 — Architecture Decision Records (ADRs)

You are conducting Workstream 6 of the System Design & Architecture phase. The goal is to **formally document every significant technical decision** made across Workstreams 1-5, so the reasoning is never lost and debates don't repeat mid-sprint.

## Pre-Requisite

Check that all prior workstream outputs exist and read them:
- `docs/design/high-level-design.md` — decisions made in WS1
- `docs/design/data-model.md` — schema decisions from WS2
- `docs/design/api-contracts.md` — API design decisions from WS3
- `docs/design/security-architecture.md` — security decisions from WS4
- `docs/design/folder-structure.md` — structural decisions from WS5
- `docs/requirements/technical-constraints.md` — ADR stubs from Phase 5

This workstream consolidates all decisions into the ADR log. It also promotes any Phase 5 ADR stubs to full ADRs.

## Instructions

Scan all workstream documents for decisions. For each significant decision, create a full ADR. Present each ADR to the user for review before saving.

A decision is **significant** if:
- It was discussed as a trade-off (alternatives were considered)
- It shapes the work of multiple team members or workstreams
- Reversing it would cost more than a few hours
- A new team member would reasonably ask "why did we do it this way?"

### Behavioral Guardrails

- Do not create ADRs for trivial decisions (e.g., "we named the variable `userId`")
- Do not change decisions while writing ADRs — if a decision looks wrong, flag it to the user as a question, don't silently override it
- ADR status must reflect reality: use "Proposed" if not yet fully confirmed, "Accepted" if confirmed by the user in prior workstreams

### ADR Format

Every ADR follows this structure:

```markdown
# ADR-[NNN]: [Short Decision Title]

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-[NNN]
**Deciders:** [Who was involved in the decision]
**Workstream:** WS[N] — [Name]

## Context

What situation or requirement forced this decision?
What constraints (technical, business, team) are relevant?
What happens if we do nothing?

## Decision

What was decided? State it clearly and specifically.
Include any configuration values or key parameters (e.g., "15-minute access token lifetime").

## Consequences

### Positive
- What does this enable?
- What problems does it solve?

### Negative / Trade-offs
- What complexity does this add?
- What are we giving up?
- What risks does this introduce?

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| [Option A] | [Reason] |
| [Option B] | [Reason] |

## Implementation Notes

Any key implementation details for developers (libraries, configuration, patterns to follow).

## References

- Linked ADRs: [ADR-NNN]
- Requirements source: [Phase N, Q[N] / NFR / User Story US-NNN]
```

### Mandatory ADRs (Always Required)

These must exist for every MERN project:

**ADR-001: Application Architecture Pattern**
- Source: WS1 Decision 1 (monolith / microservices / modular monolith)

**ADR-002: Authentication Strategy**
- Source: WS1 Decision 3 (JWT + refresh, OAuth, SSO)
- Must include: token lifetime, storage, refresh strategy, revocation

**ADR-003: Frontend Architecture**
- Source: WS1 Decision 4 (SPA vs SSR, state management)
- Must include: framework, state management library, routing

**ADR-004: MongoDB Schema Strategy**
- Source: WS2 (embed vs reference policy, index strategy)

**ADR-005: API Design Conventions**
- Source: WS3 (REST conventions, error shape, pagination, versioning)

**ADR-006: Security Architecture**
- Source: WS4 (CORS policy, CSP, rate limiting, secrets management)

**ADR-007: Monorepo & Build Strategy**
- Source: WS5 (workspace tooling, shared types, build orchestration)

**ADR-008: Testing Strategy**
- Source: Phase 5 Q34-Q39 (frameworks, coverage thresholds, test data approach)

### Additional ADRs (Based on Decisions Made)

Generate an ADR for each of the following if applicable:

- ADR-009: Communication Protocol (if WebSockets or message queue chosen)
- ADR-010: Caching Strategy (if Redis or in-memory cache chosen)
- ADR-011: Background Job Processing (if BullMQ, Agenda, or cron chosen)
- ADR-012: File Storage (if S3, Azure Blob, or other chosen)
- ADR-013: Deployment Architecture (if Kubernetes, ECS, or specific platform chosen)
- ADR-014: Observability Stack (if specific monitoring/logging tools chosen)
- ADR-015: Database Deployment (if Atlas vs self-hosted, sharding, or replication chosen)
- ADR-016: Service Communication (microservices only — sync vs async, circuit breaker pattern)
- ADR-017: Data Consistency Model (microservices only — eventual vs strong consistency approach)
- ADR-018: Third-party Integration Pattern (if external APIs integrated)
- ADR-019: Validation Library (Zod vs Joi vs Yup — shared schema strategy)
- ADR-020: Component Library (MUI vs Tailwind vs Chakra vs custom)

For any significant decision from workstreams not covered by the above — create an ADR.

### ADR Numbering and Filing

- Number sequentially: ADR-001, ADR-002, ...
- File as: `docs/adr/[NNN]-[kebab-case-title].md`
- Example: `docs/adr/001-application-architecture-pattern.md`
- Maintain an index in `docs/adr/README.md`

### ADR Index Format

```markdown
# Architecture Decision Records

| ID | Title | Status | Date | Workstream |
|---|---|---|---|---|
| ADR-001 | Application Architecture Pattern | Accepted | 2026-03-20 | WS1 |
| ADR-002 | Authentication Strategy | Accepted | 2026-03-20 | WS1 |
| ... | ... | ... | ... | ... |
```

### Promoting Phase 5 ADR Stubs

Phase 5 may have created stub ADRs in `docs/requirements/technical-constraints.md`. For each stub:
1. Read the stub context and decision
2. Fill in the full ADR format (consequences, alternatives, implementation notes)
3. Move to `docs/adr/`
4. Update status from "Proposed" to "Accepted" if the decision was confirmed in workstreams 1-5

### After All ADRs Are Written

Generate **two deliverables**:

#### 1. Individual ADR Files

One file per ADR in `docs/adr/[NNN]-[title].md`.

#### 2. ADR Index

`docs/adr/README.md` with the full index table.

**Present the index** to the user for review. For any ADR the user wants to change, revise it before saving.

**Save** all ADR files to `docs/adr/`

**Recommend** the user proceed to `/design-review`

## Quality Gate

Before marking this workstream complete, confirm:
- [ ] All 8 mandatory ADRs exist (ADR-001 through ADR-008)
- [ ] Every significant decision from WS1-WS5 has an ADR
- [ ] Every ADR has: context, decision, consequences (positive and negative), and alternatives considered
- [ ] No ADR status is "Proposed" unless the decision is genuinely still open
- [ ] All ADRs are filed in `docs/adr/` with correct numbering
- [ ] ADR index (`docs/adr/README.md`) is complete and up to date
- [ ] Phase 5 ADR stubs have been promoted to full ADRs
- [ ] Cross-references between related ADRs are included
- [ ] Each ADR links back to the requirement or NFR that drove the decision
