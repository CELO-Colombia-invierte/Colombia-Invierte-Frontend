import { celoSepoliaTestnet } from 'thirdweb/chains';

export const CHAIN = celoSepoliaTestnet;

export const BLOCKCHAIN_CONFIG = {
  CHAIN_ID: 11142220,
  RPC_URL: 'https://forno.celo-sepolia.celo-testnet.org',
  NETWORK_NAME: 'Celo Sepolia Testnet',
  BLOCK_EXPLORER: 'https://sepolia.celoscan.io',

  CONTRACTS: {
    PLATFORM_V2: '0x05e383Db1F080D3662ecb49f32c6715e6F6d32Ed',
    FEE_MANAGER: '0xA28eBC51cEe3b508d2C0440D992E170563fbE3C3',
    FEE_TREASURY: '0xACfc21A8b59d12d8b4ccE4Eff0E98474afcf6eB2',
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
