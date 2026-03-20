# Requirements Gathering Skills - Implementation Plan

## Task
Create Claude Code slash commands (skills) for a 7-phase requirements gathering process, plus an orchestrator and supplementary skills.

## Skills to Create (in `.claude/commands/`)

- [x] `req-check.md` — Pre-check: scan for existing requirements docs before starting
- [x] `req-phase1-business.md` — Phase 1: Business Context (interactive Q&A → problem statement + KPIs)
- [x] `req-phase2-stakeholders.md` — Phase 2: Stakeholders (interactive Q&A → stakeholder register + RACI)
- [x] `req-phase3-functional.md` — Phase 3: Functional Requirements (interactive → user stories + business rules + data dictionary)
- [x] `req-phase4-nonfunctional.md` — Phase 4: Non-Functional Requirements (interactive → NFR spec + security checklist)
- [x] `req-phase5-technical.md` — Phase 5: Technical Clarifications MERN-specific (interactive → constraints doc + ADR stubs + deps list)
- [x] `req-phase6-scope.md` — Phase 6: Scope Definition & Prioritisation (interactive → MVP def + prioritised backlog + out-of-scope register)
- [x] `req-phase7-validation.md` — Phase 7: Validation & Sign-Off (interactive → checklist + gap analysis)
- [x] `req-ambiguity-log.md` — Ambiguity Log: structured template for tracking open questions
- [x] `req-traceability.md` — Traceability Matrix: cross-phase linking (stakeholders → stories → NFRs → tech decisions)
- [x] `req-change-management.md` — Change Management: post-sign-off scope change process
- [x] `requirements.md` — Master Orchestrator: runs all phases sequentially

## Other
- [x] Create `docs/requirements/` directory with a README
- [x] Update CLAUDE.md to reference the new skills
- [ ] Git: commit and push to `claude/mern-requirements-skills-CyVY5`

## Review

### Summary
Created 12 Claude Code slash commands for structured requirements gathering:
- **7 phase skills** (business context, stakeholders, functional, NFR, technical, scope, validation)
- **4 supplementary skills** (pre-check, ambiguity log, traceability matrix, change management)
- **1 orchestrator** (`/requirements`) that runs all phases sequentially

### Additions beyond original spec
- `/req-check` — Pre-flight scan for existing docs to avoid duplication
- `/req-ambiguity-log` — Structured tracker with owner/due date/impact for open questions
- `/req-traceability` — Cross-phase linking with orphan analysis
- `/req-change-management` — Post-sign-off change request process with impact assessment

### All skills are interactive (Q&A), generate deliverables to `docs/requirements/`, and include quality gates.
