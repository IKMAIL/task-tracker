import Task, { IChecklist, IChecklistItem } from '../models/Task';
import { logger } from '@task-tracker/utils';

/** Count all items + sub-items across all checklists and return completion %.
 *  Returns null when there are no items (caller should leave completionPct unchanged). */
export function computeCompletionPct(checklists: IChecklist[]): number | null {
  let total = 0;
  let completed = 0;
  for (const cl of checklists) {
    for (const item of cl.items) {
      total++;
      if (item.completed) completed++;
      for (const sub of item.children) {
        total++;
        if (sub.completed) completed++;
      }
    }
  }
  if (total === 0) return null;
  return Math.round((completed / total) * 100);
}

async function getTaskDoc(taskId: string) {
  const task = await Task.findById(taskId);
  if (!task) throw Object.assign(new Error('Task not found'), { status: 404 });
  return task;
}

export const createChecklist = async (taskId: string, title: string) => {
  logger.debug('checklistService.createChecklist', { taskId, title });
  const task = await getTaskDoc(taskId);
  (task.checklists as any).push({ title, items: [] });
  await task.save();
  const added = task.checklists[task.checklists.length - 1];
  logger.info('checklist created', { taskId, clId: String(added._id) });
  return task.checklists;
};

export const renameChecklist = async (taskId: string, clId: string, title: string) => {
  logger.debug('checklistService.renameChecklist', { taskId, clId, title });
  const task = await getTaskDoc(taskId);
  const cl = (task.checklists as any).id(clId);
  if (!cl) throw Object.assign(new Error('Checklist not found'), { status: 404 });
  cl.title = title;
  await task.save();
  return task.checklists;
};

export const deleteChecklist = async (taskId: string, clId: string) => {
  logger.debug('checklistService.deleteChecklist', { taskId, clId });
  const task = await getTaskDoc(taskId);
  const cl = (task.checklists as any).id(clId);
  if (!cl) throw Object.assign(new Error('Checklist not found'), { status: 404 });
  cl.deleteOne();
  const pct = computeCompletionPct(task.checklists as unknown as IChecklist[]);
  if (pct !== null) task.completionPct = pct;
  await task.save();
  return task.checklists;
};

export const addItem = async (
  taskId: string,
  clId: string,
  data: { text: string; assignedPersonId?: string | null; parentItemId?: string }
) => {
  logger.debug('checklistService.addItem', { taskId, clId, data });
  const task = await getTaskDoc(taskId);
  const cl = (task.checklists as any).id(clId);
  if (!cl) throw Object.assign(new Error('Checklist not found'), { status: 404 });

  const newItem = { text: data.text, completed: false, assignedPersonId: data.assignedPersonId || null, order: 0, children: [] };

  if (data.parentItemId) {
    const parentItem = cl.items.id(data.parentItemId);
    if (!parentItem) throw Object.assign(new Error('Parent item not found'), { status: 404 });
    parentItem.children.push(newItem);
  } else {
    cl.items.push(newItem);
  }

  const pct = computeCompletionPct(task.checklists as unknown as IChecklist[]);
  if (pct !== null) task.completionPct = pct;
  await task.save();
  return task.checklists;
};

export const updateItem = async (
  taskId: string,
  clId: string,
  itemId: string,
  data: { text?: string; completed?: boolean; assignedPersonId?: string | null }
) => {
  logger.debug('checklistService.updateItem', { taskId, clId, itemId, data });
  const task = await getTaskDoc(taskId);
  const cl = (task.checklists as any).id(clId);
  if (!cl) throw Object.assign(new Error('Checklist not found'), { status: 404 });

  // Search top-level items first, then sub-items
  let item = cl.items.id(itemId);
  if (!item) {
    for (const topItem of cl.items) {
      item = topItem.children.id(itemId);
      if (item) break;
    }
  }
  if (!item) throw Object.assign(new Error('Item not found'), { status: 404 });

  if (data.text !== undefined) item.text = data.text;
  if (data.completed !== undefined) item.completed = data.completed;
  if ('assignedPersonId' in data) item.assignedPersonId = data.assignedPersonId || null;

  const pct = computeCompletionPct(task.checklists as unknown as IChecklist[]);
  if (pct !== null) task.completionPct = pct;
  await task.save();
  return task.checklists;
};

export const deleteItem = async (taskId: string, clId: string, itemId: string) => {
  logger.debug('checklistService.deleteItem', { taskId, clId, itemId });
  const task = await getTaskDoc(taskId);
  const cl = (task.checklists as any).id(clId);
  if (!cl) throw Object.assign(new Error('Checklist not found'), { status: 404 });

  const topItem = cl.items.id(itemId);
  if (topItem) {
    topItem.deleteOne();
  } else {
    let deleted = false;
    for (const parent of cl.items) {
      const sub = parent.children.id(itemId);
      if (sub) { sub.deleteOne(); deleted = true; break; }
    }
    if (!deleted) throw Object.assign(new Error('Item not found'), { status: 404 });
  }

  const pct = computeCompletionPct(task.checklists as unknown as IChecklist[]);
  if (pct !== null) task.completionPct = pct;
  await task.save();
  return task.checklists;
};

export const reorderItems = async (taskId: string, clId: string, orderedIds: string[]) => {
  logger.debug('checklistService.reorderItems', { taskId, clId, orderedIds });
  const task = await getTaskDoc(taskId);
  const cl = (task.checklists as any).id(clId);
  if (!cl) throw Object.assign(new Error('Checklist not found'), { status: 404 });

  const itemMap = new Map<string, any>(cl.items.map((item: any) => [String(item._id), item.toObject()]));
  cl.items = orderedIds.map(id => itemMap.get(id)).filter(Boolean);
  task.markModified('checklists');
  await task.save();
  return task.checklists;
};

export const reorderSubItems = async (taskId: string, clId: string, parentItemId: string, orderedIds: string[]) => {
  logger.debug('checklistService.reorderSubItems', { taskId, clId, parentItemId, orderedIds });
  const task = await getTaskDoc(taskId);
  const cl = (task.checklists as any).id(clId);
  if (!cl) throw Object.assign(new Error('Checklist not found'), { status: 404 });

  const parentItem = cl.items.id(parentItemId);
  if (!parentItem) throw Object.assign(new Error('Item not found'), { status: 404 });

  const subMap = new Map<string, any>(parentItem.children.map((sub: any) => [String(sub._id), sub.toObject()]));
  parentItem.children = orderedIds.map((id: string) => subMap.get(id)).filter(Boolean);
  task.markModified('checklists');
  await task.save();
  return task.checklists;
};
