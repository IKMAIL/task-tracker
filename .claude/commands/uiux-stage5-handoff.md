# Stage 5 — Stakeholder Review & Developer Handoff

You are conducting Stage 5 of the UI/UX Design phase. The goal is to **validate all designs against requirements with stakeholders**, capture change requests, and produce a **complete developer handoff package** so that any developer can build the interface without making significant design decisions.

## Pre-Requisite

Check that these documents exist and read them before starting:
- `docs/design/uiux/ia-user-flows.md` — sitemap, user flows, screen inventory (from Stage 1)
- `docs/design/uiux/wireframes.md` — low-fidelity screen specifications (from Stage 2)
- `docs/design/uiux/design-system.md` — tokens, component inventory, library decision (from Stage 3)
- `docs/design/uiux/hifi-specifications.md` — full-fidelity screen specs with all states (from Stage 4)
- `docs/requirements/functional-requirements.md` — user stories, acceptance criteria, business rules
- `docs/requirements/scope-definition.md` — MVP scope, MoSCoW backlog
- `docs/design/api-contracts.md` — endpoints, response shapes, error codes

If any Stage 1-4 output is missing, inform the user that the preceding stages must be completed first. If requirements or design documents are missing, log gaps to `docs/design/uiux/design-ambiguity-log.md` and allow the user to proceed with documented limitations.

## Instructions

Work through each section **sequentially**, presenting results to the user for review and confirmation before moving to the next section.

### Partial Save & Resume

- After completing each of the 5 sections below, auto-save progress to `docs/design/uiux/handoff.draft.md` with a `## Progress` section listing completed and remaining sections
- Support "pause", "stop", "save and continue later" — save immediately and note the next section
- On resume: read the draft, summarise which sections are done, continue from the next section

### Handling Incomplete Answers

- "I don't know" → log to `docs/requirements/ambiguity-log.md` with status **Open**, use a reasonable default marked `[assumed]`, continue
- Quality gate items that can't be checked → mark **Deferred** with the ambiguity log item ID

### Behavioral Guardrails

- Do not invent new screens, flows, or components not documented in Stages 1-4 — this stage validates and packages what already exists
- Do not redesign or second-guess confirmed Stage 4 specifications — carry them forward exactly
- Reference specific user stories (US-NNN) and business rules (BR-NNN) when verifying acceptance criteria
- If a gap is found between the design and requirements, log it as a change request — do not silently fix it
- Tag any inferred details with `[assumed]`

### Contradiction Detection

- If a hi-fi spec contradicts a user story's acceptance criteria, flag it: "US-NNN acceptance criterion [X] is not fully addressed by the [Screen] specification. Should we add a change request?"
- If a component mapping references a component not in the design system, flag it before proceeding
- If an API endpoint referenced in the handoff doesn't exist in `api-contracts.md`, flag it explicitly

---

## Section 1: Stakeholder Walkthrough

For each **Must-Have** user story from the requirements:

1. **Identify the user flow** from Stage 1 that covers this story
2. **Walk through the hi-fi screens** from Stage 4 that implement the flow
3. **Verify each acceptance criterion** against the screen specifications:

```markdown
### US-NNN: [Story Title]

**User Flow Reference:** [flow name from ia-user-flows.md]
**Screens Involved:** [list of screens from hifi-specifications.md]

| Acceptance Criterion | Screen | Element / Component | Status |
|----------------------|--------|---------------------|--------|
| [AC text from requirements] | [Screen name] | [Specific element that satisfies it] | ✅ Met / ⚠️ Partial / ❌ Not Met |

**Notes:** [Any observations, partial coverage details, or concerns]
```

4. **Build the traceability matrix** connecting requirements → flows → screens → components → API endpoints:

```markdown
| User Story | Flow (Stage 1) | Screen(s) (Stage 4) | Components (Stage 3) | API Endpoint(s) |
|------------|----------------|----------------------|----------------------|-----------------|
| US-NNN | [flow name] | [screen names] | [components used] | [endpoints called] |
```

5. **Present the walkthrough results** to the user and ask: "Are there any changes needed based on this review?"

---

## Section 2: Change Request Log

Capture all feedback from the stakeholder walkthrough as structured change requests:

```markdown
## Change Request Log

| CR-ID | Screen | Description | Priority | Impact | Status |
|-------|--------|-------------|----------|--------|--------|
| CR-001 | [Screen name] | [What needs to change] | Must / Should / Could / Won't | [Affected stages: Stage 2/3/4] | Open / Approved / Deferred / Rejected |
```

**Rules:**
- **Must-Have CRs** block sign-off — these must be resolved before proceeding to development
- **Should/Could CRs** are logged for future sprints — they do not block sign-off
- **Won't CRs** are documented as explicitly out of scope with rationale

For each **Must-Have CR**:
1. Identify which stage output needs to change (wireframe, design system, hi-fi spec)
2. Describe the specific change needed
3. Ask the user whether to apply the change now or defer to a future iteration
4. If applying now, note which documents need to be updated and flag them for re-review

---

## Section 3: Developer Handoff Package

For each screen in the hi-fi specifications, produce a developer-ready summary card:

