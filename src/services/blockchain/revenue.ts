import { readContract, prepareContractCall, encode } from 'thirdweb';
import type { Account } from 'thirdweb/wallets';
import { BLOCKCHAIN_CONFIG } from '@/contracts/config';
import { contractAt, sendWithFeeCurrency } from './core';
import { decodeContractRevert } from './errors';
import { getProjectTokenAddress, getDelegate, delegateToSelf } from './reads';
import type { RevenueModuleState } from './types';

export async function approveToken(
  account: Account,
  tokenAddress: string,
  spenderAddress: string,
  amount: bigint,
): Promise<string> {
  const contractCall = prepareContractCall({
    contract: contractAt(tokenAddress),
    method: 'function approve(address spender, uint256 amount) returns (bool)',
    params: [spenderAddress, amount],
  });
  const calldata = await encode(contractCall);
  return sendWithFeeCurrency(account, tokenAddress, calldata);
}

export async function investInProject(
  account: Account,
  revenueAddress: string,
  amount: bigint,
  _vaultAddress?: string,
): Promise<string> {
  await approveToken(account, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS, revenueAddress, amount);

  const contractCall = prepareContractCall({
    contract: contractAt(revenueAddress),
    method: 'function invest(uint256 amount)',
    params: [amount],
  });
  const calldata = await encode(contractCall);
  let txHash: string;
  try {
    txHash = await sendWithFeeCurrency(account, revenueAddress, calldata);
  } catch (err) {
    const friendly = decodeContractRevert(err);
    if (friendly) throw new Error(friendly);
    throw err;
  }
  try {
    const tokenAddr = await getProjectTokenAddress(revenueAddress);
    const currentDelegate = await getDelegate(tokenAddr, account.address);
    if (currentDelegate === '0x0000000000000000000000000000000000000000') {
      await delegateToSelf(account, tokenAddr);
    }
  } catch {
  }
  return txHash;
}

export async function claimRendimientos(account: Account, revenueAddress: string): Promise<string> {
  const contractCall = prepareContractCall({ contract: contractAt(revenueAddress), method: 'function claim()' });
  const calldata = await encode(contractCall);
  return sendWithFeeCurrency(account, revenueAddress, calldata);
}

export async function getPendingRewards(revenueAddress: string, userAddress: string): Promise<bigint> {
  return readContract({
    contract: contractAt(revenueAddress),
    method: 'function pending(address user) view returns (uint256)',
    params: [userAddress],
  }) as Promise<bigint>;
}

export async function getRevenueModuleState(revenueAddress: string): Promise<RevenueModuleState> {
  const contract = contractAt(revenueAddress);
  const [totalRaised, fundingTarget, minimumCap, tokenPrice, saleFinalized, state, distributionEnd, pendingRevenue] = await Promise.all([
    readContract({ contract, method: 'function totalRaised() view returns (uint128)' }),
    readContract({ contract, method: 'function fundingTarget() view returns (uint128)' }),
    readContract({ contract, method: 'function minimumCap() view returns (uint128)' }),
    readContract({ contract, method: 'function tokenPrice() view returns (uint128)' }),
    readContract({ contract, method: 'function saleFinalized() view returns (bool)' }),
    readContract({ contract, method: 'function state() view returns (uint8)' }),
    readContract({ contract, method: 'function distributionEnd() view returns (uint64)' }).catch(() => 0n),
    readContract({ contract, method: 'function pendingRevenue() view returns (uint256)' }).catch(() => 0n),
  ]);
  return {
    totalRaised: totalRaised as bigint,
    fundingTarget: fundingTarget as bigint,
    minimumCap: minimumCap as bigint,
    tokenPrice: tokenPrice as bigint,
    saleFinalized: saleFinalized as boolean,
    state: Number(state),
    distributionEnd: BigInt(distributionEnd as bigint | number),
    pendingRevenue: pendingRevenue as bigint,
  };
}

export async function getInvestment(revenueAddress: string, userAddress: string): Promise<bigint> {
  return readContract({
    contract: contractAt(revenueAddress),
    method: 'function investments(address) view returns (uint256)',
    params: [userAddress],
  }) as Promise<bigint>;
}

export async function depositRevenue(
  account: Account,
  revenueAddress: string,
  _vaultAddress: string,
  amount: bigint,
): Promise<string> {
  await approveToken(account, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS, revenueAddress, amount);
  const tx = prepareContractCall({
    contract: contractAt(revenueAddress),
    method: 'function depositRevenue(uint256 amount)',
    params: [amount],
  });
  const calldata = await encode(tx);
  return sendWithFeeCurrency(account, revenueAddress, calldata);
}

export async function refundInvestment(account: Account, revenueAddress: string): Promise<string> {
  const tx = prepareContractCall({ contract: contractAt(revenueAddress), method: 'function refund()' });
  const calldata = await encode(tx);
  return sendWithFeeCurrency(account, revenueAddress, calldata);
}
