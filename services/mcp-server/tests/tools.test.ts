import { z } from 'zod';
import * as client from '../src/client';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTaskTools } from '../src/tools/tasks';
import { registerAlertTools } from '../src/tools/alerts';
import { registerProgressTools } from '../src/tools/progress';
import { registerTeamTools } from '../src/tools/teams';

jest.mock('../src/client');
const mockedClient = client as jest.Mocked<typeof client>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeServer() {
  const server = new McpServer({ name: 'test', version: '0.0.0' });
  registerTaskTools(server);
  registerAlertTools(server);
  registerProgressTools(server);
  registerTeamTools(server);
  return server;
}

async function callTool(server: McpServer, name: string, args: Record<string, unknown>) {
  // Access registered tools via the internal _registeredTools map
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tool = (server as any)._registeredTools[name];
  if (!tool) throw new Error(`Tool not registered: ${name}`);
  return tool.handler(args, {} as never);
}

beforeEach(() => jest.clearAllMocks());

// ── Input schema validation ───────────────────────────────────────────────────

const STATUS_ENUM = z.enum(['not_started', 'in_progress', 'blocked', 'completed', 'cancelled']);

const listTasksSchema = z.object({
  teamId: z.string().optional(), status: STATUS_ENUM.optional(),
  category: z.string().optional(), page: z.string().optional(), limit: z.string().optional(),
});
const createTaskSchema = z.object({
  title: z.string(), category: z.string(), assignedTeamId: z.string(),
  plannedStartDate: z.string(), dueDate: z.string(), description: z.string().optional(),
});
const updateTaskSchema = z.object({
  id: z.string(), title: z.string().optional(), status: STATUS_ENUM.optional(),
  completionPct: z.number().min(0).max(100).optional(), description: z.string().optional(),
});
const logProgressSchema = z.object({
  taskId: z.string(), teamId: z.string(), completionPct: z.number().min(0).max(100),
  status: STATUS_ENUM, comment: z.string().optional(), nextUpdateDate: z.string().optional(),
});
const getTeamSummarySchema = z.object({ id: z.string() });

describe('list_tasks input schema', () => {
  it('accepts empty input', () => expect(listTasksSchema.safeParse({}).success).toBe(true));
  it('accepts valid status enum', () => expect(listTasksSchema.safeParse({ status: 'in_progress' }).success).toBe(true));
  it('rejects invalid status', () => expect(listTasksSchema.safeParse({ status: 'unknown' }).success).toBe(false));
});

describe('create_task input schema', () => {
  const valid = { title: 'T', category: 'C', assignedTeamId: 'tm1', plannedStartDate: '2026-03-01', dueDate: '2026-03-31' };
  it('accepts valid input', () => expect(createTaskSchema.safeParse(valid).success).toBe(true));
  it('rejects missing required fields', () => expect(createTaskSchema.safeParse({ title: 'Only title' }).success).toBe(false));
});

describe('update_task input schema', () => {
  it('accepts id-only update', () => expect(updateTaskSchema.safeParse({ id: 'abc' }).success).toBe(true));
  it('rejects completionPct > 100', () => expect(updateTaskSchema.safeParse({ id: 'x', completionPct: 150 }).success).toBe(false));
  it('rejects completionPct < 0', () => expect(updateTaskSchema.safeParse({ id: 'x', completionPct: -1 }).success).toBe(false));
});

describe('log_progress input schema', () => {
  const valid = { taskId: 't1', teamId: 'tm1', completionPct: 50, status: 'in_progress' as const };
  it('accepts valid input', () => expect(logProgressSchema.safeParse(valid).success).toBe(true));
  it('rejects missing taskId', () => expect(logProgressSchema.safeParse({ ...valid, taskId: undefined }).success).toBe(false));
  it('rejects completionPct out of range', () => expect(logProgressSchema.safeParse({ ...valid, completionPct: 101 }).success).toBe(false));
});

describe('get_team_summary schema', () => {
  it('requires id field', () => expect(getTeamSummarySchema.safeParse({}).success).toBe(false));
  it('accepts valid id', () => expect(getTeamSummarySchema.safeParse({ id: 'team123' }).success).toBe(true));
});

// ── Tool invocation tests ─────────────────────────────────────────────────────

describe('list_tasks tool', () => {
  it('returns ok response with data from client', async () => {
    const mockData = { tasks: [{ _id: 't1', title: 'Task A' }] };
    mockedClient.listTasks.mockResolvedValue(mockData);
    const server = makeServer();
    const result = await callTool(server, 'list_tasks', { teamId: 'tm1' });
    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toContain('Task A');
    expect(mockedClient.listTasks).toHaveBeenCalledWith({ teamId: 'tm1' });
  });

  it('returns isError on client failure', async () => {
    mockedClient.listTasks.mockRejectedValue(new Error('Service down'));
    const server = makeServer();
    const result = await callTool(server, 'list_tasks', {});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Service down');
  });
});

