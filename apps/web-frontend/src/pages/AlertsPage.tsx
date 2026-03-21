import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { listAlerts, resolveAlert, runDetection } from '../api/alertApi';
import Spinner from '../components/common/Spinner';
import ErrorBanner from '../components/common/ErrorBanner';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

interface Alert { _id: string; taskId: string; type: string; severity: 'high' | 'medium' | 'low'; message: string; createdAt: string; }
const SEVERITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

export default function AlertsPage(): React.ReactElement {
  const { addToast } = useToast();
  const { data: alerts, loading, error, refetch } = useFetch<Alert[]>(listAlerts);
  const [resolving, setResolving] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);

  const handleResolve = async (id: string) => {
    setResolving(id);
    try { await resolveAlert(id); addToast('Alert resolved', 'success'); refetch(); }
    catch (err: unknown) { addToast((err as Error).message, 'error'); }
    finally { setResolving(null); }
  };

  const handleRunDetection = async () => {
    setDetecting(true);
    try { await runDetection(); addToast('Detection complete — refreshing...', 'info'); setTimeout(refetch, 2000); }
    catch (err: unknown) { addToast((err as Error).message, 'error'); }
    finally { setDetecting(false); }
  };

  if (loading) return <Spinner />;

  const sorted = [...(alerts || [])].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Alerts</h1>
        <button className="btn btn-primary" onClick={handleRunDetection} disabled={detecting}>
          {detecting ? 'Running...' : 'Run Detection'}
        </button>
      </div>
      <ErrorBanner message={error} />
      {sorted.length === 0
        ? <EmptyState title="No active alerts" body="All tasks are on track." />

        : sorted.map((alert) => (
          <div key={alert._id} className={`alert-card alert-card--${alert.severity}`}>
            <div className="alert-card-header">
              <span className={`severity-badge severity-badge--${alert.severity}`}>{alert.severity}</span>
              <span className="alert-type">{alert.type.replace(/_/g, ' ')}</span>
              <span className="alert-date">{new Date(alert.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="alert-message">
              {alert.message.split(/(".*?")/).map((part, i) =>
                part.startsWith('"') && part.endsWith('"')
                  ? <Link key={i} to={`/tasks/${alert.taskId}`}>{part}</Link>
                  : part
              )}
            </p>
            <button className="btn btn-sm" onClick={() => handleResolve(alert._id)} disabled={resolving === alert._id}>
              {resolving === alert._id ? 'Resolving...' : 'Resolve'}
            </button>
          </div>
        ))
      }
    </div>
  );
}
