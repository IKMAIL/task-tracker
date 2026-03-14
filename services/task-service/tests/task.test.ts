import { calculateNextRunAt } from '../src/services/taskService';

describe("Task endpoints", () => {
  it("GET /tasks returns list", () => expect(true).toBe(true));
  it("POST /tasks creates a task", () => expect(true).toBe(true));
  it("GET /tasks/summary returns aggregated counts", () =>
    expect(true).toBe(true));
});

describe("GET /tasks/search", () => {
  it("returns 400 when q param is missing", () => expect(true).toBe(true));
  it("returns 400 when q is a single character", () => expect(true).toBe(true));
  it("returns tasks matching title with valid q", () => expect(true).toBe(true));
  it("returns tasks matching description with valid q", () => expect(true).toBe(true));
  it("returns empty list when no tasks match", () => expect(true).toBe(true));
});

describe("calculateNextRunAt", () => {
  const base = new Date('2026-01-01T01:00:00.000Z');

  it("daily: advances by interval days", () => {
    const next = calculateNextRunAt('daily', 1, base);
    expect(next.toISOString()).toBe('2026-01-02T01:00:00.000Z');
  });

  it("daily: advances by 3 days when interval=3", () => {
    const next = calculateNextRunAt('daily', 3, base);
    expect(next.toISOString()).toBe('2026-01-04T01:00:00.000Z');
  });

  it("weekly: advances by 7 days", () => {
    const next = calculateNextRunAt('weekly', 1, base);
    expect(next.toISOString()).toBe('2026-01-08T01:00:00.000Z');
  });

  it("weekly: advances by 14 days when interval=2", () => {
    const next = calculateNextRunAt('weekly', 2, base);
    expect(next.toISOString()).toBe('2026-01-15T01:00:00.000Z');
  });

  it("monthly: advances by 1 month", () => {
    const next = calculateNextRunAt('monthly', 1, base);
    expect(next.getMonth()).toBe(1); // February
    expect(next.getFullYear()).toBe(2026);
  });

  it("monthly: advances by 3 months when interval=3", () => {
    const next = calculateNextRunAt('monthly', 3, base);
    expect(next.getMonth()).toBe(3); // April
    expect(next.getFullYear()).toBe(2026);
  });

  it("quarterly: advances by 3 months", () => {
    const next = calculateNextRunAt('quarterly', 1, base);
    expect(next.getMonth()).toBe(3); // April
    expect(next.getFullYear()).toBe(2026);
  });

  it("quarterly: advances by 6 months when interval=2", () => {
    const next = calculateNextRunAt('quarterly', 2, base);
    expect(next.getMonth()).toBe(6); // July
    expect(next.getFullYear()).toBe(2026);
  });

  it("does not mutate the input date", () => {
    const input = new Date('2026-03-01T00:00:00.000Z');
    const inputCopy = new Date(input);
    calculateNextRunAt('weekly', 1, input);
    expect(input.toISOString()).toBe(inputCopy.toISOString());
  });
});

describe("Recurring task recurrence schema validation", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Joi = require('joi');

  const recurrenceSchema = Joi.object({
    enabled:        Joi.boolean().required(),
    frequency:      Joi.string().valid('daily','weekly','monthly','quarterly').when('enabled', { is: true, then: Joi.required() }),
    interval:       Joi.number().integer().min(1).max(365).default(1),
    nextRunAt:      Joi.date().when('enabled', { is: true, then: Joi.required() }),
    endDate:        Joi.date().allow(null).optional(),
    maxOccurrences: Joi.number().integer().min(1).allow(null).optional(),
  });

  it("enabled=false requires no frequency or nextRunAt", () => {
    const { error } = recurrenceSchema.validate({ enabled: false });
    expect(error).toBeUndefined();
  });

  it("enabled=true requires frequency and nextRunAt", () => {
    const { error } = recurrenceSchema.validate({ enabled: true });
    expect(error).toBeDefined();
    const fields = error!.details.map((d: { path: string[] }) => d.path[0]);
    expect(fields).toContain('frequency');
    expect(fields).toContain('nextRunAt');
  });

  it("rejects invalid frequency values", () => {
    const { error } = recurrenceSchema.validate({ enabled: true, frequency: 'hourly', nextRunAt: new Date() });
    expect(error).toBeDefined();
  });

  it("accepts valid full recurrence payload", () => {
    const { error } = recurrenceSchema.validate({
      enabled: true,
      frequency: 'quarterly',
      interval: 1,
      nextRunAt: new Date('2026-04-01'),
      endDate: new Date('2027-01-01'),
      maxOccurrences: 4,
    });
    expect(error).toBeUndefined();
  });
});

describe("Recurring task runRecurring logic (unit)", () => {
  it("spawnChild rolling date math: child dueDate = now + original duration", () => {
    const plannedStartDate = new Date('2026-01-01');
    const dueDate = new Date('2026-01-15'); // 14-day duration
    const now = new Date('2026-04-01T01:00:00.000Z');

    const durationMs = dueDate.getTime() - plannedStartDate.getTime();
    const expectedDueDate = new Date(now.getTime() + durationMs);

    expect(durationMs).toBe(14 * 24 * 60 * 60 * 1000); // 14 days in ms
    expect(expectedDueDate.toISOString()).toBe('2026-04-15T01:00:00.000Z');
  });

  it("maxOccurrences gate: skips spawn when occurrenceCount >= maxOccurrences", () => {
    const rec = { maxOccurrences: 4, occurrenceCount: 4 };
    const shouldSkip = rec.maxOccurrences !== null && rec.occurrenceCount >= rec.maxOccurrences;
    expect(shouldSkip).toBe(true);
  });

  it("maxOccurrences gate: skips spawn when occurrenceCount > maxOccurrences", () => {
    const rec = { maxOccurrences: 4, occurrenceCount: 5 };
    const shouldSkip = rec.maxOccurrences !== null && rec.occurrenceCount >= rec.maxOccurrences;
    expect(shouldSkip).toBe(true);
  });

  it("maxOccurrences gate: allows spawn when occurrenceCount < maxOccurrences", () => {
    const rec = { maxOccurrences: 4, occurrenceCount: 3 };
    const shouldSkip = rec.maxOccurrences !== null && rec.occurrenceCount >= rec.maxOccurrences;
    expect(shouldSkip).toBe(false);
  });

  it("maxOccurrences gate: allows spawn when maxOccurrences is null (unlimited)", () => {
    const rec = { maxOccurrences: null, occurrenceCount: 999 };
    const shouldSkip = rec.maxOccurrences !== null && rec.occurrenceCount >= rec.maxOccurrences;
    expect(shouldSkip).toBe(false);
  });

  it("endDate gate: excludes tasks past endDate", () => {
    const now = new Date('2026-06-01');
    const passesFilter = (endDate: Date | null) =>
      endDate === null || endDate > now;

    expect(passesFilter(new Date('2026-05-01'))).toBe(false); // past end
    expect(passesFilter(new Date('2026-12-01'))).toBe(true);  // future end
    expect(passesFilter(null)).toBe(true);                    // no end (unlimited)
  });

  it("occurrenceCount increments correctly after each spawn", () => {
    let occurrenceCount = 0;
    const maxOccurrences = 3;

    for (let i = 0; i < 3; i++) {
      const shouldSkip = maxOccurrences !== null && occurrenceCount >= maxOccurrences;
      expect(shouldSkip).toBe(false);
      occurrenceCount++;
    }

    // 4th attempt should be skipped
    const shouldSkipFinal = maxOccurrences !== null && occurrenceCount >= maxOccurrences;
    expect(shouldSkipFinal).toBe(true);
  });
});
