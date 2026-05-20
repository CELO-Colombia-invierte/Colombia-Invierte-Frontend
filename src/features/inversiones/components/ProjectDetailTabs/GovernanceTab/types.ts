export interface Proposal {
  id: string;
  proposal_chain_id: string;
  description: string;
  status: 'ACTIVE' | 'EXECUTED' | 'DEFEATED';
  votes_for: string;
  votes_against: string;
  created_at: string;
  action?: number;
  amount?: string;
  recipient?: string;
  target_id?: string;
}

export interface ProposalChainState {
  yesVotes: bigint;
  noVotes: bigint;
  executed: boolean;
  endTime: bigint;
}

export interface ProposalFormState {
  action: number;
  amount: string;
  recipient: string;
  description: string;
  targetId: string;
}
