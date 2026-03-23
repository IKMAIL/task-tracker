# Workstream 6 — Container Orchestration & Infrastructure

You are conducting Workstream 6 of the Project Setup & DevOps phase. This workstream answers the question: **"How are services containerised, orchestrated, scaled, monitored, and recovered in production — with banking-grade reliability and compliance?"**

This is a banking-grade MERN + TypeScript project. All decisions must account for PCI-DSS 1.1 (network security), 3.4 (data protection), 6.5 (secure development), 10.1–10.5 (logging/monitoring), 12.10 (incident response), and ISO 27001 Annex A.12 (operations), A.13 (communications security), A.17 (business continuity).

## Pre-Requisite

Check that these documents exist and read them:
- `docs/setup/repository-structure.md` — WS1 output (branching strategy, environments)
- `docs/setup/local-dev-environment.md` — WS2 output (dev scripts, Docker setup, service ports)
- `docs/setup/typescript-build-config.md` — WS3 output (TypeScript config, build pipeline)
- `docs/setup/code-quality-gates.md` — WS4 output (linting, testing, security scanning)
- `docs/setup/ci-cd-pipeline.md` — WS5 output (pipeline stages, Docker build strategy, deployment strategy)
- `docs/setup/pre-check-report.md` — pre-check scan output
- `docs/design/high-level-design.md` — architecture decisions
- `docs/design/security-architecture.md` — security requirements

If any are missing, inform the user which ones and recommend completing the prerequisite workstream first. Allow them to proceed if they choose, but log missing inputs to `docs/setup/ambiguity-log.md`.

Also read these if they exist (optional but valuable):
- `docs/requirements/nonfunctional-requirements.md` — NFR targets (availability, latency, throughput)
- `docs/design/api-contracts.md` — API conventions, service endpoints
- `docs/design/data-model.md` — database schemas, collections
- `docs/adr/` — all Architecture Decision Records
- Existing `docker-compose*.yml`, `Dockerfile*`, `k8s/`, `helm/` — current infrastructure config (if any)

## Instructions

Walk through each decision **one at a time**. For each decision, present the options, trade-offs, and a recommendation grounded in the architecture documents and banking compliance requirements. Wait for user confirmation before moving on.

### Partial Save & Resume

- After every 3 decisions, auto-save progress to `docs/setup/container-orchestration.draft.md` with a `## Progress` section noting which decisions are completed and which is next
- If the user says "pause", "stop", or "save and continue later": save the current draft immediately and note the next decision to resume from
- On resume: read the draft file, summarise decisions made so far, continue from the next undecided item

### Handling Incomplete Answers

- If the user answers "I don't know" or is unsure, log the item to `docs/setup/ambiguity-log.md` with status **Open** and continue — do not block the workstream
- Use a sensible default tagged with **[assumed]** so the document remains complete
- If an infrastructure component cannot be designed due to missing answers, mark it as **Deferred** with the specific ambiguity log item ID

### Behavioral Guardrails

- Do not rephrase or reinterpret the user's answers — quote them directly when synthesizing deliverables
- Do not invent or assume answers the user has not provided — mark gaps explicitly as "[TBD — needs stakeholder input]"
- Do not embellish — tag inferred details with "[assumed]"
- Do not introduce cloud platforms or infrastructure tools not discussed in Phase 2 without explicitly flagging them as new additions
- Reference specific architecture decisions, NFR targets, or ADRs when justifying recommendations
- Use the project glossary consistently when it exists in `docs/requirements/business-context.md`

### Contradiction Detection

- If a container configuration contradicts the Docker build strategy from WS5, flag it
- If a deployment topology contradicts the environment strategy from WS5, flag it
- If a networking decision contradicts the security architecture from Phase 2, flag it
- If a service port mapping contradicts the local dev environment from WS2, flag it
- If an infrastructure decision contradicts an existing ADR, flag it: "ADR-[NNN] decided [X]. This approach contradicts that decision. Should we update the ADR or change the approach?"

### Decisions to Walk Through

**Decision 1: Container Orchestration Platform**

