# Phase 1 — Understand the Business Context

You are conducting Phase 1 of the requirements gathering process. The goal is to understand **why** this project exists before touching **what** it should do.

## Instructions

Ask the user the following questions **one at a time** using the AskUserQuestion tool or direct questions. Wait for each answer before proceeding to the next. Adapt follow-up questions based on answers received.

### Partial Save & Resume

- After every 3 answered questions, auto-save progress to `docs/requirements/business-context.draft.md` with a `## Progress` section noting which questions are completed
- If the user says "pause", "stop", or "save and continue later": save the current draft immediately and note the next question to resume from
- On resume: read the draft file, summarise what was covered, and continue from the next unanswered question

### Handling Incomplete Answers

- If the user answers "I don't know" or is unsure, log the item to the ambiguity log (`docs/requirements/ambiguity-log.md`) with status **Open** and continue — do not block the phase
- If a quality gate item cannot be checked due to missing answers, mark it as **Deferred** with the specific ambiguity log item ID

### Behavioral Guardrails

- Do not rephrase or reinterpret the user's answers — quote them directly when synthesizing deliverables
- Do not invent or assume answers the user has not provided — mark gaps explicitly as "[TBD — needs stakeholder input]"
- Do not embellish personas beyond what the user described — add "[assumed]" tags to any inferred details

### Questions to Ask

1. **What problem are we solving, and for whom?**
   - Probe for specifics: who experiences the pain, how often, what's the current workaround?

2. **What is the cost of inaction — what happens if we don't build this?**
   - Financial cost, operational inefficiency, competitive risk, user churn?
   - This helps prioritize and justify the project later

3. **What does success look like in 3, 6, and 12 months?**
   - Push for measurable outcomes, not vague goals. E.g., "reduce X by Y%" not "make it better"

4. **Is this a new product, a replacement, or an enhancement to an existing system?**
   - If replacement/enhancement: what exists today? What's being kept vs. replaced?

5. **Who are the primary and secondary users?**
   - Get specific personas, not just "users". E.g., "warehouse managers aged 30-50 with low tech literacy"

6. **Are there competitors or reference systems we should study?**
   - Ask for URLs, screenshots, or specific features they admire or want to avoid

7. **What are the business constraints?**
   - Budget range (if shareable)
   - Hard deadlines (regulatory, contractual, market-driven)
   - Regulatory or compliance requirements (GDPR, HIPAA, SOC2, etc.)

8. **Are there any domain-specific terms we should define now?**
   - Start building a glossary early — misaligned terminology causes rework later

### After All Questions Are Answered

1. **Synthesise the answers** into a structured document with these sections:
   - **Problem Statement**: 2-3 sentence summary of the core problem
   - **Cost of Inaction**: What happens if the project is not built
   - **Business Objectives**: Numbered list of what the project aims to achieve
   - **Success Metrics (KPIs)**: Table with columns: Metric | Target | Timeframe | How Measured
   - **User Personas**: Brief description of each user type
   - **Competitive Landscape**: Reference systems and key takeaways
   - **Constraints**: Budget, timeline, regulatory summary
   - **Glossary**: Domain-specific terms and definitions (carried forward to all phases)

2. **Present the document** to the user for review before saving

3. **Save** the approved document to `docs/requirements/business-context.md`

4. **Recommend** the user proceed to `/req-phase2-stakeholders`

## Quality Gate

Before marking this phase complete, confirm:
- [ ] Problem statement is specific and measurable (no vague terms)
- [ ] Cost of inaction is documented
- [ ] At least 2 KPIs have numeric targets
- [ ] User personas are defined with enough detail to guide design decisions
- [ ] All constraints are documented with their source/reason
- [ ] Glossary contains at least the core domain terms
