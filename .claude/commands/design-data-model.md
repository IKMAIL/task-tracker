# Workstream 2 — Data Modelling

You are conducting Workstream 2 of the System Design & Architecture phase. The goal is to design **MongoDB schemas and TypeScript interfaces** for every entity in the system.

## Pre-Requisite

Check that these documents exist and read them before starting:
- `docs/design/high-level-design.md` — architecture pattern, service boundaries (from WS1)
- `docs/requirements/functional-requirements.md` — data dictionary, business rules, user stories
- `docs/requirements/nonfunctional-requirements.md` — data management, performance targets
- `docs/requirements/technical-constraints.md` — MongoDB deployment, caching, search requirements

If the HLD is missing, inform the user that Workstream 1 must be completed first — the embed/reference strategy and service boundary decisions depend on it. If the Phase 3 data dictionary is missing, this workstream cannot proceed meaningfully.

## Instructions

Walk through each entity from the Phase 3 data dictionary one at a time. For each entity: decide embed vs reference, design the schema, write the TypeScript interface, and define indexes.

### Partial Save & Resume

- After every 3 entities are modelled, auto-save progress to `docs/design/data-model.draft.md`
- If the user says "pause" or "save and continue later": save immediately and note the next entity
- On resume: read the draft, list entities already modelled, continue with the next one

### Behavioral Guardrails

- Do not add fields or entities the user hasn't described in requirements — if you think one is missing, ask first: "The user stories mention [X] but the data dictionary has no field for it. Should we add one?"
- Do not make embed vs reference decisions without explaining the trade-off and getting confirmation
- Use the Phase 1 glossary for field naming consistency
- Reference specific user stories or business rules when justifying schema decisions

### Contradiction Detection

- If a schema decision conflicts with a user story's access pattern, flag it: "US-[NNN] requires [query pattern], but this embed decision would make that query a full collection scan"
- If the HLD service boundaries conflict with entity ownership, raise it before proceeding

### Process for Each Entity

**Step 1: Identify Access Patterns**

List all user stories that read/write this entity. Identify:
- Most common query patterns (which fields are filtered, sorted, joined?)
- Read-to-write ratio (heavily read → optimise for queries; heavily written → optimise for inserts)
- Whether the data is always accessed together or sometimes independently

**Step 2: Embed vs Reference Decision**

Apply this decision framework and present the recommendation with rationale:

**Embed when:**
- Data is always read together with the parent
- 1:1 or 1:few relationship (bounded size)
- Child doesn't exist independently
- Document stays well under 16MB

**Reference when:**
- Data is queried independently
- Many-to-many relationship
- Child is shared across multiple parents
- Unbounded growth possible (e.g., comments on a post)

**Step 3: TypeScript Interface**

Write the interface following this pattern:

```typescript
// types/[entity].ts
import { Types } from 'mongoose';

export interface I[Entity] {
  _id: Types.ObjectId;
  // ... fields from data dictionary
  // Use union types for enums: status: 'active' | 'inactive' | 'archived'
  // Use Types.ObjectId for references, not string
  // Mark optional fields with ?
  createdAt: Date;
  updatedAt: Date;  // via { timestamps: true }
}

// For embedded subdocuments (no _id unless direct access needed):
export interface I[SubDocument] {
  // ...
}
```

**Step 4: Mongoose Schema**

Write the schema with validations mapped from the business rules catalogue:

```typescript
// models/[Entity].ts
import { Schema, model, Types } from 'mongoose';
import { I[Entity] } from '../types/[entity]';

const [Entity]Schema = new Schema<I[Entity]>({
  field: {
    type: String,
    required: [true, 'Field is required'],
    unique: true,
    lowercase: true,
    trim: true,
    enum: ['value1', 'value2'],  // for fixed sets
    ref: '[OtherEntity]',         // for references
  },
}, { timestamps: true });

// Indexes defined after schema
[Entity]Schema.index({ field1: 1 });
[Entity]Schema.index({ field1: 1, field2: -1 });

export const [Entity] = model<I[Entity]>('[Entity]', [Entity]Schema);
```

**Step 5: Index Plan**

| Index | Fields | Type | Purpose | Query Pattern |
|---|---|---|---|---|
| Primary | `_id` | Default | Document lookup | `findById()` |
| Unique | `email` | Unique | Prevent duplicates | `findOne({ email })` |
| Compound | `{ status: 1, createdAt: -1 }` | Compound | Dashboard listing | `find({ status }).sort(...)` |
| Text | `{ name: 'text', description: 'text' }` | Text | Full-text search | `$text` queries |

### If Microservices Architecture

If the HLD specifies microservices:
- Each service owns specific collections — document which service owns which
- Cross-service references store IDs only (no `populate()` across service boundaries)
- Document the consistency model per operation: eventual consistency, or strong consistency via saga/2PC
- Identify any data duplicated across services (denormalisation) and the sync strategy

### After All Entities Are Modelled

Generate **four deliverables**:

#### 1. Complete Data Model Document

For each entity: TypeScript interface (full code), Mongoose schema (full code), index strategy table, embed/reference decisions with rationale.

#### 2. Entity Relationship Diagram

Mermaid or ASCII diagram showing all entities, relationships, cardinalities, and embed/reference indicators:

```
User (1) ──── (N) Order
  │                  │
  │                  └── (N) [embedded] OrderItem
  │
  └── (N) TeamMembership ──── (1) Team
```

#### 3. Collection Inventory

| Collection | Service Owner | Avg Doc Size | Est. Growth Rate | TTL/Archival? | Sharding Key |
|---|---|---|---|---|---|

#### 4. Migration & Seed Strategy

- Existing data migration: approach if migrating from a legacy system
- Seed data: strategy for dev/test environments (factories, fixtures, `mongodb-memory-server`)
- MongoDB schema validation: JSON schema rules for runtime safety beyond Mongoose

**Present all deliverables** to the user for review before saving.

**Save** to `docs/design/data-model.md`

**Recommend** the user proceed to `/design-api-contracts`

## Quality Gate

Before marking this workstream complete, confirm:
- [ ] Every entity from the Phase 3 data dictionary has a TypeScript interface
- [ ] Every entity has a Mongoose schema with validations matching business rules
- [ ] Embed vs reference is decided and documented for every relationship
- [ ] Index strategy covers every common query pattern from user stories
- [ ] Entity relationship diagram is complete with cardinalities
- [ ] If microservices: collection ownership per service is documented
- [ ] Cascade/delete behaviour is defined for every relationship
- [ ] No field from the data dictionary is missing from the schemas
- [ ] TypeScript interfaces use strict types (no `any`, no `string` for ObjectIds)
- [ ] Seed/migration strategy is documented
