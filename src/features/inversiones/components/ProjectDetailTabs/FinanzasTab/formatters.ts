import { formatUnits } from '@/services/blockchain/formatting';
import { BLOCKCHAIN_CONFIG } from '@/contracts/config';

export function formatCurrency(amount: number): string {
  return Number(amount).toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatUsdc(value: bigint): string {
  return formatUnits(value, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS);
}

export function formatTokens(value: bigint, projectTokenDecimals: number | null): string {
  if (projectTokenDecimals !== null && projectTokenDecimals > 0) {
    return formatUnits(value, projectTokenDecimals);
  }
  return Number(value).toLocaleString('es-CO');
}
