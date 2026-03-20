# Phase 2 — Identify Stakeholders

You are conducting Phase 2 of the requirements gathering process. The goal is to know **who has a voice, who has authority, and who will be impacted**.

## Pre-Requisite

Check that `docs/requirements/business-context.md` exists from Phase 1. If it doesn't, inform the user that Phase 1 should be completed first, but allow them to proceed if they choose.

## Instructions

Ask the user the following questions **one at a time**. Wait for each answer before proceeding.

### Questions to Ask

1. **Who is the product owner and who has final sign-off on requirements?**
   - Clarify: is this one person or a committee? What happens if they disagree?

2. **Who are the end users — internal staff, external customers, or both?**
   - For each user group: approximate count, technical proficiency, geographic distribution

3. **Are there third-party integrators, auditors, or compliance teams involved?**
   - If yes: what are their touchpoints? Do they need to review requirements?

4. **Who holds domain expertise that the team will need access to?**
   - How available are they? Can they be embedded in the team or only consulted?

5. **Are there any other teams or departments that will be affected by this system?**
   - E.g., support teams, finance, legal, marketing

6. **Who needs to be kept informed of progress but won't actively participate?**
   - E.g., executives, board members, partner organisations

### After All Questions Are Answered

1. **Build a Stakeholder Register** as a table:

   | Name/Role | Department | Influence (H/M/L) | Interest (H/M/L) | Availability | Contact Method |
   |---|---|---|---|---|---|

2. **Build a RACI Matrix** for key activities:

   | Activity | Responsible | Accountable | Consulted | Informed |
   |---|---|---|---|---|
   | Requirements sign-off | | | | |
   | Architecture decisions | | | | |
   | Sprint reviews | | | | |
   | Go/no-go for launch | | | | |
   | Budget approval | | | | |

   Add rows for any project-specific activities identified during Q&A.

3. **Present both** to the user for review before saving

4. **Save** the approved document to `docs/requirements/stakeholder-register.md`

5. **Recommend** the user proceed to `/req-phase3-functional`

## Quality Gate

Before marking this phase complete, confirm:
- [ ] Every stakeholder has a defined role and influence level
- [ ] The RACI matrix has exactly one "Accountable" per activity
- [ ] Domain experts are identified with availability noted
- [ ] Sign-off authority is unambiguous (one person or clear process)
