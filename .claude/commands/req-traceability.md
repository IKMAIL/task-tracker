# Requirements Traceability Matrix

You are building or updating the requirements traceability matrix — a cross-phase linking document that ensures every requirement can be traced from business need to technical implementation.

## Purpose

Traceability ensures:
- Every user story links back to a business objective (nothing built without justification)
- Every NFR links to the user stories it constrains
- Every technical decision links to the requirements it serves
- Every stakeholder is connected to their requirements
- Nothing falls through the cracks between phases

## Instructions

### If `docs/requirements/traceability-matrix.md` Does NOT Exist

1. **Read all existing requirements documents** in `docs/requirements/`:
   - `business-context.md` — Extract business objectives (BO-NNN)
   - `stakeholder-register.md` — Extract stakeholders (SH-NNN)
   - `functional-requirements.md` — Extract user stories (US-NNN) and business rules (BR-NNN)
   - `nonfunctional-requirements.md` — Extract NFRs (NFR-NNN)
   - `technical-constraints.md` — Extract ADRs (ADR-NNN)
   - `scope-definition.md` — Extract MoSCoW priorities

2. **Build the traceability matrix** by asking the user to confirm linkages:
   - Which business objective does each user story serve?
   - Which user stories does each NFR constrain?
   - Which technical decision supports which requirements?

3. **Generate the document** and save to `docs/requirements/traceability-matrix.md`

### If the File Already Exists

1. Read it and identify gaps (unlinked items)
2. Ask the user if they want to update linkages or add new items
3. Update and save

## Document Structure

```markdown
# Requirements Traceability Matrix

**Last Updated:** [date]
**Coverage:** X% of user stories linked to business objectives

## Business Objective → User Story Mapping

| Business Objective | ID | User Stories | Priority |
|---|---|---|---|
| [objective text] | BO-001 | US-001, US-005, US-012 | Must Have |

## User Story → NFR Mapping

| User Story | NFRs That Apply | Impact |
|---|---|---|
| US-001 | NFR-003 (Performance), NFR-007 (Security) | API must respond < 200ms, data encrypted at rest |

## User Story → Technical Decision Mapping

| User Story | ADRs That Apply | Technology |
|---|---|---|
| US-001 | ADR-002 (REST API), ADR-005 (MongoDB) | Express + Mongoose |

## Stakeholder → Requirements Ownership

| Stakeholder | Role | Owned/Requested Requirements |
|---|---|---|
| [name] | Product Owner | BO-001, BO-002, US-001-US-010 |

## Orphan Analysis

### User Stories Without Business Objectives
(These need justification or should be removed)

### Business Objectives Without User Stories
(These need implementation stories or are aspirational)

### NFRs Without Linked User Stories
(These may be system-wide or need specific story linkage)

### ADRs Without Linked Requirements
(These may be infrastructure decisions — document rationale)
```

## Quality Gate

- [ ] Every user story links to at least one business objective
- [ ] Every Must Have business objective has at least one user story
- [ ] Every NFR links to the stories it constrains (or is marked system-wide)
- [ ] Orphan analysis has zero unexplained items
- [ ] Coverage percentage is documented
