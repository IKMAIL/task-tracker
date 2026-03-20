# Requirements Gathering — Master Orchestrator

You are running the full requirements gathering process for a MERN + TypeScript project. This orchestrator guides through all phases sequentially, ensuring completeness before moving to the next phase.

## Process Overview

| Phase | Skill | Deliverable |
|---|---|---|
| Pre-Check | `/req-check` | Existing docs scan report |
| Phase 1 | `/req-phase1-business` | Problem statement, KPIs, personas |
| Phase 2 | `/req-phase2-stakeholders` | Stakeholder register, RACI matrix |
| Phase 3 | `/req-phase3-functional` | User stories, business rules, data dictionary |
| Phase 4 | `/req-phase4-nonfunctional` | NFR spec, security checklist |
| Phase 5 | `/req-phase5-technical` | Technical constraints, ADRs, dependencies |
| Phase 6 | `/req-phase6-scope` | MVP definition, prioritised backlog, out-of-scope |
| Phase 7 | `/req-phase7-validation` | Sign-off checklist, gap analysis, approval |

**Supplementary (run as needed):**
- `/req-ambiguity-log` — Track and resolve open questions
- `/req-traceability` — Cross-phase requirement linking
- `/req-change-management` — Post-sign-off change requests

## Instructions

### Step 0: Pre-Flight

1. Check if `docs/requirements/` directory exists. Create it if not.
2. Scan for any existing requirements documents (follow `/req-check` instructions).
3. Present findings and ask the user whether to start fresh, resume, or update.

### Step 1: Execute Phases Sequentially

For each phase (1 through 7):

1. **Announce** the phase: "Starting Phase N — [Phase Name]"
2. **Execute** the phase following its skill structure — present the required questions/decisions, allow clarifying questions, and adapt when the user needs to revisit prior answers
3. **Verify** the quality gate at the end of each phase using the **Quality Gate Decision Tree** below
4. **Save** the deliverable to `docs/requirements/`
5. **Ask** the user: "Phase N is complete. Ready to proceed to Phase N+1?"
   - If no: allow them to revisit or pause

### Quality Gate Decision Tree

When evaluating a phase's quality gate:

1. **All checklist items pass** → Proceed to next phase
2. **Only non-blocking items are incomplete** (items explicitly marked Deferred with an ambiguity log ID and owner) → Proceed, but announce: "Proceeding with N deferred items — these must be resolved before Phase 7 sign-off"
3. **Any blocking item fails** (no measurable target, no persona defined, no sign-off authority, etc.) → **STOP**. Work with the user to resolve. Do not proceed until the blocking item is resolved or the user explicitly accepts the risk and it is logged to the ambiguity log with status **Accepted Risk**, owner, and date

**Blocking vs. non-blocking rules:**
- Quality gate items that use words like "specific", "measurable", "defined", "documented" are **blocking** — vague or missing answers cannot be deferred
- Quality gate items about completeness counts (e.g., "at least 2 KPIs") are **blocking** — the threshold must be met
- Quality gate items about coverage (e.g., "all integrations documented") are **non-blocking** only if the missing items are logged to the ambiguity log with owner and due date

### Step 2: Cross-Phase Checks

After Phase 3 (Functional) and again after Phase 6 (Scope):
- Run the ambiguity log scan (follow `/req-ambiguity-log` instructions)
- Flag any new ambiguities found

After Phase 6 (Scope):
- Build the traceability matrix (follow `/req-traceability` instructions)
- Ensure all user stories link to business objectives

### Step 3: Final Validation

Execute Phase 7 (Validation & Sign-Off) which includes:
- Full review of all deliverables
- Gap analysis
- Ambiguity log resolution
- Sign-off checklist
- Formal approval

### Step 4: Completion Summary

After sign-off, present:

```
Requirements Gathering Complete
================================
Phases Completed: 7/7
Documents Generated: [count]
User Stories: [count] (Must: X, Should: X, Could: X, Won't: X)
NFRs Defined: [count]
ADRs Created: [count]
Ambiguities: [resolved/total]
Sign-Off: [Approved/Conditional/Pending]

All deliverables saved to: docs/requirements/
```

## Rules

- **Never skip a phase** unless the user explicitly requests it
- **Never move to the next phase** if the current quality gate has unresolved blockers
- **Always save deliverables** before moving on (don't lose work)
- **Reference previous phases** — each phase builds on the last
- **Be concise** in questions — respect the user's time
- **Push for specificity** — reject vague answers and ask for measurable targets
- **Detect contradictions** — if an answer in Phase N conflicts with a prior phase, flag it immediately and resolve before continuing
- **Support partial save** — each phase supports pause/resume via draft files; honour "pause", "stop", or "save and continue later"
- **Carry the glossary forward** — terms defined in Phase 1 should be used consistently in all subsequent phases
- **Do not invent answers** — if the user hasn't answered a question, mark it "[TBD]" rather than assuming

## Guiding Principle

> Requirements gathering is complete not when you run out of questions to ask, but when every answer is clear, measurable, and agreed upon by all parties. Ambiguity at this stage is debt that compounds at every phase after it.
