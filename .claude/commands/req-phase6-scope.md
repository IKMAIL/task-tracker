# Phase 6 — Scope Definition & Prioritisation

You are conducting Phase 6 of the requirements gathering process. The goal is to agree on **what is in, what is out, and what order things get built**.

## Pre-Requisite

Check that `docs/requirements/functional-requirements.md` exists — the user stories from Phase 3 are the input for prioritisation. If missing, inform the user that Phase 3 should be completed first, but allow them to proceed.

## Instructions

Reference the user stories from Phase 3. Walk through them with the user to assign priorities and define scope boundaries.

### Questions to Ask

1. **What is the MVP — the absolute minimum to go live?**
   - Which user stories are essential for day-one? Why?
   - What is the smallest valuable increment you could ship?

2. **What features are nice-to-have vs. must-have?**
   - For each user story or epic, ask: "If this was missing on launch day, would you delay the launch?"
   - If yes → Must Have. If no → Should/Could Have.

3. **Are there hard deadlines driving scope decisions?**
   - Regulatory deadlines, contractual obligations, market windows
   - If yes: what is the date and what is the consequence of missing it?

4. **What is explicitly out of scope for v1?**
   - Document these clearly to prevent scope creep
   - For each: why is it out of scope? When might it come back?

5. **How will scope change be managed after sign-off?**
   - What is the process for requesting a change? (Change request form, approval chain)
   - What is the impact assessment process? (Effort, risk, dependencies)

### After All Questions Are Answered

Generate **three deliverables**:

#### 1. Prioritised Backlog (MoSCoW)

Group all user stories from Phase 3 using MoSCoW:

**Must Have** — Non-negotiable; MVP blockers
| Story ID | Title | Rationale |
|---|---|---|

**Should Have** — High value; include if capacity allows
| Story ID | Title | Rationale |
|---|---|---|

**Could Have** — Nice to have; deferred to later sprint
| Story ID | Title | Rationale |
|---|---|---|

**Won't Have** — Explicitly out of scope for this release
| Story ID | Title | Rationale | Revisit When |
|---|---|---|---|

#### 2. MVP Definition Document

- **MVP Statement**: One paragraph describing what the MVP delivers and to whom
- **MVP User Stories**: List of Must Have story IDs
- **MVP Success Criteria**: How do we know the MVP is working?
- **Target Date**: If applicable
- **Key Risks to MVP**: What could prevent the MVP from shipping?

#### 3. Out-of-Scope Register

| Item | Reason for Exclusion | Requested By | Potential Future Release | Dependencies |
|---|---|---|---|---|

**Present all deliverables** to the user for review before saving.

**Save** to `docs/requirements/scope-definition.md`

**Recommend** the user proceed to `/req-phase7-validation`

## Quality Gate

Before marking this phase complete, confirm:
- [ ] Every user story from Phase 3 is categorised (Must/Should/Could/Won't)
- [ ] MVP is defined with clear success criteria
- [ ] Out-of-scope items are documented with rationale
- [ ] Hard deadlines are identified with consequences of missing them
- [ ] Scope change management process is agreed upon
