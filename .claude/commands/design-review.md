# Design Validation & Phase Gate

You are conducting the final validation step of the System Design & Architecture phase. The goal is to confirm that all five workstreams are **complete, consistent, and ready to hand off** to Step 3 (UI/UX Design) and Step 4 (Project Setup & DevOps).

## Pre-Requisite

All workstream outputs should exist in `docs/design/`. List which are present and which are missing:

| Deliverable | Expected File | Status |
|---|---|---|
| Pre-check report | `docs/design/pre-check-report.md` | Present/Missing |
| High-Level Design | `docs/design/high-level-design.md` | Present/Missing |
| Data Model | `docs/design/data-model.md` | Present/Missing |
| API Contracts | `docs/design/api-contracts.md` | Present/Missing |
| OpenAPI Spec | `docs/design/openapi.yaml` | Present/Missing |
| Security Architecture | `docs/design/security-architecture.md` | Present/Missing |
| Folder Structure | `docs/design/folder-structure.md` | Present/Missing |
| ADR Index | `docs/adr/README.md` | Present/Missing |
| Design Ambiguity Log | `docs/design/design-ambiguity-log.md` | Present/Missing |

If any **workstream output** (HLD, Data Model, API Contracts, Security, Folder Structure, ADRs) is missing, recommend completing the relevant workstream before proceeding. Allow the user to continue if they choose, but flag it as a risk.

## Instructions

This phase is a structured review, not a Q&A. Work through each check systematically and present findings to the user.

### Step 1: Internal Consistency Checks

Read all workstream documents and check for conflicts:

**HLD ↔ Data Model:**
- [ ] Microservice service boundaries in HLD match collection ownership in Data Model
- [ ] Caching strategy in HLD references the correct entities from Data Model
- [ ] Background job entities exist in the Data Model

**Data Model ↔ API Contracts:**
- [ ] Every API response shape uses fields that exist in the Data Model
- [ ] No API response returns a field not present in any schema
- [ ] All referenced entity IDs in API contracts use `Types.ObjectId` (not `string`) in the Data Model

**API Contracts ↔ Security:**
- [ ] Every endpoint's auth requirement matches the role-permission matrix from Phase 3
- [ ] Rate limiting tiers in Security Architecture cover all endpoint groups in API Contracts
- [ ] CORS allowed origins cover all frontend deployment environments

**HLD ↔ Folder Structure:**
- [ ] Folder structure matches the architecture pattern (mono/micro/SSR matches the layout chosen)
- [ ] Shared types location in Folder Structure matches what API Contracts reference

**All Workstreams ↔ Requirements:**
- [ ] Every MVP user story (Must Have from Phase 6) has at least one endpoint in API Contracts
- [ ] All NFR performance targets have a corresponding design decision (caching, indexing, CDN)
- [ ] All Phase 4 compliance obligations appear in the Security Architecture

Present all failures to the user with specific file references. Do not mark this step complete until the user either resolves conflicts or explicitly defers them to the ambiguity log.

### Step 2: Gap Analysis

Report on any of the following gaps:

**Data Model gaps:**
- Entities referenced in user stories not in the Data Model
- Fields in API responses with no corresponding schema field
- Business rules (from Phase 3) with no corresponding Mongoose validator

**API Contract gaps:**
- User story actions with no corresponding endpoint
- Roles in the permission matrix with no corresponding `authorize([...])` middleware rule
- Error cases in business rules with no corresponding error code

**Security gaps:**
- Phase 4 security checklist items with no implementation decision in WS4
- Compliance obligations (GDPR, HIPAA, etc.) with no corresponding security control

**ADR gaps:**
- Significant decisions made in workstreams without a corresponding ADR
- Phase 5 ADR stubs not promoted to full ADRs

**Folder structure gaps:**
- Directories referenced in code patterns (WS3, WS4) not present in the agreed structure

### Step 3: Design Ambiguity Log Review

Check if `docs/design/design-ambiguity-log.md` exists:
- If yes: review all open items and ask the user to resolve each one
- If no: create one and populate it with any unresolved items found in steps 1 and 2

