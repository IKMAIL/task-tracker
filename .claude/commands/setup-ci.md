# Workstream 5 — CI/CD Pipeline

You are conducting Workstream 5 of the Project Setup & DevOps phase. This workstream answers the question: **"What automated pipeline builds, tests, scans, and deploys every change — from commit to production — with full audit trail?"**

This is a banking-grade MERN + TypeScript project. All decisions must account for PCI-DSS Requirement 6.3 (Develop software applications securely), PCI-DSS 6.4 (Change control procedures), and ISO 27001 Annex A.12.1 (Operational procedures and responsibilities).

## Pre-Requisite

Check that these documents exist and read them:
- `docs/setup/repository-structure.md` — WS1 output (branching strategy, branch names, environments)
- `docs/setup/local-dev-environment.md` — WS2 output (dev scripts, Docker setup)
- `docs/setup/typescript-build-config.md` — WS3 output (TypeScript config, build pipeline)
- `docs/setup/code-quality-gates.md` — WS4 output (linting, testing, security scanning, hooks)
- `docs/setup/pre-check-report.md` — pre-check scan output
- `docs/design/high-level-design.md` — architecture decisions
- `docs/design/security-architecture.md` — security requirements

If any are missing, inform the user which ones and recommend completing the prerequisite workstream first. Allow them to proceed if they choose, but log missing inputs to `docs/setup/ambiguity-log.md`.

Also read these if they exist (optional but valuable):
- `docs/requirements/nonfunctional-requirements.md` — NFR targets (build time, deployment frequency)
- `docs/design/api-contracts.md` — API conventions
- `docs/adr/` — all Architecture Decision Records
- Existing `.github/workflows/`, `Jenkinsfile`, `.gitlab-ci.yml`, `Dockerfile*` — current CI/CD config (if any)
- `docker-compose*.yml` files — existing Docker configuration

## Instructions

Walk through each decision **one at a time**. For each decision, present the options, trade-offs, and a recommendation grounded in the architecture documents and banking compliance requirements. Wait for user confirmation before moving on.

### Partial Save & Resume

- After every 3 decisions, auto-save progress to `docs/setup/ci-cd-pipeline.draft.md` with a `## Progress` section noting which decisions are completed and which is next
- If the user says "pause", "stop", or "save and continue later": save the current draft immediately and note the next decision to resume from
- On resume: read the draft file, summarise decisions made so far, continue from the next undecided item

### Handling Incomplete Answers

- If the user answers "I don't know" or is unsure, log the item to `docs/setup/ambiguity-log.md` with status **Open** and continue — do not block the workstream
- Use a sensible default tagged with **[assumed]** so the document remains complete
- If a pipeline stage cannot be designed due to missing answers, mark it as **Deferred** with the specific ambiguity log item ID

### Behavioral Guardrails

- Do not rephrase or reinterpret the user's answers — quote them directly when synthesizing deliverables
- Do not invent or assume answers the user has not provided — mark gaps explicitly as "[TBD — needs stakeholder input]"
- Do not embellish — tag inferred details with "[assumed]"
- Do not introduce CI/CD platforms or tools not discussed in Phase 2 without explicitly flagging them as new additions
- Reference specific architecture decisions, NFR targets, or ADRs when justifying recommendations
- Use the project glossary consistently when it exists in `docs/requirements/business-context.md`

### Contradiction Detection

- If a CI pipeline stage contradicts a quality gate from WS4, flag it
- If a deployment strategy contradicts the branching strategy from WS1, flag it
- If a build step contradicts the TypeScript build config from WS3, flag it
- If a pipeline decision contradicts an existing ADR, flag it: "ADR-[NNN] decided [X]. This approach contradicts that decision. Should we update the ADR or change the approach?"

### Decisions to Walk Through

**Decision 1: CI/CD Platform**

