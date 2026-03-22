import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { Notification, listNotifications, markRead, dismissNotification } from '../api/notificationApi';
import { useAuth } from './AuthContext';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:3000';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  fetchMore: (page: number) => Promise<void>;
  markAsRead: (ids: string[]) => Promise<void>;
  markAllRead: () => Promise<void>;
  dismiss: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const lastSeenAtRef = useRef<string | null>(localStorage.getItem('notification_last_seen_at'));

  // Connect socket when user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!user || !token) return;

    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Catch up on missed notifications; use stored timestamp or current time as lower bound
      const sinceAt = lastSeenAtRef.current || new Date(Date.now() - 60 * 1000).toISOString();
      socket.emit('catch_up', { lastSeenAt: sinceAt });
    });

    socket.on('disconnect', () => setIsConnected(false));

    socket.on('notification:new', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((c) => c + 1);
      lastSeenAtRef.current = notification.createdAt;
      localStorage.setItem('notification_last_seen_at', notification.createdAt);
    });

    socket.on('notification:batch', (batch: Notification[]) => {
      setNotifications((prev) => {
        const ids = new Set(prev.map((n) => n._id));
        const newOnes = batch.filter((n) => !ids.has(n._id));
        return [...newOnes, ...prev];
      });
      const newUnread = batch.filter((n) => !n.isRead).length;
      setUnreadCount((c) => c + newUnread);
      if (batch.length > 0) {
      lastSeenAtRef.current = batch[batch.length - 1].createdAt;
      localStorage.setItem('notification_last_seen_at', lastSeenAtRef.current);
    }
    });

    socket.on('unread_count:update', ({ count }: { count: number }) => {
      setUnreadCount(count);
    });

    // Load initial notifications
    setIsLoading(true);
    listNotifications({ limit: 25, isRead: false })
      .then((res) => {
        setNotifications(res.data || []);
        setUnreadCount(res.data?.filter((n: Notification) => !n.isRead).length || 0);
      })
      .finally(() => setIsLoading(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  const fetchMore = useCallback(async (page: number) => {
    const res = await listNotifications({ page, limit: 25 });
    setNotifications((prev) => {
      const ids = new Set(prev.map((n) => n._id));
      const newOnes = (res.data || []).filter((n: Notification) => !ids.has(n._id));
      return [...prev, ...newOnes];
    });
  }, []);

  const markAsRead = useCallback(async (ids: string[]) => {
    await markRead(ids);
    setNotifications((prev) =>
      prev.map((n) => (ids.length === 0 || ids.includes(n._id) ? { ...n, isRead: true } : n))
    );
    setUnreadCount(0);
  }, []);

  const markAllRead = useCallback(() => markAsRead([]), [markAsRead]);

  const dismiss = useCallback(async (id: string) => {
    await dismissNotification(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, isConnected, isLoading, fetchMore, markAsRead, markAllRead, dismiss }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
