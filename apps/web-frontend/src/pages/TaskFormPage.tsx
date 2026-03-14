import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createTask } from '../api/taskApi';
import { useFetch } from '../hooks/useFetch';
import { listTeams } from '../api/teamApi';
import ErrorBanner from '../components/common/ErrorBanner';

const CATEGORIES = [
  'Automation Testing Coverage', 'DR Dry Run', 'Active-Active Setup',
  'LEAP Framework Adherence', 'Claude Code Adoption %', 'Open Operational Items', 'Security Risk Items',
];

const RECURRENCE_FREQUENCIES = ['daily', 'weekly', 'monthly', 'quarterly'] as const;
type RecurrenceFrequency = typeof RECURRENCE_FREQUENCIES[number];

const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  daily: 'Day(s)',
  weekly: 'Week(s)',
  monthly: 'Month(s)',
  quarterly: 'Quarter(s)',
};

interface Team { _id: string; name: string; }
interface TaskForm {
  title: string; description: string; category: string;
  assignedTeamId: string; status: string;
  plannedStartDate: string; dueDate: string; nextUpdateDate: string;
}
interface RecurrenceForm {
  enabled: boolean;
  frequency: RecurrenceFrequency;
  interval: number;
  nextRunAt: string;
  endDate: string;
  maxOccurrences: string;
}

export default function TaskFormPage(): React.ReactElement {
  const navigate = useNavigate();
  const { data: teams } = useFetch<Team[]>(listTeams);
  const [form, setForm] = useState<TaskForm>({
    title: '', description: '', category: '',
    assignedTeamId: '', status: 'not_started',
    plannedStartDate: '', dueDate: '', nextUpdateDate: '',
  });
  const [recurrence, setRecurrence] = useState<RecurrenceForm>({
    enabled: false,
    frequency: 'weekly',
    interval: 1,
    nextRunAt: '',
    endDate: '',
    maxOccurrences: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof TaskForm, val: string) => setForm((f) => ({ ...f, [key]: val }));
  const setRec = <K extends keyof RecurrenceForm>(key: K, val: RecurrenceForm[K]) =>
    setRecurrence((r) => ({ ...r, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        ...form,
        nextUpdateDate: form.nextUpdateDate || undefined,
      };

      if (recurrence.enabled) {
        if (!recurrence.nextRunAt) {
          setError('First recurrence date is required when recurrence is enabled.');
          setSubmitting(false);
          return;
        }
        payload.recurrence = {
          enabled: true,
          frequency: recurrence.frequency,
          interval: recurrence.interval,
          nextRunAt: recurrence.nextRunAt,
          endDate: recurrence.endDate || null,
          maxOccurrences: recurrence.maxOccurrences ? parseInt(recurrence.maxOccurrences, 10) : null,
        };
      }

      const res = await createTask(payload);
      navigate(`/tasks/${res.data._id}`);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header"><h1>New Task</h1><Link to="/tasks" className="btn btn-sm">← Back</Link></div>
      <ErrorBanner message={error} />
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-group"><label>Title *</label><input value={form.title} onChange={(e) => set('title', e.target.value)} required /></div>
        <div className="form-group"><label>Description</label><textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} /></div>
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
          <div className="form-group"><label>Planned Start *</label><input type="date" value={form.plannedStartDate} onChange={(e) => set('plannedStartDate', e.target.value)} required /></div>
          <div className="form-group"><label>Due Date *</label><input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} required /></div>
          <div className="form-group"><label>Next Update Date</label><input type="date" value={form.nextUpdateDate} onChange={(e) => set('nextUpdateDate', e.target.value)} /></div>
        </div>

        {/* ── Recurrence Section ── */}
        <div className="form-card" style={{ marginTop: '16px', background: 'var(--bg-secondary, #f8f9fa)', border: '1px solid var(--border, #dee2e6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: recurrence.enabled ? '16px' : '0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={recurrence.enabled}
                onChange={(e) => setRec('enabled', e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              Repeat this task (Recurring)
            </label>
            {recurrence.enabled && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--accent-light, #e8f4fd)', padding: '2px 8px', borderRadius: '12px' }}>
                Template task — child tasks will auto-spawn on schedule
              </span>
            )}
          </div>

          {recurrence.enabled && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Frequency *</label>
                  <select value={recurrence.frequency} onChange={(e) => setRec('frequency', e.target.value as RecurrenceFrequency)}>
                    {RECURRENCE_FREQUENCIES.map((f) => (
                      <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Every</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={recurrence.interval}
                      onChange={(e) => setRec('interval', Math.max(1, parseInt(e.target.value, 10) || 1))}
                      style={{ width: '80px' }}
                    />
                    <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {FREQUENCY_LABELS[recurrence.frequency]}
                    </span>
                  </div>
                </div>
                <div className="form-group">
                  <label>First Recurrence Date *</label>
                  <input
                    type="date"
                    value={recurrence.nextRunAt}
                    onChange={(e) => setRec('nextRunAt', e.target.value)}
                    required={recurrence.enabled}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>End Date <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                  <input
                    type="date"
                    value={recurrence.endDate}
                    onChange={(e) => setRec('endDate', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Max Occurrences <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                  <input
                    type="number"
                    min={1}
                    value={recurrence.maxOccurrences}
                    onChange={(e) => setRec('maxOccurrences', e.target.value)}
                    placeholder="Unlimited"
                    style={{ width: '120px' }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: '16px' }}>
          {submitting ? 'Creating...' : 'Create Task'}
        </button>
      </form>
    </div>
  );
}
