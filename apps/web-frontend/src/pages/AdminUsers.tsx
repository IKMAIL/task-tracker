import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { listUsers, updateUser, AdminUser } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import ErrorBanner from '../components/common/ErrorBanner';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

type StatusFilter = 'all' | 'active' | 'inactive';

export default function AdminUsers(): React.ReactElement {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const { data: users, loading, error, refetch } = useFetch<AdminUser[]>(listUsers);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      const matchesSearch =
        !search.trim() ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && u.isActive !== false) ||
        (statusFilter === 'inactive' && u.isActive === false);
      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

  const activeCount = useMemo(
    () => (users || []).filter((u) => u.isActive !== false).length,
    [users],
  );

  const handleRoleChange = async (u: AdminUser, newRole: 'admin' | 'member') => {
    if (!(await confirm(`Change ${u.name}'s role from "${u.role}" to "${newRole}"?`, 'Change Role')))
      return;
    setActionError(null);
    try {
      await updateUser(u._id, { role: newRole });
      addToast(`${u.name}'s role updated to ${newRole}`, 'success');
      refetch();
    } catch (err: unknown) {
      setActionError((err as Error).message);
    }
  };

  const handleToggleActive = async (u: AdminUser) => {
    const nextState = u.isActive === false ? true : false;
    const action = nextState ? 'reactivate' : 'deactivate';
    if (!(await confirm(`Are you sure you want to ${action} ${u.name}?`, 'Confirm Action'))) return;
    setActionError(null);
    try {
      await updateUser(u._id, { isActive: nextState });
      addToast(`${u.name} ${action}d`, 'success');
      refetch();
    } catch (err: unknown) {
      setActionError((err as Error).message);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="page">
      <div className="page-header">
        <h1>User Management</h1>
        {users && (
          <span style={{ color: 'var(--text-secondary, #888)', fontSize: '0.9rem' }}>
            {users.length} user{users.length !== 1 ? 's' : ''} &mdash; {activeCount} active
          </span>
        )}
      </div>

      <ErrorBanner message={error} />
      <ErrorBanner message={actionError} />

      {/* Search + status filter toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '220px' }}
        />
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {(['all', 'active', 'inactive'] as StatusFilter[]).map((f) => (
            <button
              key={f}
              className={`btn btn-sm${statusFilter === f ? ' btn-primary' : ''}`}
              onClick={() => setStatusFilter(f)}
              style={{ textTransform: 'capitalize' }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Auth</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((u) => {
            const isSelf = u._id === currentUser?._id;
            const isActive = u.isActive !== false;
            return (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td style={{ color: 'var(--text-secondary, #555)', fontSize: '0.875rem' }}>{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u, e.target.value as 'admin' | 'member')}
                    className="form-control"
                    style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                  >
                    <option value="member">member</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: isActive ? '#27ae6020' : '#e74c3c20',
                      color: isActive ? '#27ae60' : '#e74c3c',
                    }}
                  >
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #888)' }}>
                  {u.authProvider}
                </td>
                <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #888)' }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-sm"
                      onClick={() => handleToggleActive(u)}
                      disabled={isSelf}
                      title={isSelf ? 'Cannot deactivate yourself' : undefined}
                      style={!isSelf ? { color: isActive ? 'var(--danger)' : 'var(--success, #27ae60)' } : {}}
                    >
                      {isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                    <Link
                      to={`/audit?resourceType=user&resourceId=${u._id}`}
                      className="btn btn-sm"
                      style={{ textDecoration: 'none' }}
                    >
                      Audit Log
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary, #888)' }}>
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
