# Workstream 1 — Repository Structure & Branching Strategy

You are conducting Workstream 1 of the Project Setup & DevOps phase. This workstream answers the question: **"How is the codebase organized and how does code flow from developer to production?"**

This is a banking-grade MERN + TypeScript project. All decisions must account for PCI-DSS Requirement 6 (Develop and maintain secure systems) and ISO 27001 Annex A.12 (Operations security) audit requirements.

## Pre-Requisite

Check that these documents exist and read them:
- `docs/setup/pre-check-report.md` — pre-check scan output (what already exists)
- `docs/design/folder-structure.md` — agreed folder structure from Phase 2 WS5
- `docs/design/high-level-design.md` — architecture decisions (service boundaries, communication patterns)
- `docs/design/security-architecture.md` — security requirements (secrets management, access control, compliance)

If any are missing, inform the user which ones and recommend completing the prerequisite phase first. Allow them to proceed if they choose, but log missing inputs to `docs/setup/ambiguity-log.md`.

Also read these if they exist (optional but valuable):
- `docs/requirements/technical-constraints.md` — technology choices, infrastructure decisions
- `docs/requirements/nonfunctional-requirements.md` — performance, availability, compliance targets
- `docs/design/api-contracts.md` — service inventory and endpoint catalogue
- `docs/adr/` — all Architecture Decision Records
- Existing root `package.json` — current workspace config (if any)

## Instructions

Walk through each decision **one at a time**. For each decision, present the options, trade-offs, and a recommendation grounded in the architecture documents and banking compliance requirements. Wait for user confirmation before moving on.

### Partial Save & Resume

- After every 3 decisions, auto-save progress to `docs/setup/repository-structure.draft.md` with a `## Progress` section noting which decisions are completed and which is next
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
- Do not introduce tooling or technologies not discussed in Phase 2/Phase 5 without explicitly flagging them as new additions
- Reference specific architecture decisions, NFR targets, or ADRs when justifying recommendations (e.g., "Given the microservices architecture from HLD Decision 1...")
- Use the project glossary consistently when it exists in `docs/requirements/business-context.md`

### Contradiction Detection

- If a proposed repo structure contradicts the Phase 2 folder structure (`docs/design/folder-structure.md`), flag it: "The Phase 2 folder structure specifies [X], but this approach uses [Y]. Which should we follow?"
- If a branching strategy contradicts the security architecture's change control requirements, flag it: "The security architecture requires [X], but this branching model provides [Y]. How should we reconcile?"
- If a decision contradicts an existing ADR, flag it: "ADR-[NNN] decided [X]. This approach contradicts that decision. Should we update the ADR or change the approach?"
- If a decision contradicts the INSTRUCTIONS.md Git conventions (e.g., `Ikmail/` branch prefix, branching strategy), flag it before proceeding

### Decisions to Walk Through

**Decision 1: Monorepo Tooling**

- Present a trade-off table for the realistic options:

  | Criteria | npm workspaces | pnpm workspaces | Turborepo | Nx |
  |---|---|---|---|---|
  | Speed (install) | Moderate | Fast (content-addressable store) | N/A (build layer) | N/A (build layer) |
  | Speed (build/test) | Sequential | Sequential | Parallel + cache | Parallel + cache |
  | Complexity | Low | Low | Medium | High |
  | Lockfile audit | Single `package-lock.json` | Single `pnpm-lock.yaml` | Inherits package manager | Inherits package manager |
  | Team familiarity | High (npm is default) | Medium | Medium | Low |
  | CI integration | Native | Requires pnpm install step | Requires turbo install step | Requires nx install step |
  | Banking audit | Simple — one tool, one lockfile | Simple — one tool, one lockfile | Extra dependency to audit | Extra dependency to audit |

- Cross-reference: check `package.json` for existing workspace config; check `docs/design/folder-structure.md` for agreed layout
- Banking recommendation: simpler is better — fewer tools means fewer attack surfaces and simpler audits. If the existing project uses npm workspaces and it works, recommend keeping it unless there is a specific pain point
- Probe: "How many developers will work concurrently? Are build times currently a bottleneck?"
- Probe: "Does your CI environment have any restrictions on package manager versions?"

**Decision 2: Repository Layout**

- Map the Phase 2 folder structure (`docs/design/folder-structure.md`) to actual directories
- Verify that every service from the HLD component catalogue has a corresponding directory:
  - `services/` — all backend microservices
  - `apps/` — frontend applications
  - `shared/` — shared packages (utils, types, constants)
