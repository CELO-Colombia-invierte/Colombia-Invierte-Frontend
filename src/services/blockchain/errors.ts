import { decodeErrorResult } from 'viem';
import {
  PlatformV2Abi,
  RevenueModelV2Abi,
  ProjectVaultAbi,
  NatilleraV2Abi,
  MilestonesModuleAbi,
  DisputesModuleAbi,
  FeeManagerAbi,
} from '@/contracts/config';
import GovernanceAbi from '@/contracts/abis/GovernanceModule.json';

const REVENUE_ERROR_MESSAGES_ES: Record<string, string> = {
  FundingTargetReached: 'El monto excede el cupo restante de la tokenización.',
  SaleClosed: 'La venta ya está cerrada.',
  SaleNotEnded: 'La venta todavía no ha terminado. Espera a que se cumpla el plazo.',
  SaleNotClosed: 'La venta aún está abierta. Cierra la recaudación antes de continuar.',
  AlreadyFinalized: 'Esta venta ya fue finalizada anteriormente.',
  DistributionEnded: 'La distribución de rendimientos ya finalizó.',
  NothingToClaim: 'No tienes rendimientos disponibles para cobrar.',
  ZeroAmount: 'El monto debe ser mayor a 0.',
  BelowMinimumCap: 'El monto está por debajo del mínimo permitido.',
  InvalidAmount: 'Monto inválido.',
  InsufficientBalance: 'El vault no tiene fondos suficientes para esta operación.',
  Unauthorized: 'Tu wallet no tiene permiso para hacer esta acción. Solo el creator del proyecto o la gobernanza pueden ejecutarla.',
  VaultPaused: 'La bóveda está pausada por una disputa. Pasa una propuesta de "Descongelar bóveda" en gobernanza para reactivarla.',
  EnforcedPause: 'La bóveda está congelada (probablemente por una disputa aprobada). Para volver a operar, alguien debe proponer "Descongelar bóveda" en gobernanza y que se vote afirmativamente.',
  ExpectedPause: 'La bóveda no está pausada — esta acción solo aplica cuando está congelada.',
  InvalidVaultState: 'El estado actual del proyecto no permite esta operación.',
  InvalidState: 'El proyecto no está en el estado correcto para esta acción.',
  InvalidDispute: 'La disputa referenciada no existe o ya fue resuelta. Abre una nueva si necesitas reclamar algo.',
  DisputeAlreadyResolved: 'Esta disputa ya fue resuelta y no se puede modificar.',
  DisputeNotFrozen: 'La bóveda no está congelada por esta disputa.',
  MilestoneNotFound: 'El hito referenciado no existe en este proyecto.',
  MilestoneAlreadyExecuted: 'Este hito ya fue ejecutado previamente.',
  MilestoneAlreadyCancelled: 'Este hito ya fue cancelado.',
  ExceedsProjectFunds: 'El monto supera lo disponible en el capital del proyecto (los rendimientos no se cuentan).',
  AlreadyVoted: 'Ya votaste en esta propuesta.',
  VotingClosed: 'El período de votación ya cerró para esta propuesta.',
  VotingStillOpen: 'La votación aún está abierta. Espera a que cierre antes de ejecutar.',
  QuorumNotReached: 'No se alcanzó el quórum mínimo de votación.',
  AlreadyExecuted: 'Esta propuesta ya fue ejecutada.',
  ProposalRejected: 'La propuesta fue rechazada — ganaron los votos en contra.',
  NoVotingPower: 'Tu wallet no tiene tokens delegados para votar. Activa tu poder de voto primero.',
  ZeroAddress: 'La dirección no puede ser la dirección cero (0x0000…).',
  TransferFailed: 'La transferencia de USDC falló. Verifica tu balance y la aprobación.',
  AllowanceInsufficient: 'Necesitas aprobar más USDC antes de continuar.',
};

const KNOWN_SELECTORS_TO_ERROR_NAME: Record<string, string> = {
  '0x82b42900': 'Unauthorized',
  '0x88c081c7': 'VotingStillOpen',
  '0x66b6cb4a': 'VotingClosed',
  '0x7c9a1cf9': 'AlreadyVoted',
  '0x0dc10197': 'AlreadyExecuted',
  '0xaa26a693': 'QuorumNotReached',
  '0xd5dd0c66': 'InvalidVote',
  '0x0bd3e45f': 'InvalidDisbursement',
  '0xee032808': 'InvalidProposal',
  '0xda9f8b34': 'VaultPaused',
  '0x194b573d': 'InvalidVaultState',
  '0xdace2af6': 'FundingTargetReached',
  '0xd92e233d': 'ZeroAddress',
};

function combinedRevertAbi(): readonly unknown[] {
  return [
    ...(RevenueModelV2Abi as unknown[]),
    ...(ProjectVaultAbi as unknown[]),
    ...(NatilleraV2Abi as unknown[]),
    ...(MilestonesModuleAbi as unknown[]),
    ...(DisputesModuleAbi as unknown[]),
    ...(FeeManagerAbi as unknown[]),
    ...(PlatformV2Abi as unknown[]),
    ...(GovernanceAbi as unknown[]),
  ];
}

function extractRevertData(err: unknown): `0x${string}` | null {
  const visited = new Set<unknown>();
  const stack: unknown[] = [err];
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== 'object' || visited.has(node)) continue;
    visited.add(node);
    const anyNode = node as Record<string, unknown>;
    const data = anyNode.data;
    if (typeof data === 'string' && /^0x[0-9a-fA-F]{8,}$/.test(data)) return data as `0x${string}`;
    for (const key of ['cause', 'error', 'reason', 'info']) {
      if (anyNode[key]) stack.push(anyNode[key]);
    }
  }
  const msg = (err as { message?: string })?.message ?? '';
  const matches = msg.match(/0x[0-9a-fA-F]{8,}/g);
  if (!matches || matches.length === 0) return null;
  const longest = matches.reduce((a, b) => (b.length > a.length ? b : a));
  return longest as `0x${string}`;
}

export function decodeContractRevert(err: unknown): string | null {
  const data = extractRevertData(err);
  if (!data) return null;
  try {
    const decoded = decodeErrorResult({ abi: combinedRevertAbi() as never, data });
    return REVENUE_ERROR_MESSAGES_ES[decoded.errorName] ?? `La operación falló en la blockchain (${decoded.errorName}). Verifica el estado del proyecto o contacta al equipo.`;
  } catch {
    const selector = data.slice(0, 10).toLowerCase();
    const errorName = KNOWN_SELECTORS_TO_ERROR_NAME[selector];
    if (errorName) {
      return REVENUE_ERROR_MESSAGES_ES[errorName] ?? `Error del contrato: ${errorName}`;
    }
    return null;
  }
}

export function decodeContractRevertRaw(err: unknown): string | null {
  const data = extractRevertData(err);
  if (!data) return null;
  const selector = data.slice(0, 10).toLowerCase();
  try {
    const decoded = decodeErrorResult({ abi: combinedRevertAbi() as never, data });
    const args = (decoded.args ?? []).map((a) => (typeof a === 'bigint' ? a.toString() : String(a))).join(', ');
    return `${decoded.errorName}(${args}) [${selector}]`;
  } catch {
    const known = KNOWN_SELECTORS_TO_ERROR_NAME[selector];
    if (known) return `${known}() [${selector}]`;
    return `revert [${selector}]`;
  }
}