```markdown
### [Screen Name] — Developer Card

**Route:** [URL path from ia-user-flows.md]
**Page Component:** [React component file — existing path or "NEW: suggested path"]
**User Stories:** [US-NNN references]

#### Components Required

| Design System Component | Existing Code | Status | Notes |
|------------------------|---------------|--------|-------|
| [Component name from Stage 3] | [file path in apps/web-frontend/src/] | ✅ Exists / 🆕 New / 🔄 Modify | [What to change if Modify] |

#### API Integration

| Action | Method | Endpoint | Request Body | Response Shape | Error Handling |
|--------|--------|----------|-------------|----------------|----------------|
| [user action] | GET/POST/PUT/DELETE | [from api-contracts.md] | [key fields] | [key response fields] | [error states from hi-fi spec] |

#### State Management

| State | Source | Scope | Notes |
|-------|--------|-------|-------|
| [state name] | [API / local / context / URL params] | [page / global / shared] | [initialization, persistence] |

#### Assets Required

| Asset Type | Name / Description | Source | Format |
|------------|-------------------|--------|--------|
| Icon | [icon name] | [icon set from Stage 3] | SVG / Component |
| Image | [description] | [source — stock, custom, generated] | [format, dimensions] |

#### Interaction Notes

| Element | Interaction | Behavior |
|---------|-------------|----------|
| [element name] | [click / hover / focus / drag] | [exact behavior — debounce timing, optimistic updates, transitions, error recovery] |
```

After all screen cards, produce a **Component Implementation Summary**:

```markdown
## Component Implementation Summary

### New Components to Build

| Component | Design System Ref | Used On Screens | Priority |
|-----------|-------------------|-----------------|----------|
| [name] | [DS section ref] | [screen list] | Must / Should |

### Existing Components to Modify

| Component | File Path | Modification Needed | Used On Screens |
|-----------|-----------|---------------------|-----------------|
| [name] | [path] | [what to change] | [screen list] |

### Components Ready As-Is

| Component | File Path | Used On Screens |
|-----------|-----------|-----------------|
| [name] | [path] | [screen list] |
```

---

## Section 4: Accessibility Annotations

For each screen, produce accessibility implementation notes:

```markdown
### [Screen Name] — Accessibility

#### ARIA Roles & Labels

| Element | Role | aria-label / aria-labelledby | aria-describedby | Live Region |
|---------|------|------------------------------|------------------|-------------|
| [element] | [role] | [label text or ID ref] | [description ID ref] | [polite / assertive / off] |

#### Focus Order (Tab Sequence)

1. [First focusable element] — [component, expected behavior on Enter/Space]
2. [Second focusable element] — [component, expected behavior]
3. ...
n. [Last focusable element before focus wraps or moves to next section]

**Focus traps:** [List any modals, dialogs, or popovers that trap focus — describe entry/exit behavior]
**Skip navigation:** [Describe skip-to-main-content link behavior]

#### Keyboard Navigation

| Key | Context | Action |
|-----|---------|--------|
| Tab | Page | Move to next focusable element |
| Shift+Tab | Page | Move to previous focusable element |
| Enter | Button / Link | Activate |
| Space | Checkbox / Toggle | Toggle state |
| Escape | Modal / Dropdown | Close and return focus to trigger |
| Arrow keys | [context — menu, table, tabs] | [navigation behavior] |

#### Screen Reader Flow

Describe the experience for a screen reader user navigating this page:
1. [Page landmark announcements — main, nav, aside, footer]
2. [Heading hierarchy — h1 → h2 → h3 with expected text]
3. [Dynamic content announcements — what is announced when data loads, when actions succeed/fail]
4. [Form field announcements — label, required status, current value, error messages]

#### Contrast Verification

| Foreground Token | Background Token | Ratio | WCAG AA | WCAG AAA |
|-----------------|-----------------|-------|---------|----------|
| [text token] | [bg token] | [computed ratio] | ✅/❌ | ✅/❌ |
```

---

## Section 5: Implementation Priority

Order screens by dependency and complexity for sprint planning:

```markdown
## Implementation Priority

### Phase 1: Foundation (Sprint 1)
| Priority | Screen | Dependencies | Complexity | Notes |
|----------|--------|-------------|------------|-------|
| 1 | Login | None — entry point | Medium | Auth flow must work before any other screen |
| 2 | App Layout (Header, Sidebar, Footer) | Login | Medium | Shared shell for all authenticated pages |

### Phase 2: Core Features (Sprint 2-3)
| Priority | Screen | Dependencies | Complexity | Notes |
|----------|--------|-------------|------------|-------|
| ... | ... | ... | ... | ... |

### Phase 3: Secondary Features (Sprint 4+)
| Priority | Screen | Dependencies | Complexity | Notes |
|----------|--------|-------------|------------|-------|
| ... | ... | ... | ... | ... |

### Shared Components to Build First
| Component | Used By (Screen Count) | Build In |
|-----------|----------------------|----------|
| [most-used component] | [count] screens | Sprint 1 |
```

**Present the implementation priority** to the user and confirm the ordering makes sense for their team's capacity and sprint cadence.

---

## After All Sections Are Complete

Generate the final deliverable combining all five sections.

**Present to the user** for final review before saving.

**Save** to `docs/design/uiux/handoff.md`

Delete the draft file `docs/design/uiux/handoff.draft.md` if it exists.

**Recommend** proceeding to `/uiux-review` for the final phase gate validation.

## Quality Gate

Before marking this stage complete, confirm:
- [ ] Every Must-Have user story has been walked through against the hi-fi specifications
- [ ] Traceability matrix links every Must-Have story → flow → screen → components → API endpoints
- [ ] All Must-Have change requests are resolved (approved, applied, or explicitly deferred with rationale)
- [ ] Developer handoff card exists for every screen in the hi-fi specifications
- [ ] Component-to-code mapping is complete — every design system component mapped to existing code or marked as "new"
- [ ] API integration table for every screen references valid endpoints from `api-contracts.md`
- [ ] Accessibility annotations exist for every screen (ARIA roles, focus order, keyboard nav, screen reader flow)
- [ ] Contrast ratios verified for all text/background token combinations
- [ ] Implementation priority is documented with sprint mapping
- [ ] All Should-Have change requests are logged (may remain open — non-blocking)
- [ ] Asset list is complete — all icons, images, and fonts identified with sources
