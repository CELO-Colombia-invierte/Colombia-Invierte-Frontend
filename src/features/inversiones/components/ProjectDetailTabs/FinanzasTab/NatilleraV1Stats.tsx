import React from 'react';
import { NatilleraState } from '@/services/blockchain.service';
import { StatCard } from './StatCard';
import { formatUsdc } from './formatters';

interface NatilleraV1StatsProps {
  state: NatilleraState;
  totalMonths: number;
}

export const NatilleraV1Stats: React.FC<NatilleraV1StatsProps> = ({ state, totalMonths }) => (
  <div className="chain-state-grid">
    <StatCard label="Total recaudado" value={`${formatUsdc(state.totalCollected)}`} />
    <StatCard
      label="Ciclo actual"
      value={`${Number(state.currentCycle) + 1}${totalMonths ? ` / ${totalMonths}` : ''}`}
    />
    <StatCard
      label="Estado"
      badge={state.isFinalized ? 'Finalizada' : 'Activa'}
      badgeClass={state.isFinalized ? 'badge-done' : 'badge-active'}
    />
  </div>
);
