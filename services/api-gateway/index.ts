import "dotenv/config";
import express, { RequestHandler } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { authenticate } from "./src/middleware/authenticate";
import { createProxy } from "./src/utils/proxy";
import services from "./src/config/services";
import { logger, requestLogger } from '@task-tracker/utils';
import { openapiSpec, swaggerUiHtml } from "./src/openapi";
import { metricsHandler } from "./src/metrics";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// app.use(express.json()); // intentionally off — gateway is a pass-through proxy

app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));
app.use(requestLogger);

// ── Health & docs (no auth) ────────────────────────────────────────────────
app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "api-gateway" }),
);

app.get("/api/docs", (_req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(swaggerUiHtml("/api/docs/openapi.json"));
});
app.get("/api/docs/openapi.json", (_req, res) => res.json(openapiSpec));

// ── Pre-build proxy middleware instances (reused across /api and /api/v1) ──
const proxyAuth              = createProxy(services.IDENTITY_URL, { "^/": "/auth/" });
const proxyUsers             = createProxy(services.IDENTITY_URL, { "^/": "/users/" });
const proxyApiKeys           = createProxy(services.IDENTITY_URL, { "^/": "/api-keys/" });
const proxyTeams             = createProxy(services.TEAM_URL,     { "^/": "/teams/" });
const proxyMembers           = createProxy(services.TEAM_URL,     { "^/": "/members/" });
const proxyImportTeams       = createProxy(services.TEAM_URL,     { "^/": "/import/teams/" });
const proxyImportMembers     = createProxy(services.TEAM_URL,     { "^/": "/import/members/" });
const proxyImportTeamMembers = createProxy(services.TEAM_URL,     { "^/": "/import/team-members/" });
const proxyTasks             = createProxy(services.TASK_URL,     { "^/": "/tasks/" });
const proxyImportTasks       = createProxy(services.TASK_URL,     { "^/": "/import/tasks/" });
const proxyProgress          = createProxy(services.PROGRESS_URL, { "^/": "/progress/" });
const proxyAlerts            = createProxy(services.ALERT_URL,    { "^/": "/alerts/" });
const proxyNotifications     = createProxy(services.NOTIFICATION_URL, { "^/": "/notifications/" });
const proxyPreferences       = createProxy(services.NOTIFICATION_URL, { "^/": "/preferences/" });
const proxySubscriptions     = createProxy(services.NOTIFICATION_URL, { "^/": "/subscriptions/" });

// ── Route registration helper: mount on /api/<path> AND /api/v1/<path> ─────
function mount(path: string, ...handlers: RequestHandler[]): void {
  app.use(`/api${path}`, ...handlers);
  app.use(`/api/v1${path}`, ...handlers);
}

// ── Auth (public) ──────────────────────────────────────────────────────────
mount("/auth", proxyAuth);

// ── Authenticated routes ───────────────────────────────────────────────────
mount("/users",              authenticate, proxyUsers);
mount("/teams",              authenticate, proxyTeams);
mount("/members",            authenticate, proxyMembers);
mount("/tasks",              authenticate, proxyTasks);
mount("/progress",           authenticate, proxyProgress);
mount("/alerts",             authenticate, proxyAlerts);
mount("/notifications",      authenticate, proxyNotifications);
mount("/preferences",        authenticate, proxyPreferences);
mount("/subscriptions",      authenticate, proxySubscriptions);
mount("/api-keys",           authenticate, proxyApiKeys);
mount("/import/teams",       authenticate, proxyImportTeams);
mount("/import/members",     authenticate, proxyImportMembers);
mount("/import/team-members",authenticate, proxyImportTeamMembers);
mount("/import/tasks",       authenticate, proxyImportTasks);

// ── Metrics (v1 only, no user auth — uses SERVICE_TOKEN internally) ────────
app.get("/api/v1/metrics", metricsHandler as RequestHandler);

app.use(
  "/api/audit/alerts",
  authenticate,
  createProxy(services.ALERT_URL, { "^/": "/audit/" }),
);

app.use(
  "/api/audit/users",
  authenticate,
  createProxy(services.IDENTITY_URL, { "^/": "/audit/" }),
);

app.use(
  "/api/audit/progress",
  authenticate,
  createProxy(services.PROGRESS_URL, { "^/": "/audit/" }),
);

app.use(
  "/api/audit/teams",
  authenticate,
  createProxy(services.TEAM_URL, { "^/": "/audit/" }),
);

app.use(
  "/api/audit",
  authenticate,
  createProxy(services.TASK_URL, { "^/": "/audit/" }),
);

// ── 404 catch-all ──────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { message: "Route not found" } });
});

app.listen(PORT, () => {
  logger.info("api-gateway started", { port: PORT });
});