- Present CI/CD platform options:

  | Option | Description | Pros | Cons |
  |---|---|---|---|
  | **GitHub Actions** | GitHub-native CI/CD | Tight GitHub integration, free tier, marketplace | Vendor lock-in to GitHub |
  | **Azure DevOps Pipelines** | Microsoft CI/CD platform | Enterprise features, Azure integration, YAML pipelines | Separate platform from code hosting |
  | **Jenkins** | Self-hosted CI/CD server | Maximum control, plugin ecosystem, no vendor lock-in | Maintenance overhead, infrastructure cost |
  | **GitLab CI** | GitLab-native CI/CD | All-in-one platform, built-in registry | Requires GitLab hosting |

- Banking considerations:
  - Audit logging requirements — does the platform provide immutable audit logs?
  - Secrets management integration — how are pipeline secrets stored?
  - Approval gates — does it support manual approval steps for production deployment?
  - Compliance reporting — can you generate deployment audit reports?

- Cross-reference: check WS1 repository structure for hosting platform (GitHub assumed based on CLAUDE.md)
- Probe: "Which CI/CD platform are you using or planning to use?"

**Decision 2: Pipeline Architecture**

- Present pipeline architecture patterns:

  | Pattern | Description | Pros | Cons |
  |---|---|---|---|
  | **Monorepo-aware** | Detect changed packages, only build/test affected services | Fast, efficient, cost-effective | Complex change detection logic |
  | **Build-all** | Every commit triggers all services to build/test | Simple, reliable, no missed regressions | Slow, expensive for large monorepos |
  | **Hybrid** | Build-all on main/develop, monorepo-aware on feature branches | Balance of speed and safety | More complex configuration |

- Change detection strategies:
  - Git diff-based: compare HEAD with base branch to find changed paths
  - `turbo`/`nx` built-in: dependency graph-aware change detection
  - GitHub Actions path filters: `paths:` and `paths-ignore:` in workflow triggers

- Recommended pipeline stages (high-level):
  ```
  Trigger → Checkout → Install → Lint → Typecheck → Test → Security Scan → Build → [Deploy]
  ```

- Probe: "Do you want monorepo-aware change detection (faster, only affected services) or build-all (simpler, catches all regressions)?"

**Decision 3: Pipeline Stages — Quality Gates**

- Map WS4 quality gates to CI pipeline stages:

  | Stage | What Runs | Artifacts | Fail Behavior |
  |---|---|---|---|
  | **Install** | `npm ci` (clean install from lockfile) | `node_modules` (cached) | Block — no point continuing |
  | **Lint** | ESLint across all changed packages | SARIF report | Block |
  | **Format check** | Prettier --check (no write) | Diff output | Block |
  | **Type check** | `tsc --noEmit` for all packages | Type error log | Block |
  | **Unit tests** | Jest with coverage for changed packages | Coverage report, JUnit XML | Block |
  | **Security lint** | eslint-plugin-security results (part of lint) | SARIF report | Block |
  | **Dependency audit** | `npm audit` / `audit-ci` | Audit report | Block (high/critical) |
  | **Build** | `npm run build` for all packages | `dist/` directories | Block |

- Caching strategy:
  - `node_modules` — cache by `package-lock.json` hash
  - TypeScript build info — cache `tsconfig.tsbuildinfo` files
  - Jest cache — cache `.jest-cache/` directory

- Cross-reference: verify all WS4 quality gates are represented in CI stages
- Probe: "Any additional CI stages you want (e.g., integration tests, E2E tests, performance tests)?"

**Decision 4: Docker Build Strategy**

- Present Docker build strategies:

  | Strategy | Description | Pros | Cons |
  |---|---|---|---|
  | **Multi-stage builds** | Builder stage → runtime stage | Small images, no dev deps in production | Longer initial build |
  | **Pre-built artifacts** | Build outside Docker, COPY dist/ | Faster Docker builds, reuse CI artifacts | Two-step process |
  | **Buildkit + layer caching** | Docker BuildKit with cache mounts | Faster rebuilds, parallel builds | Requires BuildKit support |

