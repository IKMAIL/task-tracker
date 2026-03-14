# Feature Suggestions

> **Current status:** Core task management, progress tracking, alert detection, team management, MS SSO, bulk CSV/Excel import, and a React SPA are all implemented. The following suggestions focus on innovative additions that would significantly expand the platform's capabilities.

---

## 1. MCP Server (Model Context Protocol) — AI Agent Integration

**The most innovative addition:** Build an MCP server that exposes the task-tracker as a tool for AI agents (Claude, Cursor, Copilot, etc.). This enables conversational task management without ever opening the UI.

### What it enables

```
User → Claude Desktop / Cursor / any MCP client
     → MCP Server (new: services/mcp-server/)
     → task-tracker API (via SERVICE_TOKEN)
```

**Example interactions:**

- _"What tasks are stalled for the DR Dry Run team?"_ → Claude queries alerts API, summarizes
- _"Mark task 'Active-Active Setup phase 2' as in_progress with 30% completion"_ → Claude calls progress API
- _"Which teams are behind schedule this week?"_ → Claude queries alert-service and summarizes
- _"Create tasks for our next sprint based on this requirements doc"_ → Claude bulk-creates via task API
- _"Give me a status report for the standup"_ → Claude aggregates across services and drafts a summary

### Implementation

New service: `services/mcp-server/` (Node.js + `@modelcontextprotocol/sdk`)

**MCP Tools to expose:**

| Tool                  | Description                                                        |
| --------------------- | ------------------------------------------------------------------ |
| `list_tasks`          | List/filter tasks by team, status, category                        |
| `get_task`            | Get full task detail including progress history                    |
| `create_task`         | Create a new task                                                  |
| `update_task`         | Update task fields                                                 |
| `log_progress`        | Log a progress update with completion % and comment                |
| `list_alerts`         | List active alerts by team/severity                                |
| `resolve_alert`       | Resolve an alert                                                   |
| `list_teams`          | List all teams and members                                         |
| `get_team_summary`    | Summarize team progress (task counts, completion %, active alerts) |
| `run_alert_detection` | Trigger manual alert detection                                     |

**MCP Resources to expose:**

| Resource URI                        | Description                         |
| ----------------------------------- | ----------------------------------- |
| `task-tracker://tasks/{id}`         | Full task detail as structured text |
| `task-tracker://teams/{id}/summary` | Team status summary                 |
| `task-tracker://alerts/active`      | All active alerts as a report       |
| `task-tracker://dashboard`          | Global dashboard data               |

**Key files to create:**

```
services/mcp-server/
  src/
    index.ts          # MCP server entry point (stdio transport)
    tools/
      tasks.ts        # list_tasks, get_task, create_task, update_task
      progress.ts     # log_progress, get_progress_history
      alerts.ts       # list_alerts, resolve_alert, run_detection
      teams.ts        # list_teams, get_team_summary
    resources/
      taskResource.ts
      teamResource.ts
      dashboardResource.ts
    client.ts         # internal HTTP client (uses SERVICE_TOKEN)
  package.json        # "@modelcontextprotocol/sdk", "zod"
  mcp-config.json     # for Claude Desktop registration
```

**`mcp-config.json` (for Claude Desktop):**

```json
{
  "mcpServers": {
    "task-tracker": {
      "command": "node",
      "args": ["services/mcp-server/dist/index.js"],
      "env": {
        "API_BASE_URL": "http://localhost:3000",
        "SERVICE_TOKEN": "<your-service-token>"
      }
    }
  }
}
```

---

## 2. Public REST API with API Key Authentication

Expose a versioned, documented public API (`/api/v1/...`) so external applications can integrate with the task-tracker without SSO.

### What it enables

- CI/CD pipelines updating task completion % after deployments
- External dashboards (Grafana, Tableau) pulling task metrics
- Mobile apps authenticating with API keys instead of JWT
- Other internal tools reading team/task status

### Implementation

**New: API key management** (extend identity-service)

```
POST   /api/v1/api-keys          # Create API key (name, permissions[], expiresAt)
GET    /api/v1/api-keys          # List my API keys
DELETE /api/v1/api-keys/:id      # Revoke API key
```

