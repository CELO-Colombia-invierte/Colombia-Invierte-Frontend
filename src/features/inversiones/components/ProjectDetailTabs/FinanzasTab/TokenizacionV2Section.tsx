import React from 'react';
import type { Account } from 'thirdweb/wallets';
import { Project } from '@/models/projects';
import { RevenueModuleState } from '@/services/blockchain.service';
import { RevenueStatsGrid } from './RevenueStatsGrid';
import { RewardsBanner } from './RewardsBanner';
import { UserPositionPanel } from './UserPositionPanel';
import { FinalizeSalePanel } from './FinalizeSalePanel';
import { DepositRevenuePanel } from './DepositRevenuePanel';
import { InvestPanel } from './InvestPanel';
import { computeRevenueDerived, computeUserPosition } from './tokenizationMath';
import type { useChainData } from './useChainData';
import type { useFinanzasActions } from './useFinanzasActions';

interface TokenizacionV2SectionProps {
  account: Account | undefined;
  project: Project;
  state: RevenueModuleState;
  chain: ReturnType<typeof useChainData>;
  actions: ReturnType<typeof useFinanzasActions>;
}

export const TokenizacionV2Section: React.FC<TokenizacionV2SectionProps> = ({
  account,
  project,
  state,
  chain,
  actions,
}) => {
  const derived = computeRevenueDerived(state, {
    userUsdcBalance: chain.userUsdcBalance,
    vaultBalance: chain.vaultBalance,
    projectFunds: chain.projectFunds,
    milestonesCommitted: chain.milestonesCommitted,
  });
  const isCreator =
    !!account && !!chain.projectCreator && account.address.toLowerCase() === chain.projectCreator.toLowerCase();
  const vaultFrozen = chain.vaultStatus?.frozen ?? false;

  const showPosition =
    !!account &&
    state.saleFinalized &&
    chain.userTokenBalance !== null &&
    chain.userTokenBalance > 0n &&
    chain.tokenSupply !== null &&
    chain.tokenSupply > 0n;

  return (
    <>
      <RevenueStatsGrid
        state={state}
        derived={derived}
        projectFunds={chain.projectFunds}
        vaultStatus={chain.vaultStatus}
      />

      {account && chain.pendingRewards !== null && chain.pendingRewards > 0n && (
        <RewardsBanner
          pendingRewards={chain.pendingRewards}
          claiming={actions.claiming}
          onClaim={actions.handleClaimRendimientos}
        />
      )}

      {showPosition && (
        <UserPositionPanel
          position={computeUserPosition(
            chain.userTokenBalance!,
            chain.tokenSupply!,
            derived.rendimientosPool,
            chain.userInvestment,
            chain.pendingRewards,
            project.tokenization_details?.expected_annual_return_pct,
          )}
          userTokenBalance={chain.userTokenBalance!}
          tokenSupply={chain.tokenSupply!}
          rendimientosPool={derived.rendimientosPool}
        />
      )}

      {isCreator && !state.saleFinalized && (
        <FinalizeSalePanel
          finalizing={actions.finalizing}
          finalizeError={actions.finalizeError}
          finalizeTxHash={actions.finalizeTxHash}
          vaultFrozen={vaultFrozen}
          onFinalize={actions.handleFinalizeSale}
        />
      )}

      {isCreator && state.saleFinalized && (
        <DepositRevenuePanel
          state={state}
          tokenSupply={chain.tokenSupply}
          userUsdcBalance={chain.userUsdcBalance}
          depositAmount={actions.depositAmount}
          depositing={actions.depositing}
          depositError={actions.depositError}
          depositTxHash={actions.depositTxHash}
          vaultFrozen={vaultFrozen}
          onAmountChange={(value) => {
            actions.setDepositAmount(value);
            actions.setDepositError(null);
          }}
          onDeposit={actions.handleDepositRevenue}
        />
      )}

      {!state.saleFinalized && project.vault_address && (
        <InvestPanel
          account={account}
          project={project}
          state={state}
          derived={derived}
          userInvestment={chain.userInvestment}
          userUsdcBalance={chain.userUsdcBalance}
          investAmount={actions.investAmount}
          investing={actions.investing}
          investTxHash={actions.investTxHash}
          investError={actions.investError}
          setInvestAmount={actions.setInvestAmount}
          setInvestError={actions.setInvestError}
          onInvest={actions.handleInvest}
          onTopupUsdc={actions.handleTopupUsdc}
        />
      )}
    </>
  );
};
