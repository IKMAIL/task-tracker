import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { getTask, getComments, addComment, getDependencies, listTasks, updateTask } from '../api/taskApi';
import { getHistory } from '../api/progressApi';
import { getAuditLogs, AuditLog as AuditLogEntry } from '../api/auditApi';
import { getTeam } from '../api/teamApi';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import ErrorBanner from '../components/common/ErrorBanner';
import StatusBadge from '../components/common/StatusBadge';
import ProgressBar from '../components/common/ProgressBar';
import CommentInput from '../components/common/CommentInput';
import ChecklistSection from '../components/common/ChecklistSection';
import Breadcrumb from '../components/common/Breadcrumb';
import { Checklist } from '../api/taskApi';

interface DependencyTask {
  _id: string; title: string; status: string;
}
interface Recurrence {
  enabled: boolean;
  frequency: string;
  interval: number;
  nextRunAt: string;
  lastRunAt?: string | null;
  endDate?: string | null;
  maxOccurrences?: number | null;
  occurrenceCount: number;
}

interface Task {
  _id: string; title: string; category: string; status: string; completionPct: number;
  description?: string; plannedStartDate?: string; dueDate?: string;
  nextUpdateDate?: string; lastUpdatedAt?: string; blockedBy?: string[]; assignedTeamId?: string;
  assignedPersonId?: string | null;
  recurrence?: Recurrence | null;
  parentTaskId?: string | null;
  checklists?: Checklist[];
}
interface ProgressUpdate {
  _id: string; status: string; completionPct: number; recordedAt: string; comment?: string;
}
interface Comment {
  _id: string; authorEmail: string; body: string; createdAt: string;
}

type Tab = 'overview' | 'activity' | 'checklist' | 'history';

