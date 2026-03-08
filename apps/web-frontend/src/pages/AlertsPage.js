import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { listAlerts, resolveAlert, runDetection } from '../api/alertApi';
import Spinner from '../components/common/Spinner';
import ErrorBanner from '../components/common/ErrorBanner';

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 };

export default function AlertsPage() {
  const { data: alerts, loading, error, refetch } = useFetch(listAlerts);
  const [resolving, setResolving] = useState(null);
  const [detecting, setDetecting] = useState(false);

  const handleResolve = async (id) => {
    setResolving(id);
    try {
      await resolveAlert(id);
      refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setResolving(null);
    }
  };

  const handleRunDetection = async () => {
    setDetecting(true);
    try {
      await runDetection();
      setTimeout(refetch, 2000); // give detection a moment to write
    } catch (err) {
      alert(err.message);
    } finally {
      setDetecting(false);
    }
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
            <button
              className="btn btn-sm"
              onClick={() => handleResolve(alert._id)}
              disabled={resolving === alert._id}
            >
              {resolving === alert._id ? 'Resolving...' : 'Resolve'}
            </button>
          </div>
        ))
      }
    </div>
  );
}