describe('get_task tool', () => {
  it('merges task and progress history', async () => {
    const mockTask = { _id: 't1', title: 'Task A', status: 'in_progress' };
    const mockHistory = [{ completionPct: 30 }];
    mockedClient.getTask.mockResolvedValue(mockTask);
    mockedClient.getProgressHistory.mockResolvedValue(mockHistory);
    const server = makeServer();
    const result = await callTool(server, 'get_task', { id: 't1' });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.task).toEqual(mockTask);
    expect(parsed.progressHistory).toEqual(mockHistory);
  });

  it('returns isError when task fetch fails', async () => {
    mockedClient.getTask.mockRejectedValue(new Error('Not found'));
    mockedClient.getProgressHistory.mockResolvedValue([]);
    const server = makeServer();
    const result = await callTool(server, 'get_task', { id: 'bad-id' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Not found');
  });
});

describe('create_task tool', () => {
  it('calls createTask and returns result', async () => {
    const newTask = { _id: 'new1', title: 'New Task' };
    mockedClient.createTask.mockResolvedValue(newTask);
    const server = makeServer();
    const args = { title: 'New Task', category: 'Dev', assignedTeamId: 'tm1', plannedStartDate: '2026-03-01', dueDate: '2026-03-31' };
    const result = await callTool(server, 'create_task', args);
    expect(result.isError).toBeFalsy();
    expect(JSON.parse(result.content[0].text)).toEqual(newTask);
    expect(mockedClient.createTask).toHaveBeenCalledWith(args);
  });
});

describe('update_task tool', () => {
  it('strips id and passes fields to updateTask', async () => {
    const updated = { _id: 't1', status: 'completed' };
    mockedClient.updateTask.mockResolvedValue(updated);
    const server = makeServer();
    const result = await callTool(server, 'update_task', { id: 't1', status: 'completed' });
    expect(result.isError).toBeFalsy();
    expect(mockedClient.updateTask).toHaveBeenCalledWith('t1', { status: 'completed' });
  });
});

describe('log_progress tool', () => {
  it('calls logProgress and returns result', async () => {
    const mockResult = { _id: 'p1', completionPct: 50 };
    mockedClient.logProgress.mockResolvedValue(mockResult);
    const server = makeServer();
    const args = { taskId: 't1', teamId: 'tm1', completionPct: 50, status: 'in_progress' as const };
    const result = await callTool(server, 'log_progress', args);
    expect(result.isError).toBeFalsy();
    expect(JSON.parse(result.content[0].text)).toEqual(mockResult);
  });
});

describe('list_alerts tool', () => {
  it('returns alerts from client', async () => {
    const mockAlerts = { alerts: [{ _id: 'a1', type: 'past_due', severity: 'high' }] };
    mockedClient.listAlerts.mockResolvedValue(mockAlerts);
    const server = makeServer();
    const result = await callTool(server, 'list_alerts', { severity: 'high' });
    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toContain('past_due');
  });

  it('returns isError on failure', async () => {
    mockedClient.listAlerts.mockRejectedValue(new Error('Alert service unavailable'));
    const server = makeServer();
    const result = await callTool(server, 'list_alerts', {});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Alert service unavailable');
  });
});

describe('resolve_alert tool', () => {
  it('calls resolveAlert with the id', async () => {
    mockedClient.resolveAlert.mockResolvedValue({ success: true });
    const server = makeServer();
    const result = await callTool(server, 'resolve_alert', { id: 'a1' });
    expect(result.isError).toBeFalsy();
    expect(mockedClient.resolveAlert).toHaveBeenCalledWith('a1');
  });
});

describe('run_alert_detection tool', () => {
  it('calls runDetection and returns result', async () => {
    const mockResult = { detected: 3 };
    mockedClient.runDetection.mockResolvedValue(mockResult);
    const server = makeServer();
    const result = await callTool(server, 'run_alert_detection', {});
    expect(result.isError).toBeFalsy();
    expect(JSON.parse(result.content[0].text)).toEqual(mockResult);
  });
});

describe('list_teams tool', () => {
  it('returns teams from client', async () => {
    const mockTeams = [{ _id: 'tm1', name: 'Team Alpha' }];
    mockedClient.listTeams.mockResolvedValue(mockTeams);
    const server = makeServer();
    const result = await callTool(server, 'list_teams', {});
    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toContain('Team Alpha');
  });
});

describe('get_team_summary tool', () => {
  it('computes task counts, avg completion, and alert counts', async () => {
    mockedClient.getTeam.mockResolvedValue({ _id: 'tm1', name: 'Team Alpha' });
    mockedClient.listTasks.mockResolvedValue({
      tasks: [
        { status: 'in_progress', completionPct: 40 },
        { status: 'in_progress', completionPct: 60 },
        { status: 'completed',   completionPct: 100 },
      ],
    });
    mockedClient.listAlerts.mockResolvedValue({
      alerts: [{ severity: 'high' }, { severity: 'medium' }],
    });
    const server = makeServer();
    const result = await callTool(server, 'get_team_summary', { id: 'tm1' });
    expect(result.isError).toBeFalsy();
    const summary = JSON.parse(result.content[0].text);
    expect(summary.taskCounts).toEqual({ in_progress: 2, completed: 1 });
    expect(summary.avgCompletion).toBe(67);
    expect(summary.alertCounts).toEqual({ high: 1, medium: 1 });
    expect(summary.totalAlerts).toBe(2);
  });

  it('handles empty task/alert lists without crashing', async () => {
    mockedClient.getTeam.mockResolvedValue({ _id: 'tm1', name: 'Empty Team' });
    mockedClient.listTasks.mockResolvedValue({ tasks: [] });
    mockedClient.listAlerts.mockResolvedValue({ alerts: [] });
    const server = makeServer();
    const result = await callTool(server, 'get_team_summary', { id: 'tm1' });
    expect(result.isError).toBeFalsy();
    const summary = JSON.parse(result.content[0].text);
    expect(summary.avgCompletion).toBe(0);
    expect(summary.totalTasks).toBe(0);
    expect(summary.totalAlerts).toBe(0);
  });

  it('returns isError when a service call fails', async () => {
    mockedClient.getTeam.mockRejectedValue(new Error('Team not found'));
    mockedClient.listTasks.mockResolvedValue({ tasks: [] });
    mockedClient.listAlerts.mockResolvedValue({ alerts: [] });
    const server = makeServer();
    const result = await callTool(server, 'get_team_summary', { id: 'bad' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Team not found');
  });
});
