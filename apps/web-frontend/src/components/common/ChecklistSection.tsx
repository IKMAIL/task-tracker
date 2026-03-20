import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Checklist, ChecklistItem } from '../../api/taskApi';
import * as checklistApi from '../../api/checklistApi';

interface Member { _id: string; name: string; }

interface Props {
  taskId: string;
  checklists: Checklist[];
  members: Member[];
  onUpdate: () => void;
}

function countProgress(items: ChecklistItem[]): { done: number; total: number } {
  let done = 0, total = 0;
  for (const item of items) {
    total++; if (item.completed) done++;
    for (const sub of item.children) { total++; if (sub.completed) done++; }
  }
  return { done, total };
}

interface ItemRowProps {
  taskId: string;
  clId: string;
  item: ChecklistItem;
  members: Member[];
  isSubItem?: boolean;
  dragHandleProps?: any;
  onUpdate: () => void;
}

function ItemRow({ taskId, clId, item, members, isSubItem = false, dragHandleProps, onUpdate }: ItemRowProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [addingSub, setAddingSub] = useState(false);
  const [subText, setSubText] = useState('');

  const toggle = async () => {
    await checklistApi.updateItem(taskId, clId, item._id, { completed: !item.completed });
    onUpdate();
  };

  const saveEdit = async () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== item.text) {
      await checklistApi.updateItem(taskId, clId, item._id, { text: trimmed });
      onUpdate();
    }
    setEditing(false);
  };

  const handleDelete = async () => {
    await checklistApi.deleteItem(taskId, clId, item._id);
    onUpdate();
  };

  const handleAssignee = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value || null;
    await checklistApi.updateItem(taskId, clId, item._id, { assignedPersonId: val });
    onUpdate();
  };

  const handleAddSub = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = subText.trim();
    if (!trimmed) return;
    await checklistApi.addItem(taskId, clId, { text: trimmed, parentItemId: item._id });
    setSubText('');
    setAddingSub(false);
    onUpdate();
  };

  const assigneeName = item.assignedPersonId
    ? (members.find(m => m._id === item.assignedPersonId)?.name ?? '?')
    : null;

  return (
    <div style={{ marginLeft: isSubItem ? '24px' : '0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0' }}>
        {/* Drag handle (only for top-level items) */}
        {!isSubItem && dragHandleProps && (
          <span {...dragHandleProps} style={{ cursor: 'grab', color: '#aaa', fontSize: '14px', userSelect: 'none' }} title="Drag to reorder">⠿</span>
        )}

        {/* Checkbox */}
        <input type="checkbox" checked={item.completed} onChange={toggle}
          style={{ width: '16px', height: '16px', flexShrink: 0 }} />

        {/* Text (inline edit) */}
        {editing ? (
          <input
            autoFocus
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') { setEditText(item.text); setEditing(false); } }}
            style={{ flex: 1, padding: '2px 4px', fontSize: '0.9rem', border: '1px solid #0d6efd', borderRadius: '3px' }}
          />
        ) : (
          <span
            onClick={() => setEditing(true)}
            style={{ flex: 1, cursor: 'text', textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? '#999' : 'inherit', fontSize: '0.9rem' }}
          >{item.text}</span>
        )}

        {/* Assignee */}
        {members.length > 0 && (
          <select
            value={item.assignedPersonId ?? ''}
            onChange={handleAssignee}
            title="Assign to"
            style={{ fontSize: '0.75rem', padding: '1px 4px', border: '1px solid #ddd', borderRadius: '3px', maxWidth: '100px' }}
          >
            <option value="">— assign</option>
            {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>
        )}
        {assigneeName && members.length === 0 && (
          <span style={{ fontSize: '0.75rem', color: '#666' }}>{assigneeName}</span>
        )}

        {/* Add sub-item button (top-level items only) */}
        {!isSubItem && (
          <button
            onClick={() => setAddingSub(v => !v)}
            title="Add sub-item"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#888', padding: '0 2px' }}
          >+sub</button>
        )}

        {/* Delete */}
        <button
          onClick={handleDelete}
          title="Delete item"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#aaa', padding: '0 2px' }}
        >✕</button>
      </div>

      {/* Sub-items */}
      {item.children.length > 0 && (
        <div>
          {item.children.map(sub => (
            <ItemRow key={sub._id} taskId={taskId} clId={clId} item={sub} members={members} isSubItem onUpdate={onUpdate} />
          ))}
        </div>
      )}

      {/* Add sub-item form */}
      {addingSub && (
        <form onSubmit={handleAddSub} style={{ marginLeft: '24px', display: 'flex', gap: '6px', marginTop: '4px' }}>
          <input
            autoFocus
            value={subText}
            onChange={e => setSubText(e.target.value)}
            placeholder="Sub-item text…"
            style={{ flex: 1, padding: '3px 6px', fontSize: '0.85rem', border: '1px solid #ccc', borderRadius: '3px' }}
          />
          <button type="submit" className="btn btn-sm btn-primary" style={{ fontSize: '0.8rem', padding: '2px 8px' }}>Add</button>
          <button type="button" onClick={() => setAddingSub(false)} className="btn btn-sm" style={{ fontSize: '0.8rem', padding: '2px 8px' }}>Cancel</button>
        </form>
      )}
    </div>
  );
}

