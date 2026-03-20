# Phase 4 — Non-Functional Requirements

You are conducting Phase 4 of the requirements gathering process. The goal is to define **how well the system must perform**, not just what it does.

## Pre-Requisite

Check that `docs/requirements/functional-requirements.md` exists. The functional scope informs NFR targets (e.g., which APIs need SLAs). If missing, inform the user but allow them to proceed.

## Instructions

Ask questions **by category**, one category at a time. For each, push for **measurable targets** — reject vague answers like "fast" or "secure".

### Questions to Ask

**Performance**

1. What is the expected number of concurrent users at peak?
2. What is the acceptable page load time? (e.g., < 2s for initial load, < 500ms for subsequent)
3. What is the API response time SLA? (e.g., P95 < 200ms for reads, < 500ms for writes)
4. Are there any batch processing or heavy computation requirements?

**Scalability**

5. Will traffic spike seasonally or due to events? By how much?
6. Is horizontal scaling expected (add more instances) or vertical (bigger servers)?
7. What is the projected data growth rate? (e.g., 10GB/month, 1M records/year)

**Security**

8. What authentication method is required? (JWT, OAuth2, SSO, MFA)
9. What is the data sensitivity level? (Public, Internal, Confidential, Restricted)
10. Are there compliance obligations? (GDPR, HIPAA, SOC2, PCI-DSS, ISO 27001)
11. Is data encryption required at rest and in transit?
12. Are there IP whitelisting or network segmentation requirements?

**Availability & Reliability**

13. What is the required uptime SLA? (99.9% = 8.7h downtime/year, 99.99% = 52min/year)
14. Are maintenance windows allowed? When?
15. What is the Recovery Time Objective (RTO) and Recovery Point Objective (RPO)?

**Data Management**

16. What is the data retention policy? (How long must data be kept?)
17. What are the backup and recovery requirements? (Frequency, retention, tested?)
18. Is there a data archival strategy needed?

**Accessibility**

19. What WCAG compliance level is required? (A, AA, AAA)
20. Are there specific assistive technology requirements?

**Internationalisation**

21. Is multi-language support needed? Which languages?
22. Is multi-currency or multi-timezone support needed?
23. Are there locale-specific formatting requirements (dates, numbers)?

**Audit & Logging**

24. What user actions need to be logged?
25. Is a full audit trail required? (Who changed what, when, before/after values)
26. What is the log retention period?
27. Are there regulatory requirements for audit logging?

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
