import { useEffect, useRef } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Notification } from '../../api/notificationApi';

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#6b7280',
};

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface Props {
  onClose: () => void;
}

export default function NotificationCenter({ onClose }: Props) {
  const { notifications, isLoading, markAsRead, markAllRead, dismiss, fetchMore } = useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleNotifClick = (n: Notification) => {
    if (!n.isRead) markAsRead([n._id]);
  };

  return (
    <div className="notif-center" ref={panelRef} role="dialog" aria-label="Notifications">
      <div className="notif-center__header">
        <span className="notif-center__title">Notifications</span>
        <button className="notif-center__mark-all" onClick={markAllRead}>Mark all read</button>
        <button className="notif-center__close" onClick={onClose} aria-label="Close">✕</button>
      </div>

      <div className="notif-center__list">
        {isLoading && <div className="notif-center__loading">Loading…</div>}

        {!isLoading && notifications.length === 0 && (
          <div className="notif-center__empty">All caught up!</div>
        )}

        {notifications.map((n) => (
          <div
            key={n._id}
            className={`notif-item${n.isRead ? ' notif-item--read' : ''}`}
            onClick={() => handleNotifClick(n)}
          >
            <span
              className="notif-item__dot"
              style={{ background: SEVERITY_COLOR[n.severity] || '#6b7280' }}
            />
            <div className="notif-item__content">
              <div className="notif-item__title">{n.title}</div>
              <div className="notif-item__body">{n.body}</div>
              <div className="notif-item__meta">{relativeTime(n.createdAt)}</div>
            </div>
            <button
              className="notif-item__dismiss"
              aria-label="Dismiss"
              onClick={(e) => { e.stopPropagation(); dismiss(n._id); }}
            >
              ✕
            </button>
          </div>
        ))}

        {notifications.length > 0 && notifications.length % 25 === 0 && (
          <button
            className="notif-center__load-more"
            onClick={() => fetchMore(Math.ceil(notifications.length / 25) + 1)}
          >
            Load more
          </button>
        )}
      </div>
    </div>
  );
}
