# Workstream 7 — Secrets Management & Environment Configuration

You are conducting Workstream 7 of the Project Setup & DevOps phase. This workstream answers the question: **"How are secrets, credentials, certificates, and environment-specific configuration securely stored, injected, rotated, and audited across all environments?"**

This is a banking-grade MERN + TypeScript project. All decisions must account for PCI-DSS 2.1 (change default passwords), 3.4 (render PAN unreadable), 3.5–3.6 (cryptographic key management), 8.2 (unique authentication credentials), 8.5 (no shared/generic accounts), and ISO 27001 Annex A.10 (cryptography), A.9 (access control).

## Pre-Requisite

Check that these documents exist and read them:
- `docs/setup/repository-structure.md` — WS1 output (branching strategy, environments)
- `docs/setup/local-dev-environment.md` — WS2 output (dev scripts, Docker setup, `.env` handling)
- `docs/setup/typescript-build-config.md` — WS3 output (TypeScript config, build pipeline)
- `docs/setup/code-quality-gates.md` — WS4 output (linting, testing, security scanning)
- `docs/setup/ci-cd-pipeline.md` — WS5 output (pipeline stages, deployment strategy, environments)
- `docs/setup/container-orchestration.md` — WS6 output (K8s config, namespace strategy, service mesh)
- `docs/setup/pre-check-report.md` — pre-check scan output
- `docs/design/high-level-design.md` — architecture decisions
- `docs/design/security-architecture.md` — security requirements

If any are missing, inform the user which ones and recommend completing the prerequisite workstream first. Allow them to proceed if they choose, but log missing inputs to `docs/setup/ambiguity-log.md`.

Also read these if they exist (optional but valuable):
- `docs/requirements/nonfunctional-requirements.md` — NFR targets
- `docs/design/api-contracts.md` — API conventions, service endpoints
- `docs/adr/` — all Architecture Decision Records
- Existing `.env*`, `docker-compose*.yml`, `k8s/` — current secrets/env config (if any)
- `CLAUDE.md` — project-level env var documentation

## Instructions

Walk through each decision **one at a time**. For each decision, present the options, trade-offs, and a recommendation grounded in the architecture documents and banking compliance requirements. Wait for user confirmation before moving on.

### Partial Save & Resume

- After every 3 decisions, auto-save progress to `docs/setup/secrets-management.draft.md` with a `## Progress` section noting which decisions are completed and which is next
- If the user says "pause", "stop", or "save and continue later": save the current draft immediately and note the next decision to resume from
- On resume: read the draft file, summarise decisions made so far, continue from the next undecided item

### Handling Incomplete Answers

- If the user answers "I don't know" or is unsure, log the item to `docs/setup/ambiguity-log.md` with status **Open** and continue — do not block the workstream
- Use a sensible default tagged with **[assumed]** so the document remains complete
- If a secrets component cannot be designed due to missing answers, mark it as **Deferred** with the specific ambiguity log item ID

### Behavioral Guardrails

- Do not rephrase or reinterpret the user's answers — quote them directly when synthesizing deliverables
- Do not invent or assume answers the user has not provided — mark gaps explicitly as "[TBD — needs stakeholder input]"
- Do not embellish — tag inferred details with "[assumed]"
- Do not introduce secrets management tools not discussed in Phase 2 without explicitly flagging them as new additions
- Reference specific architecture decisions, NFR targets, or ADRs when justifying recommendations
- Use the project glossary consistently when it exists in `docs/requirements/business-context.md`

### Contradiction Detection

- If a secrets injection strategy contradicts the container orchestration config from WS6, flag it
- If an environment configuration contradicts the CI/CD pipeline from WS5, flag it
- If a credential management approach contradicts the security architecture from Phase 2, flag it
- If a secrets storage decision contradicts the local dev environment from WS2, flag it
- If a secrets decision contradicts an existing ADR, flag it: "ADR-[NNN] decided [X]. This approach contradicts that decision. Should we update the ADR or change the approach?"

### Decisions to Walk Through

**Decision 1: Secrets Management Platform**

