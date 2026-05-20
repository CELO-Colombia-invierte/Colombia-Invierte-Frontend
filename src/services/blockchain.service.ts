import { getContract, readContract, prepareContractCall, sendTransaction, encode, prepareTransaction, waitForReceipt } from 'thirdweb';
import { decodeEventLog, decodeErrorResult } from 'viem';
import { getRpcClient, eth_getBalance } from 'thirdweb/rpc';
import type { Account } from 'thirdweb/wallets';
import { thirdwebClient } from '@/app/App';
import {
  CHAIN,
  BLOCKCHAIN_CONFIG,
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

export function decodeContractRevert(err: unknown): string | null {
  const data = extractRevertData(err);
  console.log('[decodeContractRevert] data extraída:', data);
  if (!data) return null;
  try {
    const decoded = decodeErrorResult({ abi: combinedRevertAbi() as never, data });
    console.log('[decodeContractRevert] viem decodificó:', decoded.errorName);
    return REVENUE_ERROR_MESSAGES_ES[decoded.errorName] ?? `La operación falló en la blockchain (${decoded.errorName}). Verifica el estado del proyecto o contacta al equipo.`;
  } catch (decodeErr) {
    console.warn('[decodeContractRevert] viem falló, usando tabla local. Error:', decodeErr);
    const selector = data.slice(0, 10).toLowerCase();
    const errorName = KNOWN_SELECTORS_TO_ERROR_NAME[selector];
    if (errorName) {
      console.log('[decodeContractRevert] selector', selector, '→', errorName);
      return REVENUE_ERROR_MESSAGES_ES[errorName] ?? `Error del contrato: ${errorName}`;
    }
    console.warn('[decodeContractRevert] selector desconocido:', selector);
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

export interface NatilleraConfig {
  paymentToken: string;
  monthlyContribution: bigint;
  totalMonths: bigint;
  maxMembers: bigint;
}

export interface NatilleraState {
  currentCycle: bigint;
  totalCollected: bigint;
  isFinalized: boolean;
  memberCount: number;
}

export interface NatilleraV2State {
  currentMonth: bigint;
  quota: bigint;
  duration: bigint;
  isMatured: boolean;
  poolFinalized: boolean;
  memberCount: bigint;
}

export interface TokenizacionConfig {
  paymentToken: string;
  pricePerToken: bigint;
  totalTokens: bigint;
  saleStart: bigint;
  saleDuration: bigint;
}

export interface TokenizacionState {
  tokensSold: bigint;
  fundsCollected: bigint;
  isSaleActive: boolean;
  saleFinalized: boolean;
  projectTokenAddress: string | null;
}

export interface RevenueModuleState {
  totalRaised: bigint;
  fundingTarget: bigint;
  minimumCap: bigint;
  tokenPrice: bigint;
  saleFinalized: boolean;
  state: number;
  distributionEnd: bigint;
  pendingRevenue: bigint;
}

export interface DeployNatilleraV2Params {
  settlementToken: string;
  quota: bigint;
  duration: bigint;
  maxMembers: bigint;
}

export interface DeployTokenizacionV2Params {
  settlementToken: string;
  fundingTarget: bigint;
  minimumCap: bigint;
  tokenPrice: bigint;
  saleDuration: bigint;
  name: string;
  symbol: string;
}

export interface V2ContractAddresses {
  blockchain_project_id: string;
  vault: string;
  module: string;
  token: string;
  governance: string;
  milestones: string;
  disputes: string;
  tx_hash: string;
}

class BlockchainService {

  private validateChain(account: Account): void {
    const walletChainId = (account as any).chainId ?? (account as any).chain?.id;
    if (walletChainId && walletChainId !== BLOCKCHAIN_CONFIG.CHAIN_ID) {
      throw new Error(
        `Red incorrecta. Por favor cambia a ${BLOCKCHAIN_CONFIG.NETWORK_NAME} (Chain ID: ${BLOCKCHAIN_CONFIG.CHAIN_ID})`,
      );
    }
  }

  private async sendWithFeeCurrency(account: Account, contractAddress: string, calldata: `0x${string}`, value?: bigint): Promise<string> {
    this.validateChain(account);
    const tx = prepareTransaction({
      client: thirdwebClient,
      chain: CHAIN,
      to: contractAddress,
      data: calldata,
      ...(value !== undefined ? { value } : {}),
    });
    const result = await sendTransaction({ account, transaction: tx });
    const txHash = result.transactionHash;
    await waitForReceipt({ client: thirdwebClient, chain: CHAIN, transactionHash: txHash as `0x${string}` });
    return txHash;
  }


  async deployNatilleraV2(
    account: Account,
    params: DeployNatilleraV2Params,
  ): Promise<V2ContractAddresses> {
    const contract = getContract({
      client: thirdwebClient,
      chain: CHAIN,
      address: BLOCKCHAIN_CONFIG.CONTRACTS.PLATFORM_V2,
    });

    const contractCall = prepareContractCall({
      contract,
      method: 'function createNatilleraProject(address settlementToken, uint256 quota, uint256 duration, uint256 maxMembers) returns (uint256 id)',
      params: [params.settlementToken, params.quota, params.duration, params.maxMembers],
    });

    const calldata = await encode(contractCall);
    const txHash = await this.sendWithFeeCurrency(account, BLOCKCHAIN_CONFIG.CONTRACTS.PLATFORM_V2, calldata);
    const receipt = await waitForReceipt({ client: thirdwebClient, chain: CHAIN, transactionHash: txHash as `0x${string}` });

    const addresses = this.parseProjectCreatedEvent(receipt.logs, txHash);
    console.log('[CREATE_NATILLERA] signer wallet:', account.address);
    console.log('[CREATE_NATILLERA] natillera address:', addresses.module);
    await this.joinNatilleraAsCreator(account, addresses.module);
    return addresses;
  }

  async deployTokenizacionV2(
    account: Account,
    params: DeployTokenizacionV2Params,
  ): Promise<V2ContractAddresses> {
    const contract = getContract({
      client: thirdwebClient,
      chain: CHAIN,
      address: BLOCKCHAIN_CONFIG.CONTRACTS.PLATFORM_V2,
    });

    const contractCall = prepareContractCall({
      contract,
      method: 'function createTokenizationProject(address settlementToken, uint256 fundingTarget, uint256 minimumCap, uint256 tokenPrice, uint256 saleDuration, string name, string symbol) returns (uint256 id)',
      params: [params.settlementToken, params.fundingTarget, params.minimumCap, params.tokenPrice, params.saleDuration, params.name, params.symbol],
    });

    const calldata = await encode(contractCall);
    const txHash = await this.sendWithFeeCurrency(account, BLOCKCHAIN_CONFIG.CONTRACTS.PLATFORM_V2, calldata);
    const receipt = await waitForReceipt({ client: thirdwebClient, chain: CHAIN, transactionHash: txHash as `0x${string}` });

    const addresses = this.parseProjectCreatedEvent(receipt.logs, txHash);
    return addresses;
  }

  private async joinNatilleraAsCreator(account: Account, natilleraAddress: string): Promise<void> {
    const natillera = getContract({ client: thirdwebClient, chain: CHAIN, address: natilleraAddress });
    const tx = prepareContractCall({
      contract: natillera,
      method: 'function join()',
      params: [],
    });
    const data = await encode(tx);
    await this.sendWithFeeCurrency(account, natilleraAddress, data);
  }

  private parseProjectCreatedEvent(logs: readonly { topics: readonly string[]; data: string; address: string }[], txHash: string): V2ContractAddresses {
    for (const log of logs) {
      if (log.address.toLowerCase() !== BLOCKCHAIN_CONFIG.CONTRACTS.PLATFORM_V2.toLowerCase()) continue;
      try {
        const decoded = decodeEventLog({
          abi: PlatformV2Abi as Parameters<typeof decodeEventLog>[0]['abi'],
          eventName: 'ProjectCreated',
          topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
          data: log.data as `0x${string}`,
        });
        const args = decoded.args as { id: bigint; vault: string; module: string; token: string; governance: string; milestones: string; disputes: string };
        return {
          blockchain_project_id: args.id.toString(),
          vault: args.vault,
          module: args.module,
          token: args.token,
          governance: args.governance,
          milestones: args.milestones,
          disputes: args.disputes,
          tx_hash: txHash,
        };
      } catch {
        continue;
      }
    }
    throw new Error('No se encontró evento ProjectCreated en el receipt');
  }


  async approveToken(
    account: Account,
    tokenAddress: string,
    spenderAddress: string,
    amount: bigint,
  ): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: tokenAddress });

    const contractCall = prepareContractCall({
      contract,
      method: 'function approve(address spender, uint256 amount) returns (bool)',
      params: [spenderAddress, amount],
    });

    const calldata = await encode(contractCall);
    return this.sendWithFeeCurrency(account, tokenAddress, calldata);
  }


  async investInProject(
    account: Account,
    revenueAddress: string,
    amount: bigint,
    vaultAddress?: string,
  ): Promise<string> {
    if (!vaultAddress) {
      throw new Error('vaultAddress es requerido para invertir (approve va al vault, no al revenue module).');
    }
    await this.approveToken(account, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS, vaultAddress, amount);

    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: revenueAddress });
    const contractCall = prepareContractCall({
      contract,
      method: 'function invest(uint256 amount)',
      params: [amount],
    });

    const calldata = await encode(contractCall);
    let txHash: string;
    try {
      txHash = await this.sendWithFeeCurrency(account, revenueAddress, calldata);
    } catch (err) {
      const friendly = decodeContractRevert(err);
      if (friendly) throw new Error(friendly);
      throw err;
    }
    try {
      const tokenAddr = await this.getProjectTokenAddress(revenueAddress);
      const currentDelegate = await this.getDelegate(tokenAddr, account.address);
      if (currentDelegate === '0x0000000000000000000000000000000000000000') {
        await this.delegateToSelf(account, tokenAddr);
      }
    } catch (err) {
      console.warn('[invest] auto-delegate falló (no es crítico):', err);
    }

    return txHash;
  }

  async claimRendimientos(account: Account, revenueAddress: string): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: revenueAddress });
    const contractCall = prepareContractCall({ contract, method: 'function claim()' });
    const calldata = await encode(contractCall);
    return this.sendWithFeeCurrency(account, revenueAddress, calldata);
  }

  async getPendingRewards(revenueAddress: string, userAddress: string): Promise<bigint> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: revenueAddress });
    return readContract({
      contract,
      method: 'function pending(address user) view returns (uint256)',
      params: [userAddress],
    }) as Promise<bigint>;
  }

  async getRevenueModuleState(revenueAddress: string): Promise<RevenueModuleState> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: revenueAddress });
    const [totalRaised, fundingTarget, minimumCap, tokenPrice, saleFinalized, state, distributionEnd, pendingRevenue] = await Promise.all([
      readContract({ contract, method: 'function totalRaised() view returns (uint128)' }),
      readContract({ contract, method: 'function fundingTarget() view returns (uint128)' }),
      readContract({ contract, method: 'function minimumCap() view returns (uint128)' }),
      readContract({ contract, method: 'function tokenPrice() view returns (uint128)' }),
      readContract({ contract, method: 'function saleFinalized() view returns (bool)' }),
      readContract({ contract, method: 'function state() view returns (uint8)' }),
      readContract({ contract, method: 'function distributionEnd() view returns (uint64)' }).catch(() => 0n),
      readContract({ contract, method: 'function pendingRevenue() view returns (uint256)' }).catch(() => 0n),
    ]);
    return {
      totalRaised: totalRaised as bigint,
      fundingTarget: fundingTarget as bigint,
      minimumCap: minimumCap as bigint,
      tokenPrice: tokenPrice as bigint,
      saleFinalized: saleFinalized as boolean,
      state: Number(state),
      distributionEnd: BigInt(distributionEnd as bigint | number),
      pendingRevenue: pendingRevenue as bigint,
    };
  }

  async getInvestment(revenueAddress: string, userAddress: string): Promise<bigint> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: revenueAddress });
    return readContract({
      contract,
      method: 'function investments(address) view returns (uint256)',
      params: [userAddress],
    }) as Promise<bigint>;
  }


  async joinNatilleraOnChain(account: Account, natilleraAddress: string): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: natilleraAddress });
    const contractCall = prepareContractCall({ contract, method: 'function join()' });
    const calldata = await encode(contractCall);
    return this.sendWithFeeCurrency(account, natilleraAddress, calldata);
  }

  async payQuota(
    account: Account,
    natilleraAddress: string,
    vaultAddress: string,
    monthId: bigint,
    amount: bigint,
  ): Promise<string> {
    await this.approveToken(account, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS, vaultAddress, amount);

    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: natilleraAddress });
    const contractCall = prepareContractCall({
      contract,
      method: 'function payQuota(uint256 monthId)',
      params: [monthId],
    });

    const calldata = await encode(contractCall);
    return this.sendWithFeeCurrency(account, natilleraAddress, calldata);
  }

  async claimFinalNatillera(account: Account, natilleraAddress: string): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: natilleraAddress });
    const contractCall = prepareContractCall({ contract, method: 'function claimFinal()' });
    const calldata = await encode(contractCall);
    return this.sendWithFeeCurrency(account, natilleraAddress, calldata);
  }

  async getNatilleraV2State(natilleraAddress: string): Promise<NatilleraV2State> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: natilleraAddress });
    const [currentMonth, quota, duration, isMatured, poolFinalized, memberCount] = await Promise.all([
      readContract({ contract, method: 'function currentMonth() view returns (uint256)' }),
      readContract({ contract, method: 'function quota() view returns (uint256)' }),
      readContract({ contract, method: 'function duration() view returns (uint256)' }),
      readContract({ contract, method: 'function isMatured() view returns (bool)' }),
      readContract({ contract, method: 'function poolFinalized() view returns (bool)' }),
      readContract({ contract, method: 'function memberCount() view returns (uint256)' }),
    ]);
    return {
      currentMonth: currentMonth as bigint,
      quota: quota as bigint,
      duration: duration as bigint,
      isMatured: isMatured as boolean,
      poolFinalized: poolFinalized as boolean,
      memberCount: memberCount as bigint,
    };
  }

  async isNatilleraV2Member(natilleraAddress: string, userAddress: string): Promise<boolean> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: natilleraAddress });
    return readContract({
      contract,
      method: 'function isMember(address) view returns (bool)',
      params: [userAddress],
    }) as Promise<boolean>;
  }

  async hasNatilleraV2Claimed(natilleraAddress: string, userAddress: string): Promise<boolean> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: natilleraAddress });
    return readContract({
      contract,
      method: 'function claimed(address) view returns (bool)',
      params: [userAddress],
    }) as Promise<boolean>;
  }

  async hasNatilleraV2PaidMonth(natilleraAddress: string, userAddress: string, monthId: bigint): Promise<boolean> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: natilleraAddress });
    return readContract({
      contract,
      method: 'function paidMonth(address, uint256) view returns (bool)',
      params: [userAddress, monthId],
    }) as Promise<boolean>;
  }


  async getNatilleraConfig(contractAddress: string): Promise<NatilleraConfig> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: contractAddress });

    const result = await readContract({
      contract,
      method: 'function config() view returns (address token, uint256 monthlyContribution, uint256 totalMonths, uint256 maxMembers)',
    });

    const [token, monthlyContribution, totalMonths, maxMembers] = result as [string, bigint, bigint, bigint];
    return { paymentToken: token, monthlyContribution, totalMonths, maxMembers };
  }

  async getNatilleraState(contractAddress: string): Promise<NatilleraState> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: contractAddress });
    const [currentCycle, totalCollected, isFinalized, members] = await Promise.all([
      readContract({ contract, method: 'function currentCycle() view returns (uint256)' }),
      readContract({ contract, method: 'function totalCollected() view returns (uint256)' }),
      readContract({ contract, method: 'function isFinalized() view returns (bool)' }),
      readContract({ contract, method: 'function members() view returns (address[])' }).catch(() => [] as readonly unknown[]),
    ]);

    return {
      currentCycle: currentCycle as bigint,
      totalCollected: totalCollected as bigint,
      isFinalized: isFinalized as boolean,
      memberCount: (members as string[]).length,
    };
  }

  async isMember(contractAddress: string, userAddress: string): Promise<boolean> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: contractAddress });

    const result = await readContract({
      contract,
      method: 'function isMember(address) view returns (bool)',
      params: [userAddress],
    });
    return result as boolean;
  }


  async getTokenizacionConfig(contractAddress: string): Promise<TokenizacionConfig> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: contractAddress });

    const result = await readContract({
      contract,
      method: 'function config() view returns (address paymentToken, uint256 pricePerToken, uint256 totalTokens, uint256 saleStart, uint256 saleDuration)',
    });

    const [paymentToken, pricePerToken, totalTokens, saleStart, saleDuration] = result as [string, bigint, bigint, bigint, bigint];
    return { paymentToken, pricePerToken, totalTokens, saleStart, saleDuration };
  }

  async getTokenizacionState(contractAddress: string): Promise<TokenizacionState> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: contractAddress });

    const [tokensSold, fundsCollected, isSaleActive, saleFinalized, projectTokenAddress] = await Promise.all([
      readContract({ contract, method: 'function tokensSold() view returns (uint256)' }),
      readContract({ contract, method: 'function fundsCollected() view returns (uint256)' }),
      readContract({ contract, method: 'function isSaleActive() view returns (bool)' }),
      readContract({ contract, method: 'function saleFinalized() view returns (bool)' }),
      readContract({ contract, method: 'function projectToken() view returns (address)' }).catch(() => null),
    ]);

    return {
      tokensSold: tokensSold as bigint,
      fundsCollected: fundsCollected as bigint,
      isSaleActive: isSaleActive as boolean,
      saleFinalized: saleFinalized as boolean,
      projectTokenAddress: (projectTokenAddress as string | null) ?? null,
    };
  }


  async depositToNatillera(account: Account, contractAddress: string): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: contractAddress });
    const contractCall = prepareContractCall({ contract, method: 'function deposit()' });
    const calldata = await encode(contractCall);
    return this.sendWithFeeCurrency(account, contractAddress, calldata);
  }

  async buyTokens(account: Account, contractAddress: string, amount: bigint): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: contractAddress });
    const tx = prepareContractCall({
      contract,
      method: 'function buyTokens(uint256 amount) payable',
      params: [amount],
    });
    this.validateChain(account);
    const result = await sendTransaction({ account, transaction: tx });
    return result.transactionHash;
  }


  async proposeMilestoneCustom(
    account: Account,
    milestonesAddress: string,
    description: string,
    recipient: string,
    amount: bigint,
  ): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: milestonesAddress });
    const tx = prepareContractCall({
      contract,
      method: 'function proposeMilestone(string description, address token, address recipient, uint256 amount) returns (uint256)',
      params: [description, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS as `0x${string}`, recipient as `0x${string}`, amount],
    });
    const calldata = await encode(tx);
    return this.sendWithFeeCurrency(account, milestonesAddress, calldata);
  }

  async getVaultOf(revenueAddress: string): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: revenueAddress });
    return readContract({ contract, method: 'function vault() view returns (address)' }) as Promise<string>;
  }

  async getSettlementTokenOf(revenueAddress: string): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: revenueAddress });
    return readContract({ contract, method: 'function settlementToken() view returns (address)' }) as Promise<string>;
  }

  async getGovernanceOf(revenueAddress: string): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: revenueAddress });
    return readContract({ contract, method: 'function governance() view returns (address)' }) as Promise<string>;
  }

  async getFeeManagerOf(revenueAddress: string): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: revenueAddress });
    return readContract({ contract, method: 'function feeManager() view returns (address)' }) as Promise<string>;
  }

  async getFeeTreasury(feeManagerAddress: string): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: feeManagerAddress });
    return readContract({ contract, method: 'function feeTreasury() view returns (address)' }) as Promise<string>;
  }

  async getRevenueState(revenueAddress: string): Promise<number> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: revenueAddress });
    const v = await readContract({ contract, method: 'function state() view returns (uint8)' });
    return Number(v);
  }

  async getSaleEnd(revenueAddress: string): Promise<bigint> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: revenueAddress });
    return readContract({ contract, method: 'function saleEnd() view returns (uint64)' }) as Promise<bigint>;
  }

  async getProjectFunds(revenueAddress: string): Promise<bigint> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: revenueAddress });
    return readContract({
      contract,
      method: 'function projectFunds() view returns (uint256)',
    }) as Promise<bigint>;
  }

  async getMilestonesCommitted(milestonesAddress: string, tokenAddress: string): Promise<bigint> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: milestonesAddress });
    return readContract({
      contract,
      method: 'function totalRequestedByToken(address) view returns (uint256)',
      params: [tokenAddress],
    }) as Promise<bigint>;
  }

  async getVotingPower(governanceAddress: string, user: string, blockNumber: bigint = 0n): Promise<bigint> {
    const gov = getContract({ client: thirdwebClient, chain: CHAIN, address: governanceAddress });
    const strategyAddress = await readContract({
      contract: gov,
      method: 'function votingStrategy() view returns (address)',
    }) as string;
    const strategy = getContract({ client: thirdwebClient, chain: CHAIN, address: strategyAddress });
    return readContract({
      contract: strategy,
      method: 'function getVotingPower(address user, uint256 snapshotBlock) view returns (uint256)',
      params: [user, blockNumber],
    }) as Promise<bigint>;
  }

  async getProposalChainState(governanceAddress: string, proposalId: bigint): Promise<{
    yesVotes: bigint;
    noVotes: bigint;
    endTime: bigint;
    executed: boolean;
  } | null> {
    try {
      const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: governanceAddress });
      const result = await readContract({
        contract,
        method: 'function proposals(uint256) view returns (uint8 action, uint256 targetId, uint256 startTime, uint256 endTime, uint256 snapshotBlock, uint256 snapshotQuorum, uint256 yesVotes, uint256 noVotes, uint256 amount, address recipient, address token, bytes32 descriptionHash, bool executed)',
        params: [proposalId],
      }) as readonly [number, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, string, string, string, boolean];
      const [, , startTime, endTime, , , yesVotes, noVotes, , , , , executed] = result;
      if (startTime === 0n) return null;
      return { yesVotes, noVotes, endTime, executed };
    } catch {
      return null;
    }
  }

  async getUserVote(governanceAddress: string, proposalId: bigint, user: string): Promise<number> {
    try {
      const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: governanceAddress });
      const v = await readContract({
        contract,
        method: 'function votes(uint256, address) view returns (uint8)',
        params: [proposalId, user],
      }) as number;
      return Number(v);
    } catch {
      return 0;
    }
  }

  async tryFinalizeSale(account: Account, revenueAddress: string): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: revenueAddress });
    const tx = prepareContractCall({
      contract,
      method: 'function finalizeSale()',
      params: [],
    });
    const calldata = await encode(tx);
    return this.sendWithFeeCurrency(account, revenueAddress, calldata);
  }

  async getTokenTotalSupply(tokenAddress: string): Promise<bigint> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: tokenAddress });
    return readContract({
      contract,
      method: 'function totalSupply() view returns (uint256)',
    }) as Promise<bigint>;
  }

  async getProjectTokenAddress(revenueAddress: string): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: revenueAddress });
    return readContract({
      contract,
      method: 'function token() view returns (address)',
    }) as Promise<string>;
  }

  async getCurrentVotes(tokenAddress: string, user: string): Promise<bigint> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: tokenAddress });
    return readContract({
      contract,
      method: 'function getVotes(address account) view returns (uint256)',
      params: [user],
    }) as Promise<bigint>;
  }

  async getDelegate(tokenAddress: string, user: string): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: tokenAddress });
    return readContract({
      contract,
      method: 'function delegates(address account) view returns (address)',
      params: [user],
    }) as Promise<string>;
  }

  async delegateToSelf(account: Account, tokenAddress: string): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: tokenAddress });
    const tx = prepareContractCall({
      contract,
      method: 'function delegate(address delegatee)',
      params: [account.address],
    });
    const calldata = await encode(tx);
    return this.sendWithFeeCurrency(account, tokenAddress, calldata);
  }

  async getProjectCreator(revenueAddress: string): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: revenueAddress });
    return readContract({
      contract,
      method: 'function projectCreator() view returns (address)',
    }) as Promise<string>;
  }


  async proposeOnChain(
    account: Account,
    governanceAddress: string,
    action: number,
    targetId: bigint,
    amount: bigint,
    recipient: string,
    token: string,
    description: string,
  ): Promise<{ txHash: string; proposalId: string }> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: governanceAddress });
    const tx = prepareContractCall({
      contract,
      method:
        'function propose(uint8 action, uint256 targetId, uint256 amount, address recipient, address token, string description) returns (uint256)',
      params: [action, targetId, amount, recipient, token, description],
    });
    const calldata = await encode(tx);
    const txHash = await this.sendWithFeeCurrency(account, governanceAddress, calldata);
    const receipt = await waitForReceipt({
      client: thirdwebClient,
      chain: CHAIN,
      transactionHash: txHash as `0x${string}`,
    });

    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== governanceAddress.toLowerCase()) continue;
      try {
        const decoded = decodeEventLog({
          abi: GovernanceAbi as Parameters<typeof decodeEventLog>[0]['abi'],
          eventName: 'ProposalCreated',
          topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
          data: log.data as `0x${string}`,
        });
        const args = decoded.args as { id: bigint };
        return { txHash, proposalId: args.id.toString() };
      } catch {
        continue;
      }
    }
    throw new Error('No se encontró evento ProposalCreated en el receipt');
  }

  async voteOnChain(
    account: Account,
    governanceAddress: string,
    proposalId: bigint,
    support: boolean,
  ): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: governanceAddress });
    const tx = prepareContractCall({
      contract,
      method: 'function vote(uint256 id, uint8 vote_)',
      params: [proposalId, support ? 1 : 2],
    });
    const calldata = await encode(tx);
    return this.sendWithFeeCurrency(account, governanceAddress, calldata);
  }

  async executeProposalOnChain(
    account: Account,
    governanceAddress: string,
    proposalId: bigint,
  ): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: governanceAddress });
    const tx = prepareContractCall({
      contract,
      method: 'function execute(uint256 id)',
      params: [proposalId],
    });
    const calldata = await encode(tx);
    return this.sendWithFeeCurrency(account, governanceAddress, calldata);
  }


  async openDisputeOnChain(
    account: Account,
    disputesAddress: string,
    reason: string,
  ): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: disputesAddress });
    const tx = prepareContractCall({
      contract,
      method: 'function openDispute(string reason) returns (uint256)',
      params: [reason],
    });
    const calldata = await encode(tx);
    return this.sendWithFeeCurrency(account, disputesAddress, calldata);
  }

  async checkDisputeExists(disputesAddress: string, disputeChainId: string): Promise<boolean> {
    try {
      const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: disputesAddress });
      const data = (await readContract({
        contract,
        method: 'function disputes(uint256) view returns (uint256 id, address opener, string reason, uint8 status, uint256 openedAt, uint256 resolvedAt)',
        params: [BigInt(disputeChainId)],
      })) as readonly unknown[];
      const opener = (data[1] as string) ?? '';
      const status = Number(data[3] as bigint);
      if (!opener || opener === '0x0000000000000000000000000000000000000000') return false;
      return status !== 2;
    } catch {
      return true;
    }
  }

  async resolveDisputeOnChain(
    account: Account,
    disputesAddress: string,
    disputeId: bigint,
    accepted: boolean,
  ): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: disputesAddress });
    const tx = prepareContractCall({
      contract,
      method: 'function resolveDispute(uint256 id, bool accepted)',
      params: [disputeId, accepted],
    });
    const calldata = await encode(tx);
    return this.sendWithFeeCurrency(account, disputesAddress, calldata);
  }


  async depositRevenue(
    account: Account,
    revenueAddress: string,
    vaultAddress: string,
    amount: bigint,
  ): Promise<string> {
    await this.approveToken(account, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS, vaultAddress, amount);
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: revenueAddress });
    const tx = prepareContractCall({
      contract,
      method: 'function depositRevenue(uint256 amount)',
      params: [amount],
    });
    const calldata = await encode(tx);
    return this.sendWithFeeCurrency(account, revenueAddress, calldata);
  }

  async refundInvestment(account: Account, revenueAddress: string): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: revenueAddress });
    const tx = prepareContractCall({ contract, method: 'function refund()' });
    const calldata = await encode(tx);
    return this.sendWithFeeCurrency(account, revenueAddress, calldata);
  }

  async executeMilestone(account: Account, milestonesAddress: string, milestoneId: bigint): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: milestonesAddress });
    const tx = prepareContractCall({
      contract,
      method: 'function executeMilestone(uint256 id)',
      params: [milestoneId],
    });
    const calldata = await encode(tx);
    return this.sendWithFeeCurrency(account, milestonesAddress, calldata);
  }


  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<bigint> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: tokenAddress });
    return readContract({
      contract,
      method: 'function balanceOf(address) view returns (uint256)',
      params: [userAddress],
    }) as Promise<bigint>;
  }

  async getVaultAvailableBalance(vaultAddress: string, tokenAddress: string): Promise<bigint> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: vaultAddress });
    return readContract({
      contract,
      method: 'function availableBalance(address) view returns (uint256)',
      params: [tokenAddress],
    }) as Promise<bigint>;
  }

  async getNativeBalance(address: string): Promise<bigint> {
    const rpc = getRpcClient({ client: thirdwebClient, chain: CHAIN });
    return eth_getBalance(rpc, { address: address as `0x${string}` });
  }

  async getTokenAllowance(tokenAddress: string, ownerAddress: string, spenderAddress: string): Promise<bigint> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: tokenAddress });
    return readContract({
      contract,
      method: 'function allowance(address, address) view returns (uint256)',
      params: [ownerAddress, spenderAddress],
    }) as Promise<bigint>;
  }

  async getDeposits(contractAddress: string, memberAddress: string): Promise<bigint> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: contractAddress });
    return readContract({
      contract,
      method: 'function deposits(address) view returns (uint256)',
      params: [memberAddress],
    }) as Promise<bigint>;
  }

  async getTokenDecimals(tokenAddress: string): Promise<number> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: tokenAddress });
    const decimals = await readContract({ contract, method: 'function decimals() view returns (uint8)' });
    return Number(decimals);
  }


  formatUnits(value: bigint, decimals: number, displayDecimals: number = 2): string {
    const divisor = BigInt(10 ** decimals);
    const intPart = value / divisor;
    const remainder = value % divisor;
    const decPart = remainder.toString().padStart(decimals, '0').slice(0, displayDecimals);
    return `${intPart}.${decPart}`;
  }

  formatUnitsExact(value: bigint, decimals: number): string {
    const divisor = BigInt(10 ** decimals);
    const intPart = value / divisor;
    const remainder = value % divisor;
    if (remainder === 0n) return `${intPart}`;
    const decPart = remainder.toString().padStart(decimals, '0').replace(/0+$/, '');
    return `${intPart}.${decPart}`;
  }

  parseUnits(value: string, decimals: number): bigint {
    const cleaned = String(value ?? '').trim().replace(',', '.').replace(/\s+/g, '');
    if (!cleaned || !/^-?\d*(\.\d*)?$/.test(cleaned)) {
      throw new Error(`parseUnits: valor inválido "${value}"`);
    }
    const [int, dec = ''] = cleaned.split('.');
    const decPadded = dec.padEnd(decimals, '0').slice(0, decimals);
    const intPart = int === '' || int === '-' ? '0' : int;
    return BigInt(intPart + decPadded);
  }
}

export const blockchainService = new BlockchainService();
