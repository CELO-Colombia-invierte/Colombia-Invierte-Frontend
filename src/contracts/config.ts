import { celoSepoliaTestnet } from 'thirdweb/chains';

export const CHAIN = celoSepoliaTestnet;

export const BLOCKCHAIN_CONFIG = {
  CHAIN_ID: 11142220,
  RPC_URL: 'https://forno.celo-sepolia.celo-testnet.org',
  NETWORK_NAME: 'Celo Sepolia Testnet',
  BLOCK_EXPLORER: 'https://sepolia.celoscan.io',

  CONTRACTS: {
    PLATFORM: '0xbe919DccE1218E2C5e17dc3409aEb3EF38f049A4',
    NATILLERA_IMPL: '0x86512228C805dDa61CE8Fd206e102f2D3896eC32',
    TOKENIZACION_IMPL: '0x4aC6D7F58Dba458eA74179c826378B5ba5fB3179',
  },
  // Dirección del token de pago (USDT mock en Celo Sepolia).
  // ⚠️ Reemplazar con la dirección real del token de prueba que se use en el entorno.
  PAYMENT_TOKEN_ADDRESS: '0x01c5c0122039549ad1493b8220cabedd739bc44e', // USDC en Celo Sepolia Testnet
  PAYMENT_TOKEN_DECIMALS: 6,
  // Tasa de conversión COP → USDT para calcular montos on-chain (solo para MVP/testnet).
  COP_TO_USDT_RATE: 3650,
} as const;

export const getBlockExplorerTxUrl = (txHash: string) =>
  `${BLOCKCHAIN_CONFIG.BLOCK_EXPLORER}/tx/${txHash}`;

export const getBlockExplorerAddressUrl = (address: string) =>
  `${BLOCKCHAIN_CONFIG.BLOCK_EXPLORER}/address/${address}`;
