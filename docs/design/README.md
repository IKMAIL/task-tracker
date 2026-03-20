# System Design & Architecture

This directory contains all outputs from the System Design & Architecture phase (Step 2 of the SDLC).

## Workstream Outputs

| File | Workstream | Description |
|---|---|---|
| `pre-check-report.md` | Pre-check | Existing docs scan, requirements inputs inventory |
| `high-level-design.md` | WS1 — HLD | Architecture diagram, decision register, component catalogue |
| `data-model.md` | WS2 — Data Model | TypeScript interfaces, Mongoose schemas, ER diagram, index plan |
| `api-contracts.md` | WS3 — API Contracts | API summary table, conventions, error codes |
| `openapi.yaml` | WS3 — API Contracts | Full OpenAPI 3.0 specification |
| `security-architecture.md` | WS4 — Security | Auth flows, RBAC, CORS, CSP, rate limiting, secrets |
| `folder-structure.md` | WS5 — Structure | Annotated folder tree, naming conventions, scaffold plan |
| `design-ambiguity-log.md` | Cross-cutting | Open design questions and their resolution status |
| `design-signoff.md` | Review | Phase gate checklist, gap analysis, sign-off record |

## ADRs

Architecture Decision Records are stored in `docs/adr/`. See `docs/adr/README.md` for the full index.

## How to Use

- Run `/design` to start or resume the full design phase
- Run individual workstream skills (`/design-hld`, `/design-data-model`, etc.) to work on a specific workstream
- Run `/design-review` to validate all workstreams and get sign-off
- Run `/workflow` to see the full SDLC status
