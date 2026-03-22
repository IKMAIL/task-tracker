# Stage 5 — Stakeholder Review & Developer Handoff

You are conducting Stage 5 of the UI/UX Design phase. The goal is to **validate all designs against requirements with stakeholders**, capture change requests, and produce a **complete developer handoff package** so that implementation can begin without ambiguity.

## Pre-Requisite

Check that these documents exist and read them before starting:
- `docs/design/uiux/ia-user-flows.md` — Stage 1: sitemap, user flows, screen inventory
- `docs/design/uiux/wireframes.md` — Stage 2: low-fidelity screen specifications
- `docs/design/uiux/design-system.md` — Stage 3: tokens, typography, component inventory
- `docs/design/uiux/hifi-specifications.md` — Stage 4: full-fidelity screen specs with states
- `docs/requirements/functional-requirements.md` — user stories, acceptance criteria, business rules
- `docs/requirements/scope-definition.md` — MVP scope, MoSCoW backlog
- `docs/design/api-contracts.md` — API endpoints and response shapes

If any Stage 1–4 output is missing, inform the user that the missing stage must be completed first — the handoff package requires all prior stages. If requirements or design docs are missing, log gaps to `docs/design/uiux/ambiguity-log.md` and allow the user to proceed.

## Instructions

Walk through each section **one at a time**. Present findings and recommendations to the user and wait for confirmation before moving on.

### Partial Save & Resume

- After completing each section, auto-save progress to `docs/design/uiux/handoff.draft.md` with a `## Progress` section listing completed and remaining sections
- Support "pause", "stop", "save and continue later" — save immediately and note the next section
- On resume: read the draft, summarise what's done, continue from the next section

### Handling Incomplete Answers

- "I don't know" → log to `docs/design/uiux/ambiguity-log.md` with status **Open**, use a reasonable default marked `[assumed]`, continue
- Quality gate items that can't be checked → mark **Deferred** with the ambiguity log item ID

### Behavioral Guardrails

- Do not invent new screens, components, or requirements — only document what was designed in Stages 1–4
- Do not re-design elements — if the user requests changes, log them as change requests (Section 2)
- Reference specific user stories (US-NNN) and business rules (BR-NNN) when verifying acceptance criteria
- Tag any inferred details with `[assumed]`
- Cross-reference the API contracts for every endpoint mapping — do not guess endpoint paths

### Contradiction Detection

- If a hi-fi spec conflicts with a user story's acceptance criteria, flag it: "Hi-fi spec for [Screen] shows [X] but US-NNN acceptance criterion says [Y]. Which is correct?"
- If a component-to-code mapping references a component not in the design system, flag it before proceeding
- If an API endpoint referenced in the handoff doesn't exist in `api-contracts.md`, flag it

---

## Section 1: Stakeholder Walkthrough

For each **Must-Have** user story from `docs/requirements/scope-definition.md`:

1. **Locate the user flow** (Stage 1) — identify which flow covers this story
2. **Walk through the hi-fi spec** (Stage 4) — verify every acceptance criterion is visually represented
3. **Build a traceability entry** in this format:

```markdown
| US-NNN | Story Title | Flow(s) | Screen(s) | Component(s) | API Endpoint(s) | AC Coverage |
|--------|-------------|---------|-----------|---------------|-----------------|-------------|
| US-001 | [title] | [flow ref] | [screen names] | [components used] | [endpoints] | Full / Partial / Missing |
```

4. **Flag gaps** — if any acceptance criterion is not covered by the design:
   - Document what's missing
   - Ask the user: resolve now (add to change request log) or defer (log to ambiguity log)

Present the complete **Traceability Matrix** to the user for review.

**After Should-Have stories:** repeat the same process but mark gaps as non-blocking.

---

## Section 2: Change Request Log

Capture all feedback from the stakeholder walkthrough as structured change requests:

