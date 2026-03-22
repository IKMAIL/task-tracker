# Workstream 4 — Code Quality Gates

You are conducting Workstream 4 of the Project Setup & DevOps phase. This workstream answers the question: **"What automated quality checks run on every commit and PR to ensure code meets banking-grade standards?"**

This is a banking-grade MERN + TypeScript project. All decisions must account for PCI-DSS Requirement 6.3 (Develop software applications securely) and ISO 27001 Annex A.14.2 (Secure development) audit requirements.

## Pre-Requisite

Check that these documents exist and read them:
- `docs/setup/repository-structure.md` — WS1 output (branching strategy, PR rules)
- `docs/setup/local-dev-environment.md` — WS2 output (dev scripts, Docker setup)
- `docs/setup/typescript-build-config.md` — WS3 output (TypeScript config, build pipeline)
- `docs/setup/pre-check-report.md` — pre-check scan output
- `docs/design/high-level-design.md` — architecture decisions
- `docs/design/security-architecture.md` — security requirements

If any are missing, inform the user which ones and recommend completing the prerequisite workstream first. Allow them to proceed if they choose, but log missing inputs to `docs/setup/ambiguity-log.md`.

Also read these if they exist (optional but valuable):
- `docs/design/api-contracts.md` — API conventions (naming, error shapes)
- `docs/requirements/nonfunctional-requirements.md` — NFR targets (code coverage, performance)
- `docs/adr/` — all Architecture Decision Records
- Existing `.eslintrc.*`, `.prettierrc.*`, `jest.config.*` files — current quality config (if any)
- Existing `husky/`, `.lintstagedrc.*`, `.commitlintrc.*` files

## Instructions

Walk through each decision **one at a time**. For each decision, present the options, trade-offs, and a recommendation grounded in the architecture documents and banking compliance requirements. Wait for user confirmation before moving on.

### Partial Save & Resume

- After every 3 decisions, auto-save progress to `docs/setup/code-quality-gates.draft.md` with a `## Progress` section noting which decisions are completed and which is next
- If the user says "pause", "stop", or "save and continue later": save the current draft immediately and note the next decision to resume from
- On resume: read the draft file, summarise decisions made so far, continue from the next undecided item

### Handling Incomplete Answers

- If the user answers "I don't know" or is unsure, log the item to `docs/setup/ambiguity-log.md` with status **Open** and continue — do not block the workstream
- Use a sensible default tagged with **[assumed]** so the document remains complete
- If a quality gate item cannot be checked due to missing answers, mark it as **Deferred** with the specific ambiguity log item ID

### Behavioral Guardrails

- Do not rephrase or reinterpret the user's answers — quote them directly when synthesizing deliverables
- Do not invent or assume answers the user has not provided — mark gaps explicitly as "[TBD — needs stakeholder input]"
- Do not embellish — tag inferred details with "[assumed]"
- Do not introduce tooling or technologies not discussed in Phase 2 without explicitly flagging them as new additions
- Reference specific architecture decisions, NFR targets, or ADRs when justifying recommendations
- Use the project glossary consistently when it exists in `docs/requirements/business-context.md`

### Contradiction Detection

- If a linting rule contradicts the TypeScript config from WS3 (e.g., conflicting module rules), flag it
- If a code coverage target contradicts NFR targets from Phase 1, flag it
- If a quality gate contradicts an existing ADR, flag it: "ADR-[NNN] decided [X]. This approach contradicts that decision. Should we update the ADR or change the approach?"

### Decisions to Walk Through

**Decision 1: ESLint Configuration**

- Present ESLint setup options:

  | Option | Description | Pros | Cons |
  |---|---|---|---|
  | **ESLint 9 flat config** | New `eslint.config.mjs` format | Future-proof, faster, official direction | Some plugins still catching up |
  | **ESLint 8 legacy config** | `.eslintrc.json` / `.eslintrc.js` | Mature ecosystem, all plugins supported | Deprecated, will be removed |

- Rule presets to evaluate:
  - `@typescript-eslint/recommended` — baseline TypeScript rules
  - `@typescript-eslint/recommended-type-checked` — rules requiring type info (stricter)
  - `eslint-plugin-security` — detects security anti-patterns (eval, non-literal regex, etc.)
  - `eslint-plugin-no-secrets` — prevents hardcoded secrets/tokens
  - `eslint-plugin-import` — enforces import conventions, prevents circular deps

