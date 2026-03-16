import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as client from '../client.js';

function fail(err: unknown) {
  return { content: [{ type: 'text' as const, text: `Error: ${(err as Error).message || err}` }], isError: true };
}

export function registerTeamTools(server: McpServer): void {
  server.registerTool('list_teams', {
    description: 'List all teams',
  }, async () => {
    try {
      const data = await client.listTeams();
      return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
    } catch (err) { return fail(err); }
  });

  server.registerTool('get_team_summary', {
    description: 'Summarize team progress: task counts by status, average completion %, and active alert counts',
    inputSchema: { id: z.string() },
  }, async ({ id }) => {
    try {
      const [teamRes, tasksRes, alertsRes] = await Promise.all([
        client.getTeam(id),
        client.listTasks({ teamId: id, limit: '500' }),
        client.listAlerts({ teamId: id }),
      ]);

      const tasks  = ((tasksRes  as { tasks?:  unknown[] }).tasks  ?? []) as Array<{ status: string; completionPct?: number }>;
      const alerts = ((alertsRes as { alerts?: unknown[] }).alerts ?? []) as Array<{ severity: string }>;

      const taskCounts = tasks.reduce<Record<string, number>>((acc, t) => {
        acc[t.status] = (acc[t.status] ?? 0) + 1;
        return acc;
      }, {});

      const avgCompletion = tasks.length
        ? Math.round(tasks.reduce((sum, t) => sum + (t.completionPct ?? 0), 0) / tasks.length)
        : 0;

      const alertCounts = alerts.reduce<Record<string, number>>((acc, a) => {
        acc[a.severity] = (acc[a.severity] ?? 0) + 1;
        return acc;
      }, {});

      const summary = { team: teamRes, taskCounts, totalTasks: tasks.length, avgCompletion, alertCounts, totalAlerts: alerts.length };
      return { content: [{ type: 'text' as const, text: JSON.stringify(summary, null, 2) }] };
    } catch (err) { return fail(err); }
  });
}
