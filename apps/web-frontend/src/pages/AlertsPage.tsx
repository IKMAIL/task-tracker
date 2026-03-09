import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { listAlerts, resolveAlert, runDetection } from '../api/alertApi';
import Spinner from '../components/common/Spinner';
import ErrorBanner from '../components/common/ErrorBanner';

interface Alert { _id: string; type: string; severity: 'high' | 'medium' | 'low'; message: string; createdAt: string; }
const SEVERITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

export default function AlertsPage(): React.ReactElement {
  const { data: alerts, loading, error, refetch } = useFetch<Alert[]>(listAlerts);
  const [resolving, setResolving] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);

  const handleResolve = async (id: string) => {
    setResolving(id);
    try { await resolveAlert(id); refetch(); }
    catch (err: unknown) { alert((err as Error).message); }
    finally { setResolving(null); }
  };

  const handleRunDetection = async () => {
    setDetecting(true);
    try { await runDetection(); setTimeout(refetch, 2000); }
    catch (err: unknown) { alert((err as Error).message); }
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
        ? <p>No active alerts.</p>
        : sorted.map((alert) => (
          <div key={alert._id} className={`alert-card alert-card--${alert.severity}`}>
            <div className="alert-card-header">
              <span className={`severity-badge severity-badge--${alert.severity}`}>{alert.severity}</span>
              <span className="alert-type">{alert.type.replace(/_/g, ' ')}</span>
              <span className="alert-date">{new Date(alert.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="alert-message">{alert.message}</p>
            <button className="btn btn-sm" onClick={() => handleResolve(alert._id)} disabled={resolving === alert._id}>
              {resolving === alert._id ? 'Resolving...' : 'Resolve'}
            </button>
          </div>
        ))
      }
    </div>
  );
}
