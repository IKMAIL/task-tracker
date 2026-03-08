import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createTask } from '../api/taskApi';
import { useFetch } from '../hooks/useFetch';
import { listTeams } from '../api/teamApi';
import { useAuth } from '../context/AuthContext';
import ErrorBanner from '../components/common/ErrorBanner';

const CATEGORIES = [
  'Automation Testing Coverage', 'DR Dry Run', 'Active-Active Setup',
  'LEAP Framework Adherence', 'Claude Code Adoption %', 'Open Operational Items', 'Security Risk Items',
];

export default function TaskFormPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: teams } = useFetch(listTeams);

  const [form, setForm] = useState({
    title: '', description: '', category: '',
    assignedTeamId: '', status: 'not_started',
    plannedStartDate: '', dueDate: '', nextUpdateDate: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await createTask({
        ...form,
        nextUpdateDate: form.nextUpdateDate || undefined,
      });
      navigate(`/tasks/${res.data._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>New Task</h1>
        <Link to="/tasks" className="btn btn-sm">← Back</Link>
      </div>

      <ErrorBanner message={error} />

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title *</label>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category *</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)} required>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Assigned Team *</label>
            <select value={form.assignedTeamId} onChange={(e) => set('assignedTeamId', e.target.value)} required>
              <option value="">Select team</option>
              {(teams || []).map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Planned Start *</label>
            <input type="date" value={form.plannedStartDate} onChange={(e) => set('plannedStartDate', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Due Date *</label>
            <input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Next Update Date</label>
            <input type="date" value={form.nextUpdateDate} onChange={(e) => set('nextUpdateDate', e.target.value)} />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Task'}
        </button>
      </form>
    </div>
  );
}
