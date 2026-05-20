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

export class FinalizeNotSupportedYet extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FinalizeNotSupportedYet';
  }
}
