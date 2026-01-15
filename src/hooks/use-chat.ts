import { useState, useCallback, useEffect } from 'react';
import { useMessages } from './use-messages';
import { useChatWebSocket } from './use-chat-websocket';
import { useAuth } from './use-auth';
import { Message } from '@/models/Message.model';
import { MessageMapper } from '@/mappers/MessageMapper';
import type { MessageResponseDto } from '@/dtos/chat/ChatResponse.dto';

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
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const {
    messages: initialMessages,
    loading,
    error,
    sendMessage: sendHttpMessage,
  } = useMessages(conversationId);

  const {
    connected,
    sendMessage: sendWsMessage,
    typing,
    stopTyping: wsStopTyping,
    markAsRead: wsMarkAsRead,
  } = useChatWebSocket({
    onNewMessage: (event) => {
      if (event.conversationId === conversationId) {
        const messageDto = event.message as unknown as MessageResponseDto;
        const messageModel = MessageMapper.fromDto(messageDto);

        setMessages((prev) => {
          const exists = prev.some((m) => m.id === messageModel.id);
          if (exists) return prev;
          return [...prev, messageModel];
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
      if (!user) return;

      if (connected) {
        sendWsMessage(conversationId, text);
      } else {
        await sendHttpMessage(text, user);
      }
    },
    [connected, conversationId, sendWsMessage, sendHttpMessage, user]
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
