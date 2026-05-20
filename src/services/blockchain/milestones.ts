import { readContract, prepareContractCall, encode } from 'thirdweb';
import type { Account } from 'thirdweb/wallets';
import { BLOCKCHAIN_CONFIG } from '@/contracts/config';
import { contractAt, sendWithFeeCurrency } from './core';

export async function proposeMilestoneCustom(
  account: Account,
  milestonesAddress: string,
  description: string,
  recipient: string,
  amount: bigint,
): Promise<string> {
  const tx = prepareContractCall({
    contract: contractAt(milestonesAddress),
    method: 'function proposeMilestone(string description, address token, address recipient, uint256 amount) returns (uint256)',
    params: [description, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS as `0x${string}`, recipient as `0x${string}`, amount],
  });
  const calldata = await encode(tx);
  return sendWithFeeCurrency(account, milestonesAddress, calldata);
}

export async function executeMilestone(account: Account, milestonesAddress: string, milestoneId: bigint): Promise<string> {
  const tx = prepareContractCall({
    contract: contractAt(milestonesAddress),
    method: 'function executeMilestone(uint256 id)',
    params: [milestoneId],
  });
  const calldata = await encode(tx);
  return sendWithFeeCurrency(account, milestonesAddress, calldata);
}

export async function getMilestonesCommitted(milestonesAddress: string, tokenAddress: string): Promise<bigint> {
  return readContract({
    contract: contractAt(milestonesAddress),
    method: 'function totalRequestedByToken(address) view returns (uint256)',
    params: [tokenAddress],
  }) as Promise<bigint>;
}
