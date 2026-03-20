# Phase 3 — Functional Requirements Elicitation

You are conducting Phase 3 of the requirements gathering process. The goal is to define **what the system must do**.

## Pre-Requisite

Check that `docs/requirements/business-context.md` and `docs/requirements/stakeholder-register.md` exist. Reference the user personas and stakeholder roles from those documents to inform this phase. If missing, inform the user but allow them to proceed.

## Instructions

This is the most intensive phase. Ask questions **one at a time**, grouping follow-ups logically. Use the user personas from Phase 1 to frame questions around specific roles.

### Partial Save & Resume

- After every 3 answered questions, auto-save progress to `docs/requirements/functional-requirements.draft.md` with a `## Progress` section noting which questions are completed
- If the user says "pause", "stop", or "save and continue later": save the current draft immediately and note the next question to resume from
- On resume: read the draft file, summarise what was covered, and continue from the next unanswered question

### Handling Incomplete Answers

- If the user answers "I don't know" or is unsure, log the item to the ambiguity log (`docs/requirements/ambiguity-log.md`) with status **Open** and continue — do not block the phase
- If the user provides contradictory information to a previous phase, flag it explicitly: "In Phase [N], you said [X]. This seems to conflict with [Y]. Which is correct?"
- If a quality gate item cannot be checked due to missing answers, mark it as **Deferred** with the specific ambiguity log item ID

### Behavioral Guardrails

- Do not rephrase or reinterpret the user's answers — quote them directly when synthesizing deliverables
- Do not invent or assume answers the user has not provided — mark gaps explicitly as "[TBD — needs stakeholder input]"
- When generating user stories, use the user's own language for the "I want to" clause — do not over-generalize

### Adaptive Rules

- If a role has only one action (e.g., "view-only auditor"), skip the full CRUD matrix for that role — document the single permission
- If the user says "no integrations", skip Q8 entirely and record "No external integrations — confirmed [date]"
- If the user confirms no workflows/approvals, skip Q5 and record "No approval chains — confirmed [date]"
- When entities from Phase 1 business context are already described, confirm them rather than re-asking

### Questions to Ask

**User Journeys & Roles**

1. **What are the core user journeys from start to finish?**
   - Walk through each persona's typical workflow. E.g., "A warehouse manager logs in, sees dashboard, creates order..."
   - Ask for the happy path first, then edge cases

2. **What are the user roles, and what can each role do or not do?**
   - Build a permission matrix: Role × Action (Create/Read/Update/Delete)
   - Ask about role hierarchy and inheritance

**Data & Business Rules**

3. **What data does the system create, read, update, and delete?**
   - For each entity: what fields? Required vs optional? Validation rules?
   - Ask about data relationships (one-to-many, many-to-many)
   - **MongoDB-specific**: Ask about embedded vs referenced documents, indexing needs, and whether any fields need full-text search

4. **What are the business rules and validation logic?**
   - E.g., "An order cannot be submitted without at least one line item"
   - Ask about edge cases: what happens when rules conflict?

**Workflows & State**

5. **Are there workflows, approval chains, or state machines involved?**
   - Map out each state transition. E.g., Draft → Submitted → Approved → Complete
   - Who can trigger each transition? Can states be reversed?

**Communication & Integration**

6. **What notifications or communications does the system need to send?**
   - Channels: email, SMS, push, in-app
   - Triggers: what events fire notifications? To whom?

7. **Are there reporting or data export requirements?**
   - What reports? Who consumes them? What format (PDF, CSV, dashboard)?
   - Real-time vs scheduled?

8. **What integrations with external systems are needed?**
   - For each: system name, direction (inbound/outbound/bidirectional), data format, auth method
   - Who owns the external system? Is there API documentation?

**UX / UI Requirements**

9. **What are the key screens or pages the application needs?**
   - For each screen: what data is displayed? What actions can the user take?
   - Are there wireframes, mockups, or reference designs?

10. **Are there specific UX patterns or interaction requirements?**
    - Search/filtering: which entities, which fields are filterable?
    - Pagination or infinite scroll? Mobile responsiveness?
    - Drag-and-drop, inline editing, real-time updates (WebSocket)?

11. **What error handling and feedback should the user see?**
    - Form validation messages (inline vs summary?)
    - Loading states, empty states, error states
    - Confirmation dialogs for destructive actions?

### After All Questions Are Answered

Generate **five deliverables**:

#### 1. User Stories

Format each as:
```
### US-[NNN]: [Title]
**As a** [role], **I want to** [action] **so that** [benefit]

**Acceptance Criteria:**
- [ ] Given [context], when [action], then [outcome]
- [ ] Given [context], when [action], then [outcome]

**Priority:** Must Have | Should Have | Could Have | Won't Have
**Linked Stakeholder:** [from Phase 2]
```

Group stories by epic/feature area.

#### 2. Business Rules Catalogue

| Rule ID | Rule Description | Applies To | Exception Handling | Source |
|---|---|---|---|---|

#### 3. Data Dictionary (MongoDB-Oriented)

| Entity | Field | Type | Required | Constraints | Embedded/Referenced | Index? | Notes |
|---|---|---|---|---|---|---|---|

For each entity, also document:
- **Collection name** and whether it's a standalone collection or embedded subdocument
- **Common query patterns** that drive index decisions
- **Soft delete vs hard delete** strategy

#### 4. Role-Permission Matrix

| Action | Role A | Role B | Role C | ... |
|---|---|---|---|---|
| Create X | Yes | No | Yes | |
| Read X | Yes | Yes | Yes | |

#### 5. Assumptions Register

| ID | Assumption | Impact if Wrong | Owner | Status |
|---|---|---|---|---|
| A-001 | [What we assumed] | [What breaks] | [Who validates] | Open/Validated |

Log every assumption made during this phase. Assumptions are NOT answers — they are placeholders that need validation.

**Present all deliverables** to the user for review before saving.

**Save** to `docs/requirements/functional-requirements.md`

**Recommend** the user proceed to `/req-phase4-nonfunctional`

## Quality Gate

Before marking this phase complete, confirm:
- [ ] Every user persona has at least one user journey mapped
- [ ] All user stories have acceptance criteria (Given/When/Then)
- [ ] Business rules are specific and testable (no vague language)
- [ ] Data dictionary covers all entities mentioned in user stories
- [ ] Role-permission matrix is complete for all CRUD operations
- [ ] All integrations have owner and direction documented
- [ ] UX requirements are captured for key screens (Q9-Q11)
- [ ] MongoDB data modeling decisions (embedded vs referenced) are documented
- [ ] All assumptions are logged in the assumptions register