- Present platform options:

  | Option | Description | Pros | Cons |
  |---|---|---|---|
  | **Kubernetes (EKS/AKS/GKE)** | Managed K8s on major cloud providers | Industry standard, auto-scaling, self-healing, rich ecosystem | Complexity, learning curve, cost overhead |
  | **Docker Compose** | Simple multi-container orchestration | Simple to set up, low overhead, good for small teams | No auto-scaling, no self-healing, single-host |
  | **Docker Swarm** | Docker-native clustering | Simpler than K8s, built into Docker, easy migration from Compose | Smaller ecosystem, limited features, declining adoption |
  | **Managed Container Services (ECS/Azure Container Apps)** | Cloud-native container platforms | Less operational overhead than K8s, cloud-integrated | Vendor lock-in, less portable, limited customisation |

- Banking considerations:
  - High availability — does the platform support multi-AZ deployments?
  - Auto-scaling — can it handle traffic spikes without manual intervention?
  - Self-healing — does it automatically restart failed containers?
  - Network policies — can you isolate services at the network level?
  - Compliance — does the cloud provider offer PCI-DSS certified infrastructure?
  - Audit logging — does the platform provide immutable audit logs of all operations?

- Cross-reference: check WS5 deployment strategy for assumed infrastructure platform
- Probe: "Which container orchestration platform are you using or planning to use? Which cloud provider?"

**Decision 2: Kubernetes Cluster Architecture**

- Present cluster architecture decisions:

  | Aspect | Options | Banking Recommendation |
  |---|---|---|
  | **Node pools** | Single pool vs dedicated pools (app/system/monitoring) | Dedicated pools — isolate workload types |
  | **Namespaces** | Per-environment (dev/staging/prod) vs per-service vs hybrid | Per-environment on separate clusters for banking (prod isolation) |
  | **Resource quotas** | Per-namespace CPU/memory limits | Mandatory — prevent noisy-neighbour issues |
  | **Network policies** | Default-deny with explicit allow rules | Mandatory for PCI-DSS 1.1 — microsegmentation |
  | **Pod security standards** | Baseline vs Restricted | Restricted — non-root, read-only filesystem, no privilege escalation |

- Namespace strategy options:

  | Strategy | Description | Pros | Cons |
  |---|---|---|---|
  | **Per-environment** | `dev`, `staging`, `prod` namespaces on shared cluster | Simple, cost-effective | Less isolation, blast radius |
  | **Per-environment clusters** | Separate clusters for dev, staging, prod | Maximum isolation, independent scaling | Higher cost, more management |
  | **Hybrid** | Shared cluster for dev/staging, dedicated cluster for prod | Balance of cost and isolation | Moderate complexity |

- Banking recommendation: Separate production cluster for PCI-DSS scope reduction. Network policies mandatory for all namespaces
- Cross-reference: check WS5 environment strategy for environment list
- Probe: "Do you want separate clusters per environment or a shared cluster with namespace isolation?"

**Decision 3: Service Deployment Configuration**

- Present deployment tooling options:

  | Option | Description | Pros | Cons |
  |---|---|---|---|
  | **Raw Kubernetes manifests** | Plain YAML files | Simple, no tooling dependencies | Verbose, hard to maintain, no templating |
  | **Helm charts** | Package manager for K8s | Templating, versioning, rollback, community charts | Complexity, Go template syntax |
  | **Kustomize** | Overlay-based K8s config | Built into kubectl, no templating language, patch-based | Less powerful than Helm, limited logic |

- Per-service deployment specification:

  | Setting | Recommendation | Banking Justification |
  |---|---|---|
  | **Replicas** | Minimum 2 (production) | HA — no single point of failure |
  | **Resource requests** | CPU: 100m-500m, Memory: 128Mi-512Mi per service | Predictable scheduling, cost control |
  | **Resource limits** | 2x requests | Prevent runaway containers |
  | **Health checks** | `/health` endpoint (HTTP GET) | Service availability verification |
  | **Readiness probe** | `/ready` endpoint, initialDelaySeconds: 10, periodSeconds: 5 | Only route traffic to ready pods |
  | **Liveness probe** | `/health` endpoint, initialDelaySeconds: 30, periodSeconds: 10 | Auto-restart unresponsive pods |
  | **Startup probe** | `/health`, failureThreshold: 30, periodSeconds: 2 | Allow slow startup without killing pod |
  | **Graceful shutdown** | terminationGracePeriodSeconds: 30, SIGTERM handler | Complete in-flight requests before shutdown |

