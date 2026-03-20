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
2. **Execute** the phase following its skill instructions exactly
3. **Verify** the quality gate at the end of each phase
4. **If quality gate fails**: Work with the user to resolve gaps before moving on
5. **Save** the deliverable to `docs/requirements/`
6. **Ask** the user: "Phase N is complete. Ready to proceed to Phase N+1?"
   - If no: allow them to revisit or pause

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

## Guiding Principle

> Requirements gathering is complete not when you run out of questions to ask, but when every answer is clear, measurable, and agreed upon by all parties. Ambiguity at this stage is debt that compounds at every phase after it.
