# Stage 1 — Information Architecture & User Flows

You are conducting Stage 1 of the UI/UX Design phase. The goal is to map the complete navigation structure and user journeys from signed-off user stories, establishing **where users go** and **how they get there** before any visual design begins.

## Pre-Requisite

Check that these documents exist and read them:
- `docs/requirements/functional-requirements.md` — user stories, acceptance criteria, role-permission matrix
- `docs/requirements/scope-definition.md` — MVP scope (Must-Have vs Should-Have vs Could-Have)
- `docs/design/high-level-design.md` — frontend architecture decision (SPA/SSR, state management, routing strategy)
- `docs/design/api-contracts.md` — API endpoints (informs what data each page fetches and what actions are available)

If any are missing, inform the user which ones are absent and recommend completing the prerequisite phase first. Allow them to proceed if they choose, but log missing inputs to `docs/design/design-ambiguity-log.md`.

Also read these if they exist (optional but valuable):
- `docs/requirements/business-context.md` — user personas, glossary
- `docs/design/security-architecture.md` — auth flows, RBAC rules, protected route patterns
- `docs/design/uiux/pre-check-report.md` — existing component inventory, current route structure

## Instructions

Walk through each decision **one at a time**. For each decision, present options and recommendations grounded in the requirements and architecture documents. Wait for user confirmation before moving on.

### Partial Save & Resume

- After every 3 decisions, auto-save progress to `docs/design/uiux/ia-user-flows.draft.md` with a `## Progress` section noting which decisions are completed and which is next
- If the user says "pause", "stop", or "save and continue later": save the current draft immediately and note the next decision to resume from
- On resume: read the draft file, summarise decisions made so far, continue from the next undecided item

### Handling Incomplete Answers

- If the user answers "I don't know" or is unsure, log the item to `docs/design/design-ambiguity-log.md` with status **Open** and continue — do not block the stage
- If a quality gate item cannot be checked due to missing answers, mark it as **Deferred** with the specific ambiguity log item ID

### Behavioral Guardrails

- Do not rephrase or reinterpret the user's answers — quote them directly when synthesizing deliverables
- Do not invent or assume answers the user has not provided — mark gaps explicitly as "[TBD — needs stakeholder input]"
- Do not embellish — tag inferred details with "[assumed]"
- Reference specific user stories by ID (e.g., US-001) when mapping routes and flows
- Reference specific API endpoints from the API contracts when documenting data sources for pages

### Contradiction Detection

- If a proposed navigation decision contradicts the HLD frontend architecture, flag it: "In the HLD, the architecture specifies [X]. This navigation approach seems to conflict with [Y]. Which should we follow?"
- If a user flow contradicts a user story's acceptance criteria, flag it: "User story US-[NNN] requires [X], but this flow skips that step. Should we add it?"
- If a route structure conflicts with the API contract endpoints, flag the mismatch before proceeding

### Decisions to Walk Through

**Decision 1: Navigation Model**

- Options: sidebar navigation, top navigation bar, hybrid (top bar + sidebar), bottom tab bar (mobile-first)
- Consider:
  - How many top-level sections does the app have? (sidebar suits 5+ sections; top nav suits fewer)
  - User personas from Phase 1 — what are they familiar with? What's their tech literacy?
  - Mobile behavior — does the sidebar collapse to a hamburger menu? Does top nav become a bottom bar?
  - Reference apps or competitors the user identified in Phase 1
- Probe: "Should the navigation be collapsible to maximize content area?"
- Probe: "Do any user roles see a different navigation structure, or is it the same nav with different items visible?"

**Decision 2: Global Navigation Elements**

- What elements appear on every authenticated page? Walk through each:
  - **Logo / App name** — clickable to dashboard or home?
  - **Search** — global search bar or per-page filtering only?
  - **User menu** — avatar, name, dropdown with profile/settings/logout?
  - **Notifications** — bell icon with badge count? Dropdown vs dedicated page?
  - **Breadcrumbs** — for nested routes? At what depth do they appear?
  - **Help / Support** — link, chat widget, or tooltip system?
- Reference: user stories that mention search, notifications, or profile management
- Probe: "Are there any status indicators that should always be visible? (e.g., connection status, current team/project context)"

