import React from 'react';
import { TokenizacionState } from '@/services/blockchain.service';
import { StatCard } from './StatCard';
import { formatUsdc, formatTokens } from './formatters';

interface TokenizacionV1StatsProps {
  state: TokenizacionState;
  projectTokenDecimals: number | null;
}

export const TokenizacionV1Stats: React.FC<TokenizacionV1StatsProps> = ({ state, projectTokenDecimals }) => (
  <div className="chain-state-grid">
    <StatCard label="Fondos recaudados" value={`${formatUsdc(state.fundsCollected)}`} />
    <StatCard label="Tokens vendidos" value={formatTokens(state.tokensSold, projectTokenDecimals)} />
    <StatCard
      label="Estado venta"
      badge={state.isSaleActive ? 'Activa' : state.saleFinalized ? 'Finalizada' : 'No iniciada'}
      badgeClass={state.isSaleActive ? 'badge-active' : state.saleFinalized ? 'badge-done' : 'badge-pending'}
    />
  </div>
);
