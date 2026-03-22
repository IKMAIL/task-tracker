# Phase Gate — Setup Validation & Sign-Off

You are conducting the final validation step of the Project Setup & DevOps phase (Phase 4). The goal is to confirm that all seven workstreams are **complete, consistent, compliant, and ready to hand off** to Phase 5 (Development Sprints).

This is a banking-grade MERN + TypeScript monorepo project. All validation must account for PCI-DSS and ISO 27001 compliance obligations.

## Pre-Requisite

All workstream outputs should exist in `docs/setup/`. Read each file and list which are present and which are missing:

| Deliverable | Expected File | Workstream | Status |
|---|---|---|---|
| Pre-check report | `docs/setup/pre-check-report.md` | Pre-check | Present/Missing |
| Repository Structure | `docs/setup/repository-structure.md` | WS1 | Present/Missing |
| Local Dev Environment | `docs/setup/local-dev-environment.md` | WS2 | Present/Missing |
| TypeScript Build Config | `docs/setup/typescript-build-config.md` | WS3 | Present/Missing |
| Code Quality Gates | `docs/setup/code-quality-gates.md` | WS4 | Present/Missing |
| CI/CD Pipeline | `docs/setup/ci-cd-pipeline.md` | WS5 | Present/Missing |
| Container Orchestration | `docs/setup/container-orchestration.md` | WS6 | Present/Missing |
| Secrets Management | `docs/setup/secrets-management.md` | WS7 | Present/Missing |
| Ambiguity Log | `docs/setup/ambiguity-log.md` | Cross-cutting | Present/Missing |

If any **workstream output** (WS1-WS7) is missing, recommend completing the relevant workstream before proceeding. Allow the user to continue if they choose, but flag it as a risk in the final report.

Also read these supporting documents if they exist:
- `docs/design/high-level-design.md` — architecture decisions
- `docs/design/security-architecture.md` — security requirements
- `docs/design/api-contracts.md` — API conventions
- `docs/requirements/nonfunctional-requirements.md` — NFR targets
- `docs/adr/` — all Architecture Decision Records

## Instructions

This phase gate is a structured review, not a Q&A. Work through each step systematically and present findings to the user.

### Step 1: Cross-Workstream Consistency Checks

Read all workstream documents and check for conflicts across the following integration points:

**WS1 (Repository) <-> WS5 (CI/CD):**
- [ ] Branching strategy in WS1 aligns with CI/CD trigger rules in WS5
- [ ] Branch-to-environment mapping in WS1 matches WS5 deployment pipeline environments
- [ ] Branch protection rules in WS1 are enforced by WS5 pipeline gates
- [ ] Merge strategy in WS1 aligns with WS5 build triggers

**WS2 (Local Dev) <-> WS5 (CI/CD) + WS6 (Containers):**
- [ ] Docker Compose configuration in WS2 aligns with WS5 Docker build strategy
- [ ] WS2 service ports match WS6 container port mappings
- [ ] WS2 local Dockerfiles are consistent with WS5 multi-stage build Dockerfiles
- [ ] WS2 development dependencies align with WS6 runtime container configuration

**WS3 (TypeScript) <-> WS4 (Quality) + WS5 (CI/CD):**
- [ ] TypeScript compiler options in WS3 align with ESLint TypeScript parser config in WS4
- [ ] `tsconfig` paths and project references in WS3 are used consistently in WS5 build stages
- [ ] WS3 build output directories match what WS5 packages into Docker images
- [ ] WS3 strict mode settings align with WS4 lint rule severity

**WS4 (Quality Gates) <-> WS5 (CI/CD Pipeline):**
- [ ] Every WS4 quality gate has a corresponding CI pipeline stage in WS5
- [ ] ESLint configuration from WS4 runs in WS5 lint stage
- [ ] Prettier configuration from WS4 runs in WS5 format check stage
- [ ] Test coverage thresholds from WS4 are enforced in WS5 test stage
- [ ] Security scanning from WS4 runs in WS5 security scan stage
- [ ] Git hooks from WS4 complement (not duplicate) WS5 CI checks
- [ ] No WS4 quality gate is missing from the WS5 CI pipeline

