import { computeCompletionPct } from '../src/services/checklistService';
import { IChecklist } from '../src/models/Task';
import mongoose from 'mongoose';

const id = () => new mongoose.Types.ObjectId();

const item = (completed: boolean, children: any[] = []): any => ({
  _id: id(), text: 'item', completed, assignedPersonId: null, order: 0, children,
});

const checklist = (items: any[]): IChecklist => ({
  _id: id(), title: 'Test', items,
});

describe('computeCompletionPct', () => {
  it('returns null for empty checklists array', () => {
    expect(computeCompletionPct([])).toBeNull();
  });

  it('returns null when checklists have no items', () => {
    expect(computeCompletionPct([checklist([])])).toBeNull();
  });

  it('returns 0 when no items are complete', () => {
    expect(computeCompletionPct([checklist([item(false), item(false)])])).toBe(0);
  });

  it('returns 100 when all top-level items are complete', () => {
    expect(computeCompletionPct([checklist([item(true), item(true)])])).toBe(100);
  });

  it('returns 50 for half-complete top-level items', () => {
    expect(computeCompletionPct([checklist([item(true), item(false)])])).toBe(50);
  });

  it('counts sub-items independently in the total', () => {
    // 1 top-level complete, 1 sub-item complete, 1 sub-item incomplete → 2/3 ≈ 67%
    const parent = item(true, [item(true), item(false)]);
    expect(computeCompletionPct([checklist([parent])])).toBe(67);
  });

  it('aggregates across multiple checklists', () => {
    // cl1: 1 complete, cl2: 1 incomplete → 1/2 = 50%
    expect(computeCompletionPct([checklist([item(true)]), checklist([item(false)])])).toBe(50);
  });

  it('rounds down fractional percentages', () => {
    // 1 complete out of 3 → 33.33% → rounds to 33
    expect(computeCompletionPct([checklist([item(true), item(false), item(false)])])).toBe(33);
  });
});