interface ChecklistCardProps {
  taskId: string;
  checklist: Checklist;
  members: Member[];
  onUpdate: () => void;
}

function ChecklistCard({ taskId, checklist, members, onUpdate }: ChecklistCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(checklist.title);
  const { done, total } = countProgress(checklist.items);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newItemText.trim();
    if (!trimmed) return;
    await checklistApi.addItem(taskId, checklist._id, { text: trimmed });
    setNewItemText('');
    setAddingItem(false);
    onUpdate();
  };

  const handleDeleteChecklist = async () => {
    if (!window.confirm(`Delete checklist "${checklist.title}"?`)) return;
    await checklistApi.deleteChecklist(taskId, checklist._id);
    onUpdate();
  };

  const saveTitle = async () => {
    const trimmed = titleText.trim();
    if (trimmed && trimmed !== checklist.title) {
      await checklistApi.renameChecklist(taskId, checklist._id, trimmed);
      onUpdate();
    }
    setEditingTitle(false);
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const ids = checklist.items.map(i => i._id);
    const [moved] = ids.splice(result.source.index, 1);
    ids.splice(result.destination.index, 0, moved);
    await checklistApi.reorderItems(taskId, checklist._id, ids);
    onUpdate();
  };

  const pctLabel = total > 0 ? `${done}/${total}` : '0 items';
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="detail-card" style={{ marginBottom: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <button onClick={() => setCollapsed(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#666' }}>
          {collapsed ? '▶' : '▼'}
        </button>

        {editingTitle ? (
          <input
            autoFocus value={titleText}
            onChange={e => setTitleText(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitleText(checklist.title); setEditingTitle(false); } }}
            style={{ flex: 1, fontWeight: 600, fontSize: '0.95rem', padding: '2px 4px', border: '1px solid #0d6efd', borderRadius: '3px' }}
          />
        ) : (
          <span onClick={() => setEditingTitle(true)} style={{ flex: 1, fontWeight: 600, cursor: 'text', fontSize: '0.95rem' }}>{checklist.title}</span>
        )}

        <span style={{ fontSize: '0.75rem', color: pct === 100 ? '#28a745' : '#666', fontVariantNumeric: 'tabular-nums' }}>{pctLabel}</span>
        <button onClick={handleDeleteChecklist} title="Delete checklist"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: '14px' }}>✕</button>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div style={{ height: '4px', background: '#e9ecef', borderRadius: '2px', marginBottom: '8px' }}>
          <div style={{ height: '4px', width: `${pct}%`, background: pct === 100 ? '#28a745' : '#0d6efd', borderRadius: '2px', transition: 'width 0.2s' }} />
        </div>
      )}

      {/* Items */}
      {!collapsed && (
        <>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={checklist._id}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {checklist.items.map((item, index) => (
                    <Draggable key={item._id} draggableId={item._id} index={index}>
                      {(prov) => (
                        <div ref={prov.innerRef} {...prov.draggableProps}>
                          <ItemRow
                            taskId={taskId}
                            clId={checklist._id}
                            item={item}
                            members={members}
                            dragHandleProps={prov.dragHandleProps}
                            onUpdate={onUpdate}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Add item */}
          {addingItem ? (
            <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              <input
                autoFocus
                value={newItemText}
                onChange={e => setNewItemText(e.target.value)}
                placeholder="New item…"
                style={{ flex: 1, padding: '4px 8px', fontSize: '0.875rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <button type="submit" className="btn btn-sm btn-primary">Add</button>
              <button type="button" onClick={() => setAddingItem(false)} className="btn btn-sm">Cancel</button>
            </form>
          ) : (
            <button onClick={() => setAddingItem(true)}
              style={{ marginTop: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#0d6efd', fontSize: '0.85rem', padding: '2px 0' }}>
              + Add item
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default function ChecklistSection({ taskId, checklists, members, onUpdate }: Props) {
  const [addingChecklist, setAddingChecklist] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleCreateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    await checklistApi.createChecklist(taskId, trimmed);
    setNewTitle('');
    setAddingChecklist(false);
    onUpdate();
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h3 style={{ margin: 0 }}>Checklists</h3>
        {!addingChecklist && (
          <button onClick={() => setAddingChecklist(true)} className="btn btn-sm">+ Add Checklist</button>
        )}
      </div>

      {checklists.map(cl => (
        <ChecklistCard key={cl._id} taskId={taskId} checklist={cl} members={members} onUpdate={onUpdate} />
      ))}

      {addingChecklist && (
        <form onSubmit={handleCreateChecklist} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <input
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Checklist name…"
            style={{ flex: 1, padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <button type="submit" className="btn btn-primary btn-sm">Create</button>
          <button type="button" onClick={() => setAddingChecklist(false)} className="btn btn-sm">Cancel</button>
        </form>
      )}
    </div>
  );
}