**WS5 (CI/CD) <-> WS6 (Container Orchestration):**
- [ ] WS5 deployment targets align with WS6 infrastructure environments
- [ ] WS5 Docker image tagging strategy aligns with WS6 container image references
- [ ] WS5 deployment strategy (blue-green/canary/rolling) aligns with WS6 orchestration config
- [ ] WS5 health check endpoints match WS6 liveness/readiness probe paths

**WS6 (Containers) <-> WS7 (Secrets):**
- [ ] WS6 service environment variable references match WS7 secret definitions
- [ ] WS6 secret mount paths align with WS7 secrets injection method
- [ ] WS6 container runtime configuration does not expose secrets in logs or environment dumps
- [ ] All services in WS6 have their required secrets defined in WS7

**WS7 (Secrets) <-> WS5 (CI/CD) + WS6 (Containers):**
- [ ] WS7 secret references match what WS5 pipeline expects (CI secrets, deployment secrets)
- [ ] WS7 per-environment secrets align with WS5 environment pipeline stages
- [ ] WS7 rotation strategy does not conflict with WS5 deployment frequency
- [ ] WS7 secrets vault integration matches WS6 secret injection mechanism

Present all failures to the user with specific file references and quoted excerpts showing the conflict. Do not mark this step complete until the user either resolves conflicts or explicitly defers them to the ambiguity log.

### Step 2: Compliance Audit

Read all workstream documents and build a compliance matrix.

**PCI-DSS Compliance Matrix:**

| Requirement | Description | Addressed In | How Addressed | Status |
|---|---|---|---|---|
| PCI-DSS 2.2 | System configuration standards | WS1, WS6 | Repository structure, container hardening | Pass/Fail/Partial |
| PCI-DSS 6.1 | Vulnerability identification | WS4, WS5 | Dependency audit, image scanning | Pass/Fail/Partial |
| PCI-DSS 6.2 | Security patching | WS5 | Automated dependency updates in pipeline | Pass/Fail/Partial |
| PCI-DSS 6.3 | Secure software development | WS3, WS4, WS5 | TypeScript strict mode, linting, CI gates | Pass/Fail/Partial |
| PCI-DSS 6.3.2 | Code review before release | WS1, WS5 | Branch protection, PR-required pipeline | Pass/Fail/Partial |
| PCI-DSS 6.4 | Change control procedures | WS1, WS5 | Branching strategy, deployment approvals | Pass/Fail/Partial |
| PCI-DSS 6.5 | Secure coding practices | WS4, WS5, WS6 | Security linting, non-root containers | Pass/Fail/Partial |
| PCI-DSS 7.1 | Least privilege access | WS5, WS7 | Pipeline token permissions, secrets scoping | Pass/Fail/Partial |
| PCI-DSS 8.6 | Authentication mechanisms | WS5, WS7 | OIDC for cloud, secrets management | Pass/Fail/Partial |
| PCI-DSS 10.5 | Audit trail protection | WS5, WS7 | Immutable CI logs, deployment audit trail | Pass/Fail/Partial |

**ISO 27001 Controls Matrix:**

| Control | Description | Addressed In | How Addressed | Status |
|---|---|---|---|---|
| A.8.1 | Asset management | WS1 | Repository structure, dependency inventory | Pass/Fail/Partial |
| A.9.4 | System access control | WS5, WS7 | Pipeline RBAC, secrets access control | Pass/Fail/Partial |
| A.12.1 | Operational procedures | WS2, WS5 | Documented dev environment, pipeline as code | Pass/Fail/Partial |
| A.12.5 | Control of operational software | WS5, WS6 | Immutable artifacts, container image policies | Pass/Fail/Partial |
| A.12.6 | Technical vulnerability management | WS4, WS5 | Security scanning, dependency audit | Pass/Fail/Partial |
| A.14.2 | Security in development | WS3, WS4, WS5 | TypeScript strict, quality gates, CI pipeline | Pass/Fail/Partial |
| A.18.1 | Compliance with legal/regulatory | All | Cross-workstream compliance controls | Pass/Fail/Partial |