- Base image options:
  - `node:20-alpine` — small, secure (recommended for production)
  - `node:20-slim` — Debian-based, more compatible
  - `node:20` — full Debian, largest attack surface

- Per-service Dockerfile template:
  ```dockerfile
  # Builder stage
  FROM node:20-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci --only=production
  COPY dist/ ./dist/

  # Runtime stage
  FROM node:20-alpine
  RUN addgroup -S app && adduser -S app -G app
  WORKDIR /app
  COPY --from=builder /app ./
  USER app
  EXPOSE 3001
  CMD ["node", "dist/index.js"]
  ```

- Banking security requirements:
  - Non-root user in container (PCI-DSS 6.5)
  - No secrets baked into images
  - Image scanning for vulnerabilities (Trivy/Snyk)
  - Image signing and provenance (optional, for supply chain security)

- Cross-reference: check WS2 for existing Dockerfiles and docker-compose configuration
- Probe: "Do you want Docker image vulnerability scanning in CI (Trivy, Snyk, or both)?"

**Decision 5: Environment Strategy & Deployment Pipeline**

- Present environment pipeline:

  | Environment | Trigger | Deployment | Approval | Purpose |
  |---|---|---|---|---|
  | **Development** | Push to `develop` | Automatic | None | Integration testing |
  | **Staging** | Push to `release/*` or manual | Automatic | None | Pre-production validation |
  | **Production** | Merge to `main` | Automatic after approval | Manual (2 approvers) | Live traffic |

- Deployment strategies:

  | Strategy | Description | Pros | Cons |
  |---|---|---|---|
  | **Rolling update** | Replace instances one at a time | Zero-downtime, simple | Slow rollback |
  | **Blue-green** | Run two identical environments, switch traffic | Instant rollback, zero-downtime | Double infrastructure cost |
  | **Canary** | Route small % of traffic to new version | Gradual risk, real traffic validation | Complex routing setup |

- Banking recommendation: Blue-green or canary for production — instant rollback capability is critical for banking services. Rolling update acceptable for dev/staging
- Rollback procedure:
  - Automated: if health checks fail within N minutes, auto-rollback
  - Manual: one-click rollback to previous version
  - Audit: all deployments and rollbacks logged with who/when/what

- Cross-reference: check WS1 branching strategy for branch-to-environment mapping
- Probe: "Which deployment strategy do you prefer for production? (Blue-green recommended for banking)"
- Probe: "How many manual approvers required for production deployment? (Recommendation: 2 for banking)"

**Decision 6: Artifact Management**

- Present artifact management options:

  | Artifact | Storage | Retention | Purpose |
  |---|---|---|---|
  | Docker images | Container registry (ECR/ACR/GHCR) | 90 days (non-prod), forever (prod) | Deployment artifacts |
  | Test reports | CI artifacts | 30 days | Quality evidence |
  | Coverage reports | CI artifacts + Codecov/SonarCloud | 30 days | Coverage tracking |
  | Security scan reports | CI artifacts | 90 days | Audit evidence |
  | Build logs | CI platform | 90 days | Troubleshooting |
  | SBOM (Software Bill of Materials) | CI artifacts | Per release | PCI-DSS compliance |

- Container registry options:
  - GitHub Container Registry (GHCR) — free for public repos, integrated with GitHub
  - Amazon ECR — AWS native, integrated with ECS/EKS
  - Azure Container Registry (ACR) — Azure native
  - Self-hosted (Harbor) — maximum control, open source

- Image tagging strategy:
  - `<service>:<git-sha>` — immutable, traceable
  - `<service>:<branch>-<build-number>` — sortable
  - `<service>:latest` — rolling tag for dev only (never production)

- Banking recommendation: Generate SBOM for every release using `syft` or `docker sbom` — PCI-DSS requires knowing what's in production
- Probe: "Which container registry do you plan to use?"