- Service-specific resource recommendations:

  | Service | CPU Request | Memory Request | Replicas (Prod) |
  |---|---|---|---|
  | api-gateway | 200m | 256Mi | 3 |
  | identity-service | 200m | 256Mi | 2 |
  | task-service | 200m | 256Mi | 2 |
  | progress-service | 100m | 128Mi | 2 |
  | alert-service | 100m | 128Mi | 1 (cron-based) |
  | team-service | 100m | 128Mi | 2 |
  | web-frontend | 100m | 128Mi | 2 |

- Cross-reference: check WS5 Docker image tagging strategy for image references
- Probe: "Do you prefer Helm charts, Kustomize, or raw manifests for managing K8s configuration?"

**Decision 4: Networking & Service Mesh**

- Present ingress controller options:

  | Option | Description | Pros | Cons |
  |---|---|---|---|
  | **NGINX Ingress** | Community NGINX-based ingress | Widely used, well-documented, flexible | Requires separate deployment |
  | **Traefik** | Cloud-native ingress/reverse proxy | Auto-discovery, Let's Encrypt integration | Less mature for large deployments |
  | **AWS ALB Ingress** | AWS Application Load Balancer | Native AWS integration, managed service | AWS-only, vendor lock-in |
  | **Cloud provider LB** | GKE Ingress / Azure App Gateway | Managed, cloud-integrated | Vendor-specific configuration |

- Service mesh options:

  | Option | Description | Pros | Cons |
  |---|---|---|---|
  | **Istio** | Full-featured service mesh | mTLS, traffic management, observability | Heavy resource overhead, complex |
  | **Linkerd** | Lightweight service mesh | Simple, low overhead, Rust-based proxy | Fewer features than Istio |
  | **None (K8s native)** | Use K8s services + network policies | Simple, no extra infrastructure | No mTLS, less observability |

- Banking security requirements:
  - TLS termination at ingress — all external traffic encrypted (PCI-DSS 4.1)
  - mTLS between services — encrypt all internal traffic (PCI-DSS 4.1)
  - Network policies — restrict service-to-service communication to required paths only (PCI-DSS 1.1)
  - Rate limiting at ingress — prevent abuse
  - WAF integration — protect against OWASP Top 10 at the edge

- Cross-reference: check security architecture for encryption requirements
- Probe: "Do you want a service mesh for mTLS between services, or will K8s network policies plus TLS at ingress suffice?"

**Decision 5: Database Infrastructure**

- Present MongoDB deployment options:

  | Option | Description | Pros | Cons |
  |---|---|---|---|
  | **MongoDB Atlas (managed)** | Fully managed MongoDB-as-a-service | Zero ops, automated backups, built-in monitoring, PCI-DSS compliant | Cost, vendor lock-in, network latency |
  | **Self-hosted on K8s** | MongoDB via StatefulSets or operator | Full control, cost optimisation | Complex ops, storage management, backup complexity |
  | **VM-hosted** | MongoDB on dedicated VMs/EC2 | Predictable performance, simpler than K8s | Manual scaling, patching, backup management |

- Database configuration requirements:

  | Setting | Recommendation | Banking Justification |
  |---|---|---|
  | **Replica sets** | 3-member replica set minimum | HA, automatic failover (PCI-DSS 12.10) |
  | **Encryption at rest** | Enabled with customer-managed keys | PCI-DSS 3.4 — protect stored cardholder data |
  | **Encryption in transit** | TLS for all connections | PCI-DSS 4.1 — encrypt data in transit |
  | **Authentication** | SCRAM-SHA-256 with per-service credentials | PCI-DSS 8.2 — unique credentials per service |
  | **Backup strategy** | Continuous backup with point-in-time recovery | PCI-DSS 12.10 — business continuity |
  | **Backup retention** | 30 days minimum | Audit and compliance recovery window |
  | **Network access** | Private endpoints / VPC peering only | PCI-DSS 1.1 — no public database access |

