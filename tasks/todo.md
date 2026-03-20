# Requirements Gathering Skills - Implementation Plan

## Task
Create Claude Code slash commands (skills) for a 7-phase requirements gathering process, plus an orchestrator and supplementary skills.

## Skills to Create (in `.claude/commands/`)

- [x] `req-check.md` — Pre-check: scan for existing requirements docs before starting
- [x] `req-phase1-business.md` — Phase 1: Business Context (interactive Q&A → problem statement + KPIs)
- [x] `req-phase2-stakeholders.md` — Phase 2: Stakeholders (interactive Q&A → stakeholder register + RACI)
- [x] `req-phase3-functional.md` — Phase 3: Functional Requirements (interactive → user stories + business rules + data dictionary)
- [x] `req-phase4-nonfunctional.md` — Phase 4: Non-Functional Requirements (interactive → NFR spec + security checklist)
- [x] `req-phase5-technical.md` — Phase 5: Technical Clarifications MERN-specific (interactive → constraints doc + ADR stubs + deps list)
- [x] `req-phase6-scope.md` — Phase 6: Scope Definition & Prioritisation (interactive → MVP def + prioritised backlog + out-of-scope register)
- [x] `req-phase7-validation.md` — Phase 7: Validation & Sign-Off (interactive → checklist + gap analysis)
- [x] `req-ambiguity-log.md` — Ambiguity Log: structured template for tracking open questions
- [x] `req-traceability.md` — Traceability Matrix: cross-phase linking (stakeholders → stories → NFRs → tech decisions)
- [x] `req-change-management.md` — Change Management: post-sign-off scope change process
- [x] `requirements.md` — Master Orchestrator: runs all phases sequentially

## Other
- [x] Create `docs/requirements/` directory with a README
- [x] Update CLAUDE.md to reference the new skills
- [ ] Git: commit and push to `claude/mern-requirements-skills-CyVY5`

---

# Checklist Feature – Implementation Plan

## Branch
`claude/plan-tracking-progress-FE6aI`

## Feature Summary
Add **checklists** to tasks: lightweight to-do items (with optional sub-items and assignees) embedded in the Task document. Parent task `completionPct` is auto-computed from checklist completion. Drag & drop reordering supported via the existing `@hello-pangea/dnd` library.

## Scope (confirmed by user)
- Embedded checklists per task (multiple checklists per task, each with a title)
- Checklist items: text, checkbox, optional `assignedPersonId`, `order`
- Sub-items: one level of nesting (children of a top-level item — no deeper)
- `completionPct` on Task auto-computed from all checked items / total items across all checklists
- Drag & drop reorder of top-level items (and sub-items) within a checklist
- NO separate Task documents created for checklist items

## Open Questions / Decisions Made
1. **Progress-sync conflict**: When a task has checklists, the manual `completionPct` from `POST /progress` (progress-service) should NOT override checklist-computed pct. The `progress-sync` endpoint in task-service will skip updating `completionPct` if the task has ≥1 checklist item. Status, nextUpdateDate, etc. still sync normally.
2. **Auto-complete task**: Checking all items does NOT automatically set task status to `completed` — completionPct hits 100% but status stays manual.
3. **Nesting depth**: Exactly 2 levels (items → children). Sub-items have no further children.
4. **Assignee pool**: Only team members (from `assignedTeamId`) are selectable as item assignees.
5. **Audit**: Checklist mutations flow through the existing Mongoose audit plugin on Task (records as "task updated"). No separate audit needed.

## Files to Create
- `services/task-service/src/services/checklistService.ts`
- `services/task-service/src/controllers/checklistController.ts`
- `apps/web-frontend/src/api/checklistApi.ts`
- `apps/web-frontend/src/components/common/ChecklistSection.tsx`

## Files to Modify
- `services/task-service/src/models/Task.ts` — add `IChecklistItem`, `IChecklist`, schemas, `checklists` field
- `services/task-service/src/repositories/taskRepository.ts` — add checklist-aware helper
- `services/task-service/src/routes/taskRoutes.ts` — add checklist endpoints
- `services/task-service/src/services/taskService.ts` — skip `completionPct` sync when checklists exist
- `apps/web-frontend/src/api/taskApi.ts` — add Checklist/ChecklistItem types
- `apps/web-frontend/src/pages/TaskDetailPage.tsx` — render `<ChecklistSection>`

## API Endpoints (all under task-service, auth: JWT)
```
POST   /tasks/:id/checklists                            — create checklist {title}
PATCH  /tasks/:id/checklists/:clId                      — rename checklist {title}
DELETE /tasks/:id/checklists/:clId                      — delete checklist + all items
POST   /tasks/:id/checklists/:clId/items                — add item {text, assignedPersonId?, parentItemId?}
PATCH  /tasks/:id/checklists/:clId/items/:itemId        — update item {text?, completed?, assignedPersonId?}
DELETE /tasks/:id/checklists/:clId/items/:itemId        — delete item (and its children)
PUT    /tasks/:id/checklists/:clId/reorder              — reorder top-level items {orderedIds: string[]}
PUT    /tasks/:id/checklists/:clId/items/:itemId/reorder — reorder sub-items {orderedIds: string[]}
```
GET `/tasks/:id` already returns embedded checklists — no new GET needed.

