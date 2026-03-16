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

- [ ] **ReDoS in task-service search**: `new RegExp(q, 'i')` uses raw user input — escape regex metacharacters
  - File: `services/task-service/src/repositories/taskRepository.ts` (search method)

- [ ] **Fail-fast env validation in mcp-server**: SERVICE_TOKEN and all service URLs must be validated on startup
  - File: `services/mcp-server/src/index.ts`

- [ ] **Restrict CORS in api-gateway**: `cors()` with no config allows any origin — restrict to configured origin
  - File: `services/api-gateway/index.ts`

## Priority 2 — Error Handling (HIGH)

- [ ] **Add try-catch to MCP resource handlers**: taskResource, teamResource, dashboardResource have unhandled promise rejections
  - Files: `services/mcp-server/src/resources/*.ts`

- [ ] **Extract shared ok/fail helpers**: `ok()` and `fail()` are duplicated across tasks.ts, alerts.ts, progress.ts
  - Extract to `services/mcp-server/src/utils/response.ts`; update tool files

## Priority 3 — Type Safety (MEDIUM)

- [ ] **Add HTTP timeout to mcp-server client**: fetch() calls have no timeout, can hang indefinitely
  - File: `services/mcp-server/src/client.ts`

## Priority 4 — Test Coverage (MEDIUM)

- [ ] **Meaningful mcp-server tool tests**: existing tests only validate schemas — add real tool invocation tests with mocked client
  - File: `services/mcp-server/tests/tools.test.ts`