**Decision 7: Notifications & Monitoring**

- Present notification strategy:

  | Event | Channel | Recipients | Priority |
  |---|---|---|---|
  | Build failure | Slack/Teams + email | Committer + team | High |
  | Security scan findings | Slack/Teams + email | Security team + committer | Critical |
  | Deployment to staging | Slack/Teams | Team channel | Info |
  | Deployment to production | Slack/Teams + email | Team + stakeholders | High |
  | Rollback triggered | Slack/Teams + PagerDuty | On-call + team lead | Critical |
  | Coverage drop | Slack/Teams | Team channel | Medium |

- Dashboard options:
  - GitHub Actions dashboard (built-in)
  - Grafana dashboard (custom metrics)
  - SonarCloud dashboard (code quality trends)

- Banking recommendation: All production deployments and security findings must generate auditable notifications. PCI-DSS 10.5 requires logging of security events
- Probe: "What notification channels do you use (Slack, Teams, email, PagerDuty)?"

**Decision 8: Pipeline Security**

- Present pipeline security measures:

  | Measure | Description | Banking Relevance |
  |---|---|---|
  | **Secrets management** | Use platform secrets (not hardcoded in YAML) | PCI-DSS 6.5 |
  | **OIDC for cloud** | Use OIDC tokens instead of long-lived credentials | PCI-DSS 8.6 |
  | **Least privilege** | Pipeline tokens have minimum required permissions | PCI-DSS 7.1 |
  | **Signed commits** | Require GPG-signed commits on protected branches | PCI-DSS 6.4 |
  | **Immutable artifacts** | Built artifacts are content-addressed, never overwritten | PCI-DSS 10.5 |
  | **Pipeline as code** | All pipeline config in version control, reviewed via PR | PCI-DSS 6.3.2 |
  | **Branch protection** | Prevent direct push to main/develop, require reviews | PCI-DSS 6.3.2 |
  | **Runner security** | Use ephemeral runners, no persistent state | PCI-DSS 6.5 |

- Secrets to manage in pipeline:
  - `JWT_SECRET` — per environment
  - `SERVICE_TOKEN` — per environment
  - `MONGO_URI` — per environment
  - Container registry credentials (or use OIDC)
  - `MICROSOFT_CLIENT_ID/SECRET/TENANT_ID` — identity-service only
  - Notification webhook URLs (Slack, Teams)

- Cross-reference: check security architecture document for secrets management approach
- Probe: "Are you using OIDC for cloud authentication or long-lived credentials?"

### After All Decisions Are Made

Generate the **CI/CD Pipeline Document** with these sections:

#### 1. Platform & Architecture

CI/CD platform selection and rationale. Pipeline architecture pattern. Change detection strategy for monorepo.

#### 2. Pipeline Stages

Stage-by-stage breakdown with:
- What runs at each stage
- Dependencies between stages
- Caching strategy
- Artifacts produced
- Fail behavior

Include a visual pipeline diagram (text-based):
```
┌──────┐    ┌──────┐    ┌───────┐    ┌──────┐    ┌──────┐    ┌───────┐    ┌───────┐    ┌────────┐
│Checkout│→  │Install│→  │  Lint  │→  │ Type │→  │ Test │→  │Security│→  │ Build │→  │ Deploy │
│       │    │       │    │       │    │Check │    │      │    │ Scan  │    │Docker │    │        │
└──────┘    └──────┘    └───────┘    └──────┘    └──────┘    └───────┘    └───────┘    └────────┘
```

#### 3. Workflow Files

Full GitHub Actions (or chosen platform) workflow files with inline comments:
- `ci.yml` — PR validation pipeline
- `cd-dev.yml` — Deploy to development on merge to develop
- `cd-staging.yml` — Deploy to staging on release branch
- `cd-prod.yml` — Deploy to production on merge to main (with approval gate)

#### 4. Docker Build Configuration

