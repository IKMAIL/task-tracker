# Workstream 2 — Local Development Environment

You are conducting Workstream 2 of the Project Setup & DevOps phase. This workstream answers the question: **"How does a developer go from `git clone` to a fully running local environment in under 30 minutes?"**

This is a banking-grade MERN + TypeScript project. All decisions must account for PCI-DSS Requirement 6 (Develop and maintain secure systems) and ISO 27001 Annex A.14.2 (Secure development) audit requirements.

## Pre-Requisite

Check that these documents exist and read them:
- `docs/setup/repository-structure.md` — WS1 output (repo layout, branching, workspace tooling)
- `docs/setup/pre-check-report.md` — pre-check scan output
- `docs/design/high-level-design.md` — architecture decisions (services, ports, communication patterns)
- `docs/design/data-model.md` — database schemas, connection strategy
- `docs/design/security-architecture.md` — auth flows, secrets management

If any are missing, inform the user which ones and recommend completing the prerequisite phase first. Allow them to proceed if they choose, but log missing inputs to `docs/setup/ambiguity-log.md`.

Also read these if they exist (optional but valuable):
- `docs/requirements/technical-constraints.md` — technology choices, infrastructure decisions
- `docs/requirements/nonfunctional-requirements.md` — performance, availability targets
- `docs/design/api-contracts.md` — service inventory, ports, endpoint catalogue
- `docs/adr/` — all Architecture Decision Records
- Existing `docker-compose.yml` — current Docker config (if any)
- Existing `.env.example` files — current environment variable patterns

## Instructions

Walk through each decision **one at a time**. For each decision, present the options, trade-offs, and a recommendation grounded in the architecture documents and banking compliance requirements. Wait for user confirmation before moving on.

### Partial Save & Resume

- After every 3 decisions, auto-save progress to `docs/setup/local-dev-environment.draft.md` with a `## Progress` section noting which decisions are completed and which is next
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
- Reference specific architecture decisions, NFR targets, or ADRs when justifying recommendations (e.g., "Given the 6-service architecture from HLD Decision 1...")
- Use the project glossary consistently when it exists in `docs/requirements/business-context.md`

### Contradiction Detection

- If a Docker Compose setup contradicts the HLD service boundaries or port assignments, flag it: "The HLD specifies [X], but this approach uses [Y]. Which should we follow?"
- If an environment variable strategy contradicts the security architecture's secrets management, flag it: "The security architecture requires [X], but this approach provides [Y]. How should we reconcile?"
- If a decision contradicts an existing ADR, flag it: "ADR-[NNN] decided [X]. This approach contradicts that decision. Should we update the ADR or change the approach?"

### Decisions to Walk Through

**Decision 1: Docker Compose Architecture**

- Present the service topology for Docker Compose based on the HLD:
  - Which services run in containers vs natively (Node.js with hot-reload)?
  - Database containers: MongoDB (one per service or shared instance with multiple DBs?)
  - Supporting infrastructure: Redis (if caching layer in HLD), mail server (MailHog/Mailpit for dev)
- Options for development workflow:

  | Approach | Databases | Services | Frontend | Hot Reload | Complexity |
  |---|---|---|---|---|---|
  | Full Docker | In containers | In containers | In container | Via volumes | High — all in Docker |
  | Hybrid (recommended) | In containers | Native (nodemon) | Native (Vite) | Native — fastest | Low — best DX |
  | Native only | Local install | Native | Native | Native | Low — but MongoDB install required |

- Cross-reference: verify every service from HLD has a container or native run config
- Banking recommendation: Hybrid approach — databases in Docker for isolation and consistency, services native for fast iteration. Production parity is handled by CI/CD (WS5), not local dev
- Probe: "Do all developers have Docker Desktop or Podman available? Any corporate restrictions on container runtimes?"
- Probe: "Is there a minimum supported machine spec (RAM, CPU) we should design for?"

**Decision 2: Docker Compose Configuration**

- Present the `docker-compose.yml` structure:
  - Service definitions for each database (ports, volumes, health checks)
  - Network configuration (single bridge network or per-service networks?)
  - Volume strategy: named volumes vs bind mounts for data persistence
  - Resource limits for database containers (memory, CPU)
- Health check patterns for MongoDB:
  ```yaml
  healthcheck:
    test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
    interval: 10s
    timeout: 5s
    retries: 5
  ```
