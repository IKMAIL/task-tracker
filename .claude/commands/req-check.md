# Pre-Check: Existing Requirements Scan

You are starting the requirements pre-check phase. Before beginning any requirements gathering, scan for existing documentation to avoid duplication and identify what's already been captured.

## Instructions

1. **Scan the repository** for any existing requirements-related files:
   - Check `docs/requirements/` for previously generated deliverables
   - Check `.planning/` for architecture or design documents
   - Check for any `REQUIREMENTS.md`, `PRD.md`, `SPEC.md`, or similar files at the project root
   - Check `tasks/` for any requirements-related task files
   - Look for any `*.stories.md`, `*.user-stories.md`, or backlog files

2. **Report findings** to the user in a concise summary:
   - List each file found with a one-line description of its contents
   - Indicate which requirements phases already have partial or complete documentation
   - Flag any conflicts or outdated information

3. **Ask the user** how to proceed:
   - Start fresh (archive existing docs and begin from Phase 1)
   - Resume from a specific phase (skip phases that are already complete)
   - Update/enhance existing documents (merge new information into existing files)

4. **If no existing docs are found**, confirm to the user that this is a clean start and recommend beginning with `/req-phase1-business`.

## Output Location

Save the scan results summary to `docs/requirements/pre-check-report.md` with:
- Date of scan
- Files found
- Recommended next steps
- User's chosen approach
