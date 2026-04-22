import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, useIonToast } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { useActiveAccount } from 'thirdweb/react';
import { propuestasService } from '@/services/propuestas/propuestas.service';
import { Propuesta } from '@/types/propuesta';
import { BLOCKCHAIN_CONFIG } from '@/contracts/config';
import { useReturnYield, ReturnYieldReceipt } from '../hooks/use-return-yield';

const copToUsdc = (cop: number) => cop / BLOCKCHAIN_CONFIG.COP_TO_USDT_RATE;
import './VolverAportarPage.css';

type ModalState = 'none' | 'confirm' | 'success';

const VolverAportarPage: React.FC = () => {
  const { propuestaId } = useParams<{ propuestaId: string }>();
  const history = useHistory();
  const account = useActiveAccount();
  const [present] = useIonToast();
  const { returnYield, isSending } = useReturnYield();

  const [propuesta, setPropuesta] = useState<Propuesta | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<ModalState>('none');
  const [receipt, setReceipt] = useState<ReturnYieldReceipt | null>(null);

  useEffect(() => {
    propuestasService.getById(propuestaId).then((data) => {
      setPropuesta(data);
    }).catch(() => {
      history.goBack();
    }).finally(() => {
      setLoading(false);
    });
  }, [propuestaId]);

  const handleKey = (key: string) => {
    setAmount((prev) => {
      if (key === 'backspace') {
        if (prev.length <= 1) return '0';
        return prev.slice(0, -1);
      }
      if (key === ',') {
        if (prev.includes(',')) return prev;
        return prev + ',';
      }
      if (prev === '0') return key;
      return prev + key;
    });
  };

  const amountNum = parseFloat(amount.replace(',', '.')) || 0;

  const handleQuickSelect = (value: number) => {
    setAmount(Math.round(value).toString());
  };

  const handleConfirm = async () => {
    if (!propuesta || !account || amountNum <= 0) return;
    if (!propuesta.natillera_address || !propuesta.vault_address) return;
    setSubmitting(true);
    try {
      const source = account.address;
      const rec = await returnYield(
        propuesta.natillera_address,
        propuesta.vault_address,
        copToUsdc(amountNum),
        source,
      );
      await propuestasService.returnYield(propuesta.id, amountNum, source, rec.txHash);
      setReceipt(rec);
      setModal('success');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al devolver al pool';
      await present({ message: msg, duration: 3000, color: 'danger' });
      setModal('none');
    } finally {
      setSubmitting(false);
    }
  };

  const goToNatillera = () => {
    if (propuesta?.project_id) {
      history.replace(`/inversiones/${propuesta.project_id}`);
    } else {
      history.goBack();
    }
  };

  const goToTxDetail = () => {
    if (!receipt || !propuesta) return;
    history.push('/detalle-transaccion', {
      txHash: receipt.txHash,
      blockNumber: receipt.blockNumber.toString(),
      gasUsed: receipt.gasUsed.toString(),
      from: receipt.from,
      natilleraName: propuesta.title,
      propuestaTitle: propuesta.title,
      amountNum,
      withdrawn: propuesta.withdrawal_amount ?? 0,
      estimatedProfit: propuesta.estimated_profit ?? 0,
      projectId: propuesta.project_id,
    });
  };

  if (loading || !propuesta) {
    return (
      <IonPage>
        <IonContent>
          <div className="volver-loading"><p>Cargando...</p></div>
        </IonContent>
      </IonPage>
    );
  }

  const withdrawn = propuesta.withdrawal_amount ?? 0;
  const estimatedProfit = propuesta.estimated_profit ?? 0;
  const withGains = withdrawn + estimatedProfit;
  const busy = submitting || isSending;
  const canSubmit = amountNum > 0 && !busy && !!account;

  const formatCOP = (val: number) =>
    val.toLocaleString('es-CO', { maximumFractionDigits: 0 });

  const displayAmount = amount === '0' ? '0,00' : amount;

  return (
    <IonPage>
      <IonContent fullscreen className="volver-aportar-page">
        <div className="volver-header">
          <button className="volver-back-btn" onClick={() => history.goBack()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="volver-title">Volver a aportar</h1>
        </div>

        <div className="volver-amount-section">
          <div className="volver-amount-display">
            <span className="volver-amount-value">{displayAmount}</span>
            <span className="volver-amount-currency">COP</span>
          </div>
          <p className="volver-available">Disponible: {formatCOP(withdrawn)} COP</p>
        </div>

        <div className="volver-quick-row">
          <button
            className={`volver-quick-btn ${amountNum === withdrawn ? 'active' : ''}`}
            onClick={() => handleQuickSelect(withdrawn)}
          >
            <span className="volver-quick-label">Devolver solo lo retirado</span>
            <span className="volver-quick-amount">{formatCOP(withdrawn)} COP</span>
          </button>
          {estimatedProfit > 0 && (
            <button
              className={`volver-quick-btn ${amountNum === withGains ? 'active' : ''}`}
              onClick={() => handleQuickSelect(withGains)}
            >
              <span className="volver-quick-label">Devolver + ganancias</span>
              <span className="volver-quick-amount">{formatCOP(withGains)} COP</span>
            </button>
          )}
        </div>

        {estimatedProfit > 0 && (
          <p className="volver-ganancia">
            Ganancia estimada: <span>+{formatCOP(estimatedProfit)} COP</span>
          </p>
        )}

        <div className="volver-divider" />

        <div className="volver-submit-row">
          <button
            className={`volver-submit-btn ${canSubmit ? 'active' : ''}`}
            onClick={() => canSubmit && setModal('confirm')}
            disabled={!canSubmit}
          >
            Volver a aportar
          </button>
        </div>

        <div className="volver-numpad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'backspace'].map((key) => (
            <button
              key={key}
              className="volver-numpad-key"
              onClick={() => handleKey(key)}
            >
              {key === 'backspace' ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                  <line x1="18" y1="9" x2="12" y2="15" />
                  <line x1="12" y1="9" x2="18" y2="15" />
                </svg>
              ) : key}
            </button>
          ))}
        </div>

        {modal === 'confirm' && (
          <div className="volver-modal-overlay" onClick={() => !busy && setModal('none')}>
            <div className="volver-modal" onClick={(e) => e.stopPropagation()}>
              <div className="volver-modal-header">
                <h2 className="volver-modal-title">Confirmar re-aporte</h2>
                <button className="volver-modal-close" onClick={() => setModal('none')} disabled={busy}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <p className="volver-modal-desc">
                Los fondos se descontarán de tu saldo y se agregarán directamente al balance de la natillera.
              </p>
              <div className="volver-modal-highlight">
                <p className="volver-modal-highlight-label">Vas a re-aportar</p>
                <p className="volver-modal-highlight-amount">{formatCOP(amountNum)} COP</p>
              </div>
              <div className="volver-modal-breakdown">
                <div className="volver-modal-row">
                  <span>Monto devuelto</span>
                  <span>{formatCOP(withdrawn)} COP</span>
                </div>
                {estimatedProfit > 0 && (
                  <div className="volver-modal-row">
                    <span>Ganancia agregada</span>
                    <span>{formatCOP(Math.max(0, amountNum - withdrawn))} COP</span>
                  </div>
                )}
                <div className="volver-modal-row volver-modal-row--total">
                  <span>Nuevo balance de la Natillera</span>
                  <span>{formatCOP(amountNum)} COP</span>
                </div>
              </div>
              <button
                className="volver-modal-confirm-btn"
                onClick={handleConfirm}
                disabled={busy}
              >
                {isSending ? 'Firmando en wallet...' : busy ? 'Procesando...' : 'Confirmar re-aporte'}
              </button>
              <button
                className="volver-modal-cancel-btn"
                onClick={() => setModal('none')}
                disabled={busy}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {modal === 'success' && (
          <div className="volver-modal-overlay">
            <div className="volver-modal">
              <div className="volver-success-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="#3b82f6" />
                  <polyline points="20 6 9 17 4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="volver-success-title">¡Re-aporte exitoso!</h2>
              <p className="volver-success-desc">
                {formatCOP(amountNum)} COP han sido agregados a la natillera
              </p>
              <div className="volver-modal-breakdown">
                <div className="volver-modal-row">
                  <span>Tu nuevo aporte</span>
                  <span>{formatCOP(amountNum)} COP</span>
                </div>
                <div className="volver-modal-row">
                  <span>Balance actual</span>
                  <span>{formatCOP(amountNum)} COP</span>
                </div>
              </div>
              <button className="volver-modal-confirm-btn" onClick={goToNatillera}>
                Volver a la natillera
              </button>
              <button className="volver-modal-cancel-btn" onClick={() => history.replace('/home')}>
                Ir a inicio
              </button>
              {receipt && (
                <button className="volver-tx-link" onClick={goToTxDetail}>
                  Ver transacción en la red →
                </button>
              )}
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default VolverAportarPage;
