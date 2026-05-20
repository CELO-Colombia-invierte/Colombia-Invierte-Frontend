import React from 'react';
import { RevenueModuleState } from '@/services/blockchain.service';
import { StatCard } from './StatCard';
import { formatUsdc } from './formatters';
import { RevenueDerived } from './tokenizationMath';

interface RevenueStatsGridProps {
  state: RevenueModuleState;
  derived: RevenueDerived;
  projectFunds: bigint | null;
}

export const RevenueStatsGrid: React.FC<RevenueStatsGridProps> = ({ state, derived, projectFunds }) => (
  <div className="chain-state-grid">
    <StatCard label="Total recaudado" value={`${formatUsdc(state.totalRaised)} USDC`} />
    <StatCard label="Objetivo" value={`${formatUsdc(state.fundingTarget)} USDC`} />
    <StatCard
      label="Estado"
      badge={state.saleFinalized ? 'Finalizada' : 'Activa'}
      badgeClass={state.saleFinalized ? 'badge-done' : 'badge-active'}
    />
    {state.saleFinalized && projectFunds !== null && (
      <>
        <StatCard label="Comisión al treasury" value={`${formatUsdc(derived.treasuryFee)} USDC`} />
        <StatCard label="Saldo total del vault" value={`${formatUsdc(derived.vaultNow)} USDC`} />
        <StatCard label="Ya retirado del vault" value={`${formatUsdc(derived.alreadyWithdrawn)} USDC`} />
        <StatCard label="Comprometido en hitos pendientes" value={`${formatUsdc(derived.committed)} USDC`} />
        <StatCard label="Disponible para hitos" value={`${formatUsdc(derived.disponibleHitos)} USDC`} />
        <StatCard label="Rendimientos en pool" value={`${formatUsdc(derived.rendimientosPool)} USDC`} />
      </>
    )}
  </div>
);
