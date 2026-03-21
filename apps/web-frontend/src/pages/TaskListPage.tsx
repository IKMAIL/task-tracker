import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { listTasks, searchTasks } from '../api/taskApi';
import { listTeams } from '../api/teamApi';
import Spinner from '../components/common/Spinner';
import ErrorBanner from '../components/common/ErrorBanner';
import StatusBadge from '../components/common/StatusBadge';
import ProgressBar from '../components/common/ProgressBar';
import EmptyState from '../components/common/EmptyState';

const STATUSES = ['not_started', 'in_progress', 'blocked', 'completed', 'cancelled'];
const CATEGORIES = [
  'Automation Testing Coverage', 'DR Dry Run', 'Active-Active Setup',
  'LEAP Framework Adherence', 'Claude Code Adoption %', 'Open Operational Items', 'Security Risk Items',
];

interface Task {
  _id: string; title: string; category: string; status: string;
  completionPct: number; dueDate?: string;
  recurrence?: { enabled: boolean };
  parentTaskId?: string | null;
}
interface Team { _id: string; name: string; }
interface Filters { status: string; category: string; teamId: string; }

export default function TaskListPage(): React.ReactElement {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>({ status: '', category: '', teamId: '' });
  const [query, setQuery] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data: tasks, loading, error } = useFetch<Task[]>(
    () => debouncedQ.length >= 2
      ? searchTasks(debouncedQ)
      : listTasks(Object.fromEntries(Object.entries(filters).filter(([, v]) => v))),
    [debouncedQ, filters.status, filters.category, filters.teamId]
  );
  const { data: teams } = useFetch<Team[]>(listTeams);

  const setFilter = (key: keyof Filters, val: string) => setFilters((f) => ({ ...f, [key]: val }));

  return (
    <div className="page">
      <div className="page-header">
        <h1>Tasks</h1>
        <button className="btn btn-primary" onClick={() => navigate('/tasks/new')}>+ New Task</button>
      </div>
      <div className="filters">
        <input
          type="text"
          placeholder="Search by title or description..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: '1 1 200px', minWidth: '200px' }}
        />
        <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={filters.category} onChange={(e) => setFilter('category', e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.teamId} onChange={(e) => setFilter('teamId', e.target.value)}>
          <option value="">All teams</option>
          {(teams || []).map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
      </div>
      <ErrorBanner message={error} />
      <table className="data-table">
        <thead>
          <tr><th>Title</th><th>Category</th><th>Status</th><th>Progress</th><th>Due Date</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} style={{ textAlign: 'center' }}><Spinner /></td></tr>
          ) : (tasks || []).length === 0 ? (
            <tr><td colSpan={6}><EmptyState title="No tasks found" body="Try adjusting your filters or create a new task." action={{ label: '+ New Task', onClick: () => navigate('/tasks/new') }} /></td></tr>
          ) : (
            (tasks || []).map((task) => (
              <tr key={task._id}>
                <td>
                  <Link to={`/tasks/${task._id}`}>{task.title}</Link>
                  {task.recurrence?.enabled && !task.parentTaskId && (
                    <span
                      title="Recurring template — auto-spawns child tasks on schedule"
                      style={{
                        marginLeft: '8px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: '#0d6efd',
                        background: '#e8f4fd',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        verticalAlign: 'middle',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ↻ Recurring
                    </span>
                  )}
                  {task.parentTaskId && (
                    <span
                      title="Spawned from a recurring template"
                      style={{
                        marginLeft: '8px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: '#6c757d',
                        background: '#f0f0f0',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        verticalAlign: 'middle',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ↳ Recurrence
                    </span>
                  )}
                </td>
                <td>{task.category}</td>
                <td><StatusBadge status={task.status} /></td>
                <td style={{ width: '150px' }}><ProgressBar value={task.completionPct} /></td>
                <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td>
                <td><Link to={`/progress/update/${task._id}`} className="btn btn-sm">Update</Link></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
