import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getAuditLogs, getAuditLogsByActor, AuditLog, AuditMeta } from '../api/auditApi';
import Spinner from '../components/common/Spinner';
import ErrorBanner from '../components/common/ErrorBanner';

const RESOURCE_TYPES = ['task', 'task_update', 'team', 'member', 'user', 'alert'];

const ACTION_COLORS: Record<string, string> = {
  create: '#27ae60',
  update: '#2980b9',
  delete: '#e74c3c',
};

export default function AuditLogPage(): React.ReactElement {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const [mode, setMode] = useState<'resource' | 'actor'>('resource');
  const [resourceType, setResourceType] = useState(params.get('resourceType') || 'task');
  const [resourceId, setResourceId] = useState(params.get('resourceId') || '');
  const [actorId, setActorId] = useState('');
  const [since, setSince] = useState('');
  const [page, setPage] = useState(1);

  const [logs, setLogs] = useState<AuditLog[] | null>(null);
  const [meta, setMeta] = useState<AuditMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = mode === 'resource'
        ? await getAuditLogs(resourceType, resourceId.trim(), p)
        : await getAuditLogsByActor(actorId.trim(), since || undefined, p);
      setLogs(res.data);
      setMeta(res.meta);
      setPage(p);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const canSearch = mode === 'resource' ? !!resourceId.trim() : !!actorId.trim();

  useEffect(() => {
    const initialResourceId = params.get('resourceId') || '';
    if (initialResourceId) {
      search(1);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search(1);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Audit Log</h1>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          className={`btn btn-sm${mode === 'resource' ? ' btn-primary' : ''}`}
          onClick={() => { setMode('resource'); setLogs(null); }}
        >
          By Resource
        </button>
        <button
          className={`btn btn-sm${mode === 'actor' ? ' btn-primary' : ''}`}
          onClick={() => { setMode('actor'); setLogs(null); }}
        >
          By Actor
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {mode === 'resource' ? (
          <>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              className="form-control"
              style={{ width: 'auto' }}
            >
              {RESOURCE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              type="text"
              className="form-control"
              placeholder="Resource ID"
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              style={{ flex: 1, minWidth: '220px' }}
            />
          </>
        ) : (
          <>
            <input
              type="text"
              className="form-control"
              placeholder="User ID (actorId)"
              value={actorId}
              onChange={(e) => setActorId(e.target.value)}
              style={{ flex: 1, minWidth: '220px' }}
            />
            <input
              type="date"
              className="form-control"
              value={since}
              onChange={(e) => setSince(e.target.value)}
              style={{ width: 'auto' }}
              title="Since date (optional)"
            />
          </>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading || !canSearch}>
          {loading ? 'Loading...' : 'Search'}
        </button>
      </form>

      <ErrorBanner message={error} />

      {loading && <Spinner />}

      {!loading && logs !== null && (
        <>
          {logs.length === 0 ? (
            <p>No audit records found.</p>
          ) : (
            <>
              <p style={{ color: '#666', marginBottom: '1rem' }}>
                {meta!.total} record{meta!.total !== 1 ? 's' : ''} — page {meta!.page} of {meta!.pages}
              </p>
              {logs.map((log) => (
                <div key={log._id} className="detail-card" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{
                      background: ACTION_COLORS[log.action] || '#888',
                      color: '#fff',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}>
                      {log.action}
                    </span>
                    <span style={{ color: '#555', fontSize: '0.875rem' }}>
                      {log.userEmail || log.userId}
                    </span>
                    <span style={{ marginLeft: 'auto', color: '#888', fontSize: '0.8rem' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {(log.changes.before || log.changes.after) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {log.changes.before !== null && (
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#888', marginBottom: '0.25rem' }}>BEFORE</div>
                          <pre style={{ margin: 0, fontSize: '0.75rem', background: '#f8f8f8', padding: '0.5rem', borderRadius: '4px', overflow: 'auto', maxHeight: '200px' }}>
                            {JSON.stringify(log.changes.before, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.changes.after !== null && (
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#888', marginBottom: '0.25rem' }}>AFTER</div>
                          <pre style={{ margin: 0, fontSize: '0.75rem', background: '#f8f8f8', padding: '0.5rem', borderRadius: '4px', overflow: 'auto', maxHeight: '200px' }}>
                            {JSON.stringify(log.changes.after, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {meta!.pages > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
                  <button
                    className="btn btn-sm"
                    disabled={page === 1}
                    onClick={() => search(page - 1)}
                  >
                    Previous
                  </button>
                  <span style={{ lineHeight: '2rem' }}>{page} / {meta!.pages}</span>
                  <button
                    className="btn btn-sm"
                    disabled={page === meta!.pages}
                    onClick={() => search(page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
