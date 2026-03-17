# MCP Server Integration — Todo

## Tasks

- [x] Write tasks/todo.md
- [x] Patch authenticate.ts in progress-service, alert-service, team-service (add X-Service-Token)
- [x] Create services/mcp-server/package.json
- [x] Create services/mcp-server/tsconfig.json
- [x] Create services/mcp-server/.env.example
- [x] Create services/mcp-server/src/client.ts
- [x] Create services/mcp-server/src/tools/tasks.ts
- [x] Create services/mcp-server/src/tools/progress.ts
- [x] Create services/mcp-server/src/tools/alerts.ts
- [x] Create services/mcp-server/src/tools/teams.ts
- [x] Create services/mcp-server/src/resources/taskResource.ts
- [x] Create services/mcp-server/src/resources/teamResource.ts
- [x] Create services/mcp-server/src/resources/dashboardResource.ts
- [x] Create services/mcp-server/src/index.ts
- [x] Create services/mcp-server/mcp-config.json
- [x] Create services/mcp-server/tests/tools.test.ts
- [x] Build and verify TypeScript compilation
- [x] Commit and push

## Review

### Changes made

**New service:** `services/mcp-server/` — MCP stdio server with 10 tools + 4 resources

**Modified files (3):** Added X-Service-Token auth to `authenticate.ts` in progress-service,
alert-service, and team-service — mirrors the existing pattern in task-service.

**Key decisions:**
- `module: "node16"` tsconfig required because `@modelcontextprotocol/sdk` is `"type": "module"` and its exports map requires `.js` extension in require() paths
- Built `@task-tracker/utils` in node_modules to generate `dist/` for TypeScript type resolution
- `z.object()` inputSchema (not raw shape) avoids TS2589 type-depth errors
- All errors caught per-tool, returning `{ isError: true }` instead of throwing

### Build: ✓ (0 errors) | Tests: ✓ (17/17 pass) | Smoke: ✓ (MCP initialize responds correctly)

---

# Code Review Improvements Plan

## Priority 1 — Security (HIGH)

- [x] **ReDoS in task-service search**: escape user input with `replace(/[.*+?^${}()|[\]\\]/g, '\\$&')` before constructing RegExp
  - File: `services/task-service/src/repositories/taskRepository.ts`

- [x] **Fail-fast env validation in mcp-server**: validate `SERVICE_TOKEN` + all 4 service URLs at startup; `process.exit(1)` if missing
  - File: `services/mcp-server/src/index.ts`

- [x] **Restrict CORS in api-gateway**: lock to `CORS_ORIGIN` env var (default `http://localhost:3005`), `credentials: true`
  - File: `services/api-gateway/index.ts`

## Priority 2 — Error Handling (HIGH)

- [x] **Add try-catch to MCP resource handlers**: wrap all 3 resource handlers; return error text on failure
  - Files: `services/mcp-server/src/resources/*.ts`

- [x] **Extract shared ok/fail helpers**: created `src/utils/response.ts`; all 4 tool files now import from it

## Priority 3 — Type Safety (MEDIUM)

- [x] **Add HTTP timeout to mcp-server client**: `withTimeout()` (10s) wraps all `httpClient` calls via `Promise.race`
  - File: `services/mcp-server/src/client.ts`

## Priority 4 — Test Coverage (MEDIUM)

- [x] **Meaningful mcp-server tool tests**: 28 tests — 13 schema + 15 real tool invocation tests (success + error paths)
  - File: `services/mcp-server/tests/tools.test.ts`

## Review

### Build: ✓ (0 tsc errors) | Tests: ✓ (28/28 pass)
