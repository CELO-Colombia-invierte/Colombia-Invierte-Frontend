import { readContract, prepareContractCall, encode } from 'thirdweb';
import type { Account } from 'thirdweb/wallets';
import { BLOCKCHAIN_CONFIG } from '@/contracts/config';
import { contractAt, sendWithFeeCurrency } from './core';
import { approveToken } from './revenue';
import type { NatilleraConfig, NatilleraState, NatilleraV2State } from './types';

export async function joinNatilleraOnChain(account: Account, natilleraAddress: string): Promise<string> {
  const contractCall = prepareContractCall({ contract: contractAt(natilleraAddress), method: 'function join()' });
  const calldata = await encode(contractCall);
  return sendWithFeeCurrency(account, natilleraAddress, calldata);
}

export async function payQuota(
  account: Account,
  natilleraAddress: string,
  vaultAddress: string,
  monthId: bigint,
  amount: bigint,
): Promise<string> {
  await approveToken(account, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS, vaultAddress, amount);
  const contractCall = prepareContractCall({
    contract: contractAt(natilleraAddress),
    method: 'function payQuota(uint256 monthId)',
    params: [monthId],
  });
  const calldata = await encode(contractCall);
  return sendWithFeeCurrency(account, natilleraAddress, calldata);
}

export async function claimFinalNatillera(account: Account, natilleraAddress: string): Promise<string> {
  const contractCall = prepareContractCall({ contract: contractAt(natilleraAddress), method: 'function claimFinal()' });
  const calldata = await encode(contractCall);
  return sendWithFeeCurrency(account, natilleraAddress, calldata);
}

export async function getNatilleraV2State(natilleraAddress: string): Promise<NatilleraV2State> {
  const contract = contractAt(natilleraAddress);
  const [currentMonth, quota, duration, isMatured, poolFinalized, memberCount] = await Promise.all([
    readContract({ contract, method: 'function currentMonth() view returns (uint256)' }),
    readContract({ contract, method: 'function quota() view returns (uint256)' }),
    readContract({ contract, method: 'function duration() view returns (uint256)' }),
    readContract({ contract, method: 'function isMatured() view returns (bool)' }),
    readContract({ contract, method: 'function poolFinalized() view returns (bool)' }),
    readContract({ contract, method: 'function memberCount() view returns (uint256)' }),
  ]);
  return {
    currentMonth: currentMonth as bigint,
    quota: quota as bigint,
    duration: duration as bigint,
    isMatured: isMatured as boolean,
    poolFinalized: poolFinalized as boolean,
    memberCount: memberCount as bigint,
  };
}

export async function isNatilleraV2Member(natilleraAddress: string, userAddress: string): Promise<boolean> {
  return readContract({
    contract: contractAt(natilleraAddress),
    method: 'function isMember(address) view returns (bool)',
    params: [userAddress],
  }) as Promise<boolean>;
}

export async function hasNatilleraV2Claimed(natilleraAddress: string, userAddress: string): Promise<boolean> {
  return readContract({
    contract: contractAt(natilleraAddress),
    method: 'function claimed(address) view returns (bool)',
    params: [userAddress],
  }) as Promise<boolean>;
}

export async function hasNatilleraV2PaidMonth(natilleraAddress: string, userAddress: string, monthId: bigint): Promise<boolean> {
  return readContract({
    contract: contractAt(natilleraAddress),
    method: 'function paidMonth(address, uint256) view returns (bool)',
    params: [userAddress, monthId],
  }) as Promise<boolean>;
}

export async function getNatilleraConfig(contractAddress: string): Promise<NatilleraConfig> {
  const result = await readContract({
    contract: contractAt(contractAddress),
    method: 'function config() view returns (address token, uint256 monthlyContribution, uint256 totalMonths, uint256 maxMembers)',
  });
  const [token, monthlyContribution, totalMonths, maxMembers] = result as [string, bigint, bigint, bigint];
  return { paymentToken: token, monthlyContribution, totalMonths, maxMembers };
}

export async function getNatilleraState(contractAddress: string): Promise<NatilleraState> {
  const contract = contractAt(contractAddress);
  const [currentCycle, totalCollected, isFinalized, members] = await Promise.all([
    readContract({ contract, method: 'function currentCycle() view returns (uint256)' }),
    readContract({ contract, method: 'function totalCollected() view returns (uint256)' }),
    readContract({ contract, method: 'function isFinalized() view returns (bool)' }),
    readContract({ contract, method: 'function members() view returns (address[])' }).catch(() => [] as readonly unknown[]),
  ]);
  return {
    currentCycle: currentCycle as bigint,
    totalCollected: totalCollected as bigint,
    isFinalized: isFinalized as boolean,
    memberCount: (members as string[]).length,
  };
}

export async function isMember(contractAddress: string, userAddress: string): Promise<boolean> {
  const result = await readContract({
    contract: contractAt(contractAddress),
    method: 'function isMember(address) view returns (bool)',
    params: [userAddress],
  });
  return result as boolean;
}
