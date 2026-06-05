import type { Account } from 'thirdweb/wallets';
import { blockchainService } from './blockchain.service';
import { apiService } from './api/api.service';
import { BLOCKCHAIN_CONFIG } from '@/contracts/config';

export enum GovernanceAction {
  ActivateVault = 0,
  CloseVault = 1,
  FreezeFromDispute = 2,
  UnfreezeVault = 3,
  ApproveAndExecuteMilestone = 4,
  CancelMilestone = 5,
  Disbursement = 6,
  UpdateVotingPeriod = 7,
  UpdateQuorum = 8,
}

export const ACTION_LABELS: Record<GovernanceAction, string> = {
  [GovernanceAction.ActivateVault]: 'Activar el fondo',
  [GovernanceAction.CloseVault]: 'Cerrar el proyecto',
  [GovernanceAction.FreezeFromDispute]: 'Pausar el fondo',
  [GovernanceAction.UnfreezeVault]: 'Reactivar el fondo',
  [GovernanceAction.ApproveAndExecuteMilestone]: 'Aprobar y pagar etapa',
  [GovernanceAction.CancelMilestone]: 'Cancelar etapa',
  [GovernanceAction.Disbursement]: 'Retiro de dinero',
  [GovernanceAction.UpdateVotingPeriod]: 'Cambiar tiempo para votar',
  [GovernanceAction.UpdateQuorum]: 'Cambiar votos necesarios',
};

export interface CreateProposalParams {
  projectId: string;
  governanceAddress: string;
  action: GovernanceAction;
  targetId: bigint;
  amount: bigint;
  recipient: string;
  token: string;
  description: string;
}

export interface CreateDisputeParams {
  projectId: string;
  disputesAddress: string;
  reason: string;
}

class GovernanceService {
  async createProposal(account: Account, params: CreateProposalParams): Promise<{ txHash: string; proposalId: string }> {
    const result = await blockchainService.proposeOnChain(
      account,
      params.governanceAddress,
      params.action,
      params.targetId,
      params.amount,
      params.recipient,
      params.token,
      params.description,
    );

    try {
      await apiService.post(`/projects/${params.projectId}/governance/proposals`, {
        chain_id: result.proposalId,
        action: params.action,
        target_id: params.targetId.toString(),
        amount: params.amount.toString(),
        recipient: params.recipient,
        token: params.token,
        description: params.description,
        propose_tx_hash: result.txHash,
        proposer_address: account.address,
      });
    } catch (err) {
      console.warn('[governance] write-through propose falló:', err);
    }

    return result;
  }

  async vote(account: Account, governanceAddress: string, proposalChainId: string, support: boolean): Promise<string> {
    const txHash = await blockchainService.voteOnChain(
      account,
      governanceAddress,
      BigInt(proposalChainId),
      support,
    );

    try {
      await apiService.post(`/governance/proposals/${proposalChainId}/votes`, {
        voter_address: account.address,
        support,
        vote_tx_hash: txHash,
      });
    } catch (err) {
      console.warn('[governance] write-through vote falló:', err);
    }

    return txHash;
  }

  async execute(account: Account, governanceAddress: string, proposalChainId: string): Promise<string> {
    const txHash = await blockchainService.executeProposalOnChain(
      account,
      governanceAddress,
      BigInt(proposalChainId),
    );

    try {
      await apiService.post(`/governance/proposals/${proposalChainId}/execute`, {
        execute_tx_hash: txHash,
      });
    } catch (err) {
      console.warn('[governance] write-through execute falló:', err);
    }

    return txHash;
  }

  async openDispute(account: Account, params: CreateDisputeParams): Promise<string> {
    const txHash = await blockchainService.openDisputeOnChain(
      account,
      params.disputesAddress,
      params.reason,
    );

    try {
      await apiService.post(`/projects/${params.projectId}/disputes`, {
        opener_address: account.address,
        reason: params.reason,
        open_tx_hash: txHash,
      });
    } catch (err) {
      console.warn('[governance] write-through dispute falló:', err);
    }

    return txHash;
  }

  buildDisbursementProposal(args: {
    projectId: string;
    governanceAddress: string;
    amountUsdc: bigint;
    recipient: string;
    description: string;
  }): CreateProposalParams {
    return {
      projectId: args.projectId,
      governanceAddress: args.governanceAddress,
      action: GovernanceAction.Disbursement,
      targetId: 0n,
      amount: args.amountUsdc,
      recipient: args.recipient,
      token: BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS,
      description: args.description,
    };
  }

  buildFreezeProposal(args: {
    projectId: string;
    governanceAddress: string;
    disputeChainId: string;
    description: string;
  }): CreateProposalParams {
    return {
      projectId: args.projectId,
      governanceAddress: args.governanceAddress,
      action: GovernanceAction.FreezeFromDispute,
      targetId: BigInt(args.disputeChainId),
      amount: 0n,
      recipient: '0x0000000000000000000000000000000000000000',
      token: '0x0000000000000000000000000000000000000000',
      description: args.description,
    };
  }

  buildCloseVaultProposal(args: {
    projectId: string;
    governanceAddress: string;
    description: string;
  }): CreateProposalParams {
    return {
      projectId: args.projectId,
      governanceAddress: args.governanceAddress,
      action: GovernanceAction.CloseVault,
      targetId: 0n,
      amount: 0n,
      recipient: '0x0000000000000000000000000000000000000000',
      token: '0x0000000000000000000000000000000000000000',
      description: args.description,
    };
  }

  async resolveDispute(
    account: Account,
    params: { projectId: string; disputesAddress: string; disputeChainId: string; accepted: boolean },
  ): Promise<string> {
    const txHash = await blockchainService.resolveDisputeOnChain(
      account,
      params.disputesAddress,
      BigInt(params.disputeChainId),
      params.accepted,
    );
    try {
      await apiService.post(`/projects/${params.projectId}/disputes/${params.disputeChainId}/resolve`, {
        resolver_address: account.address,
        accepted: params.accepted,
        resolve_tx_hash: txHash,
      });
    } catch (err) {
      console.warn('[governance] write-through resolveDispute falló:', err);
    }
    return txHash;
  }

  buildMilestoneApprovalProposal(args: {
    projectId: string;
    governanceAddress: string;
    milestoneChainId: string;
    description: string;
  }): CreateProposalParams {
    return {
      projectId: args.projectId,
      governanceAddress: args.governanceAddress,
      action: GovernanceAction.ApproveAndExecuteMilestone,
      targetId: BigInt(args.milestoneChainId),
      amount: 0n,
      recipient: '0x0000000000000000000000000000000000000000',
      token: '0x0000000000000000000000000000000000000000',
      description: args.description,
    };
  }
}

export const governanceService = new GovernanceService();
