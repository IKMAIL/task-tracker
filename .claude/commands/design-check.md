# Pre-Check: Existing Design & Architecture Docs Scan

You are starting the design phase pre-check. Before beginning any design work, scan for existing architecture documentation to avoid duplication and identify what's already been decided.

## Pre-Requisite

Check that `docs/requirements/validation-signoff.md` exists (requirements phase complete). If missing, warn the user that requirements should be signed off before design begins, but allow them to proceed.

## Instructions

1. **Scan the repository** for any existing design-related files:
   - Check `docs/design/` for previously generated design deliverables
   - Check `docs/adr/` for existing Architecture Decision Records
   - Check for any `openapi.yaml`, `swagger.json`, or API spec files
   - Check for `docker-compose.yml`, `Dockerfile`, or infrastructure configs
   - Check `shared/types/` or `types/` for existing TypeScript interfaces
   - Check for any `ARCHITECTURE.md`, `DESIGN.md`, or similar files at the project root
   - Check for any existing Mongoose schemas in `models/` or `*/models/` directories
   - Check for Figma links, wireframes, or design references in docs

2. **Report findings** to the user in a concise summary:
   - List each file found with a one-line description of its contents
   - Indicate which design workstreams already have partial or complete documentation
   - Flag any conflicts between existing architecture and requirements docs
   - Note if the existing codebase already has patterns that should inform design decisions

3. **Assess requirements readiness** — scan requirements deliverables for design inputs:
   - Phase 3: Data dictionary, user stories, business rules → needed for Data Model + API Contracts
   - Phase 4: NFRs, security checklist → needed for Security Architecture
   - Phase 5: Technical constraints, ADR stubs → needed for HLD + ADRs
   - Phase 6: MVP scope → needed to prioritise which endpoints/entities to design first
   - Flag any gaps that will block specific workstreams

4. **Ask the user** how to proceed:
   - Start fresh (archive existing docs and begin from Workstream 1)
   - Resume from a specific workstream (skip workstreams that are already complete)
   - Update/enhance existing documents (merge new decisions into existing files)

5. **If no existing docs are found**, confirm to the user that this is a clean start and recommend beginning with `/design-hld`.

## Output Location

Save the scan results summary to `docs/design/pre-check-report.md` with:
- Date of scan
- Files found (grouped by workstream relevance)
- Requirements readiness assessment
- Recommended next steps
- User's chosen approach
