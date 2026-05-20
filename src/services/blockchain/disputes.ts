import { readContract, prepareContractCall, encode } from 'thirdweb';
import type { Account } from 'thirdweb/wallets';
import { contractAt, sendWithFeeCurrency } from './core';

export async function openDisputeOnChain(
  account: Account,
  disputesAddress: string,
  reason: string,
): Promise<string> {
  const tx = prepareContractCall({
    contract: contractAt(disputesAddress),
    method: 'function openDispute(string reason) returns (uint256)',
    params: [reason],
  });
  const calldata = await encode(tx);
  return sendWithFeeCurrency(account, disputesAddress, calldata);
}

export async function checkDisputeExists(disputesAddress: string, disputeChainId: string): Promise<boolean> {
  try {
    const data = (await readContract({
      contract: contractAt(disputesAddress),
      method: 'function disputes(uint256) view returns (uint256 id, address opener, string reason, uint8 status, uint256 openedAt, uint256 resolvedAt)',
      params: [BigInt(disputeChainId)],
    })) as readonly unknown[];
    const opener = (data[1] as string) ?? '';
    const status = Number(data[3] as bigint);
    if (!opener || opener === '0x0000000000000000000000000000000000000000') return false;
    return status !== 2;
  } catch {
    return true;
  }
}

export async function resolveDisputeOnChain(
  account: Account,
  disputesAddress: string,
  disputeId: bigint,
  accepted: boolean,
): Promise<string> {
  const tx = prepareContractCall({
    contract: contractAt(disputesAddress),
    method: 'function resolveDispute(uint256 id, bool accepted)',
    params: [disputeId, accepted],
  });
  const calldata = await encode(tx);
  return sendWithFeeCurrency(account, disputesAddress, calldata);
}
