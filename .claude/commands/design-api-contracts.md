# Workstream 3 — API Contract Design

You are conducting Workstream 3 of the System Design & Architecture phase. The goal is to design **the complete API surface** before any implementation code is written — allowing frontend and backend to develop in parallel.

## Pre-Requisite

Check that these documents exist and read them before starting:
- `docs/design/high-level-design.md` — communication patterns, auth strategy (from WS1)
- `docs/design/data-model.md` — entity schemas and TypeScript interfaces (from WS2)
- `docs/requirements/functional-requirements.md` — user stories, role-permission matrix
- `docs/requirements/technical-constraints.md` — API style choices (REST/GraphQL/tRPC)

WS2 must be complete — response shapes are derived from the data model. If it's missing, inform the user.

## Instructions

Design the full API grouped by resource/feature area. For each endpoint: define the route, method, request shape, response shape, auth requirements, and error cases.

### Partial Save & Resume

- After each resource group is designed, auto-save to `docs/design/api-contracts.draft.md`
- If the user says "pause" or "save and continue later": save immediately
- On resume: list which resource groups are complete and continue with the next

### Behavioral Guardrails

- Do not invent endpoints not implied by user stories or business rules — flag any additions: "This endpoint isn't directly in the requirements but seems necessary for [user story]. Confirm?"
- Response shapes must derive from the data model (WS2) — do not introduce fields not in the schemas
- Reference the role-permission matrix from Phase 3 to determine who can call each endpoint
- Do not assume error codes — use the standard catalogue defined below

### Contradiction Detection

- If a proposed endpoint contradicts the role-permission matrix, flag it: "Phase 3 says [Role] cannot [action], but this endpoint would allow it"
- If a response shape requires data not in the data model, flag it before proceeding

### Global Conventions (Agree Upfront)

Present these to the user for confirmation before designing endpoints:

```
Base URL:        /api/v1/
Auth header:     Authorization: Bearer <access_token>
Service token:   X-Service-Token: <token>   (for service-to-service calls)
Pagination:      GET /resources?page=1&limit=20&sortBy=createdAt&order=desc
Filtering:       GET /resources?status=active&assignedTo=<userId>
Success shape:   { success: true, data: <payload>, meta?: { total, page, limit } }
Error shape:     { success: false, error: { code: string, message: string, details?: any } }
Dates:           ISO 8601 UTC strings everywhere
IDs:             MongoDB ObjectId strings (24-char hex)
```

### Standard Error Code Catalogue

Define these before coding starts. Add domain-specific codes as needed:

| Code | HTTP Status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body/params failed validation |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `TOKEN_EXPIRED` | 401 | JWT has expired |
| `TOKEN_INVALID` | 401 | JWT is malformed or signature mismatch |
| `FORBIDDEN` | 403 | Authenticated but insufficient permissions |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Duplicate resource (e.g., email already taken) |
| `UNPROCESSABLE` | 422 | Business rule violation |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Endpoint Design Process

For each resource group (derived from user stories and entities):

**1. Auth Endpoints**

```
POST   /api/v1/auth/register       → Create account
POST   /api/v1/auth/login          → Email/password login → returns access + refresh tokens
POST   /api/v1/auth/refresh        → Exchange refresh token → new access token
DELETE /api/v1/auth/logout         → Invalidate refresh token
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/me             → Current user profile (requires auth)
```

If SSO/OAuth was selected in Phase 4:
```
GET    /api/v1/auth/[provider]           → Redirect to provider
GET    /api/v1/auth/[provider]/callback  → Handle OAuth callback
```

**2. Resource Endpoints (repeat for each entity)**

Follow REST conventions. Every route should read as plain English:

```
GET    /api/v1/[resources]         → List with filter/sort/paginate
POST   /api/v1/[resources]         → Create
GET    /api/v1/[resources]/:id     → Get one
PUT    /api/v1/[resources]/:id     → Full replace
PATCH  /api/v1/[resources]/:id     → Partial update
DELETE /api/v1/[resources]/:id     → Delete (soft or hard — specify)
```

