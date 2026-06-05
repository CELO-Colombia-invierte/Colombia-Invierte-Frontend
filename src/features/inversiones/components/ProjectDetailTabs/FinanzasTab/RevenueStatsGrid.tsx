import React from 'react';
import { RevenueModuleState } from '@/services/blockchain.service';
import { StatCard } from './StatCard';
import { RevenueDerived } from './tokenizationMath';
import { formatUsdcRawAsCop } from '@/utils/money';

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
    estadoBadge = 'Proyecto cerrado';
    estadoClass = 'badge-pending';
  } else if (vaultStatus?.paused) {
    estadoBadge = 'Fondo en pausa';
    estadoClass = 'badge-frozen';
  }

  return (
    <>
      <div className="chain-state-grid">
        <StatCard label="Total recaudado" value={formatUsdcRawAsCop(state.totalRaised)} />
        <StatCard label="Meta" value={formatUsdcRawAsCop(state.fundingTarget)} />
        <StatCard label="Estado" badge={estadoBadge} badgeClass={estadoClass} />
        {state.saleFinalized && projectFunds !== null && (
          <>
            <StatCard label="Comisión de la plataforma" value={formatUsdcRawAsCop(derived.treasuryFee)} />
            <StatCard label="Saldo del fondo" value={formatUsdcRawAsCop(derived.vaultNow)} />
            <StatCard label="Ya retirado" value={formatUsdcRawAsCop(derived.alreadyWithdrawn)} />
            <StatCard label="Comprometido en etapas pendientes" value={formatUsdcRawAsCop(derived.committed)} />
            <StatCard label="Disponible para etapas" value={formatUsdcRawAsCop(derived.disponibleHitos)} />
            <StatCard label="Rendimientos disponibles" value={formatUsdcRawAsCop(derived.rendimientosPool)} />
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
          <strong>Etapas sobre-comprometidas.</strong> Las etapas pendientes piden{' '}
          {formatUsdcRawAsCop(derived.committed)}, pero en el fondo solo quedan{' '}
          {formatUsdcRawAsCop(derived.projectFundsRemaining)}. Faltan{' '}
          <strong>{formatUsdcRawAsCop(shortfall)}</strong>: esas etapas no se podrán pagar
          a menos que entre más dinero al fondo.
        </div>
      )}
    </>
  );
};
