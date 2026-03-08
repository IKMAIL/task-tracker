import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { listTasks } from '../api/taskApi';
import { listTeams } from '../api/teamApi';
import Spinner from '../components/common/Spinner';
import ErrorBanner from '../components/common/ErrorBanner';
import StatusBadge from '../components/common/StatusBadge';
import ProgressBar from '../components/common/ProgressBar';

const STATUSES    = ['not_started', 'in_progress', 'blocked', 'completed', 'cancelled'];
const CATEGORIES  = [
  'Automation Testing Coverage', 'DR Dry Run', 'Active-Active Setup',
  'LEAP Framework Adherence', 'Claude Code Adoption %', 'Open Operational Items', 'Security Risk Items',
];

export default function TaskListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ status: '', category: '', teamId: '' });

  const { data: tasks, loading, error } = useFetch(
    () => listTasks(Object.fromEntries(Object.entries(filters).filter(([, v]) => v))),
    [filters.status, filters.category, filters.teamId]
  );
  const { data: teams } = useFetch(listTeams);

  if (loading) return <Spinner />;

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }));

  return (
    <div className="page">
      <div className="page-header">
        <h1>Tasks</h1>
        <button className="btn btn-primary" onClick={() => navigate('/tasks/new')}>+ New Task</button>
      </div>

      <div className="filters">
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
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Progress</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(tasks || []).map((task) => (
            <tr key={task._id}>
              <td><Link to={`/tasks/${task._id}`}>{task.title}</Link></td>
              <td>{task.category}</td>
              <td><StatusBadge status={task.status} /></td>
              <td style={{ width: '150px' }}><ProgressBar value={task.completionPct} /></td>
              <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td>
              <td>
                <Link to={`/progress/update/${task._id}`} className="btn btn-sm">Update</Link>
              </td>
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
