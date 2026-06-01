import React from 'react';
import { getBlockExplorerTxUrl } from '@/contracts/config';
import { VaultFrozenBanner } from '../VaultFrozenBanner';

interface FinalizeSalePanelProps {
  finalizing: boolean;
  finalizeError: string | null;
  finalizeTxHash: string | null;
  vaultFrozen?: boolean;
  onFinalize: () => void;
}

export const FinalizeSalePanel: React.FC<FinalizeSalePanelProps> = ({
  finalizing,
  finalizeError,
  finalizeTxHash,
  vaultFrozen = false,
  onFinalize,
}) => (
  <div className="rev-deposit-panel">
    <h4 className="rev-deposit-title">Finalizar venta</h4>
    <p className="rev-deposit-help">
      Cierra la venta y cobra el 30% de comisión al treasury. El neto queda retenido en el vault
      y se libera por hitos aprobados en gobernanza. No envía fondos a ninguna otra wallet.
    </p>
    {finalizeError && <p className="invest-error">{finalizeError}</p>}
    {vaultFrozen && (
      <VaultFrozenBanner message="La bóveda está congelada por una disputa. No se puede finalizar la venta hasta que se descongele en gobernanza." />
    )}
    <button className="invest-btn" onClick={onFinalize} disabled={finalizing || vaultFrozen}>
      {finalizing ? 'Finalizando...' : 'Finalizar venta y cobrar comisión'}
    </button>
    {finalizeTxHash && (
      <a
        className="invest-tx-link"
        href={getBlockExplorerTxUrl(finalizeTxHash)}
        target="_blank"
        rel="noopener noreferrer"
      >
        Ver transacción en Celoscan
      </a>
    )}
  </div>
);
