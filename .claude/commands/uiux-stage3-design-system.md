# Stage 3 — Design System

You are conducting Stage 3 of the UI/UX Design phase. The goal is to establish the **single source of truth for every visual and interactive element** in the app — producing code-ready CSS custom properties and TypeScript theme types that developers can implement directly.

## Pre-Requisite

Check that these documents exist and read them:
- `docs/design/uiux/wireframes.md` — Stage 2 wireframe output (screen inventory, layout patterns)
- `docs/design/high-level-design.md` — technology decisions (frontend framework, architecture)
- `docs/requirements/nonfunctional-requirements.md` — accessibility targets, performance budgets
- `apps/web-frontend/src/styles/global.css` — audit existing tokens, colors, and patterns already in use

If `wireframes.md` is missing, inform the user that Stage 2 must be completed first — the design system must reference wireframed screens. If other files are missing, log gaps to `docs/design/uiux/ambiguity-log.md` and allow the user to proceed.

## Instructions

Walk through each design decision **one at a time**. Present options, trade-offs, and a recommendation based on requirements and existing codebase patterns. Wait for user confirmation before moving on.

### Partial Save & Resume

- After every 3 decisions, auto-save progress to `docs/design/uiux/design-system.draft.md` with a `## Progress` section listing completed and remaining decisions
- Support "pause", "stop", "save and continue later" — save immediately, note the next decision to resume from
- On resume: read the draft, summarise decisions made so far, continue from the next undecided item

### Handling Incomplete Answers

- "I don't know" → log to `docs/design/uiux/ambiguity-log.md` with status **Open**, continue to next decision
- Quality gate items that can't be checked → mark **Deferred** with ambiguity log ID

### Behavioral Guardrails

- Do not rephrase user decisions — quote directly
- Do not invent requirements — mark gaps as "[TBD — needs stakeholder input]"
- Do not embellish — tag inferred details with "[assumed]"
- Do not introduce technologies not discussed in prior phases without flagging: "This was not mentioned in the HLD or technical constraints — adding it as a new dependency"
- Reference existing CSS patterns from `global.css` when proposing tokens — map old to new

### Contradiction Detection

- If a proposed decision contradicts the HLD (e.g., suggesting Tailwind when HLD specifies plain CSS), flag explicitly before proceeding
- If a color choice fails WCAG AA contrast requirements from the NFR spec, flag before accepting

### Decisions

**Decision 1: Component Library Selection**

Present this trade-off table:

| Library | Best For | Pros | Cons | Bundle Size |
|---------|----------|------|------|-------------|
| shadcn/ui + Tailwind | Custom brand, full control | Composable, copy-paste, tree-shakable | Manual assembly, Tailwind learning curve | Minimal (only what you use) |
| MUI (Material UI) | Fast delivery, data-heavy apps | Comprehensive, great docs, mature | Heavy bundle, Material look hard to override | ~300KB |
| Mantine | Good defaults, forms | Excellent form utilities, clean API | Smaller ecosystem | ~200KB |
| Radix UI (headless) | Maximum flexibility | Accessible primitives, unstyled | Bring your own styles entirely | Tiny |
| Custom CSS (current) | Simple apps, full control | No dependencies, lightweight | Slow to build, consistency risk | Zero |

Cross-reference:
- Phase 5 technical constraints (framework choices)
- Existing CSS patterns and dependencies in `apps/web-frontend/package.json`
- HLD frontend architecture decision

After user confirms: document as an ADR in `docs/adr/` following the project's ADR format (see `/design-adrs` for template).

**Decision 2: Color Tokens**

Define the full color palette with semantic meaning:
- **Primary** — brand color for buttons, links, focus rings
- **Primary Hover/Active** — interaction states
- **Secondary** — muted text, secondary actions
- **Success** — positive status, completion indicators
- **Warning** — caution states, approaching deadlines
- **Danger** — errors, destructive actions, overdue alerts
- **Background** — page background
- **Surface** — card/panel backgrounds
- **Border** — dividers, input borders
- **Text Primary** — main body text
- **Text Secondary** — muted/helper text
- **Text Disabled** — disabled state text
- **Dark mode variants** for ALL tokens above

Requirements:
- Verify contrast ratio >= 4.5:1 for all text-on-background combinations (WCAG AA)
- Audit existing colors in `apps/web-frontend/src/styles/global.css` and map them to new tokens
- Present a migration table: `old value → new token name`

