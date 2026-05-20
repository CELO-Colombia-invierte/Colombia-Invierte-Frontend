import { RevenueModuleState } from '@/services/blockchain.service';

export interface RevenueDerived {
  remaining: bigint;
  cap: bigint;
  maxAllowed: bigint;
  dust: boolean;
  treasuryFee: bigint;
  vaultNow: bigint;
  committed: bigint;
  alreadyWithdrawn: bigint;
  projectFundsRemaining: bigint;
  disponibleHitos: bigint;
  rendimientosPool: bigint;
}

interface RevenueDerivedInput {
  userUsdcBalance: bigint | null;
  vaultBalance: bigint | null;
  projectFunds: bigint | null;
  milestonesCommitted: bigint | null;
}

export function computeRevenueDerived(
  s: RevenueModuleState,
  { userUsdcBalance, vaultBalance, projectFunds, milestonesCommitted }: RevenueDerivedInput,
): RevenueDerived {
  const remaining = s.fundingTarget > s.totalRaised ? s.fundingTarget - s.totalRaised : 0n;
  const cap = userUsdcBalance !== null && userUsdcBalance < remaining ? userUsdcBalance : remaining;
  const maxAllowed = s.tokenPrice > 0n ? cap - (cap % s.tokenPrice) : cap;
  const dust = s.tokenPrice > 0n && remaining > 0n && remaining < s.tokenPrice;

  const committed = milestonesCommitted ?? 0n;
  const vaultNow = vaultBalance ?? 0n;
  const treasuryFee =
    s.saleFinalized && projectFunds !== null && s.totalRaised > projectFunds
      ? s.totalRaised - projectFunds
      : 0n;
  const pf = projectFunds ?? 0n;
  const alreadyWithdrawn = s.saleFinalized && projectFunds !== null && pf > vaultNow ? pf - vaultNow : 0n;
  const projectFundsRemaining = pf > alreadyWithdrawn ? pf - alreadyWithdrawn : 0n;
  const disponibleHitos = projectFundsRemaining > committed ? projectFundsRemaining - committed : 0n;
  const rendimientosPool = vaultNow > projectFundsRemaining ? vaultNow - projectFundsRemaining : 0n;

  return {
    remaining,
    cap,
    maxAllowed,
    dust,
    treasuryFee,
    vaultNow,
    committed,
    alreadyWithdrawn,
    projectFundsRemaining,
    disponibleHitos,
    rendimientosPool,
  };
}

export interface UserPosition {
  sharePctNum: number;
  shareOfPool: bigint;
  userInv: bigint;
  rewards: bigint;
  expectedAnnual: number;
  realRoiPct: number;
  fulfillmentPct: number;
}

export function computeUserPosition(
  userTokenBalance: bigint,
  tokenSupply: bigint,
  rendimientosPool: bigint,
  userInvestment: bigint | null,
  pendingRewards: bigint | null,
  expectedAnnualReturnPct: number | string | null | undefined,
): UserPosition {
  const sharePctNum = Number((userTokenBalance * 10000n) / tokenSupply) / 100;
  const shareOfPool = (userTokenBalance * rendimientosPool) / tokenSupply;
  const userInv = userInvestment ?? 0n;
  const rewards = pendingRewards ?? 0n;
  const expectedAnnual = Number(expectedAnnualReturnPct ?? 0) || 0;
  const realRoiPct = userInv > 0n ? Number((rewards * 10000n) / userInv) / 100 : 0;
  const fulfillmentPct = expectedAnnual > 0 ? (realRoiPct / expectedAnnual) * 100 : 0;
  return { sharePctNum, shareOfPool, userInv, rewards, expectedAnnual, realRoiPct, fulfillmentPct };
}
