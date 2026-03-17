import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as client from '../client.js';
import { ok, fail } from '../utils/response.js';

export function registerProgressTools(server: McpServer): void {
  server.registerTool('log_progress', {
    description: 'Log a progress update for a task with completion percentage and optional comment',
    inputSchema: {
      taskId:         z.string(),
      teamId:         z.string(),
      completionPct:  z.number().min(0).max(100),
      status:         z.enum(['not_started', 'in_progress', 'blocked', 'completed', 'cancelled']),
      comment:        z.string().optional(),
      nextUpdateDate: z.string().optional(),
    },
  }, async (args) => {
    try {
      return ok(await client.logProgress(args));
    } catch (err) {
      return fail(err);
    }
  });
}