- Shared types strategy — present options:
  - **Option A:** `shared/types/` package published to workspace — clean separation, explicit versioning
  - **Option B:** TypeScript path aliases (`@shared/types`) — simpler, no publish step, but tighter coupling
  - **Option C:** Both — shared package for runtime code, path aliases for type-only imports
- Documentation directory layout:
  ```
  docs/
  ├── requirements/    # Phase 1 outputs
  ├── design/          # Phase 2 outputs
  │   └── uiux/        # Phase 3 outputs
  ├── adr/             # Architecture Decision Records
  └── setup/           # Phase 4 outputs (this phase)
  ```
- Scripts directory:
  ```
  scripts/
  ├── seed.ts          # Database seeding
  ├── migrate.ts       # Schema migrations
  ├── bootstrap.sh     # First-time project setup
  └── generate-env.sh  # Generate .env from .env.example
  ```
- Cross-reference: verify every service port from the HLD component catalogue matches the layout
- Probe: "Are there any services or shared packages not yet in the folder structure that should be added?"

**Decision 3: Branching Strategy**

- Present three strategies with banking compliance analysis:

  | Criteria | Gitflow | GitHub Flow | Trunk-Based |
  |---|---|---|---|
  | Audit trail | Excellent — release branches, tags, merge commits | Good — PR-based, but linear | Requires feature flags for audit |
  | PCI-DSS 6.4 (change control) | Native — release gating, hotfix process | Requires discipline | Requires strong CI maturity |
  | ISO 27001 A.12.1.2 (change mgmt) | Built-in separation of concerns | Adequate with branch protection | Requires compensating controls |
  | Complexity | High — multiple long-lived branches | Low — one main branch + features | Low — but needs CI investment |
  | Release cadence | Scheduled releases | Continuous delivery | Continuous delivery |
  | Hotfix process | Dedicated hotfix branches | Feature branch off main | Feature flag or short-lived branch |
  | Team size fit | Medium-large teams | Small-medium teams | Teams with mature CI/CD |

- **Recommended for banking:** Gitflow — provides the clearest audit trail, explicit release gating, and separation between development and production code. Auditors can trace every change through feature → develop → release → main
- Branch naming convention (cross-reference INSTRUCTIONS.md `Ikmail/` prefix requirement):
  - Feature branches: `Ikmail/feature/PROJ-NNN-short-description`
  - Bugfix branches: `Ikmail/bugfix/PROJ-NNN-short-description`
  - Hotfix branches: `Ikmail/hotfix/PROJ-NNN-short-description`
  - Release branches: `release/vX.Y.Z`
  - Long-lived branches: `main`, `develop`
- Flow diagram:
  ```
  feature/* ──PR──> develop ──PR──> release/* ──PR──> main
                                        │
                                    hotfix/* ──PR──> main + cherry-pick to develop
  ```
- Probe: "What is your expected release cadence? (weekly, bi-weekly, monthly, on-demand)"
- Probe: "Who has authority to approve merges to main? Is there a change advisory board (CAB)?"

**Decision 4: Branch Protection Rules**

- For each branch type, specify protection rules:

  | Branch | Required Approvals | CI Must Pass | Force Push | Who Can Merge | Additional Rules |
  |---|---|---|---|---|---|
  | `main` | 2 (tech lead + senior) | Yes — full pipeline | Blocked | Tech lead, release manager | Signed commits required; linear history |
  | `develop` | 1 (any team member) | Yes — build + unit tests | Blocked | Any approved reviewer | Squash merge recommended |
  | `release/*` | 2 (tech lead + QA lead) | Yes — full pipeline + security scan | Blocked | Release manager only | Tag on merge to main |
  | `feature/*` | 1 | Yes — build + lint + unit tests | Allowed (author only) | PR author after approval | Auto-delete after merge |
  | `hotfix/*` | 2 (tech lead + senior) | Yes — full pipeline | Blocked | Tech lead only | Must merge to both main and develop |

- PCI-DSS Requirement 6.4 compliance evidence:
  - All changes to production code require documented review (PR approval)
  - Separation of duties: developer cannot approve their own code to main
  - Test evidence: CI pipeline results attached to every PR
  - Change documentation: PR description serves as change record
- ISO 27001 A.12.1.2 compliance evidence:
  - Formal change management process (Gitflow with branch protection)
  - Authorization controls (required approvals per branch type)
  - Audit trail (merge commits, PR history, CI logs)
- Probe: "Does your Git hosting platform support all these protection rules natively? (GitHub, GitLab, Bitbucket)"
- Probe: "Do you require signed commits (GPG/SSH) for compliance?"