- Port mapping strategy — present the port plan from HLD:

  | Service | App Port | Container DB Port | Host DB Port |
  |---|---|---|---|
  | identity-service | 3001 | 27017 | 27017 |
  | task-service | 3002 | 27017 | 27018 |
  | progress-service | 3003 | 27017 | 27019 |
  | alert-service | 3004 | 27017 | 27020 |
  | web-frontend | 3005 | — | — |
  | team-service | 3006 | 27017 | 27021 |
  | api-gateway | 3000 | — | — |

- Cross-reference: verify ports match HLD component catalogue and existing code
- Probe: "Should we use a single MongoDB instance with multiple databases (simpler) or separate MongoDB containers per service (closer to production)?"

**Decision 3: Environment Variable Management**

- Present the `.env` strategy:
  - Root `.env` — shared variables (JWT_SECRET, SERVICE_TOKEN, NODE_ENV)
  - Per-service `.env` — service-specific variables (MONGO_URI, PORT, service-specific configs)
  - `.env.example` files — committed templates with placeholder values (never real secrets)
- Generation script: `scripts/generate-env.sh` that creates `.env` from `.env.example` with random secrets for local dev
- Variable naming conventions:
  - Prefix with service name for service-specific vars: `IDENTITY_MONGO_URI`, `TASK_MONGO_URI`
  - Or use identical names with different values per service directory
- Banking compliance:
  - `.env` files MUST be in `.gitignore` — verify this
  - `.env.example` MUST NOT contain real secrets — only placeholders like `<change-me>`
  - PCI-DSS 3.4: sensitive data must not be stored in plain text in version control
- Cross-reference: check existing `.env.example` files and `.gitignore` entries
- Probe: "Do you prefer a single root `.env` or per-service `.env` files? (Per-service maps closer to production where each service has its own secret store)"

**Decision 4: Development Scripts & npm Commands**

- Present the root-level npm scripts for developer workflow:
  ```json
  {
    "dev": "run all services + frontend with hot-reload",
    "dev:services": "run all backend services only",
    "dev:frontend": "run frontend only",
    "dev:infra": "docker-compose up -d (databases + infrastructure)",
    "dev:stop": "docker-compose down",
    "seed": "run database seeding scripts",
    "clean": "remove node_modules, dist, docker volumes"
  }
  ```
- Process manager options for running multiple services:

  | Tool | Parallel | Colored Output | Process Mgmt | Complexity |
  |---|---|---|---|---|
  | `concurrently` | Yes | Yes (color-coded) | Basic | Low |
  | `npm-run-all` / `run-p` | Yes | Yes | Basic | Low |
  | `turbo dev` | Yes | Yes | Advanced (caching) | Medium |
  | Custom shell script | Yes | Manual | Manual | Low |

