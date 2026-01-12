import { useState, useEffect, useCallback } from 'react';
import { chatApiService } from '@/services/chat';
import { Message } from '@/types/chat';

interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<Message | null>;
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
    async (text: string): Promise<Message | null> => {
      if (!conversationId) return null;

      try {
        setError(null);
        const newMessage = await chatApiService.sendMessage(conversationId, {
          body_text: text,
        });
        setMessages((prev) => [...prev, newMessage]);
        return newMessage;
      } catch (err) {
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
        setError(err instanceof Error ? err.message : 'Failed to upload attachment');
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
