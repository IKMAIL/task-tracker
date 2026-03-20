# System Design & Architecture — Master Orchestrator

You are running the System Design & Architecture phase for a MERN + TypeScript project. This orchestrator guides through all six workstreams sequentially, ensuring each is complete before the next begins.

## Process Overview

| Step | Skill | Deliverable | Depends On |
|---|---|---|---|
| Pre-check | `/design-check` | Existing docs scan, requirements inputs inventory | — |
| WS1 | `/design-hld` | Architecture diagram, decision register, component catalogue | Requirements sign-off |
| WS2 | `/design-data-model` | TypeScript interfaces, Mongoose schemas, ER diagram, index plan | WS1 |
| WS3 | `/design-api-contracts` | OpenAPI spec, shared types, API summary table | WS2 |
| WS4 | `/design-security` | Security architecture, implementation checklist | WS1 + WS3 |
| WS5 | `/design-folder-structure` | Annotated folder tree, naming conventions, scaffold plan | WS1 + WS3 |
| WS6 | `/design-adrs` | Full ADR log (8 mandatory + project-specific), ADR index | WS1-WS5 |
| Review | `/design-review` | Consistency checks, gap analysis, sign-off report | WS1-WS6 |

**Dependency graph** (strict sequential, each step requires its predecessors):
```
Pre-check
    └── WS1 (HLD)
            ├── WS2 (Data Model)
            │       └── WS3 (API Contracts)
            │               └── WS4 (Security)  ← also needs WS1
            │               └── WS5 (Folder)    ← also needs WS1
            └── [WS4 and WS5 can run after WS3 is complete]
                        └── WS6 (ADRs)           ← consolidates all
                                └── Review
```

## Instructions

### Step 0: Pre-Flight

1. Check if `docs/design/` directory exists. Create it if not. Create `docs/adr/` if not.
2. Verify requirements sign-off exists: `docs/requirements/validation-signoff.md`
   - If missing: warn the user that requirements should be completed first. Show them `/requirements` to run it. Allow them to proceed if they insist, but log the risk.
3. Run the pre-check (follow `/design-check` instructions).
4. Present findings and ask the user whether to start fresh, resume, or update.

### Step 1: Execute Workstreams Sequentially

For each workstream (Pre-check → WS1 → WS2 → WS3 → WS4 → WS5 → WS6 → Review):

1. **Announce** the workstream: "Starting [WS Name] — [brief description of goal]"
2. **Check pre-requisites** — if a dependency workstream's output is missing, stop and redirect the user
3. **Execute** the workstream following its skill instructions exactly
4. **Verify** the quality gate at the end of each workstream
5. **If quality gate fails**: resolve gaps with the user before moving on
6. **Save** the deliverable to `docs/design/` or `docs/adr/`
7. **Ask** the user: "[WS Name] is complete. Ready to proceed to [next WS]?"
   - If no: allow them to revisit or pause

### Step 2: Cross-Workstream Consistency Check

Run automatically after WS3 (API Contracts):
- Check that all API response shapes reference fields present in WS2 schemas
- Flag any mismatch before allowing WS4/WS5 to begin

Run automatically after WS6 (ADRs):
- Verify that all 8 mandatory ADRs exist
- Check that all decisions from WS1-WS5 have corresponding ADRs

### Step 3: Final Review

Execute the review (follow `/design-review` instructions) which includes:
- Full consistency check across all workstreams
- Gap analysis against requirements
- Design ambiguity log resolution
- Phase gate checklist
- Formal sign-off

### Step 4: Completion Summary

After sign-off, present:

```
System Design & Architecture — Complete
========================================
Workstreams Completed: [N/8]
Documents Generated:   [count]
  docs/design/:        [list files]
  docs/adr/:           [list ADR files]

Decisions Documented:  [ADR count]
Endpoints Designed:    [count]
Entities Modelled:     [count]
Ambiguities:           [resolved/total]
Sign-Off:              [Approved/Conditional/Pending]

Parallel Tracks Now Available:
  Step 3 — UI/UX Design:       Ready / Blocked (reason)
  Step 4 — Project Setup:      Ready / Blocked (reason)

All deliverables saved to: docs/design/ and docs/adr/
Next: Run /workflow to see the full SDLC picture
```

## Rules

- **Never skip a workstream** unless the user explicitly requests it — and document the skip with the reason
- **Never move to the next workstream** if the current quality gate has unresolved blockers
- **Respect the dependency order** — Data Model needs HLD, API Contracts need Data Model, etc.
- **Always save deliverables** before moving on (never lose work in progress)
- **Reference requirements** — every design decision should trace back to a requirement, NFR, or ADR
- **Detect contradictions** — if a workstream decision conflicts with a prior one, stop and resolve before continuing
- **Support partial save** — each workstream supports pause/resume; honour "pause", "stop", or "save and continue later"
- **Do not invent requirements** — design only what the requirements specify; if something seems missing, ask

## Guiding Principle

> Design is complete not when all the questions have been answered, but when any developer on the team could pick up the documents and start building without needing to make a significant architectural decision. Ambiguity at this stage multiplies into bugs, rework, and merge conflicts.
