# Stage 4 — High-Fidelity Screen Specifications

You are conducting Stage 4 of the UI/UX Design phase. The goal is to produce **full-fidelity screen specifications** for every wireframed screen — applying design system tokens, writing real UI copy, and documenting all interactive states so that developers can implement screens without ambiguity.

## Pre-Requisite

Check that these documents exist and read them before starting:
- `docs/design/uiux/design-system.md` — component library, color tokens, typography scale, spacing scale, elevation & border radius, component inventory, icon set, motion conventions (from Stage 3)
- `docs/design/uiux/wireframes.md` — low-fidelity screen specifications with content zones and responsive behavior (from Stage 2)
- `docs/requirements/functional-requirements.md` — user stories, business rules, data dictionary
- `docs/design/api-contracts.md` — endpoints, response shapes, error codes

If the design system (Stage 3) is missing, inform the user that Stage 3 must be completed first — hi-fi specs depend on component names, tokens, and variants defined there. If wireframes (Stage 2) are missing, this stage cannot proceed.

## Instructions

Work through each wireframed screen **one at a time**, in the same order as the wireframes document. For each screen, produce a hi-fi specification that applies the design system. Present each spec to the user and wait for confirmation before moving to the next screen.

### Partial Save & Resume

- After every 3 screens, auto-save progress to `docs/design/uiux/hifi-specifications.draft.md` with a `## Progress` section listing completed and remaining screens
- Support "pause", "stop", "save and continue later" — save immediately and note the next screen
- On resume: read the draft, summarise which screens are done, continue from the next screen

### Handling Incomplete Answers

- "I don't know" → log to `docs/design/uiux/ambiguity-log.md` with status **Open**, use a reasonable default marked `[assumed]`, continue
- Quality gate items that can't be checked → mark **Deferred** with the ambiguity log item ID

### Behavioral Guardrails

- Do not rephrase user-confirmed wireframe decisions — carry them forward exactly
- Do not invent components not defined in the Stage 3 design system — if a screen needs a component that doesn't exist, flag it: "This screen needs a [component type] not in the design system. Should we add it to Stage 3?"
- Do not use placeholder text (lorem ipsum) — write real, production-quality UI copy for every text element
- Reference specific user stories (US-NNN) and business rules (BR-NNN) when justifying copy and state decisions
- Tag any inferred details with `[assumed]`

### Contradiction Detection

- If a hi-fi decision conflicts with the wireframe layout, flag it: "Wireframe shows [X] but applying the design system suggests [Y]. Which should we use?"
- If the design system lacks a token needed for a screen, flag it before proceeding
- If UI copy contradicts a business rule, flag it explicitly

### Hi-Fi Specification Format

For each screen, produce the following structure:

```markdown
### [Screen Name] — Hi-Fi Specification

**Route:** [path]
**Wireframe Reference:** [section name in wireframes.md]
**User Story:** [US-XXX reference(s)]

#### Components Used

| Component | Variant | Props / Config | Design System Ref |
|-----------|---------|----------------|-------------------|
| PageHeader | with-breadcrumbs | title="Tasks", actions=[NewTaskButton] | DS §Components.PageHeader |
| DataTable | striped, sortable | columns=[...], pagination=true | DS §Components.DataTable |
| EmptyState | with-illustration | icon="tasks", cta="Create Task" | DS §Components.EmptyState |

#### Color & Typography Tokens Applied

| Element | Token | Value | Notes |
|---------|-------|-------|-------|
| Page title | font/heading-1 | 24px/700 Inter | Primary text color |
| Body text | font/body | 14px/400 Inter | Secondary text color |
| Background | color/surface-primary | #FFFFFF | Main content area |
| Accent | color/primary-500 | [from design system] | CTA buttons, active states |

#### Spacing & Layout Tokens

| Area | Token | Value |
|------|-------|-------|
| Page padding | spacing/page-x | [from scale] |
| Section gap | spacing/section-gap | [from scale] |
| Card padding | spacing/card-inner | [from scale] |

#### UI Copy

| Element | Text | Token | Notes |
|---------|------|-------|-------|
| Page title | "[exact text]" | font/heading-1 | — |
| Page subtitle | "[exact text]" | font/body, color/text-muted | Optional, contextual |
| Empty state headline | "[exact text]" | font/heading-2, color/text-muted | Shown when no data |
| Empty state body | "[exact text]" | font/body, color/text-muted | Actionable guidance |
| CTA button label | "[exact text]" | font/button | Primary variant |
| Tooltip | "[exact text]" | font/caption | On hover/focus |
| Error message | "[exact text]" | font/body, color/error | Specific and actionable |
| Success feedback | "[exact text]" | font/body, color/success | After successful action |

#### Interactive States

Document every interactive element on the screen:

**Buttons:**
| Button | Default | Hover | Active | Disabled | Loading |
|--------|---------|-------|--------|----------|---------|
| [name] | [appearance] | [change] | [change] | [when disabled, why] | [spinner? text change?] |

**Form Inputs (if applicable):**
| Input | Default | Focus | Filled | Error | Disabled |
|-------|---------|-------|--------|-------|----------|
| [name] | [placeholder text] | [border/shadow change] | [appearance] | [error message text] | [when disabled] |

**Page-Level States:**
| State | Appearance | Trigger | Components Used |
|-------|-----------|---------|-----------------|
| Loading | [skeleton layout / spinner / progressive] | Initial data fetch | Skeleton, ProgressBar |
| Empty | [empty state with CTA] | No data returned | EmptyState |
| Error | [error message with retry] | API failure | ErrorBanner |
| Offline | [offline indicator] | Network disconnected | OfflineBanner |

**Table/List States (if applicable):**
| State | Appearance | Components Used |
|-------|-----------|-----------------|
| Populated | [rows with data] | DataTable |
| Empty (no data) | [empty state] | EmptyState |
| Empty (no results) | [filtered empty state with clear filters CTA] | EmptyState |
| Loading | [skeleton rows — specify count] | SkeletonRow |
| Row hover | [highlight color token] | — |
| Row selected | [selection color token, checkbox checked] | Checkbox |

#### Form Validation (if applicable)

| Field | Required | Validation Rule | Error Message |
|-------|----------|----------------|---------------|
| [field name] | Yes/No | [rule from business rules] | "[exact error text]" |

#### Responsive Layout

- **Desktop (1280px):** [detailed layout with token references — columns, sidebar width, content max-width]
- **Tablet (768px):** [specific changes — sidebar collapses, grid goes from 3-col to 2-col, etc.]
- **Mobile (375px):** [specific changes — single column, hamburger nav, stacked cards, bottom sheet forms]

#### Accessibility Notes

- **ARIA roles:** [specific roles for landmarks, widgets, live regions]
- **Keyboard navigation:** [Tab order, Enter/Space actions, Escape to close, arrow keys for lists]
- **Focus management:** [where focus goes on page load, after modal close, after form submit]
- **Screen reader announcements:** [live region announcements for async actions, status changes]
- **Color contrast:** [confirm text/background combinations meet WCAG AA — reference specific tokens]
```

