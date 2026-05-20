import { readContract, prepareContractCall, encode, sendTransaction } from 'thirdweb';
import type { Account } from 'thirdweb/wallets';
import { contractAt, sendWithFeeCurrency, validateChain } from './core';
import type { TokenizacionConfig, TokenizacionState } from './types';

export async function getTokenizacionConfig(contractAddress: string): Promise<TokenizacionConfig> {
  const result = await readContract({
    contract: contractAt(contractAddress),
    method: 'function config() view returns (address paymentToken, uint256 pricePerToken, uint256 totalTokens, uint256 saleStart, uint256 saleDuration)',
  });
  const [paymentToken, pricePerToken, totalTokens, saleStart, saleDuration] = result as [string, bigint, bigint, bigint, bigint];
  return { paymentToken, pricePerToken, totalTokens, saleStart, saleDuration };
}

export async function getTokenizacionState(contractAddress: string): Promise<TokenizacionState> {
  const contract = contractAt(contractAddress);
  const [tokensSold, fundsCollected, isSaleActive, saleFinalized, projectTokenAddress] = await Promise.all([
    readContract({ contract, method: 'function tokensSold() view returns (uint256)' }),
    readContract({ contract, method: 'function fundsCollected() view returns (uint256)' }),
    readContract({ contract, method: 'function isSaleActive() view returns (bool)' }),
    readContract({ contract, method: 'function saleFinalized() view returns (bool)' }),
    readContract({ contract, method: 'function projectToken() view returns (address)' }).catch(() => null),
  ]);
  return {
    tokensSold: tokensSold as bigint,
    fundsCollected: fundsCollected as bigint,
    isSaleActive: isSaleActive as boolean,
    saleFinalized: saleFinalized as boolean,
    projectTokenAddress: (projectTokenAddress as string | null) ?? null,
  };
}

export async function depositToNatillera(account: Account, contractAddress: string): Promise<string> {
  const contractCall = prepareContractCall({ contract: contractAt(contractAddress), method: 'function deposit()' });
  const calldata = await encode(contractCall);
  return sendWithFeeCurrency(account, contractAddress, calldata);
}

export async function buyTokens(account: Account, contractAddress: string, amount: bigint): Promise<string> {
  const tx = prepareContractCall({
    contract: contractAt(contractAddress),
    method: 'function buyTokens(uint256 amount) payable',
    params: [amount],
  });
  validateChain(account);
  const result = await sendTransaction({ account, transaction: tx });
  return result.transactionHash;
}
