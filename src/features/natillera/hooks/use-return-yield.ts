import { useCallback, useState } from 'react';
import { getContract, prepareContractCall, sendTransaction, toUnits, waitForReceipt } from 'thirdweb';
import { useActiveAccount } from 'thirdweb/react';
import { thirdwebClient } from '@/app/App';
import { CHAIN, BLOCKCHAIN_CONFIG } from '@/contracts/config';

export interface ReturnYieldReceipt {
  txHash: string;
  blockNumber: bigint;
  gasUsed: bigint;
  from: string;
}

export function useReturnYield() {
  const account = useActiveAccount();
  const [isSending, setIsSending] = useState(false);

  const returnYield = useCallback(
    async (
      natilleraAddress: string,
      vaultAddress: string,
      amountUsdc: number,
      source: string,
    ): Promise<ReturnYieldReceipt> => {
      if (!account) throw new Error('Wallet no conectada');
      setIsSending(true);
      try {
        const amount = toUnits(
          amountUsdc.toFixed(BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS),
          BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS,
        );

        const usdc = getContract({
          client: thirdwebClient,
          chain: CHAIN,
          address: BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS,
        });
        const approveTx = prepareContractCall({
          contract: usdc,
          method: 'function approve(address spender, uint256 amount) returns (bool)',
          params: [vaultAddress, amount],
        });
        const approveResult = await sendTransaction({ transaction: approveTx, account });
        await waitForReceipt({
          client: thirdwebClient,
          chain: CHAIN,
          transactionHash: approveResult.transactionHash as `0x${string}`,
        });

        const natillera = getContract({
          client: thirdwebClient,
          chain: CHAIN,
          address: natilleraAddress,
        });
        const tx = prepareContractCall({
          contract: natillera,
          method: 'function returnYield(uint256 amount, address source)',
          params: [amount, source],
        });
        const result = await sendTransaction({ transaction: tx, account });
        const receipt = await waitForReceipt({
          client: thirdwebClient,
          chain: CHAIN,
          transactionHash: result.transactionHash as `0x${string}`,
        });
        return {
          txHash: result.transactionHash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed,
          from: account.address,
        };
      } finally {
        setIsSending(false);
      }
    },
    [account],
  );

  return { returnYield, isSending };
}
