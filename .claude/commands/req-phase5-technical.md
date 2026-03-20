# Phase 5 — Technical Clarifications (MERN + TypeScript Specific)

You are conducting Phase 5 of the requirements gathering process. The goal is to surface **technical constraints and decisions early** before architecture is locked.

## Pre-Requisite

Check that earlier phase documents exist in `docs/requirements/`. Reference functional requirements and NFRs to inform technical decisions. If missing, inform the user but allow them to proceed.

## Instructions

Ask questions **by technology layer**, one layer at a time. These are MERN + TypeScript specific — adapt if the user's stack differs.

### Questions to Ask

**Frontend (React + TypeScript)**

1. Is there a design system or component library to use? (MUI, Ant Design, Tailwind, Chakra, custom)
2. Are there existing brand guidelines, style guides, or Figma/Sketch designs?
3. Is SSR required (Next.js) or is a SPA (Create React App / Vite) sufficient?
4. Browser support requirements? (Modern only, or legacy IE11/Edge?)
5. Should the app be a PWA or support offline mode?
6. State management preference? (Context API, Redux, Zustand, Jotai)
7. Form handling requirements? (React Hook Form, Formik, native)
8. Are there complex data visualisation needs? (Charts, graphs, maps — which library?)

**Backend (Node.js + Express + TypeScript)**

9. REST only, or is GraphQL or WebSocket support needed?
10. Are there existing APIs to integrate with? What are their contracts? (OpenAPI specs?)
11. File upload/storage requirements? (S3, Azure Blob, local filesystem, size limits)
12. Background jobs or scheduled tasks needed? (Bull/BullMQ, node-cron, agenda)
13. Rate limiting, throttling, or API gateway requirements?
14. Email/SMS sending requirements? (SendGrid, SES, Twilio)
15. Is a monolith or microservices architecture preferred?

**Database (MongoDB)**

16. Estimated data volume and growth rate?
17. Is MongoDB Atlas the deployment target, or self-hosted?
18. Are there relational data patterns that need careful schema design? (Many-to-many, deep nesting)
19. Full-text search requirements? (MongoDB Atlas Search, Elasticsearch, Algolia)
20. Caching requirements? (Redis, in-memory)
21. Are there any data migration requirements from an existing system?

**Infrastructure & DevOps**

22. Target cloud provider? (AWS, Azure, GCP, on-premises)
23. Containerisation expected? (Docker, Kubernetes, ECS, App Service)
24. CI/CD pipeline — does one exist, or built from scratch? (GitHub Actions, GitLab CI, Jenkins)
25. Environment strategy? (dev, staging, prod, hotfix — how many?)
26. Secrets management approach? (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault, .env)
27. Monitoring and observability? (Datadog, New Relic, Prometheus/Grafana, CloudWatch)
28. Logging aggregation? (ELK stack, CloudWatch Logs, Loki)
29. Domain and DNS management? Who controls it?

### After All Questions Are Answered

Generate **three deliverables**:

#### 1. Technical Constraints Document

For each technology layer, document:
- **Chosen technology** and version
- **Rationale** for the choice
- **Constraints** it imposes on the architecture
- **Risks** and mitigation strategies

#### 2. Architecture Decision Records (ADR Stubs)

For each significant decision, create a stub:
```
### ADR-[NNN]: [Decision Title]
**Status:** Proposed
**Context:** [Why this decision is needed]
**Decision:** [What was decided]
**Consequences:** [What this means for the project]
**Alternatives Considered:** [What else was evaluated]
```

#### 3. Third-Party Dependency List

| Dependency | Purpose | License | Version | Risk Level | Alternative |
|---|---|---|---|---|---|

**Present all deliverables** to the user for review before saving.

**Save** to `docs/requirements/technical-constraints.md`

**Recommend** the user proceed to `/req-phase6-scope`

## Quality Gate

Before marking this phase complete, confirm:
- [ ] Every technology choice has a documented rationale
- [ ] All third-party dependencies are listed with license type
- [ ] Infrastructure decisions are documented (cloud, CI/CD, environments)
- [ ] ADR stubs exist for every non-trivial architecture decision
- [ ] Integration contracts are documented (API specs, data formats)
