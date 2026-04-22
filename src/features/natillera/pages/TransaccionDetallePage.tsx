import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { getBlockExplorerTxUrl } from '@/contracts/config';
import './TransaccionDetallePage.css';

interface TxDetailState {
  txHash: string;
  blockNumber: string;
  gasUsed: string;
  from: string;
  natilleraName: string;
  propuestaTitle: string;
  amountNum: number;
  withdrawn: number;
  estimatedProfit: number;
  projectId: string;
}

const TransaccionDetallePage: React.FC = () => {
  const history = useHistory();
  const location = useLocation<TxDetailState>();
  const state = location.state;

  if (!state) {
    history.goBack();
    return null;
  }

  const {
    txHash,
    blockNumber,
    gasUsed,
    from,
    natilleraName,
    propuestaTitle,
    amountNum,
    withdrawn,
    estimatedProfit,
    projectId,
  } = state;

  const formatCOP = (val: number) =>
    val.toLocaleString('es-CO', { maximumFractionDigits: 0 });

  const shortHash = (h: string) => `${h.slice(0, 4)}...${h.slice(-4)}`;
  const shortAddr = (a: string) => `${a.slice(0, 4)}...${a.slice(-4)}`;

  const gasEther = (BigInt(gasUsed) * 25000000n) / 10n ** 18n;
  const gasDisplay = `${Number(gasEther).toFixed(3)} cCOP`;

  const now = new Date();
  const dateDisplay = now.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).replace(',', ' -');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const goToNatillera = () => {
    history.replace(`/inversiones/${projectId}`);
  };

  return (
    <IonPage>
      <IonContent fullscreen className="tx-detalle-page">
        <div className="tx-detalle-header">
          <button className="tx-detalle-back-btn" onClick={() => history.goBack()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="tx-detalle-title">Detalle de la transacción</h1>
        </div>

        <div className="tx-detalle-content">
          <div className="tx-status-banner">
            <span className="tx-status-text">Transacción completada</span>
            <div className="tx-status-check">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#3b82f6" />
                <polyline points="20 6 9 17 4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="tx-detalle-card">
            <div className="tx-detalle-row tx-detalle-row--divider">
              <span className="tx-row-label">Hash transacción:</span>
              <div className="tx-row-value-copy">
                <a
                  href={getBlockExplorerTxUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tx-row-link"
                >
                  {shortHash(txHash)}
                </a>
                <button className="tx-copy-btn" onClick={() => copyToClipboard(txHash)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="tx-detalle-row tx-detalle-row--divider">
              <span className="tx-row-label">De:</span>
              <div className="tx-row-value-copy">
                <span className="tx-row-value">{shortAddr(from)}</span>
                <button className="tx-copy-btn" onClick={() => copyToClipboard(from)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="tx-detalle-row tx-detalle-row--divider">
              <span className="tx-row-label">Para:</span>
              <span className="tx-row-value">{natilleraName}</span>
            </div>

            <div className="tx-detalle-row tx-detalle-row--divider">
              <span className="tx-row-label">Motivo:</span>
              <span className="tx-row-value">{propuestaTitle}</span>
            </div>

            <div className="tx-detalle-row">
              <span className="tx-row-label">Monto devuelto:</span>
              <span className="tx-row-value">{formatCOP(withdrawn)} COP</span>
            </div>

            {estimatedProfit > 0 && (
              <div className="tx-detalle-row">
                <span className="tx-row-label">Ganancia agregada:</span>
                <span className="tx-row-value">{formatCOP(Math.max(0, amountNum - withdrawn))} COP</span>
              </div>
            )}

            <div className="tx-detalle-row tx-detalle-row--divider">
              <span className="tx-row-label">Monto total re-aportado:</span>
              <span className="tx-row-value tx-row-value--bold">{formatCOP(amountNum)} COP</span>
            </div>

            <div className="tx-detalle-row">
              <span className="tx-row-label">Red:</span>
              <span className="tx-row-value">CELO Network</span>
            </div>

            <div className="tx-detalle-row">
              <span className="tx-row-label">Fecha y hora:</span>
              <span className="tx-row-value">{dateDisplay}</span>
            </div>

            <div className="tx-detalle-row">
              <span className="tx-row-label">Número de bloque:</span>
              <span className="tx-row-value">{Number(blockNumber).toLocaleString('es-CO')}</span>
            </div>

            <div className="tx-detalle-row">
              <span className="tx-row-label">Gas usado:</span>
              <span className="tx-row-value">{gasDisplay}</span>
            </div>
          </div>

          <button className="tx-detalle-back-natillera" onClick={goToNatillera}>
            Volver a natillera
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TransaccionDetallePage;
