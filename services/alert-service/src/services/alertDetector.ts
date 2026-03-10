import fetch from 'node-fetch';
import * as alertRepository from '../repositories/alertRepository';
import { AlertSeverity, AlertType } from '../models/Alert';
import { logger } from '@task-tracker/utils';

const BEHIND_THRESHOLD = 15;
const STALLED_DAYS = 7;

interface Task {
  _id: string;
  title: string;
  status: string;
  dueDate: string;
  plannedStartDate: string;
  nextUpdateDate?: string;
  lastUpdatedAt?: string;
  completionPct?: number;
  assignedTeamId: string;
}

const fetchActiveTasks = async (): Promise<Task[]> => {
  const url = `${process.env.TASK_SERVICE_URL}/tasks?limit=1000`;
  logger.debug('alert-detector: fetching active tasks', { url });
  const res = await fetch(url, { headers: { 'X-Service-Token': process.env.SERVICE_TOKEN || '' } });
  if (!res.ok) {
    logger.error('alert-detector: failed to fetch tasks', { status: res.status, url });
    throw new Error(`Failed to fetch tasks: HTTP ${res.status}`);
  }
  const body = await res.json() as { data?: Task[] };
  const active = (body.data || []).filter((t) => !['completed', 'cancelled'].includes(t.status));
  logger.debug('alert-detector: tasks fetched', { total: body.data?.length ?? 0, active: active.length });
  return active;
};

export const runDetection = async (): Promise<void> => {
  const tasks = await fetchActiveTasks();
  const now = new Date();
  logger.info('alert-detector: detection started', { activeTasks: tasks.length });
  for (const task of tasks) {
    await detectPastDue(task, now);
    await detectUpdateOverdue(task, now);
    await detectBehindSchedule(task, now);
    await detectStalled(task, now);
  }
  logger.info('alert-detector: detection completed', { activeTasks: tasks.length });
};

async function detectPastDue(task: Task, now: Date): Promise<void> {
  if (new Date(task.dueDate) < now) {
    await upsertAlert(task, 'past_due', 'high', `"${task.title}" is past its due date`, { dueDate: task.dueDate });
  } else {
    await alertRepository.resolveByTaskAndType(task._id, 'past_due');
  }
}

async function detectUpdateOverdue(task: Task, now: Date): Promise<void> {
  if (task.nextUpdateDate && new Date(task.nextUpdateDate) < now) {
    await upsertAlert(task, 'update_overdue', 'medium', `"${task.title}" has a missed update deadline`, { nextUpdateDate: task.nextUpdateDate });
  } else {
    await alertRepository.resolveByTaskAndType(task._id, 'update_overdue');
  }
}

async function detectBehindSchedule(task: Task, now: Date): Promise<void> {
  const start    = new Date(task.plannedStartDate);
  const due      = new Date(task.dueDate);
  const elapsed  = now.getTime() - start.getTime();
  const duration = due.getTime() - start.getTime();
  if (duration <= 0 || elapsed <= 0) return;
  const expectedPct = Math.min(100, Math.round((elapsed / duration) * 100));
  const delta = expectedPct - (task.completionPct || 0);
  if (delta >= BEHIND_THRESHOLD) {
    const severity: AlertSeverity = delta >= 30 ? 'high' : 'medium';
    await upsertAlert(
      task,
      'behind_schedule',
      severity,
      `"${task.title}" is ${delta}% behind expected progress (expected ${expectedPct}%, actual ${task.completionPct || 0}%)`,
      { expectedPct, actualPct: task.completionPct || 0, delta }
    );
  } else {
    await alertRepository.resolveByTaskAndType(task._id, 'behind_schedule');
  }
}

async function detectStalled(task: Task, now: Date): Promise<void> {
  if (task.status !== 'in_progress' || !task.lastUpdatedAt) {
    await alertRepository.resolveByTaskAndType(task._id, 'stalled');
    return;
  }
  const daysSince = (now.getTime() - new Date(task.lastUpdatedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince > STALLED_DAYS) {
    await upsertAlert(task, 'stalled', 'low', `"${task.title}" has had no update for ${Math.floor(daysSince)} days`, { daysSinceUpdate: Math.floor(daysSince) });
  } else {
    await alertRepository.resolveByTaskAndType(task._id, 'stalled');
  }
}

async function upsertAlert(
  task: Task,
  type: AlertType,
  severity: AlertSeverity,
  message: string,
  metadata: Record<string, unknown>
): Promise<void> {
  const existing = await alertRepository.findActiveByTaskAndType(task._id, type);
  if (!existing) {
    await alertRepository.create({ taskId: task._id as unknown as any, teamId: task.assignedTeamId as unknown as any, type, severity, message, metadata });
    logger.info('alert created', { taskId: task._id, type, severity });
  } else if (existing.severity !== severity || existing.message !== message) {
    await alertRepository.updateById(existing._id as unknown as string, { severity, message, metadata });
    logger.info('alert updated', { alertId: String(existing._id), taskId: task._id, type, severity });
  }
}
