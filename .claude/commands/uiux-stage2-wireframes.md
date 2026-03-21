# Stage 2 — Text-Based Wireframe Specifications

You are conducting Stage 2 of the UI/UX Design phase. The goal is to produce **low-fidelity screen specifications** for every page in the application — structured markdown wireframes with ASCII layout sketches, content zone inventories, and responsive behavior documentation.

## Pre-Requisite

Check that these documents exist and read them before starting:
- `docs/design/uiux/ia-user-flows.md` — information architecture, sitemap, and user flow diagrams (from Stage 1)
- `docs/requirements/functional-requirements.md` — user stories, role-permission matrix, data dictionary
- `docs/design/api-contracts.md` — available endpoints, request/response shapes, data fields

If the Stage 1 output is missing, inform the user that Stage 1 must be completed first — the page inventory and user flows drive wireframe decisions. If functional requirements are missing, this stage cannot proceed meaningfully.

## Instructions

Walk through screens **one at a time**, grouped by screen type. For each screen, produce a wireframe specification. Present each wireframe spec to the user and wait for confirmation before moving to the next screen.

### Partial Save & Resume

- After every 3 screens, auto-save progress to `docs/design/uiux/wireframes.draft.md` with a `## Progress` section listing completed and remaining screens
- Support "pause", "stop", "save and continue later" — save immediately and note the next screen
- On resume: read the draft, summarise which screens are done, continue from the next screen

### Handling Incomplete Answers

- "I don't know" → log to `docs/requirements/ambiguity-log.md` with status **Open**, continue with a reasonable default marked `[assumed]`
- Quality gate items that can't be checked → mark **Deferred** with the ambiguity log item ID

### Behavioral Guardrails

- Do not invent screens not in the Stage 1 sitemap — if you think one is missing, ask: "The user stories mention [X] but the sitemap has no page for it. Should we add one?"
- Do not add data fields not present in the API contracts or data dictionary — flag gaps before proceeding
- Reference specific user stories (US-NNN) when justifying content zone decisions
- Do not embellish — tag inferred layout decisions with `[assumed]`

### Contradiction Detection

- If a wireframe contradicts a user flow from Stage 1, flag it: "Stage 1 flow shows [X] but this wireframe implies [Y]. Which is correct?"
- If a screen requires data not available from any API endpoint, flag it before proceeding

### Wireframe Specification Format

For each screen, produce the following structure:

```markdown
### [Screen Name] — [Route Path]

**User Story:** [US-XXX reference(s)]
**Primary Action:** [what the user is trying to accomplish on this screen]
**Entry Points:** [how the user arrives — links, redirects, direct URL]
**Exit Points:** [where the user goes next — links, buttons, redirects]

#### Layout (Desktop — 1280px)

┌─────────────────────────────────────────┐
│ [HEADER / NAV]                          │
├──────────┬──────────────────────────────┤
│ SIDEBAR  │ MAIN CONTENT AREA           │
│          │ ┌──────────────────────┐     │
│          │ │ [Content zone 1]     │     │
│          │ └──────────────────────┘     │
│          │ ┌──────────────────────┐     │
│          │ │ [Content zone 2]     │     │
│          │ └──────────────────────┘     │
└──────────┴──────────────────────────────┘

#### Content Zones

| Zone | Content | Data Source (API) | Priority |
|------|---------|-------------------|----------|
| 1    | [what goes here, specific fields] | [endpoint] | Primary |
| 2    | [what goes here, specific fields] | [endpoint] | Secondary |

#### Interactive Elements

| Element | Type | Behavior | Validation |
|---------|------|----------|------------|
| [name]  | Button / Input / Select / etc. | [what happens on interaction] | [rules] |

#### Responsive Behavior

- **Mobile (375px):** [how layout collapses — stacked, hidden sidebar, hamburger menu, etc.]
- **Tablet (768px):** [intermediate layout — collapsed sidebar, reduced columns, etc.]

#### States

- **Loading:** [skeleton pattern / spinner / progressive — be specific]
- **Empty:** [what the user sees when no data exists — headline, body text, CTA]
- **Error:** [what the user sees on API failure — message, retry action]
```

### Screen Groups to Cover

Work through these groups in order. Derive the specific screens from the Stage 1 sitemap — the items below are the **minimum types** to cover.

