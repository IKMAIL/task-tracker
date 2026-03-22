import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// ─── Avatar colour palette (6 choices, index by charCode % 6) ────────────────
const AVATAR_COLORS = ['#e05c5c', '#e0955c', '#c8b84a', '#4db86e', '#5c9fe0', '#9b5ce0'];

function getAvatarColor(name?: string): string {
  if (!name) return AVATAR_COLORS[0];
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

// ─── Inline SVG icons (16×16, stroke-based) ──────────────────────────────────
const IconDashboard = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const IconTeams = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="7" r="3" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M2 20c0-3.314 3.134-6 7-6s7 2.686 7 6" />
    <path d="M17 14c2.21 0 4 1.567 4 3.5" />
  </svg>
);

const IconManageTeams = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
    <path d="M12 2v2m0 16v2M2 12h2m16 0h2" />
  </svg>
);

const IconTasks = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6h11M9 12h11M9 18h11" />
    <polyline points="4 6 5.5 7.5 8 5" />
    <polyline points="4 12 5.5 13.5 8 11" />
    <polyline points="4 18 5.5 19.5 8 17" />
  </svg>
);

const IconKanban = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="5" height="18" rx="1" />
    <rect x="10" y="3" width="5" height="12" rx="1" />
    <rect x="17" y="3" width="4" height="15" rx="1" />
  </svg>
);

const IconAlerts = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const IconImport = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

const IconApiKeys = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="4.5" />
    <path d="M21 2l-9.6 9.6" />
    <path d="M15.5 7.5l3 3L21 8l-3-3" />
  </svg>
);

const IconAuditLog = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="13" y2="17" />
  </svg>
);

const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

// Brand logo mark — geometric checkmark-in-square
const IconBrand = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <polyline points="8 12 11 15 16 9" />
  </svg>
);

const IconSun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const IconMoon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// ─── Nav item with icon and active indicator ──────────────────────────────────
interface NavItemProps {
  to: string;
  end?: boolean;
  icon: React.ReactNode;
  label: string;
  cls: ({ isActive }: { isActive: boolean }) => string | undefined;
}

function NavItem({ to, end, icon, label, cls }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={cls}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: '4px 8px',
        borderRadius: '6px',
        transition: 'background 0.15s ease, color 0.15s ease',
        background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
        boxShadow: isActive ? 'inset 0 -2px 0 rgba(255,255,255,0.7)' : 'none',
      })}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };
  const cls = ({ isActive }: { isActive: boolean }) => isActive ? 'active' : undefined;

  return (
    <header className="header">
      {/* Brand */}
      <div className="header-brand">
        <NavLink
          to="/"
          end
          className={cls}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}
        >
          <IconBrand />
          <span style={{ letterSpacing: '0.04em', fontWeight: 700 }}>Task Tracker</span>
        </NavLink>
      </div>

      {/* Primary nav */}
      <nav className="header-nav" style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1 }}>
        <NavItem to="/" end icon={<IconDashboard />} label="Dashboard" cls={cls} />
        <NavItem to="/teams" icon={<IconTeams />} label="Teams" cls={cls} />
        <NavItem to="/teams/manage" icon={<IconManageTeams />} label="Manage Teams" cls={cls} />
        <NavItem to="/tasks" icon={<IconTasks />} label="Tasks" cls={cls} />
        <NavItem to="/kanban" icon={<IconKanban />} label="Kanban" cls={cls} />
        <NavItem to="/alerts" icon={<IconAlerts />} label="Alerts" cls={cls} />
        <NavItem to="/import" icon={<IconImport />} label="Import" cls={cls} />

        {/* Admin group */}
        {user?.role === 'admin' && (
          <>
            <span
              aria-hidden="true"
              style={{
                display: 'inline-block',
                width: '1px',
                height: '20px',
                background: 'rgba(255,255,255,0.25)',
                margin: '0 6px',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: '0.6rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)',
                fontWeight: 600,
                alignSelf: 'center',
                marginRight: '2px',
                userSelect: 'none',
              }}
            >
              Admin
            </span>
            <NavItem to="/settings/api-keys" icon={<IconApiKeys />} label="API Keys" cls={cls} />
            <NavItem to="/audit" icon={<IconAuditLog />} label="Audit Log" cls={cls} />
            <NavItem to="/admin/users" icon={<IconUsers />} label="Users" cls={cls} />
          </>
        )}
      </nav>

      {/* User area */}
      <div className="header-user">
        {/* Avatar */}
        <div
          aria-hidden="true"
          title={user?.name}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: getAvatarColor(user?.name),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '0.03em',
            flexShrink: 0,
            boxShadow: '0 0 0 2px rgba(255,255,255,0.2)',
          }}
        >
          {getInitials(user?.name)}
        </div>

        <span style={{ fontSize: '0.82rem', opacity: 0.9 }}>{user?.name}</span>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn-theme"
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            cursor: 'pointer',
            color: 'inherit',
            transition: 'background 0.15s ease',
            padding: 0,
          }}
        >
          {theme === 'light' ? <IconMoon /> : <IconSun />}
        </button>

        <button onClick={handleLogout} className="btn btn-sm">Logout</button>
      </div>
    </header>
  );
}
