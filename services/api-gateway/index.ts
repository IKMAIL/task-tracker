import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { authenticate } from "./src/middleware/authenticate";
import { createProxy } from "./src/utils/proxy";
import services from "./src/config/services";
import path from "path";
import { logger, requestLogger } from "../../shared/utils/src/logger";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// app.use(express.json());

app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));
app.use(requestLogger);

app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "api-gateway" }),
);

app.use("/api/auth", createProxy(services.IDENTITY_URL, { "^/": "/auth/" }));

app.use(
  "/api/users",
  authenticate,
  createProxy(services.IDENTITY_URL, { "^/": "/users/" }),
);

app.use(
  "/api/teams",
  authenticate,
  createProxy(services.IDENTITY_URL, { "^/": "/teams/" }),
);

app.use(
  "/api/tasks",
  authenticate,
  createProxy(services.TASK_URL, { "^/": "/tasks/" }),
);

app.use(
  "/api/progress",
  authenticate,
  createProxy(services.PROGRESS_URL, { "^/": "/progress/" }),
);

app.use(
  "/api/alerts",
  authenticate,
  createProxy(services.ALERT_URL, { "^/": "/alerts/" }),
);

app.use((_req, res) => {
  res
    .status(404)
    .json({ success: false, error: { message: "Route not found" } });
});

app.listen(PORT, () => {
  logger.info("api-gateway started", { port: PORT });
});
