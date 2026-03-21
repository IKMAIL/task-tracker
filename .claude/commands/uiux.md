# UI/UX Design — Master Orchestrator

You are running the UI/UX Design phase for a MERN + TypeScript project. This orchestrator guides through all five stages sequentially, producing a complete design specification before any React code is written.

## Process Overview

| Step | Skill | Deliverable | Depends On |
|---|---|---|---|
| Pre-check | `/uiux-check` | Existing UI/UX artifacts scan | — |
| Stage 1 | `/uiux-stage1-ia-flows` | Sitemap, user flows, route mapping | Design sign-off |
| Stage 2 | `/uiux-stage2-wireframes` | Low-fidelity screen specifications | Stage 1 |
| Stage 3 | `/uiux-stage3-design-system` | Color tokens, typography, component inventory | Stage 2 |
| Stage 4 | `/uiux-stage4-hifi` | Full-fidelity screen specs with all states | Stages 2 + 3 |
| Stage 5 | `/uiux-stage5-handoff` | Stakeholder review, developer handoff package | Stages 1-4 |
| Review | `/uiux-review` | Consistency checks, accessibility audit, sign-off | Stages 1-5 |

**Dependency graph** (strict sequential, each step requires its predecessors):
```
Pre-check
    └── Stage 1 (IA & User Flows)
            └── Stage 2 (Wireframes)
                    └── Stage 3 (Design System)
                            └── Stage 4 (Hi-Fi Specifications)
                                    └── Stage 5 (Review & Handoff)
                                            └── Phase Gate Review
```

## Instructions

### Step 0: Pre-Flight

1. Check if `docs/design/uiux/` directory exists. Create it if not.
2. Verify design sign-off exists: `docs/design/design-signoff.md`
   - If missing: warn the user that system design should be completed first. Show them `/design` to run it. Allow them to proceed if they insist, but log the risk.
3. Run the pre-check (follow `/uiux-check` instructions).
4. Present findings and ask the user whether to start fresh, resume, or audit existing frontend.

### Step 1: Execute Stages Sequentially

For each stage (Pre-check → Stage 1 → Stage 2 → Stage 3 → Stage 4 → Stage 5 → Review):

1. **Announce** the stage: "Starting [Stage Name] — [brief description of goal]"
2. **Check pre-requisites** — if a dependency stage's output is missing, stop and redirect the user
3. **Execute** the stage following its skill instructions exactly
4. **Verify** the quality gate at the end of each stage
5. **If quality gate fails**: resolve gaps with the user before moving on
6. **Save** the deliverable to `docs/design/uiux/`
7. **Ask** the user: "[Stage Name] is complete. Ready to proceed to [next stage]?"
   - If no: allow them to revisit or pause

### Step 2: Cross-Stage Consistency Checks

Run automatically after Stage 3 (Design System):
- Verify every component in the inventory appears in at least one wireframe
- Flag unused components or wireframes referencing components not in the inventory

Run automatically after Stage 5 (Handoff):
- Verify every wireframe has a hi-fi spec
- Verify every hi-fi spec only uses components from the design system
- Verify every Must-Have user story has screens
- Verify accessibility annotations are present for all screens

### Step 3: Final Review

Execute the review (follow `/uiux-review` instructions) which includes:
- Cross-stage completeness check
- Design system coverage audit
- Consistency audit across all screens
- Accessibility audit against WCAG AA
- Requirements traceability verification
- Developer readiness check
- Phase gate checklist
- Formal sign-off

### Step 4: Completion Summary

After sign-off, present:

```
UI/UX Design — Complete
========================
Stages Completed:        [N/7]
Documents Generated:     [count]
  docs/design/uiux/:     [list files]

Screens Designed:        [count]
Components Defined:      [count] (Atoms: X, Molecules: X, Organisms: X)
User Flows Documented:   [count]
Accessibility Items:     [count annotations]
Change Requests:         [resolved/total]
Sign-Off:                [Approved/Conditional/Pending]

Next Steps:
  Step 4 — Project Setup:      Ready / Blocked (reason)
  Step 5 — Development:        Ready / Blocked (reason)

All deliverables saved to: docs/design/uiux/
Next: Run /workflow to see the full SDLC picture
```

## Rules

- **Never skip a stage** unless the user explicitly requests it — document the skip with the reason
- **Never move to the next stage** if the current quality gate has unresolved blockers
- **Respect the dependency order** — Wireframes need IA, Design System needs Wireframes, Hi-Fi needs Design System, etc.
- **Always save deliverables** before moving on (never lose work in progress)
- **Reference requirements and design docs** — every screen traces to a user story
- **Detect contradictions** — if a stage output conflicts with requirements or design, stop and resolve before continuing
- **Support partial save** — each stage supports pause/resume; honour "pause", "stop", or "save and continue later"
- **Do not invent screens** — design only what the requirements specify; if something seems missing, ask
- **Accessibility is non-negotiable** — WCAG AA minimum baked into every stage, not just handoff

## Guiding Principle

> "The most expensive mistake in this phase is skipping straight to high-fidelity specs without wireframes or a design system. Wireframes and the design system are not overhead — they are what make high-fidelity specifications fast to produce and fast to build."