- Banking-specific rules to recommend:
  - `no-eval` — error (code injection vector)
  - `no-implied-eval` — error
  - `security/detect-object-injection` — warn
  - `security/detect-non-literal-regexp` — warn
  - `security/detect-possible-timing-attacks` — warn
  - `no-console` — warn in services (use structured logger), allow in scripts
  - `@typescript-eslint/no-explicit-any` — error (banking: implicit any already caught by strict; explicit any must be reviewed)
  - `@typescript-eslint/no-unsafe-assignment` — error
  - `@typescript-eslint/no-unsafe-member-access` — error

- Per-package overrides:
  - Frontend (React): add `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`
  - Tests: relax `@typescript-eslint/no-explicit-any` to warn, allow `no-console`
  - Scripts/seeds: allow `no-console`

- Cross-reference: check existing `.eslintrc.*` files for current config
- Probe: "Do you want to adopt ESLint 9 flat config (newer, official direction) or stick with ESLint 8 legacy config (broader plugin compatibility)?"

**Decision 2: Prettier Configuration**

- Present formatter options:

  | Setting | Recommended | Alternative | Rationale |
  |---|---|---|---|
  | `printWidth` | 100 | 80/120 | 100 balances readability and screen real estate |
  | `tabWidth` | 2 | 4 | Standard for TypeScript/JS ecosystem |
  | `useTabs` | false | true | Spaces — consistent rendering across tools |
  | `semi` | true | false | Explicit semicolons — safer for banking code |
  | `singleQuote` | true | false | Consistency with TypeScript community convention |
  | `trailingComma` | "all" | "es5" / "none" | Cleaner git diffs, ES2017+ supported |
  | `bracketSpacing` | true | false | Standard readability |
  | `arrowParens` | "always" | "avoid" | Consistent, easier to add types |
  | `endOfLine` | "lf" | "auto" | Consistent line endings across OS |

- ESLint + Prettier integration:
  - `eslint-config-prettier` — disables ESLint rules that conflict with Prettier
  - `eslint-plugin-prettier` vs separate Prettier run — recommend separate (faster, cleaner separation)
- `.prettierignore` — what to exclude (dist, node_modules, coverage, .env files)
- Probe: "Any strong formatting preferences (semicolons, quotes, print width)?"

**Decision 3: Git Hooks (Pre-commit & Pre-push)**

- Present hook tooling options:

  | Tool | Description | Pros | Cons |
  |---|---|---|---|
  | **Husky** | Git hooks manager | Mature, widely used, npm integrated | Requires `.husky/` directory |
  | **lefthook** | Fast git hooks manager | Faster (Go binary), parallel execution | Less common in JS ecosystem |
  | **simple-git-hooks** | Lightweight alternative | Zero-dep, single config | Less flexible for complex hooks |

- Hook pipeline:

  | Hook | What Runs | Scope | Fail = Block? |
  |---|---|---|---|
  | `pre-commit` | lint-staged (ESLint + Prettier on staged files) | Changed files only | Yes |
  | `commit-msg` | commitlint (conventional commits) | Commit message | Yes |
  | `pre-push` | `npm run typecheck:all` + `npm run test` | Full project | Yes |

- lint-staged configuration:
  ```json
  {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
  ```
- Banking recommendation: `pre-commit` + `commit-msg` hooks are mandatory — code that doesn't pass lint should never enter the repository. `pre-push` adds a safety net before code reaches remote
- Probe: "Should pre-push run full tests (slower but safer) or just typecheck (faster)?"

**Decision 4: Commit Message Convention**

- Present commit message standards:

  | Convention | Format | Tooling | Changelog |
  |---|---|---|---|
  | **Conventional Commits** | `type(scope): message` | commitlint, standard-version | Auto-generated |
  | **Angular convention** | `type(scope): subject` | commitlint | Auto-generated |
  | **Freeform** | Any format | None | Manual |

- Recommended types:
  - `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`, `security`
  - Note: `security` is a custom type for banking — tracks security-specific changes for audit trail

- Scopes (map to monorepo packages):
  - `identity`, `task`, `progress`, `alert`, `team`, `gateway`, `frontend`, `shared`, `infra`

- Banking recommendation: Conventional Commits with `security` type — provides auditable commit history, auto-generated changelogs, and semantic versioning support. PCI-DSS 6.4 requires change tracking
- Probe: "Do you want auto-generated changelogs from commit messages?"