- Per-service database mapping (from CLAUDE.md architecture):

  | Service | Database | Collections | Est. Size |
  |---|---|---|---|
  | identity-service | identity | users, sessions | Small |
  | task-service | tasks | tasks, taskHistory | Medium-Large |
  | progress-service | progress | progressUpdates | Medium |
  | alert-service | alerts | alerts, alertHistory | Medium |
  | team-service | teams | teams, memberships | Small |

- Cross-reference: check data model design for schema and index requirements
- Probe: "Are you planning to use MongoDB Atlas (managed) or self-host MongoDB?"

**Decision 6: Observability Stack**

- Present observability components:

  **Logging:**

  | Option | Description | Pros | Cons |
  |---|---|---|---|
  | **ELK Stack (Elasticsearch, Logstash, Kibana)** | Self-hosted log aggregation | Powerful search, visualization, open source | Resource-heavy, complex ops |
  | **Loki + Grafana** | Lightweight log aggregation | Low resource usage, label-based, Grafana integration | Less powerful search than ELK |
  | **CloudWatch Logs / Azure Monitor** | Cloud-native logging | Zero ops, cloud-integrated, retention policies | Vendor lock-in, cost at scale |

  **Metrics:**

  | Option | Description | Pros | Cons |
  |---|---|---|---|
  | **Prometheus + Grafana** | Self-hosted metrics | Industry standard, powerful PromQL, alerting | Storage management, scaling |
  | **Datadog** | SaaS observability platform | All-in-one, easy setup, AI-driven insights | Expensive, vendor lock-in |
  | **CloudWatch Metrics / Azure Monitor** | Cloud-native metrics | Zero ops, auto-scaling, cloud integration | Limited query language, vendor lock-in |

  **Tracing:**

  | Option | Description | Pros | Cons |
  |---|---|---|---|
  | **Jaeger** | Open-source distributed tracing | CNCF project, Kubernetes-native, OpenTelemetry | Self-hosted complexity |
  | **Zipkin** | Distributed tracing system | Simple, well-documented | Less active development |
  | **AWS X-Ray / Azure App Insights** | Cloud-native tracing | Zero ops, cloud integrated | Vendor lock-in |

- Banking logging requirements (PCI-DSS 10.1–10.5):
  - All authentication events logged (success and failure)
  - All administrative actions logged
  - All access to cardholder data logged
  - Logs are immutable and tamper-evident
  - Log retention: minimum 1 year, 3 months immediately available
  - Centralised log collection — no local-only logs
  - Alerting on security-relevant events (failed logins, privilege escalation)

- Cross-reference: check security architecture for logging requirements
- Probe: "What observability tools are you using or planning to use? Do you prefer self-hosted or managed services?"

**Decision 7: Auto-scaling & High Availability**

- Present auto-scaling configuration:

  | Component | Description | Configuration |
  |---|---|---|
  | **HPA (Horizontal Pod Autoscaler)** | Scale pods based on CPU/memory/custom metrics | Min: 2, Max: 10, Target CPU: 70% |
  | **VPA (Vertical Pod Autoscaler)** | Adjust pod resource requests/limits | Recommendation mode — inform HPA decisions |
  | **Cluster Autoscaler** | Scale cluster nodes based on pending pods | Min: 2 nodes, Max: 10 nodes per pool |

- High availability configuration:

  | Setting | Configuration | Banking Justification |
  |---|---|---|
  | **Pod Disruption Budgets** | minAvailable: 1 (or maxUnavailable: 1) per service | Zero-downtime during node maintenance |
  | **Anti-affinity rules** | Spread pods across availability zones | Survive AZ failure |
  | **Topology spread constraints** | maxSkew: 1, topologyKey: zone | Even distribution across zones |
  | **Multi-AZ deployment** | Nodes in minimum 2 availability zones | PCI-DSS 12.10 — business continuity |
  | **Pre-emptive scaling** | Scale up before peak hours | Banking: predictable performance during business hours |

