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
    <h4 className="rev-deposit-title">Cerrar la etapa de inversión</h4>
    <p className="rev-deposit-help">
      Termina la recaudación. Se cobra la comisión de la plataforma (30%) y el resto queda guardado en
      el fondo del proyecto, para entregarlo por etapas aprobadas por el grupo. Esta acción no se puede
      deshacer.
    </p>
    {finalizeError && <p className="invest-error">{finalizeError}</p>}
    {vaultFrozen && (
      <VaultFrozenBanner message="El fondo del proyecto está en pausa por un reclamo. No se puede cerrar la etapa de inversión hasta que el grupo lo reactive." />
    )}
    <button className="invest-btn" onClick={onFinalize} disabled={finalizing || vaultFrozen}>
      {finalizing ? 'Procesando...' : 'Cerrar la etapa de inversión'}
    </button>
    {finalizeTxHash && (
      <a
        className="invest-tx-link"
        href={getBlockExplorerTxUrl(finalizeTxHash)}
        target="_blank"
        rel="noopener noreferrer"
      >
        Ver comprobante
      </a>
    )}
  </div>
);
