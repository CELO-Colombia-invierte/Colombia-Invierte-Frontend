import { useState, useEffect, useCallback } from 'react';
import { chatApiService } from '@/services/chat';
import { Message } from '@/models/Message.model';
import { User } from '@/models/User.model';
import { MessageMapper } from '@/mappers/MessageMapper';

interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (text: string, currentUser: User) => Promise<Message | null>;
  uploadAttachment: (messageId: string, file: File) => Promise<void>;
}

export const useMessages = (conversationId: string): UseMessagesReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await chatApiService.getMessages(conversationId);
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const sendMessage = useCallback(
    async (text: string, currentUser: User): Promise<Message | null> => {
      if (!conversationId) return null;

      // Crear mensaje optimista
      const optimisticMessage = MessageMapper.createOptimistic(
        text,
        conversationId,
        currentUser
      );
      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        setError(null);
        const sentMessage = await chatApiService.sendMessage(
          conversationId,
          text
        );

        // Reemplazar mensaje optimista con el real
        setMessages((prev) =>
          MessageMapper.replaceOptimistic(
            prev,
            optimisticMessage.id,
            sentMessage
          )
        );

        return sentMessage;
      } catch (err) {
        // Marcar mensaje como fallido
        const failedMessage = MessageMapper.markOptimisticAsFailed(
          optimisticMessage,
          err instanceof Error ? err.message : 'Failed to send message'
        );
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMessage.id ? failedMessage : m))
        );
        setError(err instanceof Error ? err.message : 'Failed to send message');
        return null;
      }
    },
    [conversationId]
  );

  const uploadAttachment = useCallback(
    async (messageId: string, file: File): Promise<void> => {
      if (!conversationId) return;

      try {
        setError(null);
        await chatApiService.uploadMessageAttachment(
          conversationId,
          messageId,
          file
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to upload attachment'
        );
        throw err;
      }
    },
    [conversationId]
  );

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    uploadAttachment,
  };
};