**Gap Analysis:**
- List any PCI-DSS requirements NOT addressed by any workstream
- List any ISO 27001 controls NOT mapped to specific outputs
- For each gap: severity (Critical/High/Medium/Low), recommended remediation, which workstream should own the fix

### Step 3: Ambiguity Log Review

Check if `docs/setup/ambiguity-log.md` exists:
- If yes: read all items and review their current status
- If no: create one and populate it with any unresolved items found in Steps 1 and 2

For each open item, categorize as:

| Category | Definition | Action Required |
|---|---|---|
| **Blocking** | Must resolve before Phase 5 begins | Cannot proceed until resolved |
| **Non-blocking** | Can resolve during development sprints | Log as tech debt, assign to sprint backlog |
| **Informational** | Context or preference, no action needed | Note for reference only |

Present the full categorized list:

| ID | Description | Source WS | Category | Risk if Unresolved | Recommended Action |
|---|---|---|---|---|---|
| AMB-XXX | [description] | WS[N] | Blocking/Non-blocking/Informational | [risk] | [action] |

If any items are categorized as **Blocking**, clearly state that Phase 5 cannot proceed until they are resolved. Ask the user to resolve each blocking item or explicitly accept the risk and reclassify.

### Step 4: Technical Readiness Checklist

Present this checklist and verify each item against the workstream documents. For each item, state whether the workstream documentation confirms it or if it needs verification:

**Developer Onboarding:**
- [ ] Repository can be cloned and set up in < 15 minutes (WS2 documents setup steps)
- [ ] `npm install` succeeds from clean checkout (WS2 confirms dependency setup)
- [ ] `npm run dev` starts all services (WS2 documents dev startup)
- [ ] `npm run test` runs successfully (WS4 documents test configuration)
- [ ] `npm run build` compiles all TypeScript (WS3 documents build configuration)
- [ ] Docker Compose starts full stack (WS2/WS6 documents container setup)

**Automation:**
- [ ] Git hooks are installed and functional (WS4 documents hook setup)
- [ ] CI pipeline runs on PR creation (WS5 documents PR trigger)
- [ ] Linting runs automatically on commit/push (WS4 hooks + WS5 CI)
- [ ] Tests run automatically in CI (WS5 documents test stage)
- [ ] Security scanning runs automatically in CI (WS5 documents security stage)

**Configuration:**
- [ ] All environment variables documented (WS2/WS7 document env vars)
- [ ] `.env.example` files exist for all services (WS2 documents env setup)
- [ ] Secrets management configured for all environments (WS7 documents secrets per env)
- [ ] Docker images build successfully (WS5/WS6 document Docker build)

**Compliance:**
- [ ] Non-root containers configured (WS6 documents container security)
- [ ] Image vulnerability scanning enabled (WS5 documents scanning)
- [ ] Audit trail for deployments configured (WS5 documents deployment logging)
- [ ] Branch protection rules documented (WS1/WS5 document branch protection)

For items that cannot be confirmed from documentation alone (e.g., "npm install succeeds"), note them as "Requires live verification" and recommend the user run them before sign-off.

### Step 5: Decision Summary

Compile a summary of all key decisions made across WS1-WS7:

| # | Decision | Workstream | Rationale | Alternatives Considered |
|---|---|---|---|---|
| 1 | [decision] | WS[N] | [why] | [what else was considered] |

Extract decisions from each workstream document. Focus on:
- WS1: Version control platform, branching strategy, monorepo structure
- WS2: Package manager, Node.js version, Docker base image, dev tools
- WS3: TypeScript version, module system, strict mode settings, project references
- WS4: Linter, formatter, test framework, coverage thresholds, security scanner, git hooks
- WS5: CI/CD platform, pipeline architecture, deployment strategy, artifact management
- WS6: Container orchestration platform, service mesh, scaling strategy, infrastructure
- WS7: Secrets management platform, rotation policy, injection method, access control

