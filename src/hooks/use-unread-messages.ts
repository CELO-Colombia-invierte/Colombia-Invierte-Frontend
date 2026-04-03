import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { chatApiService } from '@/services/chat';
import { authService } from '@/services/auth';

export const useUnreadMessages = () => {
  const [totalUnread, setTotalUnread] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  const fetchUnread = useCallback(async () => {
    try {
      const conversations = await chatApiService.getConversations();
      const total = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      setTotalUnread(total);
    } catch {
      console.error('Error fetching conversations');
    }
  }, []);

  useEffect(() => {
    fetchUnread();

    const token = authService.getToken();
    if (token) {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const socket = io(`${baseUrl}/notifications`, {
        auth: { token },
        transports: ['websocket'],
      });

      socket.on('notification:new', (notification: { type: string }) => {
        if (notification.type === 'NEW_MESSAGE') {
          fetchUnread();
        }
      });

      socketRef.current = socket;
    }


    const interval = setInterval(fetchUnread, 60000);

    return () => {
      clearInterval(interval);
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [fetchUnread]);

  return { totalUnread, refetch: fetchUnread };
};