**API key model:**

```typescript
{
  keyHash: string,       // stored as bcrypt hash
  keyPrefix: string,     // first 8 chars shown in UI (e.g. "ttk_a1b2")
  name: string,
  ownerId: ObjectId,
  permissions: ('tasks:read' | 'tasks:write' | 'progress:write' | 'alerts:read')[],
  expiresAt: Date | null,
  lastUsedAt: Date,
  isActive: boolean
}
```

**Authentication:** `Authorization: Bearer ttk_<key>` header (gateway detects `ttk_` prefix vs JWT)

**New versioned endpoints (gateway-level routing):**

```
GET    /api/v1/tasks                    # List tasks
GET    /api/v1/tasks/:id                # Get task
POST   /api/v1/tasks/:id/progress       # Log progress (CI/CD hook)
GET    /api/v1/teams/:id/summary        # Team summary for dashboards
GET    /api/v1/alerts                   # Active alerts
GET    /api/v1/metrics                  # Prometheus-compatible metrics endpoint
```

**OpenAPI spec** (`docs/openapi.yaml`) auto-generated and served at `GET /api/v1/docs`.

**Example CI/CD integration:**

```yaml
# .github/workflows/deploy.yml
- name: Update task progress
  run: |
    curl -X POST https://task-tracker.internal/api/v1/tasks/$TASK_ID/progress \
      -H "Authorization: Bearer $TASK_TRACKER_API_KEY" \
      -d '{"completionPct": 100, "status": "completed", "comment": "Deployed to prod in PR #$PR_NUMBER"}'
```

---

## 3. Webhook System — Push Notifications to External Systems

Instead of polling, external systems receive HTTP POST notifications when events occur.

### Events

| Event                 | Trigger                              |
| --------------------- | ------------------------------------ |
| `task.created`        | New task created                     |
| `task.status_changed` | Task status changes                  |
| `task.completed`      | Task reaches 100% / status=completed |
| `alert.triggered`     | New alert created                    |
| `alert.resolved`      | Alert resolved                       |
| `progress.logged`     | Progress update recorded             |

### Implementation

**New: webhook management** (extend identity-service or new webhook-service)

```
POST   /api/webhooks          # Register webhook (url, events[], secret)
GET    /api/webhooks          # List my webhooks
PUT    /api/webhooks/:id      # Update webhook
DELETE /api/webhooks/:id      # Delete webhook
GET    /api/webhooks/:id/deliveries  # View delivery history
POST   /api/webhooks/:id/test       # Send test payload
```

**Delivery:** HMAC-SHA256 signed (`X-Webhook-Signature` header), with retry logic (3 attempts, exponential backoff).

**Payload example:**

```json
{
  "event": "alert.triggered",
  "timestamp": "2026-03-13T06:00:00Z",
  "data": {
    "alertId": "...",
    "type": "past_due",
    "severity": "high",
    "task": { "id": "...", "title": "DR Dry Run", "teamId": "..." }
  }
}
```

**Integration examples:**

- Post to Slack channel via Slack Incoming Webhooks
- Create Jira tickets on `alert.triggered`
- Trigger PagerDuty on HIGH severity alerts
- Update a status page (Statuspage.io) on task completion

---

## 4. Real-Time Updates via Server-Sent Events (SSE)

Replace the static UI with a live-updating dashboard. No page refreshes needed.

### What it enables

- Alert badge in header updates when new alerts are detected (cron runs at 06:00)
- Dashboard stats update when another user logs progress
- Team progress page refreshes without manual reload

### Implementation

New route in api-gateway or each service:

```
GET /api/stream/events   # SSE endpoint (auth via JWT query param or header)
```

**Events emitted:**

- `alert:new` — new alert created
- `alert:resolved` — alert resolved
- `progress:logged` — progress update (includes taskId, new %)
- `task:updated` — task status/fields changed

**Frontend:** `EventSource` in React, update Zustand/context state on event receipt.

**Tech:** Node.js `res.write()` with `text/event-stream`, or use `express-sse` package. No additional infrastructure needed (no WebSocket server).

---