- Present platform options:

  | Option | Description | Pros | Cons |
  |---|---|---|---|
  | **HashiCorp Vault** | Dedicated secrets management platform | Dynamic secrets, auto-rotation, fine-grained ACLs, audit logging, encryption-as-a-service | Operational complexity, requires its own HA setup |
  | **AWS Secrets Manager** | AWS-native secrets store | Managed service, auto-rotation, IAM integration, CloudTrail audit | AWS vendor lock-in, per-secret cost |
  | **Azure Key Vault** | Azure-native secrets/key/cert store | Managed service, HSM-backed, Azure AD integration, audit logging | Azure vendor lock-in, per-operation cost |
  | **Kubernetes Secrets + Sealed Secrets** | K8s-native with encryption at rest | Simple, no external dependencies, GitOps-friendly (Sealed Secrets) | Limited rotation, weaker access control, base64 not encryption |
  | **SOPS + Age/KMS** | Encrypted secrets in Git | GitOps-friendly, version-controlled, no external service | Manual rotation, no dynamic secrets, limited audit |

- Banking considerations:
  - Audit logging — every secret access must be logged (PCI-DSS 10.1)
  - Access control — per-service, per-environment credential isolation (PCI-DSS 8.5)
  - Rotation — automated credential rotation without downtime (PCI-DSS 8.2)
  - Encryption — secrets encrypted at rest with customer-managed keys (PCI-DSS 3.4)
  - High availability — secrets platform must not be a single point of failure
  - Compliance certification — platform must be PCI-DSS certified or certifiable

- Cross-reference: check WS6 for container orchestration platform and cloud provider
- Probe: "Which secrets management platform are you using or planning to use? Does it need to align with your cloud provider?"

**Decision 2: Secret Categories & Inventory**

- Present secret categories for this project (derived from CLAUDE.md and architecture):

  | Category | Secrets | Services | Rotation Frequency |
  |---|---|---|---|
  | **JWT signing keys** | `JWT_SECRET` | All services + gateway | 90 days |
  | **Database credentials** | `MONGO_URI` (per-service) | Each service individually | 90 days |
  | **Inter-service tokens** | `SERVICE_TOKEN` | Services calling each other | 90 days |
  | **OAuth credentials** | `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID` | identity-service only | On compromise |
  | **TLS certificates** | Ingress TLS, mTLS certs | Ingress controller, service mesh | Auto-renew (60 days) |
  | **API keys** | Third-party integrations (future) | Varies | Per provider policy |
  | **Encryption keys** | Data-at-rest encryption, field-level encryption | Database layer | Annual |

- Banking requirements:
  - No shared credentials across environments (PCI-DSS 8.5)
  - No default or factory credentials in any environment (PCI-DSS 2.1)
  - Unique credentials per service per environment (PCI-DSS 8.2)
  - All credentials documented in a secrets inventory (PCI-DSS 3.5)

- Probe: "Are there any additional secrets or credentials beyond what's listed? Any third-party integrations that require API keys?"

**Decision 3: Environment Configuration Strategy**

- Present environment configuration approaches:

  | Option | Description | Pros | Cons |
  |---|---|---|---|
  | **Environment variables (12-factor)** | Inject secrets as env vars at runtime | Simple, framework-agnostic, widely supported | Visible in process listing, can leak in logs/crash dumps |
  | **Mounted secret files** | Mount secrets as files in containers | More secure than env vars, works with K8s Secrets/Vault | Application must read from file path, slightly more complex |
  | **Vault Agent sidecar** | Sidecar injects secrets into shared volume | Dynamic rotation, no app changes, transparent | Additional resource overhead, Vault dependency |
  | **External Secrets Operator** | K8s operator syncs external secrets to K8s Secrets | GitOps-friendly, supports multiple backends, K8s-native | Additional operator to manage, sync delay |

- Per-environment configuration:

  | Environment | Config Source | Secrets Source | Approval |
  |---|---|---|---|
  | **Local dev** | `.env` files (git-ignored) | `.env.example` templates with dummy values | None |
  | **CI/CD** | Pipeline variables | CI platform secrets store | Pipeline admin |
  | **Staging** | ConfigMaps | Secrets platform (same as prod, different values) | Team lead |
  | **Production** | ConfigMaps | Secrets platform (Vault/cloud KMS) | Change board |

- Banking requirements:
  - Secrets never committed to Git — `.env*` in `.gitignore` (PCI-DSS 6.5)
  - Production secrets accessible only by production service identities (PCI-DSS 8.5)
  - Configuration changes audited with who/what/when (PCI-DSS 10.1)
  - Environment parity — same injection mechanism across staging and production

- Cross-reference: check WS2 for current `.env` handling; check WS6 for K8s secret injection
- Probe: "How do you want secrets injected into your services? Do you prefer environment variables, mounted files, or a sidecar approach?"

**Decision 4: Secret Rotation Strategy**

