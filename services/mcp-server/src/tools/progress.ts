import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as client from '../client.js';

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
      const data = await client.logProgress(args);
      return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text' as const, text: `Error: ${(err as Error).message || err}` }], isError: true };
    }
  });
}
