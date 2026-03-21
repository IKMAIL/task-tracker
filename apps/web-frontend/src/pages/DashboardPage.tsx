import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { getSummary } from '../api/taskApi';
import { listAlerts } from '../api/alertApi';
import { listTeams } from '../api/teamApi';
import Spinner from '../components/common/Spinner';
import ErrorBanner from '../components/common/ErrorBanner';
import ProgressBar from '../components/common/ProgressBar';
import EmptyState from '../components/common/EmptyState';

interface SummaryItem { _id: { status: string; category: string }; count: number; }
interface Alert { _id: string; type: string; severity: string; message: string; isActive: boolean; createdAt: string; }
interface Team { _id: string; name: string; memberIds?: string[]; }

export default function DashboardPage(): React.ReactElement {
  const navigate = useNavigate();
  const { data: summary, loading: l1, error: e1 } = useFetch<SummaryItem[]>(getSummary);
  const { data: alerts,  loading: l2, error: e2 } = useFetch<Alert[]>(listAlerts);
  const { data: teams,   loading: l3, error: e3 } = useFetch<Team[]>(listTeams);

  if (l1 || l2 || l3) return <Spinner />;

  const statusCounts: Record<string, number> = {};
  (summary || []).forEach(({ _id, count }) => {
    statusCounts[_id.status] = (statusCounts[_id.status] || 0) + count;
  });
  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const completed = statusCounts.completed || 0;
  const overallPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const activeAlerts = (alerts || []).filter((a) => a.isActive);

  return (
    <div className="page">
      <h1>Dashboard</h1>
      {(e1 || e2 || e3) && <ErrorBanner message={e1 || e2 || e3} />}

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{total}</div><div className="stat-label">Total Tasks</div></div>
        <div className="stat-card"><div className="stat-value">{completed}</div><div className="stat-label">Completed</div></div>
        <div className="stat-card"><div className="stat-value">{statusCounts.in_progress || 0}</div><div className="stat-label">In Progress</div></div>
        <div className="stat-card stat-card--alert">
          <div className="stat-value">{activeAlerts.length}</div>
          <div className="stat-label">Active Alerts</div>
          {activeAlerts.length > 0 && <Link to="/alerts" className="stat-link">View →</Link>}
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-grid-left">
          <section>
            <h2>Overall Completion</h2>
            <ProgressBar value={overallPct} />
          </section>
          <section>
            <h2>Teams</h2>
            <div className="teams-grid">
              {(teams || []).map((team) => (
                <div key={team._id} className="team-card">
                  <h3>{team.name}</h3>
                  <p>{team.memberIds?.length || 0} members</p>
                  <Link to={`/teams?teamId=${team._id}`} className="btn btn-sm">View Tasks</Link>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="dashboard-grid-right">
          <section>
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              <button className="quick-action-btn" onClick={() => navigate('/tasks/new')}>＋ New Task</button>
              <button className="quick-action-btn" onClick={() => navigate('/kanban')}>⊞ Kanban View</button>
              <button className="quick-action-btn" onClick={() => navigate('/alerts')}>⚑ Alerts</button>
              <button className="quick-action-btn" onClick={() => navigate('/import')}>↑ Import</button>
            </div>
          </section>
          <section>
            <h2>Recent Alerts</h2>
            {activeAlerts.length === 0
              ? <EmptyState title="No active alerts" body="All tasks are on track." />
              : activeAlerts.slice(0, 5).map((alert) => (
                <div key={alert._id} className={`alert-item alert-item--${alert.severity}`}>
                  <strong>{alert.type.replace(/_/g, ' ')}</strong> — {alert.message}
                </div>
              ))
            }
            {activeAlerts.length > 5 && <Link to="/alerts">View all {activeAlerts.length} alerts →</Link>}
          </section>
        </div>
      </div>
    </div>
  );
}