Per-service Dockerfile template. Docker Compose for local development (cross-reference WS2). Multi-stage build approach. Image scanning integration.

#### 5. Environment Configuration

Environment-to-branch mapping. Environment-specific variables (not values, just names). Secrets management approach.

#### 6. Deployment Strategy

Strategy per environment. Rollback procedures. Health check configuration. Traffic management approach.

#### 7. Artifact Management

Container registry setup. Image tagging strategy. Retention policies. SBOM generation.

#### 8. Notifications

Event-to-channel mapping. Escalation paths. Dashboard setup.

#### 9. Pipeline Security

Secrets management. OIDC configuration. Runner security. Branch protection alignment with WS1.

#### 10. Pipeline Summary

| Pipeline | Trigger | Stages | Target Env | Approval | Est. Duration |
|---|---|---|---|---|---|
| CI (PR) | Pull request | lint, typecheck, test, security, build | None | Automated | ~5 min |
| CD Dev | Merge to develop | CI + deploy | Development | None | ~8 min |
| CD Staging | Release branch | CI + deploy | Staging | None | ~10 min |
| CD Prod | Merge to main | CI + deploy + smoke test | Production | Manual (2) | ~15 min |

#### 11. Compliance Traceability

| Requirement | Standard | How Addressed | Evidence |
|---|---|---|---|
| Change control procedures | PCI-DSS 6.4 | Automated pipeline, manual approval gates | Workflow files |
| Secure development | PCI-DSS 6.3 | Lint, typecheck, security scan in pipeline | CI workflow |
| Code review before deploy | PCI-DSS 6.3.2 | PR required, branch protection | GitHub settings |
| Vulnerability management | PCI-DSS 6.2 | npm audit, image scanning in CI | Security scan stage |
| Audit logging | PCI-DSS 10.5 | Immutable CI logs, deployment audit trail | Platform logs |
| Operational procedures | ISO 27001 A.12.1 | Pipeline as code, documented procedures | This document |

#### 12. Key Assumptions

| ID | Assumption | Impact if Wrong | Mitigation |
|---|---|---|---|
| CI-A001 | [assumption] | [impact] | [what we'd do] |

**Present the full document** to the user for review before saving.

**Save** to `docs/setup/ci-cd-pipeline.md`

**Recommend** the user proceed to `/setup-k8s` (next workstream: WS6 — Container Orchestration & Infrastructure).

## Quality Gate

Before marking this workstream complete, confirm:
- [ ] CI/CD platform selected with banking compliance justification
- [ ] Pipeline architecture pattern chosen (monorepo-aware vs build-all)
- [ ] All WS4 quality gates mapped to CI pipeline stages
- [ ] No quality gate from WS4 is missing from the CI pipeline
- [ ] Docker build strategy defined with multi-stage builds
- [ ] Non-root user in all container images
- [ ] Image vulnerability scanning integrated (Trivy/Snyk)
- [ ] Environment pipeline defined (dev → staging → production)
- [ ] Branch-to-environment mapping aligns with WS1 branching strategy
- [ ] Production deployment requires manual approval (minimum 2 approvers for banking)
- [ ] Deployment strategy supports zero-downtime and instant rollback
- [ ] Container registry selected with image tagging strategy
- [ ] SBOM generation configured for compliance
- [ ] Artifact retention policies defined
- [ ] Notification channels configured for failures and deployments
- [ ] Security findings generate critical notifications
- [ ] Pipeline secrets managed securely (no hardcoded credentials)
- [ ] OIDC or short-lived credentials used for cloud access
- [ ] Pipeline as code — all config in version control
- [ ] Branch protection rules prevent bypassing the pipeline
- [ ] PCI-DSS 6.2 (patching), 6.3 (secure dev), 6.3.2 (code review), 6.4 (change control), 10.5 (audit logs) addressed
- [ ] ISO 27001 A.12.1 (operational procedures) compliance evidence documented
- [ ] Estimated pipeline durations documented
