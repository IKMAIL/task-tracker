import { httpClient } from '@task-tracker/utils';

const TASK_URL     = () => process.env.TASK_SERVICE_URL     || 'http://localhost:3002';
const PROGRESS_URL = () => process.env.PROGRESS_SERVICE_URL || 'http://localhost:3003';
const ALERT_URL    = () => process.env.ALERT_SERVICE_URL    || 'http://localhost:3004';
const TEAM_URL     = () => process.env.TEAM_SERVICE_URL     || 'http://localhost:3006';
const tok          = () => process.env.SERVICE_TOKEN;

function qs(params: Record<string, string | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') p.append(k, v);
  }
  return p.toString();
}

// ── Task service ──────────────────────────────────────────────────────────────

export const listTasks = (params: Record<string, string | undefined> = {}) =>
  httpClient.get(`${TASK_URL()}/tasks?${qs(params)}`, tok());

export const getTask = (id: string) =>
  httpClient.get(`${TASK_URL()}/tasks/${id}`, tok());

export const createTask = (body: unknown) =>
  httpClient.post(`${TASK_URL()}/tasks`, body, tok());

export const updateTask = (id: string, body: unknown) =>
  httpClient.put(`${TASK_URL()}/tasks/${id}`, body, tok());

// ── Progress service ──────────────────────────────────────────────────────────

export const logProgress = (body: unknown) =>
  httpClient.post(`${PROGRESS_URL()}/progress`, body, tok());

export const getProgressHistory = (taskId: string) =>
  httpClient.get(`${PROGRESS_URL()}/progress/task/${taskId}`, tok());

// ── Alert service ─────────────────────────────────────────────────────────────

export const listAlerts = (params: Record<string, string | undefined> = {}) =>
  httpClient.get(`${ALERT_URL()}/alerts?${qs(params)}`, tok());

export const resolveAlert = (id: string) =>
  httpClient.put(`${ALERT_URL()}/alerts/${id}/resolve`, {}, tok());

export const runDetection = () =>
  httpClient.post(`${ALERT_URL()}/alerts/run-detection`, {}, tok());

// ── Team service ──────────────────────────────────────────────────────────────

export const listTeams = () =>
  httpClient.get(`${TEAM_URL()}/teams`, tok());

export const getTeam = (id: string) =>
  httpClient.get(`${TEAM_URL()}/teams/${id}`, tok());
