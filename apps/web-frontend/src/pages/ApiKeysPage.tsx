import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { listApiKeys, createApiKey, revokeApiKey, ApiKeyInfo } from '../api/apiKeyApi';
import Spinner from '../components/common/Spinner';
import ErrorBanner from '../components/common/ErrorBanner';

export default function ApiKeysPage(): React.ReactElement {
  const { data: keys, loading, error, refetch } = useFetch<ApiKeyInfo[]>(listApiKeys);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const res = await createApiKey({ name, expiresAt: expiresAt || null });
      setNewKeyValue(res.data.key);
      setName('');
      setExpiresAt('');
      setShowForm(false);
      refetch();
    } catch (err: unknown) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (id: string, keyName: string) => {
    if (!window.confirm(`Revoke key "${keyName}"? This cannot be undone.`)) return;
    setRevoking(id);
    try { await revokeApiKey(id); refetch(); }
    catch (err: unknown) { alert((err as Error).message); }
    finally { setRevoking(null); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="page">
      <div className="page-header">
        <h1>API Keys</h1>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + New API Key
          </button>
        )}
      </div>

      <ErrorBanner message={error} />

      {newKeyValue && (
        <div className="form-card" style={{ background: '#fffbeb', border: '1px solid #f59e0b', marginBottom: '1.5rem' }}>
          <strong>Copy your API key now — it will not be shown again.</strong>
          <pre style={{ wordBreak: 'break-all', marginTop: '0.5rem', fontSize: '0.85rem' }}>{newKeyValue}</pre>
          <button className="btn btn-sm" onClick={() => setNewKeyValue(null)} style={{ marginTop: '0.5rem' }}>
            I have copied it
          </button>
        </div>
      )}

      {showForm && (
        <div className="form-card" style={{ marginBottom: '1.5rem' }}>
          <h2>New API Key</h2>
          <ErrorBanner message={formError} />
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                placeholder="e.g. CI pipeline, Grafana dashboard"
              />
            </div>
            <div className="form-group">
              <label>Expires At (optional)</label>
              <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Key'}
              </button>
              <button type="button" className="btn btn-sm" onClick={() => { setShowForm(false); setFormError(''); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Key Prefix</th>
            <th>Expires</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(keys || []).length === 0 ? (
            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted, #666)' }}>
              No API keys yet. Create one to authenticate external integrations.
            </td></tr>
          ) : (keys || []).map((k) => (
            <tr key={k.id}>
              <td>{k.name}</td>
              <td><code>{k.prefix}...</code></td>
              <td>{k.expiresAt ? new Date(k.expiresAt).toLocaleDateString() : 'Never'}</td>
              <td>{new Date(k.createdAt).toLocaleDateString()}</td>
              <td>
                <button
                  className="btn btn-sm"
                  style={{ color: '#dc2626' }}
                  disabled={revoking === k.id}
                  onClick={() => handleRevoke(k.id, k.name)}
                >
                  {revoking === k.id ? 'Revoking...' : 'Revoke'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
