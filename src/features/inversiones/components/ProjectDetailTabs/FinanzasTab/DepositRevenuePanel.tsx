import React from 'react';
import { RevenueModuleState } from '@/services/blockchain.service';
import { getBlockExplorerTxUrl } from '@/contracts/config';
import { formatUsdc } from './formatters';
import { VaultFrozenBanner } from '../VaultFrozenBanner';

interface DepositRevenuePanelProps {
  state: RevenueModuleState;
  tokenSupply: bigint | null;
  userUsdcBalance: bigint | null;
  depositAmount: string;
  depositing: boolean;
  depositError: string | null;
  depositTxHash: string | null;
  vaultFrozen?: boolean;
  onAmountChange: (value: string) => void;
  onDeposit: () => void;
}

export const DepositRevenuePanel: React.FC<DepositRevenuePanelProps> = ({
  state,
  tokenSupply,
  userUsdcBalance,
  depositAmount,
  depositing,
  depositError,
  depositTxHash,
  vaultFrozen = false,
  onAmountChange,
  onDeposit,
}) => {
  const distributionClosed =
    state.distributionEnd > 0n && BigInt(Math.floor(Date.now() / 1000)) > state.distributionEnd;
  return (
    <div className="rev-deposit-panel">
      <h4 className="rev-deposit-title">Depositar rendimientos</h4>
      {distributionClosed ? (
        <p className="rev-deposit-closed">
          🔒 La ventana de distribución ya cerró ({new Date(Number(state.distributionEnd) * 1000).toLocaleDateString('es-CO')}). Ya no se aceptan más depósitos.
        </p>
      ) : (
        <>
          <p className="rev-deposit-help">
            El monto que deposites se reparte proporcionalmente entre los token holders. Quedan{' '}
            {tokenSupply ? tokenSupply.toString() : '?'} tokens emitidos.
          </p>
          {userUsdcBalance !== null && (
            <p className="invest-balance">Tu saldo USDC: {formatUsdc(userUsdcBalance)} USDC</p>
          )}
          <div className="invest-input-row">
            <input
              type="number"
              className="invest-input"
              placeholder="Monto a depositar (USDC)"
              value={depositAmount}
              onChange={(e) => onAmountChange(e.target.value)}
              min="0"
              step="any"
            />
          </div>
          {depositError && <p className="invest-error">{depositError}</p>}
          {vaultFrozen && (
            <VaultFrozenBanner message="La bóveda está congelada por una disputa. No se pueden depositar rendimientos hasta que se descongele en gobernanza." />
          )}
          <button
            className="invest-btn"
            onClick={onDeposit}
            disabled={depositing || vaultFrozen || !depositAmount || parseFloat(depositAmount) <= 0}
          >
            {depositing ? 'Depositando...' : 'Depositar rendimientos'}
          </button>
          {depositTxHash && (
            <a
              className="invest-tx-link"
              href={getBlockExplorerTxUrl(depositTxHash)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver transacción en Celoscan
            </a>
          )}
        </>
      )}
    </div>
  );
};
