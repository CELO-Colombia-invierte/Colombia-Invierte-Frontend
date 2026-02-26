import { celoSepoliaTestnet, celo } from 'thirdweb/chains';

const chainId = Number(import.meta.env.VITE_CHAIN_ID ?? 11142220);
export const CHAIN = chainId === 42220 ? celo : celoSepoliaTestnet;

export const BLOCKCHAIN_CONFIG = {
  CHAIN_ID: chainId,
  RPC_URL: import.meta.env.VITE_RPC_URL as string,
  NETWORK_NAME: import.meta.env.VITE_NETWORK_NAME as string,
  BLOCK_EXPLORER: import.meta.env.VITE_BLOCK_EXPLORER as string,

  CONTRACTS: {
    PLATFORM_V2: import.meta.env.VITE_CONTRACT_PLATFORM_V2 as string,
    FEE_MANAGER: import.meta.env.VITE_CONTRACT_FEE_MANAGER as string,
    FEE_TREASURY: import.meta.env.VITE_CONTRACT_FEE_TREASURY as string,
  },

  PAYMENT_TOKEN_ADDRESS: import.meta.env.VITE_PAYMENT_TOKEN_ADDRESS as string,
  PAYMENT_TOKEN_DECIMALS: Number(import.meta.env.VITE_PAYMENT_TOKEN_DECIMALS ?? 6),
  COP_TO_USDT_RATE: Number(import.meta.env.VITE_COP_TO_USDT_RATE ?? 3650),
} as const;

export { default as PlatformV2Abi } from './abis/PlatformV2.json';
export { default as ProjectVaultAbi } from './abis/ProjectVault.json';
export { default as RevenueModelV2Abi } from './abis/RevenueModelV2.json';
export { default as NatilleraV2Abi } from './abis/NatilleraV2.json';
export { default as MilestonesModuleAbi } from './abis/MilestonesModule.json';
export { default as GovernanceModuleAbi } from './abis/GovernanceModule.json';
export { default as DisputesModuleAbi } from './abis/DisputesModule.json';
export { default as ProjectTokenV2Abi } from './abis/ProjectTokenv2.json';
export { default as FeeManagerAbi } from './abis/Feemanager.json';
export { default as FeeTreasuryAbi } from './abis/FeeTreasury.json';

export const getBlockExplorerTxUrl = (txHash: string) =>
  `${BLOCKCHAIN_CONFIG.BLOCK_EXPLORER}/tx/${txHash}`;

export const getBlockExplorerAddressUrl = (address: string) =>
  `${BLOCKCHAIN_CONFIG.BLOCK_EXPLORER}/address/${address}`;
