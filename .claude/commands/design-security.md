# Workstream 4 — Security Architecture

You are conducting Workstream 4 of the System Design & Architecture phase. The goal is to design the **complete security implementation** — not just what security is needed (that was Phase 4 NFRs), but exactly how it is implemented in a MERN + TypeScript stack.

## Pre-Requisite

Check that these documents exist and read them before starting:
- `docs/design/high-level-design.md` — auth strategy decision, token storage choice (from WS1)
- `docs/design/api-contracts.md` — endpoints and their auth requirements (from WS3)
- `docs/requirements/nonfunctional-requirements.md` — security checklist, compliance obligations, NFR targets
- `docs/requirements/functional-requirements.md` — role-permission matrix

If the HLD auth decision is missing, this workstream cannot proceed — the entire security architecture flows from that decision. Inform the user and direct them to WS1.

## Instructions

Walk through each security domain one at a time. For each domain, the HLD and NFR decisions are the inputs — this workstream designs the implementation details.

### Partial Save & Resume

- After each security domain is complete, auto-save to `docs/design/security-architecture.draft.md`
- If the user says "pause" or "save and continue later": save immediately
- On resume: list completed domains and continue with the next

### Behavioral Guardrails

- Do not weaken security decisions from the HLD or NFR phase without explicit user confirmation and a documented trade-off
- Present security trade-offs clearly — the user must make an informed decision
- If a security control adds complexity that wasn't in the requirements, flag it: "This adds [X complexity] to implement. Is this required or optional?"
- Reference Phase 4 security checklist items as you address them — mark each as "Designed ✓" or "Deferred"

### Contradiction Detection

- If an implementation approach conflicts with an NFR (e.g., a CSP policy that breaks a required third-party script), flag it and offer alternatives
- If the role-permission matrix from Phase 3 is inconsistent with the auth strategy, resolve before proceeding

### Security Domains to Design

**Domain 1: Authentication Implementation**

Based on the HLD auth strategy decision:

If **JWT + Refresh Token Rotation**:
```
Access token:   RS256 or HS256, 15-minute lifetime
Refresh token:  Stored in MongoDB (hashed), 7-day lifetime, rotated on each use
Storage:        [httpOnly cookie / localStorage — from HLD decision]
```

Design the full token lifecycle:
- Login: credential verification → issue access + refresh tokens
- Silent refresh: intercept 401 → call /auth/refresh → retry original request
- Rotation: on refresh, invalidate old refresh token, issue new one (prevents replay attacks)
- Revocation: how are tokens invalidated? (Redis denylist, DB status flag, token family tracking)
- Logout: invalidate refresh token, clear cookie/localStorage

If **OAuth/SSO** (from Phase 4 requirements):
- Document the full OAuth 2.0 Authorization Code flow with PKCE
- State parameter generation and validation (CSRF on OAuth)
- How provider identity maps to local user accounts (email matching, account linking)
- What happens if a user's SSO account is deleted?

**Domain 2: Authorization (RBAC)**

Design the implementation of the role-permission matrix from Phase 3:

```typescript
// middleware/authorize.ts
// Middleware factory: authorize(['admin', 'manager'])
// Applied per-route in the routes layer
```

- Where is the role stored? (JWT claim vs database lookup on each request)
- JWT claim: faster, but role changes don't take effect until token refresh
- DB lookup: always current, but adds DB call to every request
- Recommendation based on how frequently roles change in this system

Resource-level permissions (if needed):
- Does a user own a resource? (e.g., can only edit their own profile)
- Team/organisation-scoped access? (multi-tenancy patterns)
- Document the permission check order: route-level → resource-level

**Domain 3: Input Validation & Sanitization**

For each layer:

*API Gateway / Express:*
- Validation library: Zod (TypeScript-first, infer types from schemas) or Joi
- Validation middleware pattern: validate request body, params, query against schema before reaching controller
- NoSQL injection prevention: never pass unsanitised user input directly to MongoDB queries; use `$eq` operators, parameterised queries
- XSS prevention: if storing user-generated HTML, use DOMPurify on write or a whitelist sanitizer

```typescript
// Pattern: validate before controller
router.post('/products', validateBody(createProductSchema), productController.create);
```

*Frontend:*
- Form validation: React Hook Form + Zod resolver (shared schemas from shared/types)
- Sanitize any content rendered as HTML (dangerouslySetInnerHTML should never be used with user input)

**Domain 4: Transport Security**

- TLS 1.2+ for all communications (enforced at load balancer / nginx)
- HTTP → HTTPS redirect (301)
- HSTS header: `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- Certificate management: Let's Encrypt / cloud provider certificates, auto-renewal

For service-to-service communication (if microservices):
- Mutual TLS (mTLS) or shared service token (`X-Service-Token` header)
- Internal network traffic: encrypted even inside the VPC? (document decision)

**Domain 5: HTTP Security Headers**

Design the complete header set for the Express app:

```typescript
// Use helmet.js — configure each header explicitly, don't rely on defaults