## Progress Roll-up Logic
```
totalItems = sum of all items + all sub-items across all checklists
completedItems = count of those with completed=true
completionPct = totalItems > 0 ? Math.round((completedItems/totalItems)*100) : existing value
```

## Todo Checklist

### Backend
- [x] **1. Task model** — Add `IChecklistItem`, `IChecklist` interfaces + Mongoose schemas + `checklists` field to `ITask`/`TaskSchema`
- [x] **2. Checklist service** — Create `checklistService.ts` with all CRUD operations + `computeCompletionPct` helper
- [x] **3. Checklist controller** — Create `checklistController.ts` wrapping service calls
- [x] **4. Routes** — Add 8 checklist endpoints to `taskRoutes.ts`
- [x] **5. Progress-sync fix** — In `taskService.ts` `syncProgress()`, skip writing `completionPct` when task has checklist items

### Frontend
- [x] **6. Types** — Add `ChecklistItem` and `Checklist` interfaces to `taskApi.ts`; update `Task` interface
- [x] **7. Checklist API** — Create `checklistApi.ts` with fetch wrappers for all 8 endpoints
- [x] **8. ChecklistSection component** — Create component with:
  - List of checklists, each collapsible, showing "X / Y" progress count
  - Items: drag handle (DnD), checkbox, inline-editable text, assignee picker, delete button
  - Sub-items: indented below parent, same structure (no drag handle, or inner DnD)
  - "Add item" input, "Add checklist" button
  - Uses `@hello-pangea/dnd` for reordering
- [x] **9. TaskDetailPage integration** — Import `ChecklistSection`, render it below the Details card; refetch task on any checklist mutation (to update displayed `completionPct`)

### Git
- [x] **10. Commit & push** — Commit all changes on `claude/plan-tracking-progress-FE6aI` and push

## Review
All 10 implementation items completed and pushed on `claude/plan-tracking-progress-FE6aI`.

### What was built
- **Backend**: `IChecklist`/`IChecklistItem` schemas on Task model; `checklistService.ts` (CRUD + progress roll-up); `checklistController.ts`; 8 JWT-protected endpoints in `taskRoutes.ts`; `syncProgress()` skips `completionPct` when checklists exist.
- **Frontend**: `Checklist`/`ChecklistItem` types in `taskApi.ts`; `checklistApi.ts` fetch wrappers; `ChecklistSection.tsx` (collapsible, DnD reorder, inline edit, assignee picker, sub-items); integrated into `TaskDetailPage.tsx`.

### Gaps identified (post-review)
1. No error handling in `ChecklistSection` UI mutations
2. No tests for `computeCompletionPct` or the checklist endpoints
3. `syncProgress` fragility — `{ ...data, completionPct: undefined }` relies on Mongoose stripping `undefined`
4. `tasks/todo.md` items never checked off and review section empty
5. `MistakeJournal.md` not created (required by LEARNING.md)

---

# Gap-Fix Plan

## Branch
`claude/plan-tracking-progress-FE6aI` (same branch — these are corrections to the same feature)

## Todo Checklist

### Process / Housekeeping
- [x] **A. Mark prior todo items done** — update items 1-10 above to `[x]`
- [x] **B. Create `MistakeJournal.md`** — root-level file, populate with mistakes found in review

### Backend
- [x] **C. Fix `syncProgress` fragility** — use explicit destructuring in `taskService.ts` to exclude `completionPct` instead of spreading `undefined`
- [x] **D. Unit tests for `computeCompletionPct`** — add `tests/checklist.test.ts` covering: empty checklists → null, all complete → 100, mixed items + sub-items → correct %, single item

### Frontend
- [x] **E. Error handling in `ChecklistSection`** — wrap every API call in `try/catch`; add `error` state per `ChecklistCard`; display inline error message on failure; clear on next attempt

### Git
- [ ] **F. Commit & push** — single commit on `claude/plan-tracking-progress-FE6aI`

## Decisions
- `order` field left as-is (dead but harmless; removing it is a schema migration risk with no user-facing benefit)
- Repository pattern bypass left as-is (functional, minimal-change principle)



## Previous Review

### Summary
Created 12 Claude Code slash commands for structured requirements gathering:
- **7 phase skills** (business context, stakeholders, functional, NFR, technical, scope, validation)
- **4 supplementary skills** (pre-check, ambiguity log, traceability matrix, change management)
- **1 orchestrator** (`/requirements`) that runs all phases sequentially

### Additions beyond original spec
- `/req-check` — Pre-flight scan for existing docs to avoid duplication
- `/req-ambiguity-log` — Structured tracker with owner/due date/impact for open questions
- `/req-traceability` — Cross-phase linking with orphan analysis
- `/req-change-management` — Post-sign-off change request process with impact assessment

### All skills are interactive (Q&A), generate deliverables to `docs/requirements/`, and include quality gates.
