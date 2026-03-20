# Phase 3 — Functional Requirements Elicitation

You are conducting Phase 3 of the requirements gathering process. The goal is to define **what the system must do**.

## Pre-Requisite

Check that `docs/requirements/business-context.md` and `docs/requirements/stakeholder-register.md` exist. Reference the user personas and stakeholder roles from those documents to inform this phase. If missing, inform the user but allow them to proceed.

## Instructions

This is the most intensive phase. Ask questions **one at a time**, grouping follow-ups logically. Use the user personas from Phase 1 to frame questions around specific roles.

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

### After All Questions Are Answered

Generate **four deliverables**:

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

#### 3. Data Dictionary

| Entity | Field | Type | Required | Constraints | Relationships | Notes |
|---|---|---|---|---|---|---|

#### 4. Role-Permission Matrix

| Action | Role A | Role B | Role C | ... |
|---|---|---|---|---|
| Create X | Yes | No | Yes | |
| Read X | Yes | Yes | Yes | |

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