Nested resources (use max 2 levels of nesting):
```
GET    /api/v1/[parents]/:id/[children]   → Children of a parent
POST   /api/v1/[parents]/:id/[children]   → Create child under parent
```

For each endpoint, document:

| Field | Value |
|---|---|
| Method + Route | `POST /api/v1/products` |
| Description | Create a new product |
| Auth | Required — roles: admin, manager |
| Request Body | `CreateProductRequest` |
| Success Response | `201 { success: true, data: Product }` |
| Error Responses | `400 VALIDATION_ERROR`, `403 FORBIDDEN`, `409 CONFLICT` |
| Business Rules | Ref: BR-005 (price must be > 0) |
| Rate Limit | 100/min per user |

**3. Action Endpoints (non-CRUD operations)**

Some operations don't map cleanly to CRUD. Use verb-based routes sparingly:

```
POST   /api/v1/orders/:id/submit       → State transition
POST   /api/v1/orders/:id/cancel
POST   /api/v1/users/:id/suspend
POST   /api/v1/reports/export          → Async job trigger
GET    /api/v1/reports/:jobId/status   → Poll async job status
```

**4. WebSocket Events (if applicable)**

If real-time features were confirmed in Phase 3 Q10:

| Event Name | Direction | Payload | Trigger |
|---|---|---|---|
| `notification:new` | Server → Client | `{ id, type, message, createdAt }` | New notification created |
| `task:updated` | Server → Client | `{ taskId, changes }` | Task updated by any user |
| `user:typing` | Client → Server | `{ roomId }` | User is typing |

### Shared TypeScript Types

Generate the shared types package. Both frontend and backend import from this:

```typescript
// shared/types/api.ts

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;  // field-level validation errors
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

// Request types (one per POST/PUT/PATCH endpoint)
export interface Create[Resource]Request { /* ... */ }
export interface Update[Resource]Request { /* ... */ }

// Response types (what the API returns — may differ from DB schema)
export interface [Resource]Response { /* ... */ }
export interface [Resource]ListResponse {
  items: [Resource]Response[];
  meta: PaginationMeta;
}
```

### After All Endpoints Are Designed

Generate **three deliverables**:

#### 1. OpenAPI Specification (openapi.yaml)

Generate a complete OpenAPI 3.0 spec covering:
- All endpoints with request/response schemas
- Security schemes (Bearer JWT)
- Reusable components (schemas, responses, parameters)
- Example request/response bodies

Save to `docs/design/openapi.yaml` (this becomes the mock server for frontend development).

#### 2. Shared TypeScript Types File

Full `shared/types/api.ts` with all request/response types.

#### 3. API Summary Table

| Method | Route | Auth | Roles | Description |
|---|---|---|---|---|
| POST | /api/v1/auth/login | No | Public | Email/password login |
| GET | /api/v1/users | Yes | Admin | List all users |
| ... | ... | ... | ... | ... |

**Present all deliverables** to the user for review before saving.

**Save** API contracts to `docs/design/api-contracts.md`
**Save** OpenAPI spec to `docs/design/openapi.yaml`
**Save** shared types to `shared/types/api.ts` (create if it doesn't exist)

**Recommend** the user proceed to `/design-security`

## Quality Gate

Before marking this workstream complete, confirm:
- [ ] Every user story from Phase 3 has at least one corresponding endpoint
- [ ] All endpoints have documented request/response shapes
- [ ] All endpoints reference the role-permission matrix for auth requirements
- [ ] Every possible error response is documented with an error code
- [ ] Pagination is designed for all list endpoints
- [ ] OpenAPI spec is complete and valid
- [ ] Shared TypeScript types cover all request/response shapes
- [ ] WebSocket events are documented (if real-time features are required)
- [ ] Global conventions (URL format, error shape, date format) are agreed and documented
- [ ] No endpoint introduces data not present in the WS2 data model