```markdown
| CR-ID | Screen | Description | Priority | Impact on Stage(s) | Status |
|-------|--------|-------------|----------|-------------------|--------|
| CR-001 | [screen] | [what needs to change] | Must/Should/Could/Won't | Stage 2,4 | Open / Resolved / Deferred |
```

**Rules:**
- **Must-Have CRs block sign-off** — these must be resolved before the phase gate
- **Should/Could/Won't CRs** are logged for future sprints — they do not block sign-off
- For each resolved CR: note which stage output was updated (e.g., "Updated wireframe in Section X, hi-fi spec in Section Y")
- For each deferred CR: log to `docs/design/uiux/ambiguity-log.md`

Present the CR log to the user. Ask: "Are all Must-Have change requests resolved?"

---

## Section 3: Developer Handoff Package

For each screen in the screen inventory (from Stage 1), produce a **handoff summary card**:

```markdown
### [Screen Name] — Developer Handoff

**Route:** [URL path from Stage 1]
**Page Component:** [React component name — existing file path or "New: needs implementation"]
**User Stories:** [US-NNN references]
**Layout:** [Desktop/Tablet/Mobile layout summary from Stage 4]

#### Components Required

| Design System Component | Existing Code | Status | Notes |
|------------------------|---------------|--------|-------|
| PageHeader | `components/common/PageHeader.tsx` | Exists | — |
| DataTable | — | New | Needs implementation per DS spec |
| StatusBadge | `components/common/StatusBadge.tsx` | Exists | Add "overdue" variant |

#### API Endpoints

| Endpoint | Method | Purpose | Response Shape |
|----------|--------|---------|---------------|
| `/api/tasks` | GET | Fetch task list | `Task[]` from api-contracts |
| `/api/tasks/:id` | PUT | Update task | `Task` from api-contracts |

#### State Management

- **Reads:** [what state/context this screen reads — e.g., AuthContext for user role, TaskContext for task list]
- **Writes:** [what state this screen modifies — e.g., creates new task, updates progress]
- **Side effects:** [API calls, redirects, toast notifications]

#### Interaction Notes

| Element | Behavior | Timing |
|---------|----------|--------|
| [element] | [exact interaction — e.g., "debounce search input"] | [e.g., 300ms] |
| [element] | [e.g., "optimistic update on status change, rollback on API error"] | — |
| [element] | [e.g., "confirm dialog before delete"] | — |
```

After all screen cards are complete, generate a **Component Implementation Status** summary:

```markdown
| Component | In Design System | Exists in Code | File Path | Action Needed |
|-----------|-----------------|----------------|-----------|---------------|
| Button | ✓ | ✓ | `components/common/Button.tsx` | None |
| DataTable | ✓ | ✗ | — | New implementation |
| StatusBadge | ✓ | ✓ | `components/common/StatusBadge.tsx` | Add variants |
```

And an **Asset Inventory**:

```markdown
| Asset Type | Name | Source | Used On |
|-----------|------|--------|---------|
| Icon | [name] | [icon set from Stage 3] | [screen names] |
| Image | [name] | [source/generation needed] | [screen names] |
| Font | [name] | [CDN/self-hosted] | Global |
```

---

## Section 4: Accessibility Annotations

For each screen, document:

```markdown
### [Screen Name] — Accessibility

#### ARIA Roles & Labels

| Element | ARIA Role | ARIA Label / Labelled-by | Notes |
|---------|-----------|-------------------------|-------|
| Main content | `main` | — | Landmark |
| Navigation | `navigation` | "Main navigation" | Landmark |
| [form] | `form` | [aria-label] | — |
| [dialog] | `dialog` | [aria-labelledby="title-id"] | Modal |
| [status message] | `status` | — | Live region, `aria-live="polite"` |

#### Focus Order (Tab Sequence)

1. [First focusable element] — [what it is]
2. [Second focusable element] — [what it is]
3. ...
n. [Last focusable element] — [what it is]

#### Keyboard Navigation

| Key | Action | Context |
|-----|--------|---------|
| Tab | Move to next focusable element | Global |
| Shift+Tab | Move to previous focusable element | Global |
| Enter/Space | Activate button / submit form | Button/Link focus |
| Escape | Close modal / cancel action | Modal/Dropdown open |
| Arrow Up/Down | Navigate list items | List/Dropdown |

#### Screen Reader Flow

1. Page title announced: "[exact text]"
2. Skip navigation link available
3. Main landmark: [content summary]
4. [Dynamic content]: `aria-live` region announces "[text]" on [trigger]

#### Contrast Verification

| Foreground Token | Background Token | Ratio | WCAG AA |
|-----------------|-----------------|-------|---------|
| `color/text-primary` | `color/surface-primary` | [X.X:1] | Pass/Fail |
| `color/text-muted` | `color/surface-primary` | [X.X:1] | Pass/Fail |
```

After all screens, produce an **Accessibility Summary**:

```markdown
| Screen | Landmarks | Focus Order | Keyboard Nav | Screen Reader | Contrast | Status |
|--------|-----------|-------------|--------------|---------------|----------|--------|
| Login | ✓ | ✓ | ✓ | ✓ | ✓ | Complete |
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | Complete |
```

---

## Section 5: Implementation Priority

Order screens by dependency for development:

```markdown
| Priority | Screen(s) | Rationale | Dependencies | Sprint Suggestion |
|----------|-----------|-----------|--------------|-------------------|
| 1 | Login, Registration | Auth required for all other screens | None | Sprint 1 |
| 2 | Dashboard | Landing page after login | Auth complete | Sprint 1 |
| 3 | [next screens] | [why this order] | [what must exist first] | Sprint N |
```

**Ordering rules:**
1. Authentication screens first (all other screens depend on auth)
2. Core entity CRUD screens next (tasks, teams — the primary value)
3. Supporting screens after (alerts, progress, admin)
4. Settings and profile screens last

Map to the sprint backlog from `docs/requirements/scope-definition.md` if available.

Present the implementation priority to the user for review.

---

## After All Sections Are Complete

Generate the **final handoff document** combining all five sections:

1. **Traceability Matrix** (Section 1)
2. **Change Request Log** (Section 2)
3. **Developer Handoff Cards** — all screens (Section 3)
4. **Component Implementation Status** (Section 3)
5. **Asset Inventory** (Section 3)
6. **Accessibility Annotations** — all screens (Section 4)
7. **Accessibility Summary** (Section 4)
8. **Implementation Priority** (Section 5)

**Present** the complete document to the user for review before saving.

**Save** to `docs/design/uiux/handoff.md`

**Delete** the draft file `docs/design/uiux/handoff.draft.md` if it exists.

**Recommend** proceeding to `/uiux-review` for the phase gate validation.

## Quality Gate

Before marking this stage complete, confirm:

- [ ] Every Must-Have user story has been verified against its acceptance criteria in the traceability matrix
- [ ] All Must-Have change requests are resolved (status: Resolved)
- [ ] Developer handoff card exists for every screen in the screen inventory
- [ ] Component-to-code mapping is complete — every design system component has an implementation status
- [ ] API endpoint mapping references valid endpoints from `api-contracts.md`
- [ ] Accessibility annotations exist for every screen (ARIA roles, focus order, keyboard nav, screen reader flow)
- [ ] Contrast verification completed for all foreground/background token combinations
- [ ] Asset inventory is complete (icons, images, fonts identified with sources)
- [ ] Implementation priority order is documented and reviewed
- [ ] No `[assumed]` tags remain unconfirmed by the user (or logged to ambiguity log)
- [ ] Should-Have story traceability is documented (gaps logged as non-blocking)
- [ ] All interaction notes specify exact behavior and timing (no vague descriptions)
