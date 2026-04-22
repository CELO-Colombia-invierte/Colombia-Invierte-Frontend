import { getContract, readContract, prepareContractCall, sendTransaction, encode, prepareTransaction, waitForReceipt } from 'thirdweb';
import { decodeEventLog } from 'viem';
import { getRpcClient, eth_getBalance } from 'thirdweb/rpc';
import type { Account } from 'thirdweb/wallets';
import { thirdwebClient } from '@/app/App';
import {
  CHAIN,
  BLOCKCHAIN_CONFIG,
  PlatformV2Abi,
} from '@/contracts/config';
import GovernanceAbi from '@/contracts/abis/GovernanceModule.json';

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
    const walletChainId = account.sendTransaction
      ? (account as any).chainId ?? (account as any).chain?.id
      : undefined;
    // If we can detect the chain and it's wrong, throw
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

  // After activating the vault, enroll the creator as a natillera member so
  // they have voting power on future proposals.
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

  // ── ESCRITURA: approve ERC20 ─────────────

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

  // ── ESCRITURA: Tokenización V2 ──────────────

  async investInProject(
    account: Account,
    revenueAddress: string,
    amount: bigint,
  ): Promise<string> {
    await this.approveToken(account, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS, revenueAddress, amount);

    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: revenueAddress });
    const contractCall = prepareContractCall({
      contract,
      method: 'function invest(uint256 amount)',
      params: [amount],
    });

    const calldata = await encode(contractCall);
    return this.sendWithFeeCurrency(account, revenueAddress, calldata);
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
    const [totalRaised, fundingTarget, minimumCap, tokenPrice, saleFinalized, state] = await Promise.all([
      readContract({ contract, method: 'function totalRaised() view returns (uint128)' }),
      readContract({ contract, method: 'function fundingTarget() view returns (uint128)' }),
      readContract({ contract, method: 'function minimumCap() view returns (uint128)' }),
      readContract({ contract, method: 'function tokenPrice() view returns (uint128)' }),
      readContract({ contract, method: 'function saleFinalized() view returns (bool)' }),
      readContract({ contract, method: 'function state() view returns (uint8)' }),
    ]);
    return {
      totalRaised: totalRaised as bigint,
      fundingTarget: fundingTarget as bigint,
      minimumCap: minimumCap as bigint,
      tokenPrice: tokenPrice as bigint,
      saleFinalized: saleFinalized as boolean,
      state: Number(state),
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

  // ── ESCRITURA: Natillera V2 ──────────────

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

  // ── LECTURA: Natillera V1 (backward compat) ──

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

  // ── LECTURA: Tokenizacion V1 (backward compat) ──

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

  // ── ESCRITURA: V1 deposit (backward compat) ──

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

  // ── MILESTONES V2 ──────────────────

  async proposeMilestoneOnChain(
    account: Account,
    milestonesAddress: string,
    description: string,
    vaultAddress: string,
  ): Promise<string> {
    // Leer balance actual del vault (cuánto se ha recaudado)
    const vaultBalance = await this.getTokenBalance(BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS, vaultAddress);
    if (vaultBalance === BigInt(0)) throw new Error('El vault no tiene fondos aún. Espera a recibir pagos.');

    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: milestonesAddress });
    const tx = prepareContractCall({
      contract,
      method: 'function proposeMilestone(string description, address token, address recipient, uint256 amount) returns (uint256)',
      params: [description, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS as `0x${string}`, account.address, vaultBalance],
    });
    const calldata = await encode(tx);
    return this.sendWithFeeCurrency(account, milestonesAddress, calldata);
  }

  // ── GOVERNANCE V2 ──────────────────

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

  // ── DISPUTES V2 ──────────────────

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

  // ── REVENUE V2: deposit / refund ──────────────────

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