**Group 1: Authentication Screens**

1. **Login Page** — email/password form, SSO button, forgot password link, error states (invalid credentials, account locked, network error)
2. **Registration Page** — form fields, password requirements display, terms acceptance
3. **Forgot Password / Reset Password** — email input, confirmation message, new password form

For each: document form field order, required indicators, inline validation placement, and the SSO flow entry point (if applicable per `docs/design/security-architecture.md`).

**Group 2: Dashboard**

4. **Main Dashboard** — key metrics widgets, chart placeholders (specify chart type and data), quick action buttons, recent activity feed, widget grid layout

Specify the grid system (how many columns at each breakpoint), what each widget shows, and which role sees which widgets (reference the role-permission matrix).

**Group 3: List / Table Views**

5. **Primary Entity List** (e.g., Tasks) — column definitions, sort controls per column, filter bar/panel, search input, pagination controls, bulk action toolbar, row actions
6. **Secondary Entity Lists** (e.g., Teams, Users) — same structure, adapted columns

For each list: define the empty state (no items yet vs. no search results), loading skeleton (how many placeholder rows), and bulk actions available per role.

**Group 4: Detail / View Pages**

7. **Entity Detail Page** — data layout (header section with key info, body sections with related data), action buttons (edit, delete, back, status change), timeline/activity log section, related items section

Specify section ordering, which fields are prominent (hero area) vs. secondary, and how related data loads (inline vs. tabs vs. accordion).

**Group 5: Create / Edit Forms**

8. **Create Entity Form** — field layout (single-column vs. multi-column), field grouping with section headers, required vs. optional indicators, validation error placement (inline below field), cancel/save button placement (sticky footer vs. inline), unsaved changes warning
9. **Edit Entity Form** — pre-populated fields, what is editable vs. read-only, delete action placement

For each form: specify field order, group labels, and whether multi-column layout is used at desktop (and collapses to single-column on mobile).

**Group 6: Empty States**

10. **Dashboard Empty State** — what new users see before any data exists
11. **List Empty States** — per entity type: illustration placeholder, headline, body text, primary CTA

Each empty state must have: a headline, a short description, and a primary action button that leads to the create flow.

**Group 7: Error States**

12. **404 Not Found** — message, navigation options (back, home)
13. **500 Server Error** — message, retry action, support contact
14. **403 Forbidden** — message, what the user can do instead
15. **Offline / Network Error** — message, retry mechanism

**Group 8: Settings & Profile**

16. **User Profile / Settings** — form sections (personal info, password change, notification preferences), save per section vs. global save
17. **Application Settings** (if applicable per requirements) — admin-only sections, feature toggles

### After All Screens Are Complete

1. Generate a **Screen Inventory Table**:

| # | Screen Name | Route | User Stories | Primary Action | Breakpoints Documented |
|---|------------|-------|-------------|----------------|----------------------|
| 1 | Login | /login | US-001 | Authenticate | Yes |

2. Generate a **Navigation Consistency Checklist**:
   - Header: present on all authenticated screens? Same structure?
   - Sidebar: which screens show it? Collapsible?
   - Breadcrumbs: which screens use them? Format?
   - Back navigation: consistent pattern?

3. **Present all wireframe specifications** to the user for review before saving.

4. **Save** to `docs/design/uiux/wireframes.md`

5. **Recommend** proceeding to `/uiux-stage3-design-system`

## Quality Gate

Before marking this stage complete, confirm:
- [ ] All MVP screens from the Stage 1 sitemap have wireframe specifications
- [ ] Every wireframe identifies its primary action and traces to at least one user story (US-NNN)
- [ ] Empty states designed for every list view and dashboard view
- [ ] Error states designed for all four types (404, 500, 403, offline/network)
- [ ] Responsive behavior documented for all three breakpoints (375px, 768px, 1280px)
- [ ] Navigation placement is consistent across all authenticated screens
- [ ] Form wireframes specify required vs. optional fields and validation error placement
- [ ] Content zones reference specific API endpoints or data sources
- [ ] Loading states specified for every screen that fetches data (skeleton vs. spinner vs. progressive)
- [ ] Screen inventory table is complete with all screens listed
- [ ] No wireframe references data fields absent from the API contracts or data dictionary
