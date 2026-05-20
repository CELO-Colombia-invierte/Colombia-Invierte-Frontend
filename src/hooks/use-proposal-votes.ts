import { useEffect, useCallback } from 'react';
import { chatWebSocketService, ProposalVoteUpdateEvent } from '@/services/chat/chat-websocket.service';

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
