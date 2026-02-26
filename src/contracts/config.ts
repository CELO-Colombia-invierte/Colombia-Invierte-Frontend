import { celoSepoliaTestnet, celo } from 'thirdweb/chains';

const chainId = Number(import.meta.env.VITE_CHAIN_ID ?? 11142220);
export const CHAIN = chainId === 42220 ? celo : celoSepoliaTestnet;

export const BLOCKCHAIN_CONFIG = {
  CHAIN_ID: chainId,
  RPC_URL: import.meta.env.VITE_RPC_URL as string,
  NETWORK_NAME: import.meta.env.VITE_NETWORK_NAME as string,
  BLOCK_EXPLORER: import.meta.env.VITE_BLOCK_EXPLORER as string,

  CONTRACTS: {
    PLATFORM: import.meta.env.VITE_CONTRACT_PLATFORM as string,
    NATILLERA_IMPL: import.meta.env.VITE_CONTRACT_NATILLERA_IMPL as string,
    TOKENIZACION_IMPL: import.meta.env.VITE_CONTRACT_TOKENIZACION_IMPL as string,
  },

  PAYMENT_TOKEN_ADDRESS: import.meta.env.VITE_PAYMENT_TOKEN_ADDRESS as string,
  PAYMENT_TOKEN_DECIMALS: Number(import.meta.env.VITE_PAYMENT_TOKEN_DECIMALS ?? 6),
  COP_TO_USDT_RATE: Number(import.meta.env.VITE_COP_TO_USDT_RATE ?? 3650),
} as const;

export const getBlockExplorerTxUrl = (txHash: string) =>
  `${BLOCKCHAIN_CONFIG.BLOCK_EXPLORER}/tx/${txHash}`;

export const getBlockExplorerAddressUrl = (address: string) =>
  `${BLOCKCHAIN_CONFIG.BLOCK_EXPLORER}/address/${address}`;
