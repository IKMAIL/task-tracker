import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as client from '../client.js';

export function registerDashboardResources(server: McpServer): void {
  server.registerResource(
    'active-alerts',
    'task-tracker://alerts/active',
    {
      description: 'All active alerts across all teams as a structured report',
      mimeType: 'text/plain',
    },
    async (uri) => {
      try {
        const data = await client.listAlerts({});
        return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        const text = `Error: ${(err as Error).message || err}`;
        return { contents: [{ uri: uri.href, mimeType: 'text/plain', text }] };
      }
    },
  );

  server.registerResource(
    'dashboard',
    'task-tracker://dashboard',
    {
      description: 'Global dashboard: team list, task counts by status, alert summary',
      mimeType: 'text/plain',
    },
    async (uri) => {
      try {
      const [teamsRes, tasksRes, alertsRes] = await Promise.all([
        client.listTeams(),
        client.listTasks({ limit: '500' }),
        client.listAlerts({}),
      ]);

      const tasks  = ((tasksRes  as { tasks?:  unknown[] }).tasks  ?? []) as Array<{ status: string; completionPct?: number }>;
      const alerts = ((alertsRes as { alerts?: unknown[] }).alerts ?? []) as Array<{ severity: string; type: string }>;

      const taskCounts = tasks.reduce<Record<string, number>>((acc, t) => {
        acc[t.status] = (acc[t.status] ?? 0) + 1;
        return acc;
      }, {});

      const avgCompletion = tasks.length
        ? Math.round(tasks.reduce((sum, t) => sum + (t.completionPct ?? 0), 0) / tasks.length)
        : 0;

      const alertsBySeverity = alerts.reduce<Record<string, number>>((acc, a) => {
        acc[a.severity] = (acc[a.severity] ?? 0) + 1;
        return acc;
      }, {});

      const alertsByType = alerts.reduce<Record<string, number>>((acc, a) => {
        acc[a.type] = (acc[a.type] ?? 0) + 1;
        return acc;
      }, {});

      const dashboard = {
        teams: teamsRes,
        taskCounts,
        totalTasks: tasks.length,
        avgCompletion,
        alertsBySeverity,
        alertsByType,
        totalAlerts: alerts.length,
      };

      return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: JSON.stringify(dashboard, null, 2) }] };
      } catch (err) {
        const text = `Error: ${(err as Error).message || err}`;
        return { contents: [{ uri: uri.href, mimeType: 'text/plain', text }] };
      }
    },
  );
}
