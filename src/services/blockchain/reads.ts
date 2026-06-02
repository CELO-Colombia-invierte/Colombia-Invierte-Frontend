import { readContract, prepareContractCall, encode } from 'thirdweb';
import { getRpcClient, eth_getBalance } from 'thirdweb/rpc';
import type { Account } from 'thirdweb/wallets';
import { thirdwebClient } from '@/app/App';
import { CHAIN } from '@/contracts/config';
import { contractAt, sendWithFeeCurrency } from './core';

export async function getVaultOf(revenueAddress: string): Promise<string> {
  return readContract({ contract: contractAt(revenueAddress), method: 'function vault() view returns (address)' }) as Promise<string>;
}

export async function getSettlementTokenOf(revenueAddress: string): Promise<string> {
  return readContract({ contract: contractAt(revenueAddress), method: 'function settlementToken() view returns (address)' }) as Promise<string>;
}

export async function getGovernanceOf(revenueAddress: string): Promise<string> {
  return readContract({ contract: contractAt(revenueAddress), method: 'function governance() view returns (address)' }) as Promise<string>;
}

export async function getFeeManagerOf(revenueAddress: string): Promise<string> {
  return readContract({ contract: contractAt(revenueAddress), method: 'function feeManager() view returns (address)' }) as Promise<string>;
}

export async function getFeeTreasury(feeManagerAddress: string): Promise<string> {
  return readContract({ contract: contractAt(feeManagerAddress), method: 'function feeTreasury() view returns (address)' }) as Promise<string>;
}

export interface VaultStatus {
  paused: boolean;
  state: number; // VaultState: 0=Locked, 1=Active, 2=Closed
  frozen: boolean; // congelada por disputa (paused)
  closed: boolean; // cerrada definitivamente (state === 2)
}

export async function getVaultStatus(vaultAddress: string): Promise<VaultStatus> {
  const [paused, state] = await Promise.all([
    readContract({ contract: contractAt(vaultAddress), method: 'function paused() view returns (bool)' }) as Promise<boolean>,
    readContract({ contract: contractAt(vaultAddress), method: 'function state() view returns (uint8)' }) as Promise<bigint | number>,
  ]);
  const stateNum = Number(state);
  return { paused, state: stateNum, frozen: paused, closed: stateNum === 2 };
}

export async function getRevenueState(revenueAddress: string): Promise<number> {
  const v = await readContract({ contract: contractAt(revenueAddress), method: 'function state() view returns (uint8)' });
  return Number(v);
}

export async function getSaleEnd(revenueAddress: string): Promise<bigint> {
  return readContract({ contract: contractAt(revenueAddress), method: 'function saleEnd() view returns (uint64)' }) as Promise<bigint>;
}

export async function getProjectFunds(revenueAddress: string): Promise<bigint> {
  return readContract({ contract: contractAt(revenueAddress), method: 'function projectFunds() view returns (uint256)' }) as Promise<bigint>;
}

export async function getProjectTokenAddress(revenueAddress: string): Promise<string> {
  return readContract({ contract: contractAt(revenueAddress), method: 'function token() view returns (address)' }) as Promise<string>;
}

export async function getProjectCreator(revenueAddress: string): Promise<string> {
  return readContract({ contract: contractAt(revenueAddress), method: 'function projectCreator() view returns (address)' }) as Promise<string>;
}

export async function getTokenTotalSupply(tokenAddress: string): Promise<bigint> {
  return readContract({ contract: contractAt(tokenAddress), method: 'function totalSupply() view returns (uint256)' }) as Promise<bigint>;
}

export async function getCurrentVotes(tokenAddress: string, user: string): Promise<bigint> {
  return readContract({
    contract: contractAt(tokenAddress),
    method: 'function getVotes(address account) view returns (uint256)',
    params: [user],
  }) as Promise<bigint>;
}

export async function getDelegate(tokenAddress: string, user: string): Promise<string> {
  return readContract({
    contract: contractAt(tokenAddress),
    method: 'function delegates(address account) view returns (address)',
    params: [user],
  }) as Promise<string>;
}

export async function delegateToSelf(account: Account, tokenAddress: string): Promise<string> {
  const tx = prepareContractCall({
    contract: contractAt(tokenAddress),
    method: 'function delegate(address delegatee)',
    params: [account.address],
  });
  const calldata = await encode(tx);
  return sendWithFeeCurrency(account, tokenAddress, calldata);
}

export async function getTokenBalance(tokenAddress: string, userAddress: string): Promise<bigint> {
  return readContract({
    contract: contractAt(tokenAddress),
    method: 'function balanceOf(address) view returns (uint256)',
    params: [userAddress],
  }) as Promise<bigint>;
}

export async function getVaultAvailableBalance(vaultAddress: string, tokenAddress: string): Promise<bigint> {
  return readContract({
    contract: contractAt(vaultAddress),
    method: 'function availableBalance(address) view returns (uint256)',
    params: [tokenAddress],
  }) as Promise<bigint>;
}

export async function getNativeBalance(address: string): Promise<bigint> {
  const rpc = getRpcClient({ client: thirdwebClient, chain: CHAIN });
  return eth_getBalance(rpc, { address: address as `0x${string}` });
}

export async function getTokenAllowance(tokenAddress: string, ownerAddress: string, spenderAddress: string): Promise<bigint> {
  return readContract({
    contract: contractAt(tokenAddress),
    method: 'function allowance(address, address) view returns (uint256)',
    params: [ownerAddress, spenderAddress],
  }) as Promise<bigint>;
}

export async function getDeposits(contractAddress: string, memberAddress: string): Promise<bigint> {
  return readContract({
    contract: contractAt(contractAddress),
    method: 'function deposits(address) view returns (uint256)',
    params: [memberAddress],
  }) as Promise<bigint>;
}

export async function getTokenDecimals(tokenAddress: string): Promise<number> {
  const decimals = await readContract({ contract: contractAt(tokenAddress), method: 'function decimals() view returns (uint8)' });
  return Number(decimals);
}
