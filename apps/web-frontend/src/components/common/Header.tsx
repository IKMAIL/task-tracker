import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../notifications/NotificationBell';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };
  const cls = ({ isActive }: { isActive: boolean }) => isActive ? 'active' : undefined;
  return (
    <header className="header">
      <div className="header-brand"><NavLink to="/" end className={cls}>Task Tracker</NavLink></div>
      <nav className="header-nav">
        <NavLink to="/" end className={cls}>Dashboard</NavLink>
        <NavLink to="/teams" className={cls}>Teams</NavLink>
        <NavLink to="/teams/manage" className={cls}>Manage Teams</NavLink>
        <NavLink to="/tasks" className={cls}>Tasks</NavLink>
        <NavLink to="/kanban" className={cls}>Kanban</NavLink>
        <NavLink to="/alerts" className={cls}>Alerts</NavLink>
        <NavLink to="/import" className={cls}>Import</NavLink>
        {user?.role === 'admin' && <NavLink to="/settings/api-keys" className={cls}>API Keys</NavLink>}
        {user?.role === 'admin' && <NavLink to="/audit" className={cls}>Audit Log</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin/users" className={cls}>Users</NavLink>}
      </nav>
      <div className="header-user">
        <NotificationBell />
        <span>{user?.name}</span>
        <button onClick={toggleTheme} className="btn-theme" aria-label="Toggle theme">
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
        <button onClick={handleLogout} className="btn btn-sm">Logout</button>
      </div>
    </header>
  );
}
