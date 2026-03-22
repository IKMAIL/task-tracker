# Project Setup & DevOps Phase — Skills Implementation Plan

## Context
Create Claude Code slash commands for Phase 4 (Project Setup & DevOps) of the SDLC workflow. Target: MERN + TypeScript monorepo, on-prem Jenkins, OpenShift/K8s, banking compliance (PCI-DSS, ISO 27001).

## Skill Architecture

### Pre-check
- [ ] `setup-check.md` — Scan existing repo structure, Docker configs, CI files, env files, package.json, tsconfig

### Workstream Skills (7 workstreams, strict sequential)
- [ ] `setup-repo.md` — WS1: Repository Structure & Branching Strategy (monorepo layout, Gitflow, branch protection, PR templates)
- [ ] `setup-local-dev.md` — WS2: Local Dev Environment (Docker Compose, .env management, one-command startup, seed scripts)
- [ ] `setup-typescript.md` — WS3: TypeScript & Build Config (tsconfig.base.json, per-service configs, path aliases, strict mode)
- [ ] `setup-quality.md` — WS4: Code Quality Gates (ESLint, Prettier, Husky, lint-staged, commitlint, gitleaks)
- [ ] `setup-ci.md` — WS5: Jenkins CI Pipeline (Jenkinsfile, stages: install/lint/test/security/build/push/deploy, quality gates)
- [ ] `setup-k8s.md` — WS6: OpenShift/K8s Manifests (Kustomize base+overlays, deployments, services, ingress, security contexts)
- [ ] `setup-secrets.md` — WS7: Secrets & Environment Management (env strategy, OpenShift Secrets, rotation, logging redaction)

### Validation & Review
- [ ] `setup-review.md` — Phase Gate: Compliance checklist, environment verification, CI green, sign-off

### Orchestrator
- [ ] `setup.md` — Master orchestrator: runs pre-check → WS1-WS7 → review sequentially

### Updates
- [ ] Update `workflow.md` — Replace "coming soon" for Phase 4 with real commands
- [ ] Update `CLAUDE.md` — Add Phase 4 skill table
- [ ] Git: commit and push

## Dependency Graph
```
Pre-check (setup-check)
    └── WS1 (repo structure)
            └── WS2 (local dev) — needs repo layout
                    └── WS3 (TypeScript) — needs workspace structure
                            └── WS4 (quality gates) — needs TS config for ESLint
                                    └── WS5 (Jenkins CI) — needs quality tools, Docker
                                            └── WS6 (K8s manifests) — needs Docker images from CI
                                                    └── WS7 (secrets) — needs K8s + CI context
                                                            └── Review (compliance gate)
```

## Agent Assignment

### MERN Expert 1 → `setup-check.md` + `setup-repo.md`
- Pre-check: scan for existing configs (package.json, tsconfig, docker-compose, Jenkinsfile, k8s/)
- WS1: monorepo layout matching existing `services/` + `apps/` + `shared/` structure, Gitflow strategy, branch protection rules, PR templates

### MERN Expert 2 → `setup-local-dev.md` + `setup-typescript.md`
- WS2: Docker Compose for MongoDB + Redis + all services + frontend, .env.example, seed scripts, hot-reload, 30-min onboarding target
- WS3: tsconfig.base.json (strict, ES2022), per-service/app configs, path aliases (@shared/*), build scripts

### MERN Expert 3 → `setup-quality.md`
- WS4: ESLint with @typescript-eslint (no-explicit-any: error), Prettier, Husky pre-commit hooks, lint-staged, commitlint (conventional commits), gitleaks for secret scanning

### DevOps Expert 1 → `setup-ci.md`
- WS5: Full Jenkinsfile with K8s pod agent, parallel stages (lint+typecheck, unit tests, security scan), npm audit, SonarQube SAST, Docker build+push, staging auto-deploy, prod manual gate with named approvers

### DevOps Expert 2 → `setup-k8s.md`
- WS6: Kustomize base+overlays (staging/production), Deployments with health probes, Services, resource limits, security contexts (runAsNonRoot, readOnlyRootFilesystem), OpenShift SCC compliance

### DevOps Expert 3 → `setup-secrets.md` + `setup-review.md` + `setup.md` + updates
- WS7: Environment strategy (local .env / Jenkins credentials / OpenShift Secrets), secret rotation policy, logging redaction middleware, never-in-codebase rule
- Review: Full PCI-DSS + ISO 27001 compliance checklist, env verification, CI green gate
- Orchestrator: Sequential execution with dependency enforcement, cross-WS consistency checks
- Updates: workflow.md + CLAUDE.md

## Patterns to Follow (from existing skills)
Each skill MUST include:
1. Title + role description ("You are conducting WS[N]...")
2. Pre-Requisite section — check for dependency outputs
3. Instructions — walk through decisions one at a time, wait for user confirmation
4. Partial Save & Resume — auto-save after every 3 decisions, support pause/stop
5. Handling Incomplete Answers — log to ambiguity log, use [assumed] defaults
6. Behavioral Guardrails — no rephrase, no invention, reference prior phases
7. Contradiction Detection — flag conflicts with HLD, security arch, ADRs
8. Quality Gate — checklist with [ ] items
9. Output Location — save to `docs/setup/` (new directory)
10. Ambiguity log path: `docs/setup/ambiguity-log.md` (consistent single path)

## Banking Compliance Requirements (integrated into every skill)
- PCI-DSS: Req 3 (protect data), Req 6 (secure dev), Req 8 (auth), Req 10 (logging)
- ISO 27001: A.12.1.2 (change management), A.12.6 (vulnerability management), A.14.2 (secure dev)
- Branch protection, code review enforcement, SAST gating, secrets management, non-root containers, audit trails