- Present rotation approaches:

  | Strategy | Description | Pros | Cons |
  |---|---|---|---|
  | **Automated rotation (platform-driven)** | Secrets platform auto-rotates on schedule | Zero-touch, no human error, continuous compliance | Complex setup, requires dual-credential support during rotation |
  | **Semi-automated (triggered)** | Rotation script triggered manually or on schedule | Simpler than full automation, controlled timing | Requires human trigger, risk of missed rotations |
  | **Manual rotation** | Ops team rotates credentials manually | Full control, simple | Human error, compliance risk, easy to forget |

- Rotation procedure requirements:

  | Step | Description | Banking Justification |
  |---|---|---|
  | **1. Generate new credential** | Create new secret value | Fresh credential |
  | **2. Dual-write period** | Both old and new credentials valid simultaneously | Zero-downtime rotation |
  | **3. Update consumers** | Roll services to pick up new credential | All services use new credential |
  | **4. Verify** | Confirm all services using new credential | No service left on old credential |
  | **5. Revoke old credential** | Invalidate previous credential | Reduce attack surface |
  | **6. Audit log** | Record rotation event with timestamp and operator | PCI-DSS 10.1 compliance |

- Rotation schedule:

  | Secret Type | Max Lifetime | Banking Recommendation |
  |---|---|---|
  | Database passwords | 90 days | Automated rotation |
  | JWT signing keys | 90 days | Automated with key rollover (sign with new, verify with old+new) |
  | Service tokens | 90 days | Automated rotation |
  | TLS certificates | 90 days (auto-renew at 60) | cert-manager auto-renewal |
  | OAuth client secrets | On compromise | Manual with documented procedure |
  | Encryption keys | Annual | Key rotation with re-encryption plan |

- Cross-reference: check security architecture for credential lifecycle requirements
- Probe: "Do you want fully automated secret rotation or semi-automated? What rotation frequency do you need for compliance?"

**Decision 5: Certificate Management**

- Present certificate management options:

  | Option | Description | Pros | Cons |
  |---|---|---|---|
  | **cert-manager + Let's Encrypt** | Automated TLS cert provisioning in K8s | Free certs, auto-renewal, K8s-native | Public CA only, rate limits |
  | **cert-manager + Private CA** | Internal CA for mTLS and internal services | Full control, no rate limits, private certs | CA management overhead, trust distribution |
  | **Cloud-managed certs (ACM/Azure)** | Cloud provider certificate management | Managed service, auto-renewal, integrated | Vendor lock-in, limited to supported services |
  | **Manual certificate management** | Manual cert generation and deployment | Full control | Error-prone, no auto-renewal, compliance risk |

