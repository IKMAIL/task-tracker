import { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationCenter from './NotificationCenter';

export default function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="notif-bell"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <span className="notif-bell__icon" aria-hidden>🔔</span>
        {unreadCount > 0 && (
          <span className="notif-bell__badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>
      {open && <NotificationCenter onClose={() => setOpen(false)} />}
    </>
  );
}
