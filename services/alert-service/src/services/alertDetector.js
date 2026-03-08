const fetch = require('node-fetch');
const alertRepository = require('../repositories/alertRepository');

// How far behind schedule (in percentage points) before flagging
const BEHIND_THRESHOLD = 15;
// Days without update before marking stalled
const STALLED_DAYS = 7;

// Fetch all active (non-completed, non-cancelled) tasks from task-service
const fetchActiveTasks = async () => {
  const url = `${process.env.TASK_SERVICE_URL}/tasks?limit=1000`;
  const res = await fetch(url, {
    headers: { 'X-Service-Token': process.env.SERVICE_TOKEN },
  });
  if (!res.ok) throw new Error(`Failed to fetch tasks: HTTP ${res.status}`);
  const body = await res.json();
  return (body.data || []).filter((t) => !['completed', 'cancelled'].includes(t.status));
};

exports.runDetection = async () => {
  const tasks = await fetchActiveTasks();
  const now = new Date();
  console.log(`Alert detection: checking ${tasks.length} active tasks`);

  for (const task of tasks) {
    await detectPastDue(task, now);
    await detectUpdateOverdue(task, now);
    await detectBehindSchedule(task, now);
    await detectStalled(task, now);
  }
};

// 1. Due date has passed and task is not done
async function detectPastDue(task, now) {
  if (new Date(task.dueDate) < now) {
    await upsertAlert(task, 'past_due', 'high',
      `"${task.title}" is past its due date`,
      { dueDate: task.dueDate }
    );
  } else {
    await alertRepository.resolveByTaskAndType(task._id, 'past_due');
  }
}

// 2. nextUpdateDate has passed without a new update
async function detectUpdateOverdue(task, now) {
  if (task.nextUpdateDate && new Date(task.nextUpdateDate) < now) {
    await upsertAlert(task, 'update_overdue', 'medium',
      `"${task.title}" has a missed update deadline`,
      { nextUpdateDate: task.nextUpdateDate }
    );
  } else {
    await alertRepository.resolveByTaskAndType(task._id, 'update_overdue');
  }
}

// 3. Completion % is significantly behind linear time-based expectation
async function detectBehindSchedule(task, now) {
  const start    = new Date(task.plannedStartDate);
  const due      = new Date(task.dueDate);
  const elapsed  = now - start;
  const duration = due - start;

  if (duration <= 0 || elapsed <= 0) return;

  const expectedPct = Math.min(100, Math.round((elapsed / duration) * 100));
  const delta = expectedPct - (task.completionPct || 0);

  if (delta >= BEHIND_THRESHOLD) {
    const severity = delta >= 30 ? 'high' : 'medium';
    await upsertAlert(task, 'behind_schedule', severity,
      `"${task.title}" is ${delta}% behind expected progress (expected ${expectedPct}%, actual ${task.completionPct || 0}%)`,
      { expectedPct, actualPct: task.completionPct || 0, delta }
    );
  } else {
    await alertRepository.resolveByTaskAndType(task._id, 'behind_schedule');
  }
}

// 4. In-progress task with no update for STALLED_DAYS days
async function detectStalled(task, now) {
  if (task.status !== 'in_progress' || !task.lastUpdatedAt) {
    await alertRepository.resolveByTaskAndType(task._id, 'stalled');
    return;
  }
  const daysSince = (now - new Date(task.lastUpdatedAt)) / (1000 * 60 * 60 * 24);
  if (daysSince > STALLED_DAYS) {
    await upsertAlert(task, 'stalled', 'low',
      `"${task.title}" has had no update for ${Math.floor(daysSince)} days`,
      { daysSinceUpdate: Math.floor(daysSince) }
    );
  } else {
    await alertRepository.resolveByTaskAndType(task._id, 'stalled');
  }
}

// Idempotent: one active alert per task per type
async function upsertAlert(task, type, severity, message, metadata) {
  const existing = await alertRepository.findActiveByTaskAndType(task._id, type);
  if (!existing) {
    await alertRepository.create({
      taskId:   task._id,
      teamId:   task.assignedTeamId,
      type, severity, message, metadata,
    });
  } else if (existing.severity !== severity || existing.message !== message) {
    await alertRepository.updateById(existing._id, { severity, message, metadata });
  }
}
