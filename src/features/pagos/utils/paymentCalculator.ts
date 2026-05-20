export const NETWORK_FEE_USDT = 0.005;
const CRYPTO_FEE_PCT = 0.03;

export interface CryptoCalc {
  conversion: number;
  fee: number;
  total: number;
}

export function calculateCryptoTotal(cryptoAmount: string): CryptoCalc {
  const parsed = parseFloat(cryptoAmount);
  if (!cryptoAmount || isNaN(parsed) || parsed <= 0) {
    return { conversion: 0, fee: 0, total: 0 };
  }
  const conversion = parsed;
  const fee = conversion * CRYPTO_FEE_PCT;
  return { conversion, fee, total: conversion + fee };
}
