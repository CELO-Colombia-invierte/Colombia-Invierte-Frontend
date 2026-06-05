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
  FundingTargetReached: 'El monto supera el cupo restante del proyecto.',
  SaleClosed: 'La etapa de inversión ya está cerrada.',
  SaleNotEnded: 'La etapa de inversión todavía no ha terminado. Espera a que se cumpla el plazo.',
  SaleNotClosed: 'La etapa de inversión aún está abierta. Ciérrala antes de continuar.',
  AlreadyFinalized: 'La etapa de inversión ya fue cerrada anteriormente.',
  DistributionEnded: 'La entrega de rendimientos ya finalizó.',
  NothingToClaim: 'No tienes rendimientos disponibles para cobrar.',
  ZeroAmount: 'El monto debe ser mayor a 0.',
  BelowMinimumCap: 'El monto está por debajo del mínimo permitido.',
  InvalidAmount: 'Monto inválido.',
  InsufficientBalance: 'El fondo del proyecto no tiene dinero suficiente para esta operación.',
  Unauthorized: 'No tienes permiso para esta acción. Solo el responsable del proyecto o el grupo pueden hacerla.',
  VaultPaused: 'El fondo del proyecto está en pausa por un reclamo. El grupo debe reactivarlo para continuar.',
  EnforcedPause: 'El fondo del proyecto está en pausa por un reclamo. Para volver a operar, el grupo debe votar por reactivarlo.',
  ExpectedPause: 'El fondo del proyecto no está en pausa — esta acción solo aplica cuando lo está.',
  InvalidVaultState: 'El estado actual del proyecto no permite esta operación.',
  InvalidState: 'El proyecto no está en el estado correcto para esta acción.',
  InvalidDispute: 'El reclamo ya no existe o fue resuelto. Abre uno nuevo si necesitas reclamar algo.',
  DisputeAlreadyResolved: 'Este reclamo ya fue resuelto y no se puede modificar.',
  DisputeNotFrozen: 'El fondo no está en pausa por este reclamo.',
  MilestoneNotFound: 'La etapa no existe en este proyecto.',
  MilestoneAlreadyExecuted: 'Esta etapa ya fue pagada.',
  MilestoneAlreadyCancelled: 'Esta etapa ya fue cancelada.',
  ExceedsProjectFunds: 'El monto supera el dinero disponible del proyecto.',
  AlreadyVoted: 'Ya votaste en esta votación.',
  VotingClosed: 'El tiempo para votar ya cerró.',
  VotingStillOpen: 'La votación aún está abierta. Espera a que cierre antes de continuar.',
  QuorumNotReached: 'No se reunieron los votos necesarios.',
  AlreadyExecuted: 'Esta votación ya se ejecutó.',
  ProposalRejected: 'La votación fue rechazada — ganaron los votos en contra.',
  NoVotingPower: 'Activa tu voto antes de votar.',
  ZeroAddress: 'Faltan datos para esta operación.',
  TransferFailed: 'El pago no se pudo completar. Verifica tu saldo e intenta de nuevo.',
  AllowanceInsufficient: 'Falta autorizar el pago antes de continuar.',
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
    return REVENUE_ERROR_MESSAGES_ES[decoded.errorName] ?? 'No se pudo completar la operación. Verifica el estado del proyecto o escribe a soporte.';
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
