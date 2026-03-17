import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { logger } from '@task-tracker/utils';

const REQUIRED_ENV = [
  'SERVICE_TOKEN',
  'TASK_SERVICE_URL',
  'PROGRESS_SERVICE_URL',
  'ALERT_SERVICE_URL',
  'TEAM_SERVICE_URL',
] as const;

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    process.stderr.write(`[mcp-server] missing required env var: ${key}\n`);
    process.exit(1);
  }
}

import { registerTaskTools }        from './tools/tasks.js';
import { registerProgressTools }    from './tools/progress.js';
import { registerAlertTools }       from './tools/alerts.js';
import { registerTeamTools }        from './tools/teams.js';
import { registerTaskResource }     from './resources/taskResource.js';
import { registerTeamResource }     from './resources/teamResource.js';
import { registerDashboardResources } from './resources/dashboardResource.js';

const server = new McpServer(
  { name: 'task-tracker', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } },
);

registerTaskTools(server);
registerProgressTools(server);
registerAlertTools(server);
registerTeamTools(server);
registerTaskResource(server);
registerTeamResource(server);
registerDashboardResources(server);

const transport = new StdioServerTransport();

server.connect(transport).then(() => {
  logger.info('mcp-server started', { transport: 'stdio' });
}).catch((err: Error) => {
  logger.error('mcp-server failed to start', { error: err.message });
  process.exit(1);
});
