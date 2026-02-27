import { celoSepoliaTestnet } from 'thirdweb/chains';

export const CHAIN = celoSepoliaTestnet;

export const BLOCKCHAIN_CONFIG = {
  CHAIN_ID: 11142220,
  RPC_URL: 'https://forno.celo-sepolia.celo-testnet.org',
  NETWORK_NAME: 'Celo Sepolia Testnet',
  BLOCK_EXPLORER: 'https://sepolia.celoscan.io',

  CONTRACTS: {
    PLATFORM_V2: '0xd6BA650Fb9426508707E77e8fb58037B39723F69',
    FEE_MANAGER: '0x36e23fE797F04C5197A713B29508C80b5b9f25aa',
    FEE_TREASURY: '0x8392dD63883Fc5566e54B3431E35bA100D10Ae86',
  },
  PAYMENT_TOKEN_ADDRESS: '0x01c5c0122039549ad1493b8220cabedd739bc44e',
  PAYMENT_TOKEN_DECIMALS: 6,
  COP_TO_USDT_RATE: 3650,
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
