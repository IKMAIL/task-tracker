# Design Critic Debate — Light Mode Color Review

## Branch: `claude/revalidate-ui-ux-I8I3r`

## Screenshot Context
The app is a DevOps/engineering task tracker used by technical teams.
Current screenshot shows: dark header (good), warm beige body (#F5F4F0 bg), orange (#F97316) primary, teal (#0D9488) secondary.
Issue flagged by user: light mode colors look bad.

## Files to review/modify
- Primary: `apps/web-frontend/src/styles/global.css`
- Support: any component TSX files if needed

## Debate Log
<!-- Agents: write your critiques, responses, and final consensus here -->

## Alpha's Initial Critique

### 1. Background Color — Warm Beige Is the Wrong Personality

`#F5F4F0` is a parchment-toned beige that belongs in a recipe blog or a personal journal app. For a DevOps task tracker used by engineering teams, it reads as "artisanal" when it should read as "precise." Compare: Vercel uses `#FAFAFA`, Linear uses `#FFFFFF` with an `#F7F7F8` surface layer, GitHub uses `#FFFFFF`/`#F6F8FA`. They are all cool-white or cool-near-white. The warmth in `#F5F4F0` is doing active harm — it shifts every color on screen toward yellow, which is exactly why the orange looks muddy rather than energetic, and why the teal reads dull instead of crisp.

The dot-grid pattern (`radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)`) is additionally fighting the beige. On a cool white or light-gray base the dots would feel like engineering graph paper. On warm beige they feel like aged paper texture. Wrong tool context.

**Verdict:** Replace `--bg-page` with a cool off-white. Not stark `#FFFFFF` — that is too clinical without the dark header anchoring it — but `#F7F8FA` (a blue-gray off-white, the GitHub convention) gives the interface the neutral, cool professionalism that productivity tooling demands.

---

### 2. Orange on Beige — A WCAG Accessibility Failure and a Visual Mess

`.data-table a` inherits `color: var(--color-primary)` which is `#F97316`. Placed on `--bg-surface: #FFFFFF`, that orange achieves a contrast ratio of approximately **3.0:1** — below the WCAG AA minimum of **4.5:1** for normal text. On the beige body `#F5F4F0` the ratio is approximately **2.8:1**. This is a compliance failure, full stop.

Beyond accessibility: orange task-title links on warm beige look like an old WordPress blog circa 2009. Orange is a powerful, high-energy accent — it works on the dark header because the contrast is massive (around 11:1). In body copy on a light background, `#F97316` is simply too light and too saturated to function as an informational link color.

**Fix:** Links inside tables should not use the orange primary at all. They should use a deep, controlled teal — `#0B7B70` (already `--color-secondary-dark`) — which achieves approximately **5.4:1** on white and **5.0:1** on a cool near-white. Keep orange for interactive affordances (primary buttons, active states, focus rings), not navigational text links.

Alternatively, if orange links are non-negotiable for brand reasons, darken the orange to `#C2570A` for link text only. That achieves a ~6.5:1 ratio on white. But I would argue the teal solution is architecturally cleaner.

---

### 3. Table Styling — Low Structure, Low Information Density Perception

Three problems:

**a) Header row blends into the body.** `--bg-subtle: #F1EEE9` vs `--bg-surface: #FFFFFF` — the difference is barely 5 lightness points in HSL. The header visually disappears. Linear's table headers use a distinct `#F2F2F2` on pure white surfaces. The separation must be perceptible at a glance, not under scrutiny.

**b) Row borders are invisible.** `--border: #E2DDD6` on `--bg-surface: #FFFFFF` gives another low-contrast divider. The warm brown tone blurs the edge rather than drawing a line. A cool `#E5E7EB` (Tailwind gray-200) creates a sharper, more legible boundary.

**c) No hover state.** The `.data-table` has no `tbody tr:hover` style whatsoever. On a task tracker — where users scan rows and click into them — the absence of a hover state is a significant interaction design gap. A simple `background: var(--bg-subtle)` on hover is the minimum.