**Decision 5: Test Framework Configuration**

- Present Jest configuration strategy:

  | Aspect | Recommended | Alternative | Rationale |
  |---|---|---|---|
  | Root config | `jest.config.base.ts` | `jest.config.js` | TypeScript config, shared base |
  | Transform | `ts-jest` | `@swc/jest` | `ts-jest` does type checking; `@swc/jest` is faster but skips types |
  | Coverage tool | `--coverage` (V8) | Istanbul | V8 is faster, built into Node |
  | Test location | `tests/` per service | `__tests__/` colocated | Separation matches folder structure from Phase 2 |
  | Coverage threshold | 80% (statements, branches, functions, lines) | 70% / 90% | 80% is achievable and meaningful for banking |

- Per-service Jest config template:
  ```typescript
  import type { Config } from 'jest';
  import baseConfig from '../../jest.config.base';
  export default {
    ...baseConfig,
    testMatch: ['<rootDir>/tests/**/*.test.ts'],
    coverageDirectory: '<rootDir>/coverage',
  } satisfies Config;
  ```

- Root-level scripts:
  - `npm run test` — run tests for a single package
  - `npm run test:all` — run tests across all packages
  - `npm run test:coverage` — run with coverage reporting

- Cross-reference: check NFR document for coverage targets, check existing `jest.config.*` files
- Probe: "What coverage threshold do you want to enforce? (Recommendation: 80% for banking projects)"
- Probe: "Do you need test type checking (`ts-jest`) or is speed more important (`@swc/jest`)?"

**Decision 6: Security Scanning**

- Present security scanning tools:

  | Tool | What It Does | When It Runs | Blocking? |
  |---|---|---|---|
  | `npm audit` | Checks dependencies for known vulnerabilities | Pre-push, CI | Yes (high/critical) |
  | `eslint-plugin-security` | Static analysis for security anti-patterns | Pre-commit (lint-staged) | Yes |
  | `eslint-plugin-no-secrets` | Detects hardcoded secrets/tokens | Pre-commit (lint-staged) | Yes |
  | `audit-ci` | CI-specific npm audit with configurable severity | CI only | Yes (configurable threshold) |
  | `OWASP dependency-check` | Comprehensive CVE scanning | CI (nightly) | Yes (CVSS >= 7.0) |

- Banking recommendation: All five tools — defense in depth. `eslint-plugin-security` and `eslint-plugin-no-secrets` catch issues at development time; `npm audit` and `audit-ci` catch dependency vulnerabilities; OWASP provides CVE database coverage
- Severity thresholds:
  - Block on: critical, high
  - Warn on: moderate
  - Allow: low (with tracking)
- Cross-reference: check security architecture document for security scanning requirements
- Probe: "Do you want to block CI on moderate severity vulnerabilities or only high/critical?"

**Decision 7: Code Review Standards**

- Present PR review requirements:

  | Rule | Recommended | Alternative | Rationale |
  |---|---|---|---|
  | Min reviewers | 2 | 1 | Four-eyes principle — banking compliance |
  | Required checks | lint, typecheck, test, security scan | lint + test only | All automated gates must pass |
  | PR template | Yes (checklist) | No | Consistent review process |
  | Branch protection | Required | Optional | Prevent force-push to main/develop |
  | Auto-merge | Disabled | Enabled after checks | Banking: human approval required |

- PR template checklist items:
  - [ ] Tests added/updated for changes
  - [ ] No new `any` types introduced
  - [ ] Security implications considered
  - [ ] API changes documented
  - [ ] No hardcoded secrets or credentials
  - [ ] Database migrations reviewed (if applicable)
  - [ ] Error handling follows project standards

- CODEOWNERS file:
  - Map directories to responsible teams/individuals
  - Security-sensitive paths require security team review

- Banking recommendation: 2 reviewers minimum, all automated checks must pass, PR template with security checklist. PCI-DSS 6.3.2 requires code review before deployment to production
- Cross-reference: check WS1 repository structure for branch protection rules
- Probe: "Who are the CODEOWNERS? Map directories to team members or teams."

### After All Decisions Are Made

Generate the **Code Quality Gates Document** with these sections:

#### 1. Linting Configuration

Full ESLint config with inline comments. Per-package overrides table. Rule severity table with banking justification for each rule.

#### 2. Code Formatting

