# Pre-Check: Existing UI/UX Design Artifacts Scan

You are starting the UI/UX Design phase pre-check. Before beginning any UI/UX design work, scan the repository for existing frontend patterns, components, and design artifacts to avoid duplication and identify what's already been built or decided.

## Pre-Requisite

Check that `docs/design/design-signoff.md` exists (system design phase signed off). If missing, warn the user that system design should be signed off before UI/UX design begins, but allow them to proceed.

## Instructions

1. **Scan the repository** for any existing UI/UX-related files and patterns:
   - Check `docs/design/uiux/` for any previously generated UI/UX deliverables (wireframes, flow diagrams, style guides, IA documents)
   - Check `apps/web-frontend/src/styles/` for existing CSS files, design tokens, theme definitions, or CSS-in-JS configurations
   - Check `apps/web-frontend/src/components/` for existing React components — catalogue them by type (layout, form, data display, navigation, feedback)
   - Check `apps/web-frontend/src/pages/` for existing page components — list each page and its apparent purpose
   - Check `apps/web-frontend/package.json` for UI library dependencies (Material UI, Tailwind CSS, Chakra UI, Ant Design, Styled Components, CSS Modules, etc.)
   - Check `docs/` for any Figma links, wireframe files, mockup images, or design system references
   - Check `apps/web-frontend/src/` for any existing theme files, color constants, typography configs, or spacing tokens
   - Check `apps/web-frontend/src/api/client.ts` and routing files for existing API integration patterns and route definitions

2. **Report findings** to the user in a concise summary:
   - List each file/component found with a one-line description of its purpose
   - Identify the current UI library stack (if any) and its version
   - Catalogue existing components grouped by category (layout, navigation, forms, data display, feedback/modals)
   - Identify existing style patterns: CSS approach (modules, styled-components, Tailwind utility classes, plain CSS), color usage, spacing patterns
   - Flag any inconsistencies between existing components (e.g., mixed styling approaches, inconsistent naming conventions)
   - Note existing responsive design patterns or breakpoints
   - Identify any accessibility patterns already in use (aria attributes, keyboard navigation, focus management)

3. **Assess design readiness** — scan upstream deliverables for UI/UX design inputs:
   - **Requirements inputs:**
     - `docs/requirements/functional-requirements.md` — user stories defining what users need to do (drives page inventory and user flows)
     - `docs/requirements/scope-definition.md` — MVP scope defining what to design first vs. defer
     - `docs/requirements/nonfunctional-requirements.md` — performance, accessibility, and responsiveness targets
     - `docs/requirements/business-context.md` — user personas driving design decisions
   - **Design inputs:**
     - `docs/design/high-level-design.md` — frontend architecture decision (SPA/SSR, state management, routing)
     - `docs/design/data-model.md` — entity structure informing form fields and data display
     - `docs/design/api-contracts.md` — endpoints informing data fetching patterns and loading states
     - `docs/design/security-architecture.md` — auth flows, RBAC rules informing protected routes and role-based UI
   - Flag any gaps that will block specific UI/UX workstreams

4. **Ask the user** how to proceed:
   - **Start fresh** — begin from Stage 1 (Information Architecture & User Flows), treating existing frontend as implementation reference only
   - **Resume** — pick up from a specific stage if prior UI/UX design work exists in `docs/design/uiux/`
   - **Audit and formalize** — document and formalize the existing frontend's patterns into proper UI/UX design specs, then fill gaps against requirements

5. **If no UI/UX docs are found**, confirm to the user that this is a clean start and recommend beginning with `/uiux-stage1-ia-flows`.

## Output Location

Save the scan results summary to `docs/design/uiux/pre-check-report.md` with:
- Date of scan
- Existing components inventory (grouped by category)
- UI library stack and versions
- Style patterns summary
- Requirements readiness assessment (with specific gaps noted)
- Design readiness assessment (with specific gaps noted)
- Recommended next steps
- User's chosen approach