**Decision 3: Route Hierarchy (Sitemap)**

- Map every page identified from user stories into a hierarchical sitemap tree
- Use this format as a starting template, then expand based on actual user stories:
  ```
  / (public landing or login redirect)
  ├── /auth
  │   ├── /login
  │   ├── /forgot-password
  │   └── /reset-password/:token
  └── /app (protected, requires auth)
      ├── /dashboard
      ├── /[resource]
      │   ├── /           → list view
      │   ├── /new        → create form
      │   └── /:id        → detail / edit view
      └── /settings
  ```
- For each route, specify: page name, primary user story, auth required (yes/no), allowed roles
- Cross-reference against API contracts: does every route have a corresponding API endpoint for its data needs?
- Flag any user stories that don't map to a route (orphan stories)
- Flag any routes that don't trace back to a user story (orphan routes)
- Probe: "Are there any admin-only pages that regular users should never see in navigation?"

**Decision 4: Auth Flow**

- Map the complete authentication journey:
  - **Email/password login**: form → validation → API call → JWT storage → redirect to dashboard (or to originally requested page)
  - **Microsoft SSO** (if applicable per HLD): redirect to Azure → callback → token exchange → account linking or creation → redirect
  - **Forgot password**: email input → API call → confirmation message → email link → reset form → success → redirect to login
  - **First-time onboarding**: after first login, is there a welcome wizard, profile setup, or team invitation step?
  - **Session expiry**: what happens when the JWT expires mid-session? Silent refresh, modal prompt, or redirect to login?
  - **Logout**: clear tokens → redirect to login → prevent back-button access to protected pages
- Reference: `docs/design/security-architecture.md` for token lifecycle and storage decisions
- Reference: HLD Decision 3 (Authentication & Authorization Strategy)
- Probe: "Should the app remember the user's last visited page and redirect there after login?"

**Decision 5: Primary CRUD Flows**

- For each core entity identified in the data model (tasks, teams, progress updates, alerts), diagram the full create-read-update-delete journey:
  ```
  [Entry Point] → [Action] → {Decision?}
    → Yes → [Success State] → [Next Action or Return]
    → No  → [Error Handling] → [Recovery Path]
  ```
- For **Create**: where does the user start? (button on list page, FAB, nav menu) → form page or modal? → validation → API call → success feedback → redirect where?
- For **Read**: list view with filters/sort/pagination → click row → detail view → what actions are available from detail?
- For **Update**: inline edit on detail page, or separate edit mode/page? → validation → optimistic or pessimistic update? → success feedback
- For **Delete**: confirmation dialog → soft delete or hard delete? → success feedback → redirect to list
- Reference: user stories for each entity's acceptance criteria
- Reference: API contracts for available endpoints and their request/response shapes
- Probe: "For each entity, should create/edit use a full page form, a modal/drawer, or inline editing?"

**Decision 6: Multi-Step Flows**

- Are there any user journeys that require multiple steps or a wizard-like experience?
- Examples to check against user stories:
  - Onboarding: team setup → invite members → first task creation
  - Complex task creation: basic info → assignments → schedule → milestones → review and submit
  - Bulk operations: select multiple items → choose action → confirm → progress indicator
- For each multi-step flow:
  - Can the user save a draft and return later?
  - Can the user go back to previous steps?
  - Is there a progress indicator (stepper, progress bar)?
  - What happens if they abandon mid-flow?
- Probe: "Are there any import/export workflows? (CSV upload, bulk create, data export)"

**Decision 7: Error & Edge-Case Flows**

- Document standard handling for each error scenario:
  - **403 Forbidden**: user is authenticated but lacks permission → show "access denied" page with explanation and suggested action, or redirect to dashboard?
  - **404 Not Found**: requested resource doesn't exist → show "not found" page with search suggestion and link to home
  - **500 Server Error**: unexpected backend failure → show "something went wrong" page with retry button and support contact
  - **Network / Offline**: API call fails due to connectivity → inline error banner with retry, or full-page error state?
  - **Session Expired**: JWT expired during user interaction → modal prompting re-login (preserving form state?) or redirect to login (losing state)?
  - **Empty States**: first-time user with no data → show helpful empty state with call-to-action (e.g., "Create your first task") rather than a blank page
  - **Loading States**: skeleton screens, spinner, or progressive loading? Consistent pattern across all pages?
