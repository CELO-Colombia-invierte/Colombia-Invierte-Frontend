import React from 'react';
import './EstadoTransaccionModal.css';

export type TransactionStatus = 'success' | 'pending' | 'error';

type ItemStatus = 'done' | 'pending' | 'error' | 'waiting';

interface TimelineItem {
  label: string;
  date: string;
  itemStatus: ItemStatus;
}

interface Props {
  status: TransactionStatus;
  onViewReceipt: () => void;
  onDone: () => void;
}

const TIMELINE: Record<TransactionStatus, TimelineItem[]> = {
  success: [
    { label: 'Transacción creada',               date: '16 de abril de 2026 - 12:00:11', itemStatus: 'done' },
    { label: 'Estamos procesando su transacción', date: '16 de abril de 2026 - 12:00:11', itemStatus: 'done' },
    { label: 'El dinero fue enviado',             date: '16 de abril de 2026 - 13:00:20', itemStatus: 'done' },
  ],
  pending: [
    { label: 'Estamos procesando su transacción', date: '16 de abril de 2026 - 12:00:11', itemStatus: 'done' },
    { label: 'Estamos procesando su transacción', date: '16 de abril de 2026 - 12:00:11', itemStatus: 'pending' },
    { label: 'El dinero fue enviado',             date: '16 de abril de 2026 - 13:00:20', itemStatus: 'waiting' },
  ],
  error: [
    { label: 'Estamos procesando su transacción', date: '16 de abril de 2026 - 12:00:11', itemStatus: 'done' },
    { label: 'Estamos procesando su transacción', date: '16 de abril de 2026 - 12:00:11', itemStatus: 'error' },
    { label: 'El dinero fue enviado',             date: '16 de abril de 2026 - 13:00:20', itemStatus: 'waiting' },
  ],
};

/* ── Iconos del timeline ── */
const IconDone = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="10" fill="#3B5BDB" />
    <polyline points="5,10 9,14 15,7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPending = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" stroke="#3B5BDB" strokeWidth="2" fill="white" />
  </svg>
);

const IconError = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="10" fill="#E03131" />
    <line x1="6" y1="6" x2="14" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <line x1="14" y1="6" x2="6" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconWaiting = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" stroke="#ccc" strokeWidth="2" fill="white" />
    <line x1="10" y1="5" x2="10" y2="10" stroke="#ccc" strokeWidth="2" strokeLinecap="round" />
    <line x1="10" y1="10" x2="13" y2="13" stroke="#ccc" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ── Icono principal según estado ── */
const MainIcon: React.FC<{ status: TransactionStatus }> = ({ status }) => {
  if (status === 'success') return (
    <div className="et-main-icon et-main-icon--success">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <polyline points="6,16 13,23 26,10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );

  if (status === 'pending') return (
    <div className="et-main-icon et-main-icon--pending">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="13" stroke="white" strokeWidth="2.5" fill="none" />
        <line x1="16" y1="8" x2="16" y2="16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="16" y1="16" x2="21" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );

  return (
    <div className="et-main-icon et-main-icon--error">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <line x1="9" y1="9" x2="23" y2="23" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <line x1="23" y1="9" x2="9" y2="23" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
};

const timelineIcon = (itemStatus: ItemStatus) => {
  switch (itemStatus) {
    case 'done':    return <IconDone />;
    case 'pending': return <IconPending />;
    case 'error':   return <IconError />;
    case 'waiting': return <IconWaiting />;
  }
};

const EstadoTransaccionModal: React.FC<Props> = ({ status, onViewReceipt, onDone }) => {
  const items = TIMELINE[status];
  const canViewReceipt = status === 'success';

  return (
    <div className="et-overlay">
      <div className="et-card">

        {/* Icono principal */}
        <MainIcon status={status} />

        {/* Timeline */}
        <div className="et-section">
          <p className="et-section-title">Estado</p>
          <div className="et-timeline">
            {items.map((item, index) => (
              <div key={index} className="et-timeline-item">
                <div className="et-timeline-left">
                  <div className="et-timeline-icon">{timelineIcon(item.itemStatus)}</div>
                  {index < items.length - 1 && (
                    <div className={`et-timeline-line${item.itemStatus === 'done' ? ' et-timeline-line--done' : ''}`} />
                  )}
                </div>
                <div className="et-timeline-content">
                  <p className="et-timeline-label">{item.label}</p>
                  <p className="et-timeline-date">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="et-actions">
          <button
            className={`et-btn et-btn--receipt${canViewReceipt ? ' et-btn--receipt-active' : ''}`}
            onClick={onViewReceipt}
            disabled={!canViewReceipt}
          >
            Ver comprobante
          </button>
          <button className="et-btn et-btn--done" onClick={onDone}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EstadoTransaccionModal;
