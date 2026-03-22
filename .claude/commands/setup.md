# Project Setup & DevOps — Master Orchestrator

You are running the Project Setup & DevOps phase for a MERN + TypeScript project. This orchestrator guides through all seven workstreams sequentially, ensuring each is complete before the next begins.

## Process Overview

| Step | Skill | Deliverable | Depends On |
|---|---|---|---|
| Pre-check | `/setup-check` | Existing setup scan, infrastructure inventory | — |
| WS1 | `/setup-repo` | Repository structure, branching strategy, monorepo tooling | Design sign-off |
| WS2 | `/setup-local-dev` | Docker Compose, dev scripts, seed data, onboarding guide | WS1 |
| WS3 | `/setup-typescript` | tsconfig files, build pipeline, path aliases, shared packages | WS1 |
| WS4 | `/setup-quality` | ESLint, Prettier, git hooks, commit convention, test config | WS3 |
| WS5 | `/setup-ci` | CI/CD pipelines, Docker builds, deployment strategy | WS4 |
| WS6 | `/setup-k8s` | Container orchestration, networking, observability, HA | WS5 |
| WS7 | `/setup-secrets` | Secrets management, env config, certificates, rotation | WS6 |
| Review | `/setup-review` | Cross-workstream consistency, compliance audit, sign-off | WS1-WS7 |

**Dependency graph** (strict sequential, each step requires its predecessors):
```
Pre-check
    └── WS1 (Repository Structure)
            ├── WS2 (Local Dev Environment)
            │       └── [uses WS1 repo layout]
            └── WS3 (TypeScript & Build)
                    └── WS4 (Code Quality Gates)    ← needs WS3 TypeScript config
                            └── WS5 (CI/CD Pipeline)     ← needs WS4 quality gates
                                    └── WS6 (Container Orchestration) ← needs WS5 deployment targets
                                            └── WS7 (Secrets Management) ← needs WS6 infrastructure
                                                    └── Review
```

Note: WS2 and WS3 can run in parallel after WS1, as they have no dependency on each other.

## Instructions

### Step 0: Pre-Flight

1. Check if `docs/setup/` directory exists. Create it if not.
2. Verify design sign-off exists: `docs/design/design-signoff.md`
   - If missing: warn the user that system design should be completed first. Show them `/design` to run it. Allow them to proceed if they insist, but log the risk.
3. Verify UI/UX sign-off exists: `docs/design/uiux/uiux-signoff.md`
   - If missing: warn but allow proceeding — UI/UX and Setup can run in parallel.
4. Run the pre-check (follow `/setup-check` instructions).
5. Present findings and ask the user whether to start fresh, resume, or update.

### Step 1: Execute Workstreams Sequentially

For each workstream (Pre-check → WS1 → WS2 → WS3 → WS4 → WS5 → WS6 → WS7 → Review):

1. **Announce** the workstream: "Starting [WS Name] — [brief description of goal]"
2. **Check pre-requisites** — if a dependency workstream's output is missing, stop and redirect the user
3. **Execute** the workstream following its skill instructions exactly
4. **Verify** the quality gate at the end of each workstream
5. **If quality gate fails**: resolve gaps with the user before moving on
6. **Save** the deliverable to `docs/setup/`
7. **Ask** the user: "[WS Name] is complete. Ready to proceed to [next WS]?"
   - If no: allow them to revisit or pause

### Step 2: Cross-Workstream Consistency Checks

Run automatically after WS3 (TypeScript & Build):
- Check that TypeScript config aligns with WS1 repository structure
- Verify shared package paths match the monorepo layout from WS1

Run automatically after WS5 (CI/CD Pipeline):
- Verify all WS4 quality gates are represented in CI pipeline stages
- Check that CI triggers align with WS1 branching strategy
- Confirm Docker build strategy aligns with WS2 Docker setup

Run automatically after WS7 (Secrets Management):
- Verify all secrets referenced in WS5 and WS6 are covered by WS7
- Check that secret injection strategy aligns with WS6 container config

### Step 3: Final Review

Execute the review (follow `/setup-review` instructions) which includes:
- Full cross-workstream consistency check
- Compliance audit (PCI-DSS, ISO 27001)
- Ambiguity log resolution
- Technical readiness checklist
- Phase gate sign-off

### Step 4: Completion Summary

After sign-off, present:

```
Project Setup & DevOps — Complete
=====================================
Workstreams Completed: [N/9]
Documents Generated:   [count]
  docs/setup/:         [list files]

Repository:           Configured
Local Dev:            Runnable
TypeScript:           Configured
Quality Gates:        [count] gates active
CI/CD Pipelines:      [count] pipelines configured
Infrastructure:       Designed
Secrets:              Managed
Compliance:           PCI-DSS [X/Y controls], ISO 27001 [X/Y controls]
Ambiguities:          [resolved/total]
Sign-Off:             [Approved/Conditional/Pending]

Next Phase Available:
  Step 5 — Development (Sprints):  Ready / Blocked (reason)

All deliverables saved to: docs/setup/
Next: Run /workflow to see the full SDLC picture
```

## Rules

- **Never skip a workstream** unless the user explicitly requests it — and document the skip with the reason
- **Never move to the next workstream** if the current quality gate has unresolved blockers
- **Respect the dependency order** — Quality Gates need TypeScript config, CI/CD needs Quality Gates, etc.
- **Always save deliverables** before moving on (never lose work in progress)
- **Reference design decisions** — every setup decision should trace back to an architecture decision, ADR, or NFR
- **Detect contradictions** — if a workstream decision conflicts with a prior one, stop and resolve before continuing
- **Support partial save** — each workstream supports pause/resume; honour "pause", "stop", or "save and continue later"
- **Do not invent requirements** — configure only what the design specifies; if something seems missing, ask
- **Banking compliance** — every decision must consider PCI-DSS and ISO 27001 implications; document compliance traceability

## Guiding Principle

> Setup is complete not when all the tools are configured, but when any developer on the team could clone the repo, run one command, and have a fully working development environment — with CI catching their mistakes before they reach a reviewer, and production deployments requiring exactly the right approvals. Infrastructure should be invisible to developers and auditable to compliance.
