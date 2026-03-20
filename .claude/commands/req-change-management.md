# Post-Sign-Off Change Management

You are managing the requirements change process. Once the requirements baseline is signed off (Phase 7), any changes must go through this structured process to prevent uncontrolled scope creep.

## When to Use This Skill

- A stakeholder requests a new feature or change to an existing requirement
- A technical discovery invalidates or modifies an existing requirement
- An external dependency changes (API contract, compliance rule, etc.)
- A defect is found in the requirements themselves (not in code)

## Instructions

### For a New Change Request

Ask the user the following questions:

1. **What is the change?**
   - Describe the requested change in detail
   - Which existing requirement(s) does it affect? (Reference IDs from requirements docs)

2. **Who is requesting it and why?**
   - Requestor name and role
   - Business justification — what problem does this solve?

3. **What is the impact?**
   - Which documents need updating? (functional, NFR, technical, scope)
   - Does this affect the MVP? Does it add new user stories?
   - Estimated effort impact (Small/Medium/Large)
   - Does it introduce new dependencies or risks?

4. **What is the priority?**
   - Is this blocking current work?
   - Can it wait for a future release?

5. **Who needs to approve this change?**
   - Reference the RACI matrix from Phase 2

### After Gathering Information

Generate a **Change Request** entry and append it to `docs/requirements/change-log.md`:

```markdown
## CR-[NNN]: [Change Title]

**Date:** [date]
**Requested By:** [name, role]
**Status:** Proposed | Under Review | Approved | Rejected | Implemented

### Description
[What is being changed]

### Justification
[Why this change is needed]

### Impact Assessment
- **Affected Documents:** [list]
- **Affected User Stories:** [IDs]
- **MVP Impact:** [None / Adds to MVP / Changes MVP scope]
- **Effort Impact:** [Small / Medium / Large]
- **New Dependencies:** [list or None]
- **New Risks:** [list or None]

### Approval
- **Approver:** [name, role]
- **Decision:** Pending
- **Conditions:** [any conditions for approval]
- **Decision Date:** [date]

### Implementation Notes
[How to update the requirements docs if approved]
```

### For Reviewing Existing Change Requests

1. Read `docs/requirements/change-log.md`
2. Present a summary: Total CRs: X | Proposed: X | Approved: X | Rejected: X | Implemented: X
3. Ask the user which CRs they want to review or update
4. For approved CRs: guide the user through updating the affected requirements documents

### If `docs/requirements/change-log.md` Does NOT Exist

Create it with the header:

```markdown
# Requirements Change Log

**Baseline Signed Off:** [date from validation-signoff.md or "Not yet signed off"]
**Total Change Requests:** 0

## Change Requests

(None yet)
```

## Rules

- Changes to Must Have items require Product Owner approval
- Changes affecting the MVP require all stakeholders in the RACI "Accountable" column
- Every approved change must update the traceability matrix (`/req-traceability`)
- Every approved change must be reflected in the ambiguity log if it resolves an open item
- Rejected changes stay in the log with rationale (never deleted)

## Quality Gate

- [ ] Every CR has a unique ID and complete impact assessment
- [ ] Approval chain matches the RACI matrix
- [ ] Approved CRs have been reflected in the requirements documents
- [ ] Traceability matrix is updated after implementation
