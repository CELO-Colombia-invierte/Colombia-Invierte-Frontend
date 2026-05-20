import { getContract, sendTransaction, prepareTransaction, waitForReceipt } from 'thirdweb';
import { decodeEventLog } from 'viem';
import type { Account } from 'thirdweb/wallets';
import { thirdwebClient } from '@/app/App';
import { CHAIN, BLOCKCHAIN_CONFIG, PlatformV2Abi } from '@/contracts/config';
import type { V2ContractAddresses } from './types';

export function contractAt(address: string) {
  return getContract({ client: thirdwebClient, chain: CHAIN, address });
}

export function validateChain(account: Account): void {
  const walletChainId = (account as any).chainId ?? (account as any).chain?.id;
  if (walletChainId && walletChainId !== BLOCKCHAIN_CONFIG.CHAIN_ID) {
    throw new Error(
      `Red incorrecta. Por favor cambia a ${BLOCKCHAIN_CONFIG.NETWORK_NAME} (Chain ID: ${BLOCKCHAIN_CONFIG.CHAIN_ID})`,
    );
  }
}

export async function sendWithFeeCurrency(
  account: Account,
  contractAddress: string,
  calldata: `0x${string}`,
  value?: bigint,
): Promise<string> {
  validateChain(account);
  const tx = prepareTransaction({
    client: thirdwebClient,
    chain: CHAIN,
    to: contractAddress,
    data: calldata,
    ...(value !== undefined ? { value } : {}),
  });
  const result = await sendTransaction({ account, transaction: tx });
  const txHash = result.transactionHash;
  await waitForReceipt({ client: thirdwebClient, chain: CHAIN, transactionHash: txHash as `0x${string}` });
  return txHash;
}

export function parseProjectCreatedEvent(
  logs: readonly { topics: readonly string[]; data: string; address: string }[],
  txHash: string,
): V2ContractAddresses {
  for (const log of logs) {
    if (log.address.toLowerCase() !== BLOCKCHAIN_CONFIG.CONTRACTS.PLATFORM_V2.toLowerCase()) continue;
    try {
      const decoded = decodeEventLog({
        abi: PlatformV2Abi as Parameters<typeof decodeEventLog>[0]['abi'],
        eventName: 'ProjectCreated',
        topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
        data: log.data as `0x${string}`,
      });
      const args = decoded.args as { id: bigint; vault: string; module: string; token: string; governance: string; milestones: string; disputes: string };
      return {
        blockchain_project_id: args.id.toString(),
        vault: args.vault,
        module: args.module,
        token: args.token,
        governance: args.governance,
        milestones: args.milestones,
        disputes: args.disputes,
        tx_hash: txHash,
      };
    } catch {
      continue;
    }
  }
  throw new Error('No se encontró evento ProjectCreated en el receipt');
}
