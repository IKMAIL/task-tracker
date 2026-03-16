import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as client from '../client.js';

export function registerTeamResource(server: McpServer): void {
  server.registerResource(
    'team-summary',
    new ResourceTemplate('task-tracker://teams/{id}/summary', { list: undefined }),
    {
      description: 'Team status summary: task counts, average completion %, active alerts',
      mimeType: 'text/plain',
    },
    async (uri, { id }) => {
      const teamId = String(id);
      const [teamRes, tasksRes, alertsRes] = await Promise.all([
        client.getTeam(teamId),
        client.listTasks({ teamId, limit: '500' }),
        client.listAlerts({ teamId }),
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

      const summary = {
        team: teamRes,
        taskCounts,
        totalTasks: tasks.length,
        avgCompletion,
        alertCounts,
        totalAlerts: alerts.length,
      };

      return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: JSON.stringify(summary, null, 2) }] };
    },
  );
}
