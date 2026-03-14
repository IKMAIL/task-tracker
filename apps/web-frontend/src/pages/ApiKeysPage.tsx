import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { listApiKeys, createApiKey, revokeApiKey, ALL_PERMISSIONS, ApiKeyInfo, ApiKeyPermission } from '../api/apiKeyApi';
import Spinner from '../components/common/Spinner';
import ErrorBanner from '../components/common/ErrorBanner';

const PERMISSION_LABELS: Record<ApiKeyPermission, string> = {
  'tasks:read':     'Tasks — Read',
  'tasks:write':    'Tasks — Write',
  'progress:read':  'Progress — Read',
  'progress:write': 'Progress — Write',
  'alerts:read':    'Alerts — Read',
  'alerts:write':   'Alerts — Write',
  'teams:read':     'Teams — Read',
  'teams:write':    'Teams — Write',
};

function PermissionBadge({ perm }: { perm: string }) {
  const isWrite = perm.endsWith(':write');
  return (
    <span style={{
      display: 'inline-block', fontSize: '0.7rem', padding: '2px 6px',
      borderRadius: 4, marginRight: 4, marginBottom: 2,
      background: isWrite ? '#fee2e2' : '#dbeafe',
      color: isWrite ? '#991b1b' : '#1e40af',
      fontWeight: 500,
    }}>
      {perm}
    </span>
  );
}

export default function ApiKeysPage(): React.ReactElement {
  const { data: keys, loading, error, refetch } = useFetch<ApiKeyInfo[]>(listApiKeys);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<Set<ApiKeyPermission>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const togglePerm = (p: ApiKeyPermission) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  };

  const resetForm = () => { setName(''); setExpiresAt(''); setSelectedPerms(new Set()); setFormError(''); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPerms.size === 0) { setFormError('Select at least one permission.'); return; }
    setFormError('');
    setSubmitting(true);
    try {
      const res = await createApiKey({ name, permissions: Array.from(selectedPerms), expiresAt: expiresAt || null });
      setNewKeyValue(res.data.key);
      resetForm();
      setShowForm(false);
      refetch();
    } catch (err: unknown) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (id: string, keyName: string) => {
    if (!window.confirm(`Revoke key "${keyName}"? It will stop working immediately.`)) return;
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
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <a
            href="/api/docs"
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm"
            style={{ textDecoration: 'none' }}
          >
            API Docs ↗
          </a>
          {!showForm && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + New API Key
            </button>
          )}
        </div>
      </div>

      <ErrorBanner message={error} />

      {newKeyValue && (
        <div className="form-card" style={{ background: '#fffbeb', border: '1px solid #f59e0b', marginBottom: '1.5rem' }}>
          <strong>Copy your API key now — it will not be shown again.</strong>
          <pre style={{ wordBreak: 'break-all', marginTop: '0.5rem', fontSize: '0.85rem', background: '#fef3c7', padding: '0.75rem', borderRadius: 4 }}>
            {newKeyValue}
          </pre>
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
              <label>Permissions * <span style={{ fontWeight: 400, color: '#666', fontSize: '0.85rem' }}>(select all that apply)</span></label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.4rem' }}>
                {ALL_PERMISSIONS.map((p) => (
                  <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                      type="checkbox"
                      checked={selectedPerms.has(p)}
                      onChange={() => togglePerm(p)}
                    />
                    {PERMISSION_LABELS[p]}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Expires At <span style={{ fontWeight: 400, color: '#666' }}>(optional)</span></label>
              <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Key'}
              </button>
              <button type="button" className="btn btn-sm" onClick={() => { setShowForm(false); resetForm(); }}>
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
            <th>Prefix</th>
            <th>Permissions</th>
            <th>Status</th>
            <th>Last Used</th>
            <th>Expires</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(keys || []).length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted, #666)' }}>
                No API keys yet. Create one to authenticate external integrations.
              </td>
            </tr>
          ) : (keys || []).map((k) => (
            <tr key={k.id} style={{ opacity: k.isActive ? 1 : 0.5 }}>
              <td>{k.name}</td>
              <td><code style={{ fontSize: '0.85rem' }}>{k.prefix}...</code></td>
              <td style={{ maxWidth: 220 }}>
                {k.permissions.map((p) => <PermissionBadge key={p} perm={p} />)}
              </td>
              <td>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                  background: k.isActive ? '#dcfce7' : '#f3f4f6',
                  color: k.isActive ? '#166534' : '#6b7280',
                }}>
                  {k.isActive ? 'Active' : 'Revoked'}
                </span>
              </td>
              <td style={{ fontSize: '0.85rem', color: '#666' }}>
                {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : 'Never'}
              </td>
              <td style={{ fontSize: '0.85rem' }}>
                {k.expiresAt ? new Date(k.expiresAt).toLocaleDateString() : 'Never'}
              </td>
              <td style={{ fontSize: '0.85rem' }}>{new Date(k.createdAt).toLocaleDateString()}</td>
              <td>
                {k.isActive && (
                  <button
                    className="btn btn-sm"
                    style={{ color: '#dc2626' }}
                    disabled={revoking === k.id}
                    onClick={() => handleRevoke(k.id, k.name)}
                  >
                    {revoking === k.id ? 'Revoking...' : 'Revoke'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
