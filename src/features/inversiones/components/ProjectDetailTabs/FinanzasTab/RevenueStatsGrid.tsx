import React from 'react';
import { RevenueModuleState } from '@/services/blockchain.service';
import { StatCard } from './StatCard';
import { formatUsdc } from './formatters';
import { RevenueDerived } from './tokenizationMath';

interface RevenueStatsGridProps {
  state: RevenueModuleState;
  derived: RevenueDerived;
  projectFunds: bigint | null;
  vaultStatus?: { paused: boolean; state: number; frozen: boolean } | null;
}

export const RevenueStatsGrid: React.FC<RevenueStatsGridProps> = ({
  state,
  derived,
  projectFunds,
  vaultStatus,
}) => {
  // Sobre-compromiso: los hitos pendientes piden más de lo que queda en el vault.
  const overcommitted = state.saleFinalized && derived.committed > derived.projectFundsRemaining;
  const shortfall = overcommitted ? derived.committed - derived.projectFundsRemaining : 0n;

  // La card "Estado" prioriza el estado de la bóveda (congelada/cerrada) por ser
  // lo más relevante para el creador; si no, muestra el estado de la venta.
  let estadoBadge = state.saleFinalized ? 'Finalizada' : 'Activa';
  let estadoClass = state.saleFinalized ? 'badge-done' : 'badge-active';
  if (vaultStatus?.state === 2) {
    estadoBadge = 'Bóveda cerrada';
    estadoClass = 'badge-pending';
  } else if (vaultStatus?.paused) {
    estadoBadge = 'Bóveda congelada';
    estadoClass = 'badge-frozen';
  }

  return (
    <>
      <div className="chain-state-grid">
        <StatCard label="Total recaudado" value={`${formatUsdc(state.totalRaised)} USDC`} />
        <StatCard label="Objetivo" value={`${formatUsdc(state.fundingTarget)} USDC`} />
        <StatCard label="Estado" badge={estadoBadge} badgeClass={estadoClass} />
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
      {overcommitted && (
        <div
          style={{
            marginTop: 10,
            padding: '10px 12px',
            background: '#fff8e6',
            border: '1px solid #f5c451',
            borderRadius: 8,
            color: '#7a5300',
            fontSize: 13,
          }}
        >
          <strong>Hitos sobre-comprometidos.</strong> Los hitos pendientes piden{' '}
          {formatUsdc(derived.committed)} USDC, pero en el vault solo quedan{' '}
          {formatUsdc(derived.projectFundsRemaining)} USDC. Faltan{' '}
          <strong>{formatUsdc(shortfall)} USDC</strong>: esos hitos no se podrán ejecutar
          a menos que entren más fondos al vault.
        </div>
      )}
    </>
  );
};