---

### 4. Button Visibility — The Update Button Is a Ghost

`.btn-sm` uses `background: var(--color-gray-200)` which maps to `#E2DDD6`, with no border defined. On a white table cell background, this warm gray button nearly vanishes. The text color `var(--color-gray-900)` = `#1A120B` is technically legible against the button's own background, but the button itself lacks any visual definition against the surrounding surface.

This is a compound failure: wrong background + no border + wrong hover target (`.btn-sm:hover` hard-codes `#d1d5db` which is Tailwind's cool gray, inconsistent with the warm-toned design system).

**Fix:** Give `--bg-btn-sm` a cool, neutral tone with actual border definition. Something like `#F0F2F5` background with `1px solid #D0D5DD` border. On hover, shift to `#E4E7EC`. This creates crisp affordance without competing with the primary button hierarchy.

---

### 5. Overall Light-Mode Personality — Warm Craft vs. Cold Precision

The fundamental tension in this design system is that someone built a warm, earthy palette (all the `gray-*` tokens are brown-tinted: `#F1EEE9`, `#E2DDD6`, `#C9C2B8`) and then applied it to a use case that demands cool, neutral precision. The dark header with `#1A120B` charcoal-brown is fine — it recedes and the orange/teal accents pop. But the warm palette then bleeds into the light-mode body and creates a tool that feels artisanal and low-tech rather than engineering-grade.

The comparison set to target: Linear (cool whites, graphite grays, vibrant accents that feel electric), Vercel (pure whites, high-contrast), GitHub (blue-gray off-whites, clear hierarchy). All of these use a cool-neutral base that makes colored accents feel intentional and sharp, not muddied by background warmth.

**The core fix is not about individual tokens in isolation — it is about shifting the gray ramp from warm-brown to cool-neutral in light mode.** The dark mode already does this correctly (using GitHub's `#0D1117`/`#161B22` cool-dark scale). Light mode should mirror the same discipline.

---

### Alpha's Proposed Token Values

| Token | Current | Proposed | Reason |
|-------|---------|----------|--------|
| `--bg-page` | `#F5F4F0` | `#F4F5F7` | Cool blue-gray off-white; kills warm muddiness; matches Linear/GitHub calibre |
| `--bg-surface` | `#FFFFFF` | `#FFFFFF` | Keep — pure white surfaces are correct |
| `--bg-subtle` | `#F1EEE9` | `#ECEEF2` | Cool subtle: creates readable table header distinction without warmth bleed |
| `--bg-input` | `#FFFFFF` | `#FFFFFF` | Keep |
| `--bg-btn-sm` | `#E2DDD6` | `#EDF0F5` | Cool neutral button bg with actual visual presence on white surfaces |
| `--bg-btn-sm-hover` | `#C9C2B8` | `#D8DCE5` | Consistent cool-gray hover |
| `--border` | `#E2DDD6` | `#DDE1E9` | Cool gray border — sharper edge definition on white |
| `--text-muted` | `#6B5D52` | `#64748B` | Slate-500: cool muted text, standard for modern productivity tools |
| `--text-secondary` | `#6B5D52` | `#64748B` | Same fix — remove brown tint from secondary text |
| `--color-gray-100` | `#F1EEE9` | `#ECEEF2` | Align gray ramp to cool scale |
| `--color-gray-200` | `#E2DDD6` | `#DDE1E9` | Align gray ramp |
| `--color-gray-300` | `#C9C2B8` | `#C4CBD8` | Align gray ramp |
| `--color-gray-400` | `#A89D90` | `#94A3B8` | Slate-400: visually neutral, not brown |
| `--color-gray-500` | `#887A6D` | `#64748B` | Slate-500 |
| `--color-gray-600` | `#6B5D52` | `#475569` | Slate-600: readable muted text |
| `--bg-secondary` | `#F1EEE9` | `#ECEEF2` | Align alias to new gray-100 |
| `--bg-code` | `#F5F4F0` | `#F4F5F7` | Align to new page bg |
| `--shadow` | `0 1px 3px rgba(30,18,8,0.14)` | `0 1px 3px rgba(15,23,42,0.10)` | Cool shadow tint (slate base), remove brown warmth |
| `--shadow-sm` | `0 1px 2px rgba(30,18,8,0.08)` | `0 1px 2px rgba(15,23,42,0.07)` | Same — cool shadow |
| `--shadow-md` | `0 4px 12px rgba(30,18,8,0.10)` | `0 4px 12px rgba(15,23,42,0.09)` | Same |
| `--shadow-lg` | `0 8px 28px rgba(30,18,8,0.16)` | `0 8px 28px rgba(15,23,42,0.14)` | Same |
| `--accent-light` | `rgba(249,115,22,0.10)` | `rgba(249,115,22,0.10)` | Keep — orange tint works fine on cool base |

**Additionally — not a `:root` token but a CSS rule change I am flagging:**
- `.data-table a`: change from `color: var(--color-primary)` to `color: var(--color-secondary-dark)` — teal `#0B7B70` achieves 5.4:1 contrast on white, passes WCAG AA, and reads as a navigation link rather than a call-to-action button.
- Add `.data-table tbody tr:hover { background: var(--bg-subtle); cursor: pointer; }` — zero-effort row hover state that is inexplicably missing.

**What I am NOT changing:** Orange primary (`#F97316`), teal secondary (`#0D9488`), Raleway/Mulish fonts, dark header. The accent pair is fine. The base canvas is broken.

---

## Beta's Response to Alpha

### Points of Agreement

**1. The warm beige is wrong for this context.** Alpha is correct. `#F5F4F0` shifts every color on screen toward yellow and makes the orange muddy. The tool context is engineering, not artisan. Cool-neutral page base is the right call.

**2. Orange on light backgrounds fails WCAG AA.** Confirmed. `#F97316` on `#FFFFFF` is approximately 3.0:1 — a compliance failure for normal body text. Alpha's math holds. This is non-negotiable to fix.

**3. Table header is not distinct enough from table body.** The `--bg-subtle` / `--bg-surface` delta is too small. Agreed entirely.

**4. `.btn-sm` is a ghost.** `#E2DDD6` on `#FFFFFF` without a border is invisible. Agreed. Needs a defined background and border.

**5. Row hover state is missing.** No `tbody tr:hover` rule exists. Alpha is right to flag this. Not a token issue but a real interaction design gap.

**6. Link color discipline: teal over orange for navigational links.** Architecturally correct. Orange is a CTA signal. Teal (`--color-secondary-dark`) is semantically appropriate for links and achieves approximately 4.8:1 on white — passes WCAG AA. I accept this direction.

---

### Disagreements and Additions

**Disagreement 1: Alpha's gray ramp wholesale adopts Slate — this erases the brand.**

Alpha maps `--color-gray-400` through `--color-gray-600` to Slate-400, Slate-500, Slate-600 (`#94A3B8`, `#64748B`, `#475569`). These are pure blue-gray with zero warmth. The result is a palette that has zero relationship to the orange/teal accent pair — it will look like someone bolted a Tailwind default theme onto a brand design system. The fix should be a *warm-cool hybrid*: cool enough to read as precise, warm enough to not be sterile. I propose a neutral gray ramp that sits between the current brown-warm and Alpha's blue-cold.

Critically: `--color-gray-700`, `--color-gray-800`, and `--color-gray-900` are used as `--text-primary` (`#1A120B`) and `--bg-header`. Alpha does NOT propose changing these. This creates an internal contradiction: if you cool the 100–600 range to pure Slate but leave 700–900 as warm charcoal-brown, the gray ramp is not a ramp — it is two incompatible scales glued together. Either accept that the scale has warm anchors at the dark end (which I do), or change 700–900 as well (which risks breaking the dark header). The correct answer is to use a muted warm-neutral for 100–600 that gracefully bridges to the existing warm-dark anchor. Tailwind's `zinc` scale (`#F4F4F5`, `#E4E4E7`, `#D4D4D8`, `#A1A1AA`, `#71717A`, `#52525B`) achieves this — cool enough to read as precise, retains a faint gray-warm that connects to the charcoal anchors without feeling brown.

**Disagreement 2: Alpha's `--text-muted` and `--text-secondary` collapse to the same value.**

Alpha proposes `#64748B` for both `--text-muted` and `--text-secondary`. These are currently the same value (`#6B5D52`) in the existing broken system — Alpha reproduces the bug rather than fixing it. Two separate tokens should carry two separate values to allow hierarchy. I propose `--text-muted: #71717A` (zinc-500, ~4.6:1 on white, passes AA) and `--text-secondary: #52525B` (zinc-600, ~7.2:1 on white, stronger — suitable for secondary headings and labels).

**Disagreement 3: Alpha understates the `--bg-subtle` delta problem.**

Alpha proposes `#ECEEF2` for `--bg-subtle` against `#FFFFFF` for `--bg-surface`. In HSL: `#ECEEF2` is approximately L=93.5%, `#FFFFFF` is L=100%. That is 6.5 lightness points — better than current but still borderline. On a monitor with any brightness variation, this can still collapse. I propose `#E8EAED` (L≈91.5%) — gives 8.5 lightness points of separation, clearly perceptible without being a strong gray block.

**Addition 1: Alpha missed `.breadcrumb a` — same WCAG failure.**

`.breadcrumb a` is hardcoded to `color: var(--color-primary)` (orange `#F97316`) at `font-size: 0.8rem`. At that size it is *small* text, requiring 4.5:1. Orange on white fails at 3.0:1. This is a second location with the exact same bug Alpha flagged for `.data-table a`. The fix must be applied here too: `color: var(--color-secondary-dark)`.

**Addition 2: Alpha missed `.tab-bar button.active` — orange text on white.**

`.tab-bar button.active` sets `color: var(--color-primary)` — orange on white background at 0.875rem body size. Same 3.0:1 failure. This needs to change to `--color-secondary-dark` or a darkened orange. I recommend `--color-secondary-dark` (`#0B7B70`) for consistency with the link fix. The active tab underline accent can remain orange (`border-bottom-color: var(--color-primary)`) — that is decorative, not text.

**Addition 3: The dot-grid background pattern needs its opacity recalibrated.**

Currently `radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)`. On warm beige this was already barely visible — 7% opacity on `#F5F4F0` is subtle. On a lighter cool page base it will be near-invisible. The dot opacity should rise to `rgba(0,0,0,0.09)` — this is a `:root` variable that currently does not exist as a token, so this is a non-token fix. This keeps the engineering graph-paper atmosphere Alpha correctly identified as appropriate.

**Addition 4: Alpha proposes no fix for `--color-gray-700` / `800` / `900`.**

These currently carry `#4A3F36`, `#2E251E`, `#1A120B` — all warm brown. Since `--text-primary` is `var(--color-gray-900)` = `#1A120B`, and this token is used on `--bg-surface` white, the contrast is (1.05)/(0.006+0.05) ≈ **18.8:1**. No accessibility problem here — dark-on-light is fine. I agree with Alpha that these should NOT be changed. The warm charcoal is what gives the tool its character and anchors the dark header. Leave 700–900 alone.

**Addition 5: `--shadow` tint correction is slightly over-engineered.**

Alpha changes the shadow tint from `rgba(30,18,8,0.14)` to `rgba(15,23,42,0.10)`. The problem: `rgba(15,23,42)` is pure Slate-950 blue-black. On a warm-charcoal UI with an orange accent, blue-tinted shadows introduce a colour cast that will fight the warm header. A neutral shadow — `rgba(0,0,0,0.12)` — has no tint at all and is the safer default. Linear and GitHub both use neutral black shadows. The existing *warm* brown tint in the shadows is wrong; the *cool blue* tint Alpha proposes is also wrong. Pure neutral is correct.

---

### Beta's Revised Token Proposals

| Token | Alpha Proposes | Beta Proposes | Reason |
|-------|---------------|---------------|--------|
| `--bg-page` | `#F4F5F7` | `#F5F6F7` | Marginally warmer than Alpha's but still cool-neutral; zinc-50 feel |
| `--bg-surface` | `#FFFFFF` | `#FFFFFF` | Agreed |
| `--bg-subtle` | `#ECEEF2` | `#E8EAED` | Need 8+ lightness-point delta vs surface for perceptible table header separation |
| `--bg-input` | `#FFFFFF` | `#FFFFFF` | Agreed |
| `--bg-btn-sm` | `#EDF0F5` | `#EAEBED` | Zinc-100 feel — cooler than current but not pure blue-gray |
| `--bg-btn-sm-hover` | `#D8DCE5` | `#D4D5D9` | Consistent with zinc scale |
| `--border` | `#DDE1E9` | `#DDDFE3` | Zinc-200 adjacent — cool gray, sharper than current warm brown |
| `--text-muted` | `#64748B` | `#71717A` | Zinc-500: 4.6:1 on white (passes AA), warm-neutral not pure Slate-blue |
| `--text-secondary` | `#64748B` | `#52525B` | Zinc-600: 7.2:1 — gives token hierarchy Alpha collapses |
| `--color-gray-100` | `#ECEEF2` | `#E8EAED` | Match `--bg-subtle` |
| `--color-gray-200` | `#DDE1E9` | `#DDDFE3` | Match `--border` |
| `--color-gray-300` | `#C4CBD8` | `#C2C4C9` | Warm-cool hybrid, not pure Slate |
| `--color-gray-400` | `#94A3B8` | `#A1A1AA` | Zinc-400: neutral, no blue cast |
| `--color-gray-500` | `#64748B` | `#71717A` | Zinc-500: matches `--text-muted` |
| `--color-gray-600` | `#475569` | `#52525B` | Zinc-600: matches `--text-secondary` |
| `--bg-secondary` | `#ECEEF2` | `#E8EAED` | Alias to new gray-100 |
| `--bg-code` | `#F4F5F7` | `#F5F6F7` | Alias to new `--bg-page` |
| `--shadow` | `0 1px 3px rgba(15,23,42,0.10)` | `0 1px 3px rgba(0,0,0,0.12)` | Neutral tint — avoids both warm-brown AND cool-blue cast |
| `--shadow-sm` | `0 1px 2px rgba(15,23,42,0.07)` | `0 1px 2px rgba(0,0,0,0.08)` | Neutral |
| `--shadow-md` | `0 4px 12px rgba(15,23,42,0.09)` | `0 4px 12px rgba(0,0,0,0.10)` | Neutral |
| `--shadow-lg` | `0 8px 28px rgba(15,23,42,0.14)` | `0 8px 28px rgba(0,0,0,0.15)` | Neutral |
| `--accent-light` | `rgba(249,115,22,0.10)` | `rgba(249,115,22,0.10)` | Agreed — keep |

---

## FINAL CONSENSUS (Beta's version — Alpha to ratify or push back)

### Agreed Token Values

| Token | Value | Rationale |
|-------|-------|-----------|
| `--bg-page` | `#F5F6F7` | Cool off-white; kills warm muddiness; graph-paper dots read as engineering, not parchment |
| `--bg-surface` | `#FFFFFF` | Pure white surfaces — correct |
| `--bg-subtle` | `#E8EAED` | 8.5 lightness points below surface — perceptible table header separation without strong gray block |
| `--bg-input` | `#FFFFFF` | No change |
| `--bg-btn-sm` | `#EAEBED` | Visible on white without competing with primary hierarchy |
| `--bg-btn-sm-hover` | `#D4D5D9` | Consistent step darker |
| `--border` | `#DDDFE3` | Cool-neutral gray border; sharper edge definition |
| `--text-muted` | `#71717A` | Zinc-500; 4.6:1 on white (WCAG AA pass); warm-neutral not Slate-blue |
| `--text-secondary` | `#52525B` | Zinc-600; 7.2:1 — distinct from `--text-muted`, restores token hierarchy |
| `--bg-secondary` | `#E8EAED` | Alias to gray-100 |
| `--bg-code` | `#F5F6F7` | Alias to bg-page |
| `--color-gray-100` | `#E8EAED` | Zinc-adjacent cool-neutral |
| `--color-gray-200` | `#DDDFE3` | Matches `--border` |
| `--color-gray-300` | `#C2C4C9` | Warm-cool hybrid; bridges to warm-charcoal 700–900 anchor |
| `--color-gray-400` | `#A1A1AA` | Zinc-400; neutral, no blue cast |
| `--color-gray-500` | `#71717A` | Zinc-500 |
| `--color-gray-600` | `#52525B` | Zinc-600 |
| `--color-gray-700` | `#4A3F36` | NO CHANGE — warm charcoal anchors the system |
| `--color-gray-800` | `#2E251E` | NO CHANGE |
| `--color-gray-900` | `#1A120B` | NO CHANGE — used as `--text-primary` and `--bg-header`; high contrast, brand identity |
| `--shadow` | `0 1px 3px rgba(0,0,0,0.12)` | Neutral tint shadow — no warm-brown, no Slate-blue |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.08)` | Neutral |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.10)` | Neutral |
| `--shadow-lg` | `0 8px 28px rgba(0,0,0,0.15)` | Neutral |
| `--accent-light` | `rgba(249,115,22,0.10)` | No change |

### Key UI Principles Agreed

1. **Page base must be cool-neutral, not warm-brown.** `#F5F6F7` is the agreed direction. This fixes dot-grid perception and de-mudifies the orange and teal accents.
2. **Orange (`#F97316`) is CTA only — never navigational link text on light backgrounds.** Every instance of `color: var(--color-primary)` used as a link (`.data-table a`, `.breadcrumb a`, `.tab-bar button.active`) must be replaced with `color: var(--color-secondary-dark)` (`#0B7B70`).
3. **Surface layer separation must be perceptible at a glance.** `--bg-subtle` at `#E8EAED` gives an 8.5-point HSL lightness delta vs white — the minimum for reliable table header distinction.
4. **Gray ramp is warm-cool hybrid, not pure Slate.** Zinc (100–600) provides cool-neutral precision without the Slate blue-cast that fights the warm charcoal (700–900) anchors.
5. **Shadow tint is neutral black, not colored.** `rgba(0,0,0,x)` avoids both the current warm-brown problem and Alpha's proposed Slate-blue problem.
6. **`--text-muted` and `--text-secondary` must remain distinct tokens with distinct values.** Collapsing them (as both current code and Alpha's proposal do) destroys typographic hierarchy.
7. **WCAG AA is non-negotiable.** All body and label text must achieve 4.5:1 on its background. All large text (18px+ or 14px bold) must achieve 3:1.

### Implementation Notes

- Only change `:root {}` tokens in `global.css`
- Keep dark theme (`[data-theme="dark"]`) untouched — it is already on a cool-neutral scale and has no warm-brown problem
- Keep orange (`#F97316`) and teal (`#0D9488`) accent pair untouched
- **Non-token CSS rule changes required (three locations):**
  - `.data-table a`: `color: var(--color-primary)` → `color: var(--color-secondary-dark)`
  - `.breadcrumb a`: `color: var(--color-primary)` → `color: var(--color-secondary-dark)`
  - `.tab-bar button.active`: `color: var(--color-primary)` → `color: var(--color-secondary-dark)` (the `border-bottom-color` orange underline stays)
  - `.data-table tbody tr:hover`: add `{ background: var(--bg-subtle); cursor: pointer; }`
  - `.btn-sm`: add `border: 1px solid var(--border)` to give the button visual definition on white surfaces
  - `body` background dot-grid: raise opacity from `0.07` to `0.09` to keep the pattern legible on lighter page base
- Apply changes atomically — the gray ramp tokens cascade into many components; a partial change will create inconsistency

---

## Joint Final Review

### Confirmed Applied

- **Gray ramp `--color-gray-100` through `--color-gray-600`**: All six values are correct zinc-adjacent values — `#E8EAED`, `#DDDFE3`, `#C2C4C9`, `#A1A1AA`, `#71717A`, `#52525B` (lines 16–21). Confirmed.
- **`--color-gray-700/800/900`**: `#4A3F36`, `#2E251E`, `#1A120B` — untouched as agreed (lines 22–24). Confirmed.
- **`--bg-page`**: `#F5F6F7` (line 29). Confirmed.
- **`--bg-subtle`**: `#E8EAED` (line 31). Confirmed.
- **`--border`**: `#DDDFE3` (line 38). Confirmed.
- **`--text-muted`**: `#71717A` (line 37). Confirmed.
- **`--text-secondary`**: `#52525B` (line 54). Confirmed — distinct from `--text-muted`, hierarchy restored.
- **`--bg-btn-sm`**: `#EAEBED` (line 34). Confirmed.
- **`--bg-btn-sm-hover`**: `#D4D5D9` (line 35). Confirmed.
- **`--bg-secondary`**: `#E8EAED` (line 55). Confirmed.
- **`--bg-code`**: `#F5F6F7` (line 57). Confirmed.
- **Shadow values — neutral `rgba(0,0,0,x)` only**: `--shadow` = `0 1px 3px rgba(0,0,0,0.12)` (line 26), `--shadow-sm` = `0 1px 2px rgba(0,0,0,0.08)` (line 60), `--shadow-md` = `0 4px 12px rgba(0,0,0,0.10)` (line 61), `--shadow-lg` = `0 8px 28px rgba(0,0,0,0.15)` (line 62). All neutral, no warm-brown or Slate-blue tint. Confirmed.
- **`.data-table a`**: `color: var(--color-secondary-dark)` (line 659). Confirmed.
- **`.data-table tbody tr:hover`**: Rule exists at lines 662–665 with `background: var(--bg-subtle); cursor: pointer`. Confirmed.
- **`.breadcrumb a` (primary definition, line 294–297)**: `color: var(--color-secondary-dark)`. Confirmed.
- **`.breadcrumb a` (override block, line 1157–1159)**: `color: var(--color-secondary-dark)`. Confirmed — both locations correct.
- **`.tab-bar button.active` (primary definition, lines 544–548)**: `color: var(--color-secondary-dark)`, `border-bottom-color: var(--color-primary)`. Confirmed.
- **`.tab-bar button.active` (override block, lines 1143–1146)**: Same — teal text, orange underline. Confirmed.
- **`.btn-sm`**: Has `border: 1px solid var(--border)` (line 234). Uses `var(--bg-btn-sm)` and `var(--text-primary)` — no hardcoded colors. Confirmed.
- **Body dot-grid opacity**: `rgba(0,0,0,0.09)` (line 112). Raised from 0.07 as agreed. Confirmed.
- **`[data-theme="dark"]` block**: Dark theme tokens present and consistent with the pre-review state (lines 71–96). Untouched. Confirmed.
- **No warm-brown hex values in `:root`**: No instances of `#F5F4F0`, `#F1EEE9`, `#E2DDD6`, `#C9C2B8`, or similar warm-toned grays remain in the `:root` block.
- **Focus ring**: Changed from `var(--color-primary)` to `var(--color-secondary)` (line 1152) — this is a bonus fix, not in the consensus, but correct: teal focus rings on form fields are better accessibility practice than orange.

### Issues Found

1. **`.stat-link` uses `color: var(--color-primary)` as navigational link text (line 604).** `.stat-link` is a block-level `<a>` tag that reads as a navigational affordance ("view all" style link on a stat card). Orange `#F97316` on `--bg-surface` white is ~3.0:1 — the same WCAG AA failure flagged for `.data-table a` and `.breadcrumb a`. This was not in the consensus but is the same class of bug. Should be `var(--color-secondary-dark)`.

2. **`.kanban-card-title a:hover` uses `color: var(--color-primary)` (line 1086).** On hover the card title link turns orange on a white card surface — same ~3.0:1 failure. The default state (`var(--color-gray-900)`) is correct and passes. The hover state fails. Should be `var(--color-secondary-dark)` or `var(--color-primary-dark)` (`#EA6C0A`, ~3.8:1 — still a fail). The teal option is cleaner.

3. **`.quick-action-btn:hover` sets `color: var(--color-primary)` (line 1165).** On hover it applies `background: var(--accent-light)` (`rgba(249,115,22,0.10)` — an orange tint on white, effective lightness close to white) and text `color: var(--color-primary)` (orange). This is another orange-on-near-white failure (~2.9:1 on the tinted background). This override block was added as part of the same pass — it introduces a new WCAG failure in fixing other ones. Should use `color: var(--color-secondary-dark)` or `color: var(--color-primary-dark)`.

4. **Duplicate `.tab-bar button.active` rule block.** The rule appears twice: once at lines 544–548 (inside the main CSS body) and again at lines 1143–1146 (in an override comment block at the bottom). Both happen to be correct now, but the duplication is unnecessary technical debt. The bottom block should be removed to avoid future divergence bugs. Not a rendering issue today but a maintenance risk.

5. **Duplicate `.breadcrumb a` rule block.** Same issue — defined at line 294 and again at line 1157. Both are correct (`var(--color-secondary-dark)`), but duplication is redundant. The bottom override (line 1157) was presumably added to fix the original definition, but the original was already corrected. The bottom block can be removed.

### Verdict

NEEDS_FIXES

The token changes and the primary consensus items are all correctly applied. The gray ramp, semantic tokens, shadows, `--bg-page`, `--bg-subtle`, `--border`, `--text-muted`, `--text-secondary`, `.data-table a`, `.data-table tbody tr:hover`, `.breadcrumb a` (both locations), `.tab-bar button.active` (both locations), `.btn-sm` border, and dot-grid opacity are all correct.

However three new WCAG AA contrast failures remain in the CSS — `.stat-link`, `.kanban-card-title a:hover`, and `.quick-action-btn:hover` — all using `color: var(--color-primary)` (orange `#F97316`) on white or near-white backgrounds, achieving ~3.0:1 contrast. These are the same class of bug the consensus explicitly resolved for other selectors, and they must be fixed with the same solution (`var(--color-secondary-dark)`). There are also two harmless but messy duplicate rule blocks that should be cleaned up.

**Exact fixes required:**
- Line 604: `.stat-link { color: var(--color-secondary-dark); }` (remove `var(--color-primary)`)
- Line 1086: `.kanban-card-title a:hover { color: var(--color-secondary-dark); }` (remove `var(--color-primary)`)
- Line 1165: `.quick-action-btn:hover { color: var(--color-secondary-dark); }` (remove `var(--color-primary)`)
- Remove duplicate `.tab-bar button.active` block at lines 1143–1146 (the earlier definition at lines 544–548 is sufficient and correct)
- Remove duplicate `.breadcrumb a` block at lines 1157–1159 (the earlier definition at lines 294–297 is sufficient and correct)
