export function formatUnits(value: bigint, decimals: number, displayDecimals = 2): string {
  const divisor = BigInt(10 ** decimals);
  const intPart = value / divisor;
  const remainder = value % divisor;
  const decPart = remainder.toString().padStart(decimals, '0').slice(0, displayDecimals);
  return `${intPart}.${decPart}`;
}

export function formatUnitsExact(value: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const intPart = value / divisor;
  const remainder = value % divisor;
  if (remainder === 0n) return `${intPart}`;
  const decPart = remainder.toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${intPart}.${decPart}`;
}

export function parseUnits(value: string, decimals: number): bigint {
  const cleaned = String(value ?? '').trim().replace(',', '.').replace(/\s+/g, '');
  if (!cleaned || !/^-?\d*(\.\d*)?$/.test(cleaned)) {
    throw new Error(`parseUnits: valor inválido "${value}"`);
  }
  const [int, dec = ''] = cleaned.split('.');
  const decPadded = dec.padEnd(decimals, '0').slice(0, decimals);
  const intPart = int === '' || int === '-' ? '0' : int;
  return BigInt(intPart + decPadded);
}