**Decision 5: PR Template & Review Checklist**

- Present a PR template structure:
  ```markdown
  ## Summary
  <!-- Brief description of what this PR does and why -->

  ## Ticket Reference
  <!-- Link to JIRA/issue tracker: PROJ-NNN -->

  ## Type of Change
  - [ ] Feature (new functionality)
  - [ ] Bug fix (non-breaking fix)
  - [ ] Hotfix (production-critical fix)
  - [ ] Refactor (no functional change)
  - [ ] Documentation
  - [ ] Infrastructure / DevOps
  - [ ] Dependency update

  ## Checklist
  - [ ] TypeScript strict mode — no `any` types introduced
  - [ ] All new/modified code has unit tests
  - [ ] ESLint passes with zero warnings
  - [ ] No secrets, credentials, or PII in code or comments
  - [ ] API changes are backward-compatible (or breaking change is documented)
  - [ ] Database changes have migration scripts
  - [ ] Environment variable changes are reflected in `.env.example`
  - [ ] Relevant documentation is updated

  ## Security Checklist (for changes touching auth, data access, or API endpoints)
  - [ ] Input validation on all new endpoints
  - [ ] Authorization checks in place (RBAC)
  - [ ] No sensitive data logged or exposed in responses
  - [ ] SQL/NoSQL injection prevention verified
  - [ ] Rate limiting considered for public endpoints

  ## Testing
  <!-- How was this tested? Include test output or screenshots -->

  ## Deployment Notes
  <!-- Any special deployment steps, env var changes, or migration requirements -->
  ```

- Mandatory reviewers by area (cross-reference CODEOWNERS):
  - `services/identity-service/` → security team + backend lead
  - `services/*/` → backend lead
  - `apps/web-frontend/` → frontend lead
  - `k8s/`, `openshift/`, `Jenkinsfile` → DevOps lead
  - `shared/` → backend lead + frontend lead
  - `docs/` → tech lead (advisory, non-blocking)
- PCI-DSS evidence: every change to production has a documented review checklist completed by the reviewer
- Probe: "Are there additional compliance-specific checklist items your audit team requires?"
- Probe: "Should security-sensitive paths (auth, payments, PII) require an additional security reviewer?"

**Decision 6: Repository Hygiene**

- **`.gitignore`** — present a comprehensive template for Node.js + TypeScript + Docker + IDE:
  - Node: `node_modules/`, `dist/`, `build/`, `coverage/`, `*.tsbuildinfo`
  - Environment: `.env`, `.env.local`, `.env.*.local` (but NOT `.env.example`)
  - IDE: `.vscode/settings.json`, `.idea/`, `*.swp`, `.DS_Store`
  - Docker: `docker-compose.override.yml` (local overrides)
  - OS: `.DS_Store`, `Thumbs.db`
  - Logs: `*.log`, `npm-debug.log*`
  - Banking-specific: `*.pem`, `*.key`, `*.cert`, `credentials/`, `secrets/`

- **`.gitattributes`** — line endings and binary handling:
  ```
  * text=auto eol=lf
  *.png binary
  *.jpg binary
  *.ico binary
  *.pdf binary
  *.lock linguist-generated
  ```

- **`CODEOWNERS`** — auto-assign reviewers by path (map from Decision 5):
  ```
  # Default
  * @team-lead

  # Backend services
  /services/ @backend-lead
  /services/identity-service/ @security-lead @backend-lead

  # Frontend
  /apps/web-frontend/ @frontend-lead

  # Infrastructure
  /k8s/ @devops-lead
  /openshift/ @devops-lead
  /Jenkinsfile @devops-lead
  /docker-compose*.yml @devops-lead

  # Shared packages
  /shared/ @backend-lead @frontend-lead
  ```

- **`CONTRIBUTING.md`** — onboarding guide sections:
  - Prerequisites (Node.js version, Docker, Git config)
  - First-time setup steps (`scripts/bootstrap.sh`)
  - Development workflow (branch → code → test → PR)
  - Commit message convention
  - PR process and review expectations
  - Code style guide reference
  - Where to ask questions

- **Commit message convention** — Conventional Commits:
  ```
  <type>(<scope>): <short description>

  [optional body]

  [optional footer: PROJ-NNN]
  ```
  - Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `perf`
  - Scopes: service names (`identity`, `task`, `progress`, `alert`, `team`, `gateway`, `frontend`), `shared`, `infra`, `docs`
  - Enforceable via `commitlint` + `husky` (covered in WS2)
  - Banking rationale: structured commit messages enable automated changelog generation and audit trail queries

