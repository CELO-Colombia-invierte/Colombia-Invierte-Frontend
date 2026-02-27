import { getContract, readContract, prepareContractCall, sendTransaction, encode, prepareTransaction } from 'thirdweb';
import type { Account } from 'thirdweb/wallets';
import { thirdwebClient } from '@/app/App';
import { CHAIN, BLOCKCHAIN_CONFIG } from '@/contracts/config';

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

class BlockchainService {

  async getPlatformFee(): Promise<bigint> {
    const contract = getContract({
      client: thirdwebClient,
      chain: CHAIN,
      address: BLOCKCHAIN_CONFIG.CONTRACTS.PLATFORM,
    });

    const fee = await readContract({
      contract,
      method: 'function feeAmount() view returns (uint256)',
    });
    return fee as bigint;
  }

  async deployNatillera(
    account: Account,
    params: DeployNatilleraParams,
  ): Promise<{ txHash: string; contractAddress: string }> {
    const fee = await this.getPlatformFee();

    const contract = getContract({
      client: thirdwebClient,
      chain: CHAIN,
      address: BLOCKCHAIN_CONFIG.CONTRACTS.PLATFORM,
    });

    const tx = prepareContractCall({
      contract,
      method: 'function deployNatillera(uint256 startTime, (address token, uint256 monthlyContribution, uint256 totalMonths, uint256 maxMembers) config) payable returns (address)',
      params: [
        params.startTime,
        { token: params.token, monthlyContribution: params.monthlyContribution, totalMonths: params.totalMonths, maxMembers: params.maxMembers },
      ],
      value: fee,
    });

    const result = await sendTransaction({ account, transaction: tx });

    // Import waitForReceipt dynamically if not at top level, or just use it from thirdweb
    const { waitForReceipt } = await import('thirdweb');
    const receipt = await waitForReceipt({
      client: thirdwebClient,
      chain: CHAIN,
      transactionHash: result.transactionHash as `0x${string}`,
    });

    // El evento NatilleraDeployed tiene la dirección en topics[1]
    let contractAddress = '0x0000000000000000000000000000000000000000';
    for (const log of receipt.logs) {
      // Si tiene 3 topics, normalmente es NatilleraDeployed(address indexed natillera, uint256 indexed projectId, address creator)
      if (log.topics && log.topics.length >= 2 && log.address.toLowerCase() === BLOCKCHAIN_CONFIG.CONTRACTS.PLATFORM.toLowerCase()) {
        const topic1 = log.topics[1];
        if (topic1) {
          contractAddress = '0x' + topic1.slice(26);
          break;
        }
      }
    }

    return { txHash: result.transactionHash, contractAddress };
  }

  async deployTokenizacion(
    account: Account,
    params: DeployTokenizacionParams,
  ): Promise<{ txHash: string; contractAddress: string }> {
    const fee = await this.getPlatformFee();

    const contract = getContract({
      client: thirdwebClient,
      chain: CHAIN,
      address: BLOCKCHAIN_CONFIG.CONTRACTS.PLATFORM,
    });

    const tx = prepareContractCall({
      contract,
      method: 'function deployTokenizacion((address paymentToken, uint256 pricePerToken, uint256 totalTokens, uint256 saleStart, uint256 saleDuration) config) payable returns (address)',
      params: [
        { paymentToken: params.paymentToken, pricePerToken: params.pricePerToken, totalTokens: params.totalTokens, saleStart: params.saleStart, saleDuration: params.saleDuration },
      ],
      value: fee,
    });

    const result = await sendTransaction({ account, transaction: tx });

    const { waitForReceipt } = await import('thirdweb');
    const receipt = await waitForReceipt({
      client: thirdwebClient,
      chain: CHAIN,
      transactionHash: result.transactionHash as `0x${string}`,
    });

    let contractAddress = '0x0000000000000000000000000000000000000000';
    for (const log of receipt.logs) {
      if (log.topics && log.topics.length >= 2 && log.address.toLowerCase() === BLOCKCHAIN_CONFIG.CONTRACTS.PLATFORM.toLowerCase()) {
        const topic1 = log.topics[1];
        if (topic1) {
          contractAddress = '0x' + topic1.slice(26);
          break;
        }
      }
    }

    return { txHash: result.transactionHash, contractAddress };
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
      readContract({ contract, method: 'function members() view returns (address[])' }),
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

    const [tokensSold, fundsCollected, isSaleActive, saleFinalized] = await Promise.all([
      readContract({ contract, method: 'function tokensSold() view returns (uint256)' }),
      readContract({ contract, method: 'function fundsCollected() view returns (uint256)' }),
      readContract({ contract, method: 'function isSaleActive() view returns (bool)' }),
      readContract({ contract, method: 'function saleFinalized() view returns (bool)' }),
    ]);

    return {
      tokensSold: tokensSold as bigint,
      fundsCollected: fundsCollected as bigint,
      isSaleActive: isSaleActive as boolean,
      saleFinalized: saleFinalized as boolean,
    };
  }


  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<bigint> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: tokenAddress });

    return readContract({
      contract,
      method: 'function balanceOf(address) view returns (uint256)',
      params: [userAddress],
    }) as Promise<bigint>;
  }

  async getTokenAllowance(tokenAddress: string, ownerAddress: string, spenderAddress: string): Promise<bigint> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: tokenAddress });

    return readContract({
      contract,
      method: 'function allowance(address, address) view returns (uint256)',
      params: [ownerAddress, spenderAddress],
    }) as Promise<bigint>;
  }


  private async sendWithFeeCurrency(account: Account, contractAddress: string, calldata: `0x${string}`): Promise<string> {
    try {
      const result = await account.sendTransaction({
        to: contractAddress as `0x${string}`,
        data: calldata,
        chainId: BLOCKCHAIN_CONFIG.CHAIN_ID,
        feeCurrency: BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS as `0x${string}`,
      } as Parameters<Account['sendTransaction']>[0]);
      return result.transactionHash;
    } catch (feeErr: unknown) {
      const msg = (feeErr as { message?: string })?.message ?? '';
      if (!msg.includes('feeCurrency') && !msg.includes('fee currency') && !msg.includes('insufficient funds')) {
        throw feeErr;
      }
      const tx = prepareTransaction({ client: thirdwebClient, chain: CHAIN, to: contractAddress, data: calldata });
      const result = await sendTransaction({ account, transaction: tx });
      return result.transactionHash;
    }
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


  async depositToNatillera(
    account: Account,
    contractAddress: string,
  ): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: contractAddress });

    const contractCall = prepareContractCall({
      contract,
      method: 'function deposit()',
    });

    const calldata = await encode(contractCall);
    return this.sendWithFeeCurrency(account, contractAddress, calldata);
  }


  async buyTokens(
    account: Account,
    contractAddress: string,
    amount: bigint,
  ): Promise<string> {
    const contract = getContract({ client: thirdwebClient, chain: CHAIN, address: contractAddress });

    const tx = prepareContractCall({
      contract,
      method: 'function buyTokens(uint256 amount) payable',
      params: [amount],
    });

    const result = await sendTransaction({ account, transaction: tx });
    return result.transactionHash;
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
