import { getContract, readContract, prepareContractCall, sendTransaction } from 'thirdweb';
import type { Account } from 'thirdweb/wallets';
import { thirdwebClient } from '@/app/App';
import { CHAIN, BLOCKCHAIN_CONFIG } from '@/contracts/config';

import NatilleraABI from '@/contracts/abis/Natillera.json';
import TokenizacionABI from '@/contracts/abis/Tokenizacion.json';
import ProjectTokenABI from '@/contracts/abis/ProjectToken.json';
import PlatformABI from '@/contracts/abis/Platform.json';

// ─────────────────────────────────────────────
// Tipos de retorno
// ─────────────────────────────────────────────

export interface NatilleraConfig {
  monthlyFee: bigint;       // Cuota mensual en USDT (6 decimales)
  duration: bigint;         // Duración total en ciclos
  maxParticipants: bigint;  // Máximo de participantes
  paymentToken: string;     // Dirección del token de pago (USDT)
}

export interface NatilleraState {
  currentCycle: bigint;     // Ciclo actual
  totalDeposited: bigint;   // Total depositado en USDT
  isFinalized: boolean;     // Si el proyecto terminó
  participantCount: bigint; // Participantes actuales
}

export interface TokenizacionConfig {
  pricePerToken: bigint;    // Precio por token en USDT (6 decimales)
  totalTokens: bigint;      // Total de tokens a vender
  paymentToken: string;     // Dirección del token de pago (USDT)
  projectToken: string;     // Dirección del token del proyecto
}

export interface TokenizacionState {
  tokensSold: bigint;       // Tokens vendidos hasta ahora
  totalRaised: bigint;      // Total recaudado en USDT
  isSaleActive: boolean;    // Si la venta está activa
  isFinalized: boolean;     // Si el proyecto terminó
}

export interface DeployNatilleraParams {
  token: string;
  monthlyContribution: bigint;
  totalMonths: bigint;
  maxMembers: bigint;
  startTime: bigint;
}

export interface DeployTokenizacionParams {
  paymentToken: string;
  pricePerToken: bigint;
  totalTokens: bigint;
  saleStart: bigint;
  saleDuration: bigint;
}

// ─────────────────────────────────────────────
// BlockchainService — solo lectura y escritura con wallet
// ─────────────────────────────────────────────

class BlockchainService {

  // ── LECTURA: Platform ────────────────────────

  async getPlatformFee(): Promise<bigint> {
    const contract = getContract({
      client: thirdwebClient,
      chain: CHAIN,
      address: BLOCKCHAIN_CONFIG.CONTRACTS.PLATFORM,
      abi: PlatformABI,
    });

    return readContract({ contract, method: 'feeAmount' }) as Promise<bigint>;
  }

  // ── ESCRITURA: Deploy contratos ──────────────

  async deployNatillera(
    account: Account,
    params: DeployNatilleraParams,
  ): Promise<string> {
    const fee = await this.getPlatformFee();

    const contract = getContract({
      client: thirdwebClient,
      chain: CHAIN,
      address: BLOCKCHAIN_CONFIG.CONTRACTS.PLATFORM,
      abi: PlatformABI,
    });

    const tx = prepareContractCall({
      contract,
      method: 'deployNatillera',
      params: [
        params.startTime,
        [params.token, params.monthlyContribution, params.totalMonths, params.maxMembers],
      ],
      value: fee,
    });

    const result = await sendTransaction({ account, transaction: tx });
    return result.transactionHash;
  }

  async deployTokenizacion(
    account: Account,
    params: DeployTokenizacionParams,
  ): Promise<string> {
    const fee = await this.getPlatformFee();

    const contract = getContract({
      client: thirdwebClient,
      chain: CHAIN,
      address: BLOCKCHAIN_CONFIG.CONTRACTS.PLATFORM,
      abi: PlatformABI,
    });

    const tx = prepareContractCall({
      contract,
      method: 'deployTokenizacion',
      params: [
        [params.paymentToken, params.pricePerToken, params.totalTokens, params.saleStart, params.saleDuration],
      ],
      value: fee,
    });

    const result = await sendTransaction({ account, transaction: tx });
    return result.transactionHash;
  }

  // ── LECTURA: Natillera ──────────────────────

  async getNatilleraConfig(contractAddress: string): Promise<NatilleraConfig> {
    const contract = getContract({
      client: thirdwebClient,
      chain: CHAIN,
      address: contractAddress,
      abi: NatilleraABI,
    });

    const result = await readContract({ contract, method: 'config' });
    return {
      monthlyFee: result[0] as bigint,
      duration: result[1] as bigint,
      maxParticipants: result[2] as bigint,
      paymentToken: result[3] as string,
    };
  }

  async getNatilleraState(contractAddress: string): Promise<NatilleraState> {
    const contract = getContract({
      client: thirdwebClient,
      chain: CHAIN,
      address: contractAddress,
      abi: NatilleraABI,
    });

    const [currentCycle, totalDeposited, isFinalized, participantCount] = await Promise.all([
      readContract({ contract, method: 'currentCycle' }),
      readContract({ contract, method: 'totalDeposited' }),
      readContract({ contract, method: 'isFinalized' }),
      readContract({ contract, method: 'participantCount' }),
    ]);

    return {
      currentCycle: currentCycle as bigint,
      totalDeposited: totalDeposited as bigint,
      isFinalized: isFinalized as boolean,
      participantCount: participantCount as bigint,
    };
  }

