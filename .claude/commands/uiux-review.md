# UI/UX Design — Phase Gate Validation & Sign-Off

You are conducting the final validation of the UI/UX Design phase. The goal is to verify completeness, consistency, and quality across all five stages before proceeding to development.

## Pre-Requisite

All stage outputs must exist in `docs/design/uiux/`. List which are present and which are missing:

| Deliverable | Expected File | Status |
|---|---|---|
| Pre-check report | `docs/design/uiux/pre-check-report.md` | Present/Missing |
| IA & User Flows | `docs/design/uiux/ia-user-flows.md` | Present/Missing |
| Wireframes | `docs/design/uiux/wireframes.md` | Present/Missing |
| Design System | `docs/design/uiux/design-system.md` | Present/Missing |
| Hi-Fi Specifications | `docs/design/uiux/hifi-specifications.md` | Present/Missing |
| Handoff Package | `docs/design/uiux/developer-handoff.md` | Present/Missing |

If any **stage output** (IA & User Flows, Wireframes, Design System, Hi-Fi Specifications, Handoff) is missing, recommend completing the relevant stage before proceeding. Allow the user to continue if they choose, but flag it as a risk.

## Instructions

This phase is a structured review, not a Q&A. Work through each check systematically and present findings to the user.

### Check 1: Cross-Stage Completeness

Verify that every Must-Have user story has complete UI coverage across all stages:

- Every Must-Have user story has: a flow (Stage 1), a wireframe (Stage 2), a hi-fi spec (Stage 4), and a handoff entry (Stage 5)
- Report any gaps as a table:

| User Story | Flow? | Wireframe? | Hi-Fi? | Handoff? |
|---|---|---|---|---|
| [Story ID — Title] | Yes/No | Yes/No | Yes/No | Yes/No |

Present all gaps to the user. Do not mark this check complete until the user either resolves gaps or explicitly defers them.

### Check 2: Design System Coverage

Verify bidirectional coverage between the design system and hi-fi specs:

- Every component in the design system inventory is used in at least one hi-fi spec
- Every component referenced in hi-fi specs exists in the design system

Report findings in two tables:

**Orphaned Components** (in design system but not used in any hi-fi spec):
| Component | Category | Action Needed |
|---|---|---|

**Missing Components** (referenced in hi-fi specs but not in design system):
| Component | Referenced In | Action Needed |
|---|---|---|

### Check 3: Consistency Audit

Read all stage documents and check for consistency:

- [ ] Navigation placement is consistent across all screens
- [ ] Spacing, typography, and color tokens are used consistently (no hardcoded values in hi-fi specs)
- [ ] Form patterns are consistent (label placement, error placement, button alignment)
- [ ] Empty states follow a consistent pattern
- [ ] Loading states follow a consistent pattern
- [ ] Error states follow a consistent pattern

Present all inconsistencies to the user with specific file references. Do not mark this check complete until the user either resolves conflicts or explicitly defers them.

### Check 4: Accessibility Audit

Verify WCAG AA compliance across all screen specifications:

- [ ] All color combinations meet WCAG AA contrast (4.5:1 body text, 3:1 large text)
- [ ] Every interactive element has keyboard access documented
- [ ] Focus order documented for every screen
- [ ] ARIA roles specified for all non-semantic elements
- [ ] Form fields have associated labels (not just placeholders)
- [ ] Error messages use aria-describedby
- [ ] Modal focus trapping documented
- [ ] Skip navigation links specified
- [ ] Touch targets meet minimum 44x44px on mobile breakpoints

Report all violations with severity (Critical/Major/Minor) and specific screen references.

### Check 5: Requirements Traceability

Cross-reference against `docs/requirements/scope-definition.md`:

- Every Must-Have story has complete UI coverage (flow + wireframe + hi-fi + handoff)
- Every Should-Have story is either covered or explicitly deferred with rationale
- No screens exist without a corresponding user story (gold-plating check)

Report findings:

| Category | Count | Details |
|---|---|---|
| Must-Have stories with full coverage | N/N | — |
| Must-Have stories with gaps | N | [list story IDs] |
| Should-Have stories covered | N/N | — |
| Should-Have stories deferred | N | [list with rationale] |
| Screens without user stories | N | [list screens — gold-plating] |

### Check 6: Developer Readiness

Verify the handoff package is complete for development:

- [ ] Component-to-code mapping is complete (every design system component has a suggested React component name)
- [ ] Screen-to-route mapping is complete (every screen maps to a React Router route)
- [ ] All assets identified (icons, images, fonts)
- [ ] Interaction notes present for non-obvious behaviors (animations, transitions, drag-and-drop)
- [ ] Responsive breakpoints documented with layout changes per breakpoint
- [ ] API integration points noted (which API endpoint feeds each screen/component)

### Phase Gate Checklist

Present this checklist and go through each item with the user:

```
□ IA and all user flows documented and reviewed
□ Wireframes completed for every screen in MVP scope
□ Design system defined (tokens, typography, component inventory)
□ Component library selected and documented in ADR
□ Hi-fi specifications complete including all states and breakpoints
□ Stakeholder review completed — all Must-Have screens approved
□ Developer handoff package complete
□ Accessibility requirements annotated
□ No open review comments on any Must-Have screen
```

### Formal Sign-Off

Ask the user to confirm:
- "Do you approve the UI/UX Design baseline?"
- Record the approval with date and any conditions

### After Completion

Generate the **UI/UX Design Sign-Off Report** and save to `docs/design/uiux/uiux-signoff.md`:

```
UI/UX Design — Sign-Off Report
===============================
Date:              [date]
Reviewer(s):       [names/roles]

Stages Completed:
  Stage 1 — IA & User Flows:       [Complete/Incomplete]
  Stage 2 — Wireframes:             [Complete/Incomplete]
  Stage 3 — Design System:          [Complete/Incomplete]
  Stage 4 — Hi-Fi Specifications:   [Complete/Incomplete]
  Stage 5 — Review & Handoff:       [Complete/Incomplete]

Check Results:
  Cross-Stage Completeness:   [Passed/Failed — N gaps found]
  Design System Coverage:     [Passed/Failed — N orphaned, N missing]
  Consistency Audit:          [Passed/Failed — N inconsistencies found]
  Accessibility Audit:        [Passed/Failed — N violations found]
  Requirements Traceability:  [Passed/Failed — N gaps found]
  Developer Readiness:        [Passed/Failed — N items incomplete]

Phase Gate Checklist:  [N/9 items passed]

Approval Status:       Approved / Conditional / Rejected
Conditions:            [list if any]

Next Steps:
  Step 4 — Project Setup:      [Ready/Blocked (reason)]
  Step 5 — Development:        [Ready/Blocked (reason)]

All deliverables saved to: docs/design/uiux/
```

## Quality Gate

UI/UX Design phase is complete when:
- [ ] All 6 checks completed and documented
- [ ] Phase gate checklist has all items checked
- [ ] No Must-Have user story lacks UI coverage
- [ ] Accessibility audit shows no WCAG AA violations
- [ ] Sign-off document saved with clear status
- [ ] All design system components are traceable to screens
- [ ] No contradictions between stages remain unresolved