Every item must have: ID, Description, Impact, Owner, Due Date, Status (Open/Resolved/Deferred).

### Step 4: Phase Gate Checklist

Present this checklist and go through each item with the user:

**Architecture:**
- [ ] Architecture pattern is decided and documented (HLD)
- [ ] All communication patterns are specified (REST, WebSocket, message queue)
- [ ] Architecture diagram exists showing all components and connections

**Data:**
- [ ] Every entity has a TypeScript interface and Mongoose schema
- [ ] Embed vs reference is decided for every relationship
- [ ] Index strategy covers every common query pattern
- [ ] Entity relationship diagram is complete

**API:**
- [ ] Every Must Have user story has a corresponding endpoint
- [ ] OpenAPI spec is complete and valid
- [ ] Shared TypeScript request/response types are defined
- [ ] Global API conventions are agreed (error shape, pagination, dates, IDs)

**Security:**
- [ ] Auth token lifecycle is fully designed
- [ ] RBAC matches Phase 3 role-permission matrix
- [ ] CORS is configured per environment
- [ ] Rate limiting is defined per endpoint tier
- [ ] All Phase 4 security checklist items are addressed

**Structure:**
- [ ] Folder structure is agreed and consistent with architecture pattern
- [ ] Backend layered architecture rules are documented
- [ ] Naming conventions are documented
- [ ] Scaffold action plan is ready for Step 4

**ADRs:**
- [ ] All 8 mandatory ADRs exist and are Accepted
- [ ] Every significant decision has an ADR
- [ ] ADR index is complete

**Cross-cutting:**
- [ ] Design ambiguity log has zero unresolved blockers
- [ ] No conflicts exist between workstream deliverables
- [ ] All MVP user stories (Must Have) are fully covered by the design

### Step 5: Parallel Track Readiness

Confirm which parallel tracks can now begin:

| Track | Can Start? | Requires |
|---|---|---|
| Step 3 — UI/UX Design | Yes if HLD + API Contracts complete | Architecture diagram, API surface |
| Step 4 — Project Setup | Yes if HLD + Folder Structure + ADRs complete | Tech stack decisions, structure |
| Frontend development | Not yet — needs UI/UX design first | Wireframes, component specs |
| Backend development | Not yet — needs project setup first | Scaffold, CI/CD, environments |

### Step 6: Formal Sign-Off

Ask the user to confirm:
- "Do you approve the System Design & Architecture baseline?"
- Record the approval with date and any conditions

### After Completion

Generate the **Design Sign-Off Report**:

```
System Design & Architecture — Sign-Off Report
===============================================
Date:              [date]
Reviewer(s):       [names/roles]

Workstreams Completed:
  WS1 — HLD:                  [Complete/Incomplete]
  WS2 — Data Model:           [Complete/Incomplete]
  WS3 — API Contracts:        [Complete/Incomplete]
  WS4 — Security:             [Complete/Incomplete]
  WS5 — Folder Structure:     [Complete/Incomplete]
  WS6 — ADRs:                 [Complete/Incomplete]

Consistency Checks:    [Passed/Failed — N issues found]
Gap Analysis:          [Clean/N gaps found]
Ambiguity Log:         [N open / N resolved / N deferred]
Phase Gate Checklist:  [N/N items passed]

Approval Status:       Approved / Approved with Conditions / Not Approved
Conditions:            [list if any]

Parallel Tracks Cleared:
  UI/UX Design:        [Yes/No]
  Project Setup:       [Yes/No]

All deliverables saved to: docs/design/ and docs/adr/
```

**Save** to `docs/design/design-signoff.md`

**Next Steps:**
- If approved: proceed to Step 3 (`/uiux-kickoff` — coming soon) and Step 4 (`/setup-project` — coming soon) in parallel
- If not approved: address gaps and re-run `/design-review`

## Quality Gate

Design phase is complete when:
- [ ] All workstream quality gates are satisfied
- [ ] Zero unresolved conflicts between workstreams
- [ ] Design ambiguity log has zero unresolved blockers
- [ ] Phase gate checklist is 100% passed
- [ ] All MVP user stories are fully covered by the design
- [ ] Formal approval is recorded with date
