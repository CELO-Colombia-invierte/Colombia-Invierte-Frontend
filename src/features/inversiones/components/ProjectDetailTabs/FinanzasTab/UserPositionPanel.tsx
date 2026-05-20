import React from 'react';
import { formatUsdc } from './formatters';
import { UserPosition } from './tokenizationMath';

interface UserPositionPanelProps {
  position: UserPosition;
  userTokenBalance: bigint;
  tokenSupply: bigint;
  rendimientosPool: bigint;
}

export const UserPositionPanel: React.FC<UserPositionPanelProps> = ({
  position,
  userTokenBalance,
  tokenSupply,
  rendimientosPool,
}) => {
  const { sharePctNum, shareOfPool, userInv, rewards, expectedAnnual, realRoiPct, fulfillmentPct } = position;
  const fulfillmentColor =
    fulfillmentPct >= 100 ? '#059669' : fulfillmentPct >= 50 ? '#d97706' : '#dc2626';
  return (
    <div className="rev-distribution-info">
      <h4 className="rev-distribution-title">Tu posición en el proyecto</h4>
      <div className="rev-distribution-grid">
        <div className="rev-stat">
          <span className="rev-stat-label">Tu inversión</span>
          <span className="rev-stat-value">{formatUsdc(userInv)} USDC</span>
        </div>
        <div className="rev-stat">
          <span className="rev-stat-label">Tus tokens</span>
          <span className="rev-stat-value">
            {userTokenBalance.toString()} de {tokenSupply.toString()} ({sharePctNum.toFixed(2)}%)
          </span>
        </div>
        <div className="rev-stat">
          <span className="rev-stat-label">Pool total de rendimientos</span>
          <span className="rev-stat-value">{formatUsdc(rendimientosPool)} USDC</span>
        </div>
        <div className="rev-stat">
          <span className="rev-stat-label">Tu parte del pool</span>
          <span className="rev-stat-value">≈ {formatUsdc(shareOfPool)} USDC</span>
        </div>
        <div className="rev-stat">
          <span className="rev-stat-label">Por cobrar ahora</span>
          <span className="rev-stat-value">{formatUsdc(rewards)} USDC</span>
        </div>
        <div className="rev-stat">
          <span className="rev-stat-label">Esperado anual (promesa)</span>
          <span className="rev-stat-value">{expectedAnnual.toFixed(2)}%</span>
        </div>
        <div className="rev-stat">
          <span className="rev-stat-label">Real acumulado</span>
          <span className="rev-stat-value">{realRoiPct.toFixed(2)}%</span>
        </div>
        <div className="rev-stat">
          <span className="rev-stat-label">Cumplimiento</span>
          <span className="rev-stat-value" style={{ color: fulfillmentColor }}>
            {expectedAnnual > 0 ? `${fulfillmentPct.toFixed(0)}%` : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};
