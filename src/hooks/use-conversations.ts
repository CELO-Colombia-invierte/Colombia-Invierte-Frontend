import { useState, useEffect, useCallback } from 'react';
import { chatApiService } from '@/services/chat';
import { Conversation, ConversationType } from '@/models/Conversation.model';
import { ConversationMapper } from '@/mappers/ConversationMapper';

interface UseConversationsReturn {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createConversation: (
    type: ConversationType,
    memberIds: string[]
  ) => Promise<Conversation | null>;
}

export const useConversations = (): UseConversationsReturn => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await chatApiService.getConversations();

      const sorted = ConversationMapper.sortByLastMessage(data);
      setConversations(sorted);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch conversations'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createConversation = useCallback(
    async (
      type: ConversationType,
      memberIds: string[]
    ): Promise<Conversation | null> => {
      try {
        setError(null);
        const newConversation = await chatApiService.createConversation(
          type,
          memberIds
        );
        setConversations((prev) => [newConversation, ...prev]);
        return newConversation;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to create conversation'
        );
        return null;
      }
    },
    []
  );

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
    createConversation,
  };
};
