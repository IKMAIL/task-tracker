# Phase 7 — Validation & Sign-Off

You are conducting Phase 7 of the requirements gathering process. The goal is to confirm that what was captured is **complete, correct, and agreed upon**.

## Pre-Requisite

All previous phase documents should exist in `docs/requirements/`. List which ones are present and which are missing. If critical documents are missing, recommend completing those phases first.

## Instructions

This phase is a structured review, not a Q&A. Walk through each check systematically.

### Step 1: Internal Review — Technical Feasibility

Review the requirements documents and flag:
- User stories that are technically infeasible or extremely complex
- NFRs that conflict with each other or with technical constraints
- Integrations where the external system's API is unknown or undocumented
- Data model gaps (entities referenced in stories but not in the data dictionary)

Present findings to the user.

### Step 2: Walkthrough — Requirements Presentation

Summarise the full requirements set back to the user:
1. **Business Context**: Problem, objectives, KPIs (from Phase 1)
2. **Stakeholders**: Key people and their roles (from Phase 2)
3. **Functional Scope**: Number of epics, stories, business rules (from Phase 3)
4. **NFRs**: Key performance, security, and compliance targets (from Phase 4)
5. **Technical Stack**: Major technology decisions (from Phase 5)
6. **Scope**: MVP definition and what's out of scope (from Phase 6)

Ask the user: "Does this accurately represent what we need to build?"

### Step 3: Gap Analysis

Check for and report on:
- User stories without acceptance criteria
- User roles mentioned but not in the permission matrix
- Integrations listed but without documented owners
- NFRs with vague targets (flag any that say "fast", "secure", "scalable" without numbers)
- Entities in stories not covered in the data dictionary
- Stakeholders in the RACI matrix not in the stakeholder register (or vice versa)

### Step 4: Ambiguity Log Review

Check if `docs/requirements/ambiguity-log.md` exists:
- If yes: review all open items and ask the user to resolve each one
- If no: create one and scan all documents for ambiguous items, then ask the user to resolve them

Every item must have: Owner, Due Date, Status (Open/Resolved/Deferred)

### Step 5: Sign-Off Checklist

Present this checklist to the user and go through each item:

- [ ] Every user story has clear acceptance criteria
- [ ] All user roles and permissions are defined
- [ ] All integrations are documented with owners confirmed
- [ ] NFRs are measurable (no vague terms like "fast" or "secure")
- [ ] MERN-specific security checklist is complete (Phase 4)
- [ ] MVP scope is agreed and signed
- [ ] T-shirt sizing is assigned to all backlog items (Phase 6)
- [ ] Ambiguity log has zero unresolved blockers
- [ ] Assumptions register has no unvalidated high-impact assumptions
- [ ] Data model covers all identified entities (embedded/referenced decisions documented)
- [ ] Compliance and security obligations are captured
- [ ] Stakeholder register and RACI are complete
- [ ] Technical constraints, ADRs, and testing strategy are documented
- [ ] Microservice boundaries and communication patterns are documented (Phase 5)
- [ ] Out-of-scope register is documented and agreed
- [ ] Change management process is defined
- [ ] Glossary is consistent across all phase documents

### Step 6: Formal Sign-Off

Ask the user to confirm:
- "Do you approve this requirements baseline?"
- Record the approval with date and any conditions

### After Completion

Generate the **Validation & Sign-Off Report**:

- **Review Date**: [date]
- **Reviewer(s)**: [names/roles]
- **Technical Feasibility Issues**: [list or "None"]
- **Gap Analysis Findings**: [list or "None"]
- **Ambiguity Log Status**: [X open, Y resolved, Z deferred]
- **Sign-Off Checklist**: [all items with pass/fail]
- **Approval Status**: Approved / Approved with Conditions / Not Approved
- **Conditions** (if any): [list]
- **Next Steps**: [recommended actions]

**Save** to `docs/requirements/validation-signoff.md`

Generate the **Deliverables Summary Table**:

| Deliverable | File | Status | Owner |
|---|---|---|---|
| Problem statement + KPIs + Glossary | business-context.md | Complete/Incomplete | Product Owner |
| Stakeholder register + RACI | stakeholder-register.md | Complete/Incomplete | BA / PM |
| Prioritised user story backlog | functional-requirements.md | Complete/Incomplete | BA + Dev Lead |
| Business rules catalogue | functional-requirements.md | Complete/Incomplete | BA + Domain Expert |
| Data dictionary (MongoDB-oriented) | functional-requirements.md | Complete/Incomplete | Dev Lead + BA |
| Assumptions register | functional-requirements.md | Complete/Incomplete | BA |
| NFR specification + MERN security checklist | nonfunctional-requirements.md | Complete/Incomplete | Dev Lead |
| Technical constraints + ADRs + Testing strategy | technical-constraints.md | Complete/Incomplete | Dev Lead |
| Scope definition + T-shirt sizing + out-of-scope | scope-definition.md | Complete/Incomplete | PM + PO |
| Ambiguity log | ambiguity-log.md | Complete/Incomplete | BA |
| Signed requirements baseline | validation-signoff.md | Complete/Incomplete | All stakeholders |

## Quality Gate

Requirements gathering is complete when:
- [ ] Every answer is clear, measurable, and agreed upon
- [ ] Ambiguity log has zero unresolved blockers
- [ ] Sign-off checklist is 100% passed
- [ ] Formal approval is recorded
