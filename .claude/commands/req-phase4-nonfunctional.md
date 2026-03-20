# Phase 4 — Non-Functional Requirements

You are conducting Phase 4 of the requirements gathering process. The goal is to define **how well the system must perform**, not just what it does.

## Pre-Requisite

Check that `docs/requirements/functional-requirements.md` exists. The functional scope informs NFR targets (e.g., which APIs need SLAs). If missing, inform the user but allow them to proceed.

## Instructions

Ask questions **by category**, presenting all questions within a category as a numbered group. The user can answer all at once or flag specific ones for discussion. Before starting, tell the user: "This phase covers 8 categories. I'll present them one category at a time — you can answer the batch or we can discuss individual questions."

For each category, push for **measurable targets** — reject vague answers like "fast" or "secure".

### Handling Incomplete Answers

- If the user answers "I don't know" or is unsure, log the item to the ambiguity log (`docs/requirements/ambiguity-log.md`) with status **Open** and continue — do not block the phase.
- If the user provides contradictory information to a previous phase, flag it explicitly: "In Phase [N], you said [X]. This seems to conflict with [Y]. Which is correct?"
- If a quality gate item cannot be checked due to missing answers, mark it as **Deferred** with the specific ambiguity log item ID.

### Behavioral Guardrails

- Do not rephrase or reinterpret the user's answers — quote them directly when synthesizing deliverables
- If the user gives a vague answer (e.g., "it should be fast"), do not accept it — ask for a specific number or range
- Do not invent or assume answers the user has not provided — mark gaps explicitly as "[TBD — needs stakeholder input]"

### Adaptive Rules

- If the user indicates a small internal tool (< 20 users, no public access), mark Scalability and Internationalisation categories as optional and propose sensible defaults
- If no compliance requirements were identified in Phase 1, reduce Security to authentication and encryption questions only
- If the user says a category is not applicable, acknowledge it, record "N/A — [reason]" for that category, and skip to the next
- When a question from a previous phase already covers a topic (e.g., auth method specified in Phase 1 constraints), confirm the existing answer rather than re-asking

### Questions to Ask

**Category 1 of 8: Performance**

1. What is the expected number of concurrent users at peak?
2. What is the acceptable page load time? (e.g., < 2s for initial load, < 500ms for subsequent)
3. What is the API response time SLA? (e.g., P95 < 200ms for reads, < 500ms for writes)
4. Are there any batch processing or heavy computation requirements?

**Category 2 of 8: Scalability**

5. Will traffic spike seasonally or due to events? By how much?
6. Is horizontal scaling expected (add more instances) or vertical (bigger servers)?
7. What is the projected data growth rate? (e.g., 10GB/month, 1M records/year)

**Category 3 of 8: Security**

8. What authentication method is required? (JWT, OAuth2, SSO, MFA)
9. What is the data sensitivity level? (Public, Internal, Confidential, Restricted)
10. Are there compliance obligations? (GDPR, HIPAA, SOC2, PCI-DSS, ISO 27001)
11. Is data encryption required at rest and in transit?
12. Are there IP whitelisting or network segmentation requirements?

**MERN-Specific Security (follow-ups to above)**

12a. What is the CORS policy? (Allowed origins, credentials, methods — different per environment?)
12b. What Content Security Policy (CSP) headers are required for the frontend?
12c. What are the rate limiting requirements? (Requests per minute per user/IP, different limits per endpoint, brute-force protection on login?)
12d. What is the JWT token strategy? (Access token lifetime, refresh token strategy, revocation mechanism, storage: localStorage vs httpOnly cookie — document the XSS/CSRF trade-off)
12e. What input sanitization is required beyond validation? (NoSQL injection prevention for MongoDB, XSS prevention on stored content)
12f. Is dependency vulnerability scanning required in CI? (npm audit, Snyk, Dependabot)

**Category 4 of 8: Availability & Reliability**

13. What is the required uptime SLA? (99.9% = 8.7h downtime/year, 99.99% = 52min/year)
14. Are maintenance windows allowed? When?
15. What is the Recovery Time Objective (RTO) and Recovery Point Objective (RPO)?
    - **RTO** = How quickly must the system be back online after a failure? (e.g., "within 1 hour")
    - **RPO** = How much data loss is acceptable? (e.g., "no more than 15 minutes of data")

**Category 5 of 8: Data Management**

16. What is the data retention policy? (How long must data be kept?)
17. What are the backup and recovery requirements? (Frequency, retention, tested?)
18. Is there a data archival strategy needed?

**Category 6 of 8: Accessibility**

19. What WCAG compliance level is required? (A, AA, AAA)
20. Are there specific assistive technology requirements?

**Category 7 of 8: Internationalisation** _(skip if single language/region confirmed)_

21. Is multi-language support needed? Which languages?
22. Is multi-currency or multi-timezone support needed?
23. Are there locale-specific formatting requirements (dates, numbers)?

**Category 8 of 8: Audit & Logging**

24. What user actions need to be logged?
25. Is a full audit trail required? (Who changed what, when, before/after values)
26. What is the log retention period?
27. Are there regulatory requirements for audit logging?

### Partial Progress Saving

If the user needs to pause mid-phase, or if the conversation is getting long:
1. Save answers collected so far to `docs/requirements/nonfunctional-requirements.draft.md` with a `## Status: In Progress — Categories 1-N answered` header
2. List which categories remain unanswered
3. When the user resumes (or runs this skill again), check for the `.draft.md` file and offer to continue from where they left off

### After All Questions Are Answered

Generate **two deliverables**:

#### 1. NFR Specification Sheet

| Category | Requirement | Target | Measurement Method | Priority |
|---|---|---|---|---|
| Performance | Page load time | < 2s (P95) | Lighthouse / RUM | Must Have |
| Security | Authentication | JWT + MFA | Penetration test | Must Have |
| ... | ... | ... | ... | ... |

Every row must have a **measurable target** and a **method to verify it**.

#### 2. Security & Compliance Checklist

- [ ] Authentication method defined: [method]
- [ ] Data classification completed: [level]
- [ ] Encryption at rest: [Yes/No — technology]
- [ ] Encryption in transit: [Yes/No — TLS version]
- [ ] Compliance frameworks identified: [list]
- [ ] Audit logging requirements defined: [scope]
- [ ] Data retention policy documented: [duration]
- [ ] Backup/recovery tested: [Yes/No — RTO/RPO]
- [ ] Accessibility standard: [WCAG level]
- [ ] Penetration testing planned: [Yes/No — frequency]
- [ ] CORS policy defined per environment: [origins]
- [ ] CSP headers configured: [Yes/No — directives]
- [ ] Rate limiting configured: [limits per endpoint]
- [ ] JWT lifetime and refresh strategy defined: [details]
- [ ] JWT storage method decided: [localStorage / httpOnly cookie — trade-off documented]
- [ ] NoSQL injection prevention verified: [method]
- [ ] Dependency vulnerability scanning enabled: [tool and frequency]

**Present both** to the user for review before saving.

**Save** to `docs/requirements/nonfunctional-requirements.md`

**Recommend** the user proceed to `/req-phase5-technical`

## Quality Gate

Before marking this phase complete, confirm:
- [ ] Every NFR has a numeric or measurable target (no "fast", "secure", "scalable")
- [ ] Each NFR has a verification method defined
- [ ] Security classification and compliance obligations are explicit
- [ ] Availability targets include RTO and RPO
- [ ] Accessibility requirements specify a WCAG level
