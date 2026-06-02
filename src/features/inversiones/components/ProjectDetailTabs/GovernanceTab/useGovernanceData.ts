import { useEffect, useState } from 'react';
import type { Account } from 'thirdweb/wallets';
import { Project } from '@/models/projects';
import { apiService } from '@/services/api/api.service';
import { blockchainService } from '@/services/blockchain.service';
import type { Proposal, ProposalChainState } from './types';

export function useGovernanceData(project: Project, account: Account | undefined) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectCreator, setProjectCreator] = useState<string | null>(null);
  const [votingPower, setVotingPower] = useState<bigint | null>(null);
  const [tokenBalance, setTokenBalance] = useState<bigint | null>(null);
  const [delegatedTo, setDelegatedTo] = useState<string | null>(null);
  const [chainState, setChainState] = useState<Record<string, ProposalChainState>>({});
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [vaultFrozen, setVaultFrozen] = useState(false);
  const [vaultClosed, setVaultClosed] = useState(false);
  // Propuestas recien creadas on-chain que aun no indexa el backend.
  const [optimisticProposals, setOptimisticProposals] = useState<Proposal[]>([]);

  const loadProposals = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await apiService.get<Proposal[]>(`/projects/${project.id}/governance/proposals`);
      const list = response.data ?? [];
      setProposals(list);
      setOptimisticProposals((prev) =>
        prev.filter((o) => !list.some((r) => r.description.trim() === o.description.trim())),
      );

      if (project.governance_address && list.length > 0) {
        const stateEntries = await Promise.all(
          list.map(async (p) => {
            const cs = await blockchainService.getProposalChainState(
              project.governance_address!,
              BigInt(p.proposal_chain_id),
            );
            return [p.proposal_chain_id, cs] as const;
          }),
        );
        const stateMap: Record<string, ProposalChainState> = {};
        for (const [id, cs] of stateEntries) if (cs) stateMap[id] = cs;
        setChainState(stateMap);

        if (account?.address) {
          const voteEntries = await Promise.all(
            list.map(async (p) => {
              const v = await blockchainService.getUserVote(
                project.governance_address!,
                BigInt(p.proposal_chain_id),
                account.address,
              );
              return [p.proposal_chain_id, v] as const;
            }),
          );
          const voteMap: Record<string, number> = {};
          for (const [id, v] of voteEntries) voteMap[id] = v;
          setUserVotes(voteMap);
        }
      }
    } catch {
      setProposals([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const addOptimisticProposal = (description: string) => {
    setOptimisticProposals((prev) => [
      ...prev,
      {
        id: `optimistic-${Date.now()}`,
        proposal_chain_id: '',
        description,
        status: 'ACTIVE',
        votes_for: '0',
        votes_against: '0',
        created_at: new Date().toISOString(),
      },
    ]);
  };

  useEffect(() => {
    loadProposals();
  }, [project.id]);

  // Mientras haya cards optimistas, reconsultamos hasta que el indexer
  // registre la propuesta y la card optimista se reemplace por la real.
  useEffect(() => {
    if (optimisticProposals.length === 0) return;
    let attempts = 0;
    const iv = setInterval(() => {
      attempts += 1;
      loadProposals(true);
      if (attempts >= 30) clearInterval(iv);
    }, 4000);
    return () => clearInterval(iv);
  }, [optimisticProposals.length]);

  useEffect(() => {
    if (!project.revenue_address) return;
    blockchainService
      .getProjectCreator(project.revenue_address)
      .then(setProjectCreator)
      .catch(() => setProjectCreator(null));
  }, [project.revenue_address]);

  useEffect(() => {
    if (!project.vault_address) return;
    blockchainService
      .getVaultStatus(project.vault_address)
      .then((vs) => {
        setVaultFrozen(vs.frozen);
        setVaultClosed(vs.closed);
      })
      .catch(() => {
        setVaultFrozen(false);
        setVaultClosed(false);
      });
  }, [project.vault_address]);

  const loadVotingState = async () => {
    if (!project.governance_address || !account?.address) {
      setVotingPower(null);
      setTokenBalance(null);
      setDelegatedTo(null);
      return;
    }
    try {
      if (project.type === 'TOKENIZATION') {
        let tokenAddr = project.token_address;
        if (!tokenAddr && project.revenue_address) {
          try {
            tokenAddr = await blockchainService.getProjectTokenAddress(project.revenue_address);
          } catch {
          }
        }
        if (!tokenAddr) {
          setVotingPower(null);
          return;
        }
        const [balance, votes, delegateAddr] = await Promise.all([
          blockchainService.getTokenBalance(tokenAddr, account.address),
          blockchainService.getCurrentVotes(tokenAddr, account.address),
          blockchainService.getDelegate(tokenAddr, account.address),
        ]);
        setTokenBalance(balance);
        setVotingPower(votes);
        setDelegatedTo(delegateAddr);
      } else {
        const power = await blockchainService.getVotingPower(project.governance_address, account.address);
        setVotingPower(power);
        setTokenBalance(null);
        setDelegatedTo(null);
      }
    } catch {
      setVotingPower(null);
    }
  };

  useEffect(() => {
    loadVotingState();
  }, [project.governance_address, project.token_address, project.type, account?.address]);

  return {
    proposals,
    optimisticProposals,
    addOptimisticProposal,
    loading,
    projectCreator,
    votingPower,
    tokenBalance,
    delegatedTo,
    chainState,
    userVotes,
    vaultFrozen,
    vaultClosed,
    loadProposals,
    loadVotingState,
  };
}
