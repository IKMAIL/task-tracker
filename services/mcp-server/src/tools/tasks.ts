import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as client from '../client.js';
import { ok, fail } from '../utils/response.js';

const STATUS_ENUM = z.enum(['not_started', 'in_progress', 'blocked', 'completed', 'cancelled']);

export function registerTaskTools(server: McpServer): void {
  server.registerTool('list_tasks', {
    description: 'List tasks with optional filters by team, status, or category',
    inputSchema: {
      teamId:   z.string().optional(),
      status:   STATUS_ENUM.optional(),
      category: z.string().optional(),
      page:     z.string().optional(),
      limit:    z.string().optional(),
    },
  }, async (args) => {
    try {
      return ok(await client.listTasks(args as Record<string, string | undefined>));
    } catch (err) { return fail(err); }
  });

  server.registerTool('get_task', {
    description: 'Get full task detail including progress history',
    inputSchema: { id: z.string() },
  }, async ({ id }) => {
    try {
      const [task, progressHistory] = await Promise.all([
        client.getTask(id),
        client.getProgressHistory(id),
      ]);
      return ok({ task, progressHistory });
    } catch (err) { return fail(err); }
  });

  server.registerTool('create_task', {
    description: 'Create a new task',
    inputSchema: {
      title:            z.string(),
      category:         z.string(),
      assignedTeamId:   z.string(),
      plannedStartDate: z.string(),
      dueDate:          z.string(),
      description:      z.string().optional(),
    },
  }, async (args) => {
    try {
      return ok(await client.createTask(args));
    } catch (err) { return fail(err); }
  });

  server.registerTool('update_task', {
    description: 'Update task fields',
    inputSchema: {
      id:            z.string(),
      title:         z.string().optional(),
      status:        STATUS_ENUM.optional(),
      completionPct: z.number().min(0).max(100).optional(),
      description:   z.string().optional(),
    },
  }, async ({ id, ...fields }) => {
    try {
      return ok(await client.updateTask(id, fields));
    } catch (err) { return fail(err); }
  });
}
