import { useState, useCallback, useEffect } from 'react';
import { useMessages } from './use-messages';
import { useChatWebSocket } from './use-chat-websocket';
import { Message } from '@/types/chat';

interface UseChatReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  connected: boolean;
  typingUsers: Set<string>;
  sendMessage: (text: string) => Promise<void>;
  startTyping: () => void;
  stopTyping: () => void;
  markAsRead: () => void;
}

export const useChat = (conversationId: string): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const {
    messages: initialMessages,
    loading,
    error,
    sendMessage: sendHttpMessage,
  } = useMessages(conversationId);

  const { connected, sendMessage: sendWsMessage, typing, stopTyping: wsStopTyping, markAsRead: wsMarkAsRead } = useChatWebSocket({
    onNewMessage: (event) => {
      if (event.conversationId === conversationId) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === event.message.id);
          if (exists) return prev;
          return [...prev, event.message];
        });
      }
    },
    onUserTyping: (event) => {
      if (event.conversationId === conversationId) {
        setTypingUsers((prev) => new Set(prev).add(event.userId));
      }
    },
    onUserStoppedTyping: (event) => {
      if (event.conversationId === conversationId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(event.userId);
          return newSet;
        });
      }
    },
  });

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (connected) {
        sendWsMessage(conversationId, text);
      } else {
        await sendHttpMessage(text);
      }
    },
    [connected, conversationId, sendWsMessage, sendHttpMessage]
  );

  const startTyping = useCallback(() => {
    if (connected) {
      typing(conversationId);
    }
  }, [connected, conversationId, typing]);

  const stopTyping = useCallback(() => {
    if (connected) {
      wsStopTyping(conversationId);
    }
  }, [connected, conversationId, wsStopTyping]);

  const markAsRead = useCallback(() => {
    if (connected) {
      wsMarkAsRead(conversationId);
    }
  }, [connected, conversationId, wsMarkAsRead]);

  return {
    messages,
    loading,
    error,
    connected,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
  };
};