- Banking recommendation: `concurrently` — simple, well-known, no additional infrastructure. Colored output per service aids debugging
- Per-service scripts (in each service's `package.json`):
  - `dev` — `nodemon` + `ts-node` (or `tsx`) for hot-reload
  - `build` — `tsc` to compile
  - `start` — `node dist/index.js` (production)
  - `test` — `jest`
- Probe: "Any preference for concurrently vs npm-run-all? Or do you already have one installed?"

**Decision 5: Database Seeding**

- Present the seeding strategy:
  - Seed script location: `scripts/seed.ts` or per-service `seeds/` directories
  - Seed data scope: minimal viable data for development (users, sample tasks, teams)
  - Seed user accounts with known credentials for local testing (never in production)
  - Idempotent seeds — safe to run multiple times (upsert pattern)
- Seed data requirements (cross-reference user stories from Phase 1):
  - Admin user, regular users (for RBAC testing)
  - Sample projects/tasks with various statuses
  - Sample teams with member assignments
  - Progress entries for reporting features
- Seed execution: `npm run seed` from root
- Banking compliance: seed data must NOT use production-like PII — use obviously fake data (e.g., "Jane Developer", "test@example.com")
- Probe: "What roles exist in the system? (We need at least one seed user per role for testing)"
- Probe: "Should the seed script also create sample alerts and progress entries, or just the core entities?"

**Decision 6: Developer Onboarding — bootstrap.sh**

- Present the first-time setup script (`scripts/bootstrap.sh`):
  ```bash
  #!/usr/bin/env bash
  # 1. Check prerequisites (Node.js version, Docker, npm)
  # 2. npm install (root — installs all workspaces)
  # 3. Generate .env files from .env.example
  # 4. Start infrastructure (docker-compose up -d)
  # 5. Wait for databases to be healthy
  # 6. Run seed scripts
  # 7. Print success message with service URLs
  ```
- Prerequisite checks:
  - Node.js version (from `engines` in package.json or `.nvmrc`)
  - Docker / Podman availability
  - npm version
  - Available ports (check if 3000-3006 and MongoDB ports are free)
- `.nvmrc` or `.node-version` file for consistent Node.js version
- Success output: table of service URLs for quick access
- Target: developer goes from `git clone` to running app in < 30 minutes
- Probe: "What Node.js version should we standardize on? (LTS recommended — currently 20.x or 22.x)"
- Probe: "Are there any corporate proxy or registry configurations developers need?"

### After All Decisions Are Made

Generate the **Local Development Environment Document** with these sections:

#### 1. Docker Compose Architecture

| Component | Type | Container/Native | Port | Purpose |
|---|---|---|---|---|
| MongoDB (identity) | Database | Container | 27017 | Identity service DB |
| ... | ... | ... | ... | ... |

Full `docker-compose.yml` specification (ready to use or adapt).

#### 2. Environment Variable Strategy

| Scope | File | Committed | Contains Secrets | Example |
|---|---|---|---|---|
| Shared | `.env` | No | Yes | JWT_SECRET, SERVICE_TOKEN |
| Per-service | `services/*/.env` | No | Yes | MONGO_URI |
| Template | `.env.example` | Yes | No (placeholders) | JWT_SECRET=\<change-me\> |

Full `.env.example` content for root and each service.

#### 3. Development Scripts

| Command | Description | What It Runs |
|---|---|---|
| `npm run dev` | Full stack with hot-reload | Infrastructure + all services + frontend |
| ... | ... | ... |

#### 4. Database Seeding

- Seed data catalogue (entities, counts, relationships)
- Seed user accounts table (username, role, password for local dev)
- Execution instructions

#### 5. Developer Onboarding

- Prerequisites checklist
- Step-by-step first-time setup
- `bootstrap.sh` specification
- Troubleshooting guide (common issues and fixes)

#### 6. Compliance Traceability

| Requirement | Standard | How Addressed | Evidence |
|---|---|---|---|
| No secrets in version control | PCI-DSS 3.4 | .env in .gitignore, .env.example has placeholders | .gitignore audit |
| Secure development environment | ISO 27001 A.14.2 | Isolated containers, no production data | Docker Compose config |
| Reproducible environments | ISO 27001 A.12.1.4 | Docker + .nvmrc + package-lock.json | Onboarding script |

#### 7. Key Assumptions

| ID | Assumption | Impact if Wrong | Mitigation |
|---|---|---|---|
| DEV-A001 | [assumption] | [impact] | [what we'd do] |

**Present the full document** to the user for review before saving.

**Save** to `docs/setup/local-dev-environment.md`

**Recommend** the user proceed to `/setup-typescript` (next workstream: WS3 — TypeScript & Build Configuration).

## Quality Gate

Before marking this workstream complete, confirm:
- [ ] Docker Compose configuration covers all services and databases from the HLD
- [ ] Every service port matches the HLD component catalogue — no port conflicts
- [ ] `.env.example` files exist for root and every service with placeholder values (no real secrets)
- [ ] `.env` files are in `.gitignore` — verified
- [ ] `npm run dev` command is defined and starts all services with hot-reload
- [ ] `npm run seed` command is defined with idempotent seed scripts
- [ ] Seed data includes at least one user per RBAC role
- [ ] Seed data uses obviously fake PII — not production-like data
- [ ] `bootstrap.sh` script covers prerequisites check, install, env generation, infra start, seed, and success message
- [ ] `.nvmrc` or `.node-version` specifies the agreed Node.js version
- [ ] Developer onboarding target is achievable in under 30 minutes
- [ ] No contradictions with HLD, security architecture, or folder structure from Phase 2
- [ ] PCI-DSS 3.4 (no plaintext secrets in VCS) compliance evidence documented
- [ ] ISO 27001 A.14.2 (secure development environment) compliance evidence documented
