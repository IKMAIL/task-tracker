import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { getTask, getComments, addComment, getDependencies, listTasks, updateTask } from '../api/taskApi';
import { getHistory } from '../api/progressApi';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import ErrorBanner from '../components/common/ErrorBanner';
import StatusBadge from '../components/common/StatusBadge';
import ProgressBar from '../components/common/ProgressBar';

interface DependencyTask {
  _id: string; title: string; status: string;
}
interface Task {
  _id: string; title: string; category: string; status: string; completionPct: number;
  description?: string; plannedStartDate?: string; dueDate?: string;
  nextUpdateDate?: string; lastUpdatedAt?: string; blockedBy?: string[];
}
interface ProgressUpdate {
  _id: string; status: string; completionPct: number; recordedAt: string; comment?: string;
}
interface Comment {
  _id: string; authorEmail: string; body: string; createdAt: string;
}

export default function TaskDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: task, loading: l1, error: e1 } = useFetch<Task>(() => getTask(id!), [id]);
  const { data: history, loading: l2, error: e2 } = useFetch<ProgressUpdate[]>(() => getHistory(id!), [id]);
  const { data: comments, loading: l3, error: e3, refetch: refetchComments } = useFetch<Comment[]>(() => getComments(id!), [id]);
  const { data: deps, loading: l4, refetch: refetchDeps } = useFetch<{ blockedBy: DependencyTask[]; blocking: DependencyTask[] }>(() => getDependencies(id!), [id]);
  const { data: allTasksData } = useFetch<DependencyTask[]>(listTasks, []);

  const [commentBody, setCommentBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [newBlockerId, setNewBlockerId] = useState('');
  const [depSubmitting, setDepSubmitting] = useState(false);
  const [depError, setDepError] = useState<string | null>(null);

  if (l1 || l2 || l3 || l4) return <Spinner />;
  if (!task) return <ErrorBanner message={e1 || 'Task not found'} />;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{task.title}</h1>
        <Link to={`/progress/update/${id}`} className="btn btn-primary">Log Progress Update</Link>
        {user?.role === 'admin' && (
          <Link to={`/audit?resourceType=task&resourceId=${id}`} className="btn btn-sm">Audit History</Link>
        )}
      </div>
      <ErrorBanner message={e1 || e2} />
      <div className="detail-grid">
        <div className="detail-card">
          <h3>Details</h3>
          <dl className="detail-list">
            <dt>Category</dt>    <dd>{task.category}</dd>
            <dt>Status</dt>      <dd><StatusBadge status={task.status} /></dd>
            <dt>Progress</dt>    <dd><ProgressBar value={task.completionPct} /></dd>
            <dt>Planned Start</dt> <dd>{task.plannedStartDate ? new Date(task.plannedStartDate).toLocaleDateString() : '—'}</dd>
            <dt>Due Date</dt>    <dd>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</dd>
            <dt>Next Update</dt> <dd>{task.nextUpdateDate ? new Date(task.nextUpdateDate).toLocaleDateString() : '—'}</dd>
            <dt>Last Updated</dt><dd>{task.lastUpdatedAt ? new Date(task.lastUpdatedAt).toLocaleDateString() : '—'}</dd>
          </dl>
        </div>
        {task.description && (
          <div className="detail-card"><h3>Description</h3><p>{task.description}</p></div>
        )}
      </div>
      <section>
        <h2>Progress History</h2>
        {(history || []).length === 0
          ? <p>No progress updates yet.</p>
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
        <h2>Dependencies</h2>
        <ErrorBanner message={depError} />
        <div className="detail-grid">
          <div className="detail-card">
            <h3>Blocked By</h3>
            {(deps?.blockedBy || []).length === 0
              ? <p>This task has no blockers.</p>
              : (deps?.blockedBy || []).map((t) => (
                  <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Link to={`/tasks/${t._id}`}>{t.title}</Link>
                    <StatusBadge status={t.status} />
                    <button
                      className="btn btn-sm"
                      onClick={async () => {
                        setDepSubmitting(true);
                        setDepError(null);
                        try {
                          const updated = (task?.blockedBy || []).filter((bid) => bid !== t._id);
                          await updateTask(id!, { blockedBy: updated });
                          refetchDeps();
                        } catch (err: any) {
                          setDepError(err.message);
                        } finally {
                          setDepSubmitting(false);
                        }
                      }}
                      disabled={depSubmitting}
                    >
                      Remove
                    </button>
                  </div>
                ))
            }
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newBlockerId) return;
                setDepSubmitting(true);
                setDepError(null);
                try {
                  const current = task?.blockedBy || [];
                  await updateTask(id!, { blockedBy: [...current, newBlockerId] });
                  setNewBlockerId('');
                  refetchDeps();
                } catch (err: any) {
                  setDepError(err.message);
                } finally {
                  setDepSubmitting(false);
                }
              }}
              style={{ display: 'flex', gap: '8px', marginTop: '12px' }}
            >
              <select
                value={newBlockerId}
                onChange={(e) => setNewBlockerId(e.target.value)}
                disabled={depSubmitting}
                style={{ flex: 1 }}
              >
                <option value="">Select a task to add as blocker...</option>
                {(allTasksData || [])
                  .filter((t: DependencyTask) =>
                    t._id !== id &&
                    !(deps?.blockedBy || []).some((b) => b._id === t._id)
                  )
                  .map((t: DependencyTask) => (
                    <option key={t._id} value={t._id}>{t.title}</option>
                  ))
                }
              </select>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={depSubmitting || !newBlockerId}
              >
                Add Blocker
              </button>
            </form>
          </div>
          <div className="detail-card">
            <h3>Blocking</h3>
            {(deps?.blocking || []).length === 0
              ? <p>This task is not blocking any other tasks.</p>
              : (deps?.blocking || []).map((t) => (
                  <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Link to={`/tasks/${t._id}`}>{t.title}</Link>
                    <StatusBadge status={t.status} />
                  </div>
                ))
            }
          </div>
        </div>
      </section>
      <section>
        <h2>Comments</h2>
        <ErrorBanner message={e3 || submitError} />
        {(comments || []).length === 0
          ? <p>No comments yet.</p>
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
              e.preventDefault();
              if (!commentBody.trim()) return;
              setSubmitting(true);
              setSubmitError(null);
              try {
                await addComment(id!, commentBody.trim());
                setCommentBody('');
                refetchComments();
              } catch (err: any) {
                setSubmitError(err.message);
              } finally {
                setSubmitting(false);
              }
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Add a comment..."
              maxLength={2000}
              rows={3}
              disabled={submitting}
              style={{
                width: '100%',
                resize: 'vertical',
                padding: '8px 10px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: '0.875rem',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {commentBody.length}/2000
              </span>
              <button type="submit" className="btn btn-primary" disabled={submitting || !commentBody.trim()}>
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
