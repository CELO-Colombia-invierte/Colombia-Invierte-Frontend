import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { notificationsApiService } from '@/services/notifications';
import { authService } from '@/services/auth';
import { Notification } from '@/types';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationsApiService.getNotifications({
        limit: 100,
      });
      setNotifications(response.notifications);
      setUnreadCount(response.unread_count);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar notificaciones'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationsApiService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationsApiService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApiService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, []);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await notificationsApiService.deleteNotification(notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        setUnreadCount((prev) => {
          const notification = notifications.find(
            (n) => n.id === notificationId
          );
          if (notification && !notification.is_read) {
            return Math.max(0, prev - 1);
          }
          return prev;
        });
      } catch (err) {
        console.error('Error deleting notification:', err);
      }
    },
    [notifications]
  );

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    fetchNotifications();


    const token = authService.getToken();
    if (token) {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const socket = io(`${baseUrl}/notifications`, {
        auth: { token },
        transports: ['websocket'],
      });

      socket.on('notification:new', (notification: Notification) => {
        setNotifications((prev) => {
          const idx = prev.findIndex((n) => n.id === notification.id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = notification;
            return updated.sort((a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
          }
          return [notification, ...prev];
        });
        fetchUnreadCount();
      });

      socket.on('notification:count', (data: { unread_count: number }) => {
        setUnreadCount(data.unread_count);
      });

      socketRef.current = socket;
    }

    const interval = setInterval(fetchNotifications, 60000);

    return () => {
      clearInterval(interval);
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
