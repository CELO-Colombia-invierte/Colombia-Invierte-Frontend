import { prepareContractCall, encode, waitForReceipt } from 'thirdweb';
import type { Account } from 'thirdweb/wallets';
import { thirdwebClient } from '@/app/App';
import { CHAIN, BLOCKCHAIN_CONFIG } from '@/contracts/config';
import { contractAt, sendWithFeeCurrency, parseProjectCreatedEvent } from './core';
import type { DeployNatilleraV2Params, DeployTokenizacionV2Params, V2ContractAddresses } from './types';

async function joinNatilleraAsCreator(account: Account, natilleraAddress: string): Promise<void> {
  const tx = prepareContractCall({
    contract: contractAt(natilleraAddress),
    method: 'function join()',
    params: [],
  });
  const data = await encode(tx);
  await sendWithFeeCurrency(account, natilleraAddress, data);
}

export async function deployNatilleraV2(
  account: Account,
  params: DeployNatilleraV2Params,
): Promise<V2ContractAddresses> {
  const contractCall = prepareContractCall({
    contract: contractAt(BLOCKCHAIN_CONFIG.CONTRACTS.PLATFORM_V2),
    method: 'function createNatilleraProject(address settlementToken, uint256 quota, uint256 duration, uint256 maxMembers) returns (uint256 id)',
    params: [params.settlementToken, params.quota, params.duration, params.maxMembers],
  });

  const calldata = await encode(contractCall);
  const txHash = await sendWithFeeCurrency(account, BLOCKCHAIN_CONFIG.CONTRACTS.PLATFORM_V2, calldata);
  const receipt = await waitForReceipt({ client: thirdwebClient, chain: CHAIN, transactionHash: txHash as `0x${string}` });

  const addresses = parseProjectCreatedEvent(receipt.logs, txHash);
  await joinNatilleraAsCreator(account, addresses.module);
  return addresses;
}

export async function deployTokenizacionV2(
  account: Account,
  params: DeployTokenizacionV2Params,
): Promise<V2ContractAddresses> {
  const contractCall = prepareContractCall({
    contract: contractAt(BLOCKCHAIN_CONFIG.CONTRACTS.PLATFORM_V2),
    method: 'function createTokenizationProject(address settlementToken, uint256 fundingTarget, uint256 minimumCap, uint256 tokenPrice, uint256 saleDuration, string name, string symbol) returns (uint256 id)',
    params: [params.settlementToken, params.fundingTarget, params.minimumCap, params.tokenPrice, params.saleDuration, params.name, params.symbol],
  });

  const calldata = await encode(contractCall);
  const txHash = await sendWithFeeCurrency(account, BLOCKCHAIN_CONFIG.CONTRACTS.PLATFORM_V2, calldata);
  const receipt = await waitForReceipt({ client: thirdwebClient, chain: CHAIN, transactionHash: txHash as `0x${string}` });

  return parseProjectCreatedEvent(receipt.logs, txHash);
}
