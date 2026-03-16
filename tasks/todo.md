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