Full Prettier config. `.prettierignore` contents. ESLint + Prettier integration approach.

#### 3. Git Hooks Pipeline

Hook-by-hook breakdown with commands, scope, and fail behavior. Full `lint-staged` config. Husky/lefthook setup instructions.

#### 4. Commit Convention

Conventional Commits specification with project-specific types and scopes. commitlint config. Examples of good and bad commit messages.

#### 5. Test Configuration

Base Jest config. Per-service config template. Coverage thresholds. Root-level aggregate scripts.

#### 6. Security Scanning

Tool catalogue with integration points. Severity thresholds. Blocking vs warning behavior. Audit trail requirements.

#### 7. Code Review Standards

PR requirements (reviewers, checks, template). CODEOWNERS mapping. Branch protection rules (cross-reference WS1).

#### 8. Quality Gate Summary

| Gate | Tool | Trigger | Scope | Blocking? | Banking Justification |
|---|---|---|---|---|---|
| Lint | ESLint | Pre-commit | Staged files | Yes | PCI-DSS 6.5 |
| Format | Prettier | Pre-commit | Staged files | Yes | Consistency |
| Type check | tsc --noEmit | Pre-push / CI | All packages | Yes | PCI-DSS 6.5 |
| Unit tests | Jest | Pre-push / CI | All packages | Yes | PCI-DSS 6.5 |
| Security lint | eslint-plugin-security | Pre-commit | Staged files | Yes | PCI-DSS 6.5 |
| Secret detection | eslint-plugin-no-secrets | Pre-commit | Staged files | Yes | PCI-DSS 6.5 |
| Dep vulnerabilities | npm audit / audit-ci | CI | All deps | Yes (high/critical) | PCI-DSS 6.2 |
| Code review | GitHub PR review | PR | All changes | Yes (2 approvals) | PCI-DSS 6.3.2 |

#### 9. Compliance Traceability

| Requirement | Standard | How Addressed | Evidence |
|---|---|---|---|
| Code review before production | PCI-DSS 6.3.2 | 2-reviewer PR requirement, branch protection | GitHub branch rules |
| Address common vulnerabilities | PCI-DSS 6.5 | ESLint security plugins, strict TypeScript | eslint.config.mjs |
| Patch known vulnerabilities | PCI-DSS 6.2 | npm audit in CI, severity thresholds | CI pipeline config |
| Secure development practices | ISO 27001 A.14.2 | Full quality gate pipeline | This document |
| Change tracking | PCI-DSS 6.4 | Conventional Commits, auditable git history | commitlint config |

#### 10. Key Assumptions

| ID | Assumption | Impact if Wrong | Mitigation |
|---|---|---|---|
| QA-A001 | [assumption] | [impact] | [what we'd do] |

**Present the full document** to the user for review before saving.

**Save** to `docs/setup/code-quality-gates.md`

**Recommend** the user proceed to `/setup-ci` (next workstream: WS5 — CI/CD Pipeline).

## Quality Gate

Before marking this workstream complete, confirm:
- [ ] ESLint configured with `@typescript-eslint` and security plugins
- [ ] `no-eval`, `no-implied-eval` rules set to error
- [ ] `eslint-plugin-security` and `eslint-plugin-no-secrets` included
- [ ] `@typescript-eslint/no-explicit-any` set to error
- [ ] Prettier configured with ESLint integration (no conflicts)
- [ ] Git hooks set up (pre-commit: lint-staged, commit-msg: commitlint, pre-push: typecheck + test)
- [ ] Conventional Commits enforced with project-specific types and scopes
- [ ] Jest configured with coverage thresholds (≥ 80% recommended for banking)
- [ ] Security scanning tools integrated (npm audit, eslint-plugin-security, eslint-plugin-no-secrets)
- [ ] Vulnerability severity thresholds defined (block on high/critical)
- [ ] PR review requirements defined (minimum 2 reviewers for banking)
- [ ] PR template with security checklist created
- [ ] CODEOWNERS file mapped to team structure
- [ ] Branch protection rules aligned with WS1 repository structure
- [ ] No contradictions with TypeScript config from WS3 or branching strategy from WS1
- [ ] PCI-DSS 6.2 (patch management), 6.3.2 (code review), 6.4 (change control), 6.5 (secure coding) addressed
- [ ] ISO 27001 A.14.2 (secure development) compliance evidence documented
