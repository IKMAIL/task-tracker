export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Task Tracker API',
    version: '1.0.0',
    description:
      'REST API for Task Tracker. Authenticate with a user JWT (`Authorization: Bearer <jwt>`) ' +
      'or an API key (`Authorization: Bearer ttk_<key>`). API keys support scoped permissions.',
  },
  servers: [{ url: '/api', description: 'API Gateway' }],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT or ttk_<apikey>',
        description: 'JWT from /auth/login, or API key (ttk_ prefix) from /api-keys',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: { message: { type: 'string' } },
          },
        },
      },
      Task: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string', enum: ['Automation Testing Coverage', 'DR Dry Run', 'Active-Active Setup', 'LEAP Framework Adherence', 'Claude Code Adoption %', 'Open Operational Items', 'Security Risk Items'] },
          status: { type: 'string', enum: ['not_started', 'in_progress', 'blocked', 'completed', 'cancelled'] },
          completionPct: { type: 'number', minimum: 0, maximum: 100 },
          assignedTeamId: { type: 'string' },
          assignedPersonId: { type: 'string' },
          plannedStartDate: { type: 'string', format: 'date-time' },
          dueDate: { type: 'string', format: 'date-time' },
          nextUpdateDate: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Alert: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          taskId: { type: 'string' },
          teamId: { type: 'string' },
          type: { type: 'string', enum: ['past_due', 'update_overdue', 'behind_schedule', 'stalled'] },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
          message: { type: 'string' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ApiKey: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          prefix: { type: 'string', example: 'ttk_a1b2c3' },
          permissions: {
            type: 'array',
            items: { type: 'string', enum: ['tasks:read', 'tasks:write', 'progress:read', 'progress:write', 'alerts:read', 'alerts:write', 'teams:read', 'teams:write'] },
          },
          isActive: { type: 'boolean' },
          expiresAt: { type: 'string', format: 'date-time', nullable: true },
          lastUsedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  security: [{ BearerAuth: [] }],
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email and password',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } } } } },
        },
        responses: {
          200: { description: 'JWT token', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { token: { type: 'string' }, user: { type: 'object' } } } } } } } },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'List tasks',
        description: 'Requires `tasks:read` permission for API keys.',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'teamId', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: { description: 'Task list', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Task' } } } } } } },
          401: { description: 'Unauthorized' },
          403: { description: 'Insufficient permissions' },
        },
      },
      post: {
        tags: ['Tasks'],
        summary: 'Create a task',
        description: 'Requires `tasks:write` permission for API keys.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'category', 'assignedTeamId', 'plannedStartDate', 'dueDate'],
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  category: { type: 'string' },
                  assignedTeamId: { type: 'string' },
                  status: { type: 'string', default: 'not_started' },
                  completionPct: { type: 'number', default: 0 },
                  plannedStartDate: { type: 'string', format: 'date' },
                  dueDate: { type: 'string', format: 'date' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Created task' },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' },
          403: { description: 'Insufficient permissions' },
        },
      },
    },
    '/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Get a task by ID',
        description: 'Requires `tasks:read` permission for API keys.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Task detail' }, 404: { description: 'Not found' } },
      },
      put: {
        tags: ['Tasks'],
        summary: 'Update a task',
        description: 'Requires `tasks:write` permission for API keys.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } } },
        responses: { 200: { description: 'Updated task' }, 404: { description: 'Not found' } },
      },
    },
    '/tasks/summary': {
      get: {
        tags: ['Tasks'],
        summary: 'Get task counts by status and category',
        description: 'Requires `tasks:read` permission for API keys.',
        responses: { 200: { description: 'Summary data' } },
      },
    },
    '/progress': {
      post: {
        tags: ['Progress'],
        summary: 'Log a progress update',
        description: 'Requires `progress:write` permission for API keys. Commonly used in CI/CD pipelines.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['taskId', 'teamId', 'completionPct', 'status'],
                properties: {
                  taskId: { type: 'string' },
                  teamId: { type: 'string' },
                  completionPct: { type: 'number', minimum: 0, maximum: 100 },
                  status: { type: 'string' },
                  comment: { type: 'string' },
                  nextUpdateDate: { type: 'string', format: 'date' },
                },
              },
              example: { taskId: '...', teamId: '...', completionPct: 100, status: 'completed', comment: 'Deployed to prod in PR #42' },
            },
          },
        },
        responses: { 201: { description: 'Progress logged' }, 401: { description: 'Unauthorized' }, 403: { description: 'Insufficient permissions' } },
      },
    },
    '/progress/task/{taskId}': {
      get: {
        tags: ['Progress'],
        summary: 'Get progress history for a task',
        description: 'Requires `progress:read` permission for API keys.',
        parameters: [{ name: 'taskId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Progress history' } },
      },
    },
    '/alerts': {
      get: {
        tags: ['Alerts'],
        summary: 'List all active alerts',
        description: 'Requires `alerts:read` permission for API keys.',
        parameters: [
          { name: 'teamId', in: 'query', schema: { type: 'string' } },
          { name: 'severity', in: 'query', schema: { type: 'string', enum: ['low', 'medium', 'high'] } },
        ],
        responses: { 200: { description: 'Alert list', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Alert' } } } } } } } },
      },
    },
    '/alerts/{id}/resolve': {
      put: {
        tags: ['Alerts'],
        summary: 'Resolve an alert',
        description: 'Requires `alerts:write` permission for API keys.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Alert resolved' }, 404: { description: 'Not found' } },
      },
    },
    '/teams': {
      get: {
        tags: ['Teams'],
        summary: 'List all teams',
        description: 'Requires `teams:read` permission for API keys.',
        responses: { 200: { description: 'Team list' } },
      },
    },
    '/api-keys': {
      get: {
        tags: ['API Keys'],
        summary: 'List my API keys',
        description: 'Requires a user JWT (not an API key).',
        responses: { 200: { description: 'API key list (keyHash never returned)', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/ApiKey' } } } } } } } },
      },
      post: {
        tags: ['API Keys'],
        summary: 'Create an API key',
        description: 'The raw key is returned **once** in the response and never stored. Copy it immediately.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'permissions'],
                properties: {
                  name: { type: 'string', maxLength: 100, example: 'CI pipeline' },
                  permissions: {
                    type: 'array',
                    minItems: 1,
                    items: { type: 'string', enum: ['tasks:read', 'tasks:write', 'progress:read', 'progress:write', 'alerts:read', 'alerts:write', 'teams:read', 'teams:write'] },
                    example: ['tasks:read', 'progress:write'],
                  },
                  expiresAt: { type: 'string', format: 'date', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'API key created — copy the `key` field now',
            content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiKey' }, { type: 'object', properties: { key: { type: 'string', example: 'ttk_a1b2c3d4...' } } }] } } },
          },
        },
      },
    },
    '/api-keys/{id}': {
      delete: {
        tags: ['API Keys'],
        summary: 'Revoke (deactivate) an API key',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Key deactivated' }, 403: { description: 'Not your key' }, 404: { description: 'Not found' } },
      },
    },
  },
};

export const swaggerUiHtml = (specUrl: string): string => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Task Tracker API Docs</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '${specUrl}',
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: 'BaseLayout',
      deepLinking: true,
    });
  </script>
</body>
</html>`;
