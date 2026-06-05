import React from 'react';
import { NatilleraV2State } from '@/services/blockchain.service';
import { StatCard } from './StatCard';
import { formatUsdc } from './formatters';

interface NatilleraV2StatsProps {
  state: NatilleraV2State;
  vaultBalance: bigint | null;
}

export const NatilleraV2Stats: React.FC<NatilleraV2StatsProps> = ({ state, vaultBalance }) => (
  <div className="chain-state-grid">
    {vaultBalance !== null && (
      <StatCard label="Total recaudado" value={`${formatUsdc(vaultBalance)}`} />
    )}
    <StatCard
      label="Mes actual"
      value={`${Number(state.currentMonth) + 1} / ${Number(state.duration)}`}
    />
    <StatCard label="Cuota mensual" value={`${formatUsdc(state.quota)}`} />
    <StatCard
      label="Estado"
      badge={state.isMatured ? 'Madurada' : 'Activa'}
      badgeClass={state.isMatured ? 'badge-done' : 'badge-active'}
    />
  </div>
);