- Banking recommendation: All production services must have minimum 2 replicas across 2 AZs. Pod Disruption Budgets are mandatory. HPA enabled for all user-facing services
- Cross-reference: check NFR targets for availability and latency requirements
- Probe: "What are your availability targets (e.g., 99.9%, 99.95%, 99.99%)? Do you have specific scaling requirements?"

**Decision 8: Disaster Recovery**

- Present DR strategy:

  | Aspect | Options | Banking Recommendation |
  |---|---|---|
  | **RTO (Recovery Time Objective)** | Minutes / Hours / Days | < 1 hour for banking |
  | **RPO (Recovery Point Objective)** | Zero / Minutes / Hours | < 15 minutes for banking |
  | **DR topology** | Active-active / Active-passive / Pilot light | Active-passive minimum for banking |

- DR components:

  | Component | Strategy | Frequency | Retention |
  |---|---|---|---|
  | **K8s cluster state** | etcd backup or managed backup | Hourly | 30 days |
  | **Application config** | Git (infrastructure as code) | On every change | Indefinite |
  | **Database backups** | Continuous backup + snapshots | Continuous | 30 days |
  | **Container images** | Cross-region registry replication | On every push | 90 days |
  | **Secrets** | Vault replication or cross-region sync | On every change | Indefinite |

- Failover procedures:
  - Automated failover for database (replica set elections)
  - Automated failover for K8s (pod rescheduling, node replacement)
  - Semi-automated failover for region-level disaster (runbook + single command)
  - Regular DR drills — minimum quarterly

- Banking compliance:
  - PCI-DSS 12.10 — incident response plan including DR
  - ISO 27001 A.17 — business continuity management
  - Documented and tested recovery procedures
  - Regular backup restoration testing

- Cross-reference: check NFR targets for RTO/RPO requirements
- Probe: "What are your RTO and RPO targets? Do you need multi-region DR or is multi-AZ sufficient?"

### After All Decisions Are Made

Generate the **Container Orchestration & Infrastructure Document** with these sections:

#### 1. Platform & Architecture

Container orchestration platform selection and rationale. Cloud provider and region. Cluster architecture (node pools, namespaces, resource quotas).

#### 2. Cluster Configuration

Kubernetes cluster specification:
- Node pool definitions (instance types, sizes, scaling)
- Namespace structure
- Resource quotas per namespace
- Network policies (default deny + explicit allow rules)
- Pod security standards
- RBAC configuration

