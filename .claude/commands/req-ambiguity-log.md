# Ambiguity Log Management

You are managing the project's ambiguity log — a structured register of all unresolved questions, unclear requirements, and pending decisions discovered during requirements gathering.

## Instructions

### If `docs/requirements/ambiguity-log.md` Does NOT Exist

1. **Scan all existing requirements documents** in `docs/requirements/` for:
   - Vague or unmeasurable statements (e.g., "fast", "user-friendly", "secure")
   - References to undefined entities, roles, or systems
   - Assumptions made without stakeholder confirmation
   - Conflicting statements across documents
   - TODOs, placeholders, or "[TBD]" markers

2. **Ask the user** about any additional known ambiguities or open questions

3. **Create the ambiguity log** at `docs/requirements/ambiguity-log.md` with the structure below

### If `docs/requirements/ambiguity-log.md` Already Exists

1. **Read the existing log** and present a status summary:
   - Total items: X
   - Open: X | Resolved: X | Deferred: X | Blocked: X

2. **Ask the user** what they want to do:
   - Review and resolve open items
   - Add new ambiguities
   - Scan documents for newly introduced ambiguities
   - Export a status report

3. **For resolving items**: Walk through each open item one at a time, ask for the resolution, update the status and resolution column

## Log Structure

```markdown
# Ambiguity Log

**Last Updated:** [date]
**Status Summary:** Open: X | Resolved: X | Deferred: X | Blocked: X

## Open Items

| ID | Phase | Description | Impact (H/M/L) | Owner | Raised Date | Due Date | Status | Resolution |
|---|---|---|---|---|---|---|---|---|
| AMB-001 | Phase 3 | User story US-012 references "admin approval" but admin role not defined | H | [name] | [date] | [date] | Open | — |

## Resolved Items

| ID | Phase | Description | Impact | Owner | Raised Date | Resolved Date | Resolution |
|---|---|---|---|---|---|---|---|

## Deferred Items

| ID | Phase | Description | Impact | Owner | Raised Date | Deferred Until | Reason |
|---|---|---|---|---|---|---|---|
```

## Rules

- Every ambiguity **must** have an owner and a due date
- Items with High impact **must** be resolved before Phase 7 sign-off
- Medium impact items should be resolved; if not, they must be explicitly deferred with rationale
- Low impact items can be deferred to design/implementation phase
- Never delete items — move them between sections (Open → Resolved or Deferred)
- Each resolution must be specific enough to update the source requirement document

## Quality Gate

- [ ] Every open item has an assigned owner
- [ ] Every open item has a due date
- [ ] No High-impact items are unresolved at sign-off
- [ ] Resolutions are specific and actionable (not "will figure out later")
