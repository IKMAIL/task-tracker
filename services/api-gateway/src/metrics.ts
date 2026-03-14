import { Request, Response } from 'express';
import { logger } from '@task-tracker/utils';
import services from './config/services';

const SERVICE_TOKEN = () => process.env.SERVICE_TOKEN!;

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, { headers: { 'X-Service-Token': SERVICE_TOKEN() } });
    if (!r.ok) return null;
    const body = await r.json() as { success: boolean; data: T };
    return body.data;
  } catch (err) {
    logger.warn('metrics: fetch failed', { url, error: (err as Error).message });
    return null;
  }
}

interface TaskSummaryItem {
  _id: { status: string; category: string };
  count: number;
}

interface AlertItem {
  type: string;
  severity: string;
  isActive: boolean;
}

function prometheusLine(metric: string, labels: Record<string, string>, value: number): string {
  const labelStr = Object.entries(labels)
    .map(([k, v]) => `${k}="${v}"`)
    .join(',');
  return `${metric}{${labelStr}} ${value}`;
}

export async function metricsHandler(_req: Request, res: Response): Promise<void> {
  const [summaryData, alertsData] = await Promise.all([
    fetchJson<TaskSummaryItem[]>(`${services.TASK_URL}/tasks/summary`),
    fetchJson<AlertItem[]>(`${services.ALERT_URL}/alerts`),
  ]);

  const lines: string[] = [];

  // ── Task counts by status ─────────────────────────────────────────────────
  const STATUS_LIST = ['not_started', 'in_progress', 'blocked', 'completed', 'cancelled'];
  const statusCounts: Record<string, number> = Object.fromEntries(STATUS_LIST.map((s) => [s, 0]));

  if (summaryData) {
    for (const item of summaryData) {
      const s = item._id?.status;
      if (s && s in statusCounts) statusCounts[s] += item.count;
    }
  }

  lines.push('# HELP task_tracker_tasks_total Number of tasks by status');
  lines.push('# TYPE task_tracker_tasks_total gauge');
  for (const [status, count] of Object.entries(statusCounts)) {
    lines.push(prometheusLine('task_tracker_tasks_total', { status }, count));
  }

  // ── Average completion % ──────────────────────────────────────────────────
  // Approximate from summary: sum(count) for each status weighted by typical %
  // Real average requires a separate aggregation endpoint; use 0 as fallback.
  // (A dedicated /tasks/stats endpoint could provide this in future.)
  lines.push('');
  lines.push('# HELP task_tracker_tasks_completed_total Number of completed tasks');
  lines.push('# TYPE task_tracker_tasks_completed_total gauge');
  lines.push(`task_tracker_tasks_completed_total ${statusCounts['completed']}`);

  // ── Alert counts by severity and type ────────────────────────────────────
  const alertBySeverity: Record<string, number> = { high: 0, medium: 0, low: 0 };
  const alertByType: Record<string, number> = {
    past_due: 0, update_overdue: 0, behind_schedule: 0, stalled: 0,
  };

  if (alertsData) {
    for (const alert of alertsData) {
      if (alert.isActive) {
        if (alert.severity in alertBySeverity) alertBySeverity[alert.severity]++;
        if (alert.type in alertByType) alertByType[alert.type]++;
      }
    }
  }

  lines.push('');
  lines.push('# HELP task_tracker_alerts_active Active alerts by severity');
  lines.push('# TYPE task_tracker_alerts_active gauge');
  for (const [severity, count] of Object.entries(alertBySeverity)) {
    lines.push(prometheusLine('task_tracker_alerts_active', { severity }, count));
  }

  lines.push('');
  lines.push('# HELP task_tracker_alerts_by_type Active alerts by type');
  lines.push('# TYPE task_tracker_alerts_by_type gauge');
  for (const [type, count] of Object.entries(alertByType)) {
    lines.push(prometheusLine('task_tracker_alerts_by_type', { type }, count));
  }

  res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.send(lines.join('\n') + '\n');
}
