import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as client from '../client.js';

export function registerTaskResource(server: McpServer): void {
  server.registerResource(
    'task-detail',
    new ResourceTemplate('task-tracker://tasks/{id}', { list: undefined }),
    {
      description: 'Full task detail including progress history as structured text',
      mimeType: 'text/plain',
    },
    async (uri, { id }) => {
      const taskId = String(id);
      const [task, progressHistory] = await Promise.all([
        client.getTask(taskId),
        client.getProgressHistory(taskId),
      ]);
      const text = JSON.stringify({ task, progressHistory }, null, 2);
      return { contents: [{ uri: uri.href, mimeType: 'text/plain', text }] };
    },
  );
}
