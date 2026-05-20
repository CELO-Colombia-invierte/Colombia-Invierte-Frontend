import { readContract, prepareContractCall, encode, waitForReceipt } from 'thirdweb';
import { decodeEventLog } from 'viem';
import type { Account } from 'thirdweb/wallets';
import { thirdwebClient } from '@/app/App';
import { CHAIN } from '@/contracts/config';
import GovernanceAbi from '@/contracts/abis/GovernanceModule.json';
import { contractAt, sendWithFeeCurrency } from './core';

export async function getVotingPower(governanceAddress: string, user: string, blockNumber: bigint = 0n): Promise<bigint> {
  const strategyAddress = await readContract({
    contract: contractAt(governanceAddress),
    method: 'function votingStrategy() view returns (address)',
  }) as string;
  return readContract({
    contract: contractAt(strategyAddress),
    method: 'function getVotingPower(address user, uint256 snapshotBlock) view returns (uint256)',
    params: [user, blockNumber],
  }) as Promise<bigint>;
}

export async function getProposalChainState(governanceAddress: string, proposalId: bigint): Promise<{
  yesVotes: bigint;
  noVotes: bigint;
  endTime: bigint;
  executed: boolean;
} | null> {
  try {
    const result = await readContract({
      contract: contractAt(governanceAddress),
      method: 'function proposals(uint256) view returns (uint8 action, uint256 targetId, uint256 startTime, uint256 endTime, uint256 snapshotBlock, uint256 snapshotQuorum, uint256 yesVotes, uint256 noVotes, uint256 amount, address recipient, address token, bytes32 descriptionHash, bool executed)',
      params: [proposalId],
    }) as readonly [number, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, string, string, string, boolean];
    const [, , startTime, endTime, , , yesVotes, noVotes, , , , , executed] = result;
    if (startTime === 0n) return null;
    return { yesVotes, noVotes, endTime, executed };
  } catch {
    return null;
  }
}

export async function getUserVote(governanceAddress: string, proposalId: bigint, user: string): Promise<number> {
  try {
    const v = await readContract({
      contract: contractAt(governanceAddress),
      method: 'function votes(uint256, address) view returns (uint8)',
      params: [proposalId, user],
    }) as number;
    return Number(v);
  } catch {
    return 0;
  }
}

export async function tryFinalizeSale(account: Account, revenueAddress: string): Promise<string> {
  const tx = prepareContractCall({
    contract: contractAt(revenueAddress),
    method: 'function finalizeSale()',
    params: [],
  });
  const calldata = await encode(tx);
  return sendWithFeeCurrency(account, revenueAddress, calldata);
}

export async function proposeOnChain(
  account: Account,
  governanceAddress: string,
  action: number,
  targetId: bigint,
  amount: bigint,
  recipient: string,
  token: string,
  description: string,
): Promise<{ txHash: string; proposalId: string }> {
  const tx = prepareContractCall({
    contract: contractAt(governanceAddress),
    method: 'function propose(uint8 action, uint256 targetId, uint256 amount, address recipient, address token, string description) returns (uint256)',
    params: [action, targetId, amount, recipient, token, description],
  });
  const calldata = await encode(tx);
  const txHash = await sendWithFeeCurrency(account, governanceAddress, calldata);
  const receipt = await waitForReceipt({
    client: thirdwebClient,
    chain: CHAIN,
    transactionHash: txHash as `0x${string}`,
  });

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== governanceAddress.toLowerCase()) continue;
    try {
      const decoded = decodeEventLog({
        abi: GovernanceAbi as Parameters<typeof decodeEventLog>[0]['abi'],
        eventName: 'ProposalCreated',
        topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
        data: log.data as `0x${string}`,
      });
      const args = decoded.args as { id: bigint };
      return { txHash, proposalId: args.id.toString() };
    } catch {
      continue;
    }
  }
  throw new Error('No se encontró evento ProposalCreated en el receipt');
}

export async function voteOnChain(
  account: Account,
  governanceAddress: string,
  proposalId: bigint,
  support: boolean,
): Promise<string> {
  const tx = prepareContractCall({
    contract: contractAt(governanceAddress),
    method: 'function vote(uint256 id, uint8 vote_)',
    params: [proposalId, support ? 1 : 2],
  });
  const calldata = await encode(tx);
  return sendWithFeeCurrency(account, governanceAddress, calldata);
}

export async function executeProposalOnChain(
  account: Account,
  governanceAddress: string,
  proposalId: bigint,
): Promise<string> {
  const tx = prepareContractCall({
    contract: contractAt(governanceAddress),
    method: 'function execute(uint256 id)',
    params: [proposalId],
  });
  const calldata = await encode(tx);
  return sendWithFeeCurrency(account, governanceAddress, calldata);
}
