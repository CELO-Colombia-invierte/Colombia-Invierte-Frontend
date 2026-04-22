import React from 'react';
import { BLOCKCHAIN_CONFIG } from '@/contracts/config';
import './FeeBreakdown.css';

const NETWORK_FEE_USDC = 0.005;
const PLATFORM_FEE_RATE = 0.03;

interface Props {
  mode: 'creation' | 'withdrawal';
  amountCOP?: number;
  amountUSDC?: number;
}

const fmt = (n: number, decimals = 0) =>
  n.toLocaleString('es-CO', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const FeeBreakdown: React.FC<Props> = ({ mode, amountCOP, amountUSDC }) => {
  const networkFeeCOP = NETWORK_FEE_USDC * BLOCKCHAIN_CONFIG.COP_TO_USDT_RATE;

  const hasCOP = typeof amountCOP === 'number' && amountCOP > 0;
  const hasUSDC = typeof amountUSDC === 'number' && amountUSDC > 0;

  const platformFeeCOP = hasCOP ? amountCOP * PLATFORM_FEE_RATE : null;
  const platformFeeUSDC = hasUSDC ? amountUSDC * PLATFORM_FEE_RATE : null;

  return (
    <div className="fee-breakdown">
      <div className="fee-breakdown__header">
        <span className="fee-breakdown__icon">⚡</span>
        <span className="fee-breakdown__title">Comisiones de la transacción</span>
      </div>

      <div className="fee-breakdown__rows">
        <div className="fee-breakdown__row">
          <span className="fee-breakdown__label">Red Celo (gas)</span>
          <span className="fee-breakdown__value">~$0.005 USDC (~${fmt(networkFeeCOP)} COP)</span>
        </div>

        {mode === 'withdrawal' && (
          <div className="fee-breakdown__row">
            <span className="fee-breakdown__label">Comisión plataforma (3%)</span>
            <span className="fee-breakdown__value">
              {hasCOP && platformFeeCOP !== null
                ? `~$${fmt(platformFeeCOP)} COP (~$${(platformFeeCOP / BLOCKCHAIN_CONFIG.COP_TO_USDT_RATE).toFixed(2)} USDC)`
                : hasUSDC && platformFeeUSDC !== null
                ? `~$${platformFeeUSDC.toFixed(4)} USDC`
                : '3% del monto retirado'}
            </span>
          </div>
        )}

        {mode === 'withdrawal' && (hasCOP || hasUSDC) && (
          <div className="fee-breakdown__row fee-breakdown__row--net">
            <span className="fee-breakdown__label">Recibirás aprox.</span>
            <span className="fee-breakdown__value fee-breakdown__value--net">
              {hasCOP && platformFeeCOP !== null
                ? `$${fmt(amountCOP! - platformFeeCOP)} COP`
                : hasUSDC && platformFeeUSDC !== null
                ? `$${(amountUSDC! - platformFeeUSDC).toFixed(4)} USDC`
                : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeBreakdown;
