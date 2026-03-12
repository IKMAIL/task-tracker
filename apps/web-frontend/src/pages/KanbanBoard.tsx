import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { listTasks, updateTask } from '../api/taskApi';
import StatusBadge from '../components/common/StatusBadge';
import ProgressBar from '../components/common/ProgressBar';
import Spinner from '../components/common/Spinner';
import ErrorBanner from '../components/common/ErrorBanner';

interface Task {
  _id: string;
  title: string;
  category: string;
  status: string;
  completionPct: number;
  dueDate?: string;
  assignedTeamId?: string;
}

const COLUMNS = [
  { id: 'not_started', label: 'Not Started', color: '#6b7280' },
  { id: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { id: 'blocked',     label: 'Blocked',     color: '#ef4444' },
  { id: 'completed',   label: 'Completed',   color: '#22c55e' },
];

const CATEGORIES = [
  'Automation Testing Coverage',
  'DR Dry Run',
  'Active-Active Setup',
  'LEAP Framework Adherence',
  'Claude Code Adoption %',
  'Open Operational Items',
  'Security Risk Items',
];

type ColumnMap = Record<string, Task[]>;

function groupByStatus(tasks: Task[]): ColumnMap {
  const map: ColumnMap = {};
  for (const col of COLUMNS) map[col.id] = [];
  for (const task of tasks) {
    if (map[task.status]) map[task.status].push(task);
  }
  return map;
}

export default function KanbanBoard() {
  const [columns, setColumns] = useState<ColumnMap>(() => {
    const m: ColumnMap = {};
    for (const col of COLUMNS) m[col.id] = [];
    return m;
  });
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    listTasks({ limit: '500' })
      .then((res: any) => {
        const tasks: Task[] = res.tasks ?? res.data ?? res;
        const filtered = tasks.filter((t) => t.status !== 'cancelled');
        setAllTasks(filtered);
        setColumns(groupByStatus(filtered));
      })
      .catch(() => setError('Failed to load tasks'))
      .finally(() => setLoading(false));
  }, []);

  // Apply category filter client-side
  useEffect(() => {
    const visible = categoryFilter
      ? allTasks.filter((t) => t.category === categoryFilter)
      : allTasks;
    setColumns(groupByStatus(visible));
  }, [categoryFilter, allTasks]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const srcCol = Array.from(columns[source.droppableId]);
    const destCol = source.droppableId === destination.droppableId
      ? srcCol
      : Array.from(columns[destination.droppableId]);

    const [moved] = srcCol.splice(source.index, 1);
    const updatedTask = { ...moved, status: destination.droppableId };
    destCol.splice(destination.index, 0, updatedTask);

    const newColumns: ColumnMap = {
      ...columns,
      [source.droppableId]: srcCol,
      [destination.droppableId]: destCol,
    };
    setColumns(newColumns);

    if (source.droppableId !== destination.droppableId) {
      updateTask(draggableId, { status: destination.droppableId }).catch(() => {
        // Revert on failure
        setError('Failed to update task status — change reverted');
        setColumns(columns);
      });
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Kanban Board</h1>
          <p className="subtitle">Drag tasks between columns to update their status</p>
        </div>
        <Link to="/tasks" className="btn btn-primary">Table View</Link>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="filters">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {COLUMNS.map((col) => {
            const tasks = columns[col.id] ?? [];
            return (
              <div key={col.id} className="kanban-column">
                <div className="kanban-column-header" style={{ borderTopColor: col.color }}>
                  <span style={{ color: col.color }}>{col.label}</span>
                  <span className="kanban-column-count">{tasks.length}</span>
                </div>
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`kanban-column-body${snapshot.isDraggingOver ? ' kanban-column-body--dragging-over' : ''}`}
                    >
                      {tasks.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              className={`kanban-card${snap.isDragging ? ' kanban-card--dragging' : ''}`}
                            >
                              <div className="kanban-card-title">
                                <Link to={`/tasks/${task._id}`}>{task.title}</Link>
                              </div>
                              <div style={{ marginBottom: 8 }}>
                                <StatusBadge status={task.status} />
                              </div>
                              <ProgressBar value={task.completionPct} />
                              <div className="kanban-card-meta">
                                <span title="Category">{task.category}</span>
                                {task.dueDate && (
                                  <span title="Due date">
                                    Due {new Date(task.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {tasks.length === 0 && (
                        <div className="kanban-empty">No tasks</div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