- Certificate requirements:

  | Certificate Type | Purpose | Issuer | Auto-Renew |
  |---|---|---|---|
  | **Ingress TLS** | Encrypt external traffic (HTTPS) | Public CA (Let's Encrypt or commercial) | Yes |
  | **mTLS service certs** | Encrypt internal service-to-service traffic | Private CA or service mesh CA | Yes |
  | **MongoDB TLS** | Encrypt database connections | Private CA | Yes |
  | **Vault TLS** | Encrypt Vault API traffic (if self-hosted) | Private CA | Yes |

- Banking requirements:
  - Minimum TLS 1.2 (PCI-DSS 4.1)
  - TLS 1.3 preferred where supported
  - Certificate expiry monitoring and alerting
  - Certificate inventory maintained (PCI-DSS 3.5)
  - Private keys stored in HSM or KMS where possible

- Cross-reference: check WS6 for ingress and service mesh TLS decisions
- Probe: "How do you want to manage TLS certificates? Do you need a private CA for internal mTLS?"

**Decision 6: Access Control & Audit**

- Present access control models for secrets:

  | Aspect | Options | Banking Recommendation |
  |---|---|---|
  | **Identity model** | Service accounts / IAM roles / Vault AppRole | Service-identity-based — each service has unique identity |
  | **Policy granularity** | Per-environment / Per-service / Per-secret | Per-service per-environment — maximum isolation |
  | **Human access** | Direct / Break-glass only / No direct access | Break-glass with MFA and audit — no routine human access |
  | **Emergency access** | Shared emergency creds / Break-glass procedure | Break-glass with dual-approval and time-limited access |

- Access matrix:

  | Principal | Dev Secrets | Staging Secrets | Prod Secrets |
  |---|---|---|---|
  | Developer | Read/Write | Read only | No access |
  | CI/CD pipeline | Read | Read | Read (specific secrets only) |
  | Service (runtime) | N/A | Read own secrets | Read own secrets |
  | Ops team | Read/Write | Read/Write | Break-glass only |
  | Security team | Audit logs | Audit logs | Audit logs + break-glass |

- Audit requirements (PCI-DSS 10.1–10.5):
  - Every secret read/write logged with: who, what, when, from where
  - Audit logs immutable and tamper-evident
  - Audit log retention: minimum 1 year, 3 months immediately available
  - Alerting on anomalous access patterns (e.g., production secret access from unexpected source)
  - Regular access reviews (quarterly minimum)

- Probe: "Who should have access to production secrets? Do you need a break-glass procedure for emergency access?"

**Decision 7: Local Development Secrets**

- Present local dev secrets strategies:

  | Option | Description | Pros | Cons |
  |---|---|---|---|
  | **`.env` files from template** | Copy `.env.example` → `.env`, fill in dev values | Simple, familiar, documented | Manual setup, values can drift |
  | **Shared dev vault** | Dev secrets in shared Vault/Secrets Manager | Consistent values, centralised | Requires network access, more complex setup |
  | **Auto-generated dev secrets** | Script generates local dev secrets on setup | Reproducible, unique per developer | Script maintenance, may not match real services |
  | **Docker secrets** | Docker Compose secrets for local development | Closer to production pattern | More complex Docker setup |

- `.env.example` template requirements:
  - Every secret documented with description and example format
  - Never contain real credentials — use `<CHANGE_ME>` or `your-xxx-here` placeholders
  - Grouped by service with clear section headers
  - Validated on startup — fail fast if required secrets are missing

- Cross-reference: check WS2 for existing `.env` handling and onboarding flow
- Probe: "How do developers currently get their local secrets? Do you want to keep `.env` files or use a more structured approach?"

**Decision 8: Secrets in CI/CD Pipeline**

- Present CI/CD secrets injection options:

  | Option | Description | Pros | Cons |
  |---|---|---|---|
  | **GitHub Actions Secrets** | Repository/org/environment secrets | Native, simple, environment-scoped | Limited management, no rotation API |
  | **Vault integration** | CI fetches secrets from Vault at runtime | Dynamic secrets, fine-grained audit, rotation | Vault must be reachable from CI, more complex |
  | **Cloud KMS integration** | CI uses cloud IAM for secrets access | Cloud-native, IAM-based access | Vendor lock-in |
  | **OIDC federation** | CI authenticates to secrets platform via OIDC | No long-lived credentials, identity-based | Requires OIDC provider support |

- CI/CD secrets best practices:
  - Never echo or log secret values in pipeline output
  - Use masked variables/secrets in all CI platforms
  - Scope secrets to specific environments (e.g., deploy-prod secrets only available in prod deploy job)
  - Short-lived credentials preferred over long-lived API keys
  - Audit which pipeline runs accessed which secrets

- Cross-reference: check WS5 for CI/CD platform and pipeline structure
- Probe: "Which CI/CD platform are you using? Do you want CI to fetch secrets from a central vault or use the platform's built-in secrets?"

### After All Decisions Are Made

Generate the **Secrets Management & Environment Configuration Document** with these sections:

#### 1. Secrets Management Platform

Platform selection and rationale. Architecture diagram (text-based). High availability configuration. Compliance certification mapping.

#### 2. Secrets Inventory

Complete inventory of all secrets by category:

| ID | Secret | Category | Services | Environments | Rotation | Owner |
|---|---|---|---|---|---|---|
| SEC-001 | JWT_SECRET | Signing key | All services + gateway | All | 90 days | Security team |
| SEC-002 | MONGO_URI (identity) | Database credential | identity-service | All | 90 days | DBA team |
| SEC-003 | MONGO_URI (tasks) | Database credential | task-service | All | 90 days | DBA team |
| SEC-004 | MONGO_URI (progress) | Database credential | progress-service | All | 90 days | DBA team |
| SEC-005 | MONGO_URI (alerts) | Database credential | alert-service | All | 90 days | DBA team |
| SEC-006 | MONGO_URI (teams) | Database credential | team-service | All | 90 days | DBA team |
| SEC-007 | SERVICE_TOKEN | Inter-service auth | Cross-service callers | All | 90 days | Platform team |
| SEC-008 | MICROSOFT_CLIENT_ID | OAuth | identity-service | All | On compromise | Security team |
| SEC-009 | MICROSOFT_CLIENT_SECRET | OAuth | identity-service | All | On compromise | Security team |
| SEC-010 | MICROSOFT_TENANT_ID | OAuth config | identity-service | All | N/A | Security team |

#### 3. Environment Configuration

Per-environment configuration strategy. Config injection mechanism. Environment variable mapping per service. ConfigMap structure (if K8s).

#### 4. Secret Injection Architecture

How secrets flow from platform to application:
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Secrets Platform │────▶│  Injection Layer  │────▶│    Service Pod   │
│ (Vault/KMS)     │     │ (Operator/Sidecar)│     │ (env vars/files) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
   Audit Log              Sync/Refresh             Application Use
```

#### 5. Rotation Strategy

Per-secret-type rotation schedule. Rotation procedure (step-by-step). Zero-downtime rotation approach. Rotation monitoring and alerting.

#### 6. Certificate Management

Certificate inventory. Issuers (public CA, private CA). Auto-renewal configuration. Expiry monitoring.

#### 7. Access Control

Identity model (how services authenticate to secrets platform). Policy definitions (who can access what). Human access procedures (break-glass). Emergency access protocol.

#### 8. Audit & Compliance

Audit logging configuration. Log retention policy. Access review schedule. Anomaly alerting rules.

#### 9. Local Development

`.env.example` template structure. Developer onboarding for secrets. Local secrets generation/management.

#### 10. CI/CD Integration

CI/CD secrets injection strategy. Environment-scoped secrets. Pipeline secrets hygiene rules.

#### 11. Compliance Traceability

| Requirement | Standard | How Addressed | Evidence |
|---|---|---|---|
| No default credentials | PCI-DSS 2.1 | Unique per-service per-env credentials, startup validation | Secrets inventory |
| Render PAN unreadable | PCI-DSS 3.4 | Encryption keys managed in secrets platform, rotated annually | Key management section |
| Key management procedures | PCI-DSS 3.5–3.6 | Documented rotation, dual custody for master keys, key inventory | Rotation strategy |
| Unique authentication | PCI-DSS 8.2 | Per-service credentials, no shared accounts | Access control matrix |
| No shared/generic accounts | PCI-DSS 8.5 | Service-identity-based access, individual break-glass | Access control section |
| Audit trail | PCI-DSS 10.1 | All secret access logged with who/what/when/where | Audit section |
| Cryptography policy | ISO 27001 A.10 | Certificate management, encryption key lifecycle | Certificate section |
| Access control | ISO 27001 A.9 | Per-service policies, break-glass procedure, quarterly reviews | Access control section |

#### 12. Key Assumptions

| ID | Assumption | Impact if Wrong | Mitigation |
|---|---|---|---|
| SEC-A001 | [assumption] | [impact] | [what we'd do] |

**Present the full document** to the user for review before saving.

**Save** to `docs/setup/secrets-management.md`

**Recommend** the user proceed to `/setup-review` (Phase Gate — Setup Validation & Sign-Off).

## Quality Gate

Before marking this workstream complete, confirm:
- [ ] Secrets management platform selected with banking compliance justification
- [ ] Complete secrets inventory documented (all secrets across all services)
- [ ] No default or placeholder credentials in any non-dev environment
- [ ] Unique credentials per service per environment
- [ ] Environment configuration strategy defined for all environments (dev, CI, staging, prod)
- [ ] Secret injection mechanism defined (env vars, files, sidecar)
- [ ] Rotation strategy defined for every secret category
- [ ] Rotation frequency meets PCI-DSS requirements (90-day maximum for passwords)
- [ ] Zero-downtime rotation procedure documented
- [ ] TLS certificate management automated (cert-manager or equivalent)
- [ ] Certificate expiry monitoring configured
- [ ] Minimum TLS 1.2 enforced, TLS 1.3 preferred
- [ ] Access control matrix defined (who can access what secrets in which environment)
- [ ] No routine human access to production secrets
- [ ] Break-glass emergency access procedure documented
- [ ] Audit logging enabled for all secret access
- [ ] Audit log retention meets compliance minimums (1 year)
- [ ] Anomaly alerting configured for suspicious access patterns
- [ ] Local development secrets strategy documented
- [ ] `.env.example` template covers all required secrets
- [ ] CI/CD secrets scoped to appropriate environments
- [ ] No secrets in pipeline logs or artifacts
- [ ] PCI-DSS 2.1 (defaults), 3.4–3.6 (crypto), 8.2/8.5 (credentials), 10.1 (audit) addressed
- [ ] ISO 27001 A.9 (access control), A.10 (cryptography) compliance evidence documented