Output format:
```css
:root {
  --color-primary: #XXXXXX;
  --color-primary-hover: #XXXXXX;
  --color-primary-active: #XXXXXX;
  --color-secondary: #XXXXXX;
  --color-success: #XXXXXX;
  --color-warning: #XXXXXX;
  --color-danger: #XXXXXX;
  --color-bg: #XXXXXX;
  --color-surface: #XXXXXX;
  --color-border: #XXXXXX;
  --color-text: #XXXXXX;
  --color-text-secondary: #XXXXXX;
  --color-text-disabled: #XXXXXX;
}

[data-theme="dark"] {
  --color-primary: #XXXXXX;
  /* ... all tokens redefined for dark mode */
}
```

**Decision 3: Typography Scale**

Define the full type scale with sizes, weights, and line heights:

| Level | Size | Weight | Line Height | Use Case |
|-------|------|--------|-------------|----------|
| Display | 32px | 500 | 1.2 | Page headings, hero text |
| H1 | 24px | 500 | 1.3 | Section headings |
| H2 | 20px | 500 | 1.4 | Sub-section headings |
| H3 | 16px | 500 | 1.4 | Card titles, group labels |
| Body | 14px | 400 | 1.5 | Default text |
| Small | 12px | 400 | 1.5 | Labels, captions, timestamps |
| Mono | 13px | 400 | 1.5 | Code, IDs, technical values |

Decisions to make:
- Font family: system fonts stack vs web fonts (e.g., Inter, Plus Jakarta Sans)
- Monospace font family for code/IDs
- Line height rules per level

Output as CSS custom properties AND TypeScript type:
```css
:root {
  --font-family: [chosen stack];
  --font-family-mono: [chosen mono stack];
  --font-size-display: 32px;
  /* ... */
  --line-height-display: 1.2;
  /* ... */
}
```

**Decision 4: Spacing Scale**

Choose base-4 or base-8 system. Present trade-offs:
- Base-4: more granular (4, 8, 12, 16, 20, 24...), better for dense UIs
- Base-8: coarser (8, 16, 24, 32...), stronger visual rhythm, faster decisions

Define the scale with usage guidelines:
```
--space-1: 4px    (inline icon gaps, tight padding)
--space-2: 8px    (input padding, badge padding)
--space-3: 12px   (list item padding, small gaps)
--space-4: 16px   (card padding, form field gaps)
--space-6: 24px   (section gaps, modal padding)
--space-8: 32px   (page section spacing)
--space-12: 48px  (major section breaks)
--space-16: 64px  (page-level top/bottom padding)
```

For each value, specify when to use it with examples from the wireframed screens.

**Decision 4b: Elevation & Border Radius Scale**

Define visual depth and corner rounding tokens:

**Elevation (box-shadow):**
```css
:root {
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);    /* cards, subtle lift */
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);     /* dropdowns, popovers */
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);    /* modals, dialogs */
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.15);   /* toast stacks, overlays */
}
```

**Border radius:**
```css
:root {
  --radius-sm: 4px;     /* badges, small tags */
  --radius-md: 8px;     /* cards, inputs, buttons */
  --radius-lg: 12px;    /* modals, panels */
  --radius-full: 9999px; /* avatars, pills */
}
```

Decisions to make:
- Which elevation level maps to which component? (cards = sm, dropdowns = md, modals = lg)
- Preferred corner style: sharp, slightly rounded, or fully rounded?
- Dark mode shadow adjustments (shadows are less visible on dark backgrounds — consider increasing opacity or using border instead)

**Decision 5: Component Inventory**

Build the full inventory organized by Atomic Design levels. Cross-reference wireframed screens to ensure coverage.

**Atoms** (smallest building blocks):
Button, Input, TextArea, Select, Checkbox, Radio, Toggle, Label, Badge, Avatar, Spinner, Icon, Tooltip, Divider

**Molecules** (combinations of atoms):
FormField (Label + Input + Error), SearchBar, Dropdown/Menu, Modal/Dialog, Toast/Notification, Tabs, Breadcrumbs, Pagination, DatePicker, FileUpload

**Organisms** (complex UI sections):
DataTable (sortable, filterable, paginated), Sidebar/Navigation, TopNav/Header, PageHeader (title + breadcrumbs + actions), FilterPanel, Card (stat card, content card, alert card), Timeline, KanbanColumn, EmptyState, ErrorBoundary

For each component, define:

| Component | States | Props/Variants | Accessibility |
|-----------|--------|----------------|---------------|
| Button | default, hover, active, focus, disabled, loading | variant: primary/secondary/ghost/danger, size: sm/md/lg | `role="button"`, `aria-disabled`, `aria-busy` |
| Input | default, focus, filled, error, disabled, readonly | type: text/email/password, size: sm/md | `aria-invalid`, `aria-describedby` for errors |
| ... | ... | ... | ... |

Verify: every screen from wireframes.md is buildable with this inventory. Flag any gaps.