Content-Security-Policy:    "default-src 'self'; script-src 'self' [approved CDNs]; ..."
Strict-Transport-Security:  "max-age=31536000; includeSubDomains"
X-Frame-Options:            "DENY"
X-Content-Type-Options:     "nosniff"
Referrer-Policy:            "strict-origin-when-cross-origin"
Permissions-Policy:         "camera=(), microphone=(), geolocation=()"
```

Document every CSP directive and why it's allowed. Third-party scripts (analytics, fonts, CDNs) each require a `script-src` or `style-src` entry — enumerate them all.

**Domain 6: CORS Policy**

Design the per-environment CORS configuration:

| Environment | Allowed Origins | Credentials | Methods | Max Age |
|---|---|---|---|---|
| Development | `http://localhost:3000` | true | GET,POST,PUT,PATCH,DELETE | 86400 |
| Staging | `https://staging.example.com` | true | GET,POST,PUT,PATCH,DELETE | 86400 |
| Production | `https://example.com` | true | GET,POST,PUT,PATCH,DELETE | 86400 |

- Never use `origin: '*'` with `credentials: true` (browser blocks it anyway)
- Preflight caching: `maxAge` reduces OPTIONS requests

**Domain 7: Rate Limiting**

Design rate limits per endpoint tier (from Phase 4 Q12c):

| Tier | Endpoints | Limit | Window | Response |
|---|---|---|---|---|
| Auth | POST /auth/login, /auth/register | 10 req | 15 min | 429 + Retry-After |
| Write | POST/PUT/PATCH any resource | 60 req | 1 min | 429 |
| Read | GET any resource | 300 req | 1 min | 429 |
| Public | Unauthenticated endpoints | 20 req | 1 min | 429 |

Implementation:
- `express-rate-limit` + Redis store (`rate-limit-redis`) for distributed environments
- Key by: IP address for unauthenticated, userId for authenticated
- Exponential backoff on repeated violations?
- Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

**Domain 8: Secrets Management**

Design how secrets are handled across environments:

- Secret types: JWT_SECRET, DB credentials, API keys, service tokens, OAuth client secrets
- Development: `.env` file (gitignored), validated on startup with Zod/envalid
- CI/CD: injected as environment variables from the secrets manager
- Production: AWS Secrets Manager / Azure Key Vault / HashiCorp Vault (from Phase 5 Q30)
- Secret rotation: how are rotated secrets propagated without downtime?
- Never log secrets — audit the logger configuration to ensure no accidental leakage

```typescript
// Pattern: validate all env vars on startup, fail fast
import { z } from 'zod';
const envSchema = z.object({
  JWT_SECRET: z.string().min(32),
  MONGO_URI: z.string().url(),
  // ...
});
export const env = envSchema.parse(process.env);
```

**Domain 9: Dependency Security**

- `npm audit` in CI — fail build on high/critical vulnerabilities
- Dependabot or Renovate for automated dependency updates
- Pinned vs range versions: pin in production Dockerfiles, use ranges in package.json
- Lock file committed to repo (`package-lock.json`)
- Third-party script policy: document approved CDNs and the review process for adding new ones

**Domain 10: Security Logging & Monitoring**

Events that must be logged (with user ID, IP, timestamp, outcome):
- Authentication attempts (success and failure)
- Authorization failures (403 responses)
- Rate limit triggers
- Admin actions (user role changes, deletions)
- Sensitive data access (if compliance requires it)

Alerts to configure:
- Spike in 401/403 responses (potential attack)
- Spike in 500 responses (potential exploit or crash)
- Failed login attempts from same IP exceeding threshold

### After All Domains Are Designed

Generate **two deliverables**:

#### 1. Security Architecture Document

For each domain: implementation approach, code patterns, configuration values, and rationale.

#### 2. Security Implementation Checklist

Map every item from the Phase 4 security checklist to its implementation decision:

- [ ] Authentication method: [method + token lifetime]
- [ ] Token storage: [httpOnly cookie / localStorage — trade-off documented]
- [ ] Token revocation: [mechanism]
- [ ] RBAC implementation: [middleware approach]
- [ ] Input validation: [library + where applied]
- [ ] NoSQL injection prevention: [approach]
- [ ] XSS prevention: [approach]
- [ ] TLS: [version + certificate management]
- [ ] HTTP security headers: [helmet.js config]
- [ ] CSP: [directives — all sources listed]
- [ ] CORS: [per-environment config]
- [ ] Rate limiting: [limits per tier + store]
- [ ] Secrets management: [per environment]
- [ ] Dependency scanning: [tool + CI gate]
- [ ] Security logging: [events + alert thresholds]
- [ ] Compliance controls: [per obligation from Phase 4]

**Present both deliverables** to the user for review before saving.

**Save** to `docs/design/security-architecture.md`

**Recommend** the user proceed to `/design-folder-structure`

## Quality Gate

Before marking this workstream complete, confirm:
- [ ] Every item in the Phase 4 security checklist is addressed
- [ ] Auth token lifecycle is fully designed (issue, refresh, rotate, revoke)
- [ ] RBAC implementation matches Phase 3 role-permission matrix exactly
- [ ] Input validation is designed for every untrusted input source
- [ ] CORS policy is defined per environment (no wildcard with credentials)
- [ ] Rate limits are defined per endpoint tier
- [ ] HTTP security headers are configured (CSP with all sources enumerated)
- [ ] Secrets management approach is documented per environment
- [ ] Dependency scanning is integrated into CI
- [ ] Security logging events and alert thresholds are defined
- [ ] All compliance obligations from Phase 4 have a corresponding control
