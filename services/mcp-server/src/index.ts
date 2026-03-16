import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { logger } from '@task-tracker/utils';
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