Include a cluster architecture diagram (text-based):
```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  App Pool     │  │ System Pool  │  │ Monitoring   │      │
│  │  (AZ-1/AZ-2) │  │ (AZ-1/AZ-2) │  │ Pool         │      │
│  │  - services   │  │ - ingress    │  │ - prometheus │      │
│  │  - frontend   │  │ - cert-mgr   │  │ - grafana    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

#### 3. Service Deployment Specifications

Per-service deployment configuration:
- Replicas, resource requests/limits
- Health checks (readiness, liveness, startup probes)
- Graceful shutdown configuration
- Image pull policy and registry

#### 4. Networking

Ingress controller configuration. Service mesh (if chosen). TLS/mTLS configuration. Network policies per service. DNS and service discovery.

#### 5. Database Infrastructure

MongoDB deployment topology. Replica set configuration. Encryption (at rest and in transit). Backup strategy and schedule. Per-service database access credentials.

#### 6. Observability

Logging stack and configuration. Metrics collection and dashboards. Distributed tracing setup. Alerting rules and escalation. Audit logging for PCI-DSS compliance.

#### 7. Auto-scaling & High Availability

HPA configuration per service. Cluster autoscaler settings. Pod Disruption Budgets. Anti-affinity and topology spread. Multi-AZ deployment topology.

#### 8. Disaster Recovery

RTO/RPO targets. Backup schedule and retention. Failover procedures (automated and manual). DR drill schedule. Recovery runbooks.

#### 9. Infrastructure Summary

| Service | Replicas (Prod) | CPU Req/Limit | Mem Req/Limit | HPA | PDB |
|---|---|---|---|---|---|
| api-gateway | 3 | 200m/400m | 256Mi/512Mi | Yes | minAvailable: 2 |
| identity-service | 2 | 200m/400m | 256Mi/512Mi | Yes | minAvailable: 1 |
| task-service | 2 | 200m/400m | 256Mi/512Mi | Yes | minAvailable: 1 |
| progress-service | 2 | 100m/200m | 128Mi/256Mi | Yes | minAvailable: 1 |
| alert-service | 1 | 100m/200m | 128Mi/256Mi | No | N/A |
| team-service | 2 | 100m/200m | 128Mi/256Mi | Yes | minAvailable: 1 |
| web-frontend | 2 | 100m/200m | 128Mi/256Mi | Yes | minAvailable: 1 |

#### 10. Compliance Traceability

| Requirement | Standard | How Addressed | Evidence |
|---|---|---|---|
| Network segmentation | PCI-DSS 1.1 | K8s network policies, namespace isolation | Network policy manifests |
| Data protection (at rest) | PCI-DSS 3.4 | MongoDB encryption at rest, encrypted volumes | Database config |
| Data protection (in transit) | PCI-DSS 4.1 | TLS at ingress, mTLS between services | TLS/mesh config |
| Secure development | PCI-DSS 6.5 | Non-root containers, read-only filesystems | Pod security policies |
| Logging & monitoring | PCI-DSS 10.1–10.5 | Centralised logging, audit trail, alerting | Observability stack |
| Incident response | PCI-DSS 12.10 | DR procedures, failover runbooks, DR drills | DR documentation |
| Operational procedures | ISO 27001 A.12 | Documented infrastructure, IaC | This document |
| Communications security | ISO 27001 A.13 | TLS/mTLS, network policies | Networking config |
| Business continuity | ISO 27001 A.17 | Multi-AZ, DR strategy, backup procedures | DR section |

#### 11. Key Assumptions

| ID | Assumption | Impact if Wrong | Mitigation |
|---|---|---|---|
| K8S-A001 | [assumption] | [impact] | [what we'd do] |

**Present the full document** to the user for review before saving.

**Save** to `docs/setup/container-orchestration.md`

**Recommend** the user proceed to `/setup-secrets` (next workstream: WS7 — Secrets Management & Environment Configuration).

## Quality Gate

Before marking this workstream complete, confirm:
- [ ] Container orchestration platform selected with banking compliance justification
- [ ] Cloud provider and region selected
- [ ] Cluster architecture defined (node pools, namespaces, resource quotas)
- [ ] Network policies configured with default-deny approach
- [ ] Pod security standards set to Restricted
- [ ] Deployment tooling selected (Helm/Kustomize/raw manifests)
- [ ] Per-service deployment specs defined (replicas, resources, probes)
- [ ] Minimum 2 replicas for all production user-facing services
- [ ] Health check endpoints defined (readiness, liveness, startup)
- [ ] Graceful shutdown configured for all services
- [ ] Ingress controller selected and configured
- [ ] TLS termination configured at ingress
- [ ] mTLS or network-level encryption between services
- [ ] MongoDB deployment topology defined with replica sets
- [ ] Database encryption at rest and in transit enabled
- [ ] Database backup strategy with point-in-time recovery
- [ ] Observability stack selected (logging, metrics, tracing)
- [ ] PCI-DSS 10.1–10.5 logging requirements addressed
- [ ] Log retention policy meets compliance minimums (1 year)
- [ ] HPA configured for user-facing services
- [ ] Pod Disruption Budgets defined for all production services
- [ ] Multi-AZ deployment configured
- [ ] Anti-affinity rules prevent all replicas in same AZ
- [ ] RTO and RPO targets defined
- [ ] DR procedures documented and testable
- [ ] Backup restoration testing scheduled
- [ ] PCI-DSS 1.1 (network), 3.4 (data), 4.1 (encryption), 6.5 (secure dev), 10.x (logging), 12.10 (DR) addressed
- [ ] ISO 27001 A.12 (operations), A.13 (communications), A.17 (continuity) compliance evidence documented
