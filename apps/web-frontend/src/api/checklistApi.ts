import { apiFetch } from './client';

const base = (taskId: string) => `/tasks/${taskId}/checklists`;
const clBase = (taskId: string, clId: string) => `${base(taskId)}/${clId}`;
const itemBase = (taskId: string, clId: string, itemId: string) => `${clBase(taskId, clId)}/items/${itemId}`;

export const createChecklist = (taskId: string, title: string) =>
  apiFetch(base(taskId), { method: 'POST', body: JSON.stringify({ title }) });

export const renameChecklist = (taskId: string, clId: string, title: string) =>
  apiFetch(clBase(taskId, clId), { method: 'PATCH', body: JSON.stringify({ title }) });

export const deleteChecklist = (taskId: string, clId: string) =>
  apiFetch(clBase(taskId, clId), { method: 'DELETE' });

export const addItem = (taskId: string, clId: string, data: { text: string; assignedPersonId?: string | null; parentItemId?: string }) =>
  apiFetch(`${clBase(taskId, clId)}/items`, { method: 'POST', body: JSON.stringify(data) });

export const updateItem = (taskId: string, clId: string, itemId: string, data: { text?: string; completed?: boolean; assignedPersonId?: string | null }) =>
  apiFetch(itemBase(taskId, clId, itemId), { method: 'PATCH', body: JSON.stringify(data) });

export const deleteItem = (taskId: string, clId: string, itemId: string) =>
  apiFetch(itemBase(taskId, clId, itemId), { method: 'DELETE' });

export const reorderItems = (taskId: string, clId: string, orderedIds: string[]) =>
  apiFetch(`${clBase(taskId, clId)}/reorder`, { method: 'PUT', body: JSON.stringify({ orderedIds }) });

export const reorderSubItems = (taskId: string, clId: string, parentItemId: string, orderedIds: string[]) =>
  apiFetch(`${itemBase(taskId, clId, parentItemId)}/reorder`, { method: 'PUT', body: JSON.stringify({ orderedIds }) });
