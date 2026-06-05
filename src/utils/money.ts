import { BLOCKCHAIN_CONFIG } from '@/contracts/config';

const RATE = BLOCKCHAIN_CONFIG.COP_TO_USDT_RATE;
const DECIMALS = BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS;

export const copToUsdc = (cop: number): number => cop / RATE;

export const usdcToCop = (usdc: number): number => usdc * RATE;

export const usdcRawToCop = (raw: bigint): number =>
  (Number(raw) / 10 ** DECIMALS) * RATE;

export const copToUsdcRaw = (cop: number): bigint =>
  BigInt(Math.round(copToUsdc(cop) * 10 ** DECIMALS));

export const formatCOP = (cop: number): string =>
  `$ ${Math.round(cop).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;

export const formatUsdcAsCop = (usdc: number): string => formatCOP(usdcToCop(usdc));

export const formatUsdcRawAsCop = (raw: bigint): string => formatCOP(usdcRawToCop(raw));