## 5. AI-Powered Status Report Generator

A "Generate Report" feature that uses the Claude API to produce natural-language summaries.

### What it enables

- One-click standup report: _"Team Alpha has 3 tasks in progress, 1 behind schedule, 2 overdue. The biggest risk is 'Active-Active Setup' which is 40% behind linear expectation and due in 5 days."_
- Weekly executive summary across all teams
- Alert explanation: _"This task has been stalled because no progress update was logged since Feb 28, which was 13 days ago."_

### Implementation

New endpoint in a reporting-service or extend alert-service:

```
POST /api/reports/generate
Body: { type: 'standup' | 'weekly' | 'team_summary', teamId?: string, dateRange?: {...} }
```

The endpoint:

1. Aggregates data from task-service, progress-service, alert-service
2. Calls Claude API (`claude-sonnet-4-6`) with structured prompt + data
3. Streams response back to frontend

**Frontend:** "Generate Report" button on Dashboard and Alerts pages, shows markdown-rendered output.

**Key file:** `services/reporting-service/src/services/ReportGenerator.ts`

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function generateStandupReport(
  teamData: TeamSummary,
): Promise<string> {
  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Generate a concise standup report for this team data: ${JSON.stringify(teamData)}`,
      },
    ],
  });
  return stream.finalText();
}
```

---

## 6. Audit Log — Complete Change History

Every create/update/delete is recorded with who, what, and when. Essential for compliance and debugging.

### What it enables

- _"Who changed this task from in_progress to blocked?"_
- _"When was this alert first created?"_
- _"Show me all changes made by user X last week"_

### Implementation

New `audit_logs` collection in each service (or centralized audit-service):

```typescript
{
  resourceType: 'task' | 'alert' | 'progress' | 'team' | 'member' | 'user',
  resourceId: ObjectId,
  action: 'created' | 'updated' | 'deleted',
  actorId: ObjectId,
  actorEmail: string,
  changes: { field: string, from: unknown, to: unknown }[],  // diff
  timestamp: Date
}
```

**Implementation:** Mongoose `post('save')` and `post('findOneAndUpdate')` hooks — no changes to controllers.

**API:**

```
GET /api/audit?resourceType=task&resourceId=:id   # Changes for one resource
GET /api/audit?actorId=:userId&since=2026-03-01   # All changes by a user
```

**Frontend:** "History" tab in TaskDetail page showing a timeline of all changes.

---

## 7. Notification Center — In-App + Email

### In-app notifications

- Bell icon in header with unread count
- Notification feed: _"Alert: 'DR Dry Run' is past due (HIGH)"_, _"John logged progress on 'LEAP Framework': 75% complete"_
- Mark as read / clear all

### Email notifications

- Daily digest email at 07:00 UTC: list of active alerts for your teams
- Immediate email on HIGH severity alerts (`past_due`)
- Email when someone assigns a task to your team

### Implementation

New `notifications` collection in identity-service:

```typescript
{
  userId: ObjectId,
  type: 'alert_triggered' | 'progress_logged' | 'task_assigned',
  title: string,
  body: string,
  resourceType: string,
  resourceId: ObjectId,
  isRead: boolean,
  createdAt: Date
}
```

**API:**

```
GET  /api/notifications          # Get my notifications (unread first)
PUT  /api/notifications/read-all # Mark all as read
PUT  /api/notifications/:id/read # Mark one as read
```

**Email:** nodemailer + configurable SMTP (`.env: SMTP_HOST, SMTP_USER, SMTP_PASS`)

---

## 8. Advanced Analytics Dashboard

Replace the basic counts dashboard with meaningful trend data.

### Panels to add

| Panel                 | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| **Burndown chart**    | Remaining tasks vs time per team (recharts `LineChart`)     |
| **Alert frequency**   | Bar chart: alerts per week by type over last 90 days        |
| **Category health**   | Radar/spider chart: completion % per category               |
| **Time-to-complete**  | Average days from start to completion by category           |
| **Progress velocity** | How quickly teams are advancing completion % week-over-week |

### Implementation

New aggregation endpoints in task-service and progress-service:

```
GET /api/tasks/analytics/burndown?teamId=&startDate=&endDate=
GET /api/alerts/analytics/frequency?since=
GET /api/progress/analytics/velocity?teamId=
```

Use MongoDB aggregation pipelines (`$group`, `$bucket`, `$dateToString`). Frontend uses `recharts` for visualization.

---

## 9. Task Dependencies

Mark tasks as blocked by other tasks; surface blocking chains in the UI.

### What it enables

- _"Active-Active Setup is blocked by 'DR Dry Run' completion"_
- Visual dependency graph in task detail
- Alerts for cascading delays: _"Task A is past due and blocks Task B which is due in 3 days"_

### Implementation

Add to Task model in task-service:

```typescript
blockedBy: [{ type: ObjectId, ref: 'Task' }],
blocks: [{ type: ObjectId, ref: 'Task' }]  // denormalized for fast lookup
```

New alert type in alert-service: `dependency_at_risk` — triggered when a blocking task is past_due or stalled.

**Frontend:** "Dependencies" section in TaskDetail with linked task chips; dependency graph using `react-flow`.

---

## 10. Gantt / Timeline View

Visual timeline of all tasks plotted against their plannedStartDate → dueDate.

### What it enables

- Instantly see overlapping work across a team
- Identify date conflicts before they become alerts
- Drag to reschedule (updates dueDate via API)

### Implementation

New frontend page: `apps/web-frontend/src/pages/GanttPage.tsx`

Uses `dhtmlx-gantt` or `frappe-gantt` (lightweight, MIT licensed). Reads existing `plannedStartDate` and `dueDate` from tasks API. Color-coded by status. Filter by team/category.

---

## 11. Slack Integration

Post alerts and digests directly to Slack channels.

### What it enables

- _"#team-alerts: [HIGH] DR Dry Run is past due. Due: 2026-03-10. Assigned to: Team Alpha."_
- Daily digest in #standup channel
- Slash command: `/tasktracker status alpha-team` (via Slack bot)

### Implementation

Add to `.env`:

```
SLACK_BOT_TOKEN=xoxb-...
SLACK_ALERT_CHANNEL=#alerts
SLACK_DIGEST_CHANNEL=#standup
```

Extend alert-service to call Slack Web API (`@slack/web-api`) after alert upsert.

**Optional Slack bot** (new service): responds to slash commands by querying the task-tracker API.

---

## Summary Table

| Feature               | Impact     | Effort     | Type        |
| --------------------- | ---------- | ---------- | ----------- |
| MCP Server            | ⭐⭐⭐⭐⭐ | Medium     | AI/Agentic  |
| Public API + API Keys | ⭐⭐⭐⭐⭐ | Medium     | Integration |
| Webhook System        | ⭐⭐⭐⭐   | Medium     | Integration |
| Real-Time SSE         | ⭐⭐⭐⭐   | Low        | UX          |
| AI Report Generator   | ⭐⭐⭐⭐   | Low-Medium | AI          |
| Audit Log             | ⭐⭐⭐⭐   | Low        | Compliance  |
| Notification Center   | ⭐⭐⭐⭐   | Medium     | UX          |
| Analytics Dashboard   | ⭐⭐⭐     | Medium     | Reporting   |
| Task Dependencies     | ⭐⭐⭐     | Medium     | Core        |
| Gantt View            | ⭐⭐⭐     | Medium     | UX          |
| Slack Integration     | ⭐⭐⭐     | Low        | Integration |

---

## Recommended Implementation Order

1. **Audit Log** — Low effort, high compliance value, no breaking changes
2. **SSE Real-Time Updates** — Low effort, immediately improves UX
3. **Public API + API Keys** — Unlocks all external integrations
4. **Webhook System** — Builds on API keys, enables Slack/Jira/PagerDuty
5. **MCP Server** — Game-changer for AI-powered workflows
6. **AI Report Generator** — High demo value, leverages existing data
7. **Notification Center** — Email + in-app alerts
8. **Analytics Dashboard** — Uses existing data with aggregation pipelines
9. **Task Dependencies** — Adds depth to task modeling
10. **Gantt View + Slack** — Polish and team communication
