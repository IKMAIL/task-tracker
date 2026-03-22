# Workstream 3 — TypeScript & Build Configuration

You are conducting Workstream 3 of the Project Setup & DevOps phase. This workstream answers the question: **"How is TypeScript configured across the monorepo to ensure type safety, consistent builds, and developer productivity?"**

This is a banking-grade MERN + TypeScript project. All decisions must account for PCI-DSS Requirement 6.5 (Address common coding vulnerabilities) and ISO 27001 Annex A.14.2 (Secure development) audit requirements.

## Pre-Requisite

Check that these documents exist and read them:
- `docs/setup/repository-structure.md` — WS1 output (monorepo layout, workspace tooling)
- `docs/setup/local-dev-environment.md` — WS2 output (Docker Compose, dev scripts, npm commands)
- `docs/setup/pre-check-report.md` — pre-check scan output
- `docs/design/folder-structure.md` — agreed folder structure from Phase 2 WS5
- `docs/design/high-level-design.md` — architecture decisions (service boundaries)
- `docs/design/api-contracts.md` — shared types, request/response shapes

If any are missing, inform the user which ones and recommend completing the prerequisite phase first. Allow them to proceed if they choose, but log missing inputs to `docs/setup/ambiguity-log.md`.

Also read these if they exist (optional but valuable):
- `docs/design/data-model.md` — TypeScript interfaces, Mongoose schemas
- `docs/design/security-architecture.md` — security requirements affecting type safety
- `docs/adr/` — all Architecture Decision Records
- Existing `tsconfig.base.json` or `tsconfig.json` — current TypeScript config (if any)
- Existing per-service `tsconfig.json` files

## Instructions

Walk through each decision **one at a time**. For each decision, present the options, trade-offs, and a recommendation grounded in the architecture documents and banking compliance requirements. Wait for user confirmation before moving on.

### Partial Save & Resume

- After every 3 decisions, auto-save progress to `docs/setup/typescript-build-config.draft.md` with a `## Progress` section noting which decisions are completed and which is next
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

