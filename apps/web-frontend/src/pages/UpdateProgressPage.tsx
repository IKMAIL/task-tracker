import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { getTask } from '../api/taskApi';
import { logProgress } from '../api/progressApi';
import Spinner from '../components/common/Spinner';
import ErrorBanner from '../components/common/ErrorBanner';

const STATUSES = ['not_started', 'in_progress', 'blocked', 'completed', 'cancelled'];

export default function UpdateProgressPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const { data: task, loading } = useFetch(() => getTask(taskId), [taskId]);

  const [form, setForm] = useState({
    completionPct: '',
    status: '',
    comment: '',
    nextUpdateDate: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const taskData = task as any;
      await logProgress({
        taskId,
        teamId: taskData.assignedTeamId,
        completionPct: Number(form.completionPct),
        status: form.status,
        comment: form.comment,
        nextUpdateDate: form.nextUpdateDate || null,
      });
      navigate(`/tasks/${taskId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  const taskData = task as any;
  return (
    <div className="page">
      <div className="page-header">
        <h1>Log Progress Update</h1>
        <Link to={`/tasks/${taskId}`} className="btn btn-sm">← Back to Task</Link>
      </div>
      {taskData && <p className="subtitle">Task: <strong>{taskData.title}</strong></p>}

      <ErrorBanner message={error} />

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Status *</label>
          <select value={form.status} onChange={(e) => set('status', e.target.value)} required>
            <option value="">Select status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Completion % *</label>
          <input
            type="number" min="0" max="100"
            value={form.completionPct}
            onChange={(e) => set('completionPct', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Comment</label>
          <textarea
            rows={4}
            value={form.comment}
            onChange={(e) => set('comment', e.target.value)}
            placeholder="What was done? Any blockers?"
          />
        </div>

        <div className="form-group">
          <label>Next Update Date</label>
          <input
            type="date"
            value={form.nextUpdateDate}
            onChange={(e) => set('nextUpdateDate', e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : 'Submit Update'}
        </button>
      </form>
    </div>
  );
}