### Step 6: Risk Assessment

Identify open risks from all workstreams:

| # | Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| R-001 | [risk description] | High/Medium/Low | High/Medium/Low | [mitigation plan] | [workstream] |

Include risks from:
- Missing workstream outputs
- Unresolved ambiguity log items
- Compliance gaps
- Consistency check failures
- Items marked as "[assumed]" or "[TBD]" in any workstream

### Step 7: Formal Sign-Off

Present the recommendation:

**If all checks pass and no blocking items exist:**
- Recommend: **Proceed to Phase 5 (Development Sprints)**
- Note any non-blocking items to carry forward as tech debt

**If blocking items exist:**
- Recommend: **Remediate gaps before proceeding to Phase 5**
- List specific items that must be resolved
- Estimate effort to resolve each

Ask the user to confirm:
- "Do you approve the Project Setup & DevOps baseline?"
- Record the approval with date and any conditions

**Sign-off checklist for stakeholders:**
- [ ] All 7 workstream outputs reviewed and accepted
- [ ] Cross-workstream consistency verified — no unresolved conflicts
- [ ] PCI-DSS compliance matrix reviewed — no critical gaps
- [ ] ISO 27001 controls mapped — no critical gaps
- [ ] All blocking ambiguity items resolved
- [ ] Technical readiness checklist confirmed
- [ ] Risk register reviewed and accepted
- [ ] Decision log approved

### After Completion

Generate the **Setup & DevOps Phase Gate Report**:

```
Project Setup & DevOps — Phase Gate Report
===========================================
Date:              [date]
Reviewer(s):       [names/roles]

Workstreams Completed:
  Pre-check:                     [Complete/Incomplete]
  WS1 — Repository Structure:    [Complete/Incomplete]
  WS2 — Local Dev Environment:   [Complete/Incomplete]
  WS3 — TypeScript Build Config: [Complete/Incomplete]
  WS4 — Code Quality Gates:      [Complete/Incomplete]
  WS5 — CI/CD Pipeline:          [Complete/Incomplete]
  WS6 — Container Orchestration: [Complete/Incomplete]
  WS7 — Secrets Management:      [Complete/Incomplete]

Consistency Checks:    [Passed/Failed — N issues found]
Compliance Audit:
  PCI-DSS:             [N/N requirements addressed]
  ISO 27001:           [N/N controls mapped]
  Gaps:                [N critical / N high / N medium / N low]
Ambiguity Log:         [N open / N resolved / N deferred]
                       [N blocking / N non-blocking / N informational]
Technical Readiness:   [N/N items confirmed]
Risk Register:         [N risks — N high / N medium / N low]
Decision Log:          [N decisions recorded across WS1-WS7]

Approval Status:       Approved / Approved with Conditions / Not Approved
Conditions:            [list if any]

Next Phase Cleared:
  Phase 5 — Development Sprints:  [Yes/No]

All deliverables saved to: docs/setup/
```

**Save** the full report to `docs/setup/phase-gate-review.md`

**Next Steps:**
- If approved: proceed to Phase 5 (Development Sprints) when the `/sprint-plan` skill becomes available, or begin manual development using the setup established in Phase 4. The infrastructure, CI/CD pipeline, quality gates, and development environment are ready for feature implementation.
- If not approved: address the identified gaps and re-run `/setup-review`

## Quality Gate

Setup & DevOps phase is complete when:
- [ ] All 7 workstream quality gates are satisfied
- [ ] Zero unresolved conflicts between workstreams
- [ ] PCI-DSS compliance matrix has no critical gaps
- [ ] ISO 27001 controls are mapped with no critical gaps
- [ ] Ambiguity log has zero blocking items
- [ ] Technical readiness checklist is fully confirmed
- [ ] Risk register is reviewed with no unmitigated high risks
- [ ] All key decisions are documented in the decision log
- [ ] Formal approval is recorded with date
- [ ] Phase gate report saved to `docs/setup/phase-gate-review.md`
