# Pre-Check: Existing Project Setup & Infrastructure Scan

You are starting the Project Setup & DevOps phase pre-check. Before beginning any setup work, scan the existing repository for infrastructure configs, CI files, Docker configs, environment files, TypeScript configs, and deployment manifests. Identify what exists vs what needs to be created.

## Pre-Requisite

Check that these Phase 2 and Phase 3 sign-off documents exist:
- `docs/design/design-signoff.md` — Phase 2 (System Design) sign-off
- `docs/design/uiux/uiux-signoff.md` — Phase 3 (UI/UX Design) sign-off
- `docs/design/folder-structure.md` — agreed project layout from Phase 2 WS5

If `design-signoff.md` is missing, warn the user that System Design should be signed off before project setup begins, but allow them to proceed. If `uiux-signoff.md` is missing, note it as advisory — UI/UX sign-off is recommended but not blocking for infrastructure setup.

Also read these if they exist (required context for workstream relevance mapping):
- `docs/design/high-level-design.md` — architecture decisions (monorepo, services, communication patterns)
- `docs/design/security-architecture.md` — auth flows, RBAC, secrets management, compliance requirements
- `docs/design/api-contracts.md` — API endpoints and shared types
- `docs/design/data-model.md` — database schemas and connection strategy
- `docs/adr/` — all Architecture Decision Records

## Instructions

1. **Scan the repository** for existing setup and infrastructure files. Check every category below and report what exists:

   **Category A: Project Structure & Workspaces**
   - Root `package.json` — check for workspace configuration (`workspaces` field)
   - Per-service `package.json` files in `services/*/` and `apps/*/`
   - `shared/` directory — shared packages, types, utilities
   - `scripts/` directory — bootstrap, seed, migration utilities
   - `Makefile` or task runner configs

   **Category B: TypeScript Configuration**
   - Root `tsconfig.base.json` or `tsconfig.json`
   - Per-service `tsconfig.json` files in `services/*/` and `apps/*/`
   - Path alias configurations (`paths`, `references`)
   - Shared type definitions in `shared/types/` or `types/`

   **Category C: Docker & Container Configuration**
   - Root `docker-compose.yml` or `docker-compose.*.yml` files (dev, test, prod variants)
   - Per-service `Dockerfile` files in `services/*/` and `apps/*/`
   - `.dockerignore` files
   - Docker-related scripts in `scripts/`

   **Category D: CI/CD Pipeline Configuration**
   - `Jenkinsfile` or `.jenkins/` or `jenkins/` directories
   - `.github/workflows/` directory (GitHub Actions)
   - `.gitlab-ci.yml` (GitLab CI)
   - `bitbucket-pipelines.yml` (Bitbucket)
   - Any other CI config files at root

   **Category E: Container Orchestration & Deployment**
   - `k8s/` or `kubernetes/` directories — Kubernetes manifests
   - `openshift/` directory — OpenShift-specific configs
   - Helm charts in `charts/` or `helm/`
   - Kustomize overlays in `k8s/overlays/` or similar
   - Environment-specific deployment configs (dev, staging, prod)

   **Category F: Code Quality & Linting**
   - `.eslintrc*` files (root and per-service)
   - `.prettierrc*` files and `.prettierignore`
   - `.husky/` directory — Git hooks
   - `commitlint.config.*` — commit message linting
   - `.editorconfig`
   - `jest.config.*` files (root and per-service)

   **Category G: Environment & Secrets**
   - `.env` files (root and per-service) — **flag these as security-sensitive, should not be committed**
   - `.env.example` files (root and per-service)
   - `.gitignore` — check if `.env` files are properly excluded
   - Any vault configs, sealed secrets, or external secret operator manifests

   **Category H: Repository Hygiene**
   - `.gitignore` — review completeness for Node.js, TypeScript, Docker, IDE files
   - `.gitattributes` — line endings, binary handling
   - `CODEOWNERS` — auto-review assignment
   - `CONTRIBUTING.md` — contributor guidelines
   - PR templates (`.github/pull_request_template.md` or similar)
   - Issue templates (`.github/ISSUE_TEMPLATE/`)

2. **Report findings** to the user in a concise summary:
   - List each file found with a one-line description of its contents and current state
   - Indicate whether each file is complete, partial, or outdated relative to Phase 2 design decisions
   - Flag any conflicts between existing infrastructure configs and the signed-off architecture
   - Flag any security concerns (committed secrets, exposed credentials, missing `.gitignore` entries)

3. **Assess design-readiness** — scan Phase 2 and Phase 3 deliverables for setup inputs:
   - `docs/design/high-level-design.md` → needed for WS1 (Repo Structure), WS2 (TypeScript/Lint), WS3 (Docker), WS5 (CI/CD), WS6 (K8s)
   - `docs/design/folder-structure.md` → needed for WS1 (Repo Structure)
   - `docs/design/security-architecture.md` → needed for WS4 (Env & Secrets), WS5 (CI/CD security gates), WS6 (K8s security)
   - `docs/design/api-contracts.md` → needed for WS3 (Docker networking), WS6 (K8s service mesh)
   - `docs/design/data-model.md` → needed for WS3 (Docker DB containers), WS7 (Seed & Migration scripts)
   - ADRs from `docs/adr/` → cross-cutting input for all workstreams
   - Flag any gaps that will block specific workstreams

4. **Map findings to workstream relevance** using this table format:

   | Workstream | Description | Existing Artifacts | Status | Blocked By |
   |---|---|---|---|---|
   | WS1 | Repository Structure & Branching | [list files found] | None / Partial / Complete | [missing inputs] |
   | WS2 | TypeScript Config & Code Quality | [list files found] | None / Partial / Complete | [missing inputs] |
   | WS3 | Docker & Local Development | [list files found] | None / Partial / Complete | [missing inputs] |
   | WS4 | Environment & Secrets Management | [list files found] | None / Partial / Complete | [missing inputs] |
   | WS5 | CI/CD Pipeline (Jenkins) | [list files found] | None / Partial / Complete | [missing inputs] |
   | WS6 | Container Orchestration (OpenShift/K8s) | [list files found] | None / Partial / Complete | [missing inputs] |
   | WS7 | Bootstrap, Seed & Migration Scripts | [list files found] | None / Partial / Complete | [missing inputs] |

5. **Compliance readiness assessment** — for banking/PCI-DSS/ISO 27001 context:
   - Are secrets properly excluded from version control?
   - Is there evidence of branch protection or merge controls?
   - Are there audit-trail-friendly commit conventions in place?
   - Is there separation between dev, staging, and production configs?
   - Flag any compliance gaps that need immediate attention

6. **Ask the user** how to proceed:
   - Start fresh (archive existing configs and begin from Workstream 1)
   - Resume from a specific workstream (skip workstreams that are already complete)
   - Update/enhance existing configurations (merge new decisions into existing files)
   - Address compliance gaps first before proceeding with workstreams

7. **If no existing infrastructure files are found**, confirm to the user that this is a clean start and recommend beginning with `/setup-repo` (WS1: Repository Structure & Branching Strategy).

## Output Location

Save the scan results summary to `docs/setup/pre-check-report.md` with:
- Date of scan
- Files found (grouped by category A-H with one-line descriptions)
- Workstream relevance mapping table
- Design-readiness assessment (which Phase 2/3 inputs are available)
- Compliance readiness assessment
- Recommended next steps
- User's chosen approach