### Process for Each Screen Group

Follow the same screen groups from Stage 2 wireframes:

**Group 1: Authentication Screens** — Login, Registration, Forgot/Reset Password
- Write exact form labels, placeholder text, button labels, error messages for every validation case
- Document SSO button appearance and loading state
- Specify password strength indicator behavior (if applicable)

**Group 2: Dashboard** — Main Dashboard
- Specify exact widget titles, metric labels, number formats
- Document chart component variants and empty chart states
- Write quick action button labels and tooltips

**Group 3: List / Table Views** — All entity lists
- Write exact column headers, filter labels, search placeholder text
- Document sort indicator appearance, pagination controls text ("Showing 1-20 of 142")
- Write both empty state variants: "no data yet" and "no matching results"
- Specify bulk action bar appearance and confirmation dialog copy

**Group 4: Detail / View Pages** — All entity detail screens
- Specify exact field labels, value formatting (dates, numbers, status badges)
- Document action button labels and confirmation dialog copy for destructive actions
- Write timeline/activity log entry format

**Group 5: Create / Edit Forms** — All entity forms
- Write every field label, placeholder, help text, and validation error message
- Document form submission states: submitting (button loading), success (feedback message), error (error banner)
- Specify unsaved changes dialog copy

**Group 6: Empty States** — All empty states with real copy
**Group 7: Error States** — 404, 500, 403, Offline with real copy and specific CTAs
**Group 8: Settings & Profile** — All settings screens

### After All Screens Are Complete

Generate **three deliverables**:

#### 1. Complete Hi-Fi Specifications Document

All screen specs in order, with full component, token, copy, and state documentation.

#### 2. Screen-to-Component Mapping Summary

| Screen | Components Used | Unique States | Key a11y Notes |
|--------|----------------|---------------|----------------|
| Login | Form, TextInput, Button, Alert, SSOButton | 4 (default, loading, error, success) | Focus on first input, live error region |
| Dashboard | PageHeader, MetricCard, Chart, ActivityFeed | 3 (loading, populated, empty) | Skip-nav to main content |

#### 3. UI Copy Master List

| Screen | Element | Copy | Type |
|--------|---------|------|------|
| Login | Submit button | "Sign in" | Button label |
| Login | Error — invalid credentials | "The email or password you entered is incorrect. Please try again." | Error message |
| Task List | Empty state headline | "No tasks yet" | Heading |

This table serves as the single source of truth for all user-facing text, enabling bulk review for tone, consistency, and internationalization readiness.

**Present all deliverables** to the user for review before saving.

**Save** to `docs/design/uiux/hifi-specifications.md`

**Recommend** proceeding to `/uiux-stage5-handoff`

## Quality Gate

Before marking this stage complete, confirm:
- [ ] Every wireframed screen has a corresponding hi-fi specification
- [ ] All specifications reference design system components by name (from Stage 3)
- [ ] Real UI copy written for every user-facing text element (no lorem ipsum or placeholder text)
- [ ] All interactive states documented for every interactive element (buttons, inputs, tables, forms, pages)
- [ ] Responsive layouts defined for all three breakpoints (375px, 768px, 1280px) with token references
- [ ] Accessibility notes present for every screen (ARIA roles, keyboard nav, focus order, screen reader)
- [ ] Screen-to-component mapping summary table is complete
- [ ] UI copy master list is complete and reviewable as a standalone document
- [ ] Loading states specified (skeleton vs. spinner vs. progressive) for every data-fetching screen
- [ ] Error messages are specific and actionable (not generic "Something went wrong")
- [ ] Form validation messages written for every required field, referencing business rules
- [ ] Color and typography tokens reference the design system — no raw hex or pixel values outside the token system
