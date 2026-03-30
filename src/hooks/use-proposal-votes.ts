import { useEffect, useCallback } from 'react';
import { chatWebSocketService, ProposalVoteUpdateEvent } from '@/services/chat/chat-websocket.service';

/**
 * Hook to listen for real-time proposal vote updates via WebSocket.
 * Call with a callback that receives vote update events.
 */
export const useProposalVotes = (
  onVoteUpdate: (event: ProposalVoteUpdateEvent) => void
) => {
  const stableCallback = useCallback(
    (data: ProposalVoteUpdateEvent) => {
      onVoteUpdate(data);
    },
    [onVoteUpdate]
  );

  useEffect(() => {
    chatWebSocketService.onProposalVoteUpdate(stableCallback);

    return () => {
      chatWebSocketService.offEvent('proposalVoteUpdate', stableCallback);
    };
  }, [stableCallback]);
};
