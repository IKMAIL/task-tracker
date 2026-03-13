import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { listTasks, searchTasks } from '../api/taskApi';
import { listTeams } from '../api/teamApi';
import Spinner from '../components/common/Spinner';
import ErrorBanner from '../components/common/ErrorBanner';
import StatusBadge from '../components/common/StatusBadge';
import ProgressBar from '../components/common/ProgressBar';

const STATUSES = ['not_started', 'in_progress', 'blocked', 'completed', 'cancelled'];
const CATEGORIES = [
  'Automation Testing Coverage', 'DR Dry Run', 'Active-Active Setup',
  'LEAP Framework Adherence', 'Claude Code Adoption %', 'Open Operational Items', 'Security Risk Items',
];

interface Task { _id: string; title: string; category: string; status: string; completionPct: number; dueDate?: string; }
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

  if (loading) return <Spinner />;

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
          {(tasks || []).map((task) => (
            <tr key={task._id}>
              <td><Link to={`/tasks/${task._id}`}>{task.title}</Link></td>
              <td>{task.category}</td>
              <td><StatusBadge status={task.status} /></td>
              <td style={{ width: '150px' }}><ProgressBar value={task.completionPct} /></td>
              <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td>
              <td><Link to={`/progress/update/${task._id}`} className="btn btn-sm">Update</Link></td>
            </tr>
          ))}
          {(tasks || []).length === 0 && (
            <tr><td colSpan={6} style={{ textAlign: 'center' }}>No tasks found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