- Probe: "Are there any additional file types or directories that should be in `.gitignore` for your environment?"
- Probe: "What are the GitHub/GitLab usernames or team handles for CODEOWNERS?"

### After All Decisions Are Made

Generate the **Repository Structure Document** with these sections:

#### 1. Monorepo Tooling Decision

| Decision | Choice | Rationale | Alternatives Considered | Phase Reference |
|---|---|---|---|---|
| Package manager & workspace tool | [choice] | [why] | [what else] | [HLD/ADR ref] |

#### 2. Repository Layout

Full ASCII tree of the agreed directory structure with annotations:
```
/
├── services/
│   ├── identity-service/    # :3001 — Auth, users
│   ├── task-service/        # :3002 — Task CRUD
│   └── ...
├── apps/
│   └── web-frontend/        # :3005 — React 18 SPA
├── shared/
│   └── utils/               # @task-tracker/utils
├── docs/
│   ├── requirements/
│   ├── design/
│   ├── adr/
│   └── setup/
├── scripts/
├── k8s/                     # Kubernetes/OpenShift manifests
└── ...
```

For each directory: purpose, owner (team/individual), and which Phase 2 component it maps to.

#### 3. Branching Strategy

- Chosen strategy with full flow diagram
- Branch naming convention with examples
- Merge direction rules (which branches merge into which)
- Release process step-by-step
- Hotfix process step-by-step

#### 4. Branch Protection Rules

| Branch | Approvals | CI Gate | Force Push | Merge Restriction | Compliance Reference |
|---|---|---|---|---|---|
| main | [N] | [pipeline] | [yes/no] | [who] | PCI-DSS 6.4, ISO 27001 A.12.1.2 |
| ... | ... | ... | ... | ... | ... |

#### 5. PR Template

Full PR template content (ready to copy to `.github/pull_request_template.md` or equivalent).

#### 6. Review Checklist & CODEOWNERS

- Mandatory reviewers by path/area
- CODEOWNERS file content
- Review SLA expectations (e.g., review within 24 hours for standard PRs, 4 hours for hotfixes)

#### 7. Repository Hygiene Files

- `.gitignore` — full content
- `.gitattributes` — full content
- Commit message convention specification
- `CONTRIBUTING.md` outline

#### 8. Compliance Traceability

| Requirement | Standard | How Addressed | Evidence |
|---|---|---|---|
| Code review before production | PCI-DSS 6.3.2 | PR approvals + branch protection | PR merge history |
| Change control process | PCI-DSS 6.4 | Gitflow + release branches | Release branch history, tags |
| Separation of duties | PCI-DSS 6.4.2 | Cannot self-approve to main | Branch protection rules |
| Change management authorization | ISO 27001 A.12.1.2 | Required approvals per branch type | PR approval log |
| Audit trail | ISO 27001 A.12.4 | Conventional Commits + merge commits | Git log |

#### 9. Key Assumptions

| ID | Assumption | Impact if Wrong | Mitigation |
|---|---|---|---|
| REPO-A001 | [assumption] | [impact] | [what we'd do] |

**Present the full document** to the user for review before saving.

**Save** to `docs/setup/repository-structure.md`

**Recommend** the user proceed to `/setup-typescript` (next workstream: WS2 — TypeScript Configuration & Code Quality).

## Quality Gate

Before marking this workstream complete, confirm:
- [ ] Monorepo tooling decision documented with rationale
- [ ] Repository layout matches Phase 2 folder structure — no orphan directories, no missing services
- [ ] Branching strategy documented with merge rules and flow diagram
- [ ] Branch protection rules specified for all branch types (main, develop, release, feature, hotfix)
- [ ] PR template created with both general and security-specific checklists
- [ ] `.gitignore` is comprehensive (Node.js + TypeScript + Docker + IDE + banking-sensitive files)
- [ ] `.gitattributes` specifies line ending and binary handling rules
- [ ] CODEOWNERS file maps all critical paths to specific reviewers
- [ ] Commit message convention defined (Conventional Commits) and enforcement plan noted
- [ ] `CONTRIBUTING.md` outline covers onboarding, workflow, and standards
- [ ] All decisions traceable to architecture, security, or compliance requirements
- [ ] PCI-DSS Requirement 6.3.2 (code review) compliance evidence documented
- [ ] PCI-DSS Requirement 6.4 (change control) compliance evidence documented
- [ ] ISO 27001 A.12.1.2 (change management) compliance evidence documented
- [ ] No contradictions with HLD, security architecture, ADRs, or folder structure from Phase 2