export default function TaskDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: task, loading: l1, error: e1, refetch: refetchTask } = useFetch<Task>(() => getTask(id!), [id]);
  const { data: history, loading: l2, error: e2 } = useFetch<ProgressUpdate[]>(() => getHistory(id!), [id]);
  const { data: comments, loading: l3, error: e3, refetch: refetchComments } = useFetch<Comment[]>(() => getComments(id!), [id]);
  const { data: deps, loading: l4, refetch: refetchDeps } = useFetch<{ blockedBy: DependencyTask[]; blocking: DependencyTask[] }>(() => getDependencies(id!), [id]);
  const { data: auditData } = useFetch<AuditLogEntry[]>(() => getAuditLogs('task', id!, 1, 20).then(r => r.data), [id]);
  const { data: allTasksData } = useFetch<DependencyTask[]>(listTasks, []);
  const { data: teamData } = useFetch<{ memberIds: { _id: string; name: string; loginId: string }[] }>(
    () => task?.assignedTeamId ? getTeam(task.assignedTeamId) : Promise.resolve(null),
    [task?.assignedTeamId]
  );
  const members = teamData?.memberIds || [];

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [commentBody, setCommentBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [newBlockerId, setNewBlockerId] = useState('');
  const [depSubmitting, setDepSubmitting] = useState(false);
  const [depError, setDepError] = useState<string | null>(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignPersonId, setAssignPersonId] = useState('');
  const [assignReason, setAssignReason] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  if (l1 || l2 || l3 || l4) return <Spinner />;
  if (!task) return <ErrorBanner message={e1 || 'Task not found'} />;

  const tabBtn = (tab: Tab, label: string) => (
    <button
      className={activeTab === tab ? 'active' : ''}
      onClick={() => setActiveTab(tab)}
    >
      {label}
    </button>
  );

  return (
    <div className="page">
      <Breadcrumb crumbs={[{ label: 'Tasks', to: '/tasks' }, { label: task.title }]} />

      <div className="page-header">
        <h1>{task.title}</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to={`/tasks/${id}/edit`} className="btn btn-sm">Edit Task</Link>
          <Link to={`/progress/update/${id}`} className="btn btn-primary">Log Progress</Link>
          <Link to={`/audit?resourceType=task&resourceId=${id}`} className="btn btn-sm">Audit</Link>
        </div>
      </div>

      <ErrorBanner message={e1 || e2} />

      <div className="task-detail-layout">
        {/* ── Sidebar ── */}
        <aside className="detail-card task-detail-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '6px' }}>Status</div>
            <StatusBadge status={task.status} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '6px' }}>Progress</div>
            <ProgressBar value={task.completionPct} />
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
            <dl className="detail-list">
              <dt>Category</dt>    <dd>{task.category}</dd>
              <dt>Start</dt>      <dd>{task.plannedStartDate ? new Date(task.plannedStartDate).toLocaleDateString() : '—'}</dd>
              <dt>Due</dt>        <dd>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</dd>
              <dt>Next Update</dt><dd>{task.nextUpdateDate ? new Date(task.nextUpdateDate).toLocaleDateString() : '—'}</dd>
              <dt>Updated</dt>    <dd>{task.lastUpdatedAt ? new Date(task.lastUpdatedAt).toLocaleDateString() : '—'}</dd>
            </dl>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '6px' }}>Assignee</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>
                {task.assignedPersonId
                  ? (members.find((m) => m._id === task.assignedPersonId)?.name ?? task.assignedPersonId)
                  : '—'}
              </span>
              {members.length > 0 && (
                <button className="btn btn-sm" onClick={() => { setAssignPersonId(task.assignedPersonId ?? ''); setAssignReason(''); setAssignError(null); setShowAssignForm(true); }}>
                  {task.assignedPersonId ? 'Reassign' : 'Assign'}
                </button>
              )}
            </div>
            {showAssignForm && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (task.assignedPersonId && !assignReason.trim()) { setAssignError('Reason is required when reassigning.'); return; }
                  setAssignSubmitting(true); setAssignError(null);
                  try {
                    await updateTask(id!, { assignedPersonId: assignPersonId || null, ...(task.assignedPersonId ? { reason: assignReason.trim() } : {}) });
                    setShowAssignForm(false); refetchTask();
                  } catch (err: any) { setAssignError(err.message); }
                  finally { setAssignSubmitting(false); }
                }}
                style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}
              >
                {assignError && <ErrorBanner message={assignError} />}
                <select value={assignPersonId} onChange={(e) => setAssignPersonId(e.target.value)} disabled={assignSubmitting}>
                  <option value="">Unassigned</option>
                  {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
                {task.assignedPersonId && (
                  <textarea placeholder="Reason for reassignment *" value={assignReason} onChange={(e) => setAssignReason(e.target.value)} rows={2} disabled={assignSubmitting} required />
                )}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="submit" className="btn btn-primary" disabled={assignSubmitting}>{assignSubmitting ? 'Saving...' : 'Save'}</button>
                  <button type="button" className="btn btn-sm" onClick={() => setShowAssignForm(false)} disabled={assignSubmitting}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </aside>

        {/* ── Main content ── */}
        <div>
          <div className="tab-bar">
            {tabBtn('overview', 'Overview')}
            {tabBtn('activity', 'Activity')}
            {tabBtn('checklist', 'Checklist')}
            {tabBtn('history', 'History')}
          </div>

          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {task.recurrence?.enabled && !task.parentTaskId && (
                <div className="detail-card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                  <h3 style={{ marginTop: 0 }}>↻ Recurring Template</h3>
                  <dl className="detail-list">
                    <dt>Frequency</dt><dd style={{ textTransform: 'capitalize' }}>Every {task.recurrence.interval} {task.recurrence.frequency}</dd>
                    <dt>Next Spawn</dt><dd>{new Date(task.recurrence.nextRunAt).toLocaleDateString()}</dd>
                    <dt>Last Spawned</dt><dd>{task.recurrence.lastRunAt ? new Date(task.recurrence.lastRunAt).toLocaleDateString() : '—'}</dd>
                    <dt>Occurrences</dt><dd>{task.recurrence.occurrenceCount}{task.recurrence.maxOccurrences ? ` / ${task.recurrence.maxOccurrences}` : ' (unlimited)'}</dd>
                    {task.recurrence.endDate && (<><dt>Ends On</dt><dd>{new Date(task.recurrence.endDate).toLocaleDateString()}</dd></>)}
                  </dl>
                </div>
              )}
              {task.parentTaskId && (
                <div className="detail-card" style={{ fontSize: '0.875rem' }}>
                  ↳ Spawned from recurring template: <Link to={`/tasks/${task.parentTaskId}`}>View template</Link>
                </div>
              )}
              {task.description && (
                <div className="detail-card"><h3>Description</h3><p>{task.description}</p></div>
              )}
              <div className="detail-card">
                <h3>Dependencies</h3>
                <ErrorBanner message={depError} />
                <div className="detail-grid">
                  <div>
                    <h3>Blocked By</h3>
                    {(deps?.blockedBy || []).length === 0
                      ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No blockers.</p>
                      : (deps?.blockedBy || []).map((t) => (
                          <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <Link to={`/tasks/${t._id}`}>{t.title}</Link>
                            <StatusBadge status={t.status} />
                            <button className="btn btn-sm" disabled={depSubmitting}
                              onClick={async () => {
                                setDepSubmitting(true); setDepError(null);
                                try { await updateTask(id!, { blockedBy: (task?.blockedBy || []).filter((bid) => bid !== t._id) }); refetchDeps(); }
                                catch (err: any) { setDepError(err.message); }
                                finally { setDepSubmitting(false); }
                              }}
                            >Remove</button>
                          </div>
                        ))
                    }
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault(); if (!newBlockerId) return;
                        setDepSubmitting(true); setDepError(null);
                        try { await updateTask(id!, { blockedBy: [...(task?.blockedBy || []), newBlockerId] }); setNewBlockerId(''); refetchDeps(); }
                        catch (err: any) { setDepError(err.message); }
                        finally { setDepSubmitting(false); }
                      }}
                      style={{ display: 'flex', gap: '8px', marginTop: '12px' }}
                    >
                      <select value={newBlockerId} onChange={(e) => setNewBlockerId(e.target.value)} disabled={depSubmitting} style={{ flex: 1 }}>
                        <option value="">Select a blocker...</option>
                        {(allTasksData || []).filter((t: DependencyTask) => t._id !== id && !(deps?.blockedBy || []).some((b) => b._id === t._id)).map((t: DependencyTask) => (
                          <option key={t._id} value={t._id}>{t.title}</option>
                        ))}
                      </select>
                      <button type="submit" className="btn btn-primary" disabled={depSubmitting || !newBlockerId}>Add Blocker</button>
                    </form>
                  </div>
                  <div>
                    <h3>Blocking</h3>
                    {(deps?.blocking || []).length === 0
                      ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Not blocking anything.</p>
                      : (deps?.blocking || []).map((t) => (
                          <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <Link to={`/tasks/${t._id}`}>{t.title}</Link>
                            <StatusBadge status={t.status} />
                          </div>
                        ))
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <section>
                <h2>Progress History</h2>
                {(history || []).length === 0
                  ? <p style={{ color: 'var(--text-muted)' }}>No progress updates yet.</p>
                  : (history || []).map((update) => (
                      <div key={update._id} className="timeline-item">
                        <div className="timeline-header">
                          <StatusBadge status={update.status} />
                          <span className="timeline-pct">{update.completionPct}%</span>
                          <span className="timeline-date">{new Date(update.recordedAt).toLocaleString()}</span>
                        </div>
                        {update.comment && <p className="timeline-comment">{update.comment}</p>}
                      </div>
                    ))
                }
              </section>
              <section>
                <h2>Comments</h2>
                <ErrorBanner message={e3 || submitError} />
                {(comments || []).length === 0
                  ? <p style={{ color: 'var(--text-muted)' }}>No comments yet.</p>
                  : (comments || []).map((c) => (
                      <div key={c._id} className="timeline-item">
                        <div className="timeline-header">
                          <span className="timeline-author">{c.authorEmail}</span>
                          <span className="timeline-date">{new Date(c.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="timeline-comment">{c.body}</p>
                      </div>
                    ))
                }
                <div className="timeline-item">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault(); if (!commentBody.trim()) return;
                      setSubmitting(true); setSubmitError(null);
                      try { await addComment(id!, commentBody.trim()); setCommentBody(''); refetchComments(); }
                      catch (err: any) { setSubmitError(err.message); }
                      finally { setSubmitting(false); }
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                  >
                    <CommentInput value={commentBody} onChange={setCommentBody} members={members} disabled={submitting} maxLength={2000} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{commentBody.length}/2000</span>
                      <button type="submit" className="btn btn-primary" disabled={submitting || !commentBody.trim()}>
                        {submitting ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'checklist' && (
            <ChecklistSection
              taskId={id!}
              checklists={task.checklists ?? []}
              members={members.map(m => ({ _id: m._id, name: m.name }))}
              onUpdate={refetchTask}
            />
          )}

          {activeTab === 'history' && (
            <section>
              <h2>Change History</h2>
              {(auditData || []).length === 0
                ? <p style={{ color: 'var(--text-muted)' }}>No change records yet.</p>
                : (auditData || []).map((entry: AuditLogEntry) => (
                    <div key={entry._id} className="timeline-item">
                      <div className="timeline-header">
                        <span style={{
                          background: entry.action === 'create' ? 'var(--color-success)' : entry.action === 'delete' ? 'var(--color-danger)' : 'var(--color-primary)',
                          color: '#fff', borderRadius: '4px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' as const,
                        }}>
                          {entry.action}
                        </span>
                        <span className="timeline-author">{entry.userEmail || entry.userId || 'system'}</span>
                        <span className="timeline-date">{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                      {entry.reason && <p className="timeline-comment" style={{ fontStyle: 'italic' }}>Reason: {entry.reason}</p>}
                    </div>
                  ))
              }
              {(auditData?.length ?? 0) >= 20 && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Showing first 20 records. <a href={`/audit?resourceType=task&resourceId=${id}`}>View all</a>
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
