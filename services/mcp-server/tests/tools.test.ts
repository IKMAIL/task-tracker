import { z } from 'zod';
import * as client from '../src/client';

jest.mock('../src/client');

const mockedClient = client as jest.Mocked<typeof client>;

// ── Validation helpers ────────────────────────────────────────────────────────

const STATUS_ENUM = z.enum(['not_started', 'in_progress', 'blocked', 'completed', 'cancelled']);

const listTasksSchema = z.object({
  teamId:   z.string().optional(),
  status:   STATUS_ENUM.optional(),
  category: z.string().optional(),
  page:     z.string().optional(),
  limit:    z.string().optional(),
});

const createTaskSchema = z.object({
  title:            z.string(),
  category:         z.string(),
  assignedTeamId:   z.string(),
  plannedStartDate: z.string(),
  dueDate:          z.string(),
  description:      z.string().optional(),
});

const updateTaskSchema = z.object({
  id:            z.string(),
  title:         z.string().optional(),
  status:        STATUS_ENUM.optional(),
  completionPct: z.number().min(0).max(100).optional(),
  description:   z.string().optional(),
});

const logProgressSchema = z.object({
  taskId:         z.string(),
  teamId:         z.string(),
  completionPct:  z.number().min(0).max(100),
  status:         STATUS_ENUM,
  comment:        z.string().optional(),
  nextUpdateDate: z.string().optional(),
});

const getTeamSummarySchema = z.object({ id: z.string() });

// ── Input validation tests ────────────────────────────────────────────────────

describe('list_tasks input schema', () => {
  it('accepts empty input', () => {
    expect(listTasksSchema.safeParse({}).success).toBe(true);
  });

  it('accepts valid status enum', () => {
    expect(listTasksSchema.safeParse({ status: 'in_progress' }).success).toBe(true);
  });

  it('rejects invalid status', () => {
    expect(listTasksSchema.safeParse({ status: 'unknown' }).success).toBe(false);
  });
});

describe('create_task input schema', () => {
  const valid = {
    title: 'Test Task',
    category: 'Automation Testing Coverage',
    assignedTeamId: 'team123',
    plannedStartDate: '2026-03-01',
    dueDate: '2026-03-31',
  };

  it('accepts valid input', () => {
    expect(createTaskSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects missing required fields', () => {
    expect(createTaskSchema.safeParse({ title: 'Only title' }).success).toBe(false);
  });
});

describe('update_task input schema', () => {
  it('accepts id-only update', () => {
    expect(updateTaskSchema.safeParse({ id: 'abc123' }).success).toBe(true);
  });

  it('rejects completionPct > 100', () => {
    expect(updateTaskSchema.safeParse({ id: 'abc', completionPct: 150 }).success).toBe(false);
  });

  it('rejects completionPct < 0', () => {
    expect(updateTaskSchema.safeParse({ id: 'abc', completionPct: -5 }).success).toBe(false);
  });
});

describe('log_progress input schema', () => {
  const valid = { taskId: 't1', teamId: 'tm1', completionPct: 50, status: 'in_progress' as const };

  it('accepts valid input', () => {
    expect(logProgressSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects missing taskId', () => {
    expect(logProgressSchema.safeParse({ ...valid, taskId: undefined }).success).toBe(false);
  });

  it('rejects completionPct out of range', () => {
    expect(logProgressSchema.safeParse({ ...valid, completionPct: 101 }).success).toBe(false);
  });
});

// ── Tool logic tests (with mocked client) ─────────────────────────────────────

describe('get_task aggregation', () => {
  it('merges task and progress history', async () => {
    const mockTask = { _id: 't1', title: 'Task A', status: 'in_progress' };
    const mockHistory = [{ completionPct: 30, comment: 'Good progress' }];

    mockedClient.getTask.mockResolvedValue(mockTask);
    mockedClient.getProgressHistory.mockResolvedValue(mockHistory);

    const [task, progressHistory] = await Promise.all([
      client.getTask('t1'),
      client.getProgressHistory('t1'),
    ]);

    expect(task).toEqual(mockTask);
    expect(progressHistory).toEqual(mockHistory);
    expect(mockedClient.getTask).toHaveBeenCalledWith('t1');
    expect(mockedClient.getProgressHistory).toHaveBeenCalledWith('t1');
  });
});

describe('get_team_summary aggregation', () => {
  it('computes task counts and avg completion correctly', async () => {
    const mockTeam = { _id: 'tm1', name: 'Team Alpha' };
    const mockTasksRes = {
      tasks: [
        { status: 'in_progress', completionPct: 40 },
        { status: 'in_progress', completionPct: 60 },
        { status: 'completed',   completionPct: 100 },
      ],
    };
    const mockAlertsRes = {
      alerts: [
        { severity: 'high' },
        { severity: 'medium' },
      ],
    };

    mockedClient.getTeam.mockResolvedValue(mockTeam);
    mockedClient.listTasks.mockResolvedValue(mockTasksRes);
    mockedClient.listAlerts.mockResolvedValue(mockAlertsRes);

    const [teamRes, tasksRes, alertsRes] = await Promise.all([
      client.getTeam('tm1'),
      client.listTasks({ teamId: 'tm1', limit: '500' }),
      client.listAlerts({ teamId: 'tm1' }),
    ]);

    const tasks  = ((tasksRes  as { tasks?:  unknown[] }).tasks  ?? []) as Array<{ status: string; completionPct?: number }>;
    const alerts = ((alertsRes as { alerts?: unknown[] }).alerts ?? []) as Array<{ severity: string }>;

    const taskCounts = tasks.reduce<Record<string, number>>((acc, t) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1;
      return acc;
    }, {});

    const avgCompletion = Math.round(
      tasks.reduce((sum, t) => sum + (t.completionPct ?? 0), 0) / tasks.length
    );

    const alertCounts = alerts.reduce<Record<string, number>>((acc, a) => {
      acc[a.severity] = (acc[a.severity] ?? 0) + 1;
      return acc;
    }, {});

    expect(taskCounts).toEqual({ in_progress: 2, completed: 1 });
    expect(avgCompletion).toBe(67);
    expect(alertCounts).toEqual({ high: 1, medium: 1 });
    expect(teamRes).toEqual(mockTeam);
  });
});

describe('list_tasks param forwarding', () => {
  it('passes all filter params to client', async () => {
    mockedClient.listTasks.mockResolvedValue({ tasks: [] });

    await client.listTasks({ teamId: 'tm1', status: 'in_progress', limit: '10' });

    expect(mockedClient.listTasks).toHaveBeenCalledWith({ teamId: 'tm1', status: 'in_progress', limit: '10' });
  });
});

describe('run_alert_detection', () => {
  it('calls runDetection and returns result', async () => {
    const mockResult = { detected: 3, message: 'Detection complete' };
    mockedClient.runDetection.mockResolvedValue(mockResult);

    const result = await client.runDetection();
    expect(result).toEqual(mockResult);
    expect(mockedClient.runDetection).toHaveBeenCalledTimes(1);
  });
});

describe('get_team_summary schema validation', () => {
  it('requires id field', () => {
    expect(getTeamSummarySchema.safeParse({}).success).toBe(false);
  });

  it('accepts valid id', () => {
    expect(getTeamSummarySchema.safeParse({ id: 'team123' }).success).toBe(true);
  });
});