- For each entity's list and detail view, document what the empty state looks like
- Probe: "Should form data be preserved if the user navigates away accidentally? (unsaved changes warning)"

**Decision 8: Role-Based Flow Variations**

- Based on the role-permission matrix from Phase 3:
  - Which navigation items are visible/hidden per role?
  - Which CRUD actions are available vs disabled vs hidden per role?
  - Are there any role-specific pages (e.g., admin dashboard, team management)?
  - How does the UI communicate "you don't have permission"? (hide the button entirely, show it disabled with tooltip, or show it and display error on click?)
- For each role identified in requirements:
  - Document the default landing page after login
  - Document which flows differ from the standard flow
  - Document any data scoping (e.g., regular user sees only their tasks, manager sees team tasks, admin sees all)
- Reference: role-permission matrix from `docs/requirements/functional-requirements.md`
- Probe: "Can a user have multiple roles? If so, how are combined permissions handled in the UI?"

### After All Decisions Are Made

Generate the **Information Architecture & User Flows** document with these sections:

#### 1. Sitemap

Full ASCII tree of all routes with annotations:
```
Route | Page Name | Auth | Roles | Primary User Story
```

#### 2. User Flow Diagrams

Box-and-diamond flow diagram for every Must-Have user story from the scope definition. Group flows by entity/feature area. Use this format:
```
[Page/Component] → [User Action] → {Condition?}
  → Yes → [API Call] → [Success State] → [Next Step]
  → No  → [Validation Error] → [Recovery]
```

#### 3. Navigation Model

- Decision (sidebar / top nav / hybrid) with rationale
- Responsive behavior (desktop, tablet, mobile breakpoints)
- Collapsible behavior and toggle mechanism

#### 4. Global Navigation Spec

| Element | Position | Behavior | Visible To | Notes |
|---|---|---|---|---|
| Logo | [position] | [click target] | All roles | |
| Search | [position] | [scope] | [roles] | |
| Notifications | [position] | [dropdown/page] | [roles] | |
| User Menu | [position] | [dropdown items] | All roles | |
| Breadcrumbs | [position] | [depth trigger] | All roles | |

#### 5. Route-to-User-Story Mapping Table

| Route | Page Name | User Story ID | Primary Action | Auth Required | Roles | API Endpoints Used |
|---|---|---|---|---|---|---|
| /app/dashboard | Dashboard | US-001 | View overview | Yes | All | GET /api/tasks, GET /api/alerts |
| ... | ... | ... | ... | ... | ... | ... |

Flag any orphan routes (no user story) or unmapped stories (no route) at the bottom of this table.

#### 6. Error Flow Catalogue

| Error Type | HTTP Code | User-Facing Message | UI Pattern | Recovery Action |
|---|---|---|---|---|
| Forbidden | 403 | [message] | [page/modal/inline] | [action] |
| Not Found | 404 | [message] | [page] | [action] |
| Server Error | 500 | [message] | [page] | [action] |
| Offline | N/A | [message] | [banner] | [action] |
| Session Expired | 401 | [message] | [modal] | [action] |
| Empty State | N/A | [message per entity] | [illustration + CTA] | [action] |

**Present the full document** to the user for review before saving.

**Save** to `docs/design/uiux/ia-user-flows.md`

**Recommend** the user proceed to `/uiux-stage2-wireframes` (next stage: low-fidelity wireframes and layout structure).

## Quality Gate

Before marking this stage complete, confirm:
- [ ] Every Must-Have user story has at least one documented flow
- [ ] Sitemap covers all routes identified from user stories
- [ ] Auth flow is fully documented (login, logout, session expiry, forgot password)
- [ ] Error paths documented for 403, 404, 500, offline, and session expired
- [ ] Navigation model decision is documented with rationale
- [ ] Route-to-user-story mapping is complete (no orphan routes, no unmapped stories)
- [ ] Role-based flow variations are documented where applicable
- [ ] Empty states identified for every list/dashboard view
- [ ] All decisions reference specific user story IDs or NFR targets that drove them
- [ ] No contradictions with HLD frontend architecture or API contracts
