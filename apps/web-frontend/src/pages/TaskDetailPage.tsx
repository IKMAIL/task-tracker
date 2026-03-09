import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { getTask } from '../api/taskApi';
import { getHistory } from '../api/progressApi';
import Spinner from '../components/common/Spinner';
import ErrorBanner from '../components/common/ErrorBanner';
import StatusBadge from '../components/common/StatusBadge';
import ProgressBar from '../components/common/ProgressBar';

interface Task {
  _id: string; title: string; category: string; status: string; completionPct: number;
  description?: string; plannedStartDate?: string; dueDate?: string;
  nextUpdateDate?: string; lastUpdatedAt?: string;
}
interface ProgressUpdate {
  _id: string; status: string; completionPct: number; recordedAt: string; comment?: string;
}

export default function TaskDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const { data: task, loading: l1, error: e1 } = useFetch<Task>(() => getTask(id!), [id]);
  const { data: history, loading: l2, error: e2 } = useFetch<ProgressUpdate[]>(() => getHistory(id!), [id]);

  if (l1 || l2) return <Spinner />;
  if (!task) return <ErrorBanner message={e1 || 'Task not found'} />;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{task.title}</h1>
        <Link to={`/progress/update/${id}`} className="btn btn-primary">Log Progress Update</Link>
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
    </div>
  );
}
