import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as client from '../client.js';
import { ok, fail } from '../utils/response.js';

export function registerAlertTools(server: McpServer): void {
  server.registerTool('list_alerts', {
    description: 'List active alerts, optionally filtered by team, type, or severity',
    inputSchema: {
      teamId:   z.string().optional(),
      type:     z.enum(['past_due', 'update_overdue', 'behind_schedule', 'stalled']).optional(),
      severity: z.enum(['low', 'medium', 'high']).optional(),
    },
  }, async (args) => {
    try {
      return ok(await client.listAlerts(args as Record<string, string | undefined>));
    } catch (err) { return fail(err); }
  });

  server.registerTool('resolve_alert', {
    description: 'Resolve an active alert by ID',
    inputSchema: { id: z.string() },
  }, async ({ id }) => {
    try {
      return ok(await client.resolveAlert(id));
    } catch (err) { return fail(err); }
  });

  server.registerTool('run_alert_detection', {
    description: 'Trigger manual alert detection across all tasks',
  }, async () => {
    try {
      return ok(await client.runDetection());
    } catch (err) { return fail(err); }
  });
}