- If a TypeScript config contradicts the Phase 2 folder structure (e.g., path aliases don't match agreed directory layout), flag it
- If a build strategy contradicts the HLD's module system or deployment approach, flag it
- If a decision contradicts an existing ADR, flag it: "ADR-[NNN] decided [X]. This approach contradicts that decision. Should we update the ADR or change the approach?"

### Decisions to Walk Through

**Decision 1: TypeScript Base Configuration**

- Present the root `tsconfig.base.json` options:

  | Option | Recommended | Alternative | Rationale |
  |---|---|---|---|
  | `target` | ES2020 | ES2022 | ES2020 covers Node 14+; ES2022 adds top-level await |
  | `module` | commonjs | NodeNext | commonjs for Express ecosystem compatibility |
  | `strict` | true | false | Banking compliance — strict catches type errors at compile time |
  | `esModuleInterop` | true | false | Required for importing CommonJS modules cleanly |
  | `skipLibCheck` | true | false | Faster builds; library types already verified by library authors |
  | `forceConsistentCasingInImports` | true | false | Prevents case-sensitivity bugs across OS |
  | `resolveJsonModule` | true | false | Allows importing JSON (config files, package.json) |
  | `declaration` | true | false | Emits .d.ts for shared packages |
  | `declarationMap` | true | false | Enables go-to-definition into shared package source |
  | `sourceMap` | true | false | Required for debugging and error stack traces |
  | `outDir` | `./dist` | `./build` | Consistent output directory across all packages |
  | `rootDir` | `./src` | `.` | Source files in src/, compiled output in dist/ |

- Banking recommendation: `strict: true` is non-negotiable — `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes` catch entire categories of bugs at compile time. PCI-DSS 6.5 requires addressing common coding vulnerabilities — strict TypeScript is a first-line defense
- Cross-reference: check existing `tsconfig.base.json` for any overrides
- Probe: "What Node.js version are you targeting? This affects the `target` and `lib` settings."
- Probe: "Are there any existing services using ES modules (`import`/`export`) or is everything CommonJS (`require`)?"

**Decision 2: Project References & Package Configs**

- Present the TypeScript project references strategy:
  - **Option A: Composite projects** — `tsconfig.json` in each package with `composite: true` and `references` in root
    - Pros: incremental builds, `tsc --build` understands dependency graph
    - Cons: more config files, references must be maintained
  - **Option B: Independent configs** — each package extends `tsconfig.base.json`, no references
    - Pros: simpler, each package builds independently
    - Cons: no incremental cross-package builds, shared types must be built first manually
  - **Option C: Path aliases only** — single tsconfig with path aliases, no project references
    - Pros: simplest setup
    - Cons: no separate build per package, harder to scale

- Per-package config template:
  ```json
  {
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
      "outDir": "./dist",
      "rootDir": "./src"
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist", "tests"]
  }
  ```

- Map every service and app to its tsconfig:
  - `services/identity-service/tsconfig.json`
  - `services/task-service/tsconfig.json`
  - `services/progress-service/tsconfig.json`
  - `services/alert-service/tsconfig.json`
  - `services/team-service/tsconfig.json`
  - `services/api-gateway/tsconfig.json`
  - `apps/web-frontend/tsconfig.json` (React — different settings)
  - `shared/utils/tsconfig.json`

- Cross-reference: verify every service from HLD has a tsconfig entry
- Probe: "Do you want incremental builds (faster rebuilds but more complex setup) or independent builds (simpler but slower)?"

**Decision 3: Shared Types Strategy**

- Present options for sharing TypeScript types across services:

  | Approach | Location | How Consumed | Versioning | Complexity |
  |---|---|---|---|---|
  | Workspace package | `shared/types/` | `import from '@task-tracker/types'` | Workspace-linked | Low-Medium |
  | Path aliases | `shared/types/` | `import from '@shared/types'` via tsconfig paths | Implicit (always latest) | Low |
  | Duplicated types | Per-service `types/` | Local imports | Independent | High (drift risk) |

- Types to share (cross-reference API contracts and data model):
  - Request/response DTOs from `docs/design/api-contracts.md`
  - Entity interfaces from `docs/design/data-model.md`
  - Shared enums (task status, user roles, alert types)
  - API error shapes
  - Common utility types

- Banking recommendation: workspace package (`@task-tracker/types`) — explicit dependency, versioned, auditable. Type duplication creates drift risk which can mask security bugs
- Probe: "Are the shared types in `docs/design/api-contracts.md` the authoritative source, or are there additional types to share?"

**Decision 4: Frontend TypeScript Configuration**

- React + TypeScript has different requirements from backend services:

  | Option | Backend (Services) | Frontend (React SPA) |
  |---|---|---|
  | `target` | ES2020 | ES2020 (Vite/webpack handles final target) |
  | `module` | commonjs | ESNext (tree-shaking requires ES modules) |
  | `jsx` | N/A | react-jsx (React 17+ transform) |
  | `lib` | ["ES2020"] | ["ES2020", "DOM", "DOM.Iterable"] |
  | `moduleResolution` | node | bundler (Vite) or node (CRA) |
  | `isolatedModules` | optional | true (required by most bundlers) |

- Frontend-specific concerns:
  - Path aliases: `@/` prefix for `src/` (e.g., `@/components/Button`)
  - Vite vs CRA: different tsconfig requirements
  - Strict mode: same as backend — `strict: true`
- Cross-reference: check `apps/web-frontend/tsconfig.json` for existing config
- Probe: "Is the frontend using Vite or Create React App (CRA)? This affects module resolution."

**Decision 5: Build Scripts & Type Checking**

- Present the build pipeline per package:
  - `npm run build` — `tsc` compilation to `dist/`
  - `npm run typecheck` — `tsc --noEmit` (type checking without output — faster for CI)
  - Root-level scripts:
    - `npm run build:all` — build all packages (respecting dependency order)
    - `npm run typecheck:all` — type-check all packages in parallel
- Build order (must respect dependencies):
  ```
  shared/utils → shared/types → services/* (parallel) → apps/* (parallel)
  ```
- CI integration:
  - `typecheck` runs as a separate CI stage (fast fail before tests)
  - `build` runs to verify compilation (catches runtime import issues)
- Incremental compilation:
  - `tsBuildInfoFile` for incremental builds (faster local rebuilds)
  - `.tsbuildinfo` files in `.gitignore`
- Probe: "Should `npm run build` at root build everything, or do you prefer building services individually?"

**Decision 6: Development Tooling Integration**

- Hot-reload configuration:
  - `nodemon` + `ts-node` (traditional — stable, well-known)
  - `tsx` (modern — faster, uses esbuild under the hood)
  - `ts-node-dev` (combines ts-node + nodemon — single dependency)
- nodemon.json template:
  ```json
  {
    "watch": ["src"],
    "ext": "ts,json",
    "ignore": ["dist", "node_modules", "tests"],
    "exec": "ts-node src/index.ts"
  }
  ```
- VS Code integration:
  - Recommend `tsconfig.json` paths for IntelliSense
  - `.vscode/settings.json` with TypeScript SDK path (use workspace version)
  - Debug launch configurations for each service
- Banking recommendation: `nodemon` + `ts-node` — proven, auditable, well-documented. `tsx` is faster but adds esbuild as a dependency to audit
- Probe: "Any IDE preference beyond VS Code? (affects recommended config files)"

### After All Decisions Are Made

Generate the **TypeScript & Build Configuration Document** with these sections:

#### 1. Base Configuration

Full `tsconfig.base.json` content with inline comments explaining each option.

#### 2. Per-Package Configurations

Table mapping each package to its tsconfig with key overrides:

| Package | Extends | Target | Module | JSX | Special Options |
|---|---|---|---|---|---|
| services/identity-service | tsconfig.base.json | ES2020 | commonjs | — | — |
| apps/web-frontend | tsconfig.base.json | ES2020 | ESNext | react-jsx | isolatedModules |
| shared/utils | tsconfig.base.json | ES2020 | commonjs | — | composite, declaration |
| ... | ... | ... | ... | ... | ... |

Full content of each `tsconfig.json` file.

#### 3. Shared Types Architecture

- Package structure for `shared/types/` (or `@task-tracker/types`)
- Type catalogue (entities, DTOs, enums, utility types)
- Import conventions and examples

#### 4. Build Pipeline

| Command | Scope | What It Does | When to Use |
|---|---|---|---|
| `npm run build` | Single package | `tsc` → dist/ | Before deployment |
| `npm run typecheck` | Single package | `tsc --noEmit` | Fast type validation |
| `npm run build:all` | All packages | Sequential build respecting deps | CI/CD |
| `npm run typecheck:all` | All packages | Parallel type check | CI/CD (fast fail) |

Build dependency graph (ASCII diagram).

#### 5. Development Tooling

- Hot-reload tool choice and configuration
- nodemon.json template
- VS Code recommended settings
- Debug launch configurations

#### 6. Compliance Traceability

| Requirement | Standard | How Addressed | Evidence |
|---|---|---|---|
| Address common vulnerabilities | PCI-DSS 6.5 | strict: true (noImplicitAny, strictNullChecks) | tsconfig.base.json |
| Secure development practices | ISO 27001 A.14.2 | Type safety prevents type confusion bugs | TypeScript strict mode |
| Code quality standards | PCI-DSS 6.3 | Consistent build configs, shared types prevent drift | Monorepo TypeScript setup |

#### 7. Key Assumptions

| ID | Assumption | Impact if Wrong | Mitigation |
|---|---|---|---|
| TS-A001 | [assumption] | [impact] | [what we'd do] |

**Present the full document** to the user for review before saving.

**Save** to `docs/setup/typescript-build-config.md`

**Recommend** the user proceed to `/setup-quality` (next workstream: WS4 — Code Quality Gates).

## Quality Gate

Before marking this workstream complete, confirm:
- [ ] `tsconfig.base.json` uses `strict: true` — non-negotiable for banking compliance
- [ ] Every service and app from the HLD has a corresponding `tsconfig.json`
- [ ] Frontend tsconfig correctly configured for React (jsx, lib, module, isolatedModules)
- [ ] Shared types strategy decided — workspace package or path aliases, not duplication
- [ ] Shared types catalogue covers all entities, DTOs, and enums from Phase 2 data model and API contracts
- [ ] Build scripts defined for individual packages and root-level aggregate commands
- [ ] Build dependency order documented (shared packages build before consumers)
- [ ] `typecheck` script exists as a fast-fail CI gate (separate from full build)
- [ ] Hot-reload tooling configured for backend services (nodemon/tsx/ts-node-dev)
- [ ] `.tsbuildinfo` files are in `.gitignore`
- [ ] No contradictions with HLD, folder structure, or API contracts from Phase 2
- [ ] PCI-DSS 6.5 (common vulnerabilities) addressed via strict TypeScript
- [ ] ISO 27001 A.14.2 (secure development) compliance evidence documented
