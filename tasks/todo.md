# Global CSS Redesign — Tactical Theme

## Branch
`claude/revalidate-ui-ux-I8I3r`

## Plan

- [x] **1. Typography** — Import Raleway (heading) + Mulish (body) from Google Fonts
- [x] **2. Color palette** — Replace all tokens with Tactical palette (charcoal bg, orange accent, teal secondary)
- [x] **3. Dark theme** — Update `[data-theme="dark"]` to match Tactical dark colors
- [x] **4. Atmospheric backgrounds** — body dot grid, header glass morphism, login gradient, stat-card hover gradient
- [x] **5. Keyframe animations** — page-fade-in, card-lift, btn-press; staggered stat-card delays
- [x] **6. Component refinements** — header 64px, btn-primary gradient, login-card elevated, kanban left border, table header, focus glow
- [x] **7. Commit & push**

## Review

### Summary
Full global CSS overhaul implementing the Tactical theme:
- **Fonts**: Raleway (headings, display) + Mulish (body) imported from Google Fonts
- **Palette**: Deep charcoal (#0D1117 dark bg), electric orange (#F97316) primary, teal (#0D9488) secondary; light theme uses warm off-white (#F5F4F0)
- **Backgrounds**: Dot-grid pattern on body (SVG data URI), glass morphism on header, multi-layer gradient on login page, hover gradients on cards
- **Animations**: page-fade-in, card-lift keyframes, btn-press scale, staggered stat-card entry delays (nth-child 1–6)
- **Components**: header at 64px with glass effect, btn-primary gradient, login-card wider + elevated, kanban columns with colored left border per status, table header with orange accent underline, focus glow in teal

---

# System Design & Architecture Phase — Skills Implementation Plan

## Context
Create Claude Code slash commands for the System Design & Architecture Phase (MERN + TypeScript), following patterns from the requirements gathering skills. Then create a master workflow command orchestrating requirements → design.

## Skills to Create (in `.claude/commands/`)

### Pre-check
- [ ] `design-check.md` — Scan for existing design/architecture docs

### Workstream Skills (from user spec)
- [ ] `design-hld.md` — WS1: High-Level Design (arch diagram, communication patterns, auth strategy, state mgmt, SSR/SPA)
- [ ] `design-data-model.md` — WS2: Data Modelling (MongoDB schemas, TypeScript interfaces, embed/ref, indexes)
- [ ] `design-api-contracts.md` — WS3: API Contract Design (OpenAPI spec, shared types, error codes, conventions)
- [ ] `design-folder-structure.md` — WS4: Folder Structure & Code Architecture (layers, separation of concerns)
- [ ] `design-adrs.md` — WS5: Architecture Decision Records (numbered ADR docs)

### Additional Skills (proposed gaps)
- [ ] `design-security.md` — Security Architecture (auth flow diagrams, CORS, CSP, rate limiting, secrets)
- [ ] `design-review.md` — Design Validation & Phase Gate (mirrors req-phase7)

### Orchestrators
- [ ] `design.md` — Master design orchestrator
- [ ] `workflow.md` — Master workflow: requirements → design

### Updates
- [ ] Update CLAUDE.md with new skill table
- [ ] Git: commit and push

## Questions / Gaps to Discuss with User
Resolved — user confirmed: add all three extra skills, full SDLC skeleton, strict sequential workstream order.

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
Created 10 Claude Code slash commands for the System Design & Architecture phase, plus a master SDLC workflow:

**Pre-check:** `/design-check`

**Workstream skills (strict sequential):**
1. `/design-hld` — High-Level Design (10 architecture decisions, component catalogue, integration map)
2. `/design-data-model` — MongoDB schemas, TypeScript interfaces, ER diagram, index strategy
3. `/design-api-contracts` — REST conventions, OpenAPI spec, shared types, error codes
4. `/design-security` — Auth flows, RBAC, CORS, CSP, rate limiting, secrets (10 security domains)
5. `/design-folder-structure` — Annotated project layout for mono/micro/SSR patterns, naming conventions
6. `/design-adrs` — 8 mandatory ADRs + project-specific, filed in `docs/adr/`

**Validation:** `/design-review` — consistency checks, gap analysis, phase gate, sign-off

**Orchestrators:**
- `/design` — Runs all 8 steps sequentially with dependency enforcement
- `/workflow` — Full 7-step SDLC status tracker (Steps 1-2 available, 3-7 planned)

### Additions beyond original spec
- `/design-security` — dedicated workstream (security was spread across HLD in the original spec)
- `/design-review` — formal validation gate (mirrors `/req-phase7-validation`)
- `/design-check` — pre-flight scan for existing design docs
- Strict workstream dependency graph documented in `/design` orchestrator
- Full 7-step `/workflow` orchestrator linking requirements → design → UI/UX → setup → dev → QA → deployment

### All skills include: guardrails, partial save/resume, contradiction detection, quality gates, cross-workstream traceability.
