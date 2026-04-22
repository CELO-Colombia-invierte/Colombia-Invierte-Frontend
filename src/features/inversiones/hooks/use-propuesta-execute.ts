import { useCallback, useState } from 'react';
import { getContract, prepareContractCall, sendTransaction } from 'thirdweb';
import { useActiveAccount } from 'thirdweb/react';
import { thirdwebClient } from '@/app/App';
import { CHAIN } from '@/contracts/config';

export function usePropuestaExecute() {
  const account = useActiveAccount();
  const [isExecuting, setIsExecuting] = useState(false);

  const execute = useCallback(
    async (governanceAddress: string, proposalChainId: string): Promise<string> => {
      if (!account) throw new Error('Wallet no conectada');

      const contract = getContract({
        client: thirdwebClient,
        chain: CHAIN,
        address: governanceAddress,
      });

      const tx = prepareContractCall({
        contract,
        method: 'function execute(uint256 id)',
        params: [BigInt(proposalChainId)],
      });

      setIsExecuting(true);
      try {
        const result = await sendTransaction({ transaction: tx, account });
        return result.transactionHash;
      } finally {
        setIsExecuting(false);
      }
    },
    [account],
  );

  return { execute, isExecuting };
}