  async getNatilleraUserBalance(contractAddress: string, userAddress: string): Promise<bigint> {
    const contract = getContract({
      client: thirdwebClient,
      chain: CHAIN,
      address: contractAddress,
      abi: NatilleraABI,
    });

    const result = await readContract({
      contract,
      method: 'isMember',
      params: [userAddress],
    });

    return result as bigint;
  }

  // ── LECTURA: Tokenizacion ───────────────────

  async getTokenizacionConfig(contractAddress: string): Promise<TokenizacionConfig> {
    const contract = getContract({
      client: thirdwebClient,
      chain: CHAIN,
      address: contractAddress,
      abi: TokenizacionABI,
    });

    const result = await readContract({ contract, method: 'config' });
    return {
      pricePerToken: result[0] as bigint,
      totalTokens: result[1] as bigint,
      paymentToken: result[2] as string,
      projectToken: result[3] as string,
    };
  }

  async getTokenizacionState(contractAddress: string): Promise<TokenizacionState> {
    const contract = getContract({
      client: thirdwebClient,
      chain: CHAIN,
      address: contractAddress,
      abi: TokenizacionABI,
    });

    const [tokensSold, totalRaised, isSaleActive, isFinalized] = await Promise.all([
      readContract({ contract, method: 'tokensSold' }),
      readContract({ contract, method: 'totalRaised' }),
      readContract({ contract, method: 'isSaleActive' }),
      readContract({ contract, method: 'isFinalized' }),
    ]);

    return {
      tokensSold: tokensSold as bigint,
      totalRaised: totalRaised as bigint,
      isSaleActive: isSaleActive as boolean,
      isFinalized: isFinalized as boolean,
    };
  }

  // ── LECTURA: Token ERC20 (USDT o ProjectToken) ──

  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<bigint> {
    const contract = getContract({
      client: thirdwebClient,
      chain: CHAIN,
      address: tokenAddress,
      abi: ProjectTokenABI,
    });

    return readContract({
      contract,
      method: 'balanceOf',
      params: [userAddress],
    }) as Promise<bigint>;
  }

  async getTokenAllowance(tokenAddress: string, ownerAddress: string, spenderAddress: string): Promise<bigint> {
    const contract = getContract({
      client: thirdwebClient,
      chain: CHAIN,
      address: tokenAddress,
      abi: ProjectTokenABI,
    });

    return readContract({
      contract,
      method: 'allowance',
      params: [ownerAddress, spenderAddress],
    }) as Promise<bigint>;
  }

  // ── ESCRITURA: approve USDT ─────────────────

  async approveToken(
    account: Account,
    tokenAddress: string,
    spenderAddress: string,
    amount: bigint,
  ): Promise<string> {
    const contract = getContract({
      client: thirdwebClient,
      chain: CHAIN,
      address: tokenAddress,
      abi: ProjectTokenABI,
    });

    const tx = prepareContractCall({
      contract,
      method: 'approve',
      params: [spenderAddress, amount],
    });

    const result = await sendTransaction({ account, transaction: tx });
    return result.transactionHash;
  }

  // ── ESCRITURA: deposit a Natillera ──────────

  async depositToNatillera(
    account: Account,
    contractAddress: string,
    amount: bigint,
  ): Promise<string> {
    const contract = getContract({
      client: thirdwebClient,
      chain: CHAIN,
      address: contractAddress,
      abi: NatilleraABI,
    });

    const tx = prepareContractCall({
      contract,
      method: 'deposit',
      params: [amount],
    });

    const result = await sendTransaction({ account, transaction: tx });
    return result.transactionHash;
  }

  // ── ESCRITURA: comprar tokens en Tokenizacion ──

  async buyTokens(
    account: Account,
    contractAddress: string,
    amount: bigint,
  ): Promise<string> {
    const contract = getContract({
      client: thirdwebClient,
      chain: CHAIN,
      address: contractAddress,
      abi: TokenizacionABI,
    });

    const tx = prepareContractCall({
      contract,
      method: 'buyTokens',
      params: [amount],
    });

    const result = await sendTransaction({ account, transaction: tx });
    return result.transactionHash;
  }

  // ── UTILIDADES ──────────────────────────────

  formatUnits(value: bigint, decimals: number): string {
    const divisor = BigInt(10 ** decimals);
    const intPart = value / divisor;
    const remainder = value % divisor;
    const decPart = remainder.toString().padStart(decimals, '0').slice(0, 2);
    return `${intPart}.${decPart}`;
  }

  parseUnits(value: string, decimals: number): bigint {
    const [int, dec = ''] = value.split('.');
    const decPadded = dec.padEnd(decimals, '0').slice(0, decimals);
    return BigInt(int + decPadded);
  }
}

export const blockchainService = new BlockchainService();