**Decision 6: Component State Matrix**

For EVERY interactive component from Decision 5, list all visual states:

- **Buttons:** default, hover, active, focus-visible, disabled, loading
- **Inputs:** default, focus, filled, error, disabled, readonly
- **Tables:** populated, empty (zero state), loading (skeleton), error (retry)
- **Forms:** clean, dirty, validation errors, submitting, success, server error
- **Cards:** default, hover (if clickable), selected, loading (skeleton)
- **Modals:** opening, open, closing (if animated)
- **Toasts:** info, success, warning, error, with/without action

For each state: what changes visually (color, border, icon, cursor, opacity)?

**Decision 7: Icon Set**

Present options:

| Icon Set | Style | Tree-Shakable | React Support | Icon Count |
|----------|-------|---------------|---------------|------------|
| Lucide Icons | Clean line icons | Yes | `lucide-react` | 1400+ |
| Heroicons | Outline + solid | Yes | `@heroicons/react` | 300+ |
| React Icons | Multi-library bundle | Partial | `react-icons` | 4000+ |
| Custom SVGs | Brand-specific | N/A | Manual | As needed |

Estimate: how many unique icons does this project need based on wireframes?
Recommendation based on wireframe icon usage and bundle size budget from NFRs.

**Decision 8: Motion & Transitions**

Define timing and easing conventions:

```css
:root {
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;
}
```

Rules to establish:
- **What animates:** hover states, focus rings, modal open/close, toast enter/exit, dropdown expand, skeleton shimmer
- **What does NOT animate:** page loads, data table population, form submissions
- **Reduced motion:** all animations must respect `prefers-reduced-motion: reduce` — provide the media query pattern

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### After All Decisions Are Complete

Generate the **Design System Document** with these sections:

1. **Component Library Decision** — choice, rationale, ADR reference
2. **Color Tokens** — light + dark themes as CSS custom properties, contrast verification table
3. **Typography Scale** — full scale as CSS custom properties
4. **Spacing Scale** — values with usage guidelines
4b. **Elevation & Border Radius** — shadow scale, radius scale, component-to-elevation mapping
5. **Component Inventory** — full Atoms/Molecules/Organisms table with states, props, accessibility
6. **Component State Matrix** — every interactive component with all visual states
7. **Icon Set Decision** — choice, rationale, estimated icon count
8. **Motion & Transition Conventions** — timing tokens, animation rules, reduced motion support
9. **TypeScript Theme Type** — typed interface covering all design tokens:
   ```typescript
   export interface ThemeTokens {
     colors: {
       primary: string;
       primaryHover: string;
       primaryActive: string;
       secondary: string;
       success: string;
       warning: string;
       danger: string;
       bg: string;
       surface: string;
       border: string;
       text: string;
       textSecondary: string;
       textDisabled: string;
     };
     typography: {
       fontFamily: string;
       fontFamilyMono: string;
       sizeDisplay: string;
       sizeH1: string;
       sizeH2: string;
       sizeH3: string;
       sizeBody: string;
       sizeSmall: string;
       sizeMono: string;
     };
     spacing: Record<string, string>;
     elevation: {
       sm: string;
       md: string;
       lg: string;
       xl: string;
     };
     borderRadius: {
       sm: string;
       md: string;
       lg: string;
       full: string;
     };
     transitions: {
       fast: string;
       normal: string;
       slow: string;
     };
   }
   ```
10. **Existing Pattern Audit** — what already exists in `global.css`, mapping old values to new tokens

**Present the full document** to the user for review before saving.

**Save** to `docs/design/uiux/design-system.md`

**Recommend** the user proceed to `/uiux-stage4-hifi-specs`

## Quality Gate

Before marking this stage complete, confirm:
- [ ] Component library selected with rationale documented (ADR created in `docs/adr/`)
- [ ] All color tokens defined for both light and dark themes
- [ ] Color contrast ratios verified >= 4.5:1 for all text-on-background pairs (WCAG AA)
- [ ] Typography scale is complete (display through mono) with sizes, weights, and line heights
- [ ] Spacing scale defined with usage guidelines for each value
- [ ] Elevation scale defined (shadow tokens) with component-to-elevation mapping
- [ ] Border radius scale defined with usage guidelines
- [ ] Component inventory covers all Atoms, Molecules, and Organisms needed for wireframed screens
- [ ] Every interactive component has all states documented in the state matrix
- [ ] Icon set selected with rationale
- [ ] Motion/transition conventions defined with `prefers-reduced-motion` support
- [ ] All tokens expressed as CSS custom properties ready for implementation
- [ ] TypeScript theme type defined covering all token categories
- [ ] Existing CSS patterns in `global.css` audited and mapped to new tokens
