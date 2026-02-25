import React, { useEffect } from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { arrowBackOutline, shareSocialOutline, downloadOutline } from 'ionicons/icons';
import './ComprobantePage.css';

export interface ComprobanteData {
  transactionNumber: string;
  dateTime: string;
  originName: string;
  originAccount: string;
  destinationAccount: string;
  bank: string;
  detail: string;
  recipientName: string;
  amount: number;
}

const formatCOP = (value: number): string =>
  value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const QRIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="12" fill="#1a1a1a" />
    <rect x="8"  y="8"  width="20" height="20" rx="2" fill="#ffffff" />
    <rect x="11" y="11" width="14" height="14" rx="1" fill="#1a1a1a" />
    <rect x="36" y="8"  width="20" height="20" rx="2" fill="#ffffff" />
    <rect x="39" y="11" width="14" height="14" rx="1" fill="#1a1a1a" />
    <rect x="8"  y="36" width="20" height="20" rx="2" fill="#ffffff" />
    <rect x="11" y="39" width="14" height="14" rx="1" fill="#1a1a1a" />
    <rect x="36" y="36" width="8"  height="8"  rx="1" fill="#E03131" />
    <rect x="48" y="36" width="8"  height="8"  rx="1" fill="#F5C518" />
    <rect x="36" y="48" width="8"  height="8"  rx="1" fill="#2D8E42" />
    <rect x="48" y="48" width="8"  height="8"  rx="1" fill="#3B5BDB" />
  </svg>
);

const ComprobantePage: React.FC = () => {
  const history = useHistory();
  const location = useLocation<ComprobanteData>();
  const data = location.state;

  useEffect(() => {
    const tabBar = document.querySelector('.bottom-navbar') as HTMLElement | null;
    if (tabBar) tabBar.style.display = 'none';
    return () => {
      if (tabBar) tabBar.style.display = '';
    };
  }, []);

  if (!data) {
    history.replace('/home');
    return null;
  }

  const rows = [
    { label: 'Número de transacción:', value: data.transactionNumber },
    { label: 'Fecha y hora:',          value: data.dateTime },
    { label: 'Nombre del originante:', value: data.originName },
    { label: 'Cuenta origen:',         value: data.originAccount },
    { label: 'Cuenta destino:',        value: data.destinationAccount },
    { label: 'Banco:',                 value: data.bank },
    { label: 'Detalle:',              value: data.detail || '—' },
  ];

  return (
    <IonPage>
      <IonContent className="cp-content">

        {/* Header */}
        <div className="cp-header">
          <button className="cp-back-btn" onClick={() => history.goBack()}>
            <IonIcon icon={arrowBackOutline} />
          </button>
          <h1 className="cp-title">Comprobante</h1>
        </div>

        <div className="cp-body">

          {/* Tarjeta del comprobante */}
          <div className="cp-card">

            {/* Icono QR */}
            <div className="cp-qr-section">
              <QRIcon />
              <p className="cp-qr-label">Comprobante electrónico</p>
            </div>

            <div className="cp-divider" />

            {/* Filas de detalle */}
            <div className="cp-rows">
              {rows.map((row) => (
                <div key={row.label} className="cp-row">
                  <span className="cp-row-label">{row.label}</span>
                  <span className="cp-row-value">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Resumen destacado */}
            <div className="cp-summary">
              <div className="cp-summary-row">
                <span className="cp-summary-label">Envió a:</span>
                <span className="cp-summary-value">{data.recipientName}</span>
              </div>
              <div className="cp-summary-row">
                <span className="cp-summary-label">Monto:</span>
                <span className="cp-summary-value">{formatCOP(data.amount)} COP</span>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="cp-actions">
            <button className="cp-btn cp-btn--share" onClick={() => {}}>
              Compartir
              <IonIcon icon={shareSocialOutline} />
            </button>
            <button className="cp-btn cp-btn--save" onClick={() => {}}>
              Guardar
              <IonIcon icon={downloadOutline} />
            </button>
          </div>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default ComprobantePage;
