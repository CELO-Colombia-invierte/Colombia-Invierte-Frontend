import { useState, useEffect, useCallback, useRef } from 'react';
import { chatWebSocketService } from '@/services/chat';
import {
  Message,
  NewMessageSocketEvent,
  UserTypingSocketEvent,
  UserStoppedTypingSocketEvent,
  MessageReadSocketEvent,
  NewConversationSocketEvent,
  ConnectedSocketEvent,
  SocketErrorEvent,
} from '@/types/chat';

interface UseChatWebSocketOptions {
  onNewMessage?: (event: NewMessageSocketEvent) => void;
  onUserTyping?: (event: UserTypingSocketEvent) => void;
  onUserStoppedTyping?: (event: UserStoppedTypingSocketEvent) => void;
  onMessageRead?: (event: MessageReadSocketEvent) => void;
  onNewConversation?: (event: NewConversationSocketEvent) => void;
  onConnected?: (event: ConnectedSocketEvent) => void;
  onError?: (event: SocketErrorEvent) => void;
}

interface UseChatWebSocketReturn {
  connected: boolean;
  sendMessage: (conversationId: string, text: string) => void;
  typing: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  markAsRead: (conversationId: string) => void;
}

export const useChatWebSocket = (
  options: UseChatWebSocketOptions = {}
): UseChatWebSocketReturn => {
  const [connected, setConnected] = useState(false);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    try {
      chatWebSocketService.connect();
      setConnected(true);

      const handleConnected = (data: ConnectedSocketEvent) => {
        setConnected(true);
        optionsRef.current.onConnected?.(data);
      };

      const handleNewMessage = (data: NewMessageSocketEvent) => {
        optionsRef.current.onNewMessage?.(data);
      };

      const handleUserTyping = (data: UserTypingSocketEvent) => {
        optionsRef.current.onUserTyping?.(data);
      };

      const handleUserStoppedTyping = (data: UserStoppedTypingSocketEvent) => {
        optionsRef.current.onUserStoppedTyping?.(data);
      };

      const handleMessageRead = (data: MessageReadSocketEvent) => {
        optionsRef.current.onMessageRead?.(data);
      };

      const handleNewConversation = (data: NewConversationSocketEvent) => {
        optionsRef.current.onNewConversation?.(data);
      };

      const handleError = (data: SocketErrorEvent) => {
        setConnected(false);
        optionsRef.current.onError?.(data);
      };

      chatWebSocketService.onConnected(handleConnected);
      chatWebSocketService.onNewMessage(handleNewMessage);
      chatWebSocketService.onUserTyping(handleUserTyping);
      chatWebSocketService.onUserStoppedTyping(handleUserStoppedTyping);
      chatWebSocketService.onMessageRead(handleMessageRead);
      chatWebSocketService.onNewConversation(handleNewConversation);
      chatWebSocketService.onError(handleError);

      return () => {
        chatWebSocketService.offEvent('connected', handleConnected);
        chatWebSocketService.offEvent('newMessage', handleNewMessage);
        chatWebSocketService.offEvent('userTyping', handleUserTyping);
        chatWebSocketService.offEvent('userStoppedTyping', handleUserStoppedTyping);
        chatWebSocketService.offEvent('messageRead', handleMessageRead);
        chatWebSocketService.offEvent('newConversation', handleNewConversation);
        chatWebSocketService.offEvent('error', handleError);
        chatWebSocketService.disconnect();
        setConnected(false);
      };
    } catch (error) {
      setConnected(false);
      console.error('Failed to connect to WebSocket:', error);
    }
  }, []);

  const sendMessage = useCallback((conversationId: string, text: string) => {
    chatWebSocketService.sendMessage({
      conversationId,
      bodyText: text,
    });
  }, []);

  const typing = useCallback((conversationId: string) => {
    chatWebSocketService.typing({ conversationId });
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    chatWebSocketService.stopTyping({ conversationId });
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    chatWebSocketService.joinConversation({ conversationId });
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    chatWebSocketService.leaveConversation({ conversationId });
  }, []);

  const markAsRead = useCallback((conversationId: string) => {
    chatWebSocketService.markAsRead({ conversationId });
  }, []);

  return {
    connected,
    sendMessage,
    typing,
    stopTyping,
    joinConversation,
    leaveConversation,
    markAsRead,
  };
};
